/**
 * ============================================================================
 * REQUEST WINDOW — NOT REAL-TIME AVAILABILITY
 * ============================================================================
 * BLOOM_RESERVATION_CONFIG.availableTimes NÃO representa disponibilidade real
 * de mesas. É uma janela de horários para SOLICITAÇÃO. A confirmação sempre
 * depende de uma pessoa da equipe Bloom, pelo WhatsApp.
 * ============================================================================
 */
const BLOOM_RESERVATION_CONFIG = {
  // PENDENTE — preencher com o número oficial da Bloom no formato
  // internacional (ex: "5547999999999"). Enquanto vazio, o CTA de reserva
  // fica desativado com aviso.
  whatsappNumber: "",
  minimumGuests: 1,
  maximumGuests: 12,
  availableTimes: [
    "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30",
  ],
  occasions: [
    { id: "cafe-da-manha", label: "Café da manhã" },
    { id: "encontro", label: "Encontro" },
    { id: "reuniao", label: "Reunião" },
    { id: "celebracao", label: "Celebração" },
    { id: "outro", label: "Outro" },
  ],
  methods: [
    { id: "sem-preferencia", label: "Sem preferência" },
    { id: "v60", label: "V60" },
    { id: "chemex", label: "Chemex" },
  ],
};
if (typeof Object.freeze === "function") Object.freeze(BLOOM_RESERVATION_CONFIG);

/**
 * BloomReservationLogic — funções puras, sem tocar no DOM.
 * Isoladas para serem testadas diretamente (ver tests/reservas-smoke-test.html).
 */
const BloomReservationLogic = (() => {
  function todayIso() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function isDateNotPast(isoDate, referenceIso = todayIso()) {
    if (!isoDate) return false;
    return isoDate >= referenceIso;
  }

  function formatDateBR(isoDate) {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    if (!y || !m || !d) return isoDate;
    return `${d}/${m}/${y}`;
  }

  /**
   * Valida os dados do formulário.
   * @param {object} data
   * @returns {{valid: boolean, errors: Object<string,string>}}
   */
  function validate(data) {
    const errors = {};

    if (!data.name || data.name.trim().length < 2) {
      errors.name = "Informe seu nome (mínimo 2 letras).";
    }
    const phoneDigits = (data.phone || "").replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length < 8) {
      errors.phone = "Informe um telefone válido.";
    }
    if (!data.date) {
      errors.date = "Escolha uma data.";
    } else if (!isDateNotPast(data.date)) {
      errors.date = "A data não pode ser anterior a hoje.";
    }
    if (!data.time) {
      errors.time = "Escolha um horário.";
    } else if (BLOOM_RESERVATION_CONFIG.availableTimes.indexOf(data.time) === -1) {
      errors.time = "Escolha um horário válido.";
    }
    const guests = Number(data.guests);
    if (!Number.isFinite(guests) || guests < BLOOM_RESERVATION_CONFIG.minimumGuests || guests > BLOOM_RESERVATION_CONFIG.maximumGuests) {
      errors.guests = `Número de pessoas deve ser entre ${BLOOM_RESERVATION_CONFIG.minimumGuests} e ${BLOOM_RESERVATION_CONFIG.maximumGuests}.`;
    }

    return { valid: Object.keys(errors).length === 0, errors };
  }

  /**
   * Monta a mensagem de solicitação de reserva formatada para WhatsApp.
   * Omite linhas opcionais vazias (Ocasião, Observações). Método especial
   * é sempre incluído (mesmo "Sem preferência", pois é uma escolha feita).
   * @param {object} data - { name, phone, date, time, guests, occasionLabel, methodLabel, notes }
   */
  function buildMessage(data) {
    const lines = [];
    lines.push("Olá, Bloom Coffee.");
    lines.push("");
    lines.push("Gostaria de solicitar uma reserva:");
    lines.push("");
    lines.push(`Nome: ${data.name.trim()}`);
    lines.push(`Telefone: ${data.phone.trim()}`);
    lines.push(`Data: ${formatDateBR(data.date)}`);
    lines.push(`Horário: ${data.time}`);
    lines.push(`Número de pessoas: ${data.guests}`);
    if (data.occasionLabel) lines.push(`Ocasião: ${data.occasionLabel}`);
    if (data.methodLabel) lines.push(`Método especial: ${data.methodLabel}`);
    if (data.notes && data.notes.trim()) lines.push(`Observações: ${data.notes.trim()}`);
    lines.push("");
    lines.push("Entendo que a reserva depende de confirmação da equipe Bloom.");
    return lines.join("\n");
  }

  function buildWhatsAppUrl(whatsappNumber, message) {
    const digits = (whatsappNumber || "").replace(/\D/g, "");
    if (!digits) return null;
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  }

  return { todayIso, isDateNotPast, formatDateBR, validate, buildMessage, buildWhatsAppUrl };
})();

/* ============================================================================
 * Interface — só executa num documento real (ignorado pela suíte de testes,
 * que carrega este arquivo num contexto sem os elementos abaixo).
 * ============================================================================ */
(function () {
  "use strict";
  if (typeof document === "undefined") return;

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("reservaForm");
    if (!form) return; // este arquivo também é carregado pela suíte de testes

    const $ = (sel) => document.querySelector(sel);

    const fields = {
      name: $("#fieldName"),
      phone: $("#fieldPhone"),
      date: $("#fieldDate"),
      time: $("#fieldTime"),
      notes: $("#fieldNotes"),
    };

    let guests = BLOOM_RESERVATION_CONFIG.minimumGuests;
    let selectedOccasion = "";
    let selectedMethod = "sem-preferencia";

    // ---------- Resumo / WhatsApp — referências e funções definidas cedo,
    // pois o stepper de convidados e os selects já chamam updateSummary() ----------
    const summaryEl = $("#reservaSummaryBody");
    const whatsappBtn = $("#reservaWhatsappBtn");
    const whatsappNote = $("#reservaWhatsappNote");

    function escapeHtml(str) {
      return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    function summaryRow(label, value) {
      return `<div class="reserva-summary-row"><span class="reserva-summary-label">${label}</span><span class="reserva-summary-value">${value}</span></div>`;
    }

    function updateSummary() {
      const data = collectData();
      const hasAnything = data.name || data.phone || data.date || data.time;
      if (!hasAnything) {
        summaryEl.innerHTML = `<p class="reserva-summary-empty">Preencha o formulário para ver o resumo da sua solicitação.</p>`;
      } else {
        let html = "";
        html += summaryRow("Nome", escapeHtml(data.name) || "—");
        html += summaryRow("Telefone", escapeHtml(data.phone) || "—");
        html += summaryRow("Data", data.date ? BloomReservationLogic.formatDateBR(data.date) : "—");
        html += summaryRow("Horário", data.time || "—");
        html += summaryRow("Pessoas", String(data.guests));
        if (data.occasionLabel) html += summaryRow("Ocasião", escapeHtml(data.occasionLabel));
        html += summaryRow("Método especial", escapeHtml(data.methodLabel) || "—");
        if (data.notes && data.notes.trim()) html += summaryRow("Observações", escapeHtml(data.notes.trim()));
        summaryEl.innerHTML = html;
      }

      const check = BloomReservationLogic.validate(data);
      const message = check.valid ? BloomReservationLogic.buildMessage(data) : "";
      const url = check.valid ? BloomReservationLogic.buildWhatsAppUrl(BLOOM_RESERVATION_CONFIG.whatsappNumber, message) : null;

      // O botão nunca é desativado via atributo "disabled": permanece sempre
      // clicável e focável (acessibilidade), e a validação — com foco no
      // primeiro campo inválido — acontece no momento do clique.
      whatsappBtn.dataset.href = url || "";
      whatsappNote.textContent = !BLOOM_RESERVATION_CONFIG.whatsappNumber
        ? "As solicitações digitais de reserva estarão disponíveis em breve."
        : "";
    }

    // ---------- Coleta dos dados atuais ----------
    function collectData() {
      const occasion = BLOOM_RESERVATION_CONFIG.occasions.find((o) => o.id === selectedOccasion);
      const method = BLOOM_RESERVATION_CONFIG.methods.find((m) => m.id === selectedMethod);
      return {
        name: fields.name.value,
        phone: fields.phone.value,
        date: fields.date.value,
        time: fields.time.value,
        guests,
        occasionLabel: occasion ? occasion.label : "",
        methodLabel: method ? method.label : "",
        notes: fields.notes.value,
      };
    }

    // ---------- Data mínima = hoje ----------
    fields.date.min = BloomReservationLogic.todayIso();

    // ---------- Horários ----------
    const timeSelect = fields.time;
    timeSelect.innerHTML =
      `<option value="" disabled selected>Selecione um horário</option>` +
      BLOOM_RESERVATION_CONFIG.availableTimes.map((t) => `<option value="${t}">${t}</option>`).join("");

    // ---------- Ocasião ----------
    const occasionSelect = $("#fieldOccasion");
    occasionSelect.innerHTML =
      `<option value="">Prefiro não dizer</option>` +
      BLOOM_RESERVATION_CONFIG.occasions.map((o) => `<option value="${o.id}">${o.label}</option>`).join("");
    occasionSelect.addEventListener("change", () => {
      selectedOccasion = occasionSelect.value;
      updateSummary();
    });

    // ---------- Número de pessoas (stepper) ----------
    const guestValueEl = $("#guestValue");
    const guestMinusBtn = $("#guestMinus");
    const guestPlusBtn = $("#guestPlus");
    function renderGuestStepper() {
      guestValueEl.textContent = guests;
      guestMinusBtn.disabled = guests <= BLOOM_RESERVATION_CONFIG.minimumGuests;
      guestPlusBtn.disabled = guests >= BLOOM_RESERVATION_CONFIG.maximumGuests;
      guestValueEl.setAttribute("aria-label", `${guests} ${guests === 1 ? "pessoa" : "pessoas"}`);
      updateSummary();
    }
    guestMinusBtn.addEventListener("click", () => {
      if (guests > BLOOM_RESERVATION_CONFIG.minimumGuests) { guests -= 1; renderGuestStepper(); }
    });
    guestPlusBtn.addEventListener("click", () => {
      if (guests < BLOOM_RESERVATION_CONFIG.maximumGuests) { guests += 1; renderGuestStepper(); }
    });
    renderGuestStepper();

    // ---------- Método especial ----------
    const methodOptionsEl = $("#methodOptions");
    methodOptionsEl.innerHTML = BLOOM_RESERVATION_CONFIG.methods
      .map(
        (m) => `
        <div class="modifier-option ${m.id === selectedMethod ? "is-selected" : ""}" data-method="${m.id}" role="radio" aria-checked="${m.id === selectedMethod}" tabindex="0">
          <span class="modifier-option-label"><span class="modifier-radio"></span>${m.label}</span>
        </div>`
      )
      .join("");
    function selectMethod(id) {
      selectedMethod = id;
      methodOptionsEl.querySelectorAll(".modifier-option").forEach((el) => {
        const isSel = el.dataset.method === id;
        el.classList.toggle("is-selected", isSel);
        el.setAttribute("aria-checked", String(isSel));
      });
      updateSummary();
    }
    methodOptionsEl.querySelectorAll(".modifier-option").forEach((el) => {
      el.addEventListener("click", () => selectMethod(el.dataset.method));
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectMethod(el.dataset.method); }
      });
    });

    // ---------- Erros ----------
    function clearErrors() {
      Object.keys(fields).forEach((key) => {
        if (!fields[key]) return;
        fields[key].removeAttribute("aria-invalid");
      });
      document.querySelectorAll(".field-error").forEach((el) => el.classList.remove("is-visible"));
    }
    function showErrors(errors) {
      clearErrors();
      let firstInvalidEl = null;
      Object.keys(errors).forEach((key) => {
        const input = fields[key];
        const errorEl = document.getElementById("error-" + key);
        if (input) {
          input.setAttribute("aria-invalid", "true");
          if (!firstInvalidEl) firstInvalidEl = input;
        }
        if (errorEl) {
          errorEl.textContent = errors[key];
          errorEl.classList.add("is-visible");
        }
      });
      if (firstInvalidEl) {
        firstInvalidEl.focus();
        firstInvalidEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    // ---------- Eventos de campo (atualizam resumo ao digitar) ----------
    ["name", "phone", "date", "time", "notes"].forEach((key) => {
      fields[key].addEventListener("input", updateSummary);
      fields[key].addEventListener("change", updateSummary);
    });

    // ---------- Envio ----------
    whatsappBtn.addEventListener("click", (e) => {
      const btn = e.currentTarget;
      const data = collectData();
      const check = BloomReservationLogic.validate(data);
      if (!check.valid) {
        showErrors(check.errors);
        return;
      }
      clearErrors();
      if (btn.dataset.href) {
        window.open(btn.dataset.href, "_blank", "noopener");
      }
      // Se válido mas sem número configurado, dataset.href fica vazio e a
      // nota "estarão disponíveis em breve" (já visível) explica o motivo.
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = collectData();
      const check = BloomReservationLogic.validate(data);
      if (!check.valid) {
        showErrors(check.errors);
        return;
      }
      clearErrors();
      whatsappBtn.click();
    });

    updateSummary();
  });
})();
