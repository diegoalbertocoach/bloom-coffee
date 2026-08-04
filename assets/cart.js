/**
 * Bloom Cart — módulo funcional do carrinho da Bloom Coffee.
 * Sem dependências externas. Persiste em localStorage. Não guarda nenhum
 * dado pessoal — apenas os itens do pedido em andamento.
 */
const BloomCart = (() => {
  const STORAGE_KEY = "bloom.cart.v1";

  /** @type {{items: Array, caffeSospeso: boolean}} */
  let state = { items: [], caffeSospeso: false };
  const listeners = new Set();

  function uid() {
    return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items)) {
          state = { items: parsed.items, caffeSospeso: !!parsed.caffeSospeso };
        }
      }
    } catch (err) {
      // localStorage indisponível (modo privado, quota etc.) — segue com carrinho vazio.
      console.warn("Bloom Cart: não foi possível carregar o carrinho salvo.", err);
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn("Bloom Cart: não foi possível salvar o carrinho.", err);
    }
    notify();
  }

  function notify() {
    listeners.forEach((fn) => {
      try { fn(getSnapshot()); } catch (err) { console.error(err); }
    });
  }

  function unitPrice(product, selectedModifiers) {
    const modifierTotal = selectedModifiers.reduce((sum, m) => sum + (m.priceDelta || 0), 0);
    return round2(product.price + modifierTotal);
  }

  function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  /**
   * Adiciona um item ao carrinho.
   * @param {object} product - item de DEMO_MENU_ITEMS
   * @param {Array<{groupId:string, optionId:string, label:string, priceDelta:number}>} selectedModifiers
   * @param {number} qty
   * @param {string} notes
   */
  function addItem(product, selectedModifiers = [], qty = 1, notes = "") {
    if (!product || !product.available) {
      throw new Error("Produto indisponível.");
    }
    if (qty < 1) qty = 1;

    const price = unitPrice(product, selectedModifiers);
    const modifierKey = selectedModifiers.map((m) => m.optionId).sort().join("|");

    // Se já existe um item idêntico (mesmo produto + mesmos modificadores + mesma observação),
    // soma a quantidade em vez de criar uma linha duplicada.
    const existing = state.items.find(
      (i) => i.productId === product.id && i.modifierKey === modifierKey && i.notes === notes
    );
    if (existing) {
      existing.qty += qty;
    } else {
      state.items.push({
        cartItemId: uid(),
        productId: product.id,
        name: product.name,
        basePrice: product.price,
        unitPrice: price,
        modifierKey,
        selectedModifiers,
        qty,
        notes,
      });
    }
    persist();
  }

  function removeItem(cartItemId) {
    state.items = state.items.filter((i) => i.cartItemId !== cartItemId);
    persist();
  }

  function setQty(cartItemId, qty) {
    const item = state.items.find((i) => i.cartItemId === cartItemId);
    if (!item) return;
    if (qty < 1) {
      removeItem(cartItemId);
      return;
    }
    item.qty = qty;
    persist();
  }

  /** Ativa/desativa o Caffè Sospeso (café pago antecipadamente para outra pessoa). */
  function setCaffeSospeso(enabled) {
    state.caffeSospeso = !!enabled;
    persist();
  }

  function clear() {
    state = { items: [], caffeSospeso: false };
    persist();
  }

  function getItemCount() {
    return state.items.reduce((sum, i) => sum + i.qty, 0);
  }

  function getItemsTotal() {
    return round2(state.items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0));
  }

  function getTotal(caffeSospesoPrice) {
    const base = getItemsTotal();
    return round2(state.caffeSospeso ? base + caffeSospesoPrice : base);
  }

  function getSnapshot() {
    return {
      items: state.items.slice(),
      caffeSospeso: state.caffeSospeso,
      itemCount: getItemCount(),
      itemsTotal: getItemsTotal(),
    };
  }

  function onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function formatBRL(value) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  /**
   * Monta a mensagem de pedido formatada para envio via WhatsApp.
   * Inclui sempre a linha "Caffè Sospeso: Sim" ou "Caffè Sospeso: Não",
   * independentemente do estado, para que a equipe veja a escolha com clareza.
   * @param {number} caffeSospesoPrice
   * @returns {string}
   */
  function buildWhatsAppMessage(caffeSospesoPrice) {
    if (state.items.length === 0) return "";
    const lines = [];
    lines.push("Olá, Bloom! Gostaria de fazer o seguinte pedido:");
    lines.push("");
    state.items.forEach((item) => {
      const modsText = item.selectedModifiers.length
        ? " (" + item.selectedModifiers.map((m) => m.label).join(", ") + ")"
        : "";
      const notesText = item.notes ? ` — obs: ${item.notes}` : "";
      lines.push(`• ${item.qty}x ${item.name}${modsText}${notesText} — ${formatBRL(item.unitPrice * item.qty)}`);
    });
    lines.push("");
    if (state.caffeSospeso) {
      lines.push(`Caffè Sospeso: Sim (+ ${formatBRL(caffeSospesoPrice)})`);
    } else {
      lines.push("Caffè Sospeso: Não");
    }
    lines.push("");
    lines.push(`Total estimado: ${formatBRL(getTotal(caffeSospesoPrice))}`);
    lines.push("");
    lines.push("(Pedido gerado pelo Cardápio Digital Bloom — sujeito a confirmação da equipe.)");
    return lines.join("\n");
  }

  function buildWhatsAppUrl(whatsappNumber, caffeSospesoPrice) {
    const message = buildWhatsAppMessage(caffeSospesoPrice);
    const digits = (whatsappNumber || "").replace(/\D/g, "");
    if (!digits) return null;
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  }

  load();

  return {
    addItem,
    removeItem,
    setQty,
    setCaffeSospeso,
    clear,
    getSnapshot,
    getTotal,
    getItemsTotal,
    getItemCount,
    onChange,
    formatBRL,
    buildWhatsAppMessage,
    buildWhatsAppUrl,
    unitPrice,
  };
})();
