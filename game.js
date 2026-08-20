(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (from, to, amount) => from + (to - from) * amount;
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const portal = $('#portal');
  const transition = $('#entry-transition');
  const gameScreen = $('#game-screen');
  const canvas = $('#world');
  let ctx = canvas.getContext('2d', { alpha: false });
  const displayCtx = ctx;
  const prompt = $('#interaction-prompt');
  const promptCopy = $('#interaction-copy');
  const dialogue = $('#dialogue');
  const dialogueSpeaker = $('#dialogue-speaker');
  const dialogueText = $('#dialogue-text');
  const dialoguePortrait = $('#dialogue-portrait');
  const knowledgePanel = $('#knowledge-panel');
  const knowledgeStatus = $('#knowledge-status');
  const knowledgeAction = $('#knowledge-action');
  const knowledgeCost = $('#knowledge-cost');
  const labPanel = $('#lab-panel');
  const labStatus = $('#lab-status');
  const labAction = $('#lab-action');
  const labCost = $('#lab-cost');
  const learningPanel = $('#learning-panel');
  const learningKicker = $('#learning-kicker');
  const learningStage = $('#learning-stage');
  const learningTitle = $('#learning-title');
  const learningText = $('#learning-text');
  const learningBullets = $('#learning-bullets');
  const learningQuestionBlock = $('#learning-question-block');
  const learningQuestion = $('#learning-question');
  const learningChoices = $('#learning-choices');
  const learningProgress = $('#learning-progress');
  const learningControls = $('#learning-controls');
  const mentorshipPanel = $('#mentorship-panel');
  const mentorshipKicker = $('#mentorship-kicker');
  const mentorshipStage = $('#mentorship-stage');
  const mentorshipTitle = $('#mentorship-title');
  const mentorshipPrice = $('#mentorship-price');
  const mentorshipSummary = $('#mentorship-summary');
  const mentorshipModules = $('#mentorship-modules');
  const mentorshipMethods = $('#mentorship-methods');
  const mentorshipStatus = $('#mentorship-status');
  const mentorshipControls = $('#mentorship-controls');
  const mentorshipOfferings = $('#mentorship-offerings');
  const mentorshipProgress = $('#mentorship-progress');
  const bucksStorePanel = $('#bucks-store-panel');
  const bucksStoreKicker = $('#bucks-store-kicker');
  const bucksStoreStage = $('#bucks-store-stage');
  const bucksStoreTitle = $('#bucks-store-title');
  const bucksStoreSummary = $('#bucks-store-summary');
  const bucksStorePacks = $('#bucks-store-packs');
  const bucksStoreCheckout = $('#bucks-store-checkout');
  const bucksStoreCheckoutTitle = $('#bucks-store-checkout-title');
  const bucksStoreCheckoutCopy = $('#bucks-store-checkout-copy');
  const bucksStoreCheckoutButton = bucksStoreCheckout ? bucksStoreCheckout.querySelector('button') : null;
  const bucksStoreStatus = $('#bucks-store-status');
  const bucksStoreControls = $('#bucks-store-controls');
  const bucksStoreProgress = $('#bucks-store-progress');
  const freeCoinsPanel = $('#free-coins-panel');
  const freeCoinsKicker = $('#free-coins-kicker');
  const freeCoinsStage = $('#free-coins-stage');
  const freeCoinsTitle = $('#free-coins-title');
  const freeCoinsSummary = $('#free-coins-summary');
  const freeCoinsList = $('#free-coins-list');
  const freeCoinsStatus = $('#free-coins-status');
  const freeCoinsControls = $('#free-coins-controls');
  const freeCoinsProgress = $('#free-coins-progress');
  const toast = $('#toast');
  const coinCounter = $('#hud-coins');
  const bucksChip = $('#hud-bucks');
  const bucksCounter = $('#hud-bucks-value');
  const levelCounter = $('#hud-level');
  const questTitle = $('#quest-title');
  const questDetail = $('#quest-detail');
  const starterGoal = $('#starter-goal');
  const starterGoalCurrent = $('#starter-goal-current');
  const starterGoalTarget = $('#starter-goal-target');
  const starterGoalBar = $('#starter-goal-bar');

  // A deliberately compact first district. It is still larger than the viewport,
  // but all destinations stay within one readable, walkable city square.
  const WORLD = { width: 1640, height: 1080 };
  const DAY_MS = 24 * 60 * 60 * 1000;
  const INITIAL_COIN_COUNT = 5;
  const DAILY_COIN_COUNT = 5;
  const PROSPECTION_SIGNAL_COUNT = 3;
  const CHALLENGE_SIGNAL_COUNT = 3;
  const PERFORMANCE = {
    grassClumps: 48,
    terrainGridStep: 96,
    roadTileStep: 56,
    roadTileRowsDivisor: 34,
    fogBanks: 2,
  };
  const QUALITY_PRESETS = {
    low: {
      label: 'Baixo',
      dpr: 1,
      staticScale: .72,
      grassClumps: 14,
      terrainGridStep: 150,
      roadTileStep: 88,
      fogBanks: 0,
      atmosphereBands: 0,
      vignetteStars: 0,
      lampEvery: 2,
      sceneryEvery: 2,
      shadows: .62,
      buildingGlow: .55,
      animationRate: .72,
      cacheMargin: 190,
    },
    medium: {
      label: 'Médio',
      dpr: 1.25,
      staticScale: .86,
      grassClumps: 28,
      terrainGridStep: 118,
      roadTileStep: 68,
      fogBanks: 1,
      atmosphereBands: 1,
      vignetteStars: 8,
      lampEvery: 1,
      sceneryEvery: 1,
      shadows: .82,
      buildingGlow: .76,
      animationRate: .9,
      cacheMargin: 230,
    },
    high: {
      label: 'Alto',
      dpr: 1.65,
      staticScale: 1,
      grassClumps: 48,
      terrainGridStep: 96,
      roadTileStep: 56,
      fogBanks: 2,
      atmosphereBands: 3,
      vignetteStars: 24,
      lampEvery: 1,
      sceneryEvery: 1,
      shadows: 1,
      buildingGlow: 1,
      animationRate: 1,
      cacheMargin: 280,
    },
  };
  const INITIAL_COIN_REWARD = { coins: 25, xp: 15 };
  const DAILY_COIN_REWARD = { coins: 15, xp: 10 };
  const DIGITAL_01_COST = 75;
  const DIGITAL_02_COST = 50;
  const FREE_COINS_CHECKIN_MS = DAY_MS;
  const STARTER_DAILY_TARGET_DAYS = 21;
  const stateKey = 'therichcorp-v3-first-slice';
  const RADAR_LESSONS = [
    {
      kicker: 'RADAR DE OPORTUNIDADES · SINAL 01',
      title: 'Dor antes da solução',
      text: 'Uma boutique recebe contatos pelo Instagram, mas demora horas para responder no WhatsApp. Grande parte das pessoas some antes da conversa.',
      bullets: [
        'Uma oportunidade começa por uma dor observável, não por uma ideia de produto.',
        'Tempo perdido, abandono e retrabalho revelam onde a jornada está quebrando.',
        'Pergunte primeiro: quem deixa de avançar, em qual momento e por quê?',
      ],
      question: 'Qual sinal merece ser investigado primeiro?',
      choices: [
        { title: 'Um elogio isolado', detail: 'Alguém gostou de uma ideia uma única vez.' },
        { title: 'Pessoas somem após esperar resposta', detail: 'A mesma perda aparece repetidamente na jornada.' },
        { title: 'Uma tendência que parece popular', detail: 'Popularidade sem necessidade comprovada.' },
      ],
      correct: 1,
      feedback: [
        'Um elogio é agradável, mas ainda não mostra uma dor repetida.',
        'Correto. Uma perda recorrente e mensurável é uma pista forte de oportunidade.',
        'Tendência chama atenção; evidência de necessidade mostra onde vale investigar.',
      ],
    },
    {
      kicker: 'RADAR DE OPORTUNIDADES · SINAL 02',
      title: 'Recorte antes de escala',
      text: 'O problema não é “ajudar empreendedores”. É ajudar pequenas boutiques que perdem clientes porque respondem tarde no WhatsApp.',
      bullets: [
        'Público específico + contexto específico tornam a oportunidade testável.',
        'Um bom recorte facilita entrevistas, linguagem e uma primeira oferta.',
        'Comece pequeno o bastante para aprender rápido — não amplo o bastante para agradar todos.',
      ],
      question: 'Qual recorte descreve melhor a oportunidade?',
      choices: [
        { title: 'Qualquer empresa que usa internet', detail: 'É amplo demais para orientar um teste.' },
        { title: 'Pequenas boutiques que perdem leads por demora no WhatsApp', detail: 'Perfil, perda e contexto estão claros.' },
        { title: 'Pessoas que querem uma marca mais bonita', detail: 'Desejo genérico, sem dor mensurável.' },
      ],
      correct: 1,
      feedback: [
        'Quando o público é amplo, fica difícil descobrir a causa e medir o resultado.',
        'Correto. O recorte une quem sofre, qual perda ocorre e onde ela acontece.',
        'Marca pode importar, mas ainda não explica a perda de conversas dessa jornada.',
      ],
    },
    {
      kicker: 'RADAR DE OPORTUNIDADES · SINAL 03',
      title: 'Teste antes de construir',
      text: 'A hipótese não é criar um aplicativo. É testar se respostas prontas e um follow-up rápido aumentam conversas qualificadas em sete dias.',
      bullets: [
        'O menor teste útil entrega evidência sem exigir meses de construção.',
        'Defina uma hipótese, uma ação curta e uma métrica que pode mudar.',
        'Aprendizado rápido reduz risco e melhora a próxima decisão.',
      ],
      question: 'Qual é o teste mais inteligente para essa hipótese?',
      choices: [
        { title: 'Desenvolver uma plataforma completa', detail: 'Construção longa antes de validar a necessidade.' },
        { title: 'Usar respostas prontas e dois follow-ups por sete dias', detail: 'Teste pequeno, direto e mensurável.' },
        { title: 'Trocar logo, cores e nome da boutique', detail: 'Mudança visual que não testa o gargalo.' },
      ],
      correct: 1,
      feedback: [
        'Construir antes de aprender aumenta custo e atrasa a evidência.',
        'Correto. Um teste pequeno mostra se a hipótese altera a conversa real.',
        'Identidade visual não mede se o atraso na resposta é a causa da perda.',
      ],
    },
  ];
  const CHALLENGE_DECISIONS = [
    {
      kicker: 'DESAFIO DE PROSPECÇÃO · DECISÃO 01',
      title: 'Encontre a evidência',
      text: 'Marina tem uma boutique: recebe contatos pelo Instagram, responde tarde no WhatsApp e 70% dos interessados somem. Ela tem R$100 e sete dias para melhorar as conversas.',
      bullets: [
        'Não escale o tráfego antes de entender por que as pessoas abandonam.',
        'Evidência próxima do gargalo vale mais que uma suposição elegante.',
      ],
      question: 'Qual é o melhor primeiro passo?',
      choices: [
        { title: 'Criar um curso completo de vendas no WhatsApp', detail: 'Uma solução grande antes de validar a dor.' },
        { title: 'Medir o tempo de resposta e conversar com cinco contatos perdidos', detail: 'Evidência direta sobre o gargalo.' },
        { title: 'Usar os R$100 em anúncios', detail: 'Mais tráfego para o mesmo problema.' },
      ],
      correct: 1,
      feedback: [
        'Você escolheu uma solução antes de confirmar a dor que trava a jornada.',
        'Correto. Primeiro encontre evidência próxima do gargalo de atendimento.',
        'Mais tráfego só amplia a perda se o atendimento continua lento.',
      ],
    },
    {
      kicker: 'DESAFIO DE PROSPECÇÃO · DECISÃO 02',
      title: 'Crie um teste pequeno',
      text: 'A evidência confirma que a demora na resposta está derrubando as conversas. Agora Marina precisa testar uma mudança barata e rápida.',
      bullets: [
        'Uma hipótese validável cabe no tempo, no orçamento e na operação atual.',
        'O teste deve mudar um comportamento e produzir uma medida comparável.',
      ],
      question: 'Qual teste faz mais sentido agora?',
      choices: [
        { title: 'Construir um app de atendimento por três meses', detail: 'Caro e lento para uma hipótese ainda aberta.' },
        { title: 'Criar dez respostas prontas e dois follow-ups para cinco contatos', detail: 'Experimento curto que reduz o tempo de resposta.' },
        { title: 'Trocar logo, cores e nome da boutique', detail: 'Mudança que não testa a causa da perda.' },
      ],
      correct: 1,
      feedback: [
        'A solução pode ser boa um dia, mas é grande demais antes do aprendizado inicial.',
        'Correto. Um teste pequeno reduz risco e produz aprendizado rápido.',
        'Marca importa, mas não testa a causa da perda de conversas.',
      ],
    },
    {
      kicker: 'DESAFIO DE PROSPECÇÃO · DECISÃO 03',
      title: 'Decida com métrica',
      text: 'Após o teste, as respostas caíram para menos de 20 minutos. Nove de 20 conversas viraram contatos qualificados; antes eram três.',
      bullets: [
        'Um sinal inicial é promissor, mas ainda não é prova de escala.',
        'A próxima etapa transforma a melhoria em validação comercial.',
      ],
      question: 'Qual é a próxima decisão mais responsável?',
      choices: [
        { title: 'Escalar anúncios imediatamente', detail: 'Um único teste ainda não prova que a solução escala.' },
        { title: 'Vender um plano anual para todas as boutiques', detail: 'Venda antes de valor comprovado cria risco desnecessário.' },
        { title: 'Fazer um piloto pago com três boutiques e medir conversão, receita e retenção', detail: 'Validação comercial antes de crescer.' },
      ],
      correct: 2,
      feedback: [
        'Escalar cedo pode esconder os limites que o piloto ainda não revelou.',
        'É cedo para compromisso amplo sem provar valor e retenção.',
        'Correto. Agora o objetivo é transformar o sinal inicial em validação comercial.',
      ],
    },
  ];
  const MENTORSHIPS = [
    {
      id: 'pdfs',
      name: 'Rich Starter',
      tagline: 'Aprenda a vender PDFs simples com oferta clara.',
      icon: 'ST',
      tier: 'Entrada farmável',
      accessLabel: 'Farmável no jogo',
      highlight: 'PDFs vendáveis',
      priceBucks: null,
      priceCoins: 5000,
      coinOnly: true,
      pitch: 'Uma mentoria de entrada para transformar conhecimento simples em PDFs vendáveis, com promessa direta, página simples e rotina de divulgação.',
      benefits: ['Oferta simples', 'Página de venda', 'Primeiras vendas'],
      modules: [
        { title: '01 · PDF que alguém compraria', text: 'Escolha um problema específico e transforme uma solução prática em um material simples, direto e útil.' },
        { title: '02 · Oferta e página de venda', text: 'Monte título, promessa, benefícios, preço, bônus e uma landing page curta para vender o PDF.' },
        { title: '03 · Divulgação e primeiras vendas', text: 'Aprenda caminhos simples para divulgar, testar mensagens e ajustar a oferta usando feedback real.' },
      ],
      outcome: 'Você sai com uma ideia de PDF, uma oferta estruturada, uma página de venda simples e um plano para buscar as primeiras vendas.',
    },
    {
      id: 'silver',
      name: 'Rich Silver',
      tagline: 'Low ticket validado para vender em escala.',
      icon: 'S',
      tier: 'Fundação premium',
      accessLabel: 'Somente Rich Bucks',
      highlight: 'Low ticket validado',
      priceBucks: 600,
      priceCoins: null,
      pitch: 'Aprenda a vender produtos de baixo preço com estratégia, volume e uma oferta já validada para começar com clareza.',
      benefits: ['Produto validado', 'Estratégia de vendas', 'Execução prática'],
      modules: [
        { title: '01 · Produto low ticket validado', text: 'Entenda a oferta de baixo preço, por que ela vende e como posicionar o produto para compra rápida.' },
        { title: '02 · Estratégia de vendas em escala', text: 'Aprenda a montar promessa, preço, entrega, página simples e comunicação para vender mais vezes.' },
        { title: '03 · Execução prática', text: 'Siga um plano direto para testar criativos, mensagens e canais sem depender de uma estrutura complexa.' },
      ],
      outcome: 'Você recebe a estratégia da oferta low ticket validada, um roteiro de vendas e um plano prático para transformar produtos baratos em volume.',
    },
    {
      id: 'gold',
      name: 'Rich Gold',
      tagline: 'Sites para vender a negócios locais.',
      icon: 'G',
      tier: 'Construção premium',
      accessLabel: 'Somente Rich Bucks',
      highlight: 'Sites para negócios',
      priceBucks: 1000,
      priceCoins: null,
      pitch: 'Aprenda a criar sites para vender a donos de lojas, padarias, barbeiros, restaurantes e pequenos negócios com uma oferta validada.',
      benefits: ['Sites vendáveis', 'Proposta pronta', 'Clientes locais'],
      modules: [
        { title: '01 · Nichos locais com demanda', text: 'Entenda como abordar lojas, padarias, barbeiros, restaurantes e negócios que precisam aparecer melhor e vender mais.' },
        { title: '02 · Site que gera cliente', text: 'Aprenda estrutura de página, oferta, botão de contato, prova e argumentos que fazem sentido para donos de negócio.' },
        { title: '03 · Oferta validada de criação de sites', text: 'Receba um modelo de proposta, abordagem e entrega para vender sites de forma simples e profissional.' },
      ],
      outcome: 'Você sai com a oferta validada para vender sites a pequenos negócios, roteiro de prospecção e modelo de entrega para fechar clientes reais.',
    },
    {
      id: 'diamond',
      name: 'Rich Diamond',
      tagline: 'Mentoria completa e individual.',
      icon: 'D',
      tier: 'Pacote completo',
      accessLabel: 'Somente Rich Bucks',
      highlight: 'Mentoria individual',
      priceBucks: 2000,
      priceCoins: null,
      pitch: 'A mentoria completa: sites, landing pages, ofertas low ticket, prospecção de clientes e acompanhamento individual para executar com direção.',
      includes: 'Inclui os conteúdos da Rich Starter, Rich Silver e Rich Gold, com visão completa e acompanhamento individual.',
      benefits: ['Starter + Silver + Gold', 'Prospecção', 'Acompanhamento individual'],
      modules: [
        { title: '01 · Sites e landing pages', text: 'Aprenda a criar páginas profissionais para vender serviços, capturar contatos e apresentar ofertas com clareza.' },
        { title: '02 · Low ticket e prospecção', text: 'Monte ofertas de baixo preço, mensagens de abordagem e uma rotina para encontrar e converter clientes.' },
        { title: '03 · Mentoria individual completa', text: 'Receba direção para organizar sua execução, revisar ideias, ajustar ofertas e avançar com acompanhamento próximo.' },
      ],
      outcome: 'Você recebe a trilha completa para criar ofertas, vender sites e landing pages, prospectar clientes e evoluir com acompanhamento individual.',
    },
  ];
  // The browser can submit only a fixed package quantity. Values live here for display and
  // are repeated — and authoritatively enforced — by the server.
  const RICH_BUCKS_PACKS = [
    { id: 'rich-bucks-50', bucks: 50, cents: 5000, brl: 'R$ 50,00' },
    { id: 'rich-bucks-100', bucks: 100, cents: 10000, brl: 'R$ 100,00' },
    { id: 'rich-bucks-250', bucks: 250, cents: 25000, brl: 'R$ 250,00' },
    { id: 'rich-bucks-500', bucks: 500, cents: 50000, brl: 'R$ 500,00' },
  ];
  const FREE_COIN_TASKS = [
    {
      id: 'instagram-rick',
      title: 'Seguir @ricktherichh',
      detail: 'Abra o Instagram do Rick, siga o perfil e depois volte para confirmar sua ação.',
      reward: 250,
      xp: 35,
      icon: '@',
      url: 'https://www.instagram.com/ricktherichh/',
    },
    {
      id: 'save-rich-city',
      title: 'Salvar a jornada TheRichCorp',
      detail: 'Assuma a meta da semana: voltar, farmar e evoluir um pouco por dia.',
      reward: 100,
      xp: 20,
      icon: '✓',
    },
    {
      id: 'share-progress',
      title: 'Compartilhar progresso',
      detail: 'Prepare uma mensagem curta contando sua evolução dentro da Rich City.',
      reward: 150,
      xp: 25,
      icon: '↗',
    },
    {
      id: 'daily-checkin',
      title: 'Check-in diário',
      detail: 'Volte a cada 24 horas para manter sua sequência de evolução.',
      reward: 55,
      xp: 15,
      icon: '24',
      daily: true,
    },
  ];
  const FARM_MISSIONS = [
    { id: 'daily-coins-route', title: 'Ciclo diário de aprendizado', reward: 0, xp: 0, daily: true },
    { id: 'prospection-study', title: 'Estudo de Prospecção', reward: 225, xp: 35 },
    { id: 'challenge-practice', title: 'Prática de Desafio', reward: 275, xp: 40 },
  ];
  const DAILY_LEARNING_REWARD = { coins: 180, xp: 70 };
  const DAILY_REWARD_COIN = { id: 'daily-learning-reward', x: 820, y: 445, range: 62 };
  const DAILY_LEARNING_MODULES = [
    {
      kicker: 'CICLO DIÁRIO · DIGITAL 01',
      title: 'Oferta simples vence ideia complexa',
      text: 'Você quer vender na internet? Comece por uma promessa pequena, fácil de entender e ligada a uma dor real.',
      bullets: [
        'Uma oferta boa diz quem é ajudado, qual resultado recebe e por que isso importa agora.',
        'Evite começar por logo, nome bonito ou tecnologia; comece pela dor que alguém pagaria para resolver.',
        'A pergunta-chave do dia: “qual problema simples eu consigo resolver com clareza?”',
      ],
      question: 'Qual caminho tem mais chance de virar venda?',
      choices: ['Criar algo grande antes de falar com alguém.', 'Resolver uma dor específica com promessa clara.', 'Esperar a ideia perfeita aparecer.'],
      correct: 1,
      feedback: [
        'Construir grande cedo demais pode virar trabalho sem validação.',
        'Correto. Clareza e dor específica deixam a venda muito mais fácil.',
        'Ideias melhoram quando encostam no mercado, não quando ficam paradas.',
      ],
    },
    {
      kicker: 'CICLO DIÁRIO · DIGITAL 02',
      title: 'Página que vende sem enrolar',
      text: 'Uma página simples precisa responder rápido: o que é, para quem é, qual transformação entrega e como comprar.',
      bullets: [
        'Título direto vale mais que frase bonita.',
        'Benefícios devem mostrar resultado prático, não só características.',
        'Um botão claro reduz dúvida e aumenta ação.',
      ],
      question: 'O que uma landing page precisa mostrar primeiro?',
      choices: ['A promessa principal e para quem ela serve.', 'Todos os detalhes técnicos do produto.', 'Uma história longa antes da oferta.'],
      correct: 0,
      feedback: [
        'Correto. A pessoa precisa entender a promessa antes de qualquer detalhe.',
        'Detalhe técnico só ajuda depois que a promessa já ficou clara.',
        'História pode ajudar, mas não deve esconder a oferta.',
      ],
    },
    {
      kicker: 'CICLO DIÁRIO · DIGITAL 03',
      title: 'Teste pequeno muda mentalidade',
      text: 'Quem vende aprende com o mercado. Em vez de adivinhar, faça um teste pequeno: mensagem, oferta, página e resposta real.',
      bullets: [
        'Prospecção é descobrir quem tem a dor agora.',
        'Validação é medir se alguém responde, clica, compra ou pede mais informações.',
        'Aprender rápido evita gastar semanas no caminho errado.',
      ],
      question: 'Qual atitude mais aproxima você de uma venda real?',
      choices: ['Postar uma oferta e medir resposta.', 'Mudar tudo antes de receber feedback.', 'Guardar a ideia até ficar perfeita.'],
      correct: 0,
      feedback: [
        'Correto. Mercado respondendo é aprendizado real.',
        'Mudar sem feedback cria movimento, mas nem sempre cria progresso.',
        'Perfeição antes de teste costuma atrasar a primeira venda.',
      ],
    },
  ];
  const PAYMENTS_API = '/api';
  const GAME_PROGRESS_API = '/api/game-progress';
  const legacyStateKey = 'therichcorp-v3-first-slice';
  const accountSavePrefix = 'therichcorp-v3-account';
  const defaultSave = {
    coins: 0,
    richBucks: 0,
    xp: 0,
    rickIntroduced: false,
    playerName: 'Gabriel',
    initialCoinsCollected: 0,
    dailyCycleStartsAt: null,
    dailyCycleNumber: 0,
    dailyCoinsCollected: 0,
    pendingRichBucksOrder: null,
    playerPosition: null,
    freeCoinMissions: { claimed: {}, opened: {}, dailyCheckinAt: null },
    farmMissions: { claimed: {}, dailyRouteAt: null },
    dailyLearning: { stage: 0, availableAt: null, rewardReady: false, cyclesCompleted: 0, answers: [null, null, null] },
    knowledge: { digital01: false, digital02: false, digital03: false },
    learning: {
      radar: {
        signalsRead: [false, false, false],
        signalAnswers: [null, null, null],
        answers: [null, null, null],
        score: 0,
        completed: false,
        rewardGranted: false,
      },
    },
    unlocks: { radarArchive: false, opportunityHunter: false, digital03: false },
    mentorships: {
      pdfs: { unlocked: false, method: null, unlockedAt: null },
      silver: { unlocked: false, method: null, unlockedAt: null },
      gold: { unlocked: false, method: null, unlockedAt: null },
      diamond: { unlocked: false, method: null, unlockedAt: null },
    },
    missions: {
      prospectionStarted: false,
      prospectionSignals: 0,
      prospectionCompleted: false,
      challengeStarted: false,
      challengeSignals: 0,
      challengeCompleted: false,
    },
  };
  let activeAccount = { mode: 'local', id: 'guest', email: '', name: 'Gabriel', key: `${accountSavePrefix}:local:guest` };
  let activeStateKey = activeAccount.key;
  let saved = readSave(activeStateKey);
  let running = false;
  let lastFrame = 0;
  let smoothedFrameDt = 1 / 60;
  let dpr = 1;
  let view = { width: window.innerWidth, height: window.innerHeight };
  let camera = { x: 0, y: 0 };
  let qualityLevel = detectInitialQuality();
  let quality = QUALITY_PRESETS[qualityLevel];
  let currentFps = 60;
  let performanceHud = null;
  let performanceMonitor = { average: 60, lowFrames: 0, highFrames: 0, cooldown: 0 };
  let staticWorldCache = null;
  let staticWorldCacheLevel = '';
  let staticWorldCacheScale = 1;
  let staticWorldCacheDirty = true;
  let dialogueState = null;
  let knowledgePanelOpen = false;
  let labPanelOpen = false;
  let learningPanelOpen = false;
  let learningState = null;
  let mentorshipPanelOpen = false;
  let mentorshipState = null;
  let bucksStoreOpen = false;
  let bucksStoreState = null;
  let freeCoinsPanelOpen = false;
  let freeCoinsState = null;
  let walletPollTimer = 0;
  let walletPollAttempts = 0;
  let walletSyncInFlight = false;
  let progressSyncTimer = 0;
  let progressSyncInFlight = false;
  let nearby = null;
  let toastTimer = 0;
  let lastPositionPersistedAt = 0;
  let playerPositionDirty = false;
  let worldLabelTimer = 0;
  let audioContext = null;
  let lastStepSoundAt = 0;
  const keys = Object.create(null);

  function detectInitialQuality() {
    const width = window.innerWidth || 1280;
    const height = window.innerHeight || 720;
    const pixels = width * height;
    const ratio = window.devicePixelRatio || 1;
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    const touch = window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : ('ontouchstart' in window);
    if (touch && (memory <= 3 || cores <= 4 || pixels * ratio > 1800000)) return 'low';
    if (memory <= 2 || cores <= 2 || pixels > 1500000 || ratio > 2.4) return 'low';
    if (touch || memory <= 4 || cores <= 4 || pixels > 950000) return 'medium';
    return 'high';
  }

  function setQuality(level, reason = 'auto') {
    if (!QUALITY_PRESETS[level] || level === qualityLevel) return;
    qualityLevel = level;
    quality = QUALITY_PRESETS[level];
    PERFORMANCE.grassClumps = quality.grassClumps;
    PERFORMANCE.terrainGridStep = quality.terrainGridStep;
    PERFORMANCE.roadTileStep = quality.roadTileStep;
    PERFORMANCE.fogBanks = quality.fogBanks;
    staticWorldCacheDirty = true;
    resize();
    updatePerformanceHud(reason);
  }

  function applyQualityPreset() {
    PERFORMANCE.grassClumps = quality.grassClumps;
    PERFORMANCE.terrainGridStep = quality.terrainGridStep;
    PERFORMANCE.roadTileStep = quality.roadTileStep;
    PERFORMANCE.fogBanks = quality.fogBanks;
  }

  function recordPerformance(rawDt) {
    if (!rawDt || rawDt <= 0) return;
    const instant = clamp(1 / rawDt, 1, 144);
    currentFps = lerp(currentFps || instant, instant, .08);
    performanceMonitor.average = lerp(performanceMonitor.average || instant, instant, .045);
    performanceMonitor.cooldown = Math.max(0, performanceMonitor.cooldown - rawDt);
    if (performanceMonitor.cooldown > 0) {
      updatePerformanceHud();
      return;
    }
    if (performanceMonitor.average < 44 && qualityLevel !== 'low') {
      performanceMonitor.lowFrames += 1;
      performanceMonitor.highFrames = 0;
      if (performanceMonitor.lowFrames > 90) {
        setQuality(qualityLevel === 'high' ? 'medium' : 'low', 'fps');
        performanceMonitor.cooldown = 8;
        performanceMonitor.lowFrames = 0;
      }
    } else if (performanceMonitor.average > 58 && qualityLevel !== 'high') {
      performanceMonitor.highFrames += 1;
      performanceMonitor.lowFrames = 0;
      if (performanceMonitor.highFrames > 420) {
        setQuality(qualityLevel === 'low' ? 'medium' : 'high', 'fps+');
        performanceMonitor.cooldown = 10;
        performanceMonitor.highFrames = 0;
      }
    } else {
      performanceMonitor.lowFrames = Math.max(0, performanceMonitor.lowFrames - 1);
      performanceMonitor.highFrames = Math.max(0, performanceMonitor.highFrames - 1);
    }
    updatePerformanceHud();
  }

  function createPerformanceHud() {
    if (performanceHud) return;
    performanceHud = document.createElement('div');
    performanceHud.id = 'performance-hud';
    performanceHud.setAttribute('aria-hidden', 'true');
    performanceHud.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:80;padding:7px 9px;border:1px solid rgba(245,190,70,.28);border-radius:10px;background:rgba(4,5,10,.68);color:#f5d37a;font:800 10px/1.25 system-ui;letter-spacing:.08em;text-transform:uppercase;pointer-events:none;opacity:.72;display:none';
    document.body.appendChild(performanceHud);
  }

  function shouldShowPerformanceHud() {
    return /(?:[?&]perf=1\b|[?&]debug=1\b)/.test(location.search) || localStorage.getItem('therichcorp-show-performance') === '1';
  }

  function updatePerformanceHud(reason = '') {
    createPerformanceHud();
    if (!shouldShowPerformanceHud()) {
      performanceHud.style.display = 'none';
      return;
    }
    performanceHud.style.display = 'block';
    performanceHud.textContent = `${Math.round(currentFps)} FPS · ${quality.label}${reason ? ` · ${reason}` : ''} · DPR ${dpr.toFixed(2)}`;
  }

  applyQualityPreset();

  const savedPosition = saved.playerPosition;
  const player = {
    x: savedPosition ? savedPosition.x : 820,
    y: savedPosition ? savedPosition.y : 970,
    radius: 18,
    facing: 'up',
    walkCycle: 0,
    idleCycle: 0,
    isWalking: false,
    sprint: false,
  };

  const buildings = [
    { id: 'hq', name: 'Sede The Rich Corp', x: 820, y: 158, w: 340, h: 232, theme: 'gold', prompt: 'Visitar a sede', door: { x: 820, y: 315 }, body: { x: 650, y: 30, w: 340, h: 250 }, text: 'A sede é o coração da cidade. Rick está na alameda ao lado para iniciar sua jornada.' },
    { id: 'lab', name: 'Digital Lab', x: 290, y: 405, w: 260, h: 168, theme: 'blue', prompt: 'Entrar no Digital Lab', door: { x: 290, y: 520 }, body: { x: 160, y: 330, w: 260, h: 165 }, text: 'O Digital Lab será liberado depois dos primeiros conhecimentos.' },
    { id: 'prospection', name: 'Prospecção', x: 1350, y: 405, w: 260, h: 168, theme: 'purple', prompt: 'Conhecer Prospecção', door: { x: 1350, y: 520 }, body: { x: 1220, y: 330, w: 260, h: 165 }, text: 'Aqui você encontrará novas oportunidades quando estiver pronto.' },
    { id: 'content', name: 'Conteúdos', x: 300, y: 895, w: 260, h: 172, theme: 'green', prompt: 'Acessar Conteúdos', door: { x: 300, y: 780 }, body: { x: 170, y: 805, w: 260, h: 170 }, text: 'A biblioteca de conhecimentos abrirá após falar com Rick e encontrar sua primeira moeda.' },
    { id: 'bucks-store', name: 'Loja Rich Bucks', x: 1020, y: 900, w: 220, h: 150, theme: 'purple', prompt: 'Acessar Loja Rich Bucks', door: { x: 1020, y: 780 }, body: { x: 910, y: 820, w: 220, h: 150 }, text: 'Aqui você pode adicionar Rich Bucks à carteira usando um checkout PIX seguro.' },
    { id: 'challenges', name: 'Desafios', x: 1340, y: 895, w: 260, h: 172, theme: 'red', prompt: 'Ver Desafios', door: { x: 1340, y: 780 }, body: { x: 1210, y: 805, w: 260, h: 170 }, text: 'Desafios especiais serão liberados conforme a sua evolução.' },
  ];

  const roads = [
    { a: { x: 820, y: 292 }, b: { x: 820, y: 1010 }, width: 132 },
    { a: { x: 185, y: 575 }, b: { x: 1455, y: 575 }, width: 128 },
    { a: { x: 230, y: 760 }, b: { x: 1410, y: 760 }, width: 110 },
    { a: { x: 290, y: 510 }, b: { x: 290, y: 575 }, width: 86 },
    { a: { x: 1350, y: 510 }, b: { x: 1350, y: 575 }, width: 86 },
    { a: { x: 300, y: 760 }, b: { x: 300, y: 798 }, width: 86 },
    { a: { x: 1020, y: 760 }, b: { x: 1020, y: 816 }, width: 86 },
    { a: { x: 1340, y: 760 }, b: { x: 1340, y: 798 }, width: 86 },
  ];
  const plaza = { x: 820, y: 575, radius: 132 };
  const fountain = { x: 820, y: 575, radius: 52 };
  const rick = { id: 'rick', x: 882, y: 365, range: 66, prompt: 'Falar com Rick' };
  const freeCoinsTerminal = { id: 'free-coins-terminal', x: 640, y: 760, range: 64, prompt: 'Ganhe Rich Coins grátis' };
  // The first five coins deliberately lead the player through safe street routes.
  // Only one is visible at a time, so discovery feels like a small route rather than a click-list.
  const initialCoinRoute = [
    { id: 'initial-1', x: 820, y: 445, label: 'Alameda da sede' },
    { id: 'initial-2', x: 700, y: 575, label: 'Praça central' },
    { id: 'initial-3', x: 500, y: 575, label: 'Rua oeste' },
    { id: 'initial-4', x: 350, y: 575, label: 'Entrada do Digital Lab' },
    { id: 'initial-5', x: 300, y: 760, label: 'Caminho de Conteúdos' },
  ];
  // Each new day rotates through a different street route. The cycle still exposes
  // one coin at a time and never places a reward outside the walkable network.
  const dailyCoinRoutes = [
    [
      { id: 'daily-a-1', x: 940, y: 575 }, { id: 'daily-a-2', x: 1120, y: 575 },
      { id: 'daily-a-3', x: 1270, y: 575 }, { id: 'daily-a-4', x: 1270, y: 760 },
      { id: 'daily-a-5', x: 820, y: 900 },
    ],
    [
      { id: 'daily-b-1', x: 820, y: 680 }, { id: 'daily-b-2', x: 700, y: 575 },
      { id: 'daily-b-3', x: 600, y: 760 }, { id: 'daily-b-4', x: 350, y: 575 },
      { id: 'daily-b-5', x: 300, y: 760 },
    ],
    [
      { id: 'daily-c-1', x: 820, y: 900 }, { id: 'daily-c-2', x: 500, y: 575 },
      { id: 'daily-c-3', x: 940, y: 575 }, { id: 'daily-c-4', x: 1120, y: 575 },
      { id: 'daily-c-5', x: 1270, y: 760 },
    ],
  ];
  // Mission beacons make a readable loop through separate avenues. Daily coins yield
  // the street while one of these focused routes is active, so prompts never compete.
  const prospectionSignalRoute = [
    { id: 'prospection-1', x: 1020, y: 620, label: 'Sinal do setor leste' },
    { id: 'prospection-2', x: 820, y: 760, label: 'Sinal da praça sul' },
    { id: 'prospection-3', x: 560, y: 790, label: 'Sinal do setor oeste' },
  ];
  const challengeSignalRoute = [
    { id: 'challenge-1', x: 1060, y: 790, label: 'Ponto de execução' },
    { id: 'challenge-2', x: 820, y: 445, label: 'Ponto de decisão' },
    { id: 'challenge-3', x: 500, y: 575, label: 'Ponto de estratégia' },
  ];
  const lampPosts = [
    { x: 742, y: 375 }, { x: 900, y: 375 }, { x: 660, y: 575 }, { x: 980, y: 575 },
    { x: 580, y: 575 }, { x: 1060, y: 575 }, { x: 500, y: 760 }, { x: 1140, y: 760 },
    { x: 680, y: 760 }, { x: 960, y: 760 }, { x: 290, y: 665 }, { x: 1350, y: 665 },
  ];
  const scenery = makeScenery();

  function cloneDefaultSave() {
    return JSON.parse(JSON.stringify(defaultSave));
  }

  function readRawSave(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; }
  }

  function writeRawSave(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* Storage can be unavailable in restricted previews. */ }
  }

  function safeAccountPart(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return 'guest';
    try { return encodeURIComponent(normalized).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`); }
    catch (_) { return normalized.replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'guest'; }
  }

  function accountFromAuth({ mode = 'local', id = '', email = '', name = '' } = {}) {
    const cleanMode = mode === 'online' ? 'online' : 'local';
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(name || '').trim() || cleanEmail.split('@')[0] || 'Gabriel';
    const cleanId = String(id || cleanEmail || cleanName || 'guest').trim().toLowerCase();
    return {
      mode: cleanMode,
      id: cleanId || 'guest',
      email: cleanEmail,
      name: cleanName,
      key: `${accountSavePrefix}:${cleanMode}:${safeAccountPart(cleanId || cleanEmail || cleanName)}`,
    };
  }

  function displayNameMatchesAccount(rawSave, account) {
    const savedName = String(rawSave && rawSave.playerName || '').trim().toLowerCase();
    if (!savedName) return false;
    const accountName = String(account.name || '').trim().toLowerCase();
    const emailName = String(account.email || '').split('@')[0].replace(/[._-]+/g, ' ').trim().toLowerCase();
    return savedName === accountName || (emailName && savedName === emailName);
  }

  function activateAccount(account) {
    activeAccount = accountFromAuth(account);
    activeStateKey = activeAccount.key;
    const existing = readRawSave(activeStateKey);
    const legacy = readRawSave(legacyStateKey);
    if (!existing && legacy && displayNameMatchesAccount(legacy, activeAccount)) {
      const migrated = { ...legacy, account: { mode: activeAccount.mode, id: activeAccount.id, email: activeAccount.email, migratedFrom: legacyStateKey, migratedAt: Date.now() } };
      writeRawSave(activeStateKey, migrated);
    }
    saved = readSave(activeStateKey);
    saved.account = { mode: activeAccount.mode, id: activeAccount.id, email: activeAccount.email };
  }

  function readSave(key = activeStateKey) {
    try {
      const value = readRawSave(key);
      const supplied = value || {};
      const next = { ...cloneDefaultSave(), ...supplied };
      // Keep progress from the earlier one-coin prototype instead of discarding it.
      if (supplied.initialCoinsCollected == null && supplied.coinCollected) {
        next.initialCoinsCollected = 1;
        next.coins = Math.max(Number(next.coins) || 0, INITIAL_COIN_REWARD.coins);
        next.xp = Math.max(Number(next.xp) || 0, INITIAL_COIN_REWARD.xp);
      }
      next.initialCoinsCollected = clamp(Math.floor(Number(next.initialCoinsCollected) || 0), 0, INITIAL_COIN_COUNT);
      next.dailyCoinsCollected = clamp(Math.floor(Number(next.dailyCoinsCollected) || 0), 0, DAILY_COIN_COUNT);
      next.dailyCycleNumber = Math.max(0, Math.floor(Number(next.dailyCycleNumber) || 0));
      next.richBucks = Math.max(0, Math.floor(Number(next.richBucks) || 0));
      next.pendingRichBucksOrder = typeof supplied.pendingRichBucksOrder === 'string' && supplied.pendingRichBucksOrder.length <= 160
        ? supplied.pendingRichBucksOrder
        : null;
      const rawDailyStart = next.dailyCycleStartsAt;
      next.dailyCycleStartsAt = rawDailyStart == null || rawDailyStart === '' || !Number.isFinite(Number(rawDailyStart)) ? null : Number(rawDailyStart);
      const rawPosition = supplied.playerPosition;
      next.playerPosition = rawPosition && Number.isFinite(Number(rawPosition.x)) && Number.isFinite(Number(rawPosition.y))
        ? { x: clamp(Number(rawPosition.x), 52, WORLD.width - 52), y: clamp(Number(rawPosition.y), 52, WORLD.height - 52) }
        : null;
      const suppliedFreeMissions = supplied.freeCoinMissions && typeof supplied.freeCoinMissions === 'object' ? supplied.freeCoinMissions : {};
      const suppliedClaimed = suppliedFreeMissions.claimed && typeof suppliedFreeMissions.claimed === 'object' ? suppliedFreeMissions.claimed : {};
      const suppliedOpened = suppliedFreeMissions.opened && typeof suppliedFreeMissions.opened === 'object' ? suppliedFreeMissions.opened : {};
      const rawCheckinAt = Number(suppliedFreeMissions.dailyCheckinAt);
      next.freeCoinMissions = {
        claimed: {},
        opened: {},
        dailyCheckinAt: Number.isFinite(rawCheckinAt) && rawCheckinAt > 0 ? rawCheckinAt : null,
      };
      FREE_COIN_TASKS.forEach((task) => {
        if (!task.daily) next.freeCoinMissions.claimed[task.id] = Boolean(suppliedClaimed[task.id]);
        next.freeCoinMissions.opened[task.id] = Boolean(suppliedOpened[task.id]);
      });
      const suppliedFarm = supplied.farmMissions && typeof supplied.farmMissions === 'object' ? supplied.farmMissions : {};
      const suppliedFarmClaimed = suppliedFarm.claimed && typeof suppliedFarm.claimed === 'object' ? suppliedFarm.claimed : {};
      const rawDailyRouteAt = Number(suppliedFarm.dailyRouteAt);
      next.farmMissions = {
        claimed: {},
        dailyRouteAt: Number.isFinite(rawDailyRouteAt) && rawDailyRouteAt > 0 ? rawDailyRouteAt : null,
      };
      FARM_MISSIONS.forEach((mission) => {
        if (!mission.daily) next.farmMissions.claimed[mission.id] = Boolean(suppliedFarmClaimed[mission.id]);
      });
      const suppliedDailyLearning = supplied.dailyLearning && typeof supplied.dailyLearning === 'object' ? supplied.dailyLearning : {};
      const rawDailyLearningAt = Number(suppliedDailyLearning.availableAt);
      next.dailyLearning = {
        stage: clamp(Math.floor(Number(suppliedDailyLearning.stage) || 0), 0, DAILY_LEARNING_MODULES.length - 1),
        availableAt: Number.isFinite(rawDailyLearningAt) && rawDailyLearningAt > 0 ? rawDailyLearningAt : null,
        rewardReady: Boolean(suppliedDailyLearning.rewardReady),
        cyclesCompleted: Math.max(0, Math.floor(Number(suppliedDailyLearning.cyclesCompleted) || 0)),
        answers: Array.from({ length: DAILY_LEARNING_MODULES.length }, (_, index) => Array.isArray(suppliedDailyLearning.answers) ? suppliedDailyLearning.answers[index] ?? null : null),
      };
      if (next.initialCoinsCollected >= INITIAL_COIN_COUNT && !next.dailyCycleStartsAt) next.dailyCycleStartsAt = null;
      next.knowledge = { digital01: false, digital02: false, digital03: false, ...(supplied.knowledge || {}) };
      next.knowledge.digital01 = Boolean(next.knowledge.digital01);
      next.knowledge.digital02 = Boolean(next.knowledge.digital02) && next.knowledge.digital01;
      next.knowledge.digital03 = Boolean(next.knowledge.digital03) && next.knowledge.digital02;
      next.missions = {
        prospectionStarted: false,
        prospectionSignals: 0,
        prospectionCompleted: false,
        challengeStarted: false,
        challengeSignals: 0,
        challengeCompleted: false,
        ...(supplied.missions || {}),
      };
      next.missions.prospectionStarted = Boolean(next.missions.prospectionStarted);
      next.missions.prospectionSignals = clamp(Math.floor(Number(next.missions.prospectionSignals) || 0), 0, PROSPECTION_SIGNAL_COUNT);
      next.missions.prospectionCompleted = Boolean(next.missions.prospectionCompleted) || next.missions.prospectionSignals >= PROSPECTION_SIGNAL_COUNT;
      if (next.missions.prospectionCompleted) { next.missions.prospectionStarted = true; next.missions.prospectionSignals = PROSPECTION_SIGNAL_COUNT; }
      next.missions.challengeStarted = Boolean(next.missions.challengeStarted) && next.missions.prospectionCompleted;
      next.missions.challengeSignals = clamp(Math.floor(Number(next.missions.challengeSignals) || 0), 0, CHALLENGE_SIGNAL_COUNT);
      next.missions.challengeCompleted = Boolean(next.missions.challengeCompleted) || next.missions.challengeSignals >= CHALLENGE_SIGNAL_COUNT;
      if (next.missions.challengeCompleted) {
        next.missions.prospectionStarted = true;
        next.missions.prospectionCompleted = true;
        next.missions.prospectionSignals = PROSPECTION_SIGNAL_COUNT;
        next.missions.challengeStarted = true;
        next.missions.challengeSignals = CHALLENGE_SIGNAL_COUNT;
        next.knowledge.digital03 = true;
      }
      // Learning progress mirrors mission progress, while keeping every answer
      // and the bonus reward safe across reloads and old saves.
      const suppliedRadar = supplied.learning && supplied.learning.radar ? supplied.learning.radar : {};
      const suppliedSignalAnswers = Array.isArray(suppliedRadar.signalAnswers) ? suppliedRadar.signalAnswers : [];
      const suppliedAnswers = Array.isArray(suppliedRadar.answers) ? suppliedRadar.answers : [];
      const signalsRead = Array.from({ length: PROSPECTION_SIGNAL_COUNT }, (_, index) => Boolean(suppliedRadar.signalsRead && suppliedRadar.signalsRead[index]) || index < next.missions.prospectionSignals);
      const signalAnswers = Array.from({ length: PROSPECTION_SIGNAL_COUNT }, (_, index) => {
        const rawAnswer = suppliedSignalAnswers[index];
        const answer = rawAnswer == null ? NaN : Number(rawAnswer);
        return Number.isInteger(answer) && answer >= 0 && answer < RADAR_LESSONS[index].choices.length ? answer : null;
      });
      const challengeAnswers = Array.from({ length: CHALLENGE_SIGNAL_COUNT }, (_, index) => {
        const rawAnswer = suppliedAnswers[index];
        const answer = rawAnswer == null ? NaN : Number(rawAnswer);
        return Number.isInteger(answer) && answer >= 0 && answer < CHALLENGE_DECISIONS[index].choices.length ? answer : null;
      });
      const score = challengeAnswers.reduce((total, answer, index) => total + (answer === CHALLENGE_DECISIONS[index].correct ? 1 : 0), 0);
      next.learning = {
        radar: {
          signalsRead,
          signalAnswers,
          answers: challengeAnswers,
          score,
          completed: Boolean(suppliedRadar.completed) || next.missions.challengeCompleted,
          rewardGranted: Boolean(suppliedRadar.rewardGranted) || next.missions.challengeCompleted,
        },
      };
      next.unlocks = { radarArchive: false, opportunityHunter: false, digital03: false, ...(supplied.unlocks || {}) };
      next.unlocks.radarArchive = Boolean(next.unlocks.radarArchive) || next.missions.prospectionCompleted;
      next.unlocks.opportunityHunter = Boolean(next.unlocks.opportunityHunter) || (next.missions.challengeCompleted && score === CHALLENGE_SIGNAL_COUNT);
      next.unlocks.digital03 = Boolean(next.unlocks.digital03) || next.knowledge.digital03;
      const suppliedMentorships = supplied.mentorships && typeof supplied.mentorships === 'object' ? supplied.mentorships : {};
      next.mentorships = {};
      MENTORSHIPS.forEach((mentorship) => {
        const rawMentorship = suppliedMentorships[mentorship.id];
        const unlocked = rawMentorship === true || Boolean(rawMentorship && rawMentorship.unlocked);
        const method = rawMentorship && (rawMentorship.method === 'coins' || rawMentorship.method === 'bucks') ? rawMentorship.method : null;
        const rawUnlockedAtValue = rawMentorship && rawMentorship.unlockedAt;
        const rawUnlockedAt = rawUnlockedAtValue == null ? NaN : Number(rawUnlockedAtValue);
        next.mentorships[mentorship.id] = {
          unlocked,
          method,
          unlockedAt: Number.isFinite(rawUnlockedAt) ? rawUnlockedAt : null,
        };
      });
      delete next.coinCollected;
      return next;
    } catch (_) { return cloneDefaultSave(); }
  }
  function persist() {
    saved.account = { mode: activeAccount.mode, id: activeAccount.id, email: activeAccount.email };
    try { localStorage.setItem(activeStateKey, JSON.stringify(saved)); } catch (_) { /* Local files may block storage; the game still works this session. */ }
    scheduleOnlineProgressSync();
  }

  function persistPlayerPosition(force = false) {
    if (!playerPositionDirty && !force) return;
    const now = Date.now();
    if (!force && now - lastPositionPersistedAt < 750) return;
    saved.playerPosition = { x: Math.round(player.x), y: Math.round(player.y) };
    persist();
    lastPositionPersistedAt = now;
    playerPositionDirty = false;
  }

  function getAudioContext() {
    if (audioContext) return audioContext;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return null;
    try { audioContext = new Audio(); } catch (_) { audioContext = null; }
    return audioContext;
  }

  function unlockAudio() {
    const audio = getAudioContext();
    if (audio && audio.state === 'suspended') audio.resume().catch(() => {});
  }

  function playTone({ frequency = 440, duration = .08, type = 'sine', gain = .035, slideTo = null } = {}) {
    const audio = getAudioContext();
    if (!audio || audio.state === 'suspended') return;
    const now = audio.currentTime;
    const oscillator = audio.createOscillator();
    const volume = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    volume.gain.setValueAtTime(0.0001, now);
    volume.gain.exponentialRampToValueAtTime(gain, now + .012);
    volume.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(volume);
    volume.connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + .02);
  }

  function playSound(name) {
    unlockAudio();
    if (name === 'coin') {
      playTone({ frequency: 880, slideTo: 1320, duration: .12, type: 'triangle', gain: .05 });
      window.setTimeout(() => playTone({ frequency: 1320, duration: .08, type: 'sine', gain: .035 }), 70);
    } else if (name === 'reward') {
      playTone({ frequency: 660, slideTo: 990, duration: .1, type: 'triangle', gain: .045 });
      window.setTimeout(() => playTone({ frequency: 1180, duration: .11, type: 'sine', gain: .035 }), 95);
    } else if (name === 'open') {
      playTone({ frequency: 340, slideTo: 520, duration: .09, type: 'sine', gain: .032 });
    } else if (name === 'close') {
      playTone({ frequency: 360, slideTo: 220, duration: .08, type: 'sine', gain: .025 });
    } else if (name === 'denied') {
      playTone({ frequency: 180, slideTo: 130, duration: .11, type: 'sawtooth', gain: .018 });
    } else if (name === 'select') {
      playTone({ frequency: 520, duration: .045, type: 'triangle', gain: .018 });
    } else if (name === 'step') {
      playTone({ frequency: 92, duration: .035, type: 'sine', gain: .012 });
    }
  }

  function hasCompletedInitialRoute() {
    return saved.initialCoinsCollected >= INITIAL_COIN_COUNT;
  }

  function hasDigital01() {
    return Boolean(saved.knowledge && saved.knowledge.digital01);
  }

  function hasDigital02() {
    return Boolean(saved.knowledge && saved.knowledge.digital02);
  }

  function hasDigital03() {
    return Boolean(saved.knowledge && saved.knowledge.digital03);
  }

  function hasCompletedProspection() {
    return Boolean(saved.missions && saved.missions.prospectionCompleted);
  }

  function hasCompletedChallenge() {
    return Boolean(saved.missions && saved.missions.challengeCompleted);
  }

  function getRadarLearning() {
    return saved.learning.radar;
  }

  function getChallengeScore() {
    return getRadarLearning().answers.reduce((total, answer, index) => total + (answer === CHALLENGE_DECISIONS[index].correct ? 1 : 0), 0);
  }

  function hasOpportunityHunterTitle() {
    return Boolean(saved.unlocks && saved.unlocks.opportunityHunter);
  }

  function getMentorship(id) {
    return MENTORSHIPS.find((mentorship) => mentorship.id === id) || null;
  }

  function getStarterMentorship() {
    return getMentorship('pdfs');
  }

  function getStarterDailyPlan() {
    const dailyRouteReward = DAILY_LEARNING_REWARD.coins;
    const dailyCheckinReward = (FREE_COIN_TASKS.find((task) => task.id === 'daily-checkin') || {}).reward || 0;
    const dailyTotal = dailyRouteReward + dailyCheckinReward;
    const starter = getStarterMentorship();
    const target = starter ? starter.priceCoins : 5000;
    return { dailyRouteReward, dailyCheckinReward, dailyTotal, target };
  }

  function getDailyLearning() {
    if (!saved.dailyLearning) saved.dailyLearning = cloneDefaultSave().dailyLearning;
    return saved.dailyLearning;
  }

  function isDailyLearningUnlocked() {
    return hasDigital03();
  }

  function isDailyLearningAvailable(now = Date.now()) {
    const daily = getDailyLearning();
    return isDailyLearningUnlocked() && !daily.rewardReady && (!daily.availableAt || now >= daily.availableAt);
  }

  function getDailyLearningStage() {
    const daily = getDailyLearning();
    return DAILY_LEARNING_MODULES[clamp(Math.floor(Number(daily.stage) || 0), 0, DAILY_LEARNING_MODULES.length - 1)];
  }

  function getDailyLearningDestination() {
    const daily = getDailyLearning();
    const stage = clamp(Math.floor(Number(daily.stage) || 0), 0, DAILY_LEARNING_MODULES.length - 1);
    if (stage === 1) return { buildingId: 'lab', label: 'Digital Lab' };
    return { buildingId: 'content', label: stage === 0 ? 'Conteúdos' : 'Conteúdos · Digital 03' };
  }

  function canUseDailyLearningAt(buildingId) {
    if (!isDailyLearningAvailable()) return false;
    return getDailyLearningDestination().buildingId === buildingId;
  }

  function openDailyLearningPanel() {
    if (!isDailyLearningAvailable()) return false;
    const daily = getDailyLearning();
    Object.keys(keys).forEach((key) => { keys[key] = false; });
    learningState = { kind: 'daily', index: clamp(Math.floor(Number(daily.stage) || 0), 0, DAILY_LEARNING_MODULES.length - 1), phase: 'question', selected: null };
    learningPanelOpen = true;
    updateLearningPanel();
    learningPanel.hidden = false;
    prompt.hidden = true;
    playSound('open');
    return true;
  }

  function completeDailyLearning(index, answer) {
    const daily = getDailyLearning();
    if (!isDailyLearningAvailable() || daily.stage !== index) return;
    daily.answers[index] = answer;
    saved.xp += 18;
    if (index + 1 >= DAILY_LEARNING_MODULES.length) {
      daily.stage = 0;
      daily.rewardReady = true;
      playSound('reward');
      showToast('Ciclo diário concluído · recompensa no centro do mapa');
      openDialogue([
        { speaker: 'THE RICH CITY', portrait: 'R', text: `Ciclo diário concluído. Sua recompensa de ${DAILY_LEARNING_REWARD.coins} Rich Coins apareceu no centro do mapa.` },
        { speaker: 'RICK', portrait: 'R', text: 'É assim que você farma de verdade: aprende uma ideia prática, aplica mentalidade de venda e coleta a recompensa caminhando até ela.' },
      ]);
    } else {
      daily.stage = index + 1;
      const destination = getDailyLearningDestination();
      showToast(`Digital ${index + 1} concluído · vá para ${destination.label}`);
    }
    persist();
    updateHud();
  }

  function getMentorshipAccess(id) {
    const record = saved.mentorships && saved.mentorships[id];
    const direct = Boolean(record && record.unlocked);
    const viaDiamond = id !== 'diamond' && Boolean(saved.mentorships && saved.mentorships.diamond && saved.mentorships.diamond.unlocked);
    return { unlocked: direct || viaDiamond, viaDiamond: !direct && viaDiamond, record: record || null };
  }

  function getUnlockedMentorships() {
    return MENTORSHIPS.filter((mentorship) => getMentorshipAccess(mentorship.id).unlocked);
  }

  function formatAmount(value) {
    return new Intl.NumberFormat('pt-BR').format(Math.max(0, Math.floor(Number(value) || 0)));
  }

  function getActiveMissionObjective() {
    if (!hasDigital02() || !saved.missions) return null;
    if (saved.missions.prospectionStarted && !hasCompletedProspection()) {
      const signal = prospectionSignalRoute[saved.missions.prospectionSignals];
      return signal ? { ...signal, kind: 'prospection-signal', range: 58, order: saved.missions.prospectionSignals + 1, total: PROSPECTION_SIGNAL_COUNT, prompt: `Analisar oportunidade · ${saved.missions.prospectionSignals + 1}/${PROSPECTION_SIGNAL_COUNT}` } : null;
    }
    if (saved.missions.challengeStarted && !hasCompletedChallenge()) {
      const signal = challengeSignalRoute[saved.missions.challengeSignals];
      return signal ? { ...signal, kind: 'challenge-signal', range: 58, order: saved.missions.challengeSignals + 1, total: CHALLENGE_SIGNAL_COUNT, prompt: `Executar ponto do desafio · ${saved.missions.challengeSignals + 1}/${CHALLENGE_SIGNAL_COUNT}` } : null;
    }
    return null;
  }

  function getDailyRoute() {
    return dailyCoinRoutes[saved.dailyCycleNumber % dailyCoinRoutes.length];
  }

  function refreshDailyCycle(now = Date.now()) {
    if (!isDailyLearningUnlocked()) return false;
    const daily = getDailyLearning();
    if (!daily.rewardReady && daily.availableAt && daily.availableAt <= now && daily.stage !== 0) {
      daily.stage = 0;
      persist();
      return true;
    }
    return false;
  }

  function getActiveCoin() {
    if (!saved.rickIntroduced) return null;
    if (!hasCompletedInitialRoute()) {
      const coin = initialCoinRoute[saved.initialCoinsCollected];
      return coin ? { ...coin, kind: 'coin', stage: 'initial', order: saved.initialCoinsCollected + 1, total: INITIAL_COIN_COUNT, range: 58, prompt: `Coletar Rich Coin · ${saved.initialCoinsCollected + 1}/${INITIAL_COIN_COUNT}` } : null;
    }
    const daily = getDailyLearning();
    if (daily.rewardReady) {
      return { ...DAILY_REWARD_COIN, kind: 'coin', stage: 'daily-reward', order: 1, total: 1, prompt: `Coletar recompensa diária · +${DAILY_LEARNING_REWARD.coins} Rich Coins` };
    }
    return null;
  }

  function formatRemaining(ms) {
    const remaining = Math.max(0, ms);
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return hours ? `${hours}h ${minutes}min` : `${minutes}min`;
  }

  async function startGame(name, account) {
    activateAccount(account || { mode: 'local', id: name || 'guest', name: name || 'Gabriel' });
    await loadOnlineAccountProgress();
    if (name) saved.playerName = name;
    const savedPosition = saved.playerPosition;
    player.x = savedPosition ? savedPosition.x : 820;
    player.y = savedPosition ? savedPosition.y : 970;
    player.facing = 'up';
    player.walkCycle = 0;
    player.isWalking = false;
    player.sprint = false;
    playerPositionDirty = false;
    lastPositionPersistedAt = 0;
    // Never restore an old or corrupt position into grass, a building, or the fountain.
    if (!canStand(player)) {
      player.x = 820;
      player.y = 970;
      playerPositionDirty = true;
    }
    persistPlayerPosition(true);
    persist();
    portal.hidden = true;
    transition.hidden = false;
    window.setTimeout(() => {
      transition.hidden = true;
      gameScreen.hidden = false;
      $('#hud-player-name').textContent = saved.playerName;
      updateHud();
      // Rich Bucks shown in the HUD are only a local display cache. When the
      // player has an authenticated online account, the server refreshes it
      // from the wallet before any paid mentorship can be redeemed.
      void syncOnlineWallet({ quiet: true, checkReturn: true });
      resize();
      camera.x = clamp(player.x - view.width / 2, 0, Math.max(0, WORLD.width - view.width));
      camera.y = clamp(player.y - view.height / 2, 0, Math.max(0, WORLD.height - view.height));
      running = true;
      lastFrame = performance.now();
      requestAnimationFrame(loop);
    }, 1250);
  }

  function setupLogin() {
    const form = $('#login-form');
    const message = $('#form-message');
    const password = $('#password');
    const email = $('#email');
    const remember = $('#remember');
    const environmentNote = $('#login-environment-note');
    const submit = form.querySelector('button[type="submit"]');
    const displayName = (address, user) => {
      const profileName = user && user.user_metadata && typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name.trim() : '';
      if (profileName) return profileName;
      const rawName = String(address || (user && user.email) || 'Gabriel').split('@')[0].replace(/[._-]+/g, ' ').trim();
      return rawName ? rawName[0].toUpperCase() + rawName.slice(1) : 'Gabriel';
    };
    const accountForEmail = (address, name) => accountFromAuth({ mode: 'local', id: String(address || '').trim().toLowerCase(), email: address, name });
    const accountForUser = (user, fallbackEmail, name) => accountFromAuth({
      mode: 'online',
      id: user && user.id ? user.id : fallbackEmail,
      email: user && user.email ? user.email : fallbackEmail,
      name,
    });
    const onlineAuthAvailable = async () => {
      if (!window.TheRichAuth || typeof window.TheRichAuth.isConfigured !== 'function') return false;
      try { return Boolean(await window.TheRichAuth.isConfigured()); } catch (_) { return false; }
    };
    const formError = (error, fallback) => {
      message.textContent = error && error.message ? error.message : fallback;
    };
    $('#password-toggle').addEventListener('click', () => {
      const visible = password.type === 'text';
      password.type = visible ? 'password' : 'text';
      $('#password-toggle').textContent = visible ? 'Mostrar' : 'Ocultar';
    });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!email.value.trim() || !password.value.trim()) {
        message.textContent = 'Informe e-mail e senha para entrar.';
        return;
      }
      if (await onlineAuthAvailable()) {
        if (submit) submit.disabled = true;
        message.textContent = 'Verificando seu acesso seguro…';
        try {
          const session = await window.TheRichAuth.signIn({ email: email.value.trim(), password: password.value, remember: Boolean(remember && remember.checked) });
          const user = session.user || await window.TheRichAuth.getUser();
          const name = displayName(email.value, user);
          await startGame(name, accountForUser(user, email.value, name));
        } catch (error) {
          formError(error, 'Não foi possível entrar com esta conta.');
        } finally {
          if (submit) submit.disabled = false;
        }
        return;
      }
      {
        const name = displayName(email.value);
        await startGame(name, accountForEmail(email.value, name));
      }
    });
    $('#google-login').addEventListener('click', () => {
      // Keep the local prototype instant while the published version uses the
      // actual Google OAuth redirect supplied by the online auth bridge.
      if (!window.TheRichAuth || typeof window.TheRichAuth.isConfigured !== 'function') {
        void startGame('Gabriel', accountFromAuth({ mode: 'local', id: 'google-demo', name: 'Gabriel' }));
        return;
      }
      (async () => {
        if (!await onlineAuthAvailable()) { await startGame('Gabriel', accountFromAuth({ mode: 'local', id: 'google-demo', name: 'Gabriel' })); return; }
        message.textContent = 'Abrindo o Google para confirmar sua conta…';
        try { await window.TheRichAuth.signInWithGoogle(); } catch (error) { formError(error, 'Não foi possível iniciar o login com Google.'); }
      })();
    });
    $('#signup').addEventListener('click', async () => {
      if (!email.value.trim() || !password.value.trim()) {
        message.textContent = 'Preencha e-mail e senha acima para criar a sua conta.';
        email.focus();
        return;
      }
      if (await onlineAuthAvailable()) {
        message.textContent = 'Criando sua conta…';
        try {
          const result = await window.TheRichAuth.signUp({ email: email.value.trim(), password: password.value, remember: Boolean(remember && remember.checked) });
          if (result.session) {
            const name = displayName(email.value, result.user);
            await startGame(name, accountForUser(result.user, email.value, name));
          }
          else message.textContent = 'Conta criada. Confirme o e-mail enviado para liberar o acesso.';
        } catch (error) {
          formError(error, 'Não foi possível criar a conta.');
        }
        return;
      }
      message.textContent = 'Nesta cópia local, o perfil é salvo neste dispositivo. Use Entrar na cidade para continuar.';
      email.focus();
    });
    $('#recovery').addEventListener('click', async () => {
      if (!email.value.trim()) {
        message.textContent = 'Informe seu e-mail acima para recuperar a senha.';
        email.focus();
        return;
      }
      if (await onlineAuthAvailable()) {
        message.textContent = 'Enviando o link de recuperação…';
        try {
          await window.TheRichAuth.resetPassword(email.value.trim());
          message.textContent = 'Enviamos um link de recuperação para seu e-mail.';
        } catch (error) {
          formError(error, 'Não foi possível enviar o e-mail de recuperação.');
        }
        return;
      }
      message.textContent = 'A recuperação por e-mail fica disponível após a publicação com a conta online.';
    });
    if (window.TheRichAuth && typeof window.TheRichAuth.getSession === 'function') {
      if (typeof window.TheRichAuth.isConfigured === 'function' && environmentNote) {
        window.TheRichAuth.isConfigured().then((configured) => {
          if (configured) environmentNote.textContent = 'Conta online protegida — pagamentos e Rich Bucks são confirmados pelo servidor.';
        }).catch(() => { /* The local demo note remains accurate. */ });
      }
      window.TheRichAuth.getSession().then(async (session) => {
        if (!session || portal.hidden) return;
        const user = session.user || await window.TheRichAuth.getUser();
        const name = displayName('', user);
        await startGame(name, accountForUser(user, user && user.email || '', name));
      }).catch(() => { /* Offline local mode stays on the portal. */ });
    }
  }

  function resize() {
    view.width = window.innerWidth;
    view.height = window.innerHeight;
    const pixelLoad = view.width * view.height;
    const adaptiveCap = pixelLoad > 1200000 ? Math.min(1.15, quality.dpr) : pixelLoad > 760000 ? Math.min(1.35, quality.dpr) : quality.dpr;
    dpr = Math.max(.8, Math.min(window.devicePixelRatio || 1, adaptiveCap));
    canvas.width = Math.max(1, Math.floor(view.width * dpr));
    canvas.height = Math.max(1, Math.floor(view.height * dpr));
    displayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx = displayCtx;
    staticWorldCacheDirty = true;
    updatePerformanceHud('resize');
  }

  function loop(now) {
    if (!running) return;
    const rawDt = Math.min(Math.max((now - lastFrame) / 1000, 0), 0.05);
    recordPerformance(rawDt);
    smoothedFrameDt = lerp(smoothedFrameDt, rawDt || 1 / 60, 0.18);
    const dt = clamp(smoothedFrameDt, 1 / 120, 1 / 24);
    lastFrame = now;
    update(dt);
    render(now / 1000);
    requestAnimationFrame(loop);
  }

  function update(dt) {
    if (!dialogueState && !knowledgePanelOpen && !labPanelOpen && !learningPanelOpen && !mentorshipPanelOpen && !bucksStoreOpen && !freeCoinsPanelOpen) updatePlayer(dt);
    persistPlayerPosition();
    if (refreshDailyCycle()) {
      updateHud();
      showToast('Ciclo diário disponível · vá para Conteúdos');
    }
    const targetX = clamp(player.x - view.width / 2, 0, Math.max(0, WORLD.width - view.width));
    const targetY = clamp(player.y - view.height / 2, 0, Math.max(0, WORLD.height - view.height));
    const cameraEase = 1 - Math.exp(-9.5 * dt);
    camera.x = lerp(camera.x, targetX, cameraEase);
    camera.y = lerp(camera.y, targetY, cameraEase);
    nearby = dialogueState || knowledgePanelOpen || labPanelOpen || learningPanelOpen || mentorshipPanelOpen || bucksStoreOpen || freeCoinsPanelOpen ? null : findNearby();
    prompt.hidden = !nearby;
    if (nearby) promptCopy.textContent = nearby.prompt;
    worldLabelTimer -= dt;
    if (worldLabelTimer <= 0) {
      updateWorldLabels();
      worldLabelTimer = qualityLevel === 'low' ? .16 : qualityLevel === 'medium' ? .1 : .066;
    }
  }

  function updatePlayer(dt) {
    let xAxis = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0);
    let yAxis = (keys.ArrowDown || keys.KeyS ? 1 : 0) - (keys.ArrowUp || keys.KeyW ? 1 : 0);
    player.sprint = Boolean(keys.ShiftLeft || keys.ShiftRight);
    if (!xAxis && !yAxis) {
      player.isWalking = false;
      player.idleCycle += dt * (1.55 * quality.animationRate);
      return;
    }
    player.idleCycle += dt * (.45 * quality.animationRate);
    const magnitude = Math.hypot(xAxis, yAxis);
    xAxis /= magnitude;
    yAxis /= magnitude;
    const speed = player.sprint ? 270 : 178;
    const movement = { x: xAxis * speed * dt, y: yAxis * speed * dt };
    if (Math.abs(movement.x) > Math.abs(movement.y)) player.facing = movement.x > 0 ? 'right' : 'left';
    else player.facing = movement.y > 0 ? 'down' : 'up';
    player.isWalking = true;
    player.walkCycle += dt * (player.sprint ? 16 : 11) * quality.animationRate;

    const beforeX = player.x;
    const beforeY = player.y;
    const candidateX = { x: player.x + movement.x, y: player.y };
    if (canStand(candidateX)) player.x = candidateX.x;
    const candidateY = { x: player.x, y: player.y + movement.y };
    if (canStand(candidateY)) player.y = candidateY.y;
    if (player.x !== beforeX || player.y !== beforeY) {
      playerPositionDirty = true;
      const now = performance.now();
      if (now - lastStepSoundAt > (player.sprint ? 185 : 245)) {
        playSound('step');
        lastStepSoundAt = now;
      }
    }
  }

  function canStand(point) {
    const pad = player.radius;
    const samples = [
      point,
      { x: point.x + pad, y: point.y }, { x: point.x - pad, y: point.y },
      { x: point.x, y: point.y + pad }, { x: point.x, y: point.y - pad },
      { x: point.x + pad * .7, y: point.y + pad * .7 }, { x: point.x - pad * .7, y: point.y - pad * .7 },
    ];
    return samples.every(isWalkable);
  }

  function isWalkable(point) {
    if (point.x < 52 || point.y < 52 || point.x > WORLD.width - 52 || point.y > WORLD.height - 52) return false;
    if (Math.hypot(point.x - fountain.x, point.y - fountain.y) < fountain.radius + 15) return false;
    if (buildings.some((building) => point.x > building.body.x && point.x < building.body.x + building.body.w && point.y > building.body.y && point.y < building.body.y + building.body.h)) return false;
    if (Math.hypot(point.x - plaza.x, point.y - plaza.y) <= plaza.radius) return true;
    return roads.some((road) => distanceToSegment(point, road.a, road.b) <= road.width / 2);
  }

  function distanceToSegment(point, a, b) {
    const abX = b.x - a.x, abY = b.y - a.y;
    const apX = point.x - a.x, apY = point.y - a.y;
    const length = abX * abX + abY * abY;
    const t = length ? clamp((apX * abX + apY * abY) / length, 0, 1) : 0;
    return Math.hypot(point.x - (a.x + abX * t), point.y - (a.y + abY * t));
  }

  function getBuildingPrompt(building) {
    if (building.id === 'hq') return hasDigital03() ? 'Acessar Mentorias TheRichCorp' : 'Sede · conclua o Digital 03';
    if (building.id === 'bucks-store') return saved.rickIntroduced ? 'Acessar Loja de Rich Bucks' : 'Loja Rich · fale com Rick primeiro';
    if (building.id === 'content') {
      if (!saved.rickIntroduced) return 'Conteúdos · fale com Rick primeiro';
      if (!hasCompletedInitialRoute()) return `Conteúdos · ${saved.initialCoinsCollected}/${INITIAL_COIN_COUNT} Rich Coins`;
      if (canUseDailyLearningAt('content')) return `${getDailyLearningStage().title} · Ciclo diário`;
      if (hasDigital03()) return 'Acessar Digital 03 · Validação';
      return hasDigital01() ? 'Revisar Digital 01' : 'Acessar Conteúdos';
    }
    if (building.id === 'lab') {
      if (canUseDailyLearningAt('lab')) return `${getDailyLearningStage().title} · Ciclo diário`;
      return hasDigital01() ? (hasDigital02() ? 'Revisar Digital 02' : 'Entrar no Digital Lab') : 'Digital Lab · requer Digital 01';
    }
    if (building.id === 'prospection') {
      if (!hasDigital02()) return 'Prospecção · requer Digital 02';
      if (!saved.missions.prospectionStarted) return 'Iniciar rota de Prospecção';
      return hasCompletedProspection() ? 'Revisar Radar de Oportunidades' : `Retomar Prospecção · ${saved.missions.prospectionSignals}/${PROSPECTION_SIGNAL_COUNT}`;
    }
    if (building.id === 'challenges') {
      if (!hasDigital02()) return 'Desafios · requer Digital 02';
      if (!hasCompletedProspection()) return 'Desafios · conclua Prospecção';
      if (!saved.missions.challengeStarted) return 'Iniciar Desafio de Prospecção';
      return hasCompletedChallenge() ? 'Revisar decisão prática' : `Retomar Desafio · ${saved.missions.challengeSignals}/${CHALLENGE_SIGNAL_COUNT}`;
    }
    return building.prompt;
  }

  function getBuildingStatus(building) {
    if (building.id === 'hq') {
      if (!hasDigital03()) return 'REQUER DIGITAL 03';
      const activeMentorships = getUnlockedMentorships().length;
      return activeMentorships ? `${activeMentorships} MENTORIA${activeMentorships === 1 ? '' : 'S'} ATIVA${activeMentorships === 1 ? '' : 'S'}` : 'MENTORIAS';
    }
    if (building.id === 'bucks-store') return isRichBucksCheckoutReady() ? 'PIX SEGURO' : 'PIX EM PREPARAÇÃO';
    if (building.id === 'content') {
      if (!hasCompletedInitialRoute()) return `${saved.initialCoinsCollected}/${INITIAL_COIN_COUNT} RICH COINS`;
      if (canUseDailyLearningAt('content')) return `CICLO ${getDailyLearning().stage + 1}/3`;
      if (hasDigital03()) return 'DIGITAL 03 ATIVO';
      return hasDigital01() ? 'DIGITAL 01 ATIVO' : 'DIGITAL 01 DISPONÍVEL';
    }
    if (building.id === 'lab') return canUseDailyLearningAt('lab') ? `CICLO ${getDailyLearning().stage + 1}/3` : (hasDigital01() ? (hasDigital02() ? 'DIGITAL 02 ATIVO' : 'LAB LIBERADO') : 'REQUER DIGITAL 01');
    if (building.id === 'prospection') {
      if (!hasDigital02()) return 'REQUER DIGITAL 02';
      if (!saved.missions.prospectionStarted) return 'ROTA DISPONÍVEL';
      return hasCompletedProspection() ? 'RADAR SALVO' : `SINAIS ${saved.missions.prospectionSignals}/${PROSPECTION_SIGNAL_COUNT}`;
    }
    if (building.id === 'challenges') {
      if (!hasDigital02()) return 'REQUER DIGITAL 02';
      if (!hasCompletedProspection()) return 'AGUARDA PROSPECÇÃO';
      if (!saved.missions.challengeStarted) return 'DESAFIO DISPONÍVEL';
      return hasCompletedChallenge() ? (hasOpportunityHunterTitle() ? 'CAÇADOR DE OPORTUNIDADES' : 'DESAFIO CONCLUÍDO') : `ETAPAS ${saved.missions.challengeSignals}/${CHALLENGE_SIGNAL_COUNT}`;
    }
    return '';
  }

  function findNearby() {
    const choices = [];
    const activeCoin = getActiveCoin();
    if (activeCoin) choices.push({ ...activeCoin, distance: distance(player, activeCoin) });
    const missionObjective = getActiveMissionObjective();
    if (missionObjective) choices.push({ ...missionObjective, distance: distance(player, missionObjective) });
    choices.push({ ...rick, kind: 'rick', distance: distance(player, rick) });
    choices.push({ ...freeCoinsTerminal, kind: 'free-coins', distance: distance(player, freeCoinsTerminal) });
    buildings.forEach((building) => choices.push({ ...building, kind: 'building', prompt: getBuildingPrompt(building), range: 62, distance: distance(player, building.door) }));
    return choices.filter((item) => item.distance <= item.range).sort((a, b) => a.distance - b.distance)[0] || null;
  }

  function interact() {
    if (bucksStoreOpen) {
      useBucksStore();
      return;
    }
    if (freeCoinsPanelOpen) {
      useFreeCoinsPanel();
      return;
    }
    if (mentorshipPanelOpen) {
      useMentorshipPanel();
      return;
    }
    if (learningPanelOpen) {
      useLearningPanel();
      return;
    }
    if (labPanelOpen) {
      useLabPanel();
      return;
    }
    if (knowledgePanelOpen) {
      useKnowledgePanel();
      return;
    }
    if (dialogueState) {
      advanceDialogue();
      return;
    }
    if (!nearby) return;
    if (nearby.kind === 'coin') collectCoin(nearby);
    if (nearby.kind === 'prospection-signal') analyzeProspectionSignal(nearby);
    if (nearby.kind === 'challenge-signal') executeChallengeSignal(nearby);
    if (nearby.kind === 'rick') talkToRick();
    if (nearby.kind === 'free-coins') openFreeCoinsPanel();
    if (nearby.kind === 'building') visitBuilding(nearby);
  }

  function collectCoin(coin) {
    const activeCoin = getActiveCoin();
    if (!activeCoin || activeCoin.id !== coin.id) return;
    const reward = coin.stage === 'daily-reward' ? DAILY_LEARNING_REWARD : INITIAL_COIN_REWARD;
    if (coin.stage === 'daily-reward') {
      const daily = getDailyLearning();
      daily.rewardReady = false;
      daily.availableAt = Date.now() + DAY_MS;
      daily.cyclesCompleted += 1;
      daily.stage = 0;
      daily.answers = [null, null, null];
    } else {
      saved.initialCoinsCollected += 1;
    }
    saved.coins += reward.coins;
    saved.xp += reward.xp;
    playSound(coin.stage === 'daily-reward' ? 'reward' : 'coin');
    const completedInitialNow = coin.stage === 'initial' && hasCompletedInitialRoute();
    if (completedInitialNow) {
      // Tutorial complete. From now on, Rich Coins earned by playing come from
      // the learning cycle, not from loose street coins.
      saved.dailyCycleStartsAt = null;
      saved.dailyCycleNumber = 0;
      saved.dailyCoinsCollected = 0;
    }
    persist();
    updateHud();
    showToast(`+${reward.coins} Rich Coins  ·  +${reward.xp} XP`);
    if (completedInitialNow) {
      openDialogue([{ speaker: 'THE RICH CITY', portrait: 'R', text: 'Tutorial concluído. Você aprendeu a coletar Rich Coins e somar na carteira. Agora, as Rich Coins de verdade vêm jogando ciclos de aprendizado.' }]);
    } else if (coin.stage === 'daily-reward') {
      openDialogue([{ speaker: 'THE RICH CITY', portrait: 'R', text: `Recompensa coletada. O próximo Ciclo Diário de Aprendizado libera em ${formatRemaining(DAY_MS)}.` }]);
    }
  }

  function startProspection() {
    if (!hasDigital02() || saved.missions.prospectionStarted) return;
    saved.missions.prospectionStarted = true;
    persist();
    updateHud();
    showToast('Rota de Prospecção iniciada · encontre 3 sinais azuis');
    openDialogue([
      { speaker: 'PROSPECÇÃO', portrait: 'R', text: 'Rota iniciada. Siga os sinais azuis: cada um traz uma leitura prática sobre como encontrar uma oportunidade.' },
      { speaker: 'PROSPECÇÃO', portrait: 'R', text: 'Em cada sinal, use setas ou WASD para escolher sua análise e E para registrar. No celular, use o joystick e o botão E.' },
    ]);
  }

  function analyzeProspectionSignal(signal) {
    const active = getActiveMissionObjective();
    if (!active || active.kind !== 'prospection-signal' || active.id !== signal.id) return;
    openLearningPanel('lesson', saved.missions.prospectionSignals);
  }

  function completeProspectionLesson(index, answer) {
    if (!saved.missions.prospectionStarted || hasCompletedProspection() || saved.missions.prospectionSignals !== index) return;
    const radar = getRadarLearning();
    radar.signalsRead[index] = true;
    radar.signalAnswers[index] = answer;
    saved.missions.prospectionSignals += 1;
    saved.xp += 10;
    const completedNow = saved.missions.prospectionSignals >= PROSPECTION_SIGNAL_COUNT;
    if (completedNow) {
      saved.missions.prospectionCompleted = true;
      saved.unlocks.radarArchive = true;
      saved.coins += 35;
      saved.xp += 25;
      grantFarmMissionReward('prospection-study');
    }
    persist();
    updateHud();
    showToast(completedNow ? '+35 Rich Coins · +35 XP · Radar de Oportunidades salvo' : `Insight registrado · +10 XP · ${saved.missions.prospectionSignals}/${PROSPECTION_SIGNAL_COUNT}`);
    if (completedNow) {
      openDialogue([
        { speaker: 'PROSPECÇÃO', portrait: 'R', text: 'Você conectou os três sinais. O seu Radar de Oportunidades foi salvo: dor clara, público específico e teste pequeno.' },
        { speaker: 'PROSPECÇÃO', portrait: 'R', text: 'Agora caminhe até Desafios para usar esse raciocínio em uma situação real.' },
      ]);
    }
  }

  function startChallenge() {
    if (!hasCompletedProspection() || saved.missions.challengeStarted) return;
    saved.missions.challengeStarted = true;
    persist();
    updateHud();
    showToast('Desafio de Prospecção iniciado · execute 3 pontos');
    openDialogue([
      { speaker: 'DESAFIOS', portrait: 'R', text: 'Desafio aceito. Você encontrou oportunidades; agora vai tomar decisões usando um caso real de uma boutique.' },
      { speaker: 'DESAFIOS', portrait: 'R', text: 'Siga os marcadores dourados, escolha com setas ou WASD e confirme com E. Aprender com um erro também mantém sua jornada avançando.' },
    ]);
  }

  function executeChallengeSignal(signal) {
    const active = getActiveMissionObjective();
    if (!active || active.kind !== 'challenge-signal' || active.id !== signal.id) return;
    openLearningPanel('challenge', saved.missions.challengeSignals);
  }

  function completeChallengeDecision(index, answer) {
    if (!saved.missions.challengeStarted || hasCompletedChallenge() || saved.missions.challengeSignals !== index) return;
    const radar = getRadarLearning();
    radar.answers[index] = answer;
    radar.score = getChallengeScore();
    saved.missions.challengeSignals += 1;
    saved.xp += 12;
    const completedNow = saved.missions.challengeSignals >= CHALLENGE_SIGNAL_COUNT;
    let perfectRun = false;
    if (completedNow) {
      saved.missions.challengeCompleted = true;
      radar.completed = true;
      saved.knowledge.digital03 = true;
      saved.unlocks.digital03 = true;
      const daily = getDailyLearning();
      if (!daily.availableAt && !daily.rewardReady) daily.stage = 0;
      saved.coins += 50;
      saved.xp += 35;
      perfectRun = radar.score === CHALLENGE_SIGNAL_COUNT;
      if (perfectRun && !radar.rewardGranted) {
        saved.coins += 15;
        saved.xp += 20;
        saved.unlocks.opportunityHunter = true;
      }
      grantFarmMissionReward('challenge-practice');
      radar.rewardGranted = true;
    }
    persist();
    updateHud();
    showToast(completedNow
      ? (perfectRun ? '+65 Rich Coins · +67 XP · Caçador de Oportunidades' : '+50 Rich Coins · +47 XP · desafio concluído')
      : `Decisão registrada · +12 XP · ${saved.missions.challengeSignals}/${CHALLENGE_SIGNAL_COUNT}`);
    if (completedNow) {
      openDialogue(perfectRun
        ? [
            { speaker: 'DESAFIOS', portrait: 'R', text: 'Leitura perfeita. Você encontrou evidência, desenhou um teste pequeno e decidiu pela validação comercial.' },
            { speaker: 'DESAFIOS', portrait: 'R', text: 'Título conquistado: Caçador de Oportunidades. O bônus e o Digital 03 foram liberados em Conteúdos.' },
          ]
        : [
            { speaker: 'DESAFIOS', portrait: 'R', text: 'Desafio concluído. Você combinou observação, decisão e execução — e transformou conhecimento em evolução mensurável.' },
            { speaker: 'DESAFIOS', portrait: 'R', text: 'O Digital 03 foi liberado em Conteúdos. Revise o Radar de Oportunidades quando quiser reforçar o método.' },
          ]);
    }
  }

  function talkToRick() {
    const collected = saved.initialCoinsCollected;
    const pages = !saved.rickIntroduced
      ? [
          { speaker: 'RICK', portrait: 'R', text: 'Bem-vindo à The Rich City. Aqui, cada caminho leva a uma escolha — e cada escolha pode virar evolução.' },
          { speaker: 'RICK', portrait: 'R', text: collected >= INITIAL_COIN_COUNT ? 'Excelente: você concluiu o ciclo inicial. Agora siga até Conteúdos; o conhecimento abre os próximos distritos.' : collected ? `Você já encontrou ${collected} de ${INITIAL_COIN_COUNT} Rich Coins. Continue seguindo os brilhos dourados pelas ruas.` : 'Comece pela Rich Coin que brilha na alameda abaixo da sede. Aproxime-se e pressione E para coletar.' },
        ]
      : [{ speaker: 'RICK', portrait: 'R', text: collected >= INITIAL_COIN_COUNT ? 'Você está no caminho certo. Visite Conteúdos: a próxima parte da sua evolução começa lá.' : `Continue pela rota dourada. Você já coletou ${collected} de ${INITIAL_COIN_COUNT} Rich Coins iniciais.` }];
    saved.rickIntroduced = true;
    persist();
    updateHud();
    openDialogue(pages);
  }

  function visitBuilding(building) {
    if (building.id === 'hq') {
      if (!hasDigital03()) {
        openDialogue([{ speaker: 'SEDE THE RICH CORP', portrait: 'R', text: 'As Mentorias são abertas depois do Digital 03. Conclua a rota de Prospecção e o Desafio para preparar sua jornada prática.' }]);
      } else {
        openMentorshipPanel();
      }
      return;
    }
    if (building.id === 'bucks-store') {
      if (!saved.rickIntroduced) {
        openDialogue([{ speaker: 'LOJA RICH BUCKS', portrait: 'B', text: 'Rick precisa apresentar a cidade antes de você acessar a carteira. Encontre-o em frente à sede.' }]);
      } else {
        openBucksStore();
      }
      return;
    }
    if (building.id === 'content') {
      if (!saved.rickIntroduced) {
        openDialogue([{ speaker: 'CONTEÚDOS', portrait: 'R', text: 'Rick precisa apresentar a sua jornada antes de liberar os conteúdos. Encontre-o em frente à sede.' }]);
      } else if (!hasCompletedInitialRoute()) {
        openDialogue([{ speaker: 'CONTEÚDOS', portrait: 'R', text: `Você precisa concluir a rota inicial: ${saved.initialCoinsCollected} de ${INITIAL_COIN_COUNT} Rich Coins já foram encontradas.` }]);
      } else if (canUseDailyLearningAt('content')) {
        openDailyLearningPanel();
      } else if (hasDigital03()) {
        openDigital03Panel();
      } else {
        openKnowledgePanel();
      }
      return;
    }
    if (building.id === 'lab') {
      if (!hasDigital01()) {
        openDialogue([{ speaker: 'DIGITAL LAB', portrait: 'R', text: 'O laboratório reconhece o seu potencial, mas requer o Digital 01. Visite Conteúdos e desbloqueie esse conhecimento com suas Rich Coins.' }]);
      } else if (canUseDailyLearningAt('lab')) {
        openDailyLearningPanel();
      } else {
        openLabPanel();
      }
      return;
    }
    if (building.id === 'prospection') {
      if (!hasDigital02()) {
        openDialogue([{ speaker: 'PROSPECÇÃO', portrait: 'R', text: 'Este distrito abre depois do Digital 02. Conclua a trilha no Digital Lab para ativar novas oportunidades.' }]);
      } else if (!saved.missions.prospectionStarted) {
        startProspection();
      } else if (!hasCompletedProspection()) {
        openDialogue([{ speaker: 'PROSPECÇÃO', portrait: 'R', text: `A rota está em andamento: ${saved.missions.prospectionSignals} de ${PROSPECTION_SIGNAL_COUNT} sinais estudados. Siga o próximo marcador azul pelas ruas.` }]);
      } else {
        openLearningArchive();
      }
      return;
    }
    if (building.id === 'challenges') {
      if (!hasDigital02()) {
        openDialogue([{ speaker: 'DESAFIOS', portrait: 'R', text: 'Os Desafios exigem o Digital 02. O seu próximo conhecimento está no Digital Lab.' }]);
      } else if (!hasCompletedProspection()) {
        openDialogue([{ speaker: 'DESAFIOS', portrait: 'R', text: 'Antes de aceitar um desafio, conclua a rota de Prospecção. Os três sinais azuis vão preparar a sua estratégia.' }]);
      } else if (!saved.missions.challengeStarted) {
        startChallenge();
      } else if (!hasCompletedChallenge()) {
        openDialogue([{ speaker: 'DESAFIOS', portrait: 'R', text: `Desafio em andamento: ${saved.missions.challengeSignals} de ${CHALLENGE_SIGNAL_COUNT} decisões registradas. Siga o próximo marcador dourado pelas ruas.` }]);
      } else {
        openLearningResult();
      }
      return;
    }
    openDialogue([{ speaker: building.name.toUpperCase(), portrait: 'R', text: building.text }]);
  }

  function openKnowledgePanel() {
    knowledgePanelOpen = true;
    updateKnowledgePanel();
    knowledgePanel.hidden = false;
    prompt.hidden = true;
    playSound('open');
  }

  function closeKnowledgePanel() {
    knowledgePanelOpen = false;
    knowledgePanel.hidden = true;
    playSound('close');
  }

  function updateKnowledgePanel() {
    knowledgeCost.textContent = String(DIGITAL_01_COST);
    knowledgeStatus.classList.remove('is-ready', 'is-unlocked');
    if (hasDigital01()) {
      knowledgeStatus.textContent = 'Digital 01 está ativo. O Digital Lab agora reconhece o seu acesso.';
      knowledgeStatus.classList.add('is-unlocked');
      knowledgeAction.innerHTML = '<kbd>E</kbd> / ação continuar para a cidade &nbsp;·&nbsp; <kbd>Esc</kbd> voltar';
    } else if (saved.coins >= DIGITAL_01_COST) {
      knowledgeStatus.textContent = `Você possui ${saved.coins} Rich Coins. Este é o seu próximo desbloqueio.`;
      knowledgeStatus.classList.add('is-ready');
      knowledgeAction.innerHTML = `<kbd>E</kbd> / ação desbloquear por ${DIGITAL_01_COST} Rich Coins &nbsp;·&nbsp; <kbd>Esc</kbd> voltar`;
    } else {
      knowledgeStatus.textContent = `Você possui ${saved.coins} Rich Coins. São necessárias ${DIGITAL_01_COST - saved.coins} a mais para liberar o Digital 01.`;
      knowledgeAction.innerHTML = '<kbd>E</kbd> / ação voltar à cidade &nbsp;·&nbsp; <kbd>Esc</kbd> voltar';
    }
  }

  function useKnowledgePanel() {
    if (hasDigital01()) {
      closeKnowledgePanel();
      showToast('Digital 01 ativo · Digital Lab liberado');
      return;
    }
    if (saved.coins < DIGITAL_01_COST) {
      showToast(`Faltam ${DIGITAL_01_COST - saved.coins} Rich Coins para o Digital 01`);
      playSound('denied');
      closeKnowledgePanel();
      return;
    }
    saved.coins -= DIGITAL_01_COST;
    saved.knowledge.digital01 = true;
    persist();
    updateHud();
    updateKnowledgePanel();
    playSound('reward');
    showToast('Digital 01 liberado · Digital Lab disponível');
  }

  function openLabPanel() {
    labPanelOpen = true;
    updateLabPanel();
    labPanel.hidden = false;
    prompt.hidden = true;
    playSound('open');
  }

  function closeLabPanel() {
    labPanelOpen = false;
    labPanel.hidden = true;
    playSound('close');
  }

  function updateLabPanel() {
    labCost.textContent = String(DIGITAL_02_COST);
    labStatus.classList.remove('is-ready', 'is-unlocked');
    if (hasDigital02()) {
      labStatus.textContent = 'Digital 02 está ativo. Prospecção e Desafios agora reconhecem o seu acesso.';
      labStatus.classList.add('is-unlocked');
      labAction.innerHTML = '<kbd>E</kbd> / ação continuar para a cidade &nbsp;·&nbsp; <kbd>Esc</kbd> voltar';
    } else if (saved.coins >= DIGITAL_02_COST) {
      labStatus.textContent = `Você possui ${saved.coins} Rich Coins. Use esta etapa para abrir dois novos distritos.`;
      labStatus.classList.add('is-ready');
      labAction.innerHTML = `<kbd>E</kbd> / ação desbloquear por ${DIGITAL_02_COST} Rich Coins &nbsp;·&nbsp; <kbd>Esc</kbd> voltar`;
    } else {
      labStatus.textContent = `Você possui ${saved.coins} Rich Coins. São necessárias ${DIGITAL_02_COST - saved.coins} a mais para liberar o Digital 02.`;
      labAction.innerHTML = '<kbd>E</kbd> / ação voltar à cidade &nbsp;·&nbsp; <kbd>Esc</kbd> voltar';
    }
  }

  function useLabPanel() {
    if (hasDigital02()) {
      closeLabPanel();
      showToast('Digital 02 ativo · distritos liberados');
      return;
    }
    if (saved.coins < DIGITAL_02_COST) {
      showToast(`Faltam ${DIGITAL_02_COST - saved.coins} Rich Coins para o Digital 02`);
      playSound('denied');
      closeLabPanel();
      return;
    }
    saved.coins -= DIGITAL_02_COST;
    saved.knowledge.digital02 = true;
    persist();
    updateHud();
    updateLabPanel();
    playSound('reward');
    showToast('Digital 02 liberado · Prospecção e Desafios ativos');
  }

  function openLearningPanel(kind, index) {
    const module = kind === 'lesson' ? RADAR_LESSONS[index] : CHALLENGE_DECISIONS[index];
    if (!module) return;
    Object.keys(keys).forEach((key) => { keys[key] = false; });
    learningState = { kind, index, phase: 'question', selected: null };
    learningPanelOpen = true;
    updateLearningPanel();
    learningPanel.hidden = false;
    prompt.hidden = true;
    playSound('open');
  }

  function openLearningArchive() {
    if (!saved.unlocks.radarArchive) return;
    Object.keys(keys).forEach((key) => { keys[key] = false; });
    learningState = { kind: 'archive', phase: 'summary', selected: 0 };
    learningPanelOpen = true;
    updateLearningPanel();
    learningPanel.hidden = false;
    prompt.hidden = true;
    playSound('open');
  }

  function openLearningResult() {
    if (!hasCompletedChallenge()) return;
    Object.keys(keys).forEach((key) => { keys[key] = false; });
    learningState = { kind: 'result', phase: 'summary', selected: 0 };
    learningPanelOpen = true;
    updateLearningPanel();
    learningPanel.hidden = false;
    prompt.hidden = true;
    playSound('open');
  }

  function openLearningReview(reviewType, index) {
    const module = reviewType === 'lesson' ? RADAR_LESSONS[index] : CHALLENGE_DECISIONS[index];
    if (!module) return;
    learningState = { kind: 'review', reviewType, index, phase: 'question', selected: null };
    learningPanelOpen = true;
    updateLearningPanel();
    learningPanel.hidden = false;
    prompt.hidden = true;
    playSound('open');
  }

  function openDigital03Panel() {
    if (!hasDigital03()) return;
    Object.keys(keys).forEach((key) => { keys[key] = false; });
    learningState = { kind: 'digital03', phase: 'summary', selected: 0 };
    learningPanelOpen = true;
    updateLearningPanel();
    learningPanel.hidden = false;
    prompt.hidden = true;
    playSound('open');
  }

  function closeLearningPanel() {
    learningPanelOpen = false;
    learningState = null;
    learningPanel.hidden = true;
    playSound('close');
  }

  function moveLearningChoice(direction) {
    if (!learningState || learningState.phase !== 'question' || !['lesson', 'challenge', 'review', 'daily'].includes(learningState.kind)) return;
    const module = learningState.kind === 'daily'
      ? DAILY_LEARNING_MODULES[learningState.index]
      : learningState.kind === 'challenge' || (learningState.kind === 'review' && learningState.reviewType === 'challenge')
        ? CHALLENGE_DECISIONS[learningState.index]
        : RADAR_LESSONS[learningState.index];
    if (!Number.isInteger(learningState.selected)) learningState.selected = direction < 0 ? module.choices.length - 1 : 0;
    else learningState.selected = (learningState.selected + direction + module.choices.length) % module.choices.length;
    updateLearningPanel();
    playSound('select');
  }

  function useLearningPanel() {
    if (!learningState) return;
    if (learningState.kind === 'archive' && learningState.phase === 'summary') {
      openLearningReview('lesson', 0);
      return;
    }
    if (learningState.kind === 'result' && learningState.phase === 'summary') {
      openLearningReview('challenge', 0);
      return;
    }
    if (learningState.phase === 'question') {
      if (!Number.isInteger(learningState.selected)) {
        showToast('Use as setas ou o joystick para escolher uma resposta');
        playSound('denied');
        return;
      }
      learningState.phase = 'feedback';
      updateLearningPanel();
      playSound('select');
      return;
    }
    const completeState = learningState;
    closeLearningPanel();
    if (completeState.phase !== 'feedback') return;
    if (completeState.kind === 'lesson') completeProspectionLesson(completeState.index, completeState.selected);
    if (completeState.kind === 'challenge') completeChallengeDecision(completeState.index, completeState.selected);
    if (completeState.kind === 'daily') completeDailyLearning(completeState.index, completeState.selected);
    if (completeState.kind === 'review') {
      const total = completeState.reviewType === 'challenge' ? CHALLENGE_SIGNAL_COUNT : PROSPECTION_SIGNAL_COUNT;
      if (completeState.index + 1 < total) {
        openLearningReview(completeState.reviewType, completeState.index + 1);
      } else {
        showToast(completeState.reviewType === 'challenge' ? 'Decisões revisadas · leve o método para a próxima missão' : 'Radar revisado · use o método na próxima oportunidade');
      }
    }
  }

  function updateLearningPanel() {
    if (!learningState) return;
    if (learningState.kind === 'archive') {
      renderLearningSummary();
      return;
    }
    if (learningState.kind === 'result') {
      renderLearningResult();
      return;
    }
    if (learningState.kind === 'digital03') {
      renderDigital03Lesson();
      return;
    }
    const isDaily = learningState.kind === 'daily';
    const isDecision = learningState.kind === 'challenge' || (learningState.kind === 'review' && learningState.reviewType === 'challenge');
    const isReview = learningState.kind === 'review';
    const module = isDaily ? DAILY_LEARNING_MODULES[learningState.index] : (isDecision ? CHALLENGE_DECISIONS[learningState.index] : RADAR_LESSONS[learningState.index]);
    const total = isDaily ? DAILY_LEARNING_MODULES.length : (isDecision ? CHALLENGE_SIGNAL_COUNT : PROSPECTION_SIGNAL_COUNT);
    if (learningState.phase === 'feedback') {
      const correct = learningState.selected === module.correct;
      renderLearningFrame({
        kicker: `${isDaily ? 'CICLO DIÁRIO' : isDecision ? 'DECISÃO' : 'ANÁLISE'} · ${isReview ? 'REVISÃO' : 'FEEDBACK'}`,
        stage: `${learningState.index + 1} DE ${total}`,
        title: correct ? (isDaily ? 'Mentalidade calibrada.' : isDecision ? 'Boa decisão.' : 'Boa leitura.') : 'Recalibre a lente.',
        text: module.feedback[learningState.selected],
        bullets: correct
          ? ['Você aplicou o princípio certo antes de avançar.', isDaily ? 'Use E para concluir esta parte do ciclo diário.' : isReview ? 'Use E para seguir para a próxima revisão.' : 'Use E para salvar essa resposta na sua trilha de aprendizado.', 'Leve esta lógica para o próximo ponto da cidade.']
          : ['Não há punição: uma escolha errada também gera aprendizado.', 'Compare sua escolha com a evidência apresentada nesta etapa.', isDaily ? 'Use E para salvar o aprendizado diário e avançar.' : isReview ? 'Use E para seguir para a próxima revisão.' : 'Use E para salvar o aprendizado e avançar.'],
        progress: learningState.index + 1,
        total,
        controls: isReview ? '<kbd>E</kbd> continuar a revisão &nbsp;·&nbsp; <kbd>Esc</kbd> voltar' : '<kbd>E</kbd> salvar e continuar &nbsp;·&nbsp; <kbd>Esc</kbd> voltar',
      });
      return;
    }
    renderLearningFrame({
      kicker: isReview ? `${module.kicker} · REVISÃO` : module.kicker,
      stage: `ETAPA ${learningState.index + 1} DE ${total}`,
      title: module.title,
      text: module.text,
      bullets: module.bullets,
      question: module.question,
      choices: module.choices,
      selected: learningState.selected,
      progress: learningState.index + 1,
      total,
      controls: '<kbd>←</kbd><kbd>→</kbd> escolher &nbsp;·&nbsp; <kbd>E</kbd> confirmar &nbsp;·&nbsp; <kbd>Esc</kbd> voltar',
    });
  }

  function renderLearningSummary() {
    const radar = getRadarLearning();
    renderLearningFrame({
      kicker: 'CONHECIMENTO SALVO · PROSPECÇÃO',
      stage: 'RADAR DE OPORTUNIDADES',
      title: 'O método que você descobriu',
      text: `Você estudou ${radar.signalsRead.filter(Boolean).length} de ${PROSPECTION_SIGNAL_COUNT} sinais e transformou observação em uma hipótese de oportunidade.`,
      bullets: [
        'Dor clara: observe uma perda repetida antes de imaginar a solução.',
        'Público específico: recorte quem sente a dor e em qual contexto.',
        'Teste pequeno: valide uma mudança mensurável antes de construir ou escalar.',
      ],
      progress: PROSPECTION_SIGNAL_COUNT,
      total: PROSPECTION_SIGNAL_COUNT,
      controls: '<kbd>E</kbd> revisar lições &nbsp;·&nbsp; <kbd>Esc</kbd> voltar',
    });
  }

  function renderLearningResult() {
    const score = getChallengeScore();
    const perfectRun = hasOpportunityHunterTitle();
    renderLearningFrame({
      kicker: perfectRun ? 'CERTIFICAÇÃO CONQUISTADA' : 'DESAFIO CONCLUÍDO · APRENDIZADO SALVO',
      stage: `${score}/${CHALLENGE_SIGNAL_COUNT} DECISÕES IDEAIS`,
      title: perfectRun ? 'Caçador de Oportunidades' : 'Estratégia em evolução',
      text: perfectRun
        ? 'Você encontrou evidência, escolheu um teste pequeno e decidiu por uma validação comercial. O bônus está na sua carteira.'
        : `Você concluiu o caso de Marina com ${score} decisão${score === 1 ? '' : 'ões'} ideal${score === 1 ? '' : 'is'}. Rever o Radar fortalece a sua próxima missão.`,
      bullets: [
        'Evidência vem antes de solução e escala.',
        'Experimentos pequenos reduzem risco e mostram o que merece crescer.',
        'Métricas e pilotos pagos transformam sinal inicial em negócio validado.',
      ],
      progress: CHALLENGE_SIGNAL_COUNT,
      total: CHALLENGE_SIGNAL_COUNT,
      controls: '<kbd>E</kbd> revisar decisões &nbsp;·&nbsp; <kbd>Esc</kbd> voltar',
    });
  }

  function renderDigital03Lesson() {
    renderLearningFrame({
      kicker: 'CONTEÚDOS · TRILHA PRÁTICA',
      stage: 'DIGITAL 03 DESBLOQUEADO',
      title: 'Digital 03: Validação de Oferta',
      text: 'Você já encontrou um sinal. Agora transforme-o em uma oferta pequena, vendável e mensurável antes de investir para escalar.',
      bullets: [
        'Promessa: descreva qual resultado muda para um público específico e em quanto tempo.',
        'Piloto: convide poucas pessoas para uma versão simples, com preço e entrega claros.',
        'Métrica: acompanhe conversão, receita, uso e retenção antes de aumentar investimento.',
      ],
      progress: CHALLENGE_SIGNAL_COUNT,
      total: CHALLENGE_SIGNAL_COUNT,
      controls: '<kbd>E</kbd> continuar para a cidade &nbsp;·&nbsp; <kbd>Esc</kbd> voltar',
    });
  }

  function renderLearningFrame(frame) {
    learningKicker.textContent = frame.kicker;
    learningStage.textContent = frame.stage;
    learningTitle.textContent = frame.title;
    learningText.textContent = frame.text;
    learningBullets.replaceChildren(...frame.bullets.map((item) => {
      const bullet = document.createElement('li');
      bullet.textContent = item;
      return bullet;
    }));
    const hasChoices = Array.isArray(frame.choices) && frame.choices.length > 0;
    learningQuestionBlock.hidden = !hasChoices;
    if (hasChoices) {
      learningQuestion.textContent = frame.question;
      learningChoices.replaceChildren(...frame.choices.map((choice, index) => {
        const button = document.createElement('button');
        const selected = index === frame.selected;
        button.id = `learning-choice-${index}`;
        button.type = 'button';
        button.className = `learning-choice${selected ? ' is-selected' : ''}`;
        button.setAttribute('role', 'radio');
        button.setAttribute('aria-checked', String(selected));
        button.tabIndex = selected ? 0 : -1;
        button.dataset.learningChoice = String(index);
        const key = document.createElement('span');
        key.className = 'learning-choice-key';
        key.setAttribute('aria-hidden', 'true');
        key.textContent = String.fromCharCode(65 + index);
        const copy = document.createElement('span');
        copy.className = 'learning-choice-copy';
        const title = document.createElement('b');
        title.textContent = choice.title;
        const detail = document.createElement('small');
        detail.textContent = choice.detail;
        copy.append(title, detail);
        button.append(key, copy);
        return button;
      }));
    } else {
      learningChoices.replaceChildren();
    }
    learningProgress.replaceChildren(...Array.from({ length: frame.total }, (_, index) => {
      const marker = document.createElement('i');
      if (index < frame.progress) marker.classList.add('is-active');
      return marker;
    }));
    learningControls.innerHTML = frame.controls;
  }

  // Rich Bucks never originate in the client. This screen may display packs,
  // but a production checkout is only started by a server endpoint after it
  // identifies the authenticated player.
  function isRichBucksCheckoutReady() {
    if (window.location.protocol !== 'https:' || !window.TheRichAuth || typeof window.TheRichAuth.getAccessToken !== 'function') return false;
    return typeof window.TheRichAuth.isConfiguredSync === 'function'
      ? window.TheRichAuth.isConfiguredSync()
      : true;
  }

  async function getRichBucksAccessToken() {
    if (!window.TheRichAuth || typeof window.TheRichAuth.getAccessToken !== 'function') return null;
    try {
      const token = await window.TheRichAuth.getAccessToken();
      return typeof token === 'string' && token ? token : null;
    } catch (_) {
      return null;
    }
  }

  function isOnlineAccountProgressReady() {
    if (activeAccount.mode !== 'online' || window.location.protocol !== 'https:') return false;
    if (!window.TheRichAuth || typeof window.TheRichAuth.getAccessToken !== 'function') return false;
    return typeof window.TheRichAuth.isConfiguredSync === 'function'
      ? window.TheRichAuth.isConfiguredSync()
      : true;
  }

  async function loadOnlineAccountProgress() {
    if (!isOnlineAccountProgressReady()) return false;
    const token = await getRichBucksAccessToken();
    if (!token) return false;
    try {
      const response = await fetch(GAME_PROGRESS_API, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.progress || typeof payload.progress !== 'object') return false;
      writeRawSave(activeStateKey, {
        ...payload.progress,
        account: { mode: activeAccount.mode, id: activeAccount.id, email: activeAccount.email },
      });
      saved = readSave(activeStateKey);
      return true;
    } catch (_) {
      return false;
    }
  }

  function scheduleOnlineProgressSync() {
    if (!isOnlineAccountProgressReady()) return;
    window.clearTimeout(progressSyncTimer);
    progressSyncTimer = window.setTimeout(() => { void syncOnlineAccountProgress(); }, 3500);
  }

  async function syncOnlineAccountProgress({ quiet = true } = {}) {
    if (progressSyncInFlight || !isOnlineAccountProgressReady()) return null;
    const token = await getRichBucksAccessToken();
    if (!token) return null;
    progressSyncInFlight = true;
    try {
      const response = await fetch(GAME_PROGRESS_API, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ progress: saved }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Não foi possível salvar o progresso online.');
      return payload;
    } catch (error) {
      if (!quiet) showToast(error && error.message ? error.message : 'Não foi possível salvar o progresso online.');
      return null;
    } finally {
      progressSyncInFlight = false;
    }
  }

  function serverMentorshipId(value) {
    return ['silver', 'gold', 'diamond'].includes(value) ? value : null;
  }

  function applyServerMentorships(entitlements) {
    if (!Array.isArray(entitlements)) return;
    entitlements.forEach((entitlement) => {
      const id = serverMentorshipId(entitlement && entitlement.mentorship);
      if (!id) return;
      const rawTime = entitlement && entitlement.unlockedAt ? Date.parse(entitlement.unlockedAt) : NaN;
      saved.mentorships[id] = {
        unlocked: true,
        method: 'bucks',
        unlockedAt: Number.isFinite(rawTime) ? rawTime : (saved.mentorships[id] && saved.mentorships[id].unlockedAt) || Date.now(),
      };
    });
  }

  function clearPaymentReturnParameters() {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('payment') !== 'pending') return;
      url.searchParams.delete('payment');
      url.searchParams.delete('order_nsu');
      window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
    } catch (_) { /* A file preview does not need to clean a payment return URL. */ }
  }

  function scheduleOnlineWalletPoll() {
    if (!saved.pendingRichBucksOrder || walletPollAttempts >= 12) return;
    window.clearTimeout(walletPollTimer);
    walletPollTimer = window.setTimeout(() => {
      void syncOnlineWallet({ quiet: true, checkReturn: false });
    }, 5000);
  }

  // The server is the authority for paid balance and entitlement. localStorage
  // is updated only as a display cache after this authenticated response.
  async function syncOnlineWallet({ quiet = true, checkReturn = false } = {}) {
    if (walletSyncInFlight) return null;
    const token = await getRichBucksAccessToken();
    if (!token) return null;
    walletSyncInFlight = true;
    try {
      const response = await fetch(`${PAYMENTS_API}/payment-status`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Não foi possível atualizar a carteira online.');
      const serverBalance = Math.max(0, Math.floor(Number(payload.richBucks) || 0));
      const priorBalance = saved.richBucks;
      saved.richBucks = serverBalance;
      applyServerMentorships(payload.mentorships);
      const pendingPurchase = saved.pendingRichBucksOrder && Array.isArray(payload.purchases)
        ? payload.purchases.find((purchase) => purchase && purchase.id === saved.pendingRichBucksOrder)
        : null;
      const creditedNow = Boolean(pendingPurchase && pendingPurchase.status === 'paid');
      if (creditedNow) saved.pendingRichBucksOrder = null;
      persist();
      updateHud();
      if (bucksStoreOpen) updateBucksStore();

      const returnedFromCheckout = checkReturn && (() => {
        try { return new URL(window.location.href).searchParams.get('payment') === 'pending'; } catch (_) { return false; }
      })();
      if (returnedFromCheckout) clearPaymentReturnParameters();
      if (creditedNow && serverBalance > priorBalance) {
        playSound('reward');
        showToast(`PIX confirmado · +${formatAmount(serverBalance - priorBalance)} Rich Bucks na carteira`);
      } else if (returnedFromCheckout && saved.pendingRichBucksOrder) {
        showToast('Pagamento recebido. A confirmação PIX está sendo verificada com segurança…');
      }

      if (saved.pendingRichBucksOrder) {
        walletPollAttempts += 1;
        scheduleOnlineWalletPoll();
      } else {
        walletPollAttempts = 0;
        window.clearTimeout(walletPollTimer);
      }
      return payload;
    } catch (error) {
      if (!quiet) showToast(error && error.message ? error.message : 'Não foi possível atualizar a carteira online.');
      return null;
    } finally {
      walletSyncInFlight = false;
    }
  }

  function openBucksStore() {
    Object.keys(keys).forEach((key) => { keys[key] = false; });
    bucksStoreState = { selected: 0, phase: 'catalog', message: '' };
    bucksStoreOpen = true;
    updateBucksStore();
    bucksStorePanel.hidden = false;
    prompt.hidden = true;
    playSound('open');
    void syncOnlineWallet({ quiet: true });
    if (window.TheRichAuth && typeof window.TheRichAuth.ready === 'function') {
      window.TheRichAuth.ready().then(() => { if (bucksStoreOpen) updateBucksStore(); }).catch(() => { /* Store remains safely unavailable. */ });
    }
  }

  function closeBucksStore() {
    bucksStoreOpen = false;
    bucksStoreState = null;
    bucksStorePanel.hidden = true;
    playSound('close');
  }

  function moveBucksStoreSelection(direction) {
    if (!bucksStoreState || bucksStoreState.phase !== 'catalog') return;
    bucksStoreState.selected = (bucksStoreState.selected + direction + RICH_BUCKS_PACKS.length) % RICH_BUCKS_PACKS.length;
    updateBucksStore();
    playSound('select');
  }

  async function useBucksStore() {
    if (!bucksStoreState) return;
    if (bucksStoreState.phase === 'catalog') {
      await beginRichBucksCheckout();
      return;
    }
    if (bucksStoreState.phase === 'unavailable' || bucksStoreState.phase === 'error') {
      closeBucksStore();
    }
  }

  async function beginRichBucksCheckout() {
    const pack = RICH_BUCKS_PACKS[bucksStoreState.selected];
    if (!pack) return;
    if (!isRichBucksCheckoutReady()) {
      bucksStoreState.phase = 'unavailable';
      bucksStoreState.message = window.location.protocol !== 'https:'
        ? 'Esta cópia local não pode receber confirmação PIX. Publique o jogo em HTTPS e conecte a autenticação online antes de criar cobranças.'
        : 'Entre com uma conta online para associar o pedido à sua carteira antes de abrir o checkout PIX.';
      updateBucksStore();
      playSound('denied');
      return;
    }
    const token = await getRichBucksAccessToken();
    if (!token) {
      bucksStoreState.phase = 'unavailable';
      bucksStoreState.message = 'Sua sessão online expirou. Entre novamente antes de criar uma cobrança PIX.';
      updateBucksStore();
      playSound('denied');
      return;
    }
    bucksStoreState.phase = 'loading';
    bucksStoreState.message = 'Criando um pedido único e seguro para a sua carteira…';
    updateBucksStore();
    playSound('open');
    try {
      const response = await fetch(`${PAYMENTS_API}/create-infinitepay-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        // The browser sends only the public package quantity. The server owns
        // the real price and the Rich Bucks amount for that package.
        body: JSON.stringify({ pack: pack.bucks }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.checkoutUrl) throw new Error(payload.error || 'Não foi possível iniciar o checkout PIX.');
      saved.pendingRichBucksOrder = payload.purchaseId || null;
      persist();
      bucksStoreState.phase = 'redirecting';
      bucksStoreState.message = 'Pedido criado. Abrindo o checkout PIX seguro da InfinitePay…';
      updateBucksStore();
      window.location.assign(payload.checkoutUrl);
    } catch (error) {
      bucksStoreState.phase = 'error';
      bucksStoreState.message = error && error.message ? error.message : 'Não foi possível abrir o checkout. Nenhum Rich Buck foi adicionado.';
      updateBucksStore();
    }
  }

  function updateBucksStore() {
    if (!bucksStoreState) return;
    const pack = RICH_BUCKS_PACKS[bucksStoreState.selected];
    const phase = bucksStoreState.phase;
    bucksStorePacks.querySelectorAll('[data-bucks-pack]').forEach((option, index) => {
      const selected = index === bucksStoreState.selected;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-checked', String(selected));
      option.tabIndex = selected ? 0 : -1;
    });
    bucksStoreProgress.replaceChildren(...RICH_BUCKS_PACKS.map((_item, index) => {
      const marker = document.createElement('i');
      if (index <= bucksStoreState.selected) marker.classList.add('is-active');
      return marker;
    }));
    bucksStoreStatus.classList.remove('is-ready', 'is-pending');
    if (phase === 'catalog') {
      bucksStoreKicker.textContent = 'LOJA RICH · ADICIONAR SALDO';
      bucksStoreStage.textContent = `PACOTE ${bucksStoreState.selected + 1} DE ${RICH_BUCKS_PACKS.length}`;
      bucksStoreTitle.textContent = `${formatAmount(pack.bucks)} Rich Bucks`;
      bucksStoreSummary.textContent = `Você receberá ${formatAmount(pack.bucks)} Rich Bucks na carteira após a confirmação do PIX. O pagamento real é ${pack.brl}.`;
      bucksStoreCheckoutTitle.textContent = isRichBucksCheckoutReady() ? 'Continuar para PIX seguro' : 'Aguardando conexão segura';
      bucksStoreCheckoutCopy.textContent = isRichBucksCheckoutReady()
        ? 'Confirme com E para gerar uma cobrança única pela InfinitePay. Rich Bucks só entram após confirmação do servidor.'
        : 'Nenhuma cobrança será criada e nenhum Rich Buck será creditado até a publicação HTTPS e a configuração segura da conta online.';
      if (bucksStoreCheckoutButton) bucksStoreCheckoutButton.textContent = isRichBucksCheckoutReady() ? 'E · Continuar para PIX' : 'Checkout em preparação';
      bucksStoreStatus.textContent = `Carteira atual: ${formatAmount(saved.richBucks)} Rich Bucks · ${pack.brl} por ${formatAmount(pack.bucks)} Rich Bucks.`;
      bucksStoreStatus.classList.add('is-ready');
      bucksStoreControls.innerHTML = '<kbd>←</kbd><kbd>→</kbd> pacote &nbsp;·&nbsp; <kbd>E</kbd> continuar &nbsp;·&nbsp; <kbd>Esc</kbd> voltar';
      return;
    }
    if (phase === 'loading' || phase === 'redirecting') {
      bucksStoreKicker.textContent = 'LOJA RICH · CHECKOUT PIX';
      bucksStoreStage.textContent = phase === 'loading' ? 'CRIANDO PEDIDO' : 'ABRINDO CHECKOUT';
      bucksStoreTitle.textContent = `${formatAmount(pack.bucks)} Rich Bucks`;
      bucksStoreSummary.textContent = 'O valor e a quantidade são definidos pelo servidor. O navegador não pode alterar a compra.';
      bucksStoreCheckoutTitle.textContent = phase === 'loading' ? 'Criando cobrança segura' : 'Redirecionando para a InfinitePay';
      bucksStoreCheckoutCopy.textContent = bucksStoreState.message;
      if (bucksStoreCheckoutButton) bucksStoreCheckoutButton.textContent = 'Aguarde';
      bucksStoreStatus.textContent = 'O crédito será feito somente depois da confirmação PIX recebida pelo servidor.';
      bucksStoreStatus.classList.add('is-pending');
      bucksStoreControls.innerHTML = 'Aguarde a abertura do checkout seguro.';
      return;
    }
    bucksStoreKicker.textContent = 'LOJA RICH · CHECKOUT PIX';
    bucksStoreStage.textContent = phase === 'error' ? 'PEDIDO NÃO CRIADO' : 'CONEXÃO NECESSÁRIA';
    bucksStoreTitle.textContent = 'Loja de Rich Bucks';
    bucksStoreSummary.textContent = 'A loja está protegida: ela não cria PIX nem aumenta saldo fora de uma conexão online segura.';
    bucksStoreCheckoutTitle.textContent = phase === 'error' ? 'Checkout não iniciado' : 'Checkout ainda indisponível';
    bucksStoreCheckoutCopy.textContent = bucksStoreState.message;
    if (bucksStoreCheckoutButton) bucksStoreCheckoutButton.textContent = 'Nenhuma cobrança criada';
    bucksStoreStatus.textContent = 'Pressione E ou Esc para voltar à cidade.';
    bucksStoreControls.innerHTML = '<kbd>E</kbd> / <kbd>Esc</kbd> voltar à cidade';
  }

  function openFreeCoinsPanel() {
    if (!saved.rickIntroduced) {
      openDialogue([{ speaker: 'RICH COINS GRÁTIS', portrait: 'R', text: 'Fale com Rick primeiro. Ele libera sua jornada e depois você pode usar a Central de Rich Coins grátis.' }]);
      return;
    }
    Object.keys(keys).forEach((key) => { keys[key] = false; });
    freeCoinsState = { selected: 0 };
    freeCoinsPanelOpen = true;
    updateFreeCoinsPanel();
    freeCoinsPanel.hidden = false;
    prompt.hidden = true;
    playSound('open');
  }

  function closeFreeCoinsPanel() {
    freeCoinsPanelOpen = false;
    freeCoinsState = null;
    freeCoinsPanel.hidden = true;
    playSound('close');
  }

  function moveFreeCoinsSelection(direction) {
    if (!freeCoinsState) return;
    freeCoinsState.selected = (freeCoinsState.selected + direction + FREE_COIN_TASKS.length) % FREE_COIN_TASKS.length;
    updateFreeCoinsPanel();
    playSound('select');
  }

  function getFreeCoinTaskStatus(task) {
    const missions = saved.freeCoinMissions || { claimed: {}, opened: {}, dailyCheckinAt: null };
    if (task.daily) {
      const last = Number(missions.dailyCheckinAt) || 0;
      const remaining = last ? FREE_COINS_CHECKIN_MS - (Date.now() - last) : 0;
      return {
        claimed: remaining > 0,
        opened: true,
        available: remaining <= 0,
        remaining,
        label: remaining > 0 ? `Volte em ${formatRemaining(remaining)}` : 'Disponível agora',
      };
    }
    const opened = Boolean(missions.opened && missions.opened[task.id]);
    const claimed = Boolean(missions.claimed && missions.claimed[task.id]);
    return {
      claimed,
      opened,
      available: !claimed && (!task.url || opened),
      remaining: 0,
      label: claimed ? 'Resgatada' : (task.url && !opened ? 'Abrir primeiro' : 'Pronta para resgatar'),
    };
  }

  function canClaimDailyFarm(timestamp) {
    return !timestamp || Date.now() - Number(timestamp) >= DAY_MS;
  }

  function grantFarmMissionReward(id) {
    const mission = FARM_MISSIONS.find((item) => item.id === id);
    if (!mission) return false;
    saved.farmMissions = saved.farmMissions || { claimed: {}, dailyRouteAt: null };
    if (mission.daily) {
      if (!canClaimDailyFarm(saved.farmMissions.dailyRouteAt)) return false;
      saved.farmMissions.dailyRouteAt = Date.now();
    } else {
      saved.farmMissions.claimed = saved.farmMissions.claimed || {};
      if (saved.farmMissions.claimed[id]) return false;
      saved.farmMissions.claimed[id] = true;
    }
    saved.coins += mission.reward;
    saved.xp += mission.xp;
    playSound('reward');
    showToast(`Missão: ${mission.title} · +${mission.reward} Rich Coins`);
    return true;
  }

  function claimFreeCoinTask(task) {
    const status = getFreeCoinTaskStatus(task);
    if (status.claimed && task.daily) {
      showToast(`Check-in diário já resgatado · volte em ${formatRemaining(status.remaining)}`);
      playSound('denied');
      return;
    }
    if (status.claimed) {
      showToast('Essa mini-missão já foi resgatada nesta conta.');
      playSound('denied');
      return;
    }
    if (task.url && !status.opened) {
      saved.freeCoinMissions.opened[task.id] = true;
      persist();
      updateFreeCoinsPanel();
      try { window.open(task.url, '_blank', 'noopener,noreferrer'); } catch (_) { /* Popup blockers are normal in some previews. */ }
      playSound('open');
      showToast('Instagram aberto · volte e pressione E para resgatar');
      return;
    }
    if (task.daily) saved.freeCoinMissions.dailyCheckinAt = Date.now();
    else saved.freeCoinMissions.claimed[task.id] = true;
    saved.coins += task.reward;
    saved.xp += task.xp;
    persist();
    updateHud();
    updateFreeCoinsPanel();
    playSound('reward');
    showToast(`+${task.reward} Rich Coins · +${task.xp} XP`);
  }

  function useFreeCoinsPanel() {
    if (!freeCoinsState) return;
    const task = FREE_COIN_TASKS[freeCoinsState.selected];
    if (!task) return;
    claimFreeCoinTask(task);
  }

  function updateFreeCoinsPanel() {
    if (!freeCoinsState) return;
    const completedOneTimeFarm = FARM_MISSIONS.filter((mission) => !mission.daily && saved.farmMissions && saved.farmMissions.claimed && saved.farmMissions.claimed[mission.id]).length;
    const dailyFarmReady = canClaimDailyFarm(saved.farmMissions && saved.farmMissions.dailyRouteAt);
    const starterPlan = getStarterDailyPlan();
    const starter = getStarterMentorship();
    const starterProgress = starter ? clamp((saved.coins / starter.priceCoins) * 100, 0, 100) : 0;
    const remainingCoins = starter ? Math.max(0, starter.priceCoins - saved.coins) : 0;
    const estimatedDays = starterPlan.dailyTotal ? Math.ceil(remainingCoins / starterPlan.dailyTotal) : 0;
    const task = FREE_COIN_TASKS[freeCoinsState.selected] || FREE_COIN_TASKS[0];
    const status = getFreeCoinTaskStatus(task);
    freeCoinsKicker.textContent = 'CENTRAL · GANHE RICH COINS GRÁTIS';
    freeCoinsStage.textContent = `MISSÃO ${freeCoinsState.selected + 1} DE ${FREE_COIN_TASKS.length}`;
    freeCoinsTitle.textContent = task.title;
    const dailyLearning = getDailyLearning();
    const dailyLearningStatus = dailyLearning.rewardReady
      ? 'recompensa no centro do mapa'
      : (isDailyLearningAvailable()
        ? `etapa ${dailyLearning.stage + 1}/3 disponível`
        : (isDailyLearningUnlocked() && dailyLearning.availableAt
          ? `volta em ${formatRemaining(dailyLearning.availableAt - Date.now())}`
          : 'libera após o Digital 03'));
    freeCoinsSummary.textContent = `${task.detail} Recompensa: ${task.reward} Rich Coins e ${task.xp} XP. Plano Starter: ${formatAmount(saved.coins)}/${formatAmount(starterPlan.target)} RC (${Math.floor(starterProgress)}%). Fazendo o ciclo de aprendizado + check-in diariamente, faltam cerca de ${estimatedDays} dia(s). Ciclo diário: ${dailyLearningStatus}. Farm extra: ${completedOneTimeFarm}/2 missões estratégicas concluídas.`;
    freeCoinsStatus.textContent = status.claimed
      ? `${task.title}: ${status.label}.`
      : (task.url && !status.opened ? 'Pressione E para abrir a ação. Depois volte ao jogo e pressione E novamente para resgatar.' : 'Pressione E para resgatar esta recompensa na sua conta.');
    freeCoinsControls.innerHTML = '<kbd>←</kbd><kbd>→</kbd> missão &nbsp;·&nbsp; <kbd>E</kbd> continuar &nbsp;·&nbsp; <kbd>Esc</kbd> voltar';
    freeCoinsList.replaceChildren(...FREE_COIN_TASKS.map((item, index) => {
      const itemStatus = getFreeCoinTaskStatus(item);
      const button = document.createElement('button');
      button.className = 'free-coin-task';
      if (index === freeCoinsState.selected) button.classList.add('is-selected');
      if (itemStatus.claimed) button.classList.add('is-claimed');
      button.type = 'button';
      button.setAttribute('role', 'radio');
      button.setAttribute('aria-checked', String(index === freeCoinsState.selected));
      button.tabIndex = index === freeCoinsState.selected ? 0 : -1;
      const icon = document.createElement('span');
      icon.className = 'free-coin-task-icon';
      icon.textContent = itemStatus.claimed ? '✓' : item.icon;
      const copy = document.createElement('span');
      copy.className = 'free-coin-task-copy';
      const title = document.createElement('b');
      title.textContent = item.title;
      const detail = document.createElement('small');
      detail.textContent = itemStatus.label;
      copy.append(title, detail);
      const reward = document.createElement('strong');
      reward.className = 'free-coin-task-reward';
      reward.textContent = `+${item.reward} RC`;
      button.append(icon, copy, reward);
      return button;
    }));
    freeCoinsProgress.replaceChildren(...FREE_COIN_TASKS.map((_item, index) => {
      const marker = document.createElement('i');
      if (index <= freeCoinsState.selected) marker.classList.add('is-active');
      return marker;
    }));
  }

  function openMentorshipPanel() {
    Object.keys(keys).forEach((key) => { keys[key] = false; });
    mentorshipState = { screen: 'catalog', selected: 0, methodIndex: 0 };
    mentorshipPanelOpen = true;
    updateMentorshipPanel();
    mentorshipPanel.hidden = false;
    prompt.hidden = true;
    playSound('open');
  }

  function closeMentorshipPanel() {
    if (mentorshipState && mentorshipState.processing) return;
    mentorshipPanelOpen = false;
    mentorshipState = null;
    mentorshipPanel.hidden = true;
    playSound('close');
  }

  function backFromMentorshipPanel() {
    if (mentorshipState && mentorshipState.processing) return;
    if (!mentorshipState || mentorshipState.screen === 'catalog') {
      closeMentorshipPanel();
      return;
    }
    mentorshipState.screen = mentorshipState.screen === 'pix' ? 'payment' : 'catalog';
    updateMentorshipPanel();
  }

  function moveMentorshipSelection(direction) {
    if (!mentorshipState || mentorshipState.processing) return;
    if (mentorshipState.screen === 'catalog') {
      mentorshipState.selected = (mentorshipState.selected + direction + MENTORSHIPS.length) % MENTORSHIPS.length;
    } else if (mentorshipState.screen === 'payment') {
      const mentorship = MENTORSHIPS[mentorshipState.selected];
      const methodCount = mentorship && mentorship.coinOnly ? 1 : 2;
      mentorshipState.methodIndex = (mentorshipState.methodIndex + direction + methodCount) % methodCount;
    } else {
      return;
    }
    updateMentorshipPanel();
    playSound('select');
  }

  async function useMentorshipPanel() {
    if (!mentorshipState || mentorshipState.processing) return;
    const mentorship = MENTORSHIPS[mentorshipState.selected];
    if (!mentorship) return;
    if (mentorshipState.screen === 'catalog') {
      mentorshipState.screen = getMentorshipAccess(mentorship.id).unlocked ? 'curriculum' : 'payment';
      mentorshipState.methodIndex = 0;
      updateMentorshipPanel();
      return;
    }
    if (mentorshipState.screen === 'payment') {
      const availableMethods = mentorship.coinOnly ? ['coins'] : ['bucks', 'pix'];
      const method = availableMethods[mentorshipState.methodIndex] || 'coins';
      if (method === 'pix') {
        mentorshipState.screen = 'pix';
        updateMentorshipPanel();
        return;
      }
      await purchaseMentorship(mentorship, method);
      return;
    }
    if (mentorshipState.screen === 'pix') {
      closeMentorshipPanel();
      showToast('Caminhe até a Loja Rich Bucks para adicionar saldo via PIX seguro.');
      return;
    }
    if (mentorshipState.screen === 'curriculum') {
      closeMentorshipPanel();
      showToast(`${mentorship.name} disponível na sua jornada`);
    }
  }

  async function purchaseMentorship(mentorship, method) {
    if (getMentorshipAccess(mentorship.id).unlocked) {
      mentorshipState.screen = 'curriculum';
      updateMentorshipPanel();
      return;
    }
    if (method === 'coins') {
      if (!mentorship.coinOnly) {
        showToast(`${mentorship.name} é premium e só pode ser liberada com Rich Bucks.`);
        playSound('denied');
        mentorshipState.screen = 'catalog';
        updateMentorshipPanel();
        return;
      }
      if (saved.coins < mentorship.priceCoins) {
        showToast(`Você precisa de ${formatAmount(mentorship.priceCoins)} Rich Coins para a ${mentorship.name}`);
        playSound('denied');
        mentorshipState.screen = 'catalog';
        updateMentorshipPanel();
        return;
      }
      saved.coins -= mentorship.priceCoins;
    } else if (method === 'bucks') {
      await redeemMentorshipWithRichBucks(mentorship);
      return;
    } else {
      return;
    }
    saved.mentorships[mentorship.id] = { unlocked: true, method, unlockedAt: Date.now() };
    persist();
    updateHud();
    mentorshipState.screen = 'curriculum';
    updateMentorshipPanel();
    playSound('reward');
    showToast(method === 'coins'
      ? `${mentorship.name} liberada · ${formatAmount(mentorship.priceCoins)} Rich Coins trocados`
      : `${mentorship.name} liberada · acesso salvo no seu perfil`);
  }

  async function redeemMentorshipWithRichBucks(mentorship) {
    if (mentorship.coinOnly) {
      showToast(`${mentorship.name} é liberada apenas com Rich Coins dentro do jogo.`);
      playSound('denied');
      mentorshipState.screen = 'catalog';
      updateMentorshipPanel();
      return;
    }
    const token = await getRichBucksAccessToken();
    if (!token) {
      showToast('Os Rich Bucks reais são usados somente com uma conta online publicada com segurança.');
      playSound('denied');
      mentorshipState.screen = 'catalog';
      updateMentorshipPanel();
      return;
    }
    mentorshipState.processing = true;
    updateMentorshipPanel();
    try {
      const response = await fetch(`${PAYMENTS_API}/redeem-mentorship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mentorship: mentorship.id, method: 'bucks' }),
      });
      const payload = await response.json().catch(() => ({}));
      const suppliedBalance = Number(payload.richBucks);
      if (Number.isFinite(suppliedBalance) && suppliedBalance >= 0) saved.richBucks = Math.floor(suppliedBalance);
      if (!response.ok || !payload.accessGranted) {
        persist();
        updateHud();
        throw new Error(payload.message || `Não foi possível liberar a ${mentorship.name}.`);
      }
      const source = serverMentorshipId(payload.sourceMentorship) || mentorship.id;
      const unlockedAt = Date.now();
      saved.mentorships[mentorship.id] = { unlocked: true, method: 'bucks', unlockedAt };
    if (source === 'diamond') {
        ['pdfs', 'silver', 'gold', 'diamond'].forEach((id) => {
          saved.mentorships[id] = { unlocked: true, method: 'bucks', unlockedAt };
        });
      }
      persist();
      updateHud();
      mentorshipState.screen = 'curriculum';
      updateMentorshipPanel();
      playSound('reward');
      showToast(payload.idempotent ? `${mentorship.name} já estava disponível na sua conta.` : `${mentorship.name} liberada · Rich Bucks confirmados pelo servidor`);
    } catch (error) {
      mentorshipState.screen = 'catalog';
      updateMentorshipPanel();
      playSound('denied');
      showToast(error && error.message ? error.message : `Não foi possível liberar a ${mentorship.name}.`);
    } finally {
      if (mentorshipState) mentorshipState.processing = false;
    }
  }

  function updateMentorshipPanel() {
    if (!mentorshipState) return;
    const mentorship = MENTORSHIPS[mentorshipState.selected];
    if (!mentorship) return;
    const mentorshipPrice = mentorship.coinOnly
      ? `${formatAmount(mentorship.priceCoins)} RICH COINS`
      : `${formatAmount(mentorship.priceBucks)} RICH BUCKS`;
    if (mentorshipState.screen === 'catalog') {
      renderMentorshipFrame({
        kicker: 'SEDE THE RICH CORP · MENTORIAS',
        stage: `JORNADA ${mentorshipState.selected + 1} DE ${MENTORSHIPS.length}`,
        title: mentorship.name,
        price: mentorshipPrice,
        summary: mentorship.pitch,
        modules: mentorship.modules,
        status: getMentorshipCatalogStatus(mentorship),
        progress: mentorshipState.selected + 1,
        total: MENTORSHIPS.length,
        controls: '<kbd>←</kbd><kbd>→</kbd> explorar &nbsp;·&nbsp; <kbd>E</kbd> ver opções &nbsp;·&nbsp; <kbd>Esc</kbd> voltar',
      });
      return;
    }
    if (mentorshipState.screen === 'payment') {
      const methods = mentorship.coinOnly
        ? [{ id: 'coins', title: `Trocar ${formatAmount(mentorship.priceCoins)} Rich Coins`, detail: `Saldo atual: ${formatAmount(saved.coins)} Rich Coins` }]
        : [
            { id: 'bucks', title: `Usar ${formatAmount(mentorship.priceBucks)} Rich Bucks`, detail: `Saldo online: ${formatAmount(saved.richBucks)} Rich Bucks` },
            { id: 'pix', title: 'Visitar a Loja Rich Bucks', detail: 'Caminhe até a loja da cidade para adicionar saldo via PIX seguro.' },
          ];
      renderMentorshipFrame({
        kicker: 'MENTORIAS THE RICH CORP · ACESSO',
        stage: mentorship.name.toUpperCase(),
        title: `Liberar ${mentorship.name}`,
        price: mentorshipPrice,
        summary: mentorship.coinOnly
          ? 'Esta mentoria é liberada apenas com Rich Coins. Farme, complete missões e volte quando juntar o valor necessário.'
          : 'Esta mentoria premium é liberada apenas com Rich Bucks. Adicione saldo pela Loja Rich Bucks e volte para resgatar pela sua conta.',
        modules: mentorship.includes ? [{ title: 'PACOTE INCLUÍDO', text: mentorship.includes }, ...mentorship.modules] : mentorship.modules,
        methods,
        selectedMethod: mentorshipState.methodIndex,
        status: mentorshipState.processing ? 'Confirmando o resgate seguro da sua conta…' : `Carteira: ${formatAmount(saved.richBucks)} Rich Bucks · ${formatAmount(saved.coins)} Rich Coins`,
        progress: mentorshipState.selected + 1,
        total: MENTORSHIPS.length,
        controls: mentorshipState.processing ? 'Aguarde a confirmação segura.' : (mentorship.coinOnly ? '<kbd>E</kbd> trocar Rich Coins &nbsp;·&nbsp; <kbd>Esc</kbd> voltar' : '<kbd>←</kbd><kbd>→</kbd> escolher acesso &nbsp;·&nbsp; <kbd>E</kbd> confirmar &nbsp;·&nbsp; <kbd>Esc</kbd> voltar'),
      });
      return;
    }
    if (mentorshipState.screen === 'pix') {
      renderMentorshipFrame({
        kicker: 'RICH BUCKS · PRÓXIMO DESTINO',
        stage: 'LOJA DA CIDADE',
        title: 'Caminhe até a Loja Rich Bucks',
        price: `META: ${formatAmount(mentorship.priceBucks)} RICH BUCKS`,
        summary: 'A cobrança PIX não é criada na sede. Saia deste painel, caminhe pela cidade até a Loja Rich Bucks e use E na porta para selecionar o pacote.',
        modules: [
          { title: '01 · Vá até a loja', text: 'A loja fica no setor sul, entre Conteúdos e Desafios.' },
          { title: '02 · Escolha o pacote', text: 'O checkout é criado para a sua conta somente na versão publicada e segura.' },
          { title: '03 · Volte à sede', text: 'Após a confirmação PIX, os Rich Bucks entram na carteira e o resgate é feito pelo servidor.' },
        ],
        status: 'Sem clique à distância: a compra começa caminhando até a loja.',
        progress: mentorshipState.selected + 1,
        total: MENTORSHIPS.length,
        controls: '<kbd>E</kbd> voltar para a cidade &nbsp;·&nbsp; <kbd>Esc</kbd> fechar',
      });
      return;
    }
    const access = getMentorshipAccess(mentorship.id);
    renderMentorshipFrame({
      kicker: access.viaDiamond ? 'MENTORIA INCLUÍDA · RICH DIAMOND' : 'MENTORIA DESBLOQUEADA',
      stage: 'JORNADA DISPONÍVEL',
      title: mentorship.name,
      price: access.viaDiamond ? 'INCLUÍDA NO PACOTE RICH DIAMOND' : 'ACESSO SALVO NO PERFIL',
      summary: mentorship.outcome,
      modules: mentorship.includes ? [{ title: 'PACOTE INCLUÍDO', text: mentorship.includes }, ...mentorship.modules] : mentorship.modules,
      status: access.viaDiamond ? 'Esta trilha está incluída pela sua Rich Diamond.' : 'Mentoria ativa. Volte à sede sempre que quiser revisar esta jornada.',
      progress: mentorshipState.selected + 1,
      total: MENTORSHIPS.length,
      controls: '<kbd>E</kbd> continuar para a cidade &nbsp;·&nbsp; <kbd>Esc</kbd> voltar',
    });
  }

  function getMentorshipCatalogStatus(mentorship) {
    const access = getMentorshipAccess(mentorship.id);
    if (access.viaDiamond) return 'Incluída pela Rich Diamond · jornada disponível';
    if (access.unlocked) return 'Jornada disponível · acesso salvo no seu perfil';
    if (mentorship.coinOnly) return `Mentoria farmável · ${formatAmount(saved.coins)}/${formatAmount(mentorship.priceCoins)} Rich Coins`;
    return `Premium · ${formatAmount(mentorship.priceBucks)} Rich Bucks · saldo atual ${formatAmount(saved.richBucks)}`;
  }

  function getMentorshipPriceParts(mentorship, priceText) {
    if (mentorship && mentorship.coinOnly) {
      return {
        iconClass: 'coin-icon mentorship-coin',
        icon: 'R',
        value: formatAmount(mentorship.priceCoins),
        unit: 'Rich Coins',
        label: 'Farmável jogando',
        note: 'Junte moedas no mapa, missões grátis, check-in e rotas diárias.',
      };
    }
    if (mentorship && Number.isFinite(Number(mentorship.priceBucks))) {
      return {
        iconClass: 'bucks-icon',
        icon: 'B',
        value: formatAmount(mentorship.priceBucks),
        unit: 'Rich Bucks',
        label: `Equivale a R$ ${formatAmount(mentorship.priceBucks)},00`,
        note: 'Adicione Rich Bucks via PIX seguro e resgate pela sua conta.',
      };
    }
    return {
      iconClass: 'mentorship-method-mark',
      icon: '✓',
      value: priceText || 'Liberada',
      unit: 'Acesso',
      label: 'Disponível no perfil',
      note: 'Volte quando quiser revisar os módulos desta jornada.',
    };
  }

  function renderMentorshipFrame(frame) {
    const mentorship = MENTORSHIPS[mentorshipState.selected];
    mentorshipKicker.textContent = frame.kicker;
    mentorshipStage.textContent = frame.stage;
    mentorshipTitle.textContent = frame.title;
    mentorshipSummary.textContent = frame.summary;
    if (mentorshipOfferings) {
      mentorshipOfferings.querySelectorAll('[data-mentorship]').forEach((option, index) => {
        const item = MENTORSHIPS[index];
        const selected = index === mentorshipState.selected;
        option.classList.toggle('is-selected', selected);
        option.setAttribute('aria-checked', String(selected));
        option.tabIndex = selected ? 0 : -1;
        if (item) {
          const access = getMentorshipAccess(item.id);
          const priceLine = item.coinOnly
            ? `${formatAmount(item.priceCoins)} RC`
            : `${formatAmount(item.priceBucks)} RB`;
          option.replaceChildren();
          const mark = document.createElement('span');
          mark.className = 'mentorship-option-mark';
          mark.textContent = item.icon || item.name.slice(0, 1);
          const copy = document.createElement('span');
          const title = document.createElement('b');
          title.textContent = item.name;
          const small = document.createElement('small');
          small.textContent = access.unlocked ? 'Liberada' : `${item.tier} · ${priceLine}`;
          const perk = document.createElement('em');
          perk.textContent = item.highlight || item.tagline;
          copy.append(title, small, perk);
          option.append(mark, copy);
        }
      });
    }
    const priceMentorship = /ACESSO|INCLUÍDA|LIBERADA/i.test(String(frame.price || '')) ? null : mentorship;
    const price = getMentorshipPriceParts(priceMentorship, frame.price);
    mentorshipPrice.replaceChildren();
    const priceIcon = document.createElement('span');
    priceIcon.className = price.iconClass;
    priceIcon.textContent = price.icon;
    priceIcon.setAttribute('aria-hidden', 'true');
    const priceCopy = document.createElement('span');
    priceCopy.className = 'mentorship-price-copy';
    const priceTop = document.createElement('strong');
    const priceValue = document.createElement('b');
    priceValue.textContent = price.value;
    const priceUnit = document.createElement('span');
    priceUnit.textContent = price.unit;
    priceTop.append(priceValue, priceUnit);
    const priceLabel = document.createElement('small');
    priceLabel.textContent = price.label;
    const priceNote = document.createElement('em');
    priceNote.textContent = price.note;
    priceCopy.append(priceTop, priceLabel, priceNote);
    mentorshipPrice.append(priceIcon, priceCopy);

    const benefitModules = mentorship && Array.isArray(mentorship.benefits)
      ? mentorship.benefits.map((benefit) => ({ title: benefit, text: mentorship.accessLabel || mentorship.tagline, benefit: true }))
      : [];
    const moduleRows = [
      ...benefitModules,
      ...frame.modules,
    ];
    mentorshipModules.replaceChildren(...moduleRows.map((module, index) => {
      const item = document.createElement('li');
      if (module.benefit) item.classList.add('is-benefit');
      const marker = document.createElement('span');
      marker.textContent = module.benefit ? '✓' : String(index + 1 - benefitModules.length).padStart(2, '0');
      const copy = document.createElement('span');
      copy.className = 'mentorship-module-copy';
      const title = document.createElement('b');
      title.textContent = module.title;
      const text = document.createElement('small');
      text.textContent = module.text;
      copy.append(title, text);
      item.append(marker, copy);
      return item;
    }));
    const hasMethods = Array.isArray(frame.methods) && frame.methods.length > 0;
    mentorshipMethods.hidden = !hasMethods;
    if (hasMethods) {
      mentorshipMethods.replaceChildren(...frame.methods.map((method, index) => {
        const selected = index === frame.selectedMethod;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `mentorship-method${selected ? ' is-selected' : ''}`;
        button.setAttribute('role', 'radio');
        button.setAttribute('aria-checked', String(selected));
        button.tabIndex = selected ? 0 : -1;
        const mark = document.createElement('span');
        mark.className = method.id === 'coins' ? 'coin-icon' : method.id === 'bucks' ? 'bucks-icon' : 'mentorship-method-mark';
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = method.id === 'coins' ? 'R' : method.id === 'bucks' ? 'B' : 'PIX';
        const copy = document.createElement('span');
        copy.className = 'mentorship-method-copy';
        const title = document.createElement('b');
        title.textContent = method.title;
        const detail = document.createElement('small');
        detail.textContent = method.detail;
        copy.append(title, detail);
        button.append(mark, copy);
        return button;
      }));
    } else {
      mentorshipMethods.replaceChildren();
    }
    mentorshipStatus.textContent = frame.status;
    mentorshipProgress.replaceChildren(...Array.from({ length: frame.total }, (_, index) => {
      const marker = document.createElement('i');
      if (index < frame.progress) marker.classList.add('is-active');
      return marker;
    }));
    mentorshipControls.innerHTML = frame.controls;
  }

  function openDialogue(pages) {
    dialogueState = { pages, index: 0 };
    renderDialoguePage();
    dialogue.hidden = false;
    prompt.hidden = true;
    playSound('open');
  }
  function advanceDialogue() {
    dialogueState.index += 1;
    if (dialogueState.index >= dialogueState.pages.length) {
      dialogueState = null;
      dialogue.hidden = true;
      playSound('close');
      return;
    }
    renderDialoguePage();
    playSound('select');
  }
  function closeDialogue() {
    dialogueState = null;
    dialogue.hidden = true;
    playSound('close');
  }
  function renderDialoguePage() {
    const page = dialogueState.pages[dialogueState.index];
    dialogueSpeaker.textContent = page.speaker;
    dialogueText.textContent = page.text;
    dialoguePortrait.textContent = page.portrait;
  }

  function updateHud() {
    coinCounter.textContent = String(saved.coins);
    if (bucksCounter) bucksCounter.textContent = formatAmount(saved.richBucks);
    if (bucksChip) bucksChip.setAttribute('aria-label', `${formatAmount(saved.richBucks)} Rich Bucks`);
    const level = Math.floor(saved.xp / 100) + 1;
    levelCounter.textContent = `Nível ${level} · ${saved.xp} XP`;
    const starter = getStarterMentorship();
    if (starterGoal && starter) {
      const access = getMentorshipAccess(starter.id);
      const progress = access.unlocked ? starter.priceCoins : Math.min(saved.coins, starter.priceCoins);
      const percent = access.unlocked ? 100 : clamp((progress / starter.priceCoins) * 100, 0, 100);
      starterGoal.hidden = access.unlocked;
      starterGoalCurrent.textContent = formatAmount(progress);
      starterGoalTarget.textContent = formatAmount(starter.priceCoins);
      starterGoalBar.style.width = `${percent}%`;
    }
    if (!saved.rickIntroduced) {
      questTitle.textContent = 'Encontre Rick em frente à sede.';
      questDetail.textContent = 'Aproxime-se dele e pressione E para conversar.';
    } else if (!hasCompletedInitialRoute()) {
      const next = saved.initialCoinsCollected + 1;
      questTitle.textContent = `Colete Rich Coins · ${next}/${INITIAL_COIN_COUNT}.`;
      questDetail.textContent = next === 1 ? 'A primeira brilha na alameda abaixo da sede.' : 'Siga o próximo brilho dourado somente pelas ruas da cidade.';
    } else if (!hasDigital01()) {
      questTitle.textContent = 'Desbloqueie o Digital 01.';
      questDetail.textContent = `Caminhe até Conteúdos e use ${DIGITAL_01_COST} Rich Coins. As moedas iniciais são o tutorial; o farm diário libera depois do Digital 03.`;
    } else if (!hasDigital02()) {
      questTitle.textContent = 'Desbloqueie o Digital 02.';
      questDetail.textContent = `Caminhe até o Digital Lab e use ${DIGITAL_02_COST} Rich Coins para abrir novos distritos.`;
    } else if (!saved.missions.prospectionStarted) {
      questTitle.textContent = 'Inicie a rota de Prospecção.';
      questDetail.textContent = 'Caminhe até o prédio roxo e pressione E para revelar o primeiro sinal de oportunidade.';
    } else if (!hasCompletedProspection()) {
      questTitle.textContent = `Rota de Prospecção · ${saved.missions.prospectionSignals + 1}/${PROSPECTION_SIGNAL_COUNT}.`;
      questDetail.textContent = 'Siga o marcador azul pelas ruas. Leia, escolha sua análise e registre o aprendizado com E.';
    } else if (!saved.missions.challengeStarted) {
      questTitle.textContent = 'Desafio de Prospecção disponível.';
      questDetail.textContent = 'Caminhe até o prédio vermelho e pressione E para iniciar a validação da sua estratégia.';
    } else if (!hasCompletedChallenge()) {
      questTitle.textContent = `Desafio de Prospecção · ${saved.missions.challengeSignals + 1}/${CHALLENGE_SIGNAL_COUNT}.`;
      questDetail.textContent = 'Siga o marcador dourado pelas ruas, decida com setas ou WASD e confirme com E.';
    } else if (getDailyLearning().rewardReady) {
      questTitle.textContent = 'Recompensa diária liberada.';
      questDetail.textContent = `Caminhe até o centro do mapa e colete +${DAILY_LEARNING_REWARD.coins} Rich Coins.`;
    } else if (isDailyLearningAvailable()) {
      const destination = getDailyLearningDestination();
      questTitle.textContent = `Ciclo diário · etapa ${getDailyLearning().stage + 1}/3.`;
      questDetail.textContent = `Vá até ${destination.label}, pressione E e conclua uma missão prática para ganhar Rich Coins.`;
    } else if (isDailyLearningUnlocked() && getDailyLearning().availableAt && Date.now() < getDailyLearning().availableAt) {
      questTitle.textContent = 'Ciclo diário em recarga.';
      questDetail.textContent = `Volte em ${formatRemaining(getDailyLearning().availableAt - Date.now())}. Enquanto isso, revise conteúdos ou farme missões grátis.`;
    } else if (!getMentorshipAccess('pdfs').unlocked) {
      const starterPlan = getStarterDailyPlan();
      const starter = getStarterMentorship();
      const remainingCoins = starter ? Math.max(0, starter.priceCoins - saved.coins) : 0;
      const estimatedDays = starterPlan.dailyTotal ? Math.ceil(remainingCoins / starterPlan.dailyTotal) : 0;
      questTitle.textContent = 'Meta: liberar a Rich Starter.';
      questDetail.textContent = `Faça o ciclo diário de aprendizado, check-in e missões grátis. Faltam ${formatAmount(remainingCoins)} Rich Coins · cerca de ${estimatedDays} dia(s) no ritmo diário.`;
    } else if (!getUnlockedMentorships().length) {
      questTitle.textContent = 'Mentorias TheRichCorp disponíveis.';
      questDetail.textContent = 'Caminhe até a sede e pressione E para conhecer Rich Starter, Rich Silver, Rich Gold e Rich Diamond.';
    } else {
      questTitle.textContent = hasOpportunityHunterTitle() ? 'Título: Caçador de Oportunidades.' : 'Primeira rota estratégica concluída.';
      questDetail.textContent = 'O Digital 03 está em Conteúdos e suas mentorias ficam disponíveis na sede The Rich Corp.';
    }
  }

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function updateWorldLabels() {
    const labels = [
      ['.label-hq', buildings[0].x, buildings[0].y - 155], ['.label-lab', buildings[1].x, buildings[1].y - 120],
      ['.label-prospection', buildings[2].x, buildings[2].y - 120], ['.label-content', buildings[3].x, buildings[3].y - 123],
      ['.label-store', buildings[4].x, buildings[4].y - 112], ['.label-challenges', buildings[5].x, buildings[5].y - 123],
      ['.label-free-coins', freeCoinsTerminal.x, freeCoinsTerminal.y - 74],
    ];
    labels.forEach(([selector, x, y]) => {
      const element = $(selector);
      const sx = x - camera.x, sy = y - camera.y;
      const visible = sx > -180 && sx < view.width + 180 && sy > -30 && sy < view.height + 30;
      element.style.left = `${sx}px`;
      element.style.top = `${sy}px`;
      element.style.opacity = visible ? '.96' : '0';
    });
  }

  function render(time) {
    ctx = displayCtx;
    ctx.clearRect(0, 0, view.width, view.height);
    drawWorldBase(time);
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    drawStaticWorldCache();
    drawFreeCoinsTerminal(time);
    getVisibleBuildings().filter((b) => b.y < player.y - 35).forEach((b) => drawBuilding(b, time));
    drawRick(time);
    const activeCoin = getActiveCoin();
    if (activeCoin) drawCoin(time, activeCoin);
    const activeMissionObjective = getActiveMissionObjective();
    if (activeMissionObjective) drawMissionBeacon(time, activeMissionObjective);
    drawPlayer(time);
    getVisibleBuildings().filter((b) => b.y >= player.y - 35).forEach((b) => drawBuilding(b, time));
    drawScenery('front', time);
    ctx.restore();
    drawAtmosphere(time);
    drawVignette(time);
  }

  function isWorldRectVisible(x, y, width, height, margin = quality.cacheMargin) {
    return x + width >= camera.x - margin
      && x <= camera.x + view.width + margin
      && y + height >= camera.y - margin
      && y <= camera.y + view.height + margin;
  }

  function isWorldPointVisible(x, y, margin = quality.cacheMargin) {
    return x >= camera.x - margin
      && x <= camera.x + view.width + margin
      && y >= camera.y - margin
      && y <= camera.y + view.height + margin;
  }

  function getVisibleBuildings() {
    return buildings.filter((building) => isWorldRectVisible(building.body.x - 70, building.body.y - 170, building.body.w + 140, building.body.h + 260));
  }

  function rebuildStaticWorldCache() {
    const scale = quality.staticScale;
    const cacheCanvas = document.createElement('canvas');
    cacheCanvas.width = Math.max(1, Math.ceil(WORLD.width * scale));
    cacheCanvas.height = Math.max(1, Math.ceil(WORLD.height * scale));
    const previousCtx = ctx;
    const cacheCtx = cacheCanvas.getContext('2d', { alpha: false });
    cacheCtx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx = cacheCtx;
    drawTerrainDetails(0);
    drawRoadNetwork();
    drawPlaza(0);
    drawScenery('rear', 0, true);
    drawStreetFurniture(0, true);
    ctx = previousCtx;
    staticWorldCache = cacheCanvas;
    staticWorldCacheLevel = qualityLevel;
    staticWorldCacheScale = scale;
    staticWorldCacheDirty = false;
  }

  function drawStaticWorldCache() {
    if (staticWorldCacheDirty || !staticWorldCache || staticWorldCacheLevel !== qualityLevel || staticWorldCacheScale !== quality.staticScale) rebuildStaticWorldCache();
    ctx.drawImage(staticWorldCache, 0, 0, WORLD.width, WORLD.height);
  }

  function drawWorldBase(time) {
    const gradient = ctx.createLinearGradient(0, 0, 0, view.height);
    gradient.addColorStop(0, '#050813');
    gradient.addColorStop(.42, '#0a111a');
    gradient.addColorStop(1, '#03070a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, view.width, view.height);

    // A cool moon wash behind the map gives the night scene depth before the
    // world layer is translated by the camera.
    const moon = ctx.createRadialGradient(view.width * .72, -40, 10, view.width * .72, -40, view.width * .62);
    moon.addColorStop(0, 'rgba(112,139,255,.13)');
    moon.addColorStop(.45, 'rgba(72,57,150,.055)');
    moon.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = moon;
    ctx.fillRect(0, 0, view.width, view.height);

    ctx.fillStyle = `rgba(255,225,164,${.018 + Math.sin(time * .4) * .004})`;
    for (let i = 0; i < Math.max(0, quality.vignetteStars - 2); i += 1) {
      const x = (i * 197 + 71) % Math.max(1, view.width);
      const y = (i * 83 + 29) % Math.max(1, Math.floor(view.height * .55));
      ctx.fillRect(x, y, i % 5 === 0 ? 1.5 : .7, i % 5 === 0 ? 1.5 : .7);
    }
  }

  function drawTerrainDetails(time) {
    const ground = ctx.createLinearGradient(0, 0, WORLD.width, WORLD.height);
    ground.addColorStop(0, '#142421');
    ground.addColorStop(.42, '#0d201c');
    ground.addColorStop(1, '#071411');
    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    // Layered pools of colored light define districts without adding any
    // collision or changing the navigation surface.
    const districtGlows = [
      { x: 820, y: 190, r: 520, inner: 'rgba(244,178,47,.14)', mid: 'rgba(100,64,171,.055)' },
      { x: 270, y: 430, r: 330, inner: 'rgba(37,159,255,.11)', mid: 'rgba(24,77,124,.05)' },
      { x: 1360, y: 430, r: 330, inner: 'rgba(155,77,255,.12)', mid: 'rgba(68,32,116,.055)' },
      { x: 820, y: 760, r: 480, inner: 'rgba(87,52,171,.085)', mid: 'rgba(16,68,67,.035)' },
    ];
    districtGlows.forEach((light) => {
      const glow = ctx.createRadialGradient(light.x, light.y, 20, light.x, light.y, light.r);
      glow.addColorStop(0, light.inner); glow.addColorStop(.46, light.mid); glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow; ctx.fillRect(light.x - light.r, light.y - light.r, light.r * 2, light.r * 2);
    });

    const northGlow = ctx.createRadialGradient(820, 255, 40, 820, 255, 560);
    northGlow.addColorStop(0, 'rgba(247,185,54,.075)'); northGlow.addColorStop(.52, 'rgba(98,49,162,.05)'); northGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = northGlow; ctx.fillRect(180, 0, 1280, 850);
    const plazaGlow = ctx.createRadialGradient(plaza.x, plaza.y, 45, plaza.x, plaza.y, 370);
    plazaGlow.addColorStop(0, 'rgba(108,61,202,.13)'); plazaGlow.addColorStop(.52, 'rgba(51,43,111,.065)'); plazaGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = plazaGlow; ctx.fillRect(360, 165, 920, 820);

    // Subtle diamond-cut turf texture echoes the isometric architecture.
    // This is intentionally sparse: the old dense grid looked nice but spent
    // too much work every frame while the player was walking.
    ctx.strokeStyle = 'rgba(152,194,165,.026)'; ctx.lineWidth = 1;
    for (let x = -260; x < WORLD.width + 260; x += PERFORMANCE.terrainGridStep) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - 270, WORLD.height); ctx.stroke();
    }
    for (let y = 24; y < WORLD.height + 260; y += PERFORMANCE.terrainGridStep) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD.width, y + 270); ctx.stroke();
    }

    // Small clumps and fireflies keep the grass alive while remaining purely
    // decorative and safely outside the navigation system.
    for (let i = 0; i < PERFORMANCE.grassClumps; i += 1) {
      const x = 35 + ((i * 131) % (WORLD.width - 70));
      const y = 36 + ((i * 229) % (WORLD.height - 72));
      if (i % 4 === 0) {
        ctx.strokeStyle = i % 12 === 0 ? 'rgba(147,113,223,.13)' : 'rgba(108,156,102,.12)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, y + 3); ctx.quadraticCurveTo(x - 3, y - 3, x - 5, y - 5); ctx.moveTo(x, y + 3); ctx.quadraticCurveTo(x + 3, y - 4, x + 5, y - 6); ctx.stroke();
      } else if (i % 11 === 0) {
        const pulse = .18 + Math.sin(time * 1.4 + i) * .08;
        ctx.fillStyle = `rgba(255,213,104,${pulse})`;
        ctx.shadowColor = '#ffc950'; ctx.shadowBlur = 7;
        ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = 'rgba(129,173,131,.055)';
        ctx.beginPath(); ctx.arc(x, y, i % 3 === 0 ? 1.4 : .75, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Slow world-space fog banks make the map feel larger without obscuring
    // entrances or the bright navigation stones.
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < PERFORMANCE.fogBanks; i += 1) {
      const drift = Math.sin(time * .09 + i * 1.8) * 45;
      const fog = ctx.createRadialGradient(260 + i * 390 + drift, 920 - i * 205, 10, 260 + i * 390 + drift, 920 - i * 205, 230);
      fog.addColorStop(0, i % 2 ? 'rgba(78,67,131,.025)' : 'rgba(88,126,129,.022)');
      fog.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = fog; ctx.beginPath(); ctx.ellipse(260 + i * 390 + drift, 920 - i * 205, 260, 74, -.14, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawRoadNetwork() {
    ctx.save();
    roads.forEach((road) => {
      const dx = road.b.x - road.a.x, dy = road.b.y - road.a.y;
      const length = Math.hypot(dx, dy) || 1;
      const nx = -dy / length, ny = dx / length;
      ctx.lineCap = 'round';
      // Deep trench, metallic curb and pale central paving separate the valid
      // walkable routes very clearly from the dark landscape.
      ctx.strokeStyle = 'rgba(0,2,7,.84)'; ctx.lineWidth = road.width + 32;
      ctx.beginPath(); ctx.moveTo(road.a.x, road.a.y); ctx.lineTo(road.b.x, road.b.y); ctx.stroke();
      ctx.strokeStyle = '#171923'; ctx.lineWidth = road.width + 18;
      ctx.beginPath(); ctx.moveTo(road.a.x, road.a.y); ctx.lineTo(road.b.x, road.b.y); ctx.stroke();
      ctx.strokeStyle = 'rgba(207,155,61,.34)'; ctx.lineWidth = road.width + 12;
      ctx.beginPath(); ctx.moveTo(road.a.x, road.a.y); ctx.lineTo(road.b.x, road.b.y); ctx.stroke();
      ctx.strokeStyle = '#393b47'; ctx.lineWidth = road.width + 7;
      ctx.beginPath(); ctx.moveTo(road.a.x, road.a.y); ctx.lineTo(road.b.x, road.b.y); ctx.stroke();
      const pavement = ctx.createLinearGradient(road.a.x, road.a.y - road.width / 2, road.a.x, road.a.y + road.width / 2);
      pavement.addColorStop(0, '#777783'); pavement.addColorStop(.45, '#565964'); pavement.addColorStop(1, '#353844');
      ctx.strokeStyle = pavement; ctx.lineWidth = road.width - 5;
      ctx.beginPath(); ctx.moveTo(road.a.x, road.a.y); ctx.lineTo(road.b.x, road.b.y); ctx.stroke();

      ctx.save();
      ctx.translate(road.a.x, road.a.y);
      ctx.rotate(Math.atan2(dy, dx));
      const innerHalf = Math.max(21, road.width * .43);
      const rowHeight = Math.max(26, road.width / PERFORMANCE.roadTileRowsDivisor * 10);
      let row = 0;
      for (let sy = -innerHalf + 7; sy < innerHalf - 5; sy += rowHeight) {
        const offset = row % 2 ? PERFORMANCE.roadTileStep * .45 : 0;
        let column = 0;
        for (let sx = 10 - offset; sx < length - 5; sx += PERFORMANCE.roadTileStep) {
          const tileWidth = Math.min(PERFORMANCE.roadTileStep - 8, length - sx - 4);
          if (tileWidth < 7) continue;
          const shade = (row + column) % 3;
          ctx.fillStyle = shade === 0 ? 'rgba(217,213,211,.072)' : shade === 1 ? 'rgba(15,18,27,.085)' : 'rgba(184,176,176,.035)';
          ctx.beginPath();
          roundedRect(ctx, sx, sy, tileWidth, rowHeight - 4, 4);
          ctx.fill();
          ctx.strokeStyle = 'rgba(12,14,21,.24)'; ctx.lineWidth = 1; ctx.stroke();
          ctx.strokeStyle = 'rgba(255,244,218,.075)';
          ctx.beginPath(); ctx.moveTo(sx + 4, sy + 2); ctx.lineTo(sx + tileWidth - 4, sy + 2); ctx.stroke();
          column += 1;
        }
        row += 1;
      }
      ctx.restore();

      ctx.strokeStyle = 'rgba(255,226,168,.22)'; ctx.lineWidth = 1.2;
      [-.44, .44].forEach((offset) => {
        ctx.beginPath();
        ctx.moveTo(road.a.x + nx * road.width * offset, road.a.y + ny * road.width * offset);
        ctx.lineTo(road.b.x + nx * road.width * offset, road.b.y + ny * road.width * offset);
        ctx.stroke();
      });
    });
    ctx.restore();
  }

  function drawPlaza(time) {
    const { x, y, radius } = plaza;
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.beginPath(); ctx.ellipse(x + 8, y + 12, radius + 23, radius * .76, 0, 0, Math.PI * 2); ctx.fill();
    const gradient = ctx.createRadialGradient(x - 22, y - 28, 8, x, y, radius + 20);
    gradient.addColorStop(0, '#777783'); gradient.addColorStop(.62, '#4e505b'); gradient.addColorStop(1, '#262934');
    ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(x, y, radius + 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#171923'; ctx.lineWidth = 13; ctx.beginPath(); ctx.arc(x, y, radius + 6, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(219,170,78,.47)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, radius + 2, 0, Math.PI * 2); ctx.stroke();

    // Radial stonework gives the square a crafted, premium focal point.
    [82, 111].forEach((r, ringIndex) => {
      for (let a = 0; a < Math.PI * 2; a += Math.PI / (ringIndex ? 12 : 9)) {
        const arcEnd = a + Math.PI / (ringIndex ? 12 : 9) - .035;
        ctx.strokeStyle = ringIndex ? 'rgba(12,14,21,.32)' : 'rgba(233,223,211,.12)';
        ctx.lineWidth = ringIndex ? 2 : 1.2;
        ctx.beginPath(); ctx.arc(x, y, r, a, arcEnd); ctx.stroke();
      }
    });
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 10) {
      ctx.strokeStyle = 'rgba(15,17,25,.23)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 73, y + Math.sin(a) * 73); ctx.lineTo(x + Math.cos(a) * 127, y + Math.sin(a) * 127); ctx.stroke();
    }

    // Three-quarter fountain: broad stone base, luminous water and an energy
    // crystal instead of a flat circle.
    const fountainHalo = ctx.createRadialGradient(x, y - 16, 5, x, y - 16, 96);
    fountainHalo.addColorStop(0, 'rgba(85,189,255,.2)'); fountainHalo.addColorStop(.48, 'rgba(107,78,220,.09)'); fountainHalo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fountainHalo; ctx.beginPath(); ctx.arc(x, y - 12, 96, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#171a24'; ctx.beginPath(); ctx.ellipse(x, y + 15, 70, 38, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#393b49'; ctx.beginPath(); ctx.ellipse(x, y + 7, 69, 37, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c2913f'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, y + 5, 64, 33, 0, 0, Math.PI * 2); ctx.stroke();
    const water = ctx.createRadialGradient(x - 14, y - 4, 4, x, y + 3, 59);
    water.addColorStop(0, '#b8f5ff'); water.addColorStop(.24, '#48b9e9'); water.addColorStop(.62, '#3462c9'); water.addColorStop(1, '#201d58');
    ctx.fillStyle = water; ctx.beginPath(); ctx.ellipse(x, y + 2, 55, 27, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(194,247,255,${.43 + Math.sin(time * 2.2) * .12})`; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.ellipse(x, y + 2, 43 + Math.sin(time * 2.1) * 2, 19 + Math.sin(time * 2.1) * 1.2, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#252237'; ctx.beginPath(); ctx.moveTo(x - 13, y + 5); ctx.lineTo(x - 9, y - 32); ctx.lineTo(x + 9, y - 32); ctx.lineTo(x + 13, y + 5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(204,172,255,.4)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.shadowColor = '#9c67ff'; ctx.shadowBlur = 22;
    ctx.fillStyle = '#9f69ef'; ctx.beginPath(); ctx.moveTo(x, y - 60); ctx.lineTo(x + 12, y - 41); ctx.lineTo(x + 7, y - 20); ctx.lineTo(x - 7, y - 20); ctx.lineTo(x - 12, y - 41); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d8c4ff'; ctx.beginPath(); ctx.moveTo(x, y - 56); ctx.lineTo(x + 4, y - 40); ctx.lineTo(x, y - 25); ctx.lineTo(x - 4, y - 40); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(132,220,255,.5)'; ctx.lineWidth = 1.4;
    [-1, 1].forEach((side) => {
      ctx.beginPath(); ctx.moveTo(x + side * 5, y - 25); ctx.quadraticCurveTo(x + side * 25, y - 6, x + side * 33, y + 1); ctx.stroke();
    });
  }

  function drawBuilding(building, time) {
    const x = building.x, y = building.y, w = building.w, h = building.h;
    const status = getBuildingStatus(building);
    const districtActive = building.id === 'bucks-store' || (building.id === 'lab' && hasDigital01()) || ((building.id === 'prospection' || building.id === 'challenges') && hasDigital02());
    const locked = (building.id === 'lab' && !hasDigital01()) || (building.id === 'content' && !hasCompletedInitialRoute()) || ((building.id === 'prospection' || building.id === 'challenges') && !hasDigital02());
    const inRange = Boolean(nearby && nearby.kind === 'building' && nearby.id === building.id);
    const palette = {
      gold: { roof: '#211c2c', roofHi: '#494057', side: '#211e2c', face: '#3b3244', trim: '#9d7435', glow: '#ffc548', sign: '#ffe19a', glass: '#9b6320' },
      blue: { roof: '#142237', roofHi: '#25496a', side: '#182a3f', face: '#203951', trim: '#346d8f', glow: '#41c6ff', sign: '#a7ecff', glass: '#245d8f' },
      purple: { roof: '#29193b', roofHi: '#583878', side: '#2d1e43', face: '#472a60', trim: '#7650a4', glow: '#a85fff', sign: '#e0b8ff', glass: '#582a85' },
      green: { roof: '#222a25', roofHi: '#465144', side: '#27342b', face: '#394939', trim: '#7f7441', glow: '#ddc85c', sign: '#f3e69a', glass: '#6b5921' },
      red: { roof: '#301d2c', roofHi: '#633348', side: '#382031', face: '#552b46', trim: '#8f4f42', glow: '#ff8758', sign: '#ffd0a8', glass: '#762d30' },
    }[building.theme];
    ctx.save();
    ctx.translate(x, y);

    const buildingLight = ctx.createRadialGradient(0, h * .2, 12, 0, h * .2, w * .7);
    buildingLight.addColorStop(0, locked ? 'rgba(89,73,114,.06)' : colorAlpha(palette.glow, .13 * quality.buildingGlow));
    buildingLight.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = buildingLight; ctx.beginPath(); ctx.ellipse(0, h * .28, w * .72, h * .58, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(0,0,0,${.42 + .2 * quality.shadows})`; ctx.beginPath(); ctx.ellipse(13, h * .43, w * .63, h * .22, 0, 0, Math.PI * 2); ctx.fill();

    // Heavy obsidian plinth keeps every building seated in the terrain.
    ctx.fillStyle = '#11131b';
    ctx.beginPath();
    ctx.moveTo(-w * .55, h * .29); ctx.lineTo(-w * .12, h * .66); ctx.lineTo(w * .53, h * .42); ctx.lineTo(w * .12, h * .11); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(208,164,75,.2)'; ctx.lineWidth = 2; ctx.stroke();

    // Two lit masonry façades and a steep isometric roof create a consistent
    // architectural family; the rooftop features below make each district unique.
    const leftFace = ctx.createLinearGradient(-w * .5, 0, -w * .04, h * .62);
    leftFace.addColorStop(0, palette.face); leftFace.addColorStop(1, palette.side);
    ctx.fillStyle = leftFace;
    ctx.beginPath(); ctx.moveTo(-w * .5, -h * .03); ctx.lineTo(-w * .13, h * .24); ctx.lineTo(-w * .13, h * .61); ctx.lineTo(-w * .5, h * .31); ctx.closePath(); ctx.fill();
    const rightFace = ctx.createLinearGradient(-w * .13, h * .24, w * .48, h * .42);
    rightFace.addColorStop(0, palette.face); rightFace.addColorStop(1, palette.side);
    ctx.fillStyle = rightFace;
    ctx.beginPath(); ctx.moveTo(-w * .13, h * .24); ctx.lineTo(w * .48, -h * .02); ctx.lineTo(w * .48, h * .4); ctx.lineTo(-w * .13, h * .61); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.085)'; ctx.lineWidth = 1.3; ctx.stroke();

    // Stone courses produce scale on the walls.
    ctx.strokeStyle = 'rgba(4,6,12,.19)'; ctx.lineWidth = 1;
    for (let course = 0; course < 4; course += 1) {
      const wallY = h * (.29 + course * .078);
      ctx.beginPath(); ctx.moveTo(-w * .46 + course * 3, wallY - h * .18); ctx.lineTo(-w * .13, wallY + h * .04); ctx.lineTo(w * .44, wallY - h * .18); ctx.stroke();
    }

    const roof = ctx.createLinearGradient(-w * .2, -h * .47, w * .25, h * .12);
    roof.addColorStop(0, palette.roofHi); roof.addColorStop(.36, palette.roof); roof.addColorStop(1, '#11131d');
    ctx.fillStyle = roof;
    ctx.beginPath(); ctx.moveTo(-w * .55, -h * .09); ctx.lineTo(-w * .09, -h * .49); ctx.lineTo(w * .56, -h * .14); ctx.lineTo(w * .08, h * .18); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = palette.trim; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = 'rgba(5,6,13,.34)'; ctx.lineWidth = 2;
    for (let ridge = -4; ridge <= 4; ridge += 1) {
      const rx = ridge * w * .061;
      ctx.beginPath(); ctx.moveTo(-w * .1 + rx, -h * .46 + Math.abs(ridge) * 2.6); ctx.lineTo(w * .09 + rx, h * .11 - Math.abs(ridge) * 1.2); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,.075)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-w * .52, -h * .085); ctx.lineTo(-w * .09, -h * .46); ctx.lineTo(w * .53, -h * .13); ctx.stroke();

    drawBuildingSilhouette(building, palette, time);

    // Windows glow outward onto walls instead of reading as flat colored boxes.
    const shimmer = (locked ? .28 : districtActive ? .84 : .62) + Math.sin(time * 2.1 + x * .01) * .08;
    const windows = building.id === 'hq'
      ? [[-116, 43, 21, 30], [-80, 70, 20, 29], [18, 61, 22, 30], [61, 44, 22, 29], [101, 28, 20, 27]]
      : [[-w * .39, h * .22, 21, 27], [-w * .25, h * .34, 20, 27], [w * .03, h * .31, 22, 29], [w * .21, h * .23, 22, 28]];
    windows.forEach(([wx, wy, ww, wh], index) => drawBuildingWindow(wx, wy, ww, wh, palette, shimmer * (index % 3 === 1 ? .76 : 1)));

    // The doorway is rendered at the exact gameplay interaction coordinate.
    // Bottom-row buildings face north toward the plaza, so their portal extends
    // from the street inward instead of appearing on the wrong façade.
    drawBuildingEntrance(building, palette, time, inRange, locked);

    // Brass-framed building marquees remain readable at camera zoom while the
    // larger HTML labels continue to provide accessibility.
    const signWidth = Math.min(w * .62, 190);
    const signY = -h * .19;
    ctx.shadowColor = inRange ? palette.glow : 'transparent'; ctx.shadowBlur = inRange ? 16 : 0;
    ctx.fillStyle = 'rgba(5,7,13,.94)'; ctx.beginPath(); roundedRect(ctx, -signWidth / 2, signY - 15, signWidth, 30, 7); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = inRange ? palette.glow : colorAlpha(palette.glow, .58); ctx.lineWidth = inRange ? 2 : 1; ctx.stroke();
    ctx.fillStyle = palette.sign; ctx.font = `900 ${building.id === 'hq' ? 12 : 10}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(building.name.toUpperCase(), 0, signY + .5);
    if (status) {
      const statusColor = districtActive ? '#abebff' : locked ? '#b9a7c9' : '#f8df86';
      const badgeWidth = Math.min(128, Math.max(80, w * .38));
      ctx.fillStyle = locked ? 'rgba(10,8,16,.9)' : 'rgba(16,17,27,.93)'; ctx.beginPath(); roundedRect(ctx, -badgeWidth / 2, signY + 20, badgeWidth, 17, 5); ctx.fill();
      ctx.strokeStyle = locked ? 'rgba(192,160,214,.28)' : palette.glow; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = statusColor; ctx.font = '800 7px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(status, 0, signY + 28.5);
    }
    ctx.restore();
  }

  function colorAlpha(hex, alpha) {
    const value = hex.replace('#', '');
    const full = value.length === 3 ? value.split('').map((digit) => digit + digit).join('') : value;
    const red = parseInt(full.slice(0, 2), 16), green = parseInt(full.slice(2, 4), 16), blue = parseInt(full.slice(4, 6), 16);
    return `rgba(${red},${green},${blue},${alpha})`;
  }

  function drawBuildingWindow(x, y, width, height, palette, intensity) {
    ctx.save();
    ctx.fillStyle = '#080b13'; ctx.fillRect(x - 3, y - 4, width + 6, height + 8);
    ctx.strokeStyle = palette.trim; ctx.lineWidth = 1.2; ctx.strokeRect(x - 2, y - 3, width + 4, height + 6);
    ctx.shadowColor = palette.glow; ctx.shadowBlur = 15;
    const glass = ctx.createLinearGradient(x, y, x, y + height);
    glass.addColorStop(0, colorAlpha(palette.sign, Math.max(.1, intensity * .86)));
    glass.addColorStop(.32, colorAlpha(palette.glow, Math.max(.08, intensity * .64)));
    glass.addColorStop(1, colorAlpha(palette.glass, Math.max(.16, intensity * .5)));
    ctx.fillStyle = glass; ctx.fillRect(x, y, width, height); ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(6,8,14,.58)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + width / 2, y); ctx.lineTo(x + width / 2, y + height); ctx.moveTo(x, y + height * .47); ctx.lineTo(x + width, y + height * .47); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(x + 3, y + 3, Math.max(2, width * .16), height * .52);
    ctx.restore();
  }

  function drawBuildingSilhouette(building, palette, time) {
    const w = building.w, h = building.h;
    ctx.save();
    if (building.id === 'hq') {
      // Corporate manor with a tall central clock tower and paired spires.
      [-w * .34, w * .33].forEach((towerX) => {
        ctx.fillStyle = '#262230'; ctx.fillRect(towerX - 24, -h * .43, 48, 65);
        ctx.strokeStyle = palette.trim; ctx.lineWidth = 2; ctx.strokeRect(towerX - 24, -h * .43, 48, 65);
        ctx.fillStyle = palette.roof; ctx.beginPath(); ctx.moveTo(towerX - 31, -h * .43); ctx.lineTo(towerX, -h * .66); ctx.lineTo(towerX + 31, -h * .43); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = palette.glow; ctx.shadowColor = palette.glow; ctx.shadowBlur = 10; ctx.fillRect(towerX - 5, -h * .32, 10, 19); ctx.shadowBlur = 0;
        ctx.strokeStyle = palette.trim; ctx.beginPath(); ctx.moveTo(towerX, -h * .66); ctx.lineTo(towerX, -h * .74); ctx.stroke();
      });
      ctx.fillStyle = '#292333'; ctx.fillRect(-43, -h * .55, 86, 89);
      ctx.strokeStyle = palette.trim; ctx.lineWidth = 2.5; ctx.strokeRect(-43, -h * .55, 86, 89);
      ctx.fillStyle = palette.roof; ctx.beginPath(); ctx.moveTo(-54, -h * .55); ctx.lineTo(0, -h * .81); ctx.lineTo(54, -h * .55); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#0d0d15'; ctx.beginPath(); ctx.arc(0, -h * .42, 20, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = palette.glow; ctx.lineWidth = 2.4; ctx.stroke();
      ctx.fillStyle = palette.sign; ctx.font = '900 21px Georgia'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('R', 0, -h * .42 + 1);
      ctx.shadowColor = palette.glow; ctx.shadowBlur = 16; ctx.fillStyle = palette.glow; ctx.beginPath(); ctx.arc(0, -h * .82, 3, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    } else if (building.id === 'lab') {
      // Digital Lab: horizontal light reactor, aerial and data fins.
      ctx.strokeStyle = palette.trim; ctx.lineWidth = 3;
      [-42, -14, 14, 42].forEach((finX) => { ctx.beginPath(); ctx.moveTo(finX, -h * .36); ctx.lineTo(finX + 18, -h * .18); ctx.stroke(); });
      ctx.fillStyle = '#08131f'; ctx.beginPath(); roundedRect(ctx, -73, -h * .35, 146, 34, 8); ctx.fill(); ctx.strokeStyle = palette.glow; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.shadowColor = palette.glow; ctx.shadowBlur = 20; ctx.fillStyle = colorAlpha(palette.glow, .72); ctx.fillRect(-61, -h * .29, 122, 3); ctx.shadowBlur = 0;
      ctx.strokeStyle = palette.glow; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-78, -h * .34); ctx.lineTo(-94, -h * .61); ctx.stroke();
      ctx.fillStyle = palette.sign; ctx.beginPath(); ctx.arc(-95, -h * .63, 5, 0, Math.PI * 2); ctx.fill();
    } else if (building.id === 'prospection') {
      // Observatory dome and scanning arcs communicate discovery at a glance.
      const pulse = .65 + Math.sin(time * 1.8) * .18;
      ctx.fillStyle = '#171426'; ctx.beginPath(); ctx.arc(23, -h * .36, 41, Math.PI, 0); ctx.lineTo(64, -h * .34); ctx.lineTo(-18, -h * .34); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = palette.trim; ctx.lineWidth = 3; ctx.stroke();
      ctx.shadowColor = palette.glow; ctx.shadowBlur = 18; ctx.fillStyle = colorAlpha(palette.glow, pulse); ctx.beginPath(); ctx.arc(23, -h * .38, 23, Math.PI, 0); ctx.fill(); ctx.shadowBlur = 0;
      ctx.strokeStyle = colorAlpha(palette.sign, .55); ctx.lineWidth = 1.5;
      [49, 57].forEach((radius) => { ctx.beginPath(); ctx.arc(23, -h * .36, radius, Math.PI * 1.14, Math.PI * 1.86); ctx.stroke(); });
      ctx.strokeStyle = palette.glow; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(23, -h * .59); ctx.lineTo(23, -h * .72); ctx.stroke();
      ctx.fillStyle = palette.sign; ctx.beginPath(); ctx.arc(23, -h * .73, 4, 0, Math.PI * 2); ctx.fill();
    } else if (building.id === 'content') {
      // Library lantern and book-like roof ribs.
      [-65, -21, 23, 67].forEach((ribX) => {
        ctx.fillStyle = '#17191a'; ctx.fillRect(ribX - 5, -h * .42, 10, 37);
        ctx.strokeStyle = palette.trim; ctx.lineWidth = 1.2; ctx.strokeRect(ribX - 5, -h * .42, 10, 37);
      });
      ctx.fillStyle = '#22211e'; ctx.beginPath(); roundedRect(ctx, -34, -h * .55, 68, 48, 9); ctx.fill(); ctx.strokeStyle = palette.trim; ctx.lineWidth = 2; ctx.stroke();
      ctx.shadowColor = palette.glow; ctx.shadowBlur = 15; ctx.fillStyle = palette.glow; ctx.fillRect(-19, -h * .47, 38, 19); ctx.shadowBlur = 0;
      ctx.strokeStyle = '#332817'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -h * .47); ctx.lineTo(0, -h * .28); ctx.stroke();
    } else if (building.id === 'bucks-store') {
      // Compact exchange house with a coin vault silhouette.
      ctx.fillStyle = '#17121f'; ctx.beginPath(); ctx.arc(0, -h * .4, 40, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = palette.trim; ctx.lineWidth = 4; ctx.stroke();
      ctx.shadowColor = palette.glow; ctx.shadowBlur = 18; ctx.strokeStyle = palette.glow; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -h * .4, 27, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = palette.sign; ctx.font = '900 24px Georgia'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('R', 0, -h * .4 + 1);
      ctx.strokeStyle = palette.trim; ctx.lineWidth = 3; [-1, 1].forEach((side) => { ctx.beginPath(); ctx.moveTo(side * 65, -h * .28); ctx.lineTo(side * 78, -h * .58); ctx.stroke(); });
      ctx.fillStyle = palette.glow; ctx.beginPath(); ctx.arc(-78, -h * .59, 4, 0, Math.PI * 2); ctx.arc(78, -h * .59, 4, 0, Math.PI * 2); ctx.fill();
    } else if (building.id === 'challenges') {
      // Arena crest and flame pylons make the challenge hall unmistakable.
      ctx.fillStyle = '#21141e'; ctx.beginPath(); ctx.moveTo(0, -h * .62); ctx.lineTo(37, -h * .46); ctx.lineTo(28, -h * .17); ctx.lineTo(0, -h * .02); ctx.lineTo(-28, -h * .17); ctx.lineTo(-37, -h * .46); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = palette.trim; ctx.lineWidth = 3; ctx.stroke();
      ctx.shadowColor = palette.glow; ctx.shadowBlur = 16; ctx.strokeStyle = palette.glow; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, -h * .34, 15, -.3, Math.PI * 1.65); ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = palette.sign; ctx.font = '900 19px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('◆', 0, -h * .34);
      [-67, 67].forEach((pylonX, index) => {
        const flame = 9 + Math.sin(time * 4 + index) * 2;
        ctx.fillStyle = '#17131a'; ctx.fillRect(pylonX - 5, -h * .42, 10, 31);
        ctx.shadowColor = palette.glow; ctx.shadowBlur = 13; ctx.fillStyle = palette.glow;
        ctx.beginPath(); ctx.moveTo(pylonX, -h * .43 - flame); ctx.quadraticCurveTo(pylonX + 9, -h * .4, pylonX, -h * .32); ctx.quadraticCurveTo(pylonX - 8, -h * .4, pylonX, -h * .43 - flame); ctx.fill(); ctx.shadowBlur = 0;
      });
    }
    ctx.restore();
  }

  function drawBuildingEntrance(building, palette, time, inRange, locked) {
    const doorY = building.door.y - building.y;
    const northFacing = doorY < 0;
    const pulse = .58 + Math.sin(time * 3) * .18;
    const thresholdY = doorY;
    const doorTop = northFacing ? thresholdY + 2 : thresholdY - 49;
    const doorHeight = 47;

    const groundLight = ctx.createRadialGradient(0, thresholdY + 2, 2, 0, thresholdY + 2, inRange ? 70 : 49);
    groundLight.addColorStop(0, locked ? 'rgba(148,124,177,.22)' : colorAlpha(palette.glow, inRange ? .36 : .2));
    groundLight.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = groundLight; ctx.beginPath(); ctx.ellipse(0, thresholdY + 4, inRange ? 72 : 50, inRange ? 23 : 16, 0, 0, Math.PI * 2); ctx.fill();

    if (northFacing) {
      // A roofed gate joins the north-facing doors to their exact road spur.
      ctx.fillStyle = '#10121a'; ctx.beginPath(); ctx.moveTo(-34, thresholdY + 10); ctx.lineTo(0, thresholdY - 15); ctx.lineTo(34, thresholdY + 10); ctx.lineTo(34, thresholdY + 19); ctx.lineTo(0, thresholdY - 5); ctx.lineTo(-34, thresholdY + 19); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = palette.trim; ctx.lineWidth = 2; ctx.stroke();
    }

    ctx.fillStyle = '#090b12'; ctx.beginPath(); roundedRect(ctx, -22, doorTop, 44, doorHeight, 7); ctx.fill();
    ctx.strokeStyle = locked ? 'rgba(176,149,198,.45)' : palette.glow; ctx.lineWidth = inRange ? 3 : 1.8; ctx.stroke();
    ctx.shadowColor = locked ? '#75617f' : palette.glow; ctx.shadowBlur = inRange ? 24 : 11;
    const doorGradient = ctx.createLinearGradient(0, doorTop, 0, doorTop + doorHeight);
    doorGradient.addColorStop(0, locked ? 'rgba(112,91,129,.4)' : colorAlpha(palette.glow, .72));
    doorGradient.addColorStop(1, 'rgba(10,10,20,.9)');
    ctx.fillStyle = doorGradient; ctx.beginPath(); roundedRect(ctx, -16, doorTop + 5, 32, doorHeight - 5, 5); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,235,183,.26)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, doorTop + 6); ctx.lineTo(0, doorTop + doorHeight - 2); ctx.stroke();

    // Animated rings and inward chevrons appear only when the player reaches
    // the actual interaction zone, creating immediate, non-click feedback.
    if (inRange) {
      ctx.strokeStyle = colorAlpha(palette.sign, .55 + pulse * .25); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, thresholdY + 5, 40 + pulse * 7, 12 + pulse * 2, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = palette.sign;
      ctx.beginPath(); ctx.moveTo(-9, thresholdY + 13); ctx.lineTo(0, thresholdY + 19); ctx.lineTo(9, thresholdY + 13); ctx.lineTo(6, thresholdY + 22); ctx.lineTo(0, thresholdY + 26); ctx.lineTo(-6, thresholdY + 22); ctx.closePath(); ctx.fill();
    } else {
      ctx.fillStyle = colorAlpha(palette.glow, .2); ctx.beginPath(); ctx.ellipse(0, thresholdY + 5, 31, 9, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawFreeCoinsTerminal(time) {
    const terminal = freeCoinsTerminal;
    const inRange = nearby && nearby.kind === 'free-coins';
    const pulse = .62 + Math.sin(time * 3.2) * .18;
    ctx.save();
    ctx.translate(terminal.x, terminal.y);
    const glow = ctx.createRadialGradient(0, 7, 3, 0, 7, inRange ? 86 : 58);
    glow.addColorStop(0, inRange ? 'rgba(247,197,72,.34)' : 'rgba(247,197,72,.18)');
    glow.addColorStop(.48, 'rgba(156,82,232,.08)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.ellipse(0, 12, inRange ? 82 : 58, inRange ? 24 : 17, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,.46)';
    ctx.beginPath(); ctx.ellipse(6, 14, 28, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111018';
    ctx.beginPath(); roundedRect(ctx, -24, -58, 48, 70, 8); ctx.fill();
    ctx.strokeStyle = inRange ? '#f3cb68' : 'rgba(232,173,53,.55)';
    ctx.lineWidth = inRange ? 3 : 2;
    ctx.stroke();
    ctx.fillStyle = '#07080d';
    ctx.beginPath(); roundedRect(ctx, -17, -48, 34, 38, 6); ctx.fill();
    const screen = ctx.createLinearGradient(0, -48, 0, -10);
    screen.addColorStop(0, 'rgba(247,211,112,.82)');
    screen.addColorStop(.52, 'rgba(139,69,245,.42)');
    screen.addColorStop(1, 'rgba(14,15,24,.96)');
    ctx.fillStyle = screen;
    ctx.beginPath(); roundedRect(ctx, -14, -45, 28, 32, 4); ctx.fill();
    ctx.shadowColor = '#f2bf43'; ctx.shadowBlur = inRange ? 18 : 8;
    ctx.fillStyle = '#f2bf43';
    ctx.font = '900 18px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('R', 0, -30);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#21140a';
    ctx.beginPath(); ctx.moveTo(-31, -59); ctx.lineTo(0, -76); ctx.lineTo(31, -59); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(247,205,101,.72)'; ctx.stroke();
    ctx.fillStyle = 'rgba(247,205,101,.92)';
    ctx.font = '900 8px system-ui';
    ctx.fillText('FREE', 0, -62);
    if (inRange) {
      ctx.strokeStyle = `rgba(247,205,101,${.45 + pulse * .3})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, 14, 44 + pulse * 8, 12 + pulse * 2, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  function drawStreetFurniture(time, cached = false) {
    lampPosts.forEach((lamp, index) => {
      if (!cached && !isWorldPointVisible(lamp.x, lamp.y, 120)) return;
      if (quality.lampEvery > 1 && index % quality.lampEvery !== 0) return;
      const flicker = .8 + Math.sin(time * 3.1 + index * 1.7) * .065 + Math.sin(time * 9.7 + index) * .018;
      ctx.save(); ctx.translate(lamp.x, lamp.y);
      const groundPool = ctx.createRadialGradient(0, 9, 2, 0, 9, 73);
      groundPool.addColorStop(0, `rgba(255,202,91,${.16 * flicker})`); groundPool.addColorStop(.42, `rgba(243,166,57,${.06 * flicker})`); groundPool.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = groundPool; ctx.beginPath(); ctx.ellipse(0, 11, 73, 27, 0, 0, Math.PI * 2); ctx.fill();
      const halo = ctx.createRadialGradient(0, -45, 2, 0, -45, 67);
      halo.addColorStop(0, `rgba(255,228,150,${.38 * flicker})`); halo.addColorStop(.18, `rgba(255,193,65,${.17 * flicker})`); halo.addColorStop(1, 'rgba(255,176,49,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, -45, 67, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.46)'; ctx.beginPath(); ctx.ellipse(5, 11, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#090b11'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, -38); ctx.stroke();
      ctx.strokeStyle = '#36323a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-1, 6); ctx.lineTo(-1, -38); ctx.stroke();
      ctx.fillStyle = '#10121a'; ctx.beginPath(); ctx.ellipse(0, 8, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#25232c'; ctx.beginPath(); ctx.moveTo(-11, -50); ctx.lineTo(-6, -58); ctx.lineTo(6, -58); ctx.lineTo(11, -50); ctx.lineTo(8, -35); ctx.lineTo(-8, -35); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#a87834'; ctx.lineWidth = 1.4; ctx.stroke();
      ctx.shadowColor = '#ffc35c'; ctx.shadowBlur = 14;
      ctx.fillStyle = `rgba(255,220,124,${flicker})`; ctx.beginPath(); roundedRect(ctx, -6, -49, 12, 11, 2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#19161b'; ctx.beginPath(); ctx.moveTo(-13, -58); ctx.lineTo(0, -65); ctx.lineTo(13, -58); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#a87834'; ctx.stroke();
      ctx.fillStyle = '#d9a541'; ctx.beginPath(); ctx.arc(0, -66, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    const benches = [{ x: 646, y: 706, flip: -1 }, { x: 994, y: 706, flip: 1 }, { x: 590, y: 502, flip: 1 }, { x: 1050, y: 502, flip: -1 }];
    benches.forEach((bench) => {
      ctx.save(); ctx.translate(bench.x, bench.y); ctx.scale(bench.flip, 1);
      ctx.fillStyle = 'rgba(0,0,0,.44)'; ctx.beginPath(); ctx.ellipse(5, 9, 30, 8, 0, 0, Math.PI * 2); ctx.fill();
      const wood = ctx.createLinearGradient(0, -12, 0, 6); wood.addColorStop(0, '#765033'); wood.addColorStop(.45, '#4b2f22'); wood.addColorStop(1, '#241b1a');
      ctx.fillStyle = wood; ctx.beginPath(); roundedRect(ctx, -27, -14, 54, 8, 2); ctx.fill(); ctx.beginPath(); roundedRect(ctx, -25, -3, 50, 7, 2); ctx.fill();
      ctx.strokeStyle = 'rgba(232,181,103,.18)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-22, -11); ctx.lineTo(22, -11); ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.stroke();
      ctx.strokeStyle = '#111219'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-20, -7); ctx.lineTo(-20, 10); ctx.moveTo(20, -7); ctx.lineTo(20, 10); ctx.stroke();
      ctx.strokeStyle = '#7a5d34'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-20, 7); ctx.lineTo(-14, 7); ctx.moveTo(20, 7); ctx.lineTo(14, 7); ctx.stroke();
      ctx.restore();
    });
  }

  function drawRick(time) {
    const inRange = Boolean(nearby && nearby.kind === 'rick');
    drawRickCharacter(rick.x, rick.y, { scale: .98, idle: time * 1.7, inRange });
    ctx.save();
    if (inRange) {
      const halo = ctx.createRadialGradient(rick.x, rick.y - 38, 5, rick.x, rick.y - 38, 65);
      halo.addColorStop(0, 'rgba(191,115,255,.18)'); halo.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(rick.x, rick.y - 38, 65, 0, Math.PI * 2); ctx.fill();
    }
    const labelY = rick.y - 103;
    ctx.shadowColor = inRange ? '#aa60ff' : 'transparent'; ctx.shadowBlur = inRange ? 14 : 0;
    ctx.fillStyle = 'rgba(7,7,15,.94)'; ctx.beginPath(); roundedRect(ctx, rick.x - 39, labelY, 78, 25, 8); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = inRange ? '#c78aff' : 'rgba(219,174,255,.42)'; ctx.lineWidth = inRange ? 2 : 1; ctx.stroke();
    ctx.fillStyle = '#f6e8ff'; ctx.font = '900 10px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('RICK · MENTOR', rick.x, labelY + 12.5);
    ctx.restore();
  }

  function drawCoin(time, coin) {
    const bounce = Math.sin(time * 3.4) * 5;
    const rotation = Math.cos(time * 2.25);
    const scaleX = .2 + Math.abs(rotation) * .8;
    const daily = coin.stage === 'daily' || coin.stage === 'daily-reward';
    const reward = coin.stage === 'daily-reward';
    const glowColor = daily ? 'rgba(184,112,255,.82)' : 'rgba(255,229,113,.82)';
    const edgeColor = daily ? '#d3a0ff' : '#ffe890';
    const faceColor = daily ? '#7d38ca' : '#ca7a08';
    const inRange = Boolean(nearby && nearby.kind === 'coin');
    ctx.fillStyle = 'rgba(0,0,0,.48)'; ctx.beginPath(); ctx.ellipse(coin.x, coin.y + 22, 20 - bounce * .3, 6, 0, 0, Math.PI*2); ctx.fill();
    ctx.save(); ctx.translate(coin.x, coin.y + bounce - 5);
    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, inRange ? 57 : 45); glow.addColorStop(0, glowColor); glow.addColorStop(.35, daily ? 'rgba(157,82,255,.24)' : 'rgba(255,192,45,.22)'); glow.addColorStop(1, daily ? 'rgba(157,82,255,0)' : 'rgba(255,192,45,0)'); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, inRange ? 57 : 45, 0, Math.PI*2); ctx.fill();
    for (let particle = 0; particle < 5; particle += 1) {
      const angle = time * .65 + particle * Math.PI * .4;
      const radius = 25 + (particle % 2) * 7;
      ctx.fillStyle = colorAlpha(edgeColor, .28 + (particle % 2) * .15);
      ctx.beginPath(); ctx.arc(Math.cos(angle) * radius, Math.sin(angle * 1.2) * 13, particle % 2 ? 1.4 : .8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.scale(scaleX, 1);
    ctx.fillStyle = '#5d3307'; ctx.beginPath(); ctx.arc(2, 1, 18, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle = edgeColor; ctx.lineWidth = 4; ctx.stroke();
    const coinFace = ctx.createLinearGradient(-14, -16, 14, 16); coinFace.addColorStop(0, edgeColor); coinFace.addColorStop(.36, faceColor); coinFace.addColorStop(1, daily ? '#441178' : '#784306');
    ctx.fillStyle = coinFace; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = colorAlpha(edgeColor, .72); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = daily ? '#180923' : '#261400'; ctx.font = 'bold 17px Georgia'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('R', 0, 1);
    ctx.fillStyle = 'rgba(255,255,255,.42)'; ctx.beginPath(); ctx.arc(-5, -7, 2.3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.fillStyle = 'rgba(5,6,13,.93)'; ctx.beginPath(); roundedRect(ctx, coin.x - 48, coin.y - 56 + bounce, 96, 19, 6); ctx.fill(); ctx.strokeStyle = inRange ? edgeColor : daily ? 'rgba(211,160,255,.62)' : 'rgba(255,224,133,.58)'; ctx.lineWidth = inRange ? 2 : 1; ctx.stroke(); ctx.fillStyle = edgeColor; ctx.font = '900 8px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(reward ? 'RECOMPENSA DIÁRIA' : `${daily ? 'MOEDA DIÁRIA' : 'RICH COIN'} · ${coin.order}/${coin.total}`, coin.x, coin.y - 46.5 + bounce); ctx.restore();
  }

  function drawMissionBeacon(time, objective) {
    const challenge = objective.kind === 'challenge-signal';
    const pulse = .5 + Math.sin(time * 2.7 + objective.order) * .2;
    const glow = challenge ? 'rgba(255,159,78,.82)' : 'rgba(86,205,255,.82)';
    const edge = challenge ? '#ffd27a' : '#a5edff';
    const core = challenge ? '#b85129' : '#277fc8';
    const title = challenge ? 'DESAFIO' : 'SINAL';
    ctx.save(); ctx.translate(objective.x, objective.y);
    const halo = ctx.createRadialGradient(0, -10, 4, 0, -10, 52);
    halo.addColorStop(0, glow); halo.addColorStop(1, challenge ? 'rgba(255,120,60,0)' : 'rgba(57,185,255,0)');
    ctx.fillStyle = halo; ctx.globalAlpha = .55 + pulse * .3; ctx.beginPath(); ctx.arc(0, -10, 52, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(0,0,0,.34)'; ctx.beginPath(); ctx.ellipse(0, 12, 22, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = edge; ctx.lineWidth = 2; ctx.globalAlpha = .38 + pulse * .45; ctx.beginPath(); ctx.ellipse(0, 10, 29 + pulse * 5, 9 + pulse * 2, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    if (challenge) {
      ctx.rotate(Math.PI / 4); ctx.fillStyle = core; ctx.beginPath(); roundedRect(ctx, -14, -24, 28, 28, 5); ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = 2; ctx.stroke(); ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = '#fff0be'; ctx.font = '900 17px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 0, -10);
    } else {
      ctx.fillStyle = core; ctx.beginPath(); ctx.arc(0, -10, 16, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#e4fbff'; ctx.font = '900 15px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('⌁', 0, -10);
    }
    ctx.fillStyle = 'rgba(7,5,14,.9)'; ctx.beginPath(); roundedRect(ctx, -37, -55, 74, 17, 5); ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = edge; ctx.font = '900 8px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`${title} ${objective.order}/${objective.total}`, 0, -46);
    ctx.restore();
  }

  function drawPlayer(time) {
    const depthScale = clamp(.86 + player.y / WORLD.height * .24, .86, 1.11);
    const idlePhase = player.isWalking ? time * 1.5 : player.idleCycle;
    drawCharacter(player.x, player.y, { scale: depthScale, suit: '#141824', accent: '#f5bd35', secondary: '#8e48ff', skin: '#d89460', hair: '#160e0d', face: player.facing, walk: player.walkCycle, moving: player.isWalking, sprint: player.sprint, idle: idlePhase, player: true });
  }

  function drawRickCharacter(x, y, options = {}) {
    const scale = options.scale || 1;
    const idle = options.idle || 0;
    const pulse = Math.sin(idle) * .7;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = 'rgba(0,0,0,.58)';
    ctx.beginPath(); ctx.ellipse(0, 10, 30, 9, 0, 0, Math.PI * 2); ctx.fill();
    if (options.inRange) {
      const aura = ctx.createRadialGradient(0, -40, 5, 0, -40, 62);
      aura.addColorStop(0, 'rgba(181,105,255,.22)');
      aura.addColorStop(1, 'rgba(181,105,255,0)');
      ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(0, -40, 62, 0, Math.PI * 2); ctx.fill();
    }
    ctx.save();
    ctx.translate(0, pulse * .3);

    // Mentor silhouette: longer coat, purple energy and calm authority. It is
    // intentionally different from the playable character.
    ctx.strokeStyle = '#111018'; ctx.lineWidth = 11; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-8, -14); ctx.lineTo(-12, 6); ctx.moveTo(8, -14); ctx.lineTo(13, 6); ctx.stroke();
    ctx.strokeStyle = '#2a2036'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-8, -14); ctx.lineTo(-12, 5); ctx.moveTo(8, -14); ctx.lineTo(13, 5); ctx.stroke();
    ctx.strokeStyle = '#080910'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(-17, 7); ctx.lineTo(-7, 7); ctx.moveTo(8, 7); ctx.lineTo(18, 7); ctx.stroke();

    ctx.strokeStyle = '#17101f'; ctx.lineWidth = 11; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-17, -42); ctx.lineTo(-23, -19); ctx.moveTo(17, -42); ctx.lineTo(24, -18); ctx.stroke();
    ctx.strokeStyle = '#4b3262'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-17, -42); ctx.lineTo(-23, -20); ctx.moveTo(17, -42); ctx.lineTo(24, -19); ctx.stroke();
    ctx.fillStyle = '#c88857'; ctx.beginPath(); ctx.arc(-23, -17, 4, 0, Math.PI * 2); ctx.arc(24, -16, 4, 0, Math.PI * 2); ctx.fill();

    const coat = ctx.createLinearGradient(-21, -51, 21, -2);
    coat.addColorStop(0, '#4a2d67');
    coat.addColorStop(.48, '#1b1327');
    coat.addColorStop(1, '#090912');
    ctx.fillStyle = coat;
    ctx.beginPath();
    ctx.moveTo(-15, -50);
    ctx.quadraticCurveTo(-25, -40, -22, -10);
    ctx.lineTo(-16, 5);
    ctx.lineTo(-4, -3);
    ctx.lineTo(0, -8);
    ctx.lineTo(4, -3);
    ctx.lineTo(16, 5);
    ctx.lineTo(22, -10);
    ctx.quadraticCurveTo(25, -40, 15, -50);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(219,169,255,.35)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#e8dfd5'; ctx.beginPath(); ctx.moveTo(-9, -48); ctx.lineTo(0, -37); ctx.lineTo(9, -48); ctx.lineTo(5, -24); ctx.lineTo(-5, -24); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f0b93e'; ctx.beginPath(); ctx.moveTo(-3, -43); ctx.lineTo(3, -43); ctx.lineTo(4, -22); ctx.lineTo(0, -17); ctx.lineTo(-4, -22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#221300'; ctx.beginPath(); ctx.arc(0, -30, 6.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f0b93e'; ctx.font = '900 7px Georgia'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('R', 0, -29.5);

    ctx.fillStyle = '#c88857'; ctx.beginPath(); roundedRect(ctx, -5, -55, 10, 13, 4); ctx.fill();
    ctx.fillStyle = '#c88857'; ctx.beginPath(); ctx.arc(0, -66, 16.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#141016'; ctx.beginPath(); ctx.arc(0, -72, 17, Math.PI, Math.PI * 2); ctx.lineTo(13, -65); ctx.quadraticCurveTo(3, -68, -1, -62); ctx.quadraticCurveTo(-8, -68, -14, -64); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#39201a';
    ctx.beginPath();
    ctx.moveTo(-11, -60);
    ctx.quadraticCurveTo(0, -53, 11, -60);
    ctx.lineTo(8, -54);
    ctx.quadraticCurveTo(0, -49, -8, -54);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#25120f'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-10, -70); ctx.lineTo(-4, -69); ctx.moveTo(4, -69); ctx.lineTo(10, -70); ctx.stroke();
    ctx.fillStyle = '#17100e'; ctx.beginPath(); ctx.arc(-6, -66, 1.45, 0, Math.PI * 2); ctx.arc(6, -66, 1.45, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(71,34,24,.65)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3.2, -57.2); ctx.quadraticCurveTo(0, -56.2, 3.2, -57.2); ctx.stroke();
    ctx.restore();
    ctx.restore();
  }

  function drawCharacter(x, y, options) {
    const scale = options.scale || 1;
    const isPlayer = Boolean(options.player);
    const accent = options.accent || '#f4bc32';
    const secondary = options.secondary || '#8e48ff';
    const walking = Boolean(options.moving) || Boolean(options.walk);
    const phase = Number(options.walk) || 0;
    const idlePhase = Number(options.idle) || 0;
    const idleBreath = !walking ? Math.sin(idlePhase * 3.2) : 0;
    const idleShift = !walking ? Math.sin(idlePhase * 1.35) : 0;
    const idleLook = !walking ? Math.sin(idlePhase * .62) : 0;
    const idleShoulder = !walking ? Math.sin(idlePhase * 2.05 + .8) : 0;
    const step = walking ? Math.sin(phase) : 0;
    const pace = options.sprint ? 1.18 : 1;
    const stride = walking ? step * 7.2 * pace : idleShift * 2.4;
    const leftLift = walking ? Math.max(0, step) * 3.2 : Math.max(0, idleShift) * 1.7;
    const rightLift = walking ? Math.max(0, -step) * 3.2 : Math.max(0, -idleShift) * 1.7;
    const bob = walking ? -Math.abs(Math.cos(phase)) * 2.1 : idleBreath * 2.35;
    const direction = options.face || 'down';
    const back = direction === 'up';
    const side = direction === 'left' || direction === 'right';
    const sideSign = direction === 'left' ? -1 : 1;

    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    // Shadow remains locked to the road while the body bobs. This single visual
    // anchor removes the old "sprite sliding" feeling.
    const shadowWidth = walking ? 24 - Math.abs(step) * 2.5 : 24;
    const shadow = ctx.createRadialGradient(0, 10, 2, 0, 10, 29);
    shadow.addColorStop(0, 'rgba(0,0,0,.64)'); shadow.addColorStop(.65, 'rgba(0,0,0,.38)'); shadow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadow; ctx.beginPath(); ctx.ellipse(0, 10, shadowWidth + 6, 9, 0, 0, Math.PI * 2); ctx.fill();
    if (isPlayer) {
      const selection = .34 + Math.sin(idlePhase * 2.3) * .12;
      ctx.strokeStyle = `rgba(245,188,55,${selection})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 10, 34, 11, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = `rgba(142,72,255,${selection * .65})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 10, 24, 7.5, 0, 0, Math.PI * 2); ctx.stroke();
    }

    // Tiny heel dust/impact puffs appear behind an actual moving foot, not as a
    // continuous trail, which reinforces planted steps.
    if (walking && Math.abs(step) > .72) {
      ctx.fillStyle = 'rgba(202,197,190,.12)';
      const impactX = step > 0 ? -11 : 11;
      ctx.beginPath(); ctx.arc(impactX, 7, 4.2, 0, Math.PI * 2); ctx.arc(impactX + (step > 0 ? -5 : 5), 5, 2.1, 0, Math.PI * 2); ctx.fill();
    }

    ctx.save();
    ctx.translate(side ? sideSign * Math.abs(step) * .8 : idleShift * 2.1, bob);
    if (isPlayer && !walking) ctx.rotate(idleShift * .04);

    if (isPlayer) {
      const bodyGlow = ctx.createRadialGradient(0, -42, 2, 0, -42, 47);
      bodyGlow.addColorStop(0, 'rgba(142,72,255,.13)');
      bodyGlow.addColorStop(.46, 'rgba(245,189,53,.05)');
      bodyGlow.addColorStop(1, 'rgba(142,72,255,0)');
      ctx.fillStyle = bodyGlow;
      ctx.beginPath(); ctx.ellipse(0, -42, 34, 50, 0, 0, Math.PI * 2); ctx.fill();
    }

    const drawLeg = (hipX, footX, lift, rear) => {
      ctx.strokeStyle = rear ? '#080a10' : (isPlayer ? '#151927' : '#171b27'); ctx.lineCap = 'round'; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(hipX, -13); ctx.lineTo(footX, 4 - lift); ctx.stroke();
      ctx.strokeStyle = rear ? '#242838' : (isPlayer ? '#3b4156' : '#34394a'); ctx.lineWidth = 4.5;
      ctx.beginPath(); ctx.moveTo(hipX - .5, -13); ctx.lineTo(footX - .5, 3 - lift); ctx.stroke();
      ctx.strokeStyle = '#07080d'; ctx.lineWidth = 6.5;
      ctx.beginPath(); ctx.moveTo(footX - (side ? sideSign * 1 : 4), 6 - lift); ctx.lineTo(footX + (side ? sideSign * 8 : 5), 6 - lift); ctx.stroke();
      ctx.strokeStyle = isPlayer ? 'rgba(245,189,53,.78)' : 'rgba(243,185,56,.38)'; ctx.lineWidth = isPlayer ? 1.65 : 1.2;
      ctx.beginPath(); ctx.moveTo(footX - 2, 4.5 - lift); ctx.lineTo(footX + 4, 4.5 - lift); ctx.stroke();
      if (isPlayer) {
        ctx.fillStyle = 'rgba(142,72,255,.5)';
        ctx.beginPath(); ctx.arc(footX + (side ? sideSign * 7 : 4), 5.8 - lift, 1.7, 0, Math.PI * 2); ctx.fill();
      }
    };

    if (side) {
      drawLeg(-2, -stride * .6, leftLift, step < 0);
      drawLeg(3, stride * .6, rightLift, step >= 0);
    } else {
      const leftFootX = -7 + stride * .38;
      const rightFootX = 7 - stride * .38;
      if (step > 0) { drawLeg(5, rightFootX, rightLift, true); drawLeg(-5, leftFootX, leftLift, false); }
      else { drawLeg(-5, leftFootX, leftLift, true); drawLeg(5, rightFootX, rightLift, false); }
    }

    // Opposing arm swing gives all four directional poses a convincing gait.
    const armSwing = walking ? stride * .58 : idleShift * 2.8;
    const drawArm = (shoulderX, handX, rear) => {
      ctx.strokeStyle = rear ? '#0b0e16' : (isPlayer ? '#191e2c' : '#1b202d'); ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(shoulderX, -40); ctx.lineTo(handX, -19); ctx.stroke();
      ctx.strokeStyle = rear ? '#272b39' : (isPlayer ? '#464d63' : '#3a4052'); ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(shoulderX, -40); ctx.lineTo(handX, -19); ctx.stroke();
      ctx.fillStyle = options.skin; ctx.beginPath(); ctx.arc(handX, -17, 4.2, 0, Math.PI * 2); ctx.fill();
      if (isPlayer && !rear) {
        ctx.strokeStyle = accent; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(handX, -17, 5.4, 0, Math.PI * 2); ctx.stroke();
      }
    };
    if (!walking) {
      drawArm(13 + idleShoulder * 1.1, 18 + idleShift * 3.8, true);
      drawArm(-13 - idleShoulder * 1.1, -18 - idleShift * 4.2, false);
    } else if (step > 0) { drawArm(13, 19 + armSwing, true); drawArm(-13, -19 - armSwing, false); }
    else { drawArm(-13, -19 - armSwing, true); drawArm(13, 19 + armSwing, false); }

    // Player outfit: short bomber/tech jacket + sneakers. No robe, no graduation
    // silhouette — it should read as a modern game protagonist.
    const jacket = ctx.createLinearGradient(-19, -49, 18, -7);
    jacket.addColorStop(0, isPlayer ? '#30384d' : '#41485b'); jacket.addColorStop(.35, options.suit); jacket.addColorStop(1, '#070910');
    if (isPlayer) {
      ctx.fillStyle = '#080a11';
      ctx.beginPath(); roundedRect(ctx, -13, -28, 26, 24, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(142,72,255,.34)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-15, -35); ctx.lineTo(-18, -12); ctx.moveTo(15, -35); ctx.lineTo(18, -12); ctx.stroke();
    }
    ctx.fillStyle = jacket;
    ctx.beginPath();
    ctx.moveTo(-14, -48);
    ctx.quadraticCurveTo(-20, -43, -19, -30);
    ctx.lineTo(-16, -12);
    ctx.quadraticCurveTo(-7, -7, 0, -9);
    ctx.quadraticCurveTo(7, -7, 16, -12);
    ctx.lineTo(19, -30);
    ctx.quadraticCurveTo(20, -43, 14, -48);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = isPlayer ? 'rgba(245,189,53,.24)' : 'rgba(255,255,255,.17)'; ctx.lineWidth = 1; ctx.stroke();
    if (isPlayer) {
      ctx.fillStyle = '#0b0d15'; ctx.beginPath(); roundedRect(ctx, -8, -43, 16, 29, 5); ctx.fill();
      ctx.strokeStyle = accent; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, -43); ctx.lineTo(0, -15); ctx.stroke();
      ctx.fillStyle = secondary; ctx.beginPath(); ctx.arc(0, -29, 2.4, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(4,6,11,.46)'; ctx.beginPath(); ctx.moveTo(-15, -10); ctx.lineTo(-3, -7); ctx.lineTo(0, -13); ctx.lineTo(3, -7); ctx.lineTo(15, -10); ctx.lineTo(13, 0); ctx.lineTo(0, -5); ctx.lineTo(-13, 0); ctx.closePath(); ctx.fill();
    }

    if (back) {
      ctx.strokeStyle = accent; ctx.lineWidth = isPlayer ? 2.2 : 1.6; ctx.beginPath(); ctx.moveTo(-13, -45); ctx.quadraticCurveTo(0, -37, 13, -45); ctx.stroke();
      if (isPlayer) {
        ctx.strokeStyle = secondary; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-10, -36); ctx.quadraticCurveTo(0, -31, 10, -36); ctx.stroke();
      }
      ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(0, -29, isPlayer ? 7 : 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#241500'; ctx.font = '900 7px Georgia'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('R', 0, -28.5);
    } else if (side) {
      ctx.fillStyle = '#dcd7d1'; ctx.beginPath(); ctx.moveTo(sideSign * 1, -46); ctx.lineTo(sideSign * 9, -41); ctx.lineTo(sideSign * 4, -27); ctx.closePath(); ctx.fill();
      ctx.fillStyle = accent; ctx.beginPath(); ctx.moveTo(sideSign * 3, -43); ctx.lineTo(sideSign * 7, -40); ctx.lineTo(sideSign * 5, -25); ctx.lineTo(sideSign * 1, -21); ctx.closePath(); ctx.fill();
      if (isPlayer) {
        ctx.fillStyle = secondary; ctx.beginPath(); ctx.arc(-sideSign * 8, -30, 2.4, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      ctx.fillStyle = '#dcd7d1'; ctx.beginPath(); ctx.moveTo(-8, -47); ctx.lineTo(0, -38); ctx.lineTo(8, -47); ctx.lineTo(5, -28); ctx.lineTo(-5, -28); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(9,11,17,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-8, -47); ctx.lineTo(-2, -34); ctx.moveTo(8, -47); ctx.lineTo(2, -34); ctx.stroke();
      ctx.fillStyle = accent; ctx.beginPath(); ctx.moveTo(-3, -42); ctx.lineTo(3, -42); ctx.lineTo(3.4, -25); ctx.lineTo(0, -20); ctx.lineTo(-3.4, -25); ctx.closePath(); ctx.fill();
      ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(12, -22, 2.3, 0, Math.PI * 2); ctx.fill();
      if (isPlayer) {
        ctx.fillStyle = '#211400'; ctx.beginPath(); ctx.arc(-11, -24, 3.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = accent; ctx.font = '900 6px Georgia'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('R', -11, -23.7);
        ctx.strokeStyle = secondary; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(-15, -35); ctx.lineTo(-15, -15); ctx.moveTo(15, -35); ctx.lineTo(15, -15); ctx.stroke();
      }
    }

    ctx.save();
    if (isPlayer && !walking) ctx.translate(idleLook * 1.9, Math.abs(idleBreath) * -.55);

    // Neck and head are direction-aware, including a clean back silhouette,
    // side profile and stronger front expression.
    ctx.fillStyle = options.skin; ctx.beginPath(); roundedRect(ctx, -5, -55, 10, 13, 4); ctx.fill();
    ctx.fillStyle = options.skin; ctx.beginPath(); ctx.arc(0, -65, 15.7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(91,42,23,.08)'; ctx.beginPath(); ctx.ellipse(side ? -sideSign * 3 : 0, -59, 10, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    if (side) {
      ctx.fillStyle = options.skin; ctx.beginPath(); ctx.arc(sideSign * 15, -65, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = options.hair;
    if (back) {
      ctx.beginPath(); ctx.arc(0, -67, 17.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2c1717'; ctx.beginPath(); ctx.arc(0, -62, 13.5, 0, Math.PI); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.arc(-6, -74, 5, Math.PI, Math.PI * 1.8); ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 2; ctx.stroke();
    } else if (side) {
      ctx.beginPath(); ctx.arc(-sideSign * 2, -70, 16.5, Math.PI, Math.PI * 2); ctx.lineTo(sideSign * 11, -64); ctx.lineTo(-sideSign * 14, -63); ctx.closePath(); ctx.fill();
      // Clean profile: smaller mouth/beard shape so the face does not dominate.
      ctx.fillStyle = '#4b271c'; ctx.beginPath(); ctx.moveTo(sideSign * 6, -58); ctx.lineTo(sideSign * 12, -59); ctx.lineTo(sideSign * 9, -55); ctx.lineTo(sideSign * 4, -55); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#21120f'; ctx.beginPath(); ctx.arc(sideSign * 7, -66, 1.7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#2a1611'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(sideSign * 4, -70); ctx.lineTo(sideSign * 10, -69); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(sideSign * 7.5, -66.5, .55, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(0, -71, 16.7, Math.PI, Math.PI * 2); ctx.lineTo(14, -65); ctx.quadraticCurveTo(4, -67, 0, -62); ctx.quadraticCurveTo(-7, -68, -14, -64); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4b271c'; ctx.beginPath(); ctx.moveTo(-8, -59.5); ctx.quadraticCurveTo(0, -55.2, 8, -59.5); ctx.lineTo(6, -56); ctx.quadraticCurveTo(0, -53.8, -6, -56); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#2b1712'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-10, -70); ctx.lineTo(-4, -69); ctx.moveTo(4, -69); ctx.lineTo(10, -70); ctx.stroke();
      ctx.fillStyle = '#20110f'; ctx.beginPath(); ctx.arc(-6, -66, 1.7, 0, Math.PI * 2); ctx.arc(6, -66, 1.7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.78)'; ctx.beginPath(); ctx.arc(-6.3, -66.4, .55, 0, Math.PI * 2); ctx.arc(5.7, -66.4, .55, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(79,35,24,.68)'; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(-2.7, -57.2); ctx.quadraticCurveTo(0, -56.4, 2.7, -57.2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,226,199,.28)'; ctx.beginPath(); ctx.arc(-6, -75, 4.2, 0, Math.PI * 2); ctx.fill();
    }

    if (isPlayer) {
      // Compact protagonist marker: closer to the head and built like a premium
      // crest, so it reads as identity instead of a loose floating pointer.
      const crestPulse = .72 + Math.sin((options.idle || 0) * 2.2) * .12;
      ctx.shadowColor = accent; ctx.shadowBlur = 10;
      ctx.strokeStyle = `rgba(245,189,53,${crestPulse})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, -88, 9, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(8,7,13,.94)'; ctx.beginPath(); ctx.arc(0, -88, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = accent; ctx.beginPath(); ctx.moveTo(0, -95); ctx.lineTo(6, -88); ctx.lineTo(0, -81); ctx.lineTo(-6, -88); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#261500'; ctx.font = '900 7px Georgia'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('R', 0, -87.7);
    }
    ctx.restore();
    ctx.restore();
    ctx.restore();
  }

  function drawScenery(layer, time, cached = false) {
    scenery.filter((item, index) => item.layer === layer && (quality.sceneryEvery <= 1 || index % quality.sceneryEvery === 0)).forEach((item) => {
      if (!cached && !isWorldPointVisible(item.x, item.y, item.size ? item.size * 2.5 : 100)) return;
      if (item.type === 'tree') drawTree(item, time);
      else drawRock(item);
    });
  }
  function drawTree(item, time) {
    const sway = Math.sin(time * .78 + item.seed) * 1.05;
    const size = item.size;
    ctx.save(); ctx.translate(item.x, item.y);
    ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.ellipse(8, 13, size * .9, size * .31, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#211a16'; ctx.beginPath(); roundedRect(ctx, -4, -size * .31, 8, size * .72, 3); ctx.fill();
    ctx.fillStyle = '#5a3e28'; ctx.fillRect(-2.5, -size * .29, 2.5, size * .66);
    ctx.translate(sway, 0);

    // Three overlapping crown masses build a stylized, dimensional canopy.
    const crowns = [
      { x: -size * .23, y: -size * .43, r: size * .48 },
      { x: size * .25, y: -size * .38, r: size * .43 },
      { x: 0, y: -size * .72, r: size * .52 },
    ];
    crowns.forEach((crown, index) => {
      const canopy = ctx.createRadialGradient(crown.x - crown.r * .3, crown.y - crown.r * .38, 1, crown.x, crown.y, crown.r);
      canopy.addColorStop(0, index === 2 ? '#41634a' : '#31513d');
      canopy.addColorStop(.42, '#1c3b2e');
      canopy.addColorStop(1, '#071c18');
      ctx.fillStyle = canopy; ctx.beginPath(); ctx.arc(crown.x, crown.y, crown.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(111,159,121,.12)'; ctx.lineWidth = 1; ctx.stroke();
    });
    ctx.fillStyle = 'rgba(148,196,144,.12)'; ctx.beginPath(); ctx.arc(-size * .16, -size * .9, size * .22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(120,78,177,.085)'; ctx.beginPath(); ctx.arc(size * .34, -size * .5, size * .18, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(9,19,17,.42)'; ctx.lineWidth = 1;
    for (let branch = 0; branch < 4; branch += 1) {
      const angle = -2.6 + branch * .9;
      ctx.beginPath(); ctx.moveTo(0, -size * .35); ctx.lineTo(Math.cos(angle) * size * .52, -size * .55 + Math.sin(angle) * size * .2); ctx.stroke();
    }
    ctx.restore();
  }
  function drawRock(item) {
    const size = item.size;
    ctx.save(); ctx.translate(item.x, item.y);
    ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.ellipse(4, 7, size * .84, size * .34, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#292d35'; ctx.beginPath(); ctx.moveTo(-size * .66, 1); ctx.lineTo(-size * .26, -size * .74); ctx.lineTo(size * .31, -size * .66); ctx.lineTo(size * .68, -size * .17); ctx.lineTo(size * .58, size * .41); ctx.lineTo(-size * .45, size * .48); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#454b55'; ctx.beginPath(); ctx.moveTo(-size * .26, -size * .74); ctx.lineTo(size * .31, -size * .66); ctx.lineTo(size * .05, -size * .07); ctx.lineTo(-size * .66, 1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#343641'; ctx.beginPath(); ctx.moveTo(size * .31, -size * .66); ctx.lineTo(size * .68, -size * .17); ctx.lineTo(size * .05, -size * .07); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(196,186,216,.18)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-size * .26, -size * .72); ctx.lineTo(size * .3, -size * .64); ctx.stroke();
    ctx.restore();
  }

  function drawAtmosphere(time) {
    ctx.save();
    // Screen-space mist never affects gameplay coordinates and stays faint
    // enough that roads, prompts and the player remain immediately legible.
    ctx.globalCompositeOperation = 'screen';
    const bands = [
      { x: -.1, y: .82, w: .58, h: .17, speed: .014, color: 'rgba(77,89,134,.026)' },
      { x: .43, y: .72, w: .64, h: .14, speed: -.011, color: 'rgba(112,72,154,.024)' },
      { x: .7, y: .91, w: .48, h: .13, speed: .008, color: 'rgba(80,120,118,.02)' },
    ];
    bands.slice(0, quality.atmosphereBands).forEach((band, index) => {
      const drift = Math.sin(time * band.speed + index * 2.3) * view.width * .09;
      const cx = view.width * band.x + drift;
      const cy = view.height * band.y;
      const radius = Math.max(120, view.width * band.w);
      const fog = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
      fog.addColorStop(0, band.color); fog.addColorStop(.58, band.color); fog.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = fog; ctx.beginPath(); ctx.ellipse(cx, cy, radius, Math.max(55, view.height * band.h), -.06, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();

    // A very light cinematic grade unifies canvas colors without flattening
    // the local building and lamplight contrast.
    const grade = ctx.createLinearGradient(0, 0, view.width, view.height);
    grade.addColorStop(0, 'rgba(47,53,111,.045)'); grade.addColorStop(.46, 'rgba(0,0,0,0)'); grade.addColorStop(1, 'rgba(38,8,54,.055)');
    ctx.fillStyle = grade; ctx.fillRect(0, 0, view.width, view.height);
  }

  function drawVignette(time) {
    const gradient = ctx.createRadialGradient(view.width / 2, view.height / 2, Math.min(view.width, view.height) * .32, view.width / 2, view.height / 2, Math.max(view.width, view.height) * .82);
    gradient.addColorStop(.46, 'rgba(0,0,0,0)'); gradient.addColorStop(.79, 'rgba(0,0,0,.16)'); gradient.addColorStop(1, 'rgba(0,0,0,.61)'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, view.width, view.height);
    const topShade = ctx.createLinearGradient(0, 0, 0, view.height * .34);
    topShade.addColorStop(0, 'rgba(1,3,9,.31)'); topShade.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = topShade; ctx.fillRect(0, 0, view.width, view.height * .38);
    ctx.fillStyle = `rgba(255,244,214,${.012 + Math.sin(time * .23) * .002})`;
    for (let i = 0; i < quality.vignetteStars; i += 1) {
      const x = (i * 173 + 43) % Math.max(1, view.width);
      const y = (i * 97 + 61) % Math.max(1, view.height);
      ctx.fillRect(x, y, .65, .65);
    }
  }

  function makeScenery() {
    const items = [];
    let seed = 13849;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < 112; i += 1) {
      const x = 45 + random() * (WORLD.width - 90), y = 45 + random() * (WORLD.height - 90);
      if (isWalkable({ x, y }) || buildings.some((b) => x > b.body.x - 45 && x < b.body.x + b.body.w + 45 && y > b.body.y - 45 && y < b.body.y + b.body.h + 45)) continue;
      const type = random() > .2 ? 'tree' : 'rock';
      items.push({ x, y, type, size: type === 'tree' ? 20 + random()*16 : 7 + random()*9, layer: y > 900 ? 'front' : 'rear', seed: random() * 9 });
    }
    return items;
  }

  function roundedRect(context, x, y, width, height, radius) {
    if (context.roundRect) { context.roundRect(x, y, width, height, radius); return; }
    const r = Math.min(radius, width / 2, height / 2);
    context.moveTo(x + r, y); context.arcTo(x + width, y, x + width, y + height, r); context.arcTo(x + width, y + height, x, y + height, r); context.arcTo(x, y + height, x, y, r); context.arcTo(x, y, x + width, y, r); context.closePath();
  }

  function onKeyDown(event) {
    if (!running) return;
    if (bucksStoreOpen) {
      const previous = ['ArrowUp', 'ArrowLeft', 'KeyW', 'KeyA'];
      const next = ['ArrowDown', 'ArrowRight', 'KeyS', 'KeyD'];
      if (!event.repeat && previous.includes(event.code)) { event.preventDefault(); moveBucksStoreSelection(-1); return; }
      if (!event.repeat && next.includes(event.code)) { event.preventDefault(); moveBucksStoreSelection(1); return; }
      if ((event.code === 'KeyE' || event.code === 'Space') && !event.repeat) { event.preventDefault(); interact(); return; }
      if (event.code === 'Escape') { event.preventDefault(); closeBucksStore(); }
      return;
    }
    if (freeCoinsPanelOpen) {
      const previous = ['ArrowUp', 'ArrowLeft', 'KeyW', 'KeyA'];
      const next = ['ArrowDown', 'ArrowRight', 'KeyS', 'KeyD'];
      if (!event.repeat && previous.includes(event.code)) { event.preventDefault(); moveFreeCoinsSelection(-1); return; }
      if (!event.repeat && next.includes(event.code)) { event.preventDefault(); moveFreeCoinsSelection(1); return; }
      if ((event.code === 'KeyE' || event.code === 'Space') && !event.repeat) { event.preventDefault(); interact(); return; }
      if (event.code === 'Escape') { event.preventDefault(); closeFreeCoinsPanel(); }
      return;
    }
    if (mentorshipPanelOpen) {
      const previous = ['ArrowUp', 'ArrowLeft', 'KeyW', 'KeyA'];
      const next = ['ArrowDown', 'ArrowRight', 'KeyS', 'KeyD'];
      if (!event.repeat && previous.includes(event.code)) { event.preventDefault(); moveMentorshipSelection(-1); return; }
      if (!event.repeat && next.includes(event.code)) { event.preventDefault(); moveMentorshipSelection(1); return; }
      if ((event.code === 'KeyE' || event.code === 'Space') && !event.repeat) { event.preventDefault(); interact(); return; }
      if (event.code === 'Escape') { event.preventDefault(); backFromMentorshipPanel(); }
      return;
    }
    if (learningPanelOpen) {
      const previous = ['ArrowUp', 'ArrowLeft', 'KeyW', 'KeyA'];
      const next = ['ArrowDown', 'ArrowRight', 'KeyS', 'KeyD'];
      if (!event.repeat && previous.includes(event.code)) { event.preventDefault(); moveLearningChoice(-1); return; }
      if (!event.repeat && next.includes(event.code)) { event.preventDefault(); moveLearningChoice(1); return; }
      if ((event.code === 'KeyE' || event.code === 'Space') && !event.repeat) { event.preventDefault(); interact(); return; }
      if (event.code === 'Escape') { event.preventDefault(); closeLearningPanel(); }
      return;
    }
    const movementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight'];
    if (movementKeys.includes(event.code)) { keys[event.code] = true; event.preventDefault(); }
    if ((event.code === 'KeyE' || event.code === 'Space') && !event.repeat) { event.preventDefault(); interact(); }
    if (event.code === 'Escape' && labPanelOpen) { event.preventDefault(); closeLabPanel(); }
    else if (event.code === 'Escape' && knowledgePanelOpen) { event.preventDefault(); closeKnowledgePanel(); }
    else if (event.code === 'Escape' && dialogueState) { event.preventDefault(); closeDialogue(); }
  }
  function onKeyUp(event) {
    if (event.code in keys) {
      keys[event.code] = false;
      persistPlayerPosition(true);
    }
  }

  function setupTouchControls() {
    const mapping = { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD' };
    document.querySelectorAll('[data-touch]').forEach((button) => {
      const code = mapping[button.dataset.touch];
      const down = (event) => {
        event.preventDefault();
        if (bucksStoreOpen) {
          moveBucksStoreSelection(code === 'KeyW' || code === 'KeyA' ? -1 : 1);
          return;
        }
        if (freeCoinsPanelOpen) {
          moveFreeCoinsSelection(code === 'KeyW' || code === 'KeyA' ? -1 : 1);
          return;
        }
        if (mentorshipPanelOpen) {
          moveMentorshipSelection(code === 'KeyW' || code === 'KeyA' ? -1 : 1);
          return;
        }
        if (learningPanelOpen) {
          moveLearningChoice(code === 'KeyW' || code === 'KeyA' ? -1 : 1);
          return;
        }
        keys[code] = true;
      };
      const up = (event) => { event.preventDefault(); keys[code] = false; };
      button.addEventListener('pointerdown', down); button.addEventListener('pointerup', up); button.addEventListener('pointercancel', up); button.addEventListener('pointerleave', up);
    });
    $('#touch-action').addEventListener('pointerdown', (event) => { event.preventDefault(); interact(); });
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', () => {
    Object.keys(keys).forEach((key) => { keys[key] = false; });
    persistPlayerPosition(true);
  });
  window.addEventListener('beforeunload', () => persistPlayerPosition(true));
  document.addEventListener('visibilitychange', () => { if (document.hidden) persistPlayerPosition(true); });
  window.addEventListener('resize', () => { if (running) resize(); });
  setupLogin();
  setupTouchControls();
})();
