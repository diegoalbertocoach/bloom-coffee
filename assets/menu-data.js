/**
 * ============================================================================
 * DEMO MENU DATA — REPLACE WITH OFFICIAL BLOOM MENU
 * ============================================================================
 * Todos os produtos, descrições, preços e disponibilidade neste arquivo são
 * ILUSTRATIVOS. Nada aqui foi confirmado pelos fundadores da Bloom Coffee.
 *
 * Este arquivo é a ÚNICA fonte de dados do cardápio. A interface (menu-app.js)
 * nunca deve conter produtos, preços ou textos "hard-coded" — tudo é lido
 * daqui. Isso permite que, no futuro, qualquer pessoa da equipe Bloom troque
 * produtos e preços sem tocar em HTML, CSS ou JavaScript de interface.
 *
 * Para publicar o cardápio oficial:
 *   1. Substitua os itens de DEMO_MENU_ITEMS pelos produtos reais.
 *   2. Ajuste CATEGORIES se as categorias oficiais forem diferentes.
 *   3. Preencha BLOOM_CONFIG.whatsappNumber com o número real (formato
 *      internacional, ex: "55479XXXXXXXX", sem espaços ou símbolos).
 *   4. Remova este aviso quando o cardápio for aprovado como oficial.
 * ============================================================================
 */

const BLOOM_CONFIG = {
  // PENDENTE — preencher com o número oficial da Bloom no formato
  // internacional (ex: "5547999999999"). Enquanto estiver vazio, o botão
  // "Finalizar pelo WhatsApp" fica visível porém desativado, com aviso.
  whatsappNumber: "",
  currency: "BRL",
  locale: "pt-BR",
  // Valor demonstrativo do "Caffè Sospeso". Substituir pelo valor oficial.
  caffeSospesoPrice: 12,
};

// Categorias exibidas nas abas de navegação, na ordem em que aparecem.
const CATEGORIES = [
  { id: "destaques", label: "Destaques" },
  { id: "quentes", label: "Cafés quentes" },
  { id: "gelados", label: "Gelados" },
  { id: "matcha", label: "Matcha" },
  { id: "comidas", label: "Comidas" },
  { id: "sazonais", label: "Sazonais" },
];

// Grupos de modificadores reutilizáveis entre produtos.
const MODIFIER_GROUPS = {
  tamanho: {
    id: "tamanho",
    label: "Tamanho",
    type: "single",
    required: true,
    options: [
      { id: "p", label: "Pequeno", priceDelta: 0 },
      { id: "g", label: "Grande", priceDelta: 4 },
    ],
  },
  leite: {
    id: "leite",
    label: "Tipo de leite",
    type: "single",
    required: true,
    options: [
      { id: "integral", label: "Integral", priceDelta: 0 },
      { id: "sem-lactose", label: "Sem lactose", priceDelta: 1.5 },
      { id: "aveia", label: "Aveia", priceDelta: 3.5 },
      { id: "amendoas", label: "Amêndoas", priceDelta: 3.5 },
      { id: "coco", label: "Coco", priceDelta: 3.5 },
    ],
  },
};

/**
 * DEMO MENU DATA — REPLACE WITH OFFICIAL BLOOM MENU
 * Estrutura de cada produto:
 *   id            identificador único (usado no carrinho e na URL do WhatsApp)
 *   category      precisa bater com um id de CATEGORIES
 *   name          nome exibido
 *   description   descrição curta (1 linha)
 *   price         preço base, em reais, sem modificadores
 *   tags          array de: "VG" (vegano), "SG" (sem glúten), "SL" (sem lactose)
 *   available     true/false — controla se o produto pode ser adicionado
 *   modifiers     array de ids referenciando MODIFIER_GROUPS (opcional)
 */
const DEMO_MENU_ITEMS = [
  // ---------- CAFÉS QUENTES ----------
  {
    id: "espresso",
    category: "quentes",
    name: "Espresso",
    description: "Extração curta, encorpada, para começar o dia.",
    price: 8,
    tags: ["VG", "SG"],
    available: true,
    modifiers: [],
  },
  {
    id: "cappuccino",
    category: "quentes",
    featured: true,
    name: "Cappuccino",
    description: "Espresso, leite vaporizado e espuma cremosa.",
    price: 12,
    tags: [],
    available: true,
    modifiers: ["tamanho", "leite"],
  },
  {
    id: "latte-classico",
    category: "quentes",
    name: "Latte Clássico",
    description: "Equilíbrio entre café e leite, textura aveludada.",
    price: 13,
    tags: [],
    available: true,
    modifiers: ["tamanho", "leite"],
  },
  {
    id: "flat-white",
    category: "quentes",
    name: "Flat White",
    description: "Dose dupla, leite bem texturizado, sabor intenso.",
    price: 14,
    tags: [],
    available: true,
    modifiers: ["leite"],
  },
  {
    id: "macchiato",
    category: "quentes",
    name: "Macchiato",
    description: "Espresso marcado com um toque de espuma de leite.",
    price: 10,
    tags: [],
    available: true,
    modifiers: ["leite"],
  },
  {
    id: "mocha",
    category: "quentes",
    name: "Mocha",
    description: "Café, chocolate e leite vaporizado.",
    price: 15,
    tags: [],
    available: true,
    modifiers: ["tamanho", "leite"],
  },

  // ---------- GELADOS ----------
  {
    id: "iced-latte",
    category: "gelados",
    featured: true,
    name: "Iced Latte",
    description: "Café, leite e gelo — leve e refrescante.",
    price: 15,
    tags: [],
    available: true,
    modifiers: ["leite"],
  },
  {
    id: "cold-brew",
    category: "gelados",
    name: "Cold Brew",
    description: "Extração lenta a frio, suave e encorpado.",
    price: 16,
    tags: ["VG", "SG"],
    available: true,
    modifiers: [],
  },
  {
    id: "espresso-tonica",
    category: "gelados",
    name: "Espresso Tônica",
    description: "Espresso sobre água tônica gelada e citros.",
    price: 17,
    tags: ["VG", "SG"],
    available: true,
    modifiers: [],
  },
  {
    id: "soda-italiana",
    category: "gelados",
    name: "Soda Italiana",
    description: "Xarope de fruta, água com gás e gelo.",
    price: 14,
    tags: ["VG", "SG", "SL"],
    available: true,
    modifiers: [],
  },

  // ---------- MATCHA ----------
  {
    id: "matcha-classico",
    category: "matcha",
    name: "Matcha Clássico",
    description: "Matcha cerimonial batido com leite vaporizado.",
    price: 16,
    tags: [],
    available: true,
    modifiers: ["tamanho", "leite"],
  },
  {
    id: "iced-matcha",
    category: "matcha",
    name: "Iced Matcha",
    description: "Matcha, leite gelado e gelo.",
    price: 18,
    tags: [],
    available: true,
    modifiers: ["leite"],
  },

  // ---------- CROISSANTS ----------
  {
    id: "croissant-tradicional",
    category: "comidas",
    featured: true,
    name: "Croissant Tradicional",
    description: "Amanteigado, folhado, feito diariamente.",
    price: 14,
    tags: ["VG"],
    available: true,
    modifiers: [],
  },
  {
    id: "croissant-presunto-queijo",
    category: "comidas",
    name: "Croissant Presunto e Queijo",
    description: "Recheado, tostado na hora do pedido.",
    price: 18,
    tags: [],
    available: true,
    modifiers: [],
  },
  {
    id: "pain-au-chocolat",
    category: "comidas",
    name: "Pain au Chocolat",
    description: "Folhado amanteigado com chocolate.",
    price: 16,
    tags: ["VG"],
    available: true,
    modifiers: [],
  },

  // ---------- COOKIES ----------
  {
    id: "cookie-chocolate",
    category: "comidas",
    name: "Cookie de Chocolate",
    description: "Crocante por fora, macio por dentro.",
    price: 12,
    tags: ["VG"],
    available: true,
    modifiers: [],
  },
  {
    id: "cookie-recheado",
    category: "comidas",
    featured: true,
    name: "Cookie Recheado",
    description: "Com pedaços de chocolate ao leite e branco.",
    price: 14,
    tags: ["VG"],
    available: true,
    modifiers: [],
  },

  // ---------- COMIDINHAS ----------
  {
    id: "sanduiche-pesto",
    category: "comidas",
    name: "Pesto Flow",
    description: "Pão italiano, pesto, tomate fresco e mussarela.",
    price: 26,
    tags: ["VG"],
    available: true,
    modifiers: [],
  },
  {
    id: "sanduiche-ricota",
    category: "comidas",
    name: "Ricotta Cloud",
    description: "Creme de ricota, rúcula e tomate seco.",
    price: 26,
    tags: ["VG"],
    available: true,
    modifiers: [],
  },
  {
    id: "pao-de-queijo",
    category: "comidas",
    name: "Pão de Queijo",
    description: "Porção artesanal, servida quentinha.",
    price: 6,
    tags: ["SG"],
    available: true,
    modifiers: [],
  },
  {
    id: "pao-de-queijo-sem-lactose",
    category: "comidas",
    name: "Pão de Queijo Sem Lactose",
    description: "A mesma receita, versão sem lactose.",
    price: 6,
    tags: ["SG", "SL"],
    available: false,
  },
];

// Impede uso acidental em outro escopo — leitura apenas.
if (typeof Object.freeze === "function") {
  Object.freeze(BLOOM_CONFIG);
  Object.freeze(CATEGORIES);
}
