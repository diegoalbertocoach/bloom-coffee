# Bloom Coffee — Cardápio, Reservas e Bloom Circle (Fases 1, 2 e 3)

Entrega isolada, **não conectada** ao `index.html` público. Aguardando
aprovação antes de qualquer integração.

## Estrutura de arquivos

```
cardapio.html              Cardápio digital (Fase 1)
reservas.html              Solicitação de reservas (Fase 2)
circle.html                 Bloom Circle — demonstração (Fase 3)
assets/
  shared.css                 Visual — mesmos tokens de marca do index.html
  menu-data.js                 DADOS DO CARDÁPIO (produtos, preços, config)
  cart.js                       Lógica do carrinho (estado, cálculo, WhatsApp)
  menu-app.js                    Interface do cardápio (renderização, eventos)
  reservas.js                     BloomReservationLogic + interface das reservas
  circle-data.js                   DADOS DEMONSTRATIVOS da Bloom Circle
  circle.js                         BloomCircleLogic + BloomCirclePrefs + interface
tests/
  smoke-test.html              Testes automatizados do cardápio (Fase 1)
  reservas-smoke-test.html      Testes automatizados das reservas (Fase 2)
  circle-smoke-test.html         Testes automatizados da Bloom Circle (Fase 3)
README.md                  Este arquivo
```

## Como testar localmente

Abra `cardapio.html` ou `reservas.html` num navegador. Não requer servidor,
build ou instalação — é HTML/CSS/JS puro. Para testar como a Bloom vai
hospedar de verdade, sirva a pasta com qualquer servidor estático simples:

```bash
npx serve .
# ou
python3 -m http.server 8080
```

---

## Fase 1 — Cardápio Digital

### Real e funcional
- Navegação por categoria (aba ativa acompanha a rolagem), busca por nome/descrição.
- Modificadores (tamanho, tipo de leite) com **preço recalculado em tempo real**.
- Sacola com quantidade, remoção e observações por item, persistida em `localStorage`.
- **Caffè Sospeso**: soma ao total e aparece na mensagem do pedido (`Caffè Sospeso: Sim` / `Não`).
- Geração de mensagem formatada e link `wa.me` para finalizar pelo WhatsApp.
- Estados vazios (busca sem resultado, sacola vazia) e toasts de erro.

### Demonstrativo
- Todos os produtos, descrições e preços — `assets/menu-data.js`, marcado como
  `DEMO MENU DATA — REPLACE WITH OFFICIAL BLOOM MENU`. Nada confirmado pelos
  fundadores.
- Número de WhatsApp — `BLOOM_CONFIG.whatsappNumber` vazio; botão de finalizar
  fica visível, porém desativado, com aviso.

---

## Fase 2 — Reservas Bloom

### Real e funcional
- Formulário com **validação real no front-end**: nome (mín. 2 letras),
  telefone, data (bloqueia datas passadas), horário, número de pessoas
  (seletor com limites configuráveis).
- Foco automático no primeiro campo inválido ao tentar enviar, com mensagens
  de erro associadas a cada campo (`aria-describedby`, `aria-invalid`,
  `role="alert"`).
- Ocasião e método de extração especial (V60 / Chemex / Sem preferência) —
  opcionais.
- **Resumo da solicitação atualizado em tempo real** conforme o usuário preenche.
- Geração de mensagem formatada e link `wa.me` — nunca omite a frase
  *"Entendo que a reserva depende de confirmação da equipe Bloom."*
- **Nenhum dado pessoal é salvo em `localStorage`** — nome, telefone, data e
  observações existem apenas na sessão da página, nunca persistidos.

### Demonstrativo / limitações explícitas
- **Não há agenda em tempo real, nem confirmação automática.** A interface
  nunca exibe "Reserva confirmada" — sempre "Sua solicitação será confirmada
  pela equipe Bloom."
- `BLOOM_RESERVATION_CONFIG.availableTimes` é uma **janela de solicitação**,
  marcada no código como `REQUEST WINDOW — NOT REAL-TIME AVAILABILITY`, não
  disponibilidade real de mesas.
- Número de WhatsApp vazio por padrão — quando não configurado, o botão
  continua clicável (por acessibilidade) mas nunca abre um link quebrado;
  mostra "As solicitações digitais de reserva estarão disponíveis em breve."

### Pontos configuráveis (`assets/reservas.js` → `BLOOM_RESERVATION_CONFIG`)
- `whatsappNumber` — número real, formato internacional (ex: `"5547999999999"`).
- `minimumGuests` / `maximumGuests` — limites do seletor de pessoas.
- `availableTimes` — lista de horários oferecidos para solicitação.
- `occasions` / `methods` — opções dos seletores de ocasião e método especial.

### Bug encontrado e corrigido durante o desenvolvimento
Na primeira versão, o botão "Solicitar reserva" ficava com o atributo HTML
`disabled` sempre que o número de WhatsApp não estava configurado —
**mesmo com o formulário vazio**. Isso impedia o clique de disparar a
validação, então os erros de campo e o foco automático nunca apareciam
antes de o número ser configurado. Corrigido: o botão permanece sempre
clicável e focável (acessibilidade); a validação acontece no momento do
clique, independente do estado de configuração do WhatsApp.

### Testes executados (32/32 passaram)
Rodados de verdade num navegador automatizado contra o código real
(`tests/reservas-smoke-test.html` + testes manuais adicionais):
1. Campos obrigatórios (nome, telefone, data, horário) — ✅
2. Bloqueio de data passada — ✅
3. Quantidade mínima de pessoas (rejeita 0) — ✅
4. Quantidade máxima de pessoas (rejeita acima do limite, botão `+` desativa em 12) — ✅
5. Seleção de método de extração especial — ✅
6. Geração da mensagem (saudação, dados, formatação de data) — ✅
7. Ausência de campos vazios desnecessários (Ocasião/Observações omitidas quando não preenchidas) — ✅
8. Mensagem de confirmação humana sempre presente, nunca "confirmado" — ✅
9. Estado sem WhatsApp configurado (nunca gera link quebrado) — ✅
10. Ausência de dados pessoais no localStorage (confirmado preenchendo o formulário inteiro e inspecionando o storage) — ✅
11. Funcionamento mobile (390–430px, testado visualmente) — ✅
12. Zero erros no console — ✅

---

## Fase 3 — Bloom Circle (demonstração)

**Esta fase inteira é uma demonstração navegável — `DEMO MODE — BLOOM CIRCLE
CONCEPT`.** Não existe login, autenticação, banco de dados, cliente real,
compra real, ponto real, QR Code funcional, histórico real ou benefício
oficialmente ativo. O objetivo é apresentar aos fundadores, de forma
navegável e emocional, a visão do futuro programa de relacionamento.

### O que funciona de verdade (na própria demonstração)
- Onboarding de 3 telas, ignorável, mostrado apenas na primeira visita.
- Painel de demonstração ("Visualizar jornada", canto inferior esquerdo) —
  alterna entre os 5 níveis e atualiza em tempo real: nome do nível,
  mensagem, progresso, "possibilidade da jornada", ilustração de
  crescimento (5 estágios em SVG/CSS) e estado da linha da jornada
  (alcançado / atual / futuro).
- Coleção das estações (Verão ativo, demais bloqueados), experiências em
  desenvolvimento, histórico conceitual, mural da comunidade (abstrato, sem
  nomes reais) e cartão digital conceitual (QR não funcional).

### Tudo é demonstrativo
- `assets/circle-data.js` → `BLOOM_CIRCLE_DEMO` — usuário, níveis, coleção
  sazonal, histórico e experiências são todos fictícios/ilustrativos.
- Nenhuma visita, compra, ponto ou valor é real.
- O QR Code do cartão digital é puramente decorativo (um grid estático) —
  nunca gera ou escaneia nada.

### Privacidade — `DEMO PREFERENCES ONLY — NO PERSONAL DATA`
Apenas duas chaves de `localStorage` são usadas nesta página, nenhuma delas
com dado pessoal:
- `bloom.circle.onboardingSeen` — já viu o onboarding? (`true`/ausente)
- `bloom.circle.demoLevel` — qual nível estava selecionado no painel de
  apresentação, para persistir entre recarregamentos durante uma demo.

Confirmado por teste automatizado: depois de navegar a página inteira e
trocar de nível várias vezes, `localStorage` contém exatamente essas duas
chaves — nada além disso.

### O painel "Visualizar jornada" é uma ferramenta interna
Serve para apresentar as 5 fases da jornada aos fundadores numa reunião.
**Não deve seguir para uma versão publicada ao cliente final sem decisão
específica sobre isso** — é a mesma orientação que veio na especificação
desta fase.

### Testes executados (30/30 na suíte automatizada + testes de integração manuais)
Rodados de verdade contra o código real (`tests/circle-smoke-test.html` +
testes adicionais de integração no navegador):
1. Carregamento dos dados (`BLOOM_CIRCLE_DEMO.mode === "demo"`, 5 níveis) — ✅
2. Nível inicial (Semente, 1 visita demonstrativa) — ✅
3. Alternância de níveis (ordem, próximo/anterior, nível alcançado) — ✅
4. Progresso ("1 de 4 visitas demonstrativas", mensagem especial no nível máximo) — ✅
5. Ilustração de crescimento corresponde ao nível (testado: Bloom → `data-stage="4"`) — ✅
6. Badges sazonais (Verão ativo, 3 bloqueados) — ✅
7. Onboarding (aparece na 1ª visita, 3 telas, "Pular" funciona, não reaparece após concluído) — ✅
8. Persistência apenas de preferências demonstrativas — ✅
9. Ausência de dados pessoais no localStorage (confirmado inspecionando todas as chaves após uso completo) — ✅
10. Timeline / histórico sem valores ou datas específicas inventadas — ✅
11. Cartão conceitual renderiza nome, nível e nota "Identificação digital em desenvolvimento" — ✅
12. QR não funcional (grid decorativo estático, sem geração real) — ✅
13. Responsividade (testado em 390px e 420px) — ✅
14. `prefers-reduced-motion` respeitado (regra global já existente no projeto) — ✅
15. Zero erros no console — ✅
16. Fases 1 e 2 continuam 100% funcionais (20/20 e 32/32 testes, respectivamente) — ✅

---

## Convenção de nomes — Caffè Sospeso (Fase 1)

O conceito é chamado, em todo o projeto, de **"Caffè Sospeso"** (acento grave
em "Caffè"). Não há mais nenhuma ocorrência do termo anterior "Café Suspenso"
em nenhum arquivo.

## Não incluído ainda (produção real)

Autenticação real, banco de dados, calendário conectado,
disponibilidade em tempo real, pagamento antecipado, QR Code, painel
administrativo, confirmação automática, envio de e-mail, integrações externas.

## Compatibilidade e segurança

- Sacola do cardápio: persiste em `localStorage` (apenas itens do pedido, sem dados pessoais).
- Reservas: **nada é persistido**, nem itens nem dados pessoais.
- Sem dependências externas além das fontes do Google (Fraunces, Inter).
- `prefers-reduced-motion` respeitado nas transições.
- Testado em viewport mobile (390–430px) e desktop.
