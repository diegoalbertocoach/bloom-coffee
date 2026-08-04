/**
 * BloomCircleLogic — funções puras sobre BLOOM_CIRCLE_DEMO, sem tocar no DOM.
 * Testáveis diretamente (ver tests/circle-smoke-test.html).
 */
const BloomCircleLogic = (() => {
  function getLevels() {
    return BLOOM_CIRCLE_DEMO.levels.slice().sort((a, b) => a.order - b.order);
  }

  function getLevelById(id) {
    return BLOOM_CIRCLE_DEMO.levels.find((l) => l.id === id) || null;
  }

  function getNextLevel(id) {
    const level = getLevelById(id);
    if (!level) return null;
    return BLOOM_CIRCLE_DEMO.levels.find((l) => l.order === level.order + 1) || null;
  }

  function getPreviousLevel(id) {
    const level = getLevelById(id);
    if (!level) return null;
    return BLOOM_CIRCLE_DEMO.levels.find((l) => l.order === level.order - 1) || null;
  }

  /** true se `levelId` já foi alcançado considerando o nível atual `currentLevelId`. */
  function isLevelReached(levelId, currentLevelId) {
    const level = getLevelById(levelId);
    const current = getLevelById(currentLevelId);
    if (!level || !current) return false;
    return level.order <= current.order;
  }

  /**
   * Progresso demonstrativo até o próximo nível.
   * @returns {{hasNext:boolean, current:number, target:number|null, label:string}}
   */
  function computeProgress(visits, levelId) {
    const next = getNextLevel(levelId);
    if (!next) {
      return { hasNext: false, current: visits, target: null, label: "Nível máximo da jornada demonstrativa." };
    }
    return {
      hasNext: true,
      current: visits,
      target: next.threshold,
      label: `${visits} de ${next.threshold} visitas demonstrativas`,
    };
  }

  /** Visitas demonstrativas coerentes para exibir quando o nível é trocado no painel de apresentação. */
  function demoVisitsForLevel(levelId) {
    const level = getLevelById(levelId);
    if (!level) return BLOOM_CIRCLE_DEMO.user.visits;
    if (level.id === BLOOM_CIRCLE_DEMO.user.levelId) return BLOOM_CIRCLE_DEMO.user.visits;
    return level.threshold;
  }

  return { getLevels, getLevelById, getNextLevel, getPreviousLevel, isLevelReached, computeProgress, demoVisitsForLevel };
})();

/* ============================================================================
 * DEMO PREFERENCES ONLY — NO PERSONAL DATA
 * Únicas duas chaves de localStorage usadas nesta página. Nenhuma delas
 * guarda nome, contato ou qualquer dado pessoal — apenas preferências de
 * apresentação da demonstração.
 * ============================================================================ */
const BloomCirclePrefs = (() => {
  const ONBOARDING_KEY = "bloom.circle.onboardingSeen";
  const DEMO_LEVEL_KEY = "bloom.circle.demoLevel";

  function hasSeenOnboarding() {
    try { return localStorage.getItem(ONBOARDING_KEY) === "true"; } catch (e) { return false; }
  }
  function setOnboardingSeen() {
    try { localStorage.setItem(ONBOARDING_KEY, "true"); } catch (e) { /* ignore */ }
  }
  function getSavedDemoLevel() {
    try { return localStorage.getItem(DEMO_LEVEL_KEY); } catch (e) { return null; }
  }
  function saveDemoLevel(levelId) {
    try { localStorage.setItem(DEMO_LEVEL_KEY, levelId); } catch (e) { /* ignore */ }
  }

  return { hasSeenOnboarding, setOnboardingSeen, getSavedDemoLevel, saveDemoLevel, ONBOARDING_KEY, DEMO_LEVEL_KEY };
})();

/* ============================================================================
 * Interface — só executa num documento real com os elementos esperados.
 * ============================================================================ */
(function () {
  "use strict";
  if (typeof document === "undefined") return;

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("circleRoot");
    if (!root) return; // este arquivo também é carregado pela suíte de testes

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $all = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const escapeHtml = (str) =>
      String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    const savedLevel = BloomCirclePrefs.getSavedDemoLevel();
    let currentLevelId = (savedLevel && BloomCircleLogic.getLevelById(savedLevel)) ? savedLevel : BLOOM_CIRCLE_DEMO.user.levelId;

    // ---------- Saudação ----------
    $("#circleGreeting").textContent = `Olá, ${BLOOM_CIRCLE_DEMO.user.firstName}.`;

    // ---------- Nível + progresso ----------
    function renderLevelCard() {
      const level = BloomCircleLogic.getLevelById(currentLevelId);
      const visits = BloomCircleLogic.demoVisitsForLevel(currentLevelId);
      const progress = BloomCircleLogic.computeProgress(visits, currentLevelId);

      $("#currentLevelName").textContent = level.name;
      $("#currentLevelMessage").textContent = level.message;
      $("#progressLabel").textContent = progress.label;

      const bar = $("#progressBarFill");
      if (progress.hasNext) {
        const ratio = Math.min(1, progress.current / progress.target);
        bar.style.width = (ratio * 100) + "%";
      } else {
        bar.style.width = "100%";
      }

      const futureEl = $("#currentLevelFuture");
      if (level.futureExperience) {
        futureEl.textContent = level.futureExperience;
        futureEl.parentElement.hidden = false;
      } else {
        futureEl.parentElement.hidden = true;
      }
    }

    // ---------- Linha da jornada ----------
    function renderJourneyLine() {
      const levels = BloomCircleLogic.getLevels();
      const wrap = $("#journeyLine");
      wrap.innerHTML = levels
        .map((level) => {
          const reached = BloomCircleLogic.isLevelReached(level.id, currentLevelId);
          const isCurrent = level.id === currentLevelId;
          const cls = isCurrent ? "is-current" : reached ? "is-reached" : "is-future";
          return `
          <div class="journey-node ${cls}" data-level="${level.id}">
            <span class="journey-dot" aria-hidden="true"></span>
            <span class="journey-name">${escapeHtml(level.name)}</span>
          </div>`;
        })
        .join(`<span class="journey-line-seg" aria-hidden="true"></span>`);
    }

    // ---------- Animação de crescimento ----------
    function renderGrowth() {
      const level = BloomCircleLogic.getLevelById(currentLevelId);
      $("#growthIllustration").setAttribute("data-stage", String(level.order));
    }

    // ---------- Coleção das estações ----------
    function renderSeasonalCollection() {
      const wrap = $("#seasonalCollection");
      wrap.innerHTML = BLOOM_CIRCLE_DEMO.seasonalCollection
        .map(
          (s) => `
        <div class="season-badge ${s.unlocked ? "is-unlocked" : "is-locked"}">
          <div class="season-badge-top">
            <span class="season-badge-name">${escapeHtml(s.name)}</span>
            <span class="season-badge-status">${s.unlocked ? "Ativa" : "Em breve"}</span>
          </div>
          <p class="season-badge-narrative">${escapeHtml(s.narrative)}</p>
        </div>`
        )
        .join("");
    }

    // ---------- Experiências ----------
    function renderExperiences() {
      const wrap = $("#experiencesList");
      wrap.innerHTML = BLOOM_CIRCLE_DEMO.availableExperiences
        .map((e) => `<div class="experience-card"><span class="experience-dot" aria-hidden="true"></span>${escapeHtml(e.name)}</div>`)
        .join("");
    }

    // ---------- Histórico ----------
    function renderHistory() {
      const wrap = $("#historyTimeline");
      wrap.innerHTML = BLOOM_CIRCLE_DEMO.history
        .map((h) => `<div class="history-row"><span class="history-dot" aria-hidden="true"></span><span>${escapeHtml(h.label)}</span></div>`)
        .join("");
    }

    // ---------- Mural da comunidade (composição abstrata) ----------
    function renderMural() {
      const wrap = $("#muralGrid");
      const placeholders = ["B.", "C.", "A.", "M.", "L.", "R.", "S.", "T."];
      wrap.innerHTML = placeholders
        .map((p, i) => `<div class="mural-cell mural-cell-${i % 4}" aria-hidden="true"><span>${p}</span></div>`)
        .join("");
    }

    // ---------- Cartão digital conceitual ----------
    function renderDigitalCard() {
      const level = BloomCircleLogic.getLevelById(currentLevelId);
      $("#cardUserName").textContent = BLOOM_CIRCLE_DEMO.user.name;
      $("#cardLevelName").textContent = level.name;
      $("#cardMemberSince").textContent = `Bloom Circle · ${BLOOM_CIRCLE_DEMO.user.memberSince}`;
    }

    function renderAll() {
      renderLevelCard();
      renderJourneyLine();
      renderGrowth();
      renderSeasonalCollection();
      renderExperiences();
      renderHistory();
      renderMural();
      renderDigitalCard();
      renderDemoPanelState();
    }

    // ---------- Painel de demonstração (uso interno, não voltado ao cliente final) ----------
    const demoToggleBtn = $("#demoToggleBtn");
    const demoPanel = $("#demoPanel");
    demoToggleBtn.addEventListener("click", () => {
      const open = demoPanel.classList.toggle("is-open");
      demoToggleBtn.setAttribute("aria-expanded", String(open));
    });

    function renderDemoPanelState() {
      $all("[data-demo-level]").forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.demoLevel === currentLevelId);
      });
    }

    $all("[data-demo-level]").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentLevelId = btn.dataset.demoLevel;
        BloomCirclePrefs.saveDemoLevel(currentLevelId);
        renderAll();
      });
    });

    // ---------- Onboarding (ignorável, sem dados pessoais) ----------
    const onboarding = $("#onboarding");
    const onboardingScreens = $all(".onboarding-screen", onboarding);
    let onboardingIndex = 0;

    function showOnboardingScreen(i) {
      onboardingScreens.forEach((el, idx) => el.classList.toggle("is-active", idx === i));
      $("#onboardingNextBtn").textContent = i === onboardingScreens.length - 1 ? "Começar" : "Continuar";
    }
    function closeOnboarding() {
      onboarding.classList.remove("is-open");
      BloomCirclePrefs.setOnboardingSeen();
      document.body.style.overflow = "";
    }
    $("#onboardingNextBtn").addEventListener("click", () => {
      if (onboardingIndex < onboardingScreens.length - 1) {
        onboardingIndex += 1;
        showOnboardingScreen(onboardingIndex);
      } else {
        closeOnboarding();
      }
    });
    $("#onboardingSkipBtn").addEventListener("click", closeOnboarding);

    if (!BloomCirclePrefs.hasSeenOnboarding()) {
      onboarding.classList.add("is-open");
      document.body.style.overflow = "hidden";
      showOnboardingScreen(0);
    }

    renderAll();
  });
})();
