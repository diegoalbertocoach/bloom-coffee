/**
 * BloomPedidoLogic — funções puras para o pedido antecipado (retirada).
 * Reaproveita BloomCart (itens, total, Caffè Sospeso) e BLOOM_CONFIG
 * (assets/menu-data.js) para o número de WhatsApp e o valor do Caffè Sospeso.
 */
const BLOOM_PEDIDO_CONFIG = {
  pickupMethods: [
    { id: "balcao", label: "Retirar no balcão" },
    { id: "loja", label: "Consumir na loja" },
  ],
};
if (typeof Object.freeze === "function") Object.freeze(BLOOM_PEDIDO_CONFIG);

const BloomPedidoLogic = (() => {
  function validate(data) {
    const errors = {};
    if (!data.name || data.name.trim().length < 2) {
      errors.name = "Informe seu nome (mínimo 2 letras).";
    }
    const phoneDigits = (data.phone || "").replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length < 8) {
      errors.phone = "Informe um telefone válido.";
    }
    if (!data.pickupTime) {
      errors.pickupTime = "Escolha um horário estimado de retirada.";
    }
    if (!data.pickupMethod) {
      errors.pickupMethod = "Escolha uma forma de retirada.";
    }
    if (!data.items || data.items.length === 0) {
      errors.items = "Sua sacola está vazia.";
    }
    return { valid: Object.keys(errors).length === 0, errors };
  }

  function methodLabel(id) {
    const m = BLOOM_PEDIDO_CONFIG.pickupMethods.find((x) => x.id === id);
    return m ? m.label : "";
  }

  /**
   * Monta a mensagem do pedido antecipado para o WhatsApp.
   * @param {object} data - { name, phone, pickupTime, pickupMethod, notes, items, caffeSospeso, total }
   */
  function buildMessage(data) {
    const lines = [];
    lines.push("Olá, Bloom Coffee.");
    lines.push("");
    lines.push("Gostaria de adiantar meu pedido para retirada:");
    lines.push("");
    data.items.forEach((item) => {
      const modsText = item.selectedModifiers && item.selectedModifiers.length
        ? " (" + item.selectedModifiers.map((m) => m.label).join(", ") + ")"
        : "";
      const notesText = item.notes ? ` — obs: ${item.notes}` : "";
      lines.push(`• ${item.qty}x ${item.name}${modsText}${notesText} — ${BloomCart.formatBRL(item.unitPrice * item.qty)}`);
    });
    lines.push("");
    lines.push(data.caffeSospeso ? "Caffè Sospeso: Sim" : "Caffè Sospeso: Não");
    lines.push("");
    lines.push(`Nome: ${data.name.trim()}`);
    lines.push(`Telefone: ${data.phone.trim()}`);
    lines.push(`Horário estimado de retirada: ${data.pickupTime}`);
    lines.push(`Forma de retirada: ${methodLabel(data.pickupMethod)}`);
    if (data.notes && data.notes.trim()) lines.push(`Observações: ${data.notes.trim()}`);
    lines.push("");
    lines.push(`Total estimado: ${BloomCart.formatBRL(data.total)}`);
    lines.push("");
    lines.push("Entendo que este pedido será considerado pela equipe Bloom, e não uma compra finalizada automaticamente.");
    return lines.join("\n");
  }

  function buildWhatsAppUrl(whatsappNumber, message) {
    const digits = (whatsappNumber || "").replace(/\D/g, "");
    if (!digits) return null;
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  }

  return { validate, buildMessage, buildWhatsAppUrl, methodLabel };
})();

/* ============================================================================
 * Interface
 * ============================================================================ */
(function () {
  "use strict";
  if (typeof document === "undefined") return;

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("pedidoForm");
    if (!form) return; // também carregado pela suíte de testes

    const $ = (sel) => document.querySelector(sel);
    const $all = (sel) => Array.from(document.querySelectorAll(sel));
    const escapeHtml = (str) =>
      String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    let selectedMethod = "";

    const fields = { name: $("#pedidoName"), phone: $("#pedidoPhone"), time: $("#pedidoTime"), notes: $("#pedidoNotes") };

    // ---------- Horários (mesma janela de solicitação usada nas reservas, quando disponível) ----------
    const timeOptions = (typeof BLOOM_RESERVATION_CONFIG !== "undefined" && BLOOM_RESERVATION_CONFIG.availableTimes) ||
      ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
    fields.time.innerHTML = `<option value="" disabled selected>Selecione um horário</option>` +
      timeOptions.map((t) => `<option value="${t}">${t}</option>`).join("");

    // ---------- Método de retirada ----------
    const methodWrap = $("#pickupMethodOptions");
    methodWrap.innerHTML = BLOOM_PEDIDO_CONFIG.pickupMethods
      .map(
        (m) => `
      <div class="modifier-option" data-method="${m.id}" role="radio" aria-checked="false" tabindex="0">
        <span class="modifier-option-label"><span class="modifier-radio"></span>${m.label}</span>
      </div>`
      )
      .join("");
    function selectMethod(id) {
      selectedMethod = id;
      methodWrap.querySelectorAll(".modifier-option").forEach((el) => {
        const isSel = el.dataset.method === id;
        el.classList.toggle("is-selected", isSel);
        el.setAttribute("aria-checked", String(isSel));
      });
      updateSummary();
    }
    methodWrap.querySelectorAll(".modifier-option").forEach((el) => {
      el.addEventListener("click", () => selectMethod(el.dataset.method));
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectMethod(el.dataset.method); } });
    });

    // ---------- Itens da sacola (lidos do mesmo BloomCart do cardápio) ----------
    function renderOrderItems() {
      const snap = BloomCart.getSnapshot();
      const wrap = $("#pedidoItems");
      if (snap.items.length === 0) {
        wrap.innerHTML = `<div class="cart-empty"><p>Sua sacola está vazia. <a href="cardapio.html" style="text-decoration:underline;">Voltar ao cardápio</a>.</p></div>`;
        $("#pedidoFormFields").hidden = true;
        $("#pedidoSummaryCard").hidden = true;
        return;
      }
      $("#pedidoFormFields").hidden = false;
      $("#pedidoSummaryCard").hidden = false;
      wrap.innerHTML = snap.items
        .map((item) => {
          const modsText = item.selectedModifiers.length ? item.selectedModifiers.map((m) => m.label).join(" · ") : "";
          return `
          <div class="cart-line">
            <div class="cart-line-info">
              <div class="cart-line-name">${item.qty}x ${escapeHtml(item.name)}</div>
              ${modsText ? `<div class="cart-line-mods">${escapeHtml(modsText)}</div>` : ""}
            </div>
            <div class="cart-line-price">${BloomCart.formatBRL(item.unitPrice * item.qty)}</div>
          </div>`;
        })
        .join("");
    }

    // ---------- Caffè Sospeso ----------
    const sospesoToggle = $("#pedidoSospesoToggle");
    function renderSospesoToggle() {
      const snap = BloomCart.getSnapshot();
      sospesoToggle.classList.toggle("is-on", snap.caffeSospeso);
      sospesoToggle.setAttribute("aria-checked", String(snap.caffeSospeso));
    }
    sospesoToggle.addEventListener("click", () => {
      const snap = BloomCart.getSnapshot();
      BloomCart.setCaffeSospeso(!snap.caffeSospeso);
    });

    // ---------- Erros ----------
    function clearErrors() {
      Object.keys(fields).forEach((k) => fields[k] && fields[k].removeAttribute("aria-invalid"));
      $all(".field-error").forEach((el) => el.classList.remove("is-visible"));
    }
    function showErrors(errors) {
      clearErrors();
      let firstInvalid = null;
      Object.keys(errors).forEach((key) => {
        const input = fields[key];
        const errorEl = document.getElementById("error-" + key);
        if (input) { input.setAttribute("aria-invalid", "true"); if (!firstInvalid) firstInvalid = input; }
        if (errorEl) { errorEl.textContent = errors[key]; errorEl.classList.add("is-visible"); }
      });
      if (firstInvalid) { firstInvalid.focus(); firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" }); }
    }

    // ---------- Resumo + total ----------
    function collectData() {
      const snap = BloomCart.getSnapshot();
      return {
        name: fields.name.value,
        phone: fields.phone.value,
        pickupTime: fields.time.value,
        pickupMethod: selectedMethod,
        notes: fields.notes.value,
        items: snap.items,
        caffeSospeso: snap.caffeSospeso,
        total: BloomCart.getTotal(BLOOM_CONFIG.caffeSospesoPrice),
      };
    }

    function updateSummary() {
      renderSospesoToggle();
      const total = BloomCart.getTotal(BLOOM_CONFIG.caffeSospesoPrice);
      $("#pedidoTotalValue").textContent = BloomCart.formatBRL(total);

      const data = collectData();
      const check = BloomPedidoLogic.validate(data);
      const message = check.valid ? BloomPedidoLogic.buildMessage(data) : "";
      const url = check.valid ? BloomPedidoLogic.buildWhatsAppUrl(BLOOM_CONFIG.whatsappNumber, message) : null;

      $("#pedidoWhatsappBtn").dataset.href = url || "";
      $("#pedidoWhatsappNote").textContent = !BLOOM_CONFIG.whatsappNumber
        ? "O envio digital de pedidos estará disponível em breve."
        : "";
    }

    ["name", "phone", "time", "notes"].forEach((key) => {
      fields[key].addEventListener("input", updateSummary);
      fields[key].addEventListener("change", updateSummary);
    });

    $("#pedidoWhatsappBtn").addEventListener("click", (e) => {
      const data = collectData();
      const check = BloomPedidoLogic.validate(data);
      if (!check.valid) { showErrors(check.errors); return; }
      clearErrors();
      const href = e.currentTarget.dataset.href;
      if (href) window.open(href, "_blank", "noopener");
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      $("#pedidoWhatsappBtn").click();
    });

    BloomCart.onChange(() => { renderOrderItems(); updateSummary(); });

    renderOrderItems();
    updateSummary();
  });
})();
