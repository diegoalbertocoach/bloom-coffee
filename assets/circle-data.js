/**
 * ============================================================================
 * DEMO MODE — BLOOM CIRCLE CONCEPT
 * ============================================================================
 * Tudo neste arquivo é conceitual. Não existe login, banco de dados, cliente
 * real, compra real, ponto real ou benefício oficialmente ativo. Serve para
 * demonstrar, de forma navegável, a visão do programa de relacionamento
 * Bloom Circle para os fundadores — nunca para um cliente final acreditar
 * que está usando um sistema em produção.
 * ============================================================================
 */
const BLOOM_CIRCLE_DEMO = {
  mode: "demo",

  user: {
    name: "Diego",
    firstName: "Diego",
    levelId: "semente",
    visits: 1,
    memberSince: "2026",
    profileImage: "",
  },

  // Cada nível tem um limiar demonstrativo de "visitas" — não representa
  // regra oficial de negócio, apenas ilustra a progressão para a demo.
  levels: [
    {
      id: "semente",
      order: 1,
      name: "Semente",
      threshold: 0,
      message: "Hoje começou sua história com a Bloom.",
    },
    {
      id: "broto",
      order: 2,
      name: "Broto",
      threshold: 4,
      message: "Seu ritual começa a ganhar forma.",
      futureExperience: "Conheça o café filtrado especial da semana.",
    },
    {
      id: "jardim",
      order: 3,
      name: "Jardim",
      threshold: 10,
      message: "Sua presença já faz parte da nossa rotina.",
      futureExperience: "Degustações e novidades antecipadas.",
    },
    {
      id: "bloom",
      order: 4,
      name: "Bloom",
      threshold: 20,
      message: "Você ajuda esta comunidade a florescer.",
      futureExperience: "Mural da comunidade, convites e lançamentos.",
    },
    {
      id: "embaixador",
      order: 5,
      name: "Embaixador Bloom",
      threshold: 35,
      message: "Algumas pessoas visitam a Bloom. Outras ajudam a construir sua história.",
      futureExperience: "Eventos fechados, pré-lançamentos e experiências em novas unidades.",
    },
  ],

  seasonalCollection: [
    { id: "verao", name: "Verão", narrative: "Manhãs leves, bebidas geladas e encontros perto do mar.", unlocked: true },
    { id: "outono", name: "Outono", narrative: "Novos sabores para dias que pedem pausa.", unlocked: false },
    { id: "inverno", name: "Inverno", narrative: "Café quente, conversas longas e tempo para ficar.", unlocked: false },
    { id: "primavera", name: "Primavera", narrative: "Uma nova estação para continuar florescendo.", unlocked: false },
  ],

  // Eventos genéricos — nunca compras, valores ou datas específicas inventadas.
  history: [
    { label: "Sua Jornada Bloom começou." },
    { label: "Você conheceu o Bloom Circle." },
    { label: "Primeira visita demonstrativa registrada." },
  ],

  availableExperiences: [
    { id: "cafe-semana", name: "Café filtrado da semana" },
    { id: "degustacao", name: "Degustação de novos grãos" },
    { id: "convites", name: "Convites Bloom" },
    { id: "novidades", name: "Novidades antecipadas" },
    { id: "aniversario", name: "Experiência de aniversário" },
    { id: "encontros", name: "Encontros da comunidade" },
  ],
};

if (typeof Object.freeze === "function") Object.freeze(BLOOM_CIRCLE_DEMO);
