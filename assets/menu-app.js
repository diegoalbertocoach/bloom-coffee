/**
 * Bloom Menu App — liga DEMO_MENU_ITEMS / BloomCart à interface de
 * cardapio.html. Nenhum dado de produto vive neste arquivo: tudo vem de
 * assets/menu-data.js (ver aviso "DEMO MENU DATA — REPLACE WITH OFFICIAL
 * BLOOM MENU" nesse arquivo).
 */
(function () {
  "use strict";

  const state = {
    searchQuery: "",
    activeCategory: CATEGORIES[0]?.id || null,
    modifierDraft: null, // { product, selections: {groupId: option}, qty, notes }
  };

  // ---------- Helpers ----------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $all = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function productMatchesSearch(product, query) {
    if (!query) return true;
    const q = query.toLowerCase();
    return product.name.toLowerCase().includes(q) || product.description.toLowerCase().includes(q);
  }

  function getProductById(id) {
    return DEMO_MENU_ITEMS.find((p) => p.id === id) || null;
  }

  // ---------- Render: abas de categoria ----------
  function renderCategoryTabs() {
    const wrap = $("#categoryTabs");
    wrap.innerHTML = CATEGORIES.map(
      (cat) => `
      <button class="category-tab" role="tab" data-category="${cat.id}"
        aria-selected="${cat.id === state.activeCategory}">
        ${escapeHtml(cat.label)}
      </button>`
    ).join("");

    $all(".category-tab", wrap).forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeCategory = btn.dataset.category;
        highlightActiveTab();
        const section = document.getElementById("section-" + btn.dataset.category);
        if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function highlightActiveTab() {
    $all(".category-tab").forEach((btn) => {
      btn.setAttribute("aria-selected", String(btn.dataset.category === state.activeCategory));
    });
    const activeBtn = $(`.category-tab[data-category="${state.activeCategory}"]`);
    if (activeBtn) activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  // ---------- Render: produtos ----------
  function productCardHtml(product) {
    const tagsHtml = (product.tags || [])
      .map((t) => `<span class="product-tag">${escapeHtml(t)}</span>`)
      .join("");
    const priceLabel = BloomCart.formatBRL(product.price);
    const photoIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 8h12l-1 9.5A2 2 0 0 1 15 19H9a2 2 0 0 1-2-1.5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`;

    if (!product.available) {
      return `
      <article class="product-card is-unavailable" data-id="${product.id}">
        <div class="product-card-photo" aria-hidden="true">${photoIcon}</div>
        <div class="product-card-body">
          <div class="product-card-top">
            <div>
              <div class="product-card-name">${escapeHtml(product.name)}</div>
              <div class="product-card-desc">${escapeHtml(product.description)}</div>
              <div class="product-card-tags">${tagsHtml}</div>
            </div>
          </div>
          <div class="product-card-bottom">
            <span class="product-price">${priceLabel}</span>
            <span class="product-unavailable-label">Indisponível hoje</span>
          </div>
        </div>
      </article>`;
    }

    return `
      <article class="product-card" data-id="${product.id}">
        <div class="product-card-photo" aria-hidden="true">${photoIcon}</div>
        <div class="product-card-body">
          <div class="product-card-top">
            <div>
              <div class="product-card-name">${escapeHtml(product.name)}</div>
              <div class="product-card-desc">${escapeHtml(product.description)}</div>
              <div class="product-card-tags">${tagsHtml}</div>
            </div>
          </div>
          <div class="product-card-bottom">
            <span class="product-price">${priceLabel}</span>
            <button class="btn-add" data-add="${product.id}" aria-label="Adicionar ${escapeHtml(product.name)} à sacola">
              Adicionar
            </button>
          </div>
        </div>
      </article>`;
  }

  function emptyStateHtml(message) {
    return `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3" stroke-linecap="round"/></svg>
        <p>${escapeHtml(message)}</p>
      </div>`;
  }

  function itemsForCategory(catId, query) {
    if (catId === "destaques") {
      return DEMO_MENU_ITEMS.filter((p) => p.featured && productMatchesSearch(p, query));
    }
    return DEMO_MENU_ITEMS.filter((p) => p.category === catId && productMatchesSearch(p, query));
  }

  function renderProducts() {
    const container = $("#menuSections");
    const query = state.searchQuery.trim();
    let anyResult = false;

    const html = CATEGORIES.map((cat) => {
      const items = itemsForCategory(cat.id, query);
      if (items.length === 0) {
        // "Sazonais" pode legitimamente não ter itens ainda — mostramos isso
        // com clareza em vez de inventar produtos de estação.
        if (cat.id === "sazonais" && !query) {
          anyResult = true;
          return `
            <section class="menu-section" id="section-${cat.id}" data-category-section="${cat.id}">
              <h2 class="menu-section-title">${escapeHtml(cat.label)}</h2>
              <p class="seasonal-empty-note">Nenhum item sazonal no momento. Novidades chegam com as próximas estações.</p>
            </section>`;
        }
        return "";
      }
      anyResult = true;
      return `
        <section class="menu-section" id="section-${cat.id}" data-category-section="${cat.id}">
          <h2 class="menu-section-title">${escapeHtml(cat.label)}</h2>
          <div class="product-grid">${items.map(productCardHtml).join("")}</div>
        </section>`;
    }).join("");

    container.innerHTML = anyResult
      ? html
      : emptyStateHtml(`Nenhum item encontrado para "${query}". Tente outra busca.`);

    $all("[data-add]", container).forEach((btn) => {
      btn.addEventListener("click", () => handleAddClick(btn.dataset.add));
    });

    if (anyResult) observeSections();
  }

  // ---------- Observer: aba ativa acompanha a rolagem ----------
  let sectionObserver = null;
  function observeSections() {
    if (sectionObserver) sectionObserver.disconnect();
    const sections = $all("[data-category-section]");
    if (!sections.length) return;
    sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            state.activeCategory = entry.target.dataset.categorySection;
            highlightActiveTab();
          }
        });
      },
      { rootMargin: "-140px 0px -70% 0px", threshold: 0 }
    );
    sections.forEach((s) => sectionObserver.observe(s));
  }

  // ---------- Adicionar produto ----------
  function handleAddClick(productId) {
    const product = getProductById(productId);
    if (!product) return;
    if (!product.available) {
      showToast("Este item está indisponível no momento.");
      return;
    }
    if (product.modifiers && product.modifiers.length > 0) {
      openModifierSheet(product);
    } else {
      try {
        BloomCart.addItem(product, [], 1, "");
        showToast(`${product.name} adicionado à sacola.`);
      } catch (err) {
        showToast("Não foi possível adicionar este item.");
      }
    }
  }

  // ---------- Sheet de modificadores ----------
  function openModifierSheet(product) {
    const draft = { product, selections: {}, qty: 1, notes: "" };
    (product.modifiers || []).forEach((groupId) => {
      const group = MODIFIER_GROUPS[groupId];
      if (group) draft.selections[groupId] = group.options[0]; // padrão: primeira opção
    });
    state.modifierDraft = draft;
    renderModifierSheet();
    $("#sheetBackdrop").classList.add("is-open");
    $("#modifierSheet").classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeModifierSheet() {
    $("#sheetBackdrop").classList.remove("is-open");
    $("#modifierSheet").classList.remove("is-open");
    document.body.style.overflow = "";
    state.modifierDraft = null;
  }

  function currentDraftUnitPrice() {
    const draft = state.modifierDraft;
    if (!draft) return 0;
    const mods = Object.values(draft.selections);
    return BloomCart.unitPrice(draft.product, mods);
  }

  function renderModifierSheet() {
    const draft = state.modifierDraft;
    if (!draft) return;
    const { product } = draft;

    const groupsHtml = (product.modifiers || [])
      .map((groupId) => {
        const group = MODIFIER_GROUPS[groupId];
        if (!group) return "";
        const optionsHtml = group.options
          .map((opt) => {
            const selected = draft.selections[groupId]?.id === opt.id;
            const deltaLabel = opt.priceDelta > 0 ? `+ ${BloomCart.formatBRL(opt.priceDelta)}` : "Incluso";
            return `
              <div class="modifier-option ${selected ? "is-selected" : ""}" data-group="${groupId}" data-option="${opt.id}" role="radio" aria-checked="${selected}" tabindex="0">
                <span class="modifier-option-label"><span class="modifier-radio"></span>${escapeHtml(opt.label)}</span>
                <span class="modifier-option-delta">${deltaLabel}</span>
              </div>`;
          })
          .join("");
        return `
          <div class="modifier-group">
            <div class="modifier-group-label"><span>${escapeHtml(group.label)}</span><span>${group.required ? "Obrigatório" : "Opcional"}</span></div>
            <div class="modifier-options" data-group-options="${groupId}">${optionsHtml}</div>
          </div>`;
      })
      .join("");

    $("#modifierSheet").innerHTML = `
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <div>
          <div class="sheet-title">${escapeHtml(product.name)}</div>
        </div>
        <button class="sheet-close" id="sheetCloseBtn" aria-label="Fechar">&times;</button>
      </div>
      <p class="sheet-desc">${escapeHtml(product.description)}</p>
      ${groupsHtml}
      <div class="qty-stepper">
        <button class="qty-btn" id="qtyMinus" aria-label="Diminuir quantidade">&minus;</button>
        <span class="qty-value" id="qtyValue">${draft.qty}</span>
        <button class="qty-btn" id="qtyPlus" aria-label="Aumentar quantidade">+</button>
      </div>
      <label class="sr-only" for="notesInput">Alguma observação para este item?</label>
      <textarea class="notes-field" id="notesInput" rows="2" placeholder="Alguma observação? (opcional)">${escapeHtml(draft.notes)}</textarea>
      <div class="sheet-footer">
        <div class="sheet-total">
          <div class="sheet-total-label">Total do item</div>
          <div class="sheet-total-value" id="sheetTotalValue">${BloomCart.formatBRL(currentDraftUnitPrice() * draft.qty)}</div>
        </div>
        <button class="btn-confirm" id="confirmAddBtn">Adicionar à sacola</button>
      </div>
    `;

    $("#sheetCloseBtn").addEventListener("click", closeModifierSheet);
    $("#qtyMinus").addEventListener("click", () => updateDraftQty(-1));
    $("#qtyPlus").addEventListener("click", () => updateDraftQty(1));
    $("#notesInput").addEventListener("input", (e) => { draft.notes = e.target.value; });
    $("#confirmAddBtn").addEventListener("click", confirmAddFromSheet);

    $all("[data-group-options] .modifier-option").forEach((el) => {
      el.addEventListener("click", () => selectModifierOption(el.dataset.group, el.dataset.option));
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectModifierOption(el.dataset.group, el.dataset.option); }
      });
    });
  }

  function selectModifierOption(groupId, optionId) {
    const draft = state.modifierDraft;
    if (!draft) return;
    const group = MODIFIER_GROUPS[groupId];
    const option = group.options.find((o) => o.id === optionId);
    if (!option) return;
    draft.selections[groupId] = option;
    renderModifierSheet();
  }

  function updateDraftQty(delta) {
    const draft = state.modifierDraft;
    if (!draft) return;
    draft.qty = Math.max(1, draft.qty + delta);
    $("#qtyValue").textContent = draft.qty;
    $("#sheetTotalValue").textContent = BloomCart.formatBRL(currentDraftUnitPrice() * draft.qty);
  }

  function confirmAddFromSheet() {
    const draft = state.modifierDraft;
    if (!draft) return;
    const { product } = draft;

    const missingRequired = (product.modifiers || []).some((groupId) => {
      const group = MODIFIER_GROUPS[groupId];
      return group.required && !draft.selections[groupId];
    });
    if (missingRequired) {
      showToast("Selecione todas as opções obrigatórias.");
      return;
    }

    const selectedModifiers = Object.entries(draft.selections).map(([groupId, opt]) => ({
      groupId,
      optionId: opt.id,
      label: opt.label,
      priceDelta: opt.priceDelta,
    }));

    try {
      BloomCart.addItem(product, selectedModifiers, draft.qty, draft.notes.trim());
      showToast(`${product.name} adicionado à sacola.`);
      closeModifierSheet();
    } catch (err) {
      showToast("Não foi possível adicionar este item.");
    }
  }

  // ---------- Caffè Sospeso ----------
  function renderCaffeSospesoToggle() {
    const snap = BloomCart.getSnapshot();
    const el = $("#caffeSospesoToggle");
    el.classList.toggle("is-on", snap.caffeSospeso);
    el.setAttribute("aria-checked", String(snap.caffeSospeso));
  }

  // ---------- Sacola (drawer) ----------
  function cartLineHtml(item) {
    const modsText = item.selectedModifiers.length
      ? item.selectedModifiers.map((m) => m.label).join(" · ")
      : "";
    return `
      <div class="cart-line" data-cart-item="${item.cartItemId}">
        <div class="cart-line-info">
          <div class="cart-line-name">${escapeHtml(item.name)}</div>
          ${modsText ? `<div class="cart-line-mods">${escapeHtml(modsText)}</div>` : ""}
          ${item.notes ? `<div class="cart-line-notes">"${escapeHtml(item.notes)}"</div>` : ""}
          <div class="cart-line-controls">
            <div class="cart-line-qty">
              <button class="qty-btn" data-qty-minus="${item.cartItemId}" aria-label="Diminuir quantidade" style="width:28px;height:28px;font-size:14px;">&minus;</button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-btn" data-qty-plus="${item.cartItemId}" aria-label="Aumentar quantidade" style="width:28px;height:28px;font-size:14px;">+</button>
            </div>
            <button class="cart-line-remove" data-remove="${item.cartItemId}">Remover</button>
          </div>
        </div>
        <div class="cart-line-price">${BloomCart.formatBRL(item.unitPrice * item.qty)}</div>
      </div>`;
  }

  function renderCartDrawer() {
    const snap = BloomCart.getSnapshot();
    const body = $("#cartDrawerBody");

    if (snap.items.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 7h16l-1.5 11a2 2 0 0 1-2 1.8H7.5a2 2 0 0 1-2-1.8L4 7Z"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/></svg>
          <p>Sua sacola está vazia.<br>Escolha algo do cardápio para começar.</p>
        </div>`;
    } else {
      body.innerHTML = snap.items.map(cartLineHtml).join("");
      $all("[data-qty-minus]", body).forEach((b) => b.addEventListener("click", () => {
        const item = snap.items.find((i) => i.cartItemId === b.dataset.qtyMinus);
        if (item) BloomCart.setQty(item.cartItemId, item.qty - 1);
      }));
      $all("[data-qty-plus]", body).forEach((b) => b.addEventListener("click", () => {
        const item = snap.items.find((i) => i.cartItemId === b.dataset.qtyPlus);
        if (item) BloomCart.setQty(item.cartItemId, item.qty + 1);
      }));
      $all("[data-remove]", body).forEach((b) => b.addEventListener("click", () => {
        BloomCart.removeItem(b.dataset.remove);
        showToast("Item removido da sacola.");
      }));
    }

    const total = BloomCart.getTotal(BLOOM_CONFIG.caffeSospesoPrice);
    $("#cartTotalValue").textContent = BloomCart.formatBRL(total);

    // O CTA da sacola agora é um link direto para pedido.html — o carrinho
    // já está em localStorage, então pedido.html lê o mesmo BloomCart.
    const continueBtn = $("#continueToOrderBtn");
    if (continueBtn) {
      continueBtn.classList.toggle("is-disabled-look", snap.items.length === 0);
    }

    renderCaffeSospesoToggle();
  }

  function renderCartBar() {
    const snap = BloomCart.getSnapshot();
    const bar = $("#cartBar");
    const total = BloomCart.getTotal(BLOOM_CONFIG.caffeSospesoPrice);
    if (snap.itemCount > 0) {
      bar.classList.add("is-visible");
      $("#cartBarCount").textContent = `${snap.itemCount} ${snap.itemCount === 1 ? "item" : "itens"}`;
      $("#cartBarTotal").textContent = BloomCart.formatBRL(total);
    } else {
      bar.classList.remove("is-visible");
    }
  }

  function renderCartPeek() {
    const snap = BloomCart.getSnapshot();
    $("#cartPeekCount").textContent = snap.itemCount;
  }

  function openCartDrawer() {
    $("#cartDrawer").classList.add("is-open");
    $("#cartDrawerBackdrop").classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeCartDrawer() {
    $("#cartDrawer").classList.remove("is-open");
    $("#cartDrawerBackdrop").classList.remove("is-open");
    document.body.style.overflow = "";
  }

  // ---------- Toast ----------
  let toastTimer;
  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  // ---------- Inicialização ----------
  function renderAll() {
    renderCategoryTabs();
    renderProducts();
    renderCartDrawer();
    renderCartBar();
    renderCartPeek();
    highlightActiveTab();
  }

  function wireGlobalEvents() {
    $("#searchInput").addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      renderProducts();
    });

    $("#sheetBackdrop").addEventListener("click", closeModifierSheet);
    $("#cartDrawerBackdrop").addEventListener("click", closeCartDrawer);
    $("#cartDrawerCloseBtn").addEventListener("click", closeCartDrawer);
    $("#cartPeekBtn").addEventListener("click", openCartDrawer);
    $("#cartBarBtn").addEventListener("click", openCartDrawer);

    $("#caffeSospesoToggle").addEventListener("click", () => {
      const snap = BloomCart.getSnapshot();
      BloomCart.setCaffeSospeso(!snap.caffeSospeso);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModifierSheet();
        closeCartDrawer();
      }
    });

    BloomCart.onChange(() => {
      renderCartDrawer();
      renderCartBar();
      renderCartPeek();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    wireGlobalEvents();
    renderAll();
  });
})();
