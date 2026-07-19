/**
 * SISTEMA DE CLASSES - DADOS
 * Estrutura centralizada com habilidades básicas e avançadas
 * ORGANIZADO POR RARIDADE: Comum → Raro → Épico → Lendário → Mítico
 */

const CLASSES_DATABASE = [
  // ============================================
  // CLASSES COMUNS - FUNDAÇÃO (11 classes)
  // ============================================
  {
    id: "guerreiro",
    nome: "Guerreiro",
    raridade: "comum",
    descricao: "A origem do Guerreiro reside na necessidade primordial de defesa e ataque, forjada nas linhas de frente de incontáveis batalhas. Eles são a espinha dorsal de qualquer exército, treinados desde cedo no manejo de todas as armas e armaduras, valorizando a disciplina e a força bruta acima de tudo.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/0uGU22m.png",
    atributos: {
      forca: "2d8+6",
      vitalidade: "2d6+4",
      agilidade: "2d6+4",
      inteligencia: "1d4+6",
      percepcao: "2d6+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Provocação",
        descricao: "O Guerreiro emite um grito de guerra estrondoso, forçando todos os inimigos em um raio de 5 metros a atacá-lo por 3 segundos. Além disso, os alvos afetados recebem uma penalidade de provocação (Condição).",
        tipo: "Imediata",
        alcance: "5 m",
        alvos: "no alcance",
        custo: "3 FaD",
        recarga: "3",
        duracao: "1 T",
        dado: "N/A",
        bonus: [
          "Força todos os inimigos a atacar",
          "Aplica penalidade de provocação",
          "Controle de campo tático"
        ]
      },
      {
        nome: "Postura Defensiva",
        descricao: "O Guerreiro assume uma postura defensiva, ganhando aumento de defesa (Condição) aumentando sua armadura. Enquanto nesta postura, cada vez que o Guerreiro é atingido por um ataque (corpo a corpo ou à distância), ele gera 1 Carga de Retaliação. Pode acumular até 5 Cargas.",
        tipo: "Duradoura",
        alcance: "CaC",
        alvos: "1",
        custo: "0 FaD",
        recarga: "3",
        duracao: "3 T",
        dado: "N/A",
        bonus: [
          "Aumento de defesa",
          "Gera Cargas de Retaliação",
          "Proteção progressiva"
        ]
      },
      {
        nome: "Ruptura",
        descricao: "O Guerreiro realiza um poderoso golpe circular com sua arma, causando 4d8 do seu Dano de Ataque como dano físico a todos os inimigos em um raio de 3 metros. Inimigos que estiverem sob o efeito de Provocação no momento do golpe são derrubados, interrompendo suas ações e impedindo-os de atacar ou se mover.",
        tipo: "Imediata",
        alcance: "3m",
        alvos: "3 a 5",
        custo: "7 FaD",
        recarga: "3",
        duracao: "3 T",
        dado: "4d8",
        bonus: [
          "Golpe em área",
          "Derruba inimigos provocados",
          "Interrompe ações"
        ]
      },
      {
        nome: "Executar",
        descricao: "O Guerreiro concentra toda a sua fúria em um único ataque devastador (6d8). Esta habilidade consome todas as Cargas de Retaliação acumuladas pela Postura Defensiva. Para cada Carga consumida, o dano base da habilidade é aumentado em um dado (+ 1dn). Se o alvo estiver derrubado (por exemplo, pelo Ruptura), este ataque causa um acerto crítico garantido e ignora 50% da defesa do alvo.",
        tipo: "Duradoura",
        alcance: "3m",
        alvos: "3 a 5",
        custo: "7 FaD",
        recarga: "3",
        duracao: "3 T",
        dado: "6d8",
        bonus: [
          "Ataque devastador",
          "Aumenta com Cargas de Retaliação",
          "Crítico garantido em alvo derrubado"
        ]
      },
      {
        nome: "Investida Tempestuosa",
        descricao: "O Guerreiro avança rapidamente em linha reta por até 10 metros, atordoando (Condição) o primeiro inimigo atingido sofre 250% do seu Dano de Ataque como dano físico. O efeito de aumento, só aumenta valores físicos do próprio personagem!",
        tipo: "Imediata",
        alcance: "10 m",
        alvos: "No alcance",
        custo: "17 FaD",
        recarga: "5",
        duracao: "1 T",
        dado: "N/A",
        bonus: [
          "Movimento até 10m",
          "Atordoa primeiro inimigo",
          "Dano de 250% do Ataque"
        ]
      },
      {
        nome: "Dilacerar",
        descricao: "O Guerreiro desfere um golpe brutal que causa 8d6 do seu Dano de Ataque como dano físico inicial e aplica um efeito de Sangramento (Condição).",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "9 FaD",
        recarga: "3",
        duracao: "1 T",
        dado: "8d6",
        bonus: [
          "Golpe brutal",
          "Aplica Sangramento",
          "Dano físico massivo"
        ]
      },
      {
        nome: "Frenesi",
        descricao: "O Guerreiro entra em um estado de fúria (Condição). Se o Guerreiro estiver atacando um alvo que está Sangrando, os bônus de Dano são aumentados em dois dados adicionais (+2dn).",
        tipo: "Sustentada",
        alcance: "n/d",
        alvos: "n/d",
        custo: "3 FaD",
        recarga: "4",
        duracao: "0",
        dado: "N/A",
        bonus: [
          "Estado de fúria",
          "+2dn contra alvos sangrando"
        ]
      },
      {
        nome: "Projeção de Eco",
        descricao: "O Mago dispara um feixe de energia arcana que causa 6d12 de dano arcano ao alvo e o marca com Eco Temporal. Se o alvo marcado for atingido por outra habilidade do Mago (excluindo Projeção de Eco), o Eco Temporal é ativado, repetindo 50% do dano da habilidade ativadora e aplicando 1 acúmulo de Instabilidade Espacial ao alvo. O Eco Temporal é consumido após a ativação.",
        tipo: "Imediata",
        alcance: "12 metros",
        alvos: "Único",
        custo: "23 EnR",
        recarga: "8",
        duracao: "6 segundos",
        dado: "6d12",
        bonus: ["Marca com Eco Temporal", "Repete 50% do dano ativador", "Aplica Instabilidade Espacial"]
      },
      {
        nome: "Salto Dimensional",
        descricao: "O Mago se teleportar instantaneamente para um local alvo, deixando para trás uma Imagem Residual por 3 segundos. Se um inimigo tocar a Imagem Residual, ela explode, causando 3d12+16 de dano arcano e aplicando 1 acúmulo de Instabilidade Espacial. A Imagem Residual também explode automaticamente ao final da duração.",
        tipo: "Imediata",
        alcance: "15 metros",
        alvos: "Pessoal (Teleporte)",
        custo: "17 EnR",
        recarga: "3",
        duracao: "0",
        dado: "3d12",
        bonus: ["Teleporte instantâneo", "Imagem Residual explosiva", "Deixa armadilha mágica"]
      },
      {
        nome: "Colapso de Realidade",
        descricao: "O Mago força um colapso localizado na realidade, causando uma explosão massiva de dano arcano. O dano base é de 12d8 de dano mágico. Todos os efeitos de Fenda de Mana e Ecos Temporais ativos na área são consumidos. Para cada efeito consumido, o dano da habilidade é aumentado em 10% e inimigos na área são atordoados (Condição).",
        tipo: "Imediata",
        alcance: "25 metros",
        alvos: "Área de 6 metros",
        custo: "29 EnR",
        recarga: "60",
        duracao: "0",
        dado: "12d8",
        bonus: ["Explosão massiva", "+10% dano por efeito consumido", "Atordoa na área"]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "arqueiro",
    nome: "Arqueiro",
    raridade: "comum",
    descricao: "O Arqueiro nasce da necessidade de caça e reconhecimento, evoluindo para um especialista em combate à distância e emboscadas silenciosas. Sua origem está nas florestas e montanhas, onde a paciência e a precisão são virtudes essenciais para a sobrevivência e o sucesso na batalha. Eles são mestres na arte da camuflagem e do rastreamento, transformando qualquer terreno em uma vantagem tática contra inimigos desavisados.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/2g9gQep.png",
    funcoes: ["Control DPS", "OFF Suporting"],
    atributos: {
      forca: "1d4+6",
      vitalidade: "2d6+4",
      agilidade: "2d8+6",
      inteligencia: "1d4+6",
      percepcao: "2d10+6",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Passo Evasivo",
        descricao: "O arqueiro realiza um deslocamento rápido de até 5m sem provocar ataques de oportunidade, recebendo +1 em Evasão até o início do próximo turno.",
        tipo: "Imediata",
        alcance: "3 m",
        alvos: "no alcance",
        custo: "5 FaD",
        recarga: "1",
        duracao: "Imediata",
        dado: "1d4",
        bonus: ["Movimento seguro", "+1 Evasão", "Mobilidade tática"]
      },
      {
        nome: "Ritmo do Caçador",
        descricao: "Enquanto durar, os alvos recebem +20% em Prontidão e +1 em Precisão, representando coordenação de movimento e leitura de combate.",
        tipo: "Duradoura",
        alcance: "7 m",
        alvos: "2",
        custo: "10 FaD",
        recarga: "4",
        duracao: "Duradoura",
        dado: "1d6",
        bonus: ["+20% Prontidão", "+1 Precisão", "Coordenação de grupo"]
      },
      {
        nome: "Chuva de Flechas",
        descricao: "O arqueiro dispara múltiplas flechas em arco alto, causando nd6 de dano AOE onde n = quantidade de flechas jogadas (1 flecha = 2 de fadiga).",
        tipo: "Imediata",
        alcance: "9 m",
        alvos: "no alcance",
        custo: "17 FaD",
        recarga: "3",
        duracao: "Imediata",
        dado: "2d6",
        bonus: ["AOE variável", "Dano em área", "Controle de espaço"]
      },
      {
        nome: "Foco Absoluto",
        descricao: "Enquanto Sustentada, o arqueiro recebe a condição concentração, mas não pode se mover. Aumenta precisão significativamente.",
        tipo: "Sustentada",
        alcance: "CaC",
        alvos: "Jogador",
        custo: "5 FaD",
        recarga: "3",
        duracao: "Sustentada",
        dado: "1d6",
        bonus: ["Concentração máxima", "Imobilidade tática", "Precisão aumentada"]
      },
      {
        nome: "Armadilha de Espinhos",
        descricao: "O Arqueiro posiciona uma armadilha de espinhos no chão. A armadilha fica camuflada para inimigos e é ativada quando um inimigo pisa nela ou é atingido por Chuva de Flechas ou Disparo Explosivo. Ao ser ativada, causa 4d8+6 de dano físico a todos os inimigos em um raio de 2 metros e reduz a velocidade de prontidão em 20%.",
        tipo: "Duradoura",
        alcance: "5 metros",
        alvos: "Área de 2 metros",
        custo: "11 FaD",
        recarga: "2",
        duracao: "0",
        dado: "4d8",
        bonus: ["Armadilha camuflada", "Ativa automaticamente", "Reduz prontidão 20%"]
      },
      {
        nome: "Chuva de Flechas",
        descricao: "O Arqueiro dispara uma saraivada de flechas em uma área alvo por 3 segundos, causando 30% do seu Dano de Ataque como dano físico a cada segundo a todos os inimigos na área. Esta habilidade também ativa qualquer Armadilha de Espinhos dentro de sua área de efeito. Ideal para dano em área e para forçar a ativação de armadilhas.",
        tipo: "Sustentada",
        alcance: "25 metros",
        alvos: "Área de 4 metros",
        custo: "19 FaD",
        recarga: "10",
        duracao: "3 segundos",
        dado: "N/A",
        bonus: ["Dano contínuo", "Ativa Armadilhas", "Cobertura de área"]
      },
      {
        nome: "Rede de Caça",
        descricao: "O Arqueiro lança uma rede reforçada em uma área alvo. Inimigos atingidos são Imobilizados (Condição) e puxados levemente para o centro da área. Inimigos já Imobilizados ou enraizados recebem 3d8+12 de dano desta habilidade.",
        tipo: "Imediata",
        alcance: "12 metros",
        alvos: "Área de 3 metros",
        custo: "11 FaD",
        recarga: "4",
        duracao: "0",
        dado: "3d8",
        bonus: ["Imobiliza inimigos", "Puxa para centro", "Dano a presos"]
      },
      {
        nome: "Disparo Explosivo",
        descricao: "O Arqueiro dispara uma flecha especial que explode ao atingir o primeiro alvo, causando 4d8+12 de Dano físico ao alvo principal e 3d12 do Dano de explosivo a todos os inimigos em um raio de 5 metros. Esta explosão também ativa instantaneamente todas as Armadilhas de Espinhos dentro de seu raio de efeito, sem consumir a armadilha. Se o alvo principal estiver Imobilizado pela Rede de Caça, o dano da explosão é aumentado em 25%.",
        tipo: "Imediata",
        alcance: "9 metros",
        alvos: "Único",
        custo: "15 FaD",
        recarga: "3",
        duracao: "0",
        dado: "4d8",
        bonus: ["Explosão em área", "Ativa Armadilhas", "+25% em Imobilizados"]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "ladino",
    nome: "Ladino",
    raridade: "comum",
    descricao: "O Ladino surge das sombras da sociedade, um mestre da furtividade e da manipulação, prosperando onde a lei e a ordem falham. Sua origem é obscura, ligada a guildas de ladrões, espiões e assassinos, onde a astúcia e a discrição são mais valiosas que a força. Eles são especialistas em desarmar armadilhas, abrir fechaduras e infiltrar-se em locais de alta segurança, sempre em busca de riquezas ou informações. A capacidade de se adaptar e a maestria em enganar são as marcas registradas da vida de um Ladino. A mecânica de combate do Ladino é baseada em ataques surpresa e no uso de truques sujos para desorientar e incapacitar oponentes. Com alta Agilidade, eles se movem rapidamente pelo campo de batalha, buscando a oportunidade perfeita para desferir um golpe fatal nas costas do inimigo. O dano é maximizado através de ataques furtivos, que exploram a vulnerabilidade do alvo, e eles usam sua Vitalidade para sobreviver a encontros perigosos. A arte do Ladino é a de transformar a desvantagem em vantagem, desaparecendo tão rapidamente quanto apareceu.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/J7IFcQ0.png",
    funcoes: ["Control", "Damage Dealer"],
    atributos: {
      forca: "1d4+6",
      vitalidade: "2d6+4",
      agilidade: "2d8+6",
      inteligencia: "1d4+6",
      percepcao: "2d6+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Deslocamento Fantasma",
        descricao: "Um movimento rápido e silencioso que permite ao ladino atravessar zonas ameaçadas, ignorando terreno difícil durante o deslocamento.",
        tipo: "Imediata",
        alcance: "7 m",
        alvos: "Jogador",
        custo: "11 FaD",
        recarga: "2",
        duracao: "Imediata",
        dado: "1d6",
        bonus: ["Atravessa zonas ameaçadas", "Ignora terreno difícil", "Mobilidade extrema"]
      },
      {
        nome: "Chuva de Lâminas",
        descricao: "O ladino arremessa múltiplas lâminas, causando nd10 de dano AOE. Ideal para limpar espaço antes de desaparecer. (n = número de lâminas, máximo 6)",
        tipo: "Imediata",
        alcance: "9 m",
        alvos: "no alcance",
        custo: "15 FaD",
        recarga: "4",
        duracao: "Imediata",
        dado: "1d10",
        bonus: ["AOE variável", "Limpa espaço", "Multitarget"]
      },
      {
        nome: "Execução nas Costas",
        descricao: "Um ataque brutal que causa 1d10 de dano. Se o alvo estiver sob penalidade de Reação ou desorientado, recebe +2 em bônus de rolagem.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "13 FaD",
        recarga: "3",
        duracao: "Imediata",
        dado: "1d10",
        bonus: ["Dano brutal", "+2 contra debilitados", "Finalizador"]
      },
      {
        nome: "Golpe Final",
        descricao: "Um ataque decisivo que causa 1d8 de dano. Se for usado contra um alvo marcado ou distraído, o dano é aplicado normalmente, mas o ataque recebe +1 em bônus de rolagem.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "9 FaD",
        recarga: "5",
        duracao: "Imediata",
        dado: "1d8",
        bonus: ["Ataque decisivo", "+1 contra marcados", "Execução épica"]
      },
      {
        nome: "Manto de Sombras",
        descricao: "O Ladino se envolve em sombras, tornando-se camuflado. Enquanto escondido, o próximo ataque básico ou habilidade ofensiva causa três dados de dano adicional e aplica 1 acúmulo de Ponto Cego ao alvo. A furtividade é quebrada ao atacar ou usar certas habilidades. Se a furtividade for quebrada, o Ladino ganha +1 evasão por 1 turno.",
        tipo: "Imediata",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "5 EnR",
        recarga: "2",
        duracao: "1 T",
        dado: "N/A",
        bonus: ["Camuflagem", "+3 dados de dano", "Aplica Ponto Cego"]
      },
      {
        nome: "Golpe no Tendão",
        descricao: "Um ataque rápido e preciso que causa 4d8+12 de dano físico e reduz a evasão em -1 do alvo por 3 turnos. Se o Ladino estiver em Furtividade ao usar esta habilidade, o alvo também recebe 1 acúmulo de Ponto Cego. Cada acúmulo de Ponto Cego aumenta o dano recebido de habilidades do Ladino em 10% (acumula até 3 vezes).",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "Único",
        custo: "9 FaD",
        recarga: "3",
        duracao: "0",
        dado: "4d8",
        bonus: ["Dano físico alto", "Reduz evasão -1", "Aplica Ponto Cego"]
      },
      {
        nome: "Passo Fantasmagórico",
        descricao: "O Ladino se teleporta instantaneamente para trás de um alvo inimigo ou aliado a até 10 metros de distância. Se o alvo para o qual o Ladino se teleportou estiver com pelo menos 1 acúmulo de Ponto Cego, o tempo de recarga de Manto de Sombras é reduzido em 1 turno. Esta habilidade permite reposicionamento rápido e manutenção da furtividade.",
        tipo: "Imediata",
        alcance: "10 metros",
        alvos: "Pessoal",
        custo: "17 FaD",
        recarga: "4",
        duracao: "0",
        dado: "N/A",
        bonus: ["Teleporte instantâneo", "Reduz recarga Manto", "Reposicionamento"]
      },
      {
        nome: "Execução Silenciosa",
        descricao: "Um golpe letal desferido com precisão cirúrgica. Causa 12d6+12 de dano físico. Esta habilidade consome todos os acúmulos de Ponto Cego no alvo. Para cada acúmulo consumido, o dano da habilidade é aumentado em um dado (+1dn) e o ataque se torna um acerto crítico. Se o alvo for eliminado por esta habilidade, o Ladino entra automaticamente em Furtividade (Manto de Sombras).",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "Único",
        custo: "15 FaD",
        recarga: "6",
        duracao: "0",
        dado: "12d6",
        bonus: ["Golpe letal", "+1dn por Ponto Cego", "Crítico garantido"]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "clerigo",
    nome: "Clérigo",
    raridade: "comum",
    descricao: "Em eras antigas, quando o mundo ainda era jovem e o caos caminhava livre entre os homens, houve um tempo em que nenhuma lâmina era suficiente e nenhuma muralha resistia. Foi nesse cenário que surgiram os primeiros Clérigos — não como guerreiros, mas como escolhidos. Diz-se que eles não aprenderam seu poder… eles foram chamados por ele. Alguns ouviram sussurros em sonhos. Outros sobreviveram a situações impossíveis. Há aqueles que simplesmente acordaram um dia e perceberam que algo dentro deles havia mudado — como se uma presença invisível observasse, julgasse… e concedesse. Essa força, conhecida por muitos nomes — deuses, luz, destino, vazio — nunca se revela por completo. Ela não responde perguntas. Ela exige fé. E os Clérigos respondem.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/uKLRViW.jpeg",
    funcoes: ["Off-Tank", "OFF Suporting"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Escudo de Luz Divina",
        descricao: "Concede a um aliado um escudo de luz que absorve 2d12 + 12 de dano. Enquanto o escudo estiver ativo, o aliado recebe a Marca da Proteção. Esta marca aumenta a cura recebida em 1d6 adicional.",
        tipo: "Duradoura",
        alcance: "9 metros",
        alvos: "1 a 3 Aliado",
        custo: "11 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "2d12",
        bonus: [
          "Absorve dano",
          "Marca da Proteção",
          "Aumenta cura recebida"
        ]
      },
      {
        nome: "Palavra de Resiliência",
        descricao: "Uma palavra de fé que concede Aumento de Defesa (Condição Buff) até o próximo turno do aliado. Se o aliado estiver sob Marca da Proteção, ele também remove 1 condição negativa de controle (CC).",
        tipo: "Imediata",
        alcance: "9 metros",
        alvos: "1 Aliado",
        custo: "13 EnR",
        recarga: "2",
        duracao: "1 T",
        dado: "N/A",
        bonus: [
          "Aumento de Defesa",
          "Remove condição CC",
          "Efeito em aliados marcados"
        ]
      },
      {
        nome: "Toque de Renovação",
        descricao: "Restaura 3d10+10 de HP do alvo. Se o alvo estiver sob Marca da Proteção, a cura é aumentada em 25% e o Clérigo recupera 50% do custo de EnR da habilidade.",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "1 Aliado",
        custo: "15 EnR",
        recarga: "2",
        duracao: "0 T",
        dado: "3d10",
        bonus: [
          "Restaura HP",
          "+25% em aliados marcados",
          "Recupera 50% custo EnR"
        ]
      },
      {
        nome: "Hino de Vigor Coletivo",
        descricao: "O Clérigo entoa um hino que abençoa todos os aliados em um raio de 10 metros. Durante 2 turnos, os aliados recuperam 4d8 de HP no início de cada turno. Aliados sob Marca da Proteção também recebem um bônus de +1 em todos os testes de resistência durante a duração do hino e para cada marca de proteção a cura aumenta em 1dn adicional.",
        tipo: "Duradoura",
        alcance: "10 metros",
        alvos: "Todos os Aliados na Área",
        custo: "19 EnR",
        recarga: "5",
        duracao: "3 T",
        dado: "4d8",
        bonus: [
          "Cura em área",
          "+1 em resistências",
          "Aumento de cura com marcas"
        ]
      },
      {
        nome: "Julgamento Flamejante",
        descricao: "Um feixe de energia divina atinge um inimigo, causando 6d8+12 de dano sagrado. O alvo recebe 1 acúmulo de Veredito Sagrado (dura 3 turnos). Cada acúmulo de Veredito Sagrado aumenta o dano sagrado recebido em 10% e reduz a cura recebida em 5%. Acumula até 3 vezes.",
        tipo: "Imediata",
        alcance: "15 metros",
        alvos: "1 Inimigo",
        custo: "17 EnR",
        recarga: "2",
        duracao: "3 T",
        dado: "6d8",
        bonus: [
          "Dano sagrado direto",
          "Aplica Veredito Sagrado",
          "+10% dano recebido",
          "Reduz cura -5%"
        ]
      },
      {
        nome: "Martelo da Retribuição",
        descricao: "Energia sagrada se condensa em um martelo etéreo que atinge um inimigo, causando 3d10 de dano sagrado e aplicando condição Fraqueza no alvo. Se o alvo estiver sob Veredito Sagrado, o dano é considerado crítico e o Clérigo recupera 50% do custo de EnR da habilidade.",
        tipo: "Imediata",
        alcance: "9 metros",
        alvos: "3 Inimigo",
        custo: "19 EnR",
        recarga: "4",
        duracao: "1 T",
        dado: "3d10",
        bonus: [
          "Dano sagrado",
          "Aplica Fraqueza",
          "Crítico em Veredito",
          "Recupera 50% custo"
        ]
      },
      {
        nome: "Círculo de Purificação",
        descricao: "O Clérigo conjura um círculo sagrado no chão. Inimigos dentro do círculo sofrem 1d6 + 8 de dano sagrado por ação. Se um inimigo dentro do círculo estiver sob Veredito Sagrado, o círculo explode ao final da duração, causando 4d8 + 12 de dano sagrado adicional a todos os inimigos na área e curando aliados em 3d8 + 6 por inimigo afetado.",
        tipo: "Sustentada",
        alcance: "12 metros",
        alvos: "Área de 5 metros",
        custo: "9 EnR",
        recarga: "6",
        duracao: "4 T",
        dado: "1d6",
        bonus: [
          "Dano por ação",
          "Explosão ao final",
          "Cura aliados",
          "Efeito amplificado com Veredito"
        ]
      },
      {
        nome: "Ira Divina",
        descricao: "O Clérigo invoca a ira dos céus, causando uma explosão massiva de dano sagrado em uma área. Causa 250% do Poder Mágico como dano sagrado base. Todos os acúmulos de Veredito Sagrado em inimigos na área são consumidos. Para cada acúmulo consumido, o dano da habilidade é aumentado em 25% e o alvo é Atordoado por 1 turno. Se esta habilidade eliminar um inimigo, todos os aliados em um raio de 10 metros recuperam 15% da sua vida máxima.",
        tipo: "Imediata",
        alcance: "25 metros",
        alvos: "Área de 8 metros",
        custo: "29 EnR",
        recarga: "45",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Explosão massiva",
          "+25% por Veredito consumido",
          "Atordoa alvos",
          "Cura aliados em morte"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "monge",
    nome: "Monge",
    raridade: "comum",
    descricao: "O Monge encontra sua origem em mosteiros isolados e escolas de artes marciais, onde o corpo é o templo e a arma mais refinada. Eles dedicam suas vidas ao treinamento físico e mental rigoroso, buscando a iluminação e o domínio completo de suas próprias energias internas. Sua filosofia prega o desapego material e a autossuficiência, transformando a disciplina em uma fonte de poder sobrenatural. A busca pela perfeição marcial e o equilíbrio interior são os pilares da existência de um Monge. A mecânica de combate do Monge é baseada na velocidade e na precisão de seus ataques desarmados, utilizando o fluxo de energia Ki para potencializar seus golpes. Com Agilidade e Vitalidade elevadas, eles se movem como um borrão no campo de batalha, desferindo uma saraivada de socos e chutes que ignoram a armadura.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/Jctdn8U.jpeg",
    funcoes: ["Control DPS", "Off-Tank", "OFF Suporting"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Golpe Rápido",
        descricao: "Um ataque rápido que causa 4d8 do seu Dano de Ataque como dano físico. Se esta habilidade for usada após qualquer outra habilidade ofensiva do Monge, ela gera 1 acúmulo de Fluxo de Combate por 2 turnos. Cada acúmulo de Fluxo de Combate aumenta a velocidade de ataque (Prontidão) do Monge em 10% (acumula até 3 vezes).",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "1 Inimigo",
        custo: "3 FaD",
        recarga: "1",
        duracao: "Instantânea",
        dado: "4d8",
        bonus: [
          "Gera Fluxo de Combate após outro ataque",
          "Aumenta Prontidão em até 30%",
          "Ataque sequencial rápido"
        ]
      },
      {
        nome: "Chute Giratório",
        descricao: "O Monge realiza um chute giratório que atinge todos os inimigos em um raio de 3 metros, causando 6d8+12 do seu Dano de Ataque como dano físico. Se esta habilidade atingir um inimigo com pelo menos 1 acúmulo de Fluxo de Combate, ela aplica 1 acúmulo de Atordoamento (Condição - debuff).",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "Área de 3 metros",
        custo: "11 FaD",
        recarga: "2",
        duracao: "Instantânea",
        dado: "6d8+12",
        bonus: [
          "Ataque em área",
          "Aplica Atordoamento em inimigos com Fluxo de Combate",
          "Controle tático"
        ]
      },
      {
        nome: "Tempestade de Punhos",
        descricao: "O Monge desfere uma série de golpes rápidos em um único alvo por 1 turno, causando 250% do seu Dano de Ataque como dano físico. Se o Monge tiver 3 acúmulos de Fluxo de Combate ao ativar esta habilidade, a duração da Tempestade de Punhos é aumentada em 1 turno (Ação Exclusiva) e o dano é aumentado em 50%.",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "1 Inimigo",
        custo: "15 FaD",
        recarga: "3",
        duracao: "1 T",
        dado: "250%",
        bonus: [
          "Série de golpes rápidos",
          "Aumenta duração com máximo Fluxo de Combate",
          "Dano dobrado com condição"
        ]
      },
      {
        nome: "Golpe do Dragão Ascendente",
        descricao: "O Monge concentra toda a sua energia em um único golpe devastador que lança o inimigo para o alto, causando 400% do seu Dano de Ataque como dano físico. Esta habilidade consome todos os acúmulos de Fluxo de Combate. Para cada acúmulo consumido, o dano é aumentado em 33% e o alvo fica no ar por 0.5 segundos adicionais. Se o alvo estiver sob Atordoamento, o dano é aumentado em 50% e o alvo é Atordoado (Obstáculo 11) ao cair.",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "1 Inimigo",
        custo: "17 FaD",
        recarga: "5",
        duracao: "Instantânea",
        dado: "400%",
        bonus: [
          "Golpe devastador com lançamento",
          "Aumenta com acúmulos consumidos",
          "Dano extra contra Atordoado"
        ]
      },
      {
        nome: "Palma Vibratória",
        descricao: "O Monge desfere um golpe preciso que causa 7d8+12 do seu Dano de Ataque como dano físico e aplica Vibração Interna ao alvo por 2 turnos. Inimigos com Vibração Interna têm sua velocidade de ataque reduzida em 10% e recebem 10% de dano adicional de habilidades de energia do Monge.",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "1 Inimigo",
        custo: "15 FaD & 3 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "7d8+12",
        bonus: [
          "Aplica Vibração Interna",
          "Reduz velocidade de ataque inimiga",
          "Aumenta dano de habilidades de energia"
        ]
      },
      {
        nome: "Meditação Ativa",
        descricao: "O Monge entra em um estado de meditação ativa, aumentando sua regeneração de energia 3d6+6 e sua defesa em 50%. Enquanto medita, o Monge pode conjurar habilidades de energia sem quebrar a meditação. Se o Monge for atingido por um ataque enquanto medita, ele gera 1 acúmulo de Foco Zen (acumula até 5 vezes). Cada acúmulo de Foco Zen reduz o custo da próxima habilidade de energia em 10%.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "3 FaD",
        recarga: "5",
        duracao: "3 Fadiga p/T",
        dado: "3d6+6",
        bonus: [
          "Regeneração de energia",
          "Aumento de defesa 50%",
          "Gera Foco Zen quando atingido",
          "Reduz custo de habilidades de energia"
        ]
      },
      {
        nome: "Toque dos Mil Punhos",
        descricao: "O Monge desfere uma série de golpes rápidos e precisos em um único alvo, causando 350% do seu Dano de Ataque como dano físico. Se o alvo estiver sob Vibração Interna, o Monge recupera 50% da energia gasto nesta habilidade e tem uma chance de aplicar um Atordoamento. Se o Monge tiver pelo menos 1 acúmulo de Foco Zen, esta habilidade consome 1 acúmulo para causar 150% de dano adicional.",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "1 Inimigo",
        custo: "29 FaD",
        recarga: "7",
        duracao: "Instantânea",
        dado: "350%",
        bonus: [
          "Série de golpes precisos",
          "Recupera energia se alvo tem Vibração Interna",
          "Aumenta dano consumindo Foco Zen",
          "Chance de aplicar Atordoamento"
        ]
      },
      {
        nome: "Explosão de Chi",
        descricao: "O Monge libera uma onda de energia Chi pura em uma área, causando 450% do seu Dano de Ataque como dano espiritual a todos os inimigos. Todos os acúmulos de Vibração Interna são consumidos. Para cada acúmulo consumido, o dano da habilidade é aumentado em 50% e os inimigos na área são empurrados para trás em 3 metros. Se o Monge tiver 3 acúmulos de Foco Zen, esta habilidade consome todos eles para curar o Monge em 20% da sua vida máxima e restaurar 50% do seu energia máximo.",
        tipo: "Imediata",
        alcance: "15 metros",
        alvos: "Área de 6 metros",
        custo: "23 EnR",
        recarga: "40 segundos",
        duracao: "Instantânea",
        dado: "450%",
        bonus: [
          "Dano em área espiritual",
          "Consome Vibração Interna para aumentar dano",
          "Empurra inimigos",
          "Cura e restaura energia com Foco Zen máximo"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "bardo",
    nome: "Bardo",
    raridade: "comum",
    descricao: "O Bardo tem sua origem nos contadores de histórias, menestréis e trovadores, aqueles que viajam pelo mundo coletando e espalhando lendas e canções. Eles são a voz da história e a alma da cultura, usando a música e a poesia para evocar emoções, inspirar feitos heroicos e até mesmo manipular a realidade. Sua jornada é marcada pela busca por novas melodias e narrativas, transformando a arte em uma forma de magia poderosa e sutil. Em combate, o Bardo não se limita a lutar com armas, mas sim com a força de sua performance, utilizando instrumentos musicais e a voz para afetar o moral e a mente. Sua mecânica é de suporte e controle, inspirando aliados com bônus de ataque e defesa, ou desmoralizando inimigos com canções de desespero e confusão.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/LqxUZ8J.jpeg",
    funcoes: ["OFF Suporting", "Suporting"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Acorde de Vigor",
        descricao: "O Bardo toca um acorde inspirador que concede ao aliado um bônus aumento de ataque (Condição). Além disso, o aliado recebe 1 acúmulo de Harmonia Crescente. Cada acúmulo de Harmonia Crescente aumenta a eficácia da próxima cura ou escudo do Bardo em 50% (acumula até 3 vezes).",
        tipo: "Imediata",
        alcance: "9 metros",
        alvos: "1 Aliado",
        custo: "17 EnR",
        recarga: "4",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Aumenta ataque do aliado",
          "Gera acúmulo de Harmonia Crescente",
          "Aumenta eficácia de curas e escudos"
        ]
      },
      {
        nome: "Ritmo de Batalha",
        descricao: "O Bardo mantém um ritmo constante que inspira seus aliados. Enquanto esta habilidade é Sustentada, todos os aliados em um raio de 10 metros recebem +1 em Precisão no primeiro ataque de cada turno. Se o Bardo tiver pelo menos 1 acúmulo de Harmonia Crescente, os aliados também recebem +3 em Reação.",
        tipo: "Sustentada",
        alcance: "10 metros",
        alvos: "Aliados na Área",
        custo: "7 EnR",
        recarga: "3",
        duracao: "Sustentada",
        dado: "N/A",
        bonus: [
          "Aumenta Precisão de aliados",
          "Aumenta Reação com Harmonia Crescente",
          "Suporte contínuo em combate"
        ]
      },
      {
        nome: "Voz que Cura",
        descricao: "O Bardo entoa uma melodia suave que remove 1 efeito negativo de controle de multidão (CC) de nível médio (ex: atordoamento, silêncio) de um aliado e restaura 4d6 + 8 de HP. Se o Bardo consumir 1 acúmulo de Harmonia Crescente, a cura é aumentada em 50% e o aliado recebe um escudo que absorve 2d12 de dano por 1 turno.",
        tipo: "Imediata",
        alcance: "11 metros",
        alvos: "1 Aliado",
        custo: "13 EnR",
        recarga: "3",
        duracao: "Instantânea",
        dado: "4d6+8",
        bonus: [
          "Remove efeito negativo de CC",
          "Cura o aliado",
          "Cria escudo ao consumir Harmonia Crescente"
        ]
      },
      {
        nome: "Sinfonia da Resiliência",
        descricao: "O Bardo executa uma sinfonia poderosa que abençoa todos os aliados em um raio de 15 metros. Durante 3 turnos, os aliados recebem +2 contra empurrões, quedas e efeitos de controle físico. Além disso, todos os aliados sob Harmonia Crescente recebem aumento de defesa (Condição - buff). Esta habilidade consome todos os acúmulos de Harmonia Crescente ao ser ativada.",
        tipo: "Duradoura",
        alcance: "15 metros",
        alvos: "Aliados na Área",
        custo: "21 EnR",
        recarga: "5",
        duracao: "3 T",
        dado: "N/A",
        bonus: [
          "Resiliência contra controle físico",
          "Aumenta defesa de aliados",
          "Consome Harmonia Crescente"
        ]
      },
      {
        nome: "Nota Disruptiva",
        descricao: "O Bardo emite uma nota aguda que causa 4d6 + 12 de dano sonoro e aplica Ressonância Dissonante ao alvo por 3 turnos. Inimigos sob Ressonância Dissonante têm sua Resistência Mágica reduzida em 50% e recebem 50% de dano adicional de habilidades sonoras do Bardo.",
        tipo: "Imediata",
        alcance: "9 metros",
        alvos: "1 Inimigo",
        custo: "15 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "4d6+12",
        bonus: [
          "Aplica Ressonância Dissonante",
          "Reduz Resistência Mágica inimiga",
          "Aumenta dano sonoro subsequente"
        ]
      },
      {
        nome: "Harmonia Quebrada",
        descricao: "O Bardo cria ondas dissonantes que causam 8d8 + 150% de dano sonoro a todos os inimigos em uma área. Inimigos que falharem em um teste de Resistência são Desorientados (Condição). Se o alvo estiver sob Ressonância Dissonante, o dano é aumentado em 50% e a duração da Desorientação é aumentada em 1 Turno.",
        tipo: "Imediata",
        alcance: "10 metros",
        alvos: "Área de 5 metros",
        custo: "29 EnR",
        recarga: "3",
        duracao: "Instantânea",
        dado: "8d8+150%",
        bonus: [
          "Ataque em área sonoro",
          "Aplica Desorientação",
          "Aumenta duração contra Ressonância Dissonante"
        ]
      },
      {
        nome: "Postura do Palco",
        descricao: "O Bardo assume uma postura teatral, aumentando sua Defesa em 3d8+4 e ignorando penalidades por estar cercado. Enquanto nesta postura, todas as habilidades de dano sonoro do Bardo têm seu alcance aumentado em 5 metros e causam 4d6 de dano adicional. Se o Bardo for atingido por um ataque enquanto nesta postura, ele tem uma chance de 20% de aplicar Ressonância Dissonante ao atacante.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "23 EnR",
        recarga: "5",
        duracao: "3 T",
        dado: "3d8+4",
        bonus: [
          "Aumenta Defesa pessoal",
          "Ignora penalidades de cerco",
          "Aumenta alcance de habilidades sonoras",
          "Chance de aplicar Ressonância Dissonante"
        ]
      },
      {
        nome: "Clímax Ensurdecedor",
        descricao: "O Bardo atinge o clímax de sua performance, liberando uma explosão sonora devastadora. Causa 600% do Poder Mágico como dano sonoro base a todos os inimigos na área. Todos os acúmulos de Ressonância Dissonante são consumidos. Para cada acúmulo consumido, o dano da habilidade é aumentado em 50% e os inimigos na área são Silenciados (Condição). Se esta habilidade eliminar um inimigo, o Bardo recupera 50% da sua Energia do uso da habilidade.",
        tipo: "Imediata",
        alcance: "15 metros",
        alvos: "Área de 8 metros",
        custo: "29 EnR",
        recarga: "8",
        duracao: "Instantânea",
        dado: "600%",
        bonus: [
          "Explosão sonora massiva",
          "Consome Ressonância Dissonante",
          "Aplica Silêncio aos inimigos",
          "Recupera energia ao eliminar inimigo"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "cavaleiro",
    nome: "Cavaleiro",
    raridade: "raro",
    descricao: "O Cavaleiro não é meramente um soldado, mas o pilar sobre o qual repousam os restos da civilização. Enquanto outros buscam a glória no ouro ou na magia, ele busca a imortalidade através do sacrifício. Nascido do rigor das ordens militares e batizado no sangue da linhagem feudal, este guerreiro é forjado sob o fogo de um juramento inquebrável: um pacto que vincula sua vida ao destino do reino.\n\nSua jornada é um rastro de suor e disciplina que começa na alvorada da juventude. Como escudeiro, aprendeu que o peso da placa de aço é menor que o peso da honra; como homem, dominou a linguagem da guerra. No lombo de seu corcel, ele é o trovão que anuncia a justiça, uma força da natureza que transforma o pavor em esperança com um único brado.\n\nEm combate, o Cavaleiro é a tempestade contida. Ele não apenas empunha a espada, ele é a barreira. Enquanto o mundo desmorona ao seu redor, ele permanece imóvel, absorvendo o ódio dos inimigos para que os seus não sofram. Sua presença é um farol de virtude marcial: uma silhueta prateada que desafia o caos, provando que, enquanto houver um Cavaleiro de pé, a escuridão jamais triunfará sobre a ordem.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/llliatr.png",
    funcoes: ["Tank", "Off-Tank"],
    atributos: {
      forca: "2d10+6",
      vitalidade: "2d12+4",
      agilidade: "2d8+6",
      inteligencia: "1d4+6",
      percepcao: "2d6+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Guarda Protetora",
        descricao: "O Cavaleiro assume uma postura defensiva, protegendo um aliado adjacente. Durante 2 turnos, 30% do dano recebido pelo aliado é redirecionado para o Cavaleiro. O Cavaleiro recebe +1 em testes de resistência contra efeitos que afetariam o aliado protegido. Se o dano redirecionado exceder 50 pontos por turno, o Cavaleiro gera 1 acúmulo de Honra.",
        tipo: "Duradoura",
        alcance: "Adjacente",
        alvos: "1 Aliado",
        custo: "12 FaD",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Protege aliado adjacente",
          "Redireciona 30% do dano",
          "Gera acúmulo de Honra"
        ]
      },
      {
        nome: "Carga Montada",
        descricao: "O Cavaleiro avança rapidamente no lombo de seu corcel, movimentando-se até 8 metros em linha reta e causando 4d10+12 de dano físico ao primeiro inimigo atingido. O alvo é derrubado se falhar em um teste de Força. Se consumir 1 acúmulo de Honra, o Cavaleiro causa +2d8 adicional e todos os inimigos em um raio de 2 metros do alvo sofrem 50% do dano da carga.",
        tipo: "Imediata",
        alcance: "8 metros",
        alvos: "1 Inimigo (Dano em Área)",
        custo: "15 FaD",
        recarga: "4",
        duracao: "0 T",
        dado: "4d10+12",
        bonus: [
          "Movimento + Dano",
          "Derruba alvo",
          "Dano em área ao consumir Honra"
        ]
      },
      {
        nome: "Escudo Unido",
        descricao: "O Cavaleiro cria uma formação defensiva com aliados próximos, aumentando a defesa de todos em +2 por cada aliado adjacente (máx. +6). Enquanto esta habilidade estiver ativa, os aliados ganham resistência contra efeitos de separação (como empurrões). Se 2 ou mais aliados forem protegidos, todos os acúmulos de Honra do Cavaleiro são aumentados em 50%.",
        tipo: "Sustentada",
        alcance: "10 metros",
        alvos: "Próprio + Aliados",
        custo: "8 FaD",
        recarga: "3",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Aumenta defesa com aliados",
          "Resistência contra separação",
          "Aumenta Honra com múltiplos aliados"
        ]
      },
      {
        nome: "Juramento Inquebrantável",
        descricao: "O Cavaleiro invoca seu juramento sagrado, ganhando +1 em testes de resistência contra efeitos de medo e controle mental. Durante 3 turnos, o Cavaleiro não pode ser derrubado e recebe aumento de defesa (Condição). Sempre que o Cavaleiro ou um aliado que ele está protegendo for atingido enquanto esta habilidade estiver ativa, gera 1 acúmulo de Honra.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "20 FaD",
        recarga: "5",
        duracao: "3 T",
        dado: "N/A",
        bonus: [
          "Resistência contra medo e controle",
          "Imunidade a derrubar",
          "Gera Honra ao sofrer/proteger dano"
        ]
      },
      {
        nome: "Lâmina da Virtude",
        descricao: "O Cavaleiro desfere um golpe imbuído de honra que causa 5d8+150% de dano físico. Para cada acúmulo de Honra consumido (máx. 3), o dano é aumentado em 50% e o alvo sofre -1 em ataques por 1 turno. Se consumir 3 acúmulos de Honra, o ataque também aplica Sangramento.",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "1 Inimigo",
        custo: "18 FaD",
        recarga: "3",
        duracao: "0 T",
        dado: "5d8+150%",
        bonus: [
          "Dano escalável com Honra",
          "Reduz ataque inimigo",
          "Aplica Sangramento com máximo Honra"
        ]
      },
      {
        nome: "Escudo Refletor",
        descricao: "O Cavaleiro aumenta sua defesa em +3 e redireciona 25% do dano recebido como dano físico refletido ao atacante. Se o Cavaleiro estiver sob Juramento Inquebrantável, o dano refletido aumenta para 40%. Quando o dano refletido exceder 30 pontos em um ataque, o Cavaleiro gera 1 acúmulo de Honra.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "10 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Aumenta defesa",
          "Reflete dano",
          "Gera Honra ao refletir dano"
        ]
      },
      {
        nome: "Resolução do Sacrifício",
        descricao: "O Cavaleiro se posiciona entre seus aliados e o perigo. Durante 2 turnos, todos os danos dirigidos a aliados dentro de 5 metros são absorvidos pelo Cavaleiro em sua totalidade. O Cavaleiro não pode se mover durante este efeito, mas recebe +2 em testes de resistência. Se o Cavaleiro absorver dano suficiente para exceder 100 pontos por turno, o próximo Carga Montada tem sua recarga reduzida em 1 turno.",
        tipo: "Duradoura",
        alcance: "5 metros",
        alvos: "Próprio + Aliados",
        custo: "25 FaD",
        recarga: "6",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Absorve todo dano de aliados",
          "Imobilidade consciente",
          "Reduz recarga de Carga Montada"
        ]
      },
      {
        nome: "Corte Final: Espada da Justiça",
        descricao: "O Cavaleiro realiza um ataque final devastador que causa 6d12+250% de dano físico. Se o alvo estiver sob efeitos de redução de defesa ou sangramento, o dano é aumentado em 75%. Se consumir todos os acúmulos de Honra (máx. 3), o ataque também causa um acerto crítico garantido e restaura 30% do dano causado como Vitalidade.",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "1 Inimigo",
        custo: "22 FaD",
        recarga: "5",
        duracao: "0 T",
        dado: "6d12+250%",
        bonus: [
          "Dano devastador",
          "Dano aumentado em alvo debilitado",
          "Crítico garantido ao consumir máximo Honra"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "paladino",
    nome: "Paladino",
    raridade: "epico",
    descricao: "O Paladino é a manifestação da fé em ação, um guerreiro sagrado cuja origem está ligada a um chamado divino ou a um juramento solene de pureza e retidão. Eles são a vanguarda da luz contra as trevas, combinando a disciplina marcial do Cavaleiro com o poder milagroso do Clérigo. Sua existência é um testemunho de sua devoção, vivendo sob um código de honra que exige sacrifício e a erradicação do mal.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/wXkfbnu.jpeg",
    funcoes: ["Control", "Off-Tank", "Suporting"],
    atributos: {
      forca: "2d6+10",
      vitalidade: "2d4+6",
      agilidade: "1d4+4",
      inteligencia: "1d4+2",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Juramento do Bastião",
        descricao: "O Paladino invoca um juramento sagrado, aumento de ataque e defesa (Condição). Enquanto esta habilidade estiver ativa, sempre que o Paladino for atacado, o agressor sofre 3d12+8 de dano sagrado. Se o Paladino tiver um aliado sob o efeito de Guardião da Fé, a duração do Juramento do Bastião é estendida em 1 turno.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "25 EnR",
        recarga: "5",
        duracao: "2 T",
        dado: "3d12+8",
        bonus: [
          "Aumenta ataque e defesa",
          "Retorna dano ao agressor",
          "Extensão de duração com aliado protegido"
        ]
      },
      {
        nome: "Provocação Justa",
        descricao: "O Paladino emite um grito de desafio (Provocado Condição), forçando até dois inimigos a terem prioridade de ataque contra ele no próximo turno. Inimigos afetados sofrem -30% de dano contra qualquer alvo que não seja o Paladino. Se o Paladino estiver sob Juramento do Bastião, a Provocação Justa afeta um inimigo adicional.",
        tipo: "Imediata",
        alcance: "10 metros",
        alvos: "Até 2 Inimigos",
        custo: "5 FaD & 15 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Força inimigos a atacar o Paladino",
          "Reduz dano contra outros alvos",
          "Ataca inimigo adicional com Juramento do Bastião"
        ]
      },
      {
        nome: "Guardião da Fé",
        descricao: "O Paladino estende sua proteção a um aliado. Por 2 turnos, 50% do dano recebido pelo aliado é redirecionado a vida do Paladino. Este dano redirecionado não é reduzido por armadura ou defesas externas do Paladino. Enquanto esta habilidade estiver ativa, o Paladino recebe 1 acúmulo de Juramento de Proteção a cada vez que absorve dano para o aliado.",
        tipo: "Duradoura",
        alcance: "15 metros",
        alvos: "1 Aliado",
        custo: "25 EnR",
        recarga: "4",
        duracao: "3 T",
        dado: "N/A",
        bonus: [
          "Redireciona 50% do dano do aliado",
          "Gera Juramento de Proteção",
          "Proteção contínua"
        ]
      },
      {
        nome: "Aura de Misericórdia",
        descricao: "O Paladino irradia uma aura de cura. Aliados em um raio de 8 metros recuperam 4d8 + 12 de Vitalidade no início de cada turno. Se o Paladino tiver pelo menos 1 acúmulo de Juramento de Proteção, a cura da aura é aumentada em 25% e os aliados também recebem +1 em todos os testes de resistência.",
        tipo: "Sustentada",
        alcance: "8 metros",
        alvos: "Aliados na Área",
        custo: "15 FaD",
        recarga: "4",
        duracao: "0 T",
        dado: "4d8+12",
        bonus: [
          "Cura contínua em área",
          "Aumenta cura com Juramento de Proteção",
          "Aumenta resistência de aliados"
        ]
      },
      {
        nome: "Escudo do Juramento",
        descricao: "Sempre que o Paladino curar um aliado ou absorve dano para um aliado (através de Guardião da Fé), ele recebe 1 acúmulo de Juramento de Proteção (acumula até 3 vezes). Cada acúmulo de Juramento de Proteção concede +1 dado de Defesa e +5% de redução de dano. Ao atingir 3 acúmulos, o próximo Juramento do Bastião tem sua recarga reduzida em 1 turno.",
        tipo: "Passiva",
        alcance: "Pessoal",
        alvos: "Próprio Paladino",
        custo: "0 FaD",
        recarga: "Passiva",
        duracao: "Passiva",
        dado: "N/A",
        bonus: [
          "Gera Juramento de Proteção",
          "Aumenta defesa e redução de dano",
          "Reduz recarga de Juramento do Bastião"
        ]
      },
      {
        nome: "Golpe Consagrado",
        descricao: "O Paladino desfere um ataque imbuído de fé que causa 2d12 + 150% de dano do ataque como dano sagrado. Se o alvo estiver sob qualquer efeito negativo (ex: lentidão, sangramento, atordoamento), o Paladino recupera 3d8+4 de Vitalidade. Se o alvo estiver sob Marca da Condenação, o dano é aumentado em 50%.",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "1 Inimigo",
        custo: "19 FaD",
        recarga: "4",
        duracao: "Instantânea",
        dado: "2d12+150%",
        bonus: [
          "Dano sagrado concentrado",
          "Recupera vitalidade em inimigo com CC",
          "Aumenta dano contra Marca da Condenação"
        ]
      },
      {
        nome: "Postura da Vingança",
        descricao: "O Paladino assume uma postura agressiva. Enquanto ativa, o dano recebido é reduzido em 20% e metade desse dano reduzido é devolvido como dano sagrado ao atacante corpo a corpo. Além disso, enquanto nesta postura, cada vez que o Paladino causa dano a um inimigo com Marca da Condenação, ele recupera 5% da sua Vitalidade máxima.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Próprio Paladino",
        custo: "15 FaD",
        recarga: "7",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Reduz dano recebido em 20%",
          "Retorna dano sagrado",
          "Recupera vitalidade contra Marca da Condenação"
        ]
      },
      {
        nome: "Marca da Condenação",
        descricao: "O Paladino marca um inimigo com Marca da Condenação. O alvo marcado recebe –1 dado de Defesa e sofre +2d12 de dano sagrado adicional de qualquer fonte divina durante 2 turnos. Se o alvo já estiver marcado, a duração da marca é renovada e o Paladino recupera 50% do custo de energia sagrada da habilidade.",
        tipo: "Imediata",
        alcance: "15 metros",
        alvos: "1 Inimigo",
        custo: "20 FaD",
        recarga: "3",
        duracao: "0 T",
        dado: "2d12",
        bonus: [
          "Reduz defesa do inimigo",
          "Aumenta dano sagrado contra alvo",
          "Renovação com recuperação de energia"
        ]
      },
      {
        nome: "Luz Restauradora",
        descricao: "O Paladino canaliza luz divina para curar um aliado, restaurando 5d8 + 150% da defesa do paladino como Vitalidade. Se o alvo estiver abaixo de 50% da vida, a cura é dobrada. Se o Paladino tiver um inimigo sob Marca da Condenação em seu campo de visão, a recarga desta habilidade é reduzida em 2 turnos.",
        tipo: "Imediata",
        alcance: "10 metros",
        alvos: "1 Aliado",
        custo: "30 FaD",
        recarga: "4",
        duracao: "0 T",
        dado: "5d8+150%",
        bonus: [
          "Cura baseada em defesa",
          "Dobra cura em aliado crítico",
          "Reduz recarga com Marca da Condenação"
        ]
      },
      {
        nome: "Milagre do Último Fôlego",
        descricao: "O Paladino invoca um milagre para salvar um aliado à beira da morte. Levanta um aliado a 0 de Vitalidade com 3d12+12 de Vitalidade e concede imunidade (Condição) até o fim do próximo turno. Se o Paladino tiver um inimigo sob Marca da Condenação em seu campo de visão, o aliado também recebe um escudo que absorve 2d10 de dano por 1 Turno.",
        tipo: "Imediata",
        alcance: "10 metros",
        alvos: "1 Aliado",
        custo: "25% da Energia Máxima",
        recarga: "6",
        duracao: "0 T",
        dado: "3d12+12",
        bonus: [
          "Ressurge aliado derrotado",
          "Concede imunidade temporária",
          "Escudo adicional com Marca da Condenação"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "berserker",
    nome: "Berserker",
    raridade: "raro",
    descricao: "O Berserk, ou Bárbaro, tem sua origem nas tribos selvagens e clãs guerreiros que vivem à margem da civilização, onde a força é a única lei. Eles são movidos por uma fúria primal e incontrolável, um estado de êxtase de batalha que lhes confere força e resistência sobre-humanas. Sua história é de violência e liberdade, rejeitando as armaduras e as táticas refinadas em favor da selvageria e do instinto puro.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/o0T3fyF.jpeg",
    funcoes: ["Damage Dealer", "Off-Tank"],
    atributos: {
      forca: "2d6+10",
      vitalidade: "2d4+6",
      agilidade: "1d4+4",
      inteligencia: "1d4+2",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Despertar da Fera",
        descricao: "O Berserker libera sua natureza primal, entrando em estado de Fúria crescente. Durante a duração, recebe +1 dado de dano físico em todos os ataques corpo a corpo. Sempre que causar dano corpo a corpo, estende a duração em +1 turno (máx. +2). Cada turno adicional concedido dessa forma gera +1 acúmulo de Fúria (máx. 3). Cada acúmulo de Fúria concede +3 dano fixo e +1 em testes de intimidação, mas reduz a Defesa em –1. Se atingir o máximo de acúmulos, o próximo ataque causa +1d12 adicional.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "9 FaD",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Aumenta dano corpo a corpo",
          "Gera Fúria com cada ataque",
          "Próximo ataque com máximo Fúria recebe bônus"
        ]
      },
      {
        nome: "Golpe Brutal",
        descricao: "Um ataque pesado e direto que causa 4d8 de dano físico. Se o Berserker estiver sob efeito de Fúria, causa +2d8 adicional. Consome todos os acúmulos de Fúria para causar +1d8 por acúmulo. Se consumir 3 acúmulos, o ataque também aplica Sangramento leve (dano contínuo por 1 turno).",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "11 FaD",
        recarga: "1",
        duracao: "0 T",
        dado: "4d8",
        bonus: [
          "Dano aumentado com Fúria",
          "Consome Fúria para dano adicional",
          "Aplica Sangramento com máximo Fúria"
        ]
      },
      {
        nome: "Pressão Selvagem",
        descricao: "A presença do Berserker se torna opressiva e instintivamente ameaçadora. Inimigos afetados sofrem –1 em testes ofensivos enquanto estiverem adjacentes a ele. Se o Berserker estiver sob Fúria, a penalidade aumenta para –2 e os inimigos também sofrem –1 em Reação. Sempre que um inimigo sob esse efeito errar um ataque, o Berserker ganha +1 acúmulo de Fúria.",
        tipo: "Duradoura",
        alcance: "5 metros",
        alvos: "Até 2 Inimigos",
        custo: "9 FaD",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Reduz ataque inimigo",
          "Penalidades aumentadas com Fúria",
          "Gera Fúria ao inimigo errar"
        ]
      },
      {
        nome: "Ritmo de Carnificina",
        descricao: "O Berserker entra em um ciclo de violência contínua. A cada turno consecutivo em que realiza ao menos um ataque, recebe +2 em ataque fixo (acumulativo, sem limite prático). Se passar um turno sem atacar, perde todos os acúmulos. Além disso, ataques corpo a corpo aplicam 3 pontos de Fadiga no alvo. Se atingir 3 turnos consecutivos atacando, ganha automaticamente +1 acúmulo de Fúria.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "Próprio",
        custo: "0 FaD",
        recarga: "Passiva",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Acúmulo de ataque contínuo",
          "Aplica Fadiga em inimigos",
          "Gera Fúria após 3 ataques"
        ]
      },
      {
        nome: "Avanço Irrefreável",
        descricao: "O Berserker avança sem hesitação, ignorando ameaças. Move-se até 6 metros em linha reta até um alvo e realiza um ataque que causa 4d12+12 de dano. Durante o avanço, ignora efeitos de redução de movimento e não pode ser interrompido por reações simples. Se estiver sob Fúria, o ataque causa +2d12 adicional e empurra o alvo em até 6 metros.",
        tipo: "Imediata",
        alcance: "6 metros",
        alvos: "1 Inimigo",
        custo: "15 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "4d12+12",
        bonus: [
          "Avanço irrefrável",
          "Ignora redução de movimento",
          "Empurra com Fúria"
        ]
      },
      {
        nome: "Fera no Controle",
        descricao: "O Berserker tenta dominar sua própria fúria sem suprimi-la completamente. Enquanto ativa, ignora penalidades por ferimentos e recebe resistência leve contra efeitos de controle (como Desorientação ou Lentidão). Além disso, reduz em –1 a penalidade de Defesa causada por acúmulos de Fúria. Se atingir o máximo de Fúria durante este efeito, recebe +1 dado de Defesa temporário.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "5 FaD",
        recarga: "4",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Ignora penalidades por ferimentos",
          "Resistência a controle",
          "Reduz penalidade de Defesa da Fúria"
        ]
      },
      {
        nome: "Sangue como Combustível",
        descricao: "O Berserker converte dor em poder bruto. Perde uma parte da própria vida para recuperar 1d12+6 EnR e ganhar +1 acúmulo de Fúria. Se estiver abaixo de 50% da vida, o ganho de Energia é aumentado em +50%. Se estiver abaixo de 25%, também recebe +1 dado de dano no próximo ataque.",
        tipo: "Imediata",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "10% da Vida Total",
        recarga: "4",
        duracao: "0 T",
        dado: "1d12+6",
        bonus: [
          "Recupera energia com custo de vida",
          "Gera acúmulo de Fúria",
          "Ganho aumentado em vida crítica"
        ]
      },
      {
        nome: "Corte da Ruína",
        descricao: "Um golpe destrutivo alimentado pela perda de controle. Causa 6d8+250% de dano físico. Se o Berserker estiver abaixo de 50% da vida, adiciona +2 dados de dano. Se possuir acúmulos de Fúria, causa +1d8 por acúmulo.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "17 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "6d8+250%",
        bonus: [
          "Dano devastador",
          "Dano aumentado em vida crítica",
          "Dano adicional com Fúria"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "espadachim",
    nome: "Espadachim",
    raridade: "raro",
    descricao: "O Espadachim, ou Duelista, tem sua origem nas escolas de esgrima e nas cortes nobres, onde a arte da espada é mais do que combate, é uma forma de expressão. Eles são mestres da lâmina, valorizando a técnica, a velocidade e a elegância sobre a força bruta, transformando o duelo em uma dança mortal. Sua jornada é de aprimoramento contínuo, buscando a perfeição em cada movimento.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/WEV4crU.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "1d4+4",
      vitalidade: "2d4+6",
      agilidade: "2d6+10",
      inteligencia: "1d4+4",
      percepcao: "1d4+2",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Postura da Lâmina Serena",
        descricao: "O Espadachim entra em um estado de absoluto controle e precisão. Enquanto ativa, recebe +1 em Precisão e ignora penalidades de desvantagem em ataques corpo a corpo. Sempre que acerta um ataque, ganha +1 acúmulo de Foco (máx. 3). Cada acúmulo concede +1 em bônus de rolagem para ataques. Ao atingir 3 acúmulos, o próximo ataque ignora parcialmente a defesa do alvo (–1 dado de defesa).",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "5 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Aumenta Precisão",
          "Ignora penalidades de desvantagem",
          "Gera Foco ao acertar"
        ]
      },
      {
        nome: "Corte Calculado",
        descricao: "Um corte preciso e eficiente que causa 4d8+12 de dano físico. Se acertar, reduz a Defesa do alvo pela metade até o início do próximo turno. Se o Espadachim possuir acúmulos de Foco, consome todos para causar +1d8 por acúmulo. Se consumir 3 acúmulos, também aplica –1 em Reação no alvo.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "9 FaD",
        recarga: "3",
        duracao: "0 T",
        dado: "4d8+12",
        bonus: [
          "Reduz defesa do alvo",
          "Consome Foco para dano adicional",
          "Reduz Reação com máximo Foco"
        ]
      },
      {
        nome: "Leitura de Combate",
        descricao: "O Espadachim analisa padrões de movimento e intenção do inimigo. Durante a duração, recebe +2 em bônus de rolagem e +1 em Testes de Obstáculo. Sempre que um inimigo errar um ataque contra ele, ganha +1 acúmulo de Foco. Se atingir o máximo de acúmulos durante este efeito, o próximo Contra Corte pode ser usado sem custo.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "15 FaD",
        recarga: "6",
        duracao: "3 T",
        dado: "N/A",
        bonus: [
          "Aumenta rolagem e Obstáculo",
          "Gera Foco ao inimigo errar",
          "Contra Corte sem custo com máximo Foco"
        ]
      },
      {
        nome: "Contra Corte",
        descricao: "Um contra-ataque executado no momento exato após esquivar ou bloquear. Causa 250% de dano físico. Se ativado como reação a um ataque falho do inimigo, interrompe a ação atual (se aplicável). Se o Espadachim possuir acúmulos de Foco, consome 1 para causar 50% de dano adicional.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "25 EnR",
        recarga: "2",
        duracao: "0 T",
        dado: "250%",
        bonus: [
          "Contra-ataque de reação",
          "Interrompe ação inimiga",
          "Dano aumentado com Foco"
        ]
      },
      {
        nome: "Linha Perfeita",
        descricao: "Um corte linear executado com precisão absoluta. Causa 6d8 de dano físico em cada alvo atingido. Se atingir mais de um alvo, ganha +1 acúmulo de Foco. Alvos já afetados por redução de Defesa recebem +1 dado de dano adicional.",
        tipo: "Imediata",
        alcance: "7 metros",
        alvos: "Até 2 Inimigos",
        custo: "10 FaD",
        recarga: "4",
        duracao: "0 T",
        dado: "6d8",
        bonus: [
          "Ataque linear em múltiplos alvos",
          "Gera Foco ao atingir múltiplos",
          "Dano aumentado em alvo debilitado"
        ]
      },
      {
        nome: "Disciplina do Duelista",
        descricao: "O Espadachim mantém controle absoluto sobre seu estilo de combate. Sempre que realizar 2 ações ofensivas consecutivas sem errar, ganha +1 acúmulo de Foco. Se passar um turno sem sofrer dano, recupera 1d6 FaD. Além disso, ao atingir 3 acúmulos de Foco, reduz em 1 turno a recarga de uma habilidade ativa.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "Próprio",
        custo: "0 FaD",
        recarga: "0 T",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Gera Foco em ações precisas",
          "Recupera Fadiga sem sofrer dano",
          "Reduz recarga com máximo Foco"
        ]
      },
      {
        nome: "Passo Cortante",
        descricao: "O Espadachim avança com precisão, movendo-se até 5 metros e realizando um ataque que causa 2d12+8 de dano físico. Não provoca ataques de oportunidade. Se usado antes de outra habilidade ofensiva, concede +1 acúmulo de Foco. Se usado após um Contra Corte, o ataque recebe +1 dado adicional.",
        tipo: "Imediata",
        alcance: "5 metros",
        alvos: "1 Inimigo",
        custo: "9 FaD",
        recarga: "1",
        duracao: "0 T",
        dado: "2d12+8",
        bonus: [
          "Movimento preciso sem provocação",
          "Gera Foco antes de ataque",
          "Dano aumentado após Contra Corte"
        ]
      },
      {
        nome: "Dança das Lâminas",
        descricao: "O Espadachim executa uma sequência de cortes rápidos e letais. Causa 600% de dano em cada alvo. Para cada alvo atingido, ganha +1 acúmulo de Foco. Se atingir o máximo de acúmulos durante esta habilidade, o próximo ataque recebe Acerto Crítico.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "Até 3 Inimigos",
        custo: "29 FaD",
        recarga: "7",
        duracao: "0 T",
        dado: "600%",
        bonus: [
          "Sequência de cortes letais",
          "Gera Foco por alvo atingido",
          "Crítico garantido com máximo Foco"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "elementalista",
    nome: "Elementalista",
    raridade: "epico",
    descricao: "O Elementalista é um Mago especializado, cuja origem reside no estudo aprofundado e na comunhão com as forças primordiais da natureza: fogo, água, terra e ar. Eles buscam a harmonia com os elementos, aprendendo a canalizar e moldar essas energias para criar fenômenos mágicos de escala impressionante. Sua história é de exploração de ruínas antigas e locais de poder elemental.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/3wslNFO.jpeg",
    funcoes: ["Control DPS", "Damage Dealer"],
    atributos: {
      forca: "1d4+2",
      vitalidade: "1d4+4",
      agilidade: "1d4+4",
      inteligencia: "2d6+10",
      percepcao: "2d4+6",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Pulso Elemental",
        descricao: "O Elementalista libera uma onda concentrada do elemento ativo, fazendo a energia se expandir violentamente ao seu redor. Causa 6d8 de dano elemental em todos os inimigos atingidos. Além do dano, aplica um efeito secundário leve baseado no elemento (empurrão, lentidão, queima ou instabilidade). Se atingir múltiplos alvos, fortalece a próxima ativação de Afinidade Primordial.",
        tipo: "Imediata",
        alcance: "7 m",
        alvos: "3 m AOE",
        custo: "15 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "6d8",
        bonus: [
          "Onda concentrada de elemento ativo",
          "Efeito secundário baseado no elemento",
          "Fortalece Afinidade Primordial"
        ]
      },
      {
        nome: "Campo Instável",
        descricao: "O Elementalista distorce o ambiente criando uma zona onde o elemento ativo domina completamente. Inimigos dentro da área sofrem 4d6 de dano elemental por turno. Além disso, o terreno se torna hostil (fogo queima continuamente, gelo reduz movimento, terra dificulta deslocamento, raio reduz reação). Habilidades como Erupção Elemental e Colapso Ambiental recebem bônus adicionais (2 dados de dano) quando usadas dentro dessa área.",
        tipo: "Sustentada",
        alcance: "9 m",
        alvos: "4 m AOE",
        custo: "19 FaD",
        recarga: "3",
        duracao: "2 T",
        dado: "4d6",
        bonus: [
          "Zona distorcida com elemento ativo",
          "Terreno se torna hostil",
          "Bônus para habilidades em área"
        ]
      },
      {
        nome: "Corrente Fluida",
        descricao: "O Elementalista projeta energia que se adapta dinamicamente, saltando entre múltiplos alvos. Causa 3d12 de dano elemental em até 3 inimigos. Cada salto mantém a propriedade do elemento ativo, podendo espalhar efeitos secundários. Se atingir o número máximo de alvos, ativa Imediatamente Afinidade Primordial.",
        tipo: "Imediata",
        alcance: "9 m",
        alvos: "3",
        custo: "10 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "3d12",
        bonus: [
          "Energia que salta entre alvos",
          "Espalha efeitos secundários",
          "Ativa Afinidade Primordial ao atingir máximo"
        ]
      },
      {
        nome: "Convergência Natural",
        descricao: "O Elementalista entra em harmonia com o elemento ativo, refinando seu controle e ampliando sua influência. Enquanto ativa, todas as Arts ganham +3 m de alcance. Os efeitos secundários dos elementos se tornam mais intensos (maior duração ou impacto). Essa habilidade potencializa diretamente Campo Instável, Prisão Elemental e Colapso Ambiental.",
        tipo: "Sustentada",
        alcance: "0 m",
        alvos: "1",
        custo: "5 FaD",
        recarga: "3",
        duracao: "Sustentada",
        dado: "N/A",
        bonus: [
          "Aumenta alcance de todas as Arts em +3 m",
          "Intensifica efeitos secundários",
          "Potencializa habilidades em área"
        ]
      },
      {
        nome: "Prisão Elemental",
        descricao: "O Elementalista comprime o elemento ativo em uma área, criando uma estrutura instável que aprisiona os inimigos. Causa 8d8 + 350% de dano mágico elemental (AtK Fixo). Os alvos ficam sob restrição leve por 2 turnos (lentidão severa, enraizamento parcial ou dificuldade de ação). Se usada após Pulso Elemental, aumenta a intensidade da restrição.",
        tipo: "Duradoura",
        alcance: "7 m",
        alvos: "2 m AOE",
        custo: "29 FaD",
        recarga: "7",
        duracao: "2 T",
        dado: "8d8",
        bonus: [
          "Comprime elemento em estrutura",
          "Aplica restrição leve aos alvos",
          "Intensidade aumentada após Pulso Elemental"
        ]
      },
      {
        nome: "Afinidade Primordial",
        descricao: "A energia elemental responde ao caos gerado pelo Elementalista. Sempre que uma Art em área atingir inimigos, a próxima habilidade ofensiva recebe +2 dados de dano elemental. Esse efeito pode ser consumido por Sobrecarga Elemental para amplificação massiva.",
        tipo: "Duradoura",
        alcance: "0 m",
        alvos: "0",
        custo: "0 FaD",
        recarga: "0",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Acumula após Arts em área",
          "Adiciona +2 dados de dano elemental",
          "Pode ser consumida para amplificação"
        ]
      },
      {
        nome: "Erupção Elemental",
        descricao: "Uma explosão violenta do elemento ativo irrompe no campo de batalha, liberando energia acumulada. Causa 6d12 de dano elemental. Se utilizada dentro de Campo Instável, causa +2d12 de dano adicional e duplica o efeito secundário aplicado. Consome Afinidade Primordial automaticamente para aumentar ainda mais o dano.",
        tipo: "Imediata",
        alcance: "8 m",
        alvos: "3 m AOE",
        custo: "21 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "6d12",
        bonus: [
          "Explosão violenta do elemento ativo",
          "Aumenta dano dentro de Campo Instável",
          "Consome Afinidade Primordial para dano adicional"
        ]
      },
      {
        nome: "Dilatação Natural",
        descricao: "O Elementalista expande a influência do elemento, distorcendo sua área de atuação. Enquanto ativa, habilidades em área aumentam seu alcance em +3 metros. Além disso, ignoram resistências elementais parciais (50%). Sinergia diretamente com Campo Instável e Cataclismo Adaptativo.",
        tipo: "Sustentada",
        alcance: "0 m",
        alvos: "1 p/ T",
        custo: "9 EnR",
        recarga: "5",
        duracao: "Sustentada",
        dado: "N/A",
        bonus: [
          "Expande influência do elemento",
          "Aumenta alcance em área em +3 metros",
          "Ignora 50% de resistências elementais parciais"
        ]
      },
      {
        nome: "Colapso Ambiental",
        descricao: "O ambiente perde estabilidade sob a pressão elemental, causando ruptura física e mágica. Causa 8d12 + 250% de dano elemental. Inimigos sofrem –2 em Reação e –2 em testes físicos. Se Campo Instável estiver ativo, a duração aumenta (+1) e o efeito secundário se intensifica.",
        tipo: "Duradoura",
        alcance: "10 m",
        alvos: "5 m AOE",
        custo: "27 EnR",
        recarga: "6",
        duracao: "1 T",
        dado: "8d12",
        bonus: [
          "Ruptura do ambiente",
          "Penalidade em Reação e testes físicos",
          "Dura mais tempo com Campo Instável ativo"
        ],
        custo_adicional: "7 FaD"
      },
      {
        nome: "Sobrecarga Elemental",
        descricao: "O Elementalista força o elemento além de seus limites naturais, concentrando energia destrutiva em um único ponto. Causa 12d10 + 12 de dano elemental. Consome Afinidade Primordial: cada acúmulo adiciona +1d12 de dano. Se usado após habilidades em área, recebe bônus adicional de impacto.",
        tipo: "Imediata",
        alcance: "7 m",
        alvos: "1",
        custo: "23 FaD",
        recarga: "4",
        duracao: "0 T",
        dado: "12d10",
        bonus: [
          "Força elemento além de limites",
          "Energia concentrada em ponto único",
          "Consome Afinidade Primordial para +1d12 por acúmulo"
        ],
        custo_adicional: "5 FaD"
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "hemomante",
    nome: "Hemomante",
    raridade: "epico",
    descricao: "O Hemomante é um mago sanguinário que domina a magia do sangue, transformando sua própria vitalidade em poder devastador. Sua origem está em rituais antigos onde o sangue era considerado a essência da vida e da magia. Eles são mestres na manipulação de fluidos corporais, criando armas vivas e aplicando maldições sanguíneas. Sua jornada é uma dança entre a vida e a morte, onde cada gota de sangue é um investimento em poder. A capacidade de transformar dor em força e vulnerabilidade em ataque são as especialidades de um Hemomante. A mecânica de combate do Hemomante é ofensiva e Sustentada, utilizando sua Vitalidade e Inteligência para lançar ataques que drenam e amplificam dano. Eles podem aplicar Hemorragia em inimigos, criando efeitos progressivos que aumentam o dano subsequente. O Hemomante pode sacrificar sua própria vida para amplificar seus ataques, transformando-se em uma ameaça cada vez maior conforme a batalha progride. A vitória do Hemomante é uma demonstração de domínio sobre a vida, morte e o poder que flui entre eles.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/KtXrTX0.jpeg",
    funcoes: ["Control DPS", "OFF Sustain"],
    atributos: {
      forca: "2d6+4",
      vitalidade: "2d8+6",
      agilidade: "1d6+4",
      inteligencia: "2d8+6",
      percepcao: "1d6+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Lâmina Hemática",
        descricao: "O Hemomante molda seu sangue em uma lâmina viva e instável. Causa 4d8+6 de dano físico. Recupera 1d12+4 HP ao causar dano. Se o alvo estiver sob Hemorragia, causa +1d12 adicional.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "9 EnR",
        recarga: "2 T",
        duracao: "0 T",
        dado: "4d8",
        bonus: ["Dano físico puro", "Recupera HP", "+1d12 com Hemorragia"]
      },
      {
        nome: "Fluxo Vampírico",
        descricao: "Um fluxo contínuo de sangue é drenado do alvo para o Hemomante. O alvo sofre 4d12+150% de dano (ATK FIXO) por turno. O Hemomante recupera HP equivalente a 50% do dano causado. Se o alvo estiver sob Hemorragia, o dano aumenta em +1d6.",
        tipo: "Sustentada",
        alcance: "6 m",
        alvos: "1",
        custo: "11 FaD",
        recarga: "3 T",
        duracao: "0 T",
        dado: "4d12",
        bonus: ["Drena vida contínua", "+50% cura", "+1d6 com Hemorragia"]
      },
      {
        nome: "Prisão Sanguínea",
        descricao: "O sangue do alvo se torna pesado e rígido, limitando seus movimentos. Aplica Enraizado (11 Obstáculo) e –3 Evasão por 2 turnos. Sempre que o alvo sofrer dano, recebe +1d6 adicional. Se usado antes de Explosão de Veias, aumenta o dano em +6d12.",
        tipo: "Duradoura",
        alcance: "7 m",
        alvos: "1",
        custo: "19 FaD",
        recarga: "3 T",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Enraizado garantido", "–3 Evasão", "+1d6 dano recebido"]
      },
      {
        nome: "Batimento Profano",
        descricao: "O coração do Hemomante pulsa em um ritmo antinatural. Enquanto ativo: Converte até 5 pontos de dano causado por turno em cura. Se combinado com Fluxo Vampírico, a cura total é aumentada em +50%.",
        tipo: "Sustentada",
        alcance: "CaC",
        alvos: "Jogador",
        custo: "5 FaD",
        recarga: "4 T",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Converte dano em cura", "+50% cura com Fluxo", "Defesa vital"]
      },
      {
        nome: "Sangue em Movimento",
        descricao: "O Hemomante acelera seu fluxo sanguíneo ao limite. Enquanto ativo: Recebe +2 Agilidade e +1 Reação. Sempre que sofrer dano, armazena 1 carga (máx. 3). Cada carga pode ser consumida para adicionar +1d8 em uma Art ofensiva.",
        tipo: "Sustentada",
        alcance: "CaC",
        alvos: "Jogador",
        custo: "7 FaD",
        recarga: "3 T",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["+2 Agilidade, +1 Reação", "Armazena cargas de dano", "+1d8 por carga consumida"]
      },
      {
        nome: "Hemorragia Controlada",
        descricao: "O Hemomante sacrifica sua própria vitalidade para amplificar seu poder. Recebe +2 dados de dano na próxima Art ofensiva. A próxima Art aplicada também aplica Hemorragia (3d6 por turno, 2 turnos). Se usado abaixo de 50% HP, recebe +1 dado adicional.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "Jogador",
        custo: "15 EnR",
        recarga: "2 T",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["+2 dados de dano", "Aplica Hemorragia", "+1 dado em baixa vida"]
      },
      {
        nome: "Explosão de Veias",
        descricao: "O Hemomante faz o sangue dos inimigos entrar em colapso violento. Causa 8d12 de dano físico em área. Aplica Hemorragia (2d6 por turno, 2 turnos). Alvos sob Prisão Sanguínea recebem +2d12 adicional.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "AOE (3 m)",
        custo: "25 FaD",
        recarga: "5 T",
        duracao: "0 T",
        dado: "8d12",
        bonus: ["Explosão devastadora", "Aplica Hemorragia em área", "+2d12 em prisioneiros"]
      },
      {
        nome: "Dilúvio Interno",
        descricao: "O Hemomante força o sangue dos inimigos a se rebelar contra seus corpos. Causa 10d12 de dano físico em área. Todos os alvos recebem Hemorragia (4d8 por turno, 2 turnos). Para cada inimigo afetado, o Hemomante recupera 2d12+4 HP. Se usado após Explosão de Veias, causa +3d12 adicional.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "AOE (4 m)",
        custo: "33 EnR",
        recarga: "6 T",
        duracao: "0 T",
        dado: "10d12",
        bonus: ["Dano apocalíptico", "Hemorragia progressiva", "+2d12+4 HP por alvo"]
      },
      {
        nome: "Marca Sanguínea",
        descricao: "O Hemomante marca o fluxo vital do inimigo, conectando sua essência ao próprio sangue. Durante 2 turnos: O alvo recebe +1 dado de dano de todas as Arts do Hemomante. Sempre que o alvo sofrer dano, o Hemomante recupera 1d8 de HP. Se o alvo estiver sob Hemorragia ou efeito semelhante, o bônus aumenta para +2 dados de dano e a cura ocorre duas vezes (máx. 1 vez por turno).",
        tipo: "Duradoura",
        alcance: "6 m",
        alvos: "1",
        custo: "15 FaD",
        recarga: "4 T",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["+1 dado de dano", "Recupera 1d8 HP", "+2 dados com Hemorragia"]
      },
      {
        nome: "Colapso Hemorrágico",
        descricao: "O Hemomante força o corpo do inimigo a entrar em falha interna, detonando o próprio sangue. Causa 5d12 de dano físico interno. Se o alvo estiver sob Marca Sanguínea ou efeitos de drenagem, causa +2d12 adicional e aplica Fraqueza (–2 Defesa) até o próximo turno. Se eliminar o alvo, recupera 2d12+6 de HP e reduz a recarga de uma Art em 1 turno.",
        tipo: "Imediata",
        alcance: "5 m",
        alvos: "1",
        custo: "17 FaD",
        recarga: "4 T",
        duracao: "0 T",
        dado: "5d12",
        bonus: ["Dano interno devastador", "+2d12 marcado", "–2 Defesa aplicada"]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "bruxo",
    nome: "Bruxo",
    raridade: "raro",
    descricao: "O Bruxo tem sua origem em um pacto místico, um acordo com um ser de poder incomensurável, como um demônio, fada ou entidade cósmica. Eles não estudam a magia como o Mago, mas a recebem como um dom ou uma maldição, um poder inato que flui através de suas veias. Sua história é de tentação e serviço.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/ugHAuFH.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "1d4+2",
      vitalidade: "1d4+4",
      agilidade: "1d4+4",
      inteligencia: "2d6+10",
      percepcao: "2d4+6",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Igni Raso",
        descricao: "O Bruxo libera uma explosão de fogo rúnico em curto alcance, causando 4d8+12 de dano mágico em todos os inimigos atingidos. Alvos afetados sofrem –1 dado de Defesa até o próximo turno devido às chamas instáveis que enfraquecem sua resistência (Condição - Fraqueza e Queimadura). Se o alvo estiver sob Marca do Bruxo, recebe +1d8 adicional e tem 25% de chance de sofrer Queimadura.",
        tipo: "Imediata",
        alcance: "3 metros",
        alvos: "Área (cone curto)",
        custo: "11 EnR",
        recarga: "2",
        duracao: "Imediata",
        dado: "4d8+12",
        bonus: [
          "Dano em área mágico",
          "Reduz defesa com chamas",
          "Chance de Queimadura em marcado"
        ]
      },
      {
        nome: "Aard Impactante",
        descricao: "Uma onda cinética poderosa é liberada à frente do Bruxo, causando 3d12 de dano e empurrando os inimigos atingidos. Se um alvo colidir com parede, obstáculo ou outro inimigo, sofre +1d6 adicional e fica Atordoado (Obstáculo 9) por 1 turno. Alvos dentro de Yrden recebem penalidade adicional de –1 em Reação após o impacto.",
        tipo: "Imediata",
        alcance: "4 metros",
        alvos: "Área (frontal)",
        custo: "12 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "3d12",
        bonus: [
          "Onda de força massiva",
          "Empurra inimigos",
          "Atordoa em colisão"
        ]
      },
      {
        nome: "Quen Ativo",
        descricao: "O Bruxo conjura um escudo rúnico protetor que absorve até 25 de dano por turno. Enquanto ativo, recebe resistência parcial a dano físico. Quando o escudo é quebrado, libera uma explosão rúnica que causa 350% do dano mágico absorvido em inimigos próximos. Se houver inimigos sob Marca do Bruxo na área da explosão, o dano aumenta em +50% por alvo marcado.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "21 EnR",
        recarga: "6",
        duracao: "3 T",
        dado: "N/A",
        bonus: [
          "Escudo protetor absorvente",
          "Resistência a dano físico",
          "Explosão ao quebrar"
        ]
      },
      {
        nome: "Golpe Rúnico",
        descricao: "Um ataque corpo a corpo imbuído com energia rúnica, causando 2d12 de dano físico. Se um Sinal (Igni, Aard ou Yrden) foi utilizado no turno anterior, o ataque causa +8d4+8 de dano mágico adicional. Se o alvo estiver sob Marca do Bruxo, o ataque ignora parcialmente sua defesa (–1 dado de defesa).",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "9 FaD & 11 EnR",
        recarga: "1",
        duracao: "0 T",
        dado: "2d12",
        bonus: [
          "Ataque corpo a corpo rúnico",
          "Dano mágico bônus com Sinal",
          "Ignora defesa em marcado"
        ]
      },
      {
        nome: "Yrden de Combate",
        descricao: "O Bruxo cria um campo rúnico no solo que desacelera e enfraquece inimigos. Alvos dentro da área têm seu movimento reduzido em 50% e sofrem –3 em Reação. Enquanto permanecerem dentro do campo, recebem +1 dado de dano de todas as habilidades do Bruxo. Se um inimigo marcado estiver dentro da área, o campo revela sua posição e impede ocultação.",
        tipo: "Duradoura",
        alcance: "4 metros",
        alvos: "Área (5m)",
        custo: "11 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Campo de controle de movimento",
          "Reduz Reação inimiga",
          "Aumenta dano do Bruxo"
        ]
      },
      {
        nome: "Instinto Bruxo",
        descricao: "Treinado para enfrentar o sobrenatural, o Bruxo adapta-se naturalmente contra criaturas perigosas. Ao enfrentar monstros, criaturas mágicas ou amaldiçoadas, recebe +1 dado de dano e +1 em Defesa. Sempre que identificar corretamente o tipo da criatura, ganha +1 bônus adicional temporário em sua próxima ação ofensiva.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "Próprio",
        custo: "0 FaD",
        recarga: "Passiva",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Especialista em criaturas",
          "Bônus de dano contra sobrenaturais",
          "Identificação aumenta próximo ataque"
        ]
      },
      {
        nome: "Óleo de Lâmina",
        descricao: "O Bruxo aplica um óleo alquímico especializado em sua arma. Enquanto ativo, seus ataques causam +9 de dano contra um tipo específico de criatura escolhido. Se usado contra um alvo sob Marca do Bruxo, o dano adicional recebe +2d8. Trocar o tipo de criatura encerra o efeito atual.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "5 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Bônus de dano especializado",
          "Dano aumentado em marcado",
          "Alquimia aplicada"
        ]
      },
      {
        nome: "Poção de Mutação",
        descricao: "O Bruxo consome uma poção mutagênica que amplifica suas capacidades físicas. Escolha entre: Aumento de Ataque, Concentração e Chance Crítica, ou Aumento de Velocidade, Fúria e Dano Crítico. Ao término do efeito, sofre Debilidade.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Próprio Bruxo",
        custo: "10 FaD",
        recarga: "4",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Amplifica capacidades físicas",
          "Duas escolhas de bônus",
          "Debilidade ao término"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "arcanista",
    nome: "Arcanista",
    raridade: "raro",
    descricao: "O Arcanista é o ápice do estudo mágico, um Mago que transcendeu as escolas elementais para dominar a pura energia arcana, a força fundamental da magia. Sua origem está nas mais antigas e prestigiadas torres de magia, onde apenas os mais brilhantes e dedicados conseguem alcançar tal nível de domínio. Eles buscam a unificação de todas as formas de magia.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/aX9UbFs.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "1d4+2",
      vitalidade: "1d4+4",
      agilidade: "1d4+4",
      inteligencia: "2d6+10",
      percepcao: "2d4+6",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Sentir Fluxo Arcano",
        descricao: "O Arcanista sintoniza sua mente com o tecido arcano ao redor, percebendo correntes invisíveis de mana. Enquanto ativa, revela fontes mágicas, efeitos ocultos e conjurações em andamento dentro da área. Recebe +1 em testes de conjuração e controle arcano. Se um inimigo conjurar dentro da área, o Arcanista ganha +1 bônus temporário em sua próxima ação contra ele.",
        tipo: "Sustentada",
        alcance: "9 metros",
        alvos: "Área (AOE)",
        custo: "5 EnR",
        recarga: "1",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Revela fluxo mágico",
          "Aumenta conjuração",
          "Bônus contra inimigos que conjuram"
        ]
      },
      {
        nome: "Condensar Mana",
        descricao: "O Arcanista comprime grandes quantidades de mana em um único ponto dentro de si. A próxima Art utilizada tem seu custo reduzido em 50% e recebe +1 dado de efeito ou dano. Se utilizada em conjunto com habilidades de alto custo (15+ EnR), também concede +1 em controle arcano. Se não for consumida dentro da duração, a mana se dissipa causando 1d12+8 de dano leve ao Arcanista.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "15 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Reduz custo em 50%",
          "Aumenta efeito ou dano",
          "Bônus em controle arcano"
        ]
      },
      {
        nome: "Descarga Primária",
        descricao: "Um disparo concentrado de energia arcana pura. Causa 2d12 de dano mágico. Se o Arcanista estiver sob efeito de Condensar Mana, o ataque causa +1d12 adicional e aplica Instabilidade Arcana no alvo por 1 turno (–1 dado de Defesa contra magias). Se atingir um alvo já afetado por Instabilidade, causa +1d12 adicional.",
        tipo: "Imediata",
        alcance: "8 metros",
        alvos: "1 Inimigo",
        custo: "9 EnR",
        recarga: "2",
        duracao: "0 T",
        dado: "2d12",
        bonus: [
          "Dano mágico concentrado",
          "Aplica Instabilidade Arcana",
          "Dano aumentado em alvo instável"
        ]
      },
      {
        nome: "Malha de Estabilidade",
        descricao: "O Arcanista estabiliza o fluxo de mana em uma área, criando uma rede de controle arcano. Aliados dentro da área recebem +1 em testes de conjuração e reduzem o custo de habilidades em –20% EnR. Inimigos sofrem interferência, recebendo –1 em controle mágico. Se uma magia falhar dentro da área, o Arcanista recupera 1d12 de Energia.",
        tipo: "Sustentada",
        alcance: "6 metros",
        alvos: "Área (AOE)",
        custo: "10 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Aliados recebem bônus de conjuração",
          "Inimigos têm interferência mágica",
          "Recupera energia em magia falhada"
        ]
      },
      {
        nome: "Reciclagem Arcana",
        descricao: "O Arcanista reaproveita energia desperdiçada. Sempre que uma Art falhar ou for anulada, recupera 50% do custo de Energia gasto. Se a falha ocorrer dentro de Malha de Estabilidade, recupera +1d10+4 adicional de Energia.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "Próprio",
        custo: "0 FaD",
        recarga: "Passiva",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Recupera energia de falhas",
          "Recuperação aumentada em Malha",
          "Eficiência mágica"
        ]
      },
      {
        nome: "Canalização Precisa",
        descricao: "O Arcanista foca completamente sua mente, refinando o controle sobre suas conjurações. Durante a duração, recebe +2 em controle arcano e ignora penalidades leves de interferência mágica. A próxima habilidade ofensiva utilizada ignora parcialmente defesas mágicas do alvo (–1 dado de defesa mágica). Se combinada com Condensar Mana, também concede +1 dado de dano adicional.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "12 EnR",
        recarga: "4",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Aumenta controle arcano",
          "Ignora penalidades de interferência",
          "Próximo ataque ignora defesa mágica"
        ]
      },
      {
        nome: "Sobrecarga de Mana",
        descricao: "O Arcanista libera uma quantidade instável de energia. Causa 8d6+12 de dano arcano. Se o alvo estiver sob Instabilidade Arcana, o dano aumenta em +4d6. Após o uso, o Arcanista sofre –2 em Defesa por 2 turnos devido à exaustão energética. Se usado com Canalização Precisa, remove essa penalidade.",
        tipo: "Imediata",
        alcance: "7 metros",
        alvos: "1 Inimigo",
        custo: "21 EnR",
        recarga: "5",
        duracao: "0 T",
        dado: "8d6+12",
        bonus: [
          "Dano arcano em sobrecarga",
          "Dano aumentado em alvo instável",
          "Exaustão pós-uso"
        ]
      },
      {
        nome: "Ruptura de Fluxo",
        descricao: "O Arcanista rompe o fluxo mágico de um alvo. Interrompe uma conjuração ativa e causa 4d8 de dano arcano. Se a interrupção for bem-sucedida, o alvo perde sua próxima ação. Se o alvo estiver dentro de Malha de Estabilidade, também sofre –1 em controle mágico por 1 turno.",
        tipo: "Imediata",
        alcance: "9 metros",
        alvos: "1 Inimigo",
        custo: "15 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "4d8",
        bonus: [
          "Interrompe conjuração",
          "Causa dano arcano",
          "Alvo perde próxima ação"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Geometria Arcana",
        descricao: "O Arcanista compreende padrões e estruturas da magia. Sempre que um efeito mágico ou rúnico for ativado por um inimigo, recupera 1d12+6 de Energia. Além disso, após recuperar Energia dessa forma, o próximo feitiço recebe +1 dado de dano mágico.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "Próprio Arcanista",
        custo: "0 EnR",
        recarga: "Passiva",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Recupera energia em magia inimiga",
          "Próximo feitiço recebe +1 dado",
          "Leitura de padrões arcanos"
        ]
      },
      {
        nome: "Explosão Vetorial",
        descricao: "O Arcanista comprime e redireciona energia em múltiplos vetores antes de liberá-la. Causa 8d8 de dano arcano em área. O centro da explosão sofre dano adicional equivalente a +1/3 da Inteligência do Arcanista. Se houver inimigos sob Instabilidade Arcana, a área de efeito é ampliada em +2 metros.",
        tipo: "Imediata",
        alcance: "7 metros",
        alvos: "Área (AOE)",
        custo: "29 EnR",
        recarga: "5",
        duracao: "Imediata",
        dado: "8d8",
        bonus: [
          "Dano adicional no centro",
          "Área ampliada com Instabilidade",
          "Múltiplos vetores de energia"
        ]
      },
      {
        nome: "Núcleo Arcano",
        descricao: "O Arcanista desenvolveu um reservatório interno de mana extremamente eficiente. Aumenta o limite máximo de Energia em +20%. Sempre que gastar 15 ou mais EnR em um turno, recebe +1 em controle arcano no próximo turno. Se gastar 25+ EnR, também reduz em 1 turno a recarga de uma habilidade.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "Próprio",
        custo: "0 EnR",
        recarga: "Passiva",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Aumenta limite máximo de Energia +20%",
          "Bônus em controle arcano com alto gasto",
          "Redução de recarga com 25+ EnR"
        ]
      },
      {
        nome: "Colapso Controlado",
        descricao: "O Arcanista cria um ponto de instabilidade absoluta e colapsa o espaço arcano ao seu redor. Causa 8d12 de dano arcano em área. Inimigos afetados por Instabilidade Arcana recebem +2d12 adicionais. Após o uso, o Arcanista não pode conjurar Arts no próximo turno devido à sobrecarga extrema. Se usado com Condensar Mana ativo, reduz essa penalidade para –1 ação em vez de bloqueio total.",
        tipo: "Imediata",
        alcance: "9 metros",
        alvos: "Área (AOE)",
        custo: "29 EnR",
        recarga: "7",
        duracao: "Imediata",
        dado: "8d12",
        bonus: [
          "Dano massivo arcano",
          "Dano adicional em Instabilidade",
          "Sobrecarga extrema com penalidade"
        ]
      }
    ]
  },
  {
    id: "druida",
    nome: "Druida",
    raridade: "epico",
    descricao: "O Druida é um guardião da natureza, cuja origem está nas florestas ancestrais, nos círculos de pedra e nos picos das montanhas intocadas pela civilização. Eles servem como sacerdotes da natureza, dedicando-se a proteger o equilíbrio ecológico e a vida selvagem. Sua magia é intuitiva e ligada aos ciclos da vida, da morte e do renascimento.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/keDcQMp.jpeg",
    funcoes: ["OFF Suporting"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Raízes Errantes",
        descricao: "Raízes violentas emergem do solo prendendo e esmagando os inimigos. Causa 3d12 de dano natural. Aplica Enraizado (-11 Obstáculo) por 1 turno. Alvos enraizados recebem +1d8 de dano de outras Arts do Druida.",
        tipo: "Duradoura",
        alcance: "6 m",
        alvos: "AOE (3 m)",
        custo: "9 FaD",
        recarga: "2",
        duracao: "1 T",
        dado: "3d12",
        bonus: [
          "Prende inimigos com Enraizado",
          "Aumenta dano em Arts subsequentes",
          "Controle de posição"
        ]
      },
      {
        nome: "Benção da Seiva",
        descricao: "A energia vital da floresta flui através dos aliados. Cura 3d8+6 HP ao ativar. Durante 2 turnos: Sempre que o alvo sofrer dano, recupera 2d6 HP. Se estiver dentro de terreno natural ou zona do Druida, cura +1d6 adicional.",
        tipo: "Duradoura",
        alcance: "5 m",
        alvos: "2",
        custo: "11 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "3d8+6",
        bonus: [
          "Cura Imediata e contínua",
          "Bônus em terreno natural",
          "Suporte defensivo"
        ]
      },
      {
        nome: "Sentinela Verde",
        descricao: "A natureza desperta e reage contra invasores. A área se torna viva: O primeiro inimigo que agir por turno sofre 3d12 de dano natural. Se estiver sob controle (Raiz, Medo, etc), sofre +1d12 adicional.",
        tipo: "Sustentada",
        alcance: "6 m",
        alvos: "AOE (3 m)",
        custo: "9 FaD",
        recarga: "3",
        duracao: "Sustentada",
        dado: "3d12",
        bonus: [
          "Dano reativo a inimigos",
          "Penalização a controlados",
          "Controle de campo"
        ]
      },
      {
        nome: "Sussurro da Terra",
        descricao: "O Druida entra em sintonia profunda com o solo. Enquanto ativo: Recebe +1 dado de Defesa, Imunidade a empurrões simples, Recupera 1d6 Energia sempre que um inimigo controlado sofrer dano.",
        tipo: "Sustentada",
        alcance: "CaC",
        alvos: "Jogador",
        custo: "5 EnR",
        recarga: "1",
        duracao: "Sustentada",
        dado: "N/A",
        bonus: [
          "Aumento de defesa",
          "Imunidade a controles simples",
          "Geração de energia"
        ]
      },
      {
        nome: "Terreno Reivindicado",
        descricao: "O Druida transforma o campo em domínio natural. Enquanto ativo: Inimigos sofrem –2 Evasão e –2 Reação, Aliados recebem +1 dado de Defesa, Todas as Arts do Druida na área causam +2 dado de dano adicional.",
        tipo: "Sustentada",
        alcance: "6 m",
        alvos: "AOE (4 m)",
        custo: "13 EnR",
        recarga: "4",
        duracao: "Sustentada",
        dado: "N/A",
        bonus: [
          "Penalidade massiva a inimigos",
          "Bônus para aliados",
          "Amplificação de dano"
        ]
      },
      {
        nome: "Forma de Fera",
        descricao: "O Druida assume uma forma bestial primitiva. Enquanto ativo: Criar uma Ficha de Companheiro com uma forma de Fera que o Jogador queira, com supervisão do mestre!",
        tipo: "Sustentada",
        alcance: "CaC",
        alvos: "Jogador",
        custo: "9 FaD",
        recarga: "4",
        duracao: "Sustentada",
        dado: "N/A",
        bonus: [
          "Transformação em criatura",
          "Novos atributos de combate",
          "Mudança de estratégia"
        ]
      },
      {
        nome: "Salto Predatório",
        descricao: "Um salto feroz guiado pelo instinto predador. Avança até o alvo sem provocar reação. Causa 3d8 de dano físico. Se usado em Forma de Fera: Derruba o alvo (Desorientado 1 turno). Se o alvo estiver Enraizado, causa +4d8+6 adicional.",
        tipo: "Imediata",
        alcance: "5 m",
        alvos: "1",
        custo: "9 FaD",
        recarga: "1",
        duracao: "0 T",
        dado: "3d8",
        bonus: [
          "Movimento sem reação",
          "Derrubada em forma bestial",
          "Dano aumentado contra enraizados"
        ]
      },
      {
        nome: "Avatar do Ciclo",
        descricao: "O Druida encarna o ciclo de vida, morte e renascimento. Enquanto ativo: Causa +2d12 de dano natural em todas as Arts, Recupera 2d10+6 HP por turno, Sempre que um inimigo controlado sofrer dano, recupera 1d6 Energia. Ao encerrar, libera uma onda natural: Causa 4d10 em AOE (3 m) e aplica Lentidão por 1 turno.",
        tipo: "Sustentada",
        alcance: "CaC",
        alvos: "Jogador",
        custo: "13 FaD",
        recarga: "6",
        duracao: "Sustentada",
        dado: "4d10",
        bonus: [
          "Amplificação de dano massiva",
          "Regeneração contínua",
          "Efeito final explosivo"
        ]
      },
      {
        nome: "Crescimento Ancestral",
        descricao: "A vegetação na área cresce de forma agressiva e viva. Enquanto ativa: Inimigos sofrem –20% em prontidão e –1 em Precisão. Aliados recebem +1 dado de defesa enquanto estiverem na área. Se combinado com Raízes Errantes, os alvos Enraizados sofrem +2d8 de dano adicional ao tentar se libertar. Se combinado com Terreno Reivindicado, a área dobra seus efeitos positivos para aliados.",
        tipo: "Sustentada",
        alcance: "6 m",
        alvos: "AOE (3 m)",
        custo: "9 FaD",
        recarga: "3",
        duracao: "Sustentada",
        dado: "N/A",
        bonus: [
          "Penalidade a inimigos",
          "Proteção a aliados",
          "Sinergia com outras Arts"
        ]
      },
      {
        nome: "Espírito da Matilha",
        descricao: "O Druida invoca a essência dos predadores naturais. Durante 2 turnos: Recebe +2 dados de ataque e +1 em Reação. Se estiver em Forma de Fera, os bônus são aumentados (+3 dados de ataque e +2 Reação). Se atingir um inimigo afetado por Medo, causa +2d10 de dano adicional. Abates durante o efeito restauram 1d12 de Energia (máx. 1 vez por turno).",
        tipo: "Duradoura",
        alcance: "CaC",
        alvos: "Jogador",
        custo: "15 EnR",
        recarga: "4",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Amplificação de ataque",
          "Bônus em Forma de Fera",
          "Geração de Energia em abates"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "shaman",
    nome: "Shaman",
    raridade: "epico",
    descricao: "O Shaman é um intermediário entre o mundo físico e o mundo espiritual, com uma origem nas tradições tribais e nos rituais de contato com os ancestrais. Eles são os curandeiros e conselheiros de suas comunidades, capazes de invocar espíritos, pedir bênçãos e afastar maldições. Sua magia é baseada na negociação e no respeito com as entidades espirituais.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/cl0Znq3.jpeg",
    funcoes: ["Control DPS", "Suporting"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Totem da Vigília",
        descricao: "Um totem espiritual observa o campo e guia aliados. Enquanto ativo: Aliados recebem +1 em Precisão e +1 Reação. Inimigos que entrarem na área pela primeira vez sofrem 4d8+12 de dano espiritual. Ativa Voz do Além a cada turno e potencializa efeitos de outros Totens ativos.",
        tipo: "Sustentada",
        alcance: "5 m",
        alvos: "AOE (3 m)",
        custo: "9 FaD",
        recarga: "2",
        duracao: "Sustentada",
        dado: "4d8+12",
        bonus: [
          "Bônus para aliados",
          "Dano ao entrar na área",
          "Sinergia com totens"
        ]
      },
      {
        nome: "Sopro Ancestral",
        descricao: "Um espírito ancestral envolve o alvo com energia vital. Cura 5d6+12 de HP e concede +1 em testes até o próximo turno. Se o alvo estiver dentro de um Totem, recebe +1 dado de defesa adicional.",
        tipo: "Imediata",
        alcance: "5 m",
        alvos: "1",
        custo: "15 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "5d6+12",
        bonus: [
          "Cura massiva",
          "Bônus de teste",
          "Proteção adicional em totens"
        ]
      },
      {
        nome: "Totem do Aprisionamento",
        descricao: "Espíritos prendem os inimigos ao plano material. Inimigos sofrem redução de movimento e –1 Reação. Ao tentar sair: teste com –9 Obstáculo. Se falhar: fica Enraizado. Se passar: perde metade da Reação no próximo turno. Sinergia direta com Território Espiritual (amplifica penalidades).",
        tipo: "Sustentada",
        alcance: "6 m",
        alvos: "AOE (3 m)",
        custo: "10 FaD",
        recarga: "3",
        duracao: "Sustentada",
        dado: "N/A",
        bonus: [
          "Controle de movimento",
          "Enraizamento ao falhar",
          "Sinergia com Território"
        ]
      },
      {
        nome: "Caminho dos Mortos",
        descricao: "Espíritos guiam aliados por caminhos invisíveis. Aliados ignoram penalidades de terreno e recebem resistência leve a dano espiritual. Se estiverem dentro de um Totem, recebem +1 ação de movimento e não provocam reações simples.",
        tipo: "Sustentada",
        alcance: "9 m",
        alvos: "AOE",
        custo: "5 EnR",
        recarga: "4",
        duracao: "Sustentada",
        dado: "N/A",
        bonus: [
          "Ignorar penalidades de terreno",
          "Resistência espiritual",
          "Mobilidade aumentada em totens"
        ]
      },
      {
        nome: "Voz do Além",
        descricao: "O Shaman mantém constante conexão com os espíritos. Para cada Totem ativo, recupera 1d12 de Energia por turno. Se houver 2 ou mais Totens ativos, recebe +1 dado de dano espiritual em Arts.",
        tipo: "Duradoura",
        alcance: "0 m",
        alvos: "0",
        custo: "0 EnR",
        recarga: "0",
        duracao: "Constante",
        dado: "1d12 por Totem",
        bonus: [
          "Geração de Energia",
          "Amplificação de dano passiva",
          "Sinergia multiplicativa"
        ]
      },
      {
        nome: "Território Espiritual",
        descricao: "O plano espiritual invade a realidade. Inimigos sofrem –2 Reação e –2 Defesa. Totens dentro da área têm seus efeitos ampliados: +1 m de alcance e efeitos secundários intensificados. Enquanto ativo, habilidades espirituais ignoram resistências em 2d12+4.",
        tipo: "Sustentada",
        alcance: "7 m",
        alvos: "AOE (4 m)",
        custo: "15 EnR",
        recarga: "4",
        duracao: "Sustentada",
        dado: "2d12+4",
        bonus: [
          "Penalidade massiva a inimigos",
          "Amplificação de totens",
          "Ignora resistências"
        ]
      },
      {
        nome: "Transe Espiritual",
        descricao: "O Shaman entra em estado de canalização espiritual. Arts causam +1d12 de dano espiritual (ignora defesa). Recebe –1 dado de defesa. Se houver um Totem ativo, o bônus aumenta em +2d12.",
        tipo: "Sustentada",
        alcance: "CaC",
        alvos: "Jogador",
        custo: "7 FaD",
        recarga: "4",
        duracao: "Sustentada",
        dado: "1d12",
        bonus: [
          "Dano espiritual puro",
          "Bônus aumentado com totens",
          "Controle de defesa"
        ]
      },
      {
        nome: "Golpe do Além",
        descricao: "Um espírito atravessa o corpo do inimigo. Causa 3d12 de dano espiritual. Se o alvo estiver dentro de um Totem, causa +1d12 adicional e aplica –1 dado de defesa até o próximo turno.",
        tipo: "Imediata",
        alcance: "4 m",
        alvos: "1",
        custo: "19 FaD",
        recarga: "1",
        duracao: "0 T",
        dado: "3d12",
        bonus: [
          "Dano espiritual direto",
          "Bônus em totens",
          "Penalidade de defesa"
        ]
      },
      {
        nome: "Chamado dos Ancestrais",
        descricao: "Espíritos atacam em conjunto em uma área. Causa 8d12+12 de dano espiritual e aplica Desorientado leve. Para cada Totem ativo, causa +1d12 adicional.",
        tipo: "Imediata",
        alcance: "7 m",
        alvos: "AOE (3 m)",
        custo: "21 EnR",
        recarga: "5",
        duracao: "0 T",
        dado: "8d12+12",
        bonus: [
          "Dano em área massivo",
          "Multiplicação por totens",
          "Controle com Desorientado"
        ]
      },
      {
        nome: "Espírito Vingativo",
        descricao: "Um espírito se liga ao alvo e o pune por agir. Por 2 turnos: Sempre que o alvo agir, sofre 3d12+200% (ATK Fixo) de dano espiritual (ignora armadura). Se estiver em Território Espiritual, também sofre –1 ação leve no próximo turno.",
        tipo: "Duradoura",
        alcance: "6 m",
        alvos: "1",
        custo: "29 EnR",
        recarga: "5",
        duracao: "2 T",
        dado: "3d12",
        bonus: [
          "Punição por ação",
          "Dano ignora armadura",
          "Penalidade em Território"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "invocador",
    nome: "Invocador",
    raridade: "raro",
    descricao: "O Invocador é um mestre em conjurar e controlar criaturas de outros planos ou dimensões, cuja origem está em estudos arcanos sobre a natureza do multiverso. Eles aprenderam os complexos selos e rituais necessários para abrir portais e forçar ou persuadir seres poderosos a lutar ao seu lado. Sua jornada é de exploração dimensional.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/aJD6KMt.jpeg",
    funcoes: ["Hibrid DPS"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Contrato Espiritual",
        descricao: "O Invocador estabelece um vínculo profundo com suas entidades, fortalecendo sua presença no plano material. Invocações recebem +9 em Ataque e Defesa e causam +1 dado de dano. Sempre que uma invocação causar dano, o Invocador recupera 1d12+6 de Energia. Se houver mais de uma invocação ativa, esse efeito ocorre apenas 1 vez por turno, mas recebe +1 dado de dano adicional por invocação extra.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "Invocações",
        custo: "0 FaD",
        recarga: "Passiva",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Aumenta invocações",
          "Recupera energia com dano",
          "Bônus múltiplo com múltiplas invocações"
        ]
      },
      {
        nome: "Chamado Menor",
        descricao: "O Invocador abre um pequeno rasgo planar e invoca uma criatura menor. A entidade pode bloquear ataques, fornecer flanco e executar ações simples de suporte. Enquanto ativa, concede +1 em testes táticos (flanqueamento, distração, posicionamento). Se utilizada em conjunto com Pacto de Compartilhamento, a invocação recebe +1 dado de resistência.",
        tipo: "Sustentada",
        alcance: "3 metros",
        alvos: "1 Invocação",
        custo: "5 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Invoca criatura de suporte",
          "Aumenta testes táticos",
          "Resistência adicional com Pacto"
        ]
      },
      {
        nome: "Pacto de Compartilhamento",
        descricao: "O Invocador liga sua essência à de uma invocação ativa. 30% do dano recebido pelo Invocador é redirecionado para a entidade vinculada. Enquanto o pacto estiver ativo, a invocação recebe +1 em Defesa. Se a invocação for destruída durante o pacto, o Invocador sofre um retorno de energia, recebendo 4d8 de dano verdadeiro.",
        tipo: "Sustentada",
        alcance: "5 metros",
        alvos: "1 Invocação",
        custo: "7 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Redireciona 30% de dano",
          "Invocação recebe defesa extra",
          "Risco de retorno de energia"
        ]
      },
      {
        nome: "Invocação Agressiva",
        descricao: "O Invocador convoca uma entidade focada puramente em combate. A criatura ataca automaticamente a cada turno, causando 4d12 de dano espiritual. Se estiver sob efeito de Contrato Espiritual, recebe +1d12 adicional. Se combinada com Pacto de Sangue, o dano da invocação aumenta em +2 dados adicionais.",
        tipo: "Sustentada",
        alcance: "4 metros",
        alvos: "1 Invocação",
        custo: "25 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "4d12",
        bonus: [
          "Invocação de combate",
          "Ataque automático por turno",
          "Dano aumentado com Pactos"
        ]
      },
      {
        nome: "Pacto de Sangue",
        descricao: "O Invocador alimenta suas invocações com sua própria vitalidade. Enquanto ativo, todas as invocações causam +3 dados de dano. Ao início de cada turno, o Invocador sofre 1d6+4 de dano direto ignorando defesas. Se uma invocação derrotar um inimigo enquanto este pacto estiver ativo, o dano sofrido no turno é reduzido pela metade.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Invocações",
        custo: "9 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Invocações causam +3 dados",
          "Custo de vida por turno",
          "Redução se vencer durante pacto"
        ]
      },
      {
        nome: "Chamado Forçado",
        descricao: "O Invocador rasga o plano espiritual de forma violenta, forçando uma entidade a atacar instantaneamente. Causa 700% de dano espiritual Imediata. Se houver uma invocação ativa no campo, o dano aumenta em +1d10 e aplica Desestabilização (–1 Defesa por 1 turno). Não cria invocação permanente, sendo um ataque puro.",
        tipo: "Imediata",
        alcance: "5 metros",
        alvos: "1 Inimigo",
        custo: "25 EnR + 7 FaD",
        recarga: "7",
        duracao: "0 T",
        dado: "700%",
        bonus: [
          "Ataque de força bruta espiritual",
          "Dano aumentado com invocação ativa",
          "Aplica Desestabilização"
        ]
      },
      {
        nome: "Quebra de Contrato",
        descricao: "O Invocador rompe violentamente o vínculo com uma invocação ativa, liberando toda sua energia acumulada. A invocação é destruída e explode, causando 12d8+12 de dano espiritual em área. Se a invocação sacrificada for Invocação Agressiva, o dano recebe +2d8 adicionais. Após o uso, o Invocador sofre –2 em controle de invocação por 1 turno.",
        tipo: "Imediata",
        alcance: "6 metros",
        alvos: "Área (AOE)",
        custo: "35 EnR",
        recarga: "7",
        duracao: "0 T",
        dado: "12d8+12",
        bonus: [
          "Sacrifica invocação em explosão",
          "Dano aumentado com Agressiva",
          "Penalidade pós-uso"
        ]
      },
      {
        nome: "Convocação Proibida",
        descricao: "O Invocador abre um portal instável e traz uma entidade de alto nível para o campo. A criatura causa 6d8 de dano por turno e exerce pressão constante na área. Enquanto ativa, inimigos próximos sofrem –1 em testes devido à presença opressiva. Se a sustentação for interrompida à força, o Invocador sofre 5d6+12 de dano por ricochete. Se usada sob efeito de Pacto de Sangue, a entidade recebe +2 dados de dano por turno.",
        tipo: "Sustentada",
        alcance: "6 metros",
        alvos: "Área (presença massiva)",
        custo: "21 EnR",
        recarga: "6",
        duracao: "Sustentada",
        dado: "6d8",
        bonus: [
          "Invocação de alto nível",
          "Dano por turno massivo",
          "Risco de ricochete"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "rune_caster",
    nome: "Rune Caster",
    raridade: "mitico",
    descricao: "O Rune Caster, ou Conjurador de Runas, tem sua origem nas tradições nórdicas e nas antigas culturas que acreditavam no poder inerente aos símbolos. Eles são estudiosos da linguagem divina, aprendendo a inscrever e ativar runas que contêm o poder da criação e da destruição. Sua jornada é de decifração e caligrafia mágica.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/TG1AZzj.jpeg",
    funcoes: ["Control DPS", "Damage Dealer"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Runa de Ancoragem",
        descricao: "Inscreve uma runa gravitacional no solo que distorce o espaço ao redor. Inimigos na área sofrem –3m Movimento e –3 Reação. Sempre que um inimigo entra ou tenta sair da área: ativa a runa e recebe 4d8 dano arcano, gera 1 pulso rúnico (usado em sinergias).",
        tipo: "Duradoura",
        alcance: "5m",
        alvos: "AOE (3m)",
        custo: "13 FaD",
        recarga: "2",
        duracao: "2 T",
        dado: "4d8",
        bonus: ["Controle", "Geração de pulso", "Debuff reativo"]
      },
      {
        nome: "Selo de Interdição",
        descricao: "Cria uma zona proibida com escrita ancestral. Inimigos dentro sofrem –11 em investidas, avanço rápido e teleporte com falha parcial em habilidades de deslocamento. Se uma habilidade for bloqueada: sofre 4d6+6 dano arcano e ativa efeitos de runas próximas.",
        tipo: "Duradoura",
        alcance: "6m",
        alvos: "AOE (4m)",
        custo: "17 FaD",
        recarga: "4",
        duracao: "2 T",
        dado: "4d6+6",
        bonus: ["Bloqueio", "Sinergia", "Penalidade"]
      },
      {
        nome: "Runa da Vigília",
        descricao: "Uma runa sensorial que reage a presença inimiga. Quando um inimigo entra ou age na área: revela inimigos ocultos, aplica –2 Precisão e ativa automaticamente uma runa próxima (se houver). Gera forte sinergia de detonação em cadeia.",
        tipo: "Duradoura",
        alcance: "6m",
        alvos: "1 área",
        custo: "7 EnR",
        recarga: "4",
        duracao: "3 T",
        dado: "N/A",
        bonus: ["Revelação", "Cadeia", "Ativação"]
      },
      {
        nome: "Círculo de Estabilidade",
        descricao: "Um campo rúnico defensivo perfeitamente alinhado. Aliados recebem +1 dado de Defesa e resistência leve a dano mágico. Se uma runa inimiga ativar dentro da área: reduz o dano em 50% e converte em +Energia via Geometria Arcana.",
        tipo: "Sustentada",
        alcance: "4m",
        alvos: "AOE (3m)",
        custo: "9 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Defesa", "Conversão", "Resistência"]
      },
      {
        nome: "Escrita Persistente",
        descricao: "Domínio sobre permanência rúnica. Runas duram +1d3 turnos após o fim. Além disso: 30% chance de uma runa NÃO ser consumida ao ativar.",
        tipo: "Duradoura",
        alcance: "0m",
        alvos: "—",
        custo: "0 EnR",
        recarga: "0",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Duração", "Conservação", "Permanência"]
      },
      {
        nome: "Geometria Arcana",
        descricao: "Entendimento perfeito da interação entre símbolos. Sempre que uma runa ativa: recupera 1d12+6 Energia (1 vez por turno). Se múltiplas runas ativarem no mesmo turno: ganha +1 bônus de rolagem no próximo feitiço.",
        tipo: "Duradoura",
        alcance: "0m",
        alvos: "—",
        custo: "0 EnR",
        recarga: "0",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Recuperação", "Bônus múltiplo", "Sinergia"]
      },
      {
        nome: "Runa da Detonação",
        descricao: "Inscreve uma runa explosiva altamente instável. Ao ativar ou ser detonada: causa 6d8 dano arcano. Se houver outras runas próximas: cada runa adiciona +1d8 dano e pode ativar em cadeia.",
        tipo: "Imediata",
        alcance: "6m",
        alvos: "AOE (2m)",
        custo: "11 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "6d8",
        bonus: ["Cadeia", "Escalável", "Explosão"]
      },
      {
        nome: "Selo da Ruptura",
        descricao: "Marca o alvo com uma runa reativa instável. Sempre que o alvo agir: sofre 6d8 dano arcano. Se estiver dentro de uma área rúnica: dano aumenta em +1d6 por runa ativa ao redor.",
        tipo: "Duradoura",
        alcance: "5m",
        alvos: "1",
        custo: "15 FaD",
        recarga: "3",
        duracao: "2 T",
        dado: "6d8",
        bonus: ["Dano reativo", "Escalável", "Marca"]
      },
      {
        nome: "Círculo de Supressão",
        descricao: "Zona de colapso mágico. Inimigos sofrem: –2 acerto do ataque e +9 custo de habilidades. Se ativarem runas dentro da área: sofrem +3d6 dano adicional e têm –2 bônus de rolagem.",
        tipo: "Sustentada",
        alcance: "5m",
        alvos: "AOE (3m)",
        custo: "13 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Penalidade", "Dano", "Debuff"]
      },
      {
        nome: "Runa do Julgamento",
        descricao: "Detona todas as runas ao redor do alvo simultaneamente. Causa 4d12 base. Para cada runa consumida: +1d12 dano e aplica –1 Defesa (1 turno). Pode causar explosões em cadeia devastadoras.",
        tipo: "Imediata",
        alcance: "7m",
        alvos: "1",
        custo: "17 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "4d12",
        bonus: ["Consumo total", "Escalável", "Debuff"]
      },
      {
        nome: "Encadeamento Rúnico",
        descricao: "Conecta runas através de linhas arcanas invisíveis. Enquanto ativo: ativar uma runa ativa TODAS conectadas e dano das runas aumenta em +2 dados adicionais. Se 3 runas forem ativadas juntas: aplica Desestabilizado em área. Essa é a base do combo principal da classe.",
        tipo: "Duradoura",
        alcance: "8m",
        alvos: "até 3 runas",
        custo: "19 FaD",
        recarga: "4",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Cadeia", "Amplificação", "Massivo"]
      },
      {
        nome: "Mandamento Antigo",
        descricao: "Invoca uma runa ancestral proibida. Efeito base: causa 6d12 dano arcano por turno. Enquanto ativa: inimigos NÃO podem receber bônus e toda runa ativada próxima: +2d12 dano adicional. Se combinada com Encadeamento Rúnico: cria um colapso mágico em cadeia devastador.",
        tipo: "Duradoura",
        alcance: "6m",
        alvos: "1",
        custo: "21 EnR",
        recarga: "6",
        duracao: "2 T",
        dado: "6d12",
        bonus: ["Bloqueio", "Sinergia", "Persistente"]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "encantrix",
    nome: "Encantrix",
    raridade: "epico",
    descricao: "A Encantrix, ou Encantadora, tem sua origem nas cortes reais e nos círculos sociais, onde a arte da persuasão e da manipulação é a chave para o poder. Elas são mestras na magia mental e ilusória, capazes de dobrar a vontade dos outros e criar miragens que confundem e desorientam. Sua história é de intriga e influência.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/4q0xQGq.jpeg",
    funcoes: ["Control DPS", "Suporting"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Olhar Irrecusável",
        descricao: "A Encantrix fixa o olhar e invade a mente do alvo com pura imposição. Aplica Encantado por 2 turnos. Alvos Encantados sofrem –3 em testes mentais e têm prioridade em atacar alvos definidos pela Encantrix (efeito leve de controle). Se o alvo já estiver sob controle, evolui para Dominado leve por 1 turno.",
        tipo: "Duradoura",
        alcance: "6 m",
        alvos: "1",
        custo: "11 FaD",
        recarga: "4",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Encanta alvo",
          "Penalidade mental",
          "Controle de prioridades"
        ]
      },
      {
        nome: "Voz de Seda",
        descricao: "Palavras suaves manipulam emoções e fortalecem aliados. Aliados recebem +2 em testes sociais e mágicos por 2 turnos. Se houver inimigos controlados na área, aliados recebem +1 dado de dano contra eles.",
        tipo: "Duradoura",
        alcance: "7 m",
        alvos: "AOE (3 m)",
        custo: "9 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Bônus social e mágico",
          "Dano contra controlados",
          "Suporte em área"
        ]
      },
      {
        nome: "Laço da Devoção",
        descricao: "Um vínculo mental prende o alvo à vontade da Encantrix. Enquanto ativo: O alvo sofre –2 Reação e –1 dado de defesa. Se tentar atacar a Encantrix, falha automaticamente (1 vez por turno). Se o alvo estiver Encantado, passa a sofrer dano de 4d8+6 ao tentar agir contra aliados.",
        tipo: "Sustentada",
        alcance: "6 m",
        alvos: "1",
        custo: "11 FaD",
        recarga: "4",
        duracao: "Sustentada",
        dado: "4d8+6",
        bonus: [
          "Vínculo mental",
          "Falha garantida contra Encantrix",
          "Punição por ação"
        ]
      },
      {
        nome: "Desvio de Atenção",
        descricao: "A mente do alvo é desviada por ilusões sutis. Aplica –3 Reação no alvo. O próximo ataque contra ele recebe vantagem tática e +1 dado de dano. Se o alvo estiver sob controle, também perde 1 ação leve.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "1",
        custo: "9 EnR",
        recarga: "2",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Distração mental",
          "Vantagem para próximo ataque",
          "Perda de ação em controlados"
        ]
      },
      {
        nome: "Presença Magnética",
        descricao: "A presença da Encantrix enfraquece a resistência mental dos inimigos. Inimigos sob efeito de controle sofrem –2 em resistências. Esse efeito permite escalonar habilidades como Fenda de Mana e Sentença Velada.",
        tipo: "Duradoura",
        alcance: "0 m",
        alvos: "0",
        custo: "0 EnR",
        recarga: "0",
        duracao: "Constante",
        dado: "N/A",
        bonus: [
          "Penalidade de resistência",
          "Sinergia com habilidades",
          "Passiva permanente"
        ]
      },
      {
        nome: "Elegância Letal",
        descricao: "Cada falha do inimigo fortalece a Encantrix. Sempre que um inimigo falhar em resistir a uma Art de controle: Recupera 1d12+6 Energia. Se o alvo já estiver controlado, também recebe +1 dado de dano na próxima Art.",
        tipo: "Duradoura",
        alcance: "0 m",
        alvos: "0",
        custo: "0 EnR",
        recarga: "0",
        duracao: "Constante",
        dado: "1d12+6",
        bonus: [
          "Geração de energia",
          "Amplificação de dano",
          "Sinergia com controle"
        ]
      },
      {
        nome: "Fenda de Mana",
        descricao: "Um corte arcano preciso rompe a estrutura mágica do alvo. Causa 6d12+12 de dano mágico. Se o alvo estiver sob controle, causa +3d12 e ignora defesa parcial.",
        tipo: "Imediata",
        alcance: "7 m",
        alvos: "1",
        custo: "28 EnR",
        recarga: "6",
        duracao: "0 T",
        dado: "6d12+12",
        bonus: [
          "Dano mágico puro",
          "Amplificação em controlados",
          "Ignora defesa parcial"
        ]
      },
      {
        nome: "Colapso Elegante",
        descricao: "A mana do alvo implode sob pressão refinada. Causa 4d8+12 de dano mágico. Se o alvo estiver controlado, sofre Desorientado e –2 dados de Defesa por 1 turno.",
        tipo: "Imediata",
        alcance: "3 m",
        alvos: "1",
        custo: "15 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "4d8+12",
        bonus: [
          "Dano mágico",
          "Desorientação",
          "Penalidade de defesa"
        ]
      },
      {
        nome: "Toque de Ruína",
        descricao: "Um toque amaldiçoado sela o destino do alvo. Marca por 2 turnos. Sempre que o alvo agir, sofre 2d10 de dano arcano. Se estiver controlado, o dano aumenta para +2d10 e reduz –1 Reação.",
        tipo: "Duradoura",
        alcance: "CaC",
        alvos: "1",
        custo: "15 EnR",
        recarga: "4",
        duracao: "2 T",
        dado: "2d10",
        bonus: [
          "Marca maldita",
          "Dano por ação",
          "Penalidade em controlados"
        ]
      },
      {
        nome: "Sentença Velada",
        descricao: "Um julgamento invisível recai sobre a mente do alvo. Causa 8d12+12 de dano mágico. Se o alvo estiver Encantado ou Dominado, o dano é considerado crítico. Se eliminar o alvo, recupera 3d12 de Energia e reduz 1 turno de recarga de uma Art.",
        tipo: "Imediata",
        alcance: "7 m",
        alvos: "1",
        custo: "25 EnR",
        recarga: "5",
        duracao: "0 T",
        dado: "8d12+12",
        bonus: [
          "Dano crítico em controlados",
          "Geração de energia",
          "Redução de recarga"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "necromante",
    nome: "Necromante",
    raridade: "mitico",
    descricao: "O Necromante é um praticante das artes proibidas, cuja origem está na obsessão pela vida após a morte e no desejo de desafiar a lei natural. Eles buscam o poder na manipulação dos espíritos e dos corpos dos mortos, aprendendo a reanimar esqueletos e zumbis para servi-los. Sua história é de isolamento e repulsa.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/4qFZWMu.jpeg",
    funcoes: ["Control DPS", "Hibrid DPS", "Suporting"],
    atributos: {
      forca: "1d4+2",
      vitalidade: "1d4+4",
      agilidade: "1d4+4",
      inteligencia: "2d6+10",
      percepcao: "2d4+6",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Levantar Cadáver",
        descricao: "Reanima um cadáver recente sob controle direto do Necromante. O morto-vivo age logo após o conjurador, podendo atacar, bloquear, flanquear ou servir como recurso para outras Arts. O cadáver é fraco individualmente, mas essencial para o ecossistema da classe. Qualidade do cadáver: Cadáver Comum = Esqueleto (Raça Necrófago) - Nv. 15, Cadáver Raro = Ghoul (Raça Necrófago) - Nv. 20, Cadáver Épico = Cavaleiro Negro (Raça Necrófago) - Nv. 30, Cadáver Lendário = Dulahan (Raça Necrófago) - Nv. 40.",
        tipo: "Sustentada",
        alcance: "3m",
        alvos: "1",
        custo: "8 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Invocação", "Controle", "Escalável"]
      },
      {
        nome: "Servo Putrefato",
        descricao: "Infunde energia necromântica em um morto-vivo ativo, tornando-o instável e extremamente agressivo. Enquanto ativo: Causa +2 dados de dano. Ao morrer, explode automaticamente (6d12+6 AOE).",
        tipo: "Sustentada",
        alcance: "4m",
        alvos: "1 morto-vivo",
        custo: "5 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "6d12+6",
        bonus: ["Amplificação", "Explosão", "Desvantagem"]
      },
      {
        nome: "Zona de Profanação",
        descricao: "Corrompe o solo com energia da morte, criando um domínio necromântico. Na área: Mortos-vivos recebem +1 dado de Defesa e +1 dado de Ataque. Inimigos sofrem –1 dado em cura recebida. Sempre que um morto-vivo causa dano, o Necromante recupera 1d6 Energia.",
        tipo: "Duradoura",
        alcance: "11m",
        alvos: "AOE (5m)",
        custo: "9 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Bônus", "Penalidade", "Recuperação"]
      },
      {
        nome: "Olhos do Túmulo",
        descricao: "O Necromante conecta sua consciência a um servo, enxergando e ouvindo através dele. Durante o efeito: Ganha +2 Percepção. Pode lançar habilidades a partir da posição do morto-vivo.",
        tipo: "Duradoura",
        alcance: "Ilimitado",
        alvos: "1 morto-vivo",
        custo: "6 EnR",
        recarga: "4",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Visão", "Controle remoto", "Sinergia"]
      },
      {
        nome: "Marcha Incessante",
        descricao: "Os mortos não sentem dor nem hesitação. Imunes a medo, confusão e controle mental. Ignoram penalidades de moral.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "Mortos-vivos",
        custo: "0 EnR",
        recarga: "0",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Imunidade", "Persistência", "Automático"]
      },
      {
        nome: "Economia da Morte",
        descricao: "A morte alimenta o Necromante. Sempre que um morto-vivo é destruído: Recupera 1d12+6 Energia.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "—",
        custo: "0 EnR",
        recarga: "0",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Recuperação", "Sustain", "Permanência"]
      },
      {
        nome: "Toque da Decadência",
        descricao: "A carne do alvo entra em colapso ao toque do Necromante. Causa 3d10+6 dano necrótico e aplica: –2 Defesa. Recebe +1 dado de dano de mortos-vivos. Se morrer: gera cadáver gratuito.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "11 FaD",
        recarga: "2",
        duracao: "2 T",
        dado: "3d10+6",
        bonus: ["Debuff", "Amplificação", "Geração"]
      },
      {
        nome: "Maldição da Carne Fraca",
        descricao: "Enfraquece o corpo do alvo. –1 dado de Defesa. Recebe +1 dado de dano de mortos-vivos. Sinergia: stack com Toque da Decadência.",
        tipo: "Duradoura",
        alcance: "5m",
        alvos: "1",
        custo: "9 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Debuff", "Amplificação", "Sinergia"]
      },
      {
        nome: "Explosão Cadavérica",
        descricao: "Detona um cadáver ou morto-vivo ativo. Causa 6d8+12 dano necrótico. Se estiver sob buffs (Servo Putrefato / Zona): ganha +2d8 adicional.",
        tipo: "Imediata",
        alcance: "4m",
        alvos: "AOE (3m)",
        custo: "11 EnR",
        recarga: "2",
        duracao: "0 T",
        dado: "6d8+12",
        bonus: ["Dano em área", "Amplificação", "Sacrifício"]
      },
      {
        nome: "Praga Persistente",
        descricao: "Uma doença espiritual se espalha pela área. Inimigos sofrem 4d8 por turno e –2 testes físicos. Cada inimigo afetado: aumenta em +1 o dano de mortos-vivos contra ele.",
        tipo: "Sustentada",
        alcance: "4m",
        alvos: "AOE",
        custo: "11 FaD",
        recarga: "4",
        duracao: "0 T",
        dado: "4d8",
        bonus: ["Contínuo", "Debuff", "Amplificação"]
      },
      {
        nome: "Roubo Vital",
        descricao: "O Necromante drena vida através de seus servos. Sempre que um morto-vivo causa dano: Recupera 1d12+6 HP. Sinergia: sustain absurdo em combate longo.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "—",
        custo: "0 EnR",
        recarga: "0",
        duracao: "Passiva",
        dado: "N/A",
        bonus: ["Cura", "Sustain", "Permanência"]
      },
      {
        nome: "Decreto do Túmulo",
        descricao: "Transforma a área em domínio absoluto da morte. Inimigos: 4d8+12 dano por turno, –2 bônus de rolagem, –50% cura. Mortos-vivos: +2 dados ataque, regeneram 2d8 HP, explodem ao morrer. Se inimigo morrer: vira invocação automática.",
        tipo: "Duradoura",
        alcance: "6m",
        alvos: "AOE (4m)",
        custo: "21 EnR",
        recarga: "5",
        duracao: "3 T",
        dado: "4d8+12",
        bonus: ["Domínio", "Persistente", "Conversão"]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "exorcista",
    nome: "Exorcista",
    raridade: "epico",
    descricao: "O Exorcista é um guerreiro da fé especializado em combater entidades sobrenaturais, cuja origem está nas ordens religiosas dedicadas à purificação e à erradicação do mal. Eles são treinados para identificar e banir demônios, fantasmas e outras criaturas profanas, utilizando rituais sagrados. Sua jornada é de constante perigo.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/HXy8b9s.jpeg",
    funcoes: ["Damage Dealer", "OFF Suporting"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Selo de Repulsão",
        descricao: "Marca o alvo com um símbolo sagrado que rejeita sua presença. O inimigo sofre –2 de precisão e não pode se aproximar voluntariamente do Exorcista. Se estiver sob Marca da Expiação, também sofre –2 Reação.",
        tipo: "Duradoura",
        alcance: "6 m",
        alvos: "1",
        custo: "13 FaD",
        recarga: "4",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Marca sagrada",
          "Afasta inimigos",
          "Penalidade de precisão"
        ]
      },
      {
        nome: "Lâmina Litúrgica",
        descricao: "Um corte imbuído de fé que atinge corpo e espírito. Causa 5d8+6 de dano sagrado. Se o alvo estiver marcado, causa +2d8 e aplica Fragilidade Espiritual leve (–1 dado de defesa contra dano mágico).",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "1",
        custo: "11 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "5d8+6",
        bonus: [
          "Dano sagrado",
          "Bônus em marcados",
          "Fragilidade espiritual"
        ]
      },
      {
        nome: "Marca da Expiação",
        descricao: "Marca o alvo como pecador aos olhos do divino. Enquanto ativa: Recebe +2 dados de dano sagrado de qualquer fonte, Sempre que usar habilidade, sofre 3d8 de dano espiritual (ignora defesa). Essa habilidade é o núcleo de combo do Exorcista.",
        tipo: "Duradoura",
        alcance: "6 m",
        alvos: "1",
        custo: "15 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "3d8",
        bonus: [
          "Amplificação de dano",
          "Punição por ação",
          "Núcleo de combo"
        ]
      },
      {
        nome: "Cinzas Consagradas",
        descricao: "Espalha cinzas sagradas que queimam a presença espiritual. Inimigos na área: Sofrem 3d10+6 de dano sagrado por turno, Sofrem –2 movimento. Alvos marcados dentro da área recebem +1d10 adicional por turno.",
        tipo: "Sustentada",
        alcance: "4 m",
        alvos: "AOE (3 m)",
        custo: "11 FaD",
        recarga: "3",
        duracao: "Sustentada",
        dado: "3d10+6",
        bonus: [
          "Dano contínuo",
          "Redução de movimento",
          "Amplificação em marcados"
        ]
      },
      {
        nome: "Oração Dissolvente",
        descricao: "Uma prece que desfaz corrupção e estabiliza a alma. Remove: 1 condição negativa leve ou média OU reduz em 50% um efeito duradouro ativo. Se usado em aliado dentro de zona sagrada, também concede +1 dado de defesa no próximo turno.",
        tipo: "Imediata",
        alcance: "4 m",
        alvos: "1",
        custo: "9 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Remoção de condições",
          "Redução de efeitos",
          "Proteção em zonas"
        ]
      },
      {
        nome: "Veredito do Nome Verdadeiro",
        descricao: "O Exorcista invoca o nome verdadeiro da entidade, quebrando sua resistência. Causa 5d10 de dano sagrado. Se o alvo estiver: Marcado → ignora defesa, Dentro de zona sagrada → +3d10 adicional.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "1",
        custo: "19 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "5d10",
        bonus: [
          "Nome verdadeiro",
          "Ignora defesa em marcados",
          "Bônus em zonas sagradas"
        ]
      },
      {
        nome: "Círculo de Pureza",
        descricao: "Cria uma área protegida contra corrupção espiritual. Aliados dentro: +2 em testes Reação, Ignoram penalidades espirituais leves. Inimigos: Sofrem –2 em testes mentais, Não podem se ocultar ou ficar invisíveis.",
        tipo: "Sustentada",
        alcance: "4 m",
        alvos: "AOE (3 m)",
        custo: "7 EnR",
        recarga: "4",
        duracao: "Sustentada",
        dado: "N/A",
        bonus: [
          "Proteção aliados",
          "Negação de invisibilidade",
          "Penalidade mental inimigos"
        ]
      },
      {
        nome: "Ritual de Banimento",
        descricao: "Um ritual condensado que tenta expulsar a entidade do plano físico. Causa 6d12+12 de dano sagrado. Se o alvo estiver: Abaixo de 50% HP → sofre Banimento parcial (perde ação principal), Marcado → teste com penalidade pesada.",
        tipo: "Imediata",
        alcance: "7 m",
        alvos: "1",
        custo: "21 EnR",
        recarga: "5",
        duracao: "0 T",
        dado: "6d12+12",
        bonus: [
          "Dano maciço",
          "Banimento parcial",
          "Penalidade em marcados"
        ]
      },
      {
        nome: "Salvo da Ruína",
        descricao: "Dispara múltiplos selos de purificação que explodem ao contato. Cada alvo sofre 4d8 de dano sagrado. Se estiverem marcados: recebem +2d8, espalham a Marca para outro inimigo próximo (1 vez por alvo).",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "3",
        custo: "17 EnR",
        recarga: "5",
        duracao: "0 T",
        dado: "4d8",
        bonus: [
          "Dano múltiplo",
          "Propagação de marca",
          "Selos explosivos"
        ]
      },
      {
        nome: "Última Absolvição",
        descricao: "O julgamento final. O Exorcista canaliza fé absoluta para apagar a existência do alvo. Causa 10d8 + 1/4 INT de dano sagrado. Se o alvo estiver: Marcado → acerto crítico, Dentro de zona sagrada → Dano crítico Nv.3. Se derrotar o alvo: recupera 2d12+6 EnR, reduz recarga de uma Art em 2 turnos.",
        tipo: "Imediata",
        alcance: "7 m",
        alvos: "1",
        custo: "29 FaD",
        recarga: "6",
        duracao: "0 T",
        dado: "10d8",
        bonus: [
          "Julgamento final",
          "Crítico em marcados",
          "Recuperação e redução de recarga"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "astromante",
    nome: "Astromante",
    raridade: "lendario",
    descricao: "O Astromante é um Mago que busca o poder nas estrelas e nos corpos celestes, cuja origem está nos observatórios antigos e nas escolas de astrologia. Eles acreditam que o destino e o poder estão escritos no céu, e aprenderam a interpretar e canalizar a energia cósmica para seus feitiços. Sua jornada é de contemplação e cálculo.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/nRM9zrp.jpeg",
    funcoes: ["Damage Dealer", "OFF Suporting"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Leitura do Firmamento",
        descricao: "O Astromante fixa seu olhar no fluxo celeste que envolve o alvo, traçando as linhas invisíveis que conectam suas ações ao destino. Pequenas constelações orbitam o corpo do alvo, revelando padrões de comportamento e abrindo brechas previsíveis. Efeitos: O alvo recebe 1 Marca Astral por turno (máx. 3). Ao conjurar, o Astromante escolhe uma influência ativa: → –1 Defesa (fraqueza prevista) → –1 Testes (instabilidade mental) → +1 Ataque aliado contra o alvo (exploração de padrão).",
        tipo: "Duradoura",
        alcance: "8 m",
        alvos: "1",
        custo: "15 EnR",
        recarga: "3",
        duracao: "3 T",
        dado: "N/A",
        bonus: ["Marca Astral", "Debuff selecionável", "Previsão de padrões"]
      },
      {
        nome: "Constelação Vinculante",
        descricao: "O Astromante desenha uma constelação no solo, conectando pontos invisíveis do espaço com linhas gravitacionais. Essas linhas prendem o movimento e interferem na coordenação dos inimigos. –3 Movimento (gravidade aumentada), –2 Reação (delay temporal). Inimigos que entram ou começam turno na área recebem 1 Marca Astral.",
        tipo: "Sustentada",
        alcance: "4 m",
        alvos: "AOE (3m)",
        custo: "6 EnR",
        recarga: "2",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Controle de campo", "Geração de Marca", "Redução de mobilidade"]
      },
      {
        nome: "Presságio Negativo",
        descricao: "O Astromante força uma leitura específica do futuro do alvo: falha inevitável. Quando o alvo ERRA um ataque: sofre 6d8 dano cósmico. Se possuir Marca Astral: consome 1 Marca, causa +2d8 dano adicional e aplica breve distorção (–1 reação no próximo turno).",
        tipo: "Duradoura",
        alcance: "6 m",
        alvos: "1",
        custo: "15 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "6d8",
        bonus: ["Dano reativo", "Consumo de Marca", "Debuff de reação"]
      },
      {
        nome: "Trama do Possível",
        descricao: "O Astromante manipula múltiplas linhas de realidade simultaneamente. ALIADO: Pode repetir 1 rolagem por turno e escolher o melhor resultado. INIMIGO: Deve repetir 1 sucesso e usar o pior resultado. Se o alvo tiver Marca Astral: gera +1 Marca adicional.",
        tipo: "Duradoura",
        alcance: "7 m",
        alvos: "1",
        custo: "13 EnR",
        recarga: "6",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Manipulação de rolagens", "Efeito invertido para inimigos", "Sinergia com Marca"]
      },
      {
        nome: "Eclipse Parcial",
        descricao: "O Astromante invoca um eclipse incompleto, onde a luz das estrelas é distorcida. –3 Precisão. Inimigos não recebem buffs positivos. Falhas geram 1 Marca Astral automaticamente. Essa habilidade cria ambiente ideal para geração de stacks e ativação de Presságio.",
        tipo: "Sustentada",
        alcance: "5 m",
        alvos: "AOE (4m)",
        custo: "9 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Bloqueio de buffs", "Geração de Marca em falhas", "Penalidade de precisão"]
      },
      {
        nome: "Órbita Violenta",
        descricao: "Fragmentos de estrelas mortas passam a orbitar o Astromante, reagindo ao seu fluxo mágico. Sempre que causar dano: consome 1 Marca Astral. Cada Marca consumida: causa +1d10 dano adicional automático. Inimigos adjacentes sofrem 1d6 por turno (campo residual).",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Jogador",
        custo: "12 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "4d8+12",
        bonus: ["Consumo de Marca", "Dano de campo", "Amplificação com Marca"]
      },
      {
        nome: "Fragmento Estelar",
        descricao: "O Astromante comprime energia cósmica em um único ponto e a dispara como projétil de pura destruição estelar. 6d12 + 12 dano cósmico. Cada marca: +1d12 dano adicional.",
        tipo: "Imediata",
        alcance: "8 m",
        alvos: "1",
        custo: "18 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "6d12+12",
        bonus: ["Dano escalável", "Projétil de energia", "Penetração de defesa"]
      },
      {
        nome: "Pulso Astral",
        descricao: "Uma onda de choque gravitacional explode no alvo, distorcendo seu equilíbrio físico e espiritual. 4d6 + 12 dano. Empurra 6m. Se houver Marca Astral: consome 1, aplica Desestabilizado (–2 Defesa).",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "1",
        custo: "11 EnR",
        recarga: "2",
        duracao: "0 T",
        dado: "4d6+12",
        bonus: ["Empurrão", "Debuff de Defesa", "Consumo de Marca"]
      },
      {
        nome: "Chuva de Meteoritos Menores",
        descricao: "O Astromante rasga o céu momentaneamente, fazendo pequenos meteoros atravessarem o espaço e colidirem com o campo de batalha. 4d12 dano cósmico. Cada alvo com Marca Astral sofre +1d12 adicional. Consome 1 Marca por alvo atingido.",
        tipo: "Imediata",
        alcance: "5 m",
        alvos: "AOE (4m)",
        custo: "19 FaD",
        recarga: "4",
        duracao: "0 T",
        dado: "4d12",
        bonus: ["Dano em área", "Consumo de Marca", "Sinergia com stacks"]
      },
      {
        nome: "Convergência Celeste",
        descricao: "O Astromante alinha múltiplos corpos celestes em um único ponto de convergência, liberando feixe de energia absoluta. 6d12 + 12 dano cósmico. Consome TODAS as Marcas Astrais do campo. Cada marca: +1d12 dano. Se consumir 5+: ignora Defesa.",
        tipo: "Imediata",
        alcance: "8 m",
        alvos: "Linha",
        custo: "25 EnR",
        recarga: "6",
        duracao: "0 T",
        dado: "6d12+12",
        bonus: ["Consumo total de Marca", "Ignora Defesa com stack alto", "Dano escalável"]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "cacador",
    nome: "Caçador",
    raridade: "comum",
    descricao: "O Caçador, ou Ranger, tem sua origem nas fronteiras selvagens e nas comunidades que dependem da caça para sobreviver, sendo um mestre na sobrevivência e no rastreamento. Eles são a ponte entre a civilização e a natureza, utilizando suas habilidades para proteger os assentamentos de ameaças selvagens. Sua jornada é de exploração e vigilância.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/ybwfveA.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "1d4+4",
      vitalidade: "2d4+6",
      agilidade: "2d6+10",
      inteligencia: "1d4+4",
      percepcao: "1d4+2",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Olhos do Predador",
        descricao: "O Caçador aguça seus sentidos ao extremo, entrando em um estado de percepção ampliada (Condição de Concentração). Durante a duração, recebe +1 dado em testes de Percepção, Precisão e Rastreamento. Inimigos dentro de 10 metros sofrem –2 em testes de ocultação e não podem se beneficiar de invisibilidade parcial contra o Caçador. Além disso, o primeiro ataque realizado contra um alvo não detectado anteriormente recebe +1 dado de dano adicional. Se o Caçador aplicar Marca de Caça durante este efeito, a duração da Marca é aumentada em +1 turno.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Próprio Caçador",
        custo: "5 FaD",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Aumenta Percepção e Precisão",
          "Reduz ocultação inimiga",
          "Primeiro ataque recebe bônus de dano"
        ]
      },
      {
        nome: "Marca de Caça",
        descricao: "O Caçador marca um alvo, analisando seus movimentos e padrões de combate. O alvo marcado tem sua posição sempre revelada para o Caçador e não pode se ocultar com sucesso durante a duração. Ataques do Caçador contra o alvo causam +3d6 de dano adicional e ignoram penalidades de visão ou cobertura leve. Se o alvo estiver sob efeitos de controle (Imobilizado, Lentidão ou Debuff de Defesa), o dano adicional aumenta em +1d6. Abater um alvo sob Marca de Caça ativa Imediatamente Instinto Assassino.",
        tipo: "Duradoura",
        alcance: "9 metros",
        alvos: "1 Inimigo",
        custo: "13 FaD",
        recarga: "3",
        duracao: "2 T",
        dado: "3d6",
        bonus: [
          "Revela posição do alvo",
          "Aumenta dano contra marcado",
          "Ativa Instinto Assassino ao abater"
        ]
      },
      {
        nome: "Armadilha de Contenção",
        descricao: "O Caçador instala uma armadilha oculta no terreno. O primeiro inimigo que entrar na área sofre 4d8+12 de dano físico e fica Imobilizado (-9) por 1 turno. Alvos afetados pela armadilha tornam-se extremamente vulneráveis, recebendo +1 dado de dano de todas as habilidades do Caçador durante a imobilização.",
        tipo: "Duradoura",
        alcance: "5 metros",
        alvos: "1 Inimigo",
        custo: "7 FaD",
        recarga: "4",
        duracao: "3 T",
        dado: "4d8+12",
        bonus: [
          "Aplica Imobilização",
          "Aumenta vulnerabilidade do alvo",
          "Tática de emboscada"
        ]
      },
      {
        nome: "Rastro Fantasma",
        descricao: "O Caçador se move como uma sombra, apagando sua presença do ambiente. Enquanto ativa, não deixa rastros e recebe +1 em Evasão. Se iniciar um ataque enquanto estiver sob Rastro Fantasma, o golpe recebe +1 dado de dano e aplica Desorientação leve no alvo por 1 turno.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Próprio Caçador",
        custo: "5 EnR",
        recarga: "3",
        duracao: "Sustentada",
        dado: "N/A",
        bonus: [
          "Aumenta Evasão",
          "Movimento silencioso",
          "Ataque surpresa com Desorientação"
        ]
      },
      {
        nome: "Zona de Predação",
        descricao: "O Caçador transforma o terreno em seu domínio de caça. Inimigos dentro da área sofrem –1 em Movimento e –1 em Reação. Alvos sob Marca de Caça ou afetados por Imobilização sofrem penalidades adicionais de –1 em testes de Defesa. Sempre que um inimigo tentar sair da área, o Caçador pode realizar um Disparo Calculado com custo reduzido em –3 EnR (uma vez por turno).",
        tipo: "Sustentada",
        alcance: "6 metros",
        alvos: "Área (6m)",
        custo: "8 EnR",
        recarga: "5",
        duracao: "Sustentada",
        dado: "N/A",
        bonus: [
          "Reduz Movimento e Reação inimiga",
          "Penalidades adicionais a marcados",
          "Disparo Calculado com custo reduzido"
        ]
      },
      {
        nome: "Disparo Calculado",
        descricao: "O Caçador realiza um disparo preciso visando pontos vitais. Causa 2d12 de dano físico. Se o alvo estiver sob Marca de Caça, o ataque causa +1d12+6 de dano adicional. Se o alvo estiver Imobilizado, o ataque recebe vantagem (rola dano duas vezes e mantém o maior resultado). Caso ambas as condições estejam ativas, o ataque ignora parcialmente a defesa do alvo (–1 dado de defesa).",
        tipo: "Imediata",
        alcance: "11 metros",
        alvos: "1 Inimigo",
        custo: "11 EnR",
        recarga: "1",
        duracao: "Imediata",
        dado: "2d12",
        bonus: [
          "Dano aumentado com Marca de Caça",
          "Vantagem em alvo Imobilizado",
          "Ignora defesa em ambas condições"
        ]
      },
      {
        nome: "Flecha Debilitante",
        descricao: "O Caçador dispara uma flecha especializada que compromete a capacidade defensiva do alvo. Causa 2d12 de dano e aplica –1 dado de Defesa por 2 turnos. Se o alvo estiver sob Marca de Caça, também sofre –3 em Reação. Se usado contra um alvo já afetado por Armadilha de Contenção, a penalidade de Defesa é duplicada durante o primeiro turno.",
        tipo: "Duradoura",
        alcance: "8 metros",
        alvos: "1 Inimigo",
        custo: "10 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "2d12",
        bonus: [
          "Reduz defesa do alvo",
          "Penalidade de Reação com Marca",
          "Penalidade duplicada em armadilha"
        ]
      },
      {
        nome: "Instinto Assassino",
        descricao: "O Caçador se fortalece a cada abate bem-sucedido. Sempre que um inimigo sob efeito de Marca de Caça for derrotado, o Caçador ativa Instinto Assassino, recebendo um dos seguintes efeitos à escolha: Recupera 1d12+4 EnR, Ganha +3 metros de movimento no próximo turno, ou Reduz em 1 turno a recarga de uma habilidade ativa. Além disso, durante o turno seguinte ao abate, o próximo uso de Disparo Calculado ou Tiro de Execução recebe +1 dado de dano adicional.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Próprio Caçador",
        custo: "0 EnR",
        recarga: "Passiva",
        duracao: "Passiva",
        dado: "N/A",
        bonus: [
          "Se fortalece após abates",
          "Recuperação ou movimento ou recarga",
          "Próximo ataque recebe bônus de dano"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "god_eye",
    nome: "God Eye",
    raridade: "mitico",
    descricao: "O God Eye, ou Olho de Deus, é uma classe de origem mística e rara, ligada a indivíduos que foram abençoados ou amaldiçoados com uma visão sobrenatural. Eles podem ver além do véu da realidade, percebendo auras, fraquezas e o fluxo de energia mágica e vital em tudo ao seu redor. Sua jornada é de busca por significado.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/0FYTvbX.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Olhar do Horizonte",
        descricao: "Os olhos do God Eye se expandem além das limitações físicas, calculando vento, distância, curvatura e interferência mágica em tempo real. Enquanto ativo: Ignora penalidades de distância, vento e cobertura parcial. Recebe +1 Precisão. Ataques à distância não sofrem redução de dano por alcance.",
        tipo: "Duradoura",
        alcance: "CaC",
        alvos: "Jogador",
        custo: "5 FaD",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Visão aprimorada", "Ignorar penalidades", "Precisão"]
      },
      {
        nome: "Leitura do Vento",
        descricao: "Analisa micro variações do ambiente e corrige automaticamente a trajetória do disparo. Próximo ataque recebe +1 Precisão. Ignora desvantagens ambientais. Se acertar, revela parcialmente o alvo (+1 bônus contra ele no próximo ataque).",
        tipo: "Imediata",
        alcance: "11m",
        alvos: "1",
        custo: "3 EnR",
        recarga: "2",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Análise", "Precisão", "Revelação"]
      },
      {
        nome: "Ponto Fraco Exposto",
        descricao: "O God Eye identifica o ponto exato onde o alvo é mais vulnerável — físico, energético ou estrutural. Enquanto ativo: O alvo sofre –2 em Defesa. Recebe +2 dados de dano de ataques do God Eye.",
        tipo: "Duradoura",
        alcance: "12m",
        alvos: "1",
        custo: "5 FaD",
        recarga: "4",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Debuff defesa", "Amplificação dano", "Vulnerabilidade"]
      },
      {
        nome: "Cálculo Instantâneo",
        descricao: "O God Eye recalcula infinitas possibilidades em frações de segundo. Permite re-rolar um ataque falho. Mantém o melhor resultado. Se o ataque acertar após re-rolagem, causa +1 dado de dano.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "Jogador",
        custo: "11 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Re-rolagem", "Controle", "Amplificação"]
      },
      {
        nome: "Campo de Supressão Visual",
        descricao: "O God Eye distorce a percepção dos inimigos, interferindo na leitura espacial deles. Inimigos na área: Sofrem –2 Precisão e –1 Reação. Aliados dentro da área: Recebem +1 Evasão.",
        tipo: "Sustentada",
        alcance: "6m",
        alvos: "AOE (4m)",
        custo: "11 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Debuff inimigo", "Bônus aliado", "Controle campo"]
      },
      {
        nome: "Previsão Letal",
        descricao: "O God Eye enxerga exatamente como o alvo irá agir, assim recebendo benefício de acerto crítico. Durante a duração: Recebe +2 dados de dano. Se o alvo estiver marcado → ignora Defesa adicional.",
        tipo: "Duradoura",
        alcance: "12m",
        alvos: "1",
        custo: "19 FaD",
        recarga: "6",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Amplificação", "Crítico", "Ignorar defesa"]
      },
      {
        nome: "Disparo Perfeito",
        descricao: "Um disparo executado com precisão absoluta. Causa dano base + 1 dado adicional. Ignora bônus defensivos temporários. Se usado em alvo marcado → +1 dado extra.",
        tipo: "Imediata",
        alcance: "14m",
        alvos: "1",
        custo: "9 EnR",
        recarga: "1",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Precisão", "Ignorar defesa", "Escalável"]
      },
      {
        nome: "Tiro de Ângulo Impossível",
        descricao: "O disparo curva no ar, desviando de obstáculos e atingindo o alvo por trajetórias impossíveis. Ignora completamente cobertura e obstáculos. Causa 4d12 + 250% (ATK Fixo da ARMA!) dano. Se o alvo estiver em posição defensiva → ignora Defesa base.",
        tipo: "Imediata",
        alcance: "13m",
        alvos: "1",
        custo: "13 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "4d12",
        bonus: ["Ignorar obstáculos", "Dano fixo", "Ignorar defesa"]
      },
      {
        nome: "Execução Milimétrica",
        descricao: "Ataque calculado para finalizar. Se alvo <50% HP → causa 6d12 + 12 dano. Caso contrário → causa 3d12. Se matar: reduz recarga de todas as habilidades em 1 turno.",
        tipo: "Imediata",
        alcance: "15m",
        alvos: "1",
        custo: "17 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "6d12+12",
        bonus: ["Execução", "Escalável", "Reset recarga"]
      },
      {
        nome: "Rajada de Interdição",
        descricao: "Uma sequência de disparos que trava movimentação inimiga. Causa 6d12+250% em área. Aplica –3 Reação. Buff Dano crítico (Durante uso da SKill!).",
        tipo: "Imediata",
        alcance: "11m",
        alvos: "cone 90°",
        custo: "17 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "6d12",
        bonus: ["Dano em área", "Debuff reação", "Crítico"]
      },
      {
        nome: "Olho que Nunca Erra",
        descricao: "A percepção do God Eye está sempre ativa. Primeiro ataque do combate recebe +3 Precisão. Ataques contra alvos marcados recebem +1 Precisão permanente.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "—",
        custo: "0 FaD",
        recarga: "0",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Precisão inicial", "Amplificação", "Permanência"]
      },
      {
        nome: "Tiro Final Confirmado",
        descricao: "O disparo absoluto — o destino do alvo já foi decidido antes do gatilho ser puxado. Causa 6d12 dano. Ignora Defesa adicional. Se o alvo estiver sob: Ponto Fraco Exposto ou Previsão Letal → O dano é dobrado. Se eliminar o alvo: Recupera 50% da Energia gasta.",
        tipo: "Imediata",
        alcance: "18m",
        alvos: "1",
        custo: "25 EnR",
        recarga: "7",
        duracao: "0 T",
        dado: "6d12",
        bonus: ["Ignora defesa", "Sinergia", "Recuperação"]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "spiritual_archer",
    nome: "Spiritual Archer",
    raridade: "lendario",
    descricao: "O Spiritual Archer, ou Arqueiro Espiritual, é uma evolução do Arqueiro tradicional, cuja origem está na fusão da disciplina balística com a meditação e a canalização de energia espiritual. Eles aprenderam a imbuir suas flechas com sua própria força vital ou com a energia dos espíritos da natureza, transformando projéteis comuns em armas místicas. Sua jornada é de equilíbrio entre o físico e o espiritual, buscando a perfeição no tiro e a harmonia com o mundo invisível. A capacidade de atirar flechas que ignoram a armadura e atingem a alma é o que define um Spiritual Archer. A mecânica de combate do Spiritual Archer é focada em dano mágico à distância e na penetração de defesas, utilizando sua Agilidade para posicionamento e Inteligência para poder. Eles podem disparar flechas que explodem com energia, curam aliados ou atravessam múltiplos inimigos em linha reta, ignorando obstáculos. A precisão de seus tiros é lendária, e eles podem invocar a ajuda de espíritos para guiar suas flechas, garantindo que o alvo não escape. O Spiritual Archer é a união da técnica e da mística, transformando o arco e flecha em um instrumento de poder espiritual.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/CDG0yBX.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Arco da Alma",
        descricao: "O Spiritual Archer manifesta um arco formado por energia espiritual condensada. Ataques passam a causar dano mágico 4d8 e ignoram parcialmente defesa. +1 Precisão em todos os disparos. Cada ataque bem-sucedido aplica 1 Marca Espiritual (máx. 3 por alvo).",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Jogador",
        custo: "6 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "4d8",
        bonus: ["Dano mágico", "Ignorar defesa parcial", "Geração de Marca"]
      },
      {
        nome: "Flecha Etérea",
        descricao: "Uma flecha que abandona o plano físico, atravessando matéria e obstáculos como se existisse apenas no plano espiritual. 200% Ataque fixo. Ignora cobertura e obstáculos leves. Se o alvo possuir Marca Espiritual: consome 1 Marca e causa +2d8 adicional.",
        tipo: "Imediata",
        alcance: "11 m",
        alvos: "1",
        custo: "9 EnR",
        recarga: "2",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Ignorar obstáculos", "Consumo de Marca", "Dano escalável"]
      },
      {
        nome: "Olhar Transcendental",
        descricao: "O arqueiro enxerga além da matéria, analisando a essência espiritual do alvo. +2 Precisão contra o alvo. Ignora bônus de evasão parcial. Cada ataque no alvo gera +1 Marca Espiritual adicional.",
        tipo: "Duradoura",
        alcance: "10 m",
        alvos: "1 inimigo",
        custo: "11 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Visão aprimorada", "Ignorar evasão", "Geração de Marca"]
      },
      {
        nome: "Prisão de Luz Espiritual",
        descricao: "Flechas são disparadas ao redor do alvo formando um selo espiritual que prende sua essência. –2 Evasão, –1 Reação. Ao tentar se mover: sofre 1d8 dano espiritual. Aplica 2 Marcas Espirituais imediatamente.",
        tipo: "Duradoura",
        alcance: "9 m",
        alvos: "1",
        custo: "15 EnR",
        recarga: "4",
        duracao: "2 T",
        dado: "1d8",
        bonus: ["Controle de mobilidade", "Múltiplas Marcas", "Dano reativo"]
      },
      {
        nome: "Zona de Convergência",
        descricao: "O arqueiro cria um campo onde as energias espirituais convergem. Inimigos recebem 1 Marca Espiritual ao entrar ou iniciar turno. Aliados recebem +1 Precisão. Flechas dentro da área causam +1 dado de dano.",
        tipo: "Sustentada",
        alcance: "6 m",
        alvos: "AOE (4m)",
        custo: "13 FaD",
        recarga: "4",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Geração de Marca", "Bônus de precisão aliada", "Amplificação de dano"]
      },
      {
        nome: "Flecha de Ruptura",
        descricao: "Uma flecha carregada com energia concentrada que rompe defesas físicas e espirituais. 6d10 + 6 dano mágico. Ignora 2 dados de defesa. Consome até 2 Marcas Espirituais aumenta dano em +1 dado.",
        tipo: "Imediata",
        alcance: "12 m",
        alvos: "1",
        custo: "15 EnR",
        recarga: "2",
        duracao: "0 T",
        dado: "6d10+6",
        bonus: ["Ignorar Defesa", "Consumo de Marca", "Dano escalável"]
      },
      {
        nome: "Disparo Espiritual",
        descricao: "Um disparo rápido e preciso canalizado diretamente da energia interna do arqueiro. 4d10 + 6 dano espiritual. Se usado com Arco da Alma ativo: gera 1 Marca adicional. Se o alvo tiver 3 Marcas: entra em Ressonância Espiritual, seus ataques são considerados acerto crítico.",
        tipo: "Duradoura",
        alcance: "12 m",
        alvos: "1",
        custo: "15 EnR",
        recarga: "4",
        duracao: "2 T",
        dado: "4d10+6",
        bonus: ["Sinergia com Arco", "Ressonância em 3 Marcas", "Crítico garantido"]
      },
      {
        nome: "Impacto Ressonante",
        descricao: "O arqueiro dispara uma flecha que detona toda a energia espiritual acumulada no alvo. 5d10 + 10 dano espiritual. Consome TODAS as Marcas Espirituais. Cada marca: +1d10 dano adicional. Se consumir 3+: aplica Atordoamento leve (1 turno).",
        tipo: "Imediata",
        alcance: "10 m",
        alvos: "1",
        custo: "15 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "5d10+10",
        bonus: ["Consumo total de Marca", "Dano escalável", "Crowd control"]
      },
      {
        nome: "Chuva Etérea",
        descricao: "O céu espiritual se abre e dezenas de flechas caem simultaneamente, guiadas por entidades invisíveis. 6d10 dano em área. Pode consumir +7 EnR, aumenta até +5 dados (12d10 total). Cada inimigo com Marca Espiritual recebe +1d10 adicional e consome 1 Marca por alvo.",
        tipo: "Imediata",
        alcance: "5 m",
        alvos: "AOE (4m)",
        custo: "15 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "6d10",
        bonus: ["Dano amplificável", "Consumo de Marca", "Efeito escalável"]
      },
      {
        nome: "Flecha do Julgamento Astral",
        descricao: "Uma flecha final guiada pelo julgamento do plano espiritual, destinada a atingir o ponto mais vulnerável da alma do alvo. 5d10 + 12 dano espiritual. Se o alvo estiver sob efeitos espirituais: +2d10. Consome todas as Marcas: +1d12 por marca. Se consumir 4+: ignora Defesa.",
        tipo: "Imediata",
        alcance: "14 m",
        alvos: "1",
        custo: "21 EnR",
        recarga: "5",
        duracao: "0 T",
        dado: "5d10+12",
        bonus: ["Bônus com efeitos", "Consumo total", "Ignora Defesa no máximo"]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "fletcher",
    nome: "Fletcher",
    raridade: "raro",
    descricao: "O Fletcher, ou Flecheiro, é uma classe de suporte e especialista, cuja origem está nas guildas de artesãos e na necessidade de munição de alta qualidade para os Arqueiros. Eles não são apenas atiradores, mas mestres na criação de flechas e virotes especializados, imbuindo-os com venenos, explosivos ou propriedades mágicas. Sua jornada é de alquimia e carpintaria, utilizando a Inteligência para criar projéteis que alteram o curso da batalha com seus efeitos únicos. A capacidade de fornecer munição tática e a maestria na criação de armadilhas são as contribuições de um Fletcher. Em combate, a mecânica do Fletcher é de controle de área e dano de efeito, utilizando sua Agilidade para posicionamento e sua Inteligência para a criação de projéteis. Eles disparam flechas que causam dano elemental, paralisam inimigos ou criam nuvens de fumaça e veneno para desorientar o campo de batalha. O Fletcher pode montar armadilhas complexas e usar sua Vitalidade para sobreviver a encontros próximos, garantindo a segurança de sua posição de tiro. A vitória do Fletcher é uma demonstração de engenhosidade, onde a munição certa no momento certo decide o confronto.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/1lvxx5u.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "1d4+4",
      vitalidade: "2d4+6",
      agilidade: "2d6+10",
      inteligencia: "1d4+4",
      percepcao: "1d4+2",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Flecha Fragmentada",
        descricao: "O Fletcher dispara uma flecha que se fragmenta no impacto, explodindo em três projetis menores em direções distintas. Cada fragmento causa 3d8 de dano físico em alvos diferentes. Se um único inimigo for atingido por múltiplos fragmentos, o dano total recebe +1d8 adicional. Se a flecha acertar uma estrutura ou defesa, ela se dispersa completamente, afetando toda a área próxima com 2d6 de dano.",
        tipo: "Imediata",
        alcance: "12 metros",
        alvos: "Até 3 inimigos",
        custo: "7 FaD",
        recarga: "FaD",
        duracao: "Instantânea",
        dado: "3d8",
        bonus: [
          "Fragmentação em impacto",
          "Dano adicional em acerto múltiplo",
          "Dispersão em estruturas"
        ]
      },
      {
        nome: "Flecha de Impacto",
        descricao: "O Fletcher carrega uma flecha com peso e poder especial, disparando-a com força brutal. A flecha causa 5d6+8 de dano físico e empurra o alvo 2 metros para trás, potencialmente derrubando-o se não passar em teste de Força (CD 12). Se o alvo for empurrado contra uma parede ou obstáculo, recebe +1d8 de dano adicional pelo impacto secundário.",
        tipo: "Imediata",
        alcance: "10 metros",
        alvos: "1 Inimigo",
        custo: "9 EnR",
        recarga: "FaD",
        duracao: "Instantânea",
        dado: "5d6+8",
        bonus: [
          "Empurra alvo 2 metros",
          "Risco de queda",
          "Dano bonus em obstáculos"
        ]
      },
      {
        nome: "Flecha de Fixação",
        descricao: "O Fletcher dispara uma flecha especial que penetra profundamente no alvo, imobilizando-o temporariamente. O alvo fica Fixado (imobilizado, –1 em Defesa) por 2 turnos. Durante este período, o alvo não pode se mover ou usar ações de movimento. Se a Flecha de Fixação acertar quando o alvo está em desvantagem (surpreso, desprevenido), a imobilização dura +1 turno adicional. O alvo pode tentar se libertar com um teste de Força (CD 14).",
        tipo: "Duradoura",
        alcance: "9 metros",
        alvos: "1 Inimigo",
        custo: "5 FaD",
        recarga: "FaD",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Imobiliza alvo por 2 turnos",
          "Reduz Defesa em –1",
          "Turno extra se em desvantagem"
        ]
      },
      {
        nome: "Disparo Ricochete",
        descricao: "O Fletcher dispara uma flecha que ricocheteia em múltiplas superfícies antes de atingir o alvo final. A flecha causa 4d10 de dano físico ao alvo primário e 2d10 de dano a até 2 alvos secundários ao seu redor. Se a flecha ricochetear 3+ vezes, cada ricochete adicional causa +1d6 de dano. Ótima para lidar com inimigos espalhados ou em cobertura.",
        tipo: "Imediata",
        alcance: "15 metros",
        alvos: "1 a 3",
        custo: "15 FaD",
        recarga: "2 turnos",
        duracao: "Instantânea",
        dado: "4d10",
        bonus: [
          "Ricochete em múltiplas superfícies",
          "Dano em alvos secundários",
          "Dano aumentado por ricochetes"
        ]
      },
      {
        nome: "Flecha de Fumaça",
        descricao: "O Fletcher dispara uma flecha que explode em uma nuvem densa de fumaça colorida, obscurecendo a visão em uma área de 4 metros de raio. Enquanto a nuvem estiver ativa, todos os ataques contra inimigos dentro recebem –2 em acerto. O Fletcher e seus aliados dentro da nuvem ganham +1 em testes de Furtividade. A fumaça dissipa naturalmente ao final de 5 turnos ou quando sujeita a vento forte.",
        tipo: "Sustentada",
        alcance: "8 metros",
        alvos: "Área (AOE 4m)",
        custo: "7 FaD + 5 EnR/T",
        recarga: "5",
        duracao: "Sustentada",
        dado: "N/A",
        bonus: [
          "Cria nuvem de fumaça",
          "Reduz acerto inimigo em –2",
          "Bônus de furtividade aliada"
        ]
      },
      {
        nome: "Estojo Modular",
        descricao: "O Fletcher é um mestre em organizar seu equipamento de forma otimizada, reduzindo drasticamente o custo de suas habilidades através de munição preparada e técnica aperfeiçoada. Todas as habilidades do Fletcher que custam FaD têm seu custo reduzido em –2. Adicionalmente, uma vez por combate, o Fletcher pode disparar uma flecha sem custar FaD (apenas EnR). Essa capacidade se recarrega após 5 turnos.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "Pessoal",
        custo: "0 EnR",
        recarga: "Passiva",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Reduz custo de FaD em –2",
          "Uma flecha sem custo de FaD por combate",
          "Recarga de 5 turnos"
        ]
      },
      {
        nome: "Disparo Calibrado",
        descricao: "O Fletcher toma tempo para aperfeiçoar seu disparo, calibrando cada aspecto para máxima precisão. A flecha causa 6d8+10 de dano físico e possui Vantagem em teste de acerto (rola 2d20 e usa o melhor). Se o tiro for crítico, causa +2d8 adicionais e não pode ser esquivado por defesas passivas. Cada turno de preparação adicional (+1 turno de ação antes) aumenta o dano em +1d8.",
        tipo: "Imediata",
        alcance: "14 metros",
        alvos: "1 Inimigo",
        custo: "17 FaD",
        recarga: "FaD",
        duracao: "Instantânea",
        dado: "6d8+10",
        bonus: [
          "Vantagem em acerto",
          "Crítico ignora defesas passivas",
          "Dano extra por preparação"
        ]
      },
      {
        nome: "Flecha Penetrante",
        descricao: "O Fletcher dispara uma flecha que atravessa corpos e barreiras, atingindo tudo em sua linha de trajetória. Causa 650% de dano ao primeiro alvo e 400% aos alvos secundários em linha reta. Se a flecha atravessar 3+ alvos, cada um subsequente sofre –1 de resistência. A flecha ignora 50% da armadura e defesas físicas, penetrando estruturas leves.",
        tipo: "Imediata",
        alcance: "16 metros",
        alvos: "1 a 3",
        custo: "15 FaD",
        recarga: "3 turnos",
        duracao: "Instantânea",
        dado: "650%",
        bonus: [
          "Atravessa múltiplos alvos",
          "Penetra armadura em 50%",
          "Reduz resistência por alvo adicional"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "arbalaster",
    nome: "Arbalaster",
    raridade: "raro",
    descricao: "O Arbalaster, ou Balesteiro, tem sua origem nas fortificações e nos cercos, onde a balestra, uma arma de alto poder de penetração, é a ferramenta de escolha. Eles são especialistas em desferir dano massivo e concentrado em alvos únicos, ignorando a armadura pesada e as defesas mágicas. Sua jornada é de força e precisão mecânica, utilizando a Agilidade para recarregar rapidamente e a Força para manusear as balestras mais pesadas. A capacidade de derrubar gigantes e quebrar defesas com um único tiro é a especialidade de um Arbalaster. A mecânica de combate do Arbalaster é de dano de pico e penetração, utilizando sua Agilidade para manter uma cadência de tiro surpreendente para uma arma tão pesada. Eles se concentram em alvos de alta prioridade, desferindo virotes que causam dano explosivo ou que atravessam múltiplos inimigos em linha. O Arbalaster pode usar balestras de repetição ou de grande calibre, adaptando-se à necessidade de fogo rápido ou de um único golpe devastador. A vitória do Arbalaster é uma demonstração de poder de fogo concentrado, onde a defesa do inimigo é irrelevante.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/YBQlsFk.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "1d4+4",
      vitalidade: "2d4+6",
      agilidade: "2d6+10",
      inteligencia: "1d4+4",
      percepcao: "1d4+2",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Rolamento Tático",
        descricao: "O Arbalaster executa um movimento evasivo rápido, reposicionando-se no campo de batalha. Ao usar, move-se até 4 metros sem provocar ataques de oportunidade e recebe +1 em Evasão até o próximo turno. Se utilizado antes de um ataque no mesmo turno, concede +1 em Precisão no disparo seguinte.",
        tipo: "Imediata",
        alcance: "4 metros",
        alvos: "Próprio",
        custo: "5 FaD",
        recarga: "1",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Movimento sem provocar ataque", "Aumenta Evasão em +1", "Bônus de Precisão"]
      },
      {
        nome: "Disparo Reativo",
        descricao: "Um disparo rápido executado durante o movimento ou logo após reposicionamento. Causa 3d8 de dano físico. Se utilizado após Rolamento Tático ou Salto de Evasão, causa +2d8 de dano adicional. Conta como ação de movimento + ataque leve, permitindo manter pressão constante.",
        tipo: "Imediata",
        alcance: "9 metros",
        alvos: "1 Inimigo",
        custo: "9 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "3d8",
        bonus: ["Dano adicional após movimento", "Ação combinada de movimento", "Mantém pressão"]
      },
      {
        nome: "Caçada Implacável",
        descricao: "O Arbalaster fixa seu foco em um alvo específico, entrando em ritmo de perseguição. Enquanto ativa, recebe +1 em Reação e +1 em Precisão contra o último alvo atacado. Cada acerto consecutivo nesse alvo concede +3 bônus acumulativo de dano fixo (máx. +3). Se trocar de alvo, os bônus são resetados.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "7 FaD",
        recarga: "4",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Aumenta Reação e Precisão", "Dano acumulativo por acertos", "Foco em alvo único"]
      },
      {
        nome: "Salto de Evasão",
        descricao: "Um salto instantâneo impulsionado por reflexos extremos. Move-se até 5 metros e reduz o próximo dano recebido em 2 dados de defesa adicionais. Se utilizado como resposta a um ataque, também concede +1 em Evasão contra esse ataque. Ativa sinergia com Disparo Reativo.",
        tipo: "Imediata",
        alcance: "5 metros",
        alvos: "Próprio",
        custo: "9 FaD",
        recarga: "4",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Movimento defensivo", "Reduz dano em 2 dados", "Bônus reativo"]
      },
      {
        nome: "Marca do Predador",
        descricao: "O Arbalaster marca seu alvo, identificando pontos vitais e padrões de movimento. Durante a duração, causa +2d12+6 de dano verdadeiro contra o alvo. Ignora penalidades leves de visibilidade e cobertura contra o alvo marcado. Se o alvo estiver sob Caçada Implacável, recebe +1d12 adicional em todos os ataques.",
        tipo: "Duradoura",
        alcance: "10 metros",
        alvos: "1 Inimigo",
        custo: "10 FaD",
        recarga: "5",
        duracao: "3 T",
        dado: "2d12+6",
        bonus: ["Dano verdadeiro", "Ignora cobertura", "Sinergia com Caçada"]
      },
      {
        nome: "Instinto de Sobrevivência",
        descricao: "Treinado para sobreviver em combates intensos, o Arbalaster reage automaticamente ao perigo. Sempre que sofrer dano que reduza sua vida abaixo de 50%, recebe +2 em Evasão e +1 em Reação por 1 turno (1 vez por combate). Se esse efeito ativar, o próximo Rolamento Tático não consome Energia.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "Próprio",
        custo: "0 FaD",
        recarga: "Passiva",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Reação automática ao perigo", "Evasão e Reação aumentadas", "Economia de energia"]
      },
      {
        nome: "Dardo Penetrante",
        descricao: "Um disparo focado com força perfurante elevada. Causa 4d8 de dano físico e ignora reduções leves de dano. Se o alvo estiver marcado, ignora 1 dado de Defesa adicional. Se usado após movimento no mesmo turno, recebe +1d8 adicional.",
        tipo: "Imediata",
        alcance: "11 metros",
        alvos: "1 Inimigo",
        custo: "5 FaD",
        recarga: "1",
        duracao: "Imediata",
        dado: "4d8",
        bonus: ["Ignora reduções leves de dano", "Ignora Defesa em alvo marcado", "Bônus após movimento"]
      },
      {
        nome: "Execução Calculada",
        descricao: "Um disparo preciso e letal, calculado para finalizar o alvo. Causa 6d12 de dano físico. Se o alvo estiver sob Marca do Predador, causa +2d12+12 adicional. Se o alvo estiver abaixo de 40% de HP, recebe +2d12 adicional. Se derrotar o alvo, reduz a recarga de Rolamento Tático e Disparo Reativo em 1 turno.",
        tipo: "Imediata",
        alcance: "10 metros",
        alvos: "1 Inimigo",
        custo: "19 FaD",
        recarga: "4",
        duracao: "Imediata",
        dado: "6d12",
        bonus: ["Dano massivo", "Dano adicional em alvo marcado", "Bônus contra HP baixo"]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "assassino",
    nome: "Assassino",
    raridade: "raro",
    descricao: "O Assassino é a personificação da morte silenciosa, cuja origem está nas sombras das cidades e nas ordens secretas dedicadas à eliminação de alvos. Eles são mestres da furtividade, do disfarce e do veneno, transformando a arte de matar em uma ciência fria e calculada. Sua jornada é de anonimato e precisão, utilizando a Agilidade para se mover sem ser detectado e a Percepção para encontrar o momento exato do ataque. A capacidade de eliminar um alvo de alto valor sem deixar rastros é a marca registrada de um Assassino. A mecânica de combate do Assassino é baseada em ataques furtivos e na aplicação de efeitos debilitantes, utilizando sua alta Agilidade para o posicionamento. Eles se infiltram nas linhas inimigas, buscando o ponto cego para desferir um golpe crítico com adagas envenenadas ou armas leves. O Assassino pode usar bombas de fumaça e truques de distração para desaparecer após o ataque, garantindo sua sobrevivência e a conclusão da missão. A vitória do Assassino é rápida e fatal, um sussurro de morte que encerra a luta antes que ela comece.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/waUNURN.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "1d4+4",
      vitalidade: "2d4+6",
      agilidade: "2d6+10",
      inteligencia: "1d4+4",
      percepcao: "1d4+2",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Manto das Sombras",
        descricao: "O Assassino se funde às sombras, tornando-se extremamente difícil de detectar. Enquanto não realizar ações ofensivas diretas, permanece Oculto e recebe +2 em Furtividade ou Camuflagem. Ao sair do estado de ocultação para atacar, recebe +1 em Precisão no primeiro ataque. Se estiver dentro de Véu de Fumaça, a ocultação não é quebrada por movimento.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "9 FaD",
        recarga: "4",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Estado Oculto", "Bônus de Furtividade +2", "Precisão ao atacar"]
      },
      {
        nome: "Passo Silencioso",
        descricao: "Um deslocamento rápido e silencioso que não denuncia a posição do Assassino. Move-se até 5 metros sem provocar ataques de oportunidade. Se usado enquanto Oculto, mantém o estado de ocultação. Se terminar adjacente a um inimigo, recebe seu próximo ataque causa acerto crítico.",
        tipo: "Imediata",
        alcance: "5 metros",
        alvos: "Próprio Assassino",
        custo: "9 FaD",
        recarga: "2",
        duracao: "Imediata",
        dado: "N/A",
        bonus: ["Movimento sem provocar ataque", "Mantém ocultação", "Acerto crítico adjacente"]
      },
      {
        nome: "Lâmina Envenenada",
        descricao: "O Assassino aplica toxinas letais em sua lâmina antes de atacar. Causa 3d12 de dano físico e aplica Veneno (Condição), causando 3d8 de dano por turno durante 2 turnos. Se o alvo estiver sob Marcação Mortal, o veneno é intensificado, causando +2d8 adicional por turno.",
        tipo: "Duradoura",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "11 FaD",
        recarga: "3",
        duracao: "2 T",
        dado: "3d12",
        bonus: ["Aplica Veneno", "Dano por turno", "Intensificação com Marcação"]
      },
      {
        nome: "Marcação Mortal",
        descricao: "O Assassino identifica pontos vitais e padrões de defesa do alvo. Enquanto ativa, todos os ataques do Assassino contra o alvo causam 200% de dano fixo adicional. Se o alvo estiver sob Veneno ou controle, recebe +1 dado de dano adicional. Revelar o alvo não remove a marca.",
        tipo: "Sustentada",
        alcance: "6 metros",
        alvos: "1 Inimigo",
        custo: "9 FaD",
        recarga: "5",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["200% de dano adicional", "Dano aumentado em alvo afetado", "Marca permanece"]
      },
      {
        nome: "Véu de Fumaça",
        descricao: "O Assassino cria uma cortina densa de fumaça para manipular o campo de batalha. Aliados recebem Camuflagem, enquanto inimigos sofrem –1 em Precisão. O Assassino ignora penalidades dentro da fumaça e recebe +1 em Furtividade. Se entrar na fumaça após atacar, pode tentar retornar ao estado Oculto.",
        tipo: "Duradoura",
        alcance: "4 metros",
        alvos: "Área (AOE)",
        custo: "9 FaD",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Camuflagem aliada", "Reduz Precisão inimiga", "Retorno à ocultação"]
      },
      {
        nome: "Predador Noturno",
        descricao: "Especialista em ataques surpresa, o Assassino maximiza o dano inicial. Enquanto estiver Oculto, o primeiro ataque causa +2d12+6 de dano. Se esse ataque atingir um alvo sob Marcação Mortal, recebe +1d12 adicional. Após ativar, entra em recarga interna de 1 turno.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "Próprio",
        custo: "0 FaD",
        recarga: "Passiva",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Dano de ataque surpresa", "Bônus contra alvo marcado", "Recarga interna"]
      },
      {
        nome: "Golpe Mortal",
        descricao: "Um ataque direto visando pontos letais. Causa 6d12 de dano físico. Se utilizado a partir de Furtividade, causa +2d12 adicional e aplica Desorientado (Condição) por 1 turno. Se o alvo estiver sob Marcação Mortal, o dano recebe +1d12 adicional.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "17 FaD",
        recarga: "7",
        duracao: "0 T",
        dado: "6d12",
        bonus: ["Dano massivo", "Desorientado de Furtividade", "Dano contra marcado"]
      },
      {
        nome: "Execução Silenciosa",
        descricao: "O Assassino executa um golpe preciso e quase imperceptível. Causa 500% de dano físico (Ataque Fixo). Se o alvo estiver abaixo de 40% de HP, causa +4d12 adicional. Se usado a partir de Furtividade, ignora completamente a Defesa do alvo. Se eliminar o alvo, permite ao Assassino retornar Imediatamente ao estado Oculto.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "29 FaD",
        recarga: "5",
        duracao: "Imediata",
        dado: "500%",
        bonus: ["Ignora Defesa de Furtividade", "Dano contra HP baixo", "Retorno ao Oculto"]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "trapaceiro",
    nome: "Trapaceiro",
    raridade: "raro",
    descricao: "O Trapaceiro, ou Trickster, tem sua origem nos contos populares e nas figuras mitológicas que usam a astúcia e o engano para superar a força. Eles são mestres da ilusão, da sorte e da manipulação, transformando o campo de batalha em um palco de confusão e caos controlado. Sua jornada é de diversão e subversão, utilizando a Inteligência e a Agilidade para pregar peças e desorientar tanto aliados quanto inimigos. A capacidade de transformar a desvantagem em vantagem através de truques inesperados é o cerne da identidade de um Trapaceiro. Em combate, a mecânica do Trapaceiro é de controle e desorientação, utilizando sua Agilidade para se mover de forma imprevisível e sua Inteligência para criar ilusões. Eles podem invocar duplicatas, lançar feitiços que trocam de lugar com o inimigo ou usar itens mágicos que causam efeitos aleatórios e surpreendentes. O Trapaceiro depende do elemento surpresa e da confusão para sobreviver, transformando a luta em um jogo onde as regras mudam constantemente. A vitória do Trapaceiro é uma obra de arte do engano, onde o inimigo é derrotado pela própria mente.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/OGc1f0Z.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Máscara Convincente",
        descricao: "O Trapaceiro manipula percepção e comportamento do alvo com uma falsa leitura de intenção. O alvo passa a enxergar o Trapaceiro como uma ameaça prioritária, sofrendo –1 em Precisão e –1 em Percepção. Se o alvo tentar atacar outro inimigo, sofre –2 adicional na rolagem. Se combinado com Isca Perfeita, o alvo também recebe –1 em Reação.",
        tipo: "Duradoura",
        alcance: "8 metros",
        alvos: "1 Inimigo",
        custo: "11 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Manipulação de percepção", "Reduz Precisão e Percepção", "Sinergia com Isca"]
      },
      {
        nome: "Truque de Mão",
        descricao: "Um movimento rápido e enganoso que distrai completamente o alvo. Aplica –1 Ação no próximo turno do inimigo. Se o alvo já estiver sob Confusão ou Desorientado, também sofre –2 em Defesa.",
        tipo: "Imediata",
        alcance: "6 metros",
        alvos: "1 Inimigo",
        custo: "9 FaD",
        recarga: "3",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Reduz ações futuras", "Dano bonus em confusão", "Distração Imediata"]
      },
      {
        nome: "Isca Perfeita",
        descricao: "O Trapaceiro provoca e manipula o comportamento do alvo, tornando-se o foco da atenção. O alvo tende a priorizar ataques contra o Trapaceiro e sofre –1 em Precisão durante a duração. Se o alvo errar um ataque sob este efeito, fica Desorientado por 1 turno.",
        tipo: "Duradoura",
        alcance: "8 metros",
        alvos: "1 Inimigo",
        custo: "15 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Alvo prioriza Trapaceiro", "Reduz Precisão", "Desorientado em erro"]
      },
      {
        nome: "Troca Rápida",
        descricao: "O Trapaceiro troca instantaneamente de posição com o alvo selecionado. Remove travamentos de posicionamento e evita ataques de oportunidade. Se usado após um ataque inimigo falhar contra o Trapaceiro, o próximo ataque dele receba acerto crítico.",
        tipo: "Imediata",
        alcance: "9 metros",
        alvos: "1 alvo (inimigo ou aliado)",
        custo: "17 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Troca de posição", "Evita ataques de oportunidade", "Acerto crítico após falha"]
      },
      {
        nome: "Confusão Calculada",
        descricao: "O Trapaceiro distorce percepção e ritmo de combate em uma área. Inimigos sofrem –1 em Precisão e –1 em Percepção enquanto estiverem na zona. Sempre que um inimigo errar um ataque dentro da área, recebe –1 adicional em Reação no próximo turno. Sinergia diretamente com Artista do Caos.",
        tipo: "Sustentada",
        alcance: "4 metros",
        alvos: "Área (AOE)",
        custo: "9 FaD",
        recarga: "4",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Distorção perceptiva", "Penalidades acumulativas", "Sinergia com Caos"]
      },
      {
        nome: "Artista do Caos",
        descricao: "O Trapaceiro se alimenta do erro e da desordem. Sempre que um inimigo errar um ataque por efeitos de controle (Confusão, Desorientado, penalidades), recupera 2d4+4 Energia. Se dois ou mais inimigos errarem no mesmo turno, recebe +1 em Precisão no próximo ataque.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "Próprio",
        custo: "0 EnR",
        recarga: "Passiva",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Recupera energia em erros", "Precisão com múltiplos erros", "Alimentação do caos"]
      },
      {
        nome: "Golpe Enganoso",
        descricao: "Um ataque oportunista realizado no momento de hesitação do inimigo. Causa 4d8+6 de dano físico. Se o alvo estiver sob Confusão, Medo ou Desorientado, causa +2d8+6 de dano adicional. Se o alvo errou um ataque no turno anterior, recebe +2d8 adicional.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "15 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "4d8+6",
        bonus: ["Dano em hesitação", "Dano contra confuso", "Bônus após erro"]
      },
      {
        nome: "Mestre da Ilusão",
        descricao: "O Trapaceiro cria múltiplas distorções perceptivas, fragmentando a realidade ao redor dos inimigos. Alvos afetados sofrem Confusão: 50% de chance de errar ataques, –1 em Precisão e Percepção. Caso acertem um ataque, há 25% de chance de atingir o alvo errado. Se um alvo já estiver sob outro efeito de controle, também recebe Desorientado por 1 turno ao entrar no efeito.",
        tipo: "Duradoura",
        alcance: "6 metros",
        alvos: "Até 3 inimigos",
        custo: "19 EnR",
        recarga: "5",
        duracao: "3 T",
        dado: "N/A",
        bonus: ["Confusão em massa", "Ataque contra alvo errado", "Desorientado em controle"]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "reaper",
    nome: "Reaper",
    raridade: "epico",
    descricao: "O Reaper, ou Ceifador, é uma classe sombria e temida, cuja origem está ligada a pactos com a própria Morte ou a um domínio profundo sobre a energia negativa. Eles são os executores do destino, capazes de manipular a força vital e a alma dos seres vivos para desferir golpes letais. Sua jornada é de isolamento e aceitação da mortalidade, utilizando a Inteligência para entender os limites entre a vida e o vazio. O domínio sobre a morte e a capacidade de ceifar a vida com um toque são os poderes aterrorizantes de um Reaper. A mecânica de combate do Reaper é focada em dano de energia negativa e na manipulação da alma, utilizando sua Inteligência para enfraquecer a Vitalidade do inimigo. Eles podem invocar a foice da morte, uma arma que ignora a armadura e causa dano direto à essência vital, ou lançar maldições de definhamento. O Reaper pode se tornar intangível, movendo-se entre os planos para evitar ataques e ressurgir para desferir o golpe final. A vitória do Reaper é a inevitabilidade da morte, um lembrete sombrio de que todo ser vivo tem um fim.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/BqVzhMP.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Passo Fantasma",
        descricao: "O Reaper desliza entre o plano físico e o limbo, reposicionando-se instantaneamente. Após o uso: O próximo ataque recebe +2 Precisão, Se usado contra alvo marcado, recebe também +2 dados de dano.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "Jogador",
        custo: "9 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Reposicionamento",
          "Bônus ao próximo ataque",
          "Amplificação em marcados"
        ]
      },
      {
        nome: "Marca do Além",
        descricao: "Marca o alvo com o selo da morte iminente. Enquanto ativo: O alvo recebe +2 dados de dano do Reaper, Acumula 1 stack de Ceifa sempre que sofre dano. Ao atingir 3 stacks: consome automaticamente e causa 2d12 de dano verdadeiro.",
        tipo: "Duradoura",
        alcance: "6 m",
        alvos: "1",
        custo: "11 EnR",
        recarga: "2",
        duracao: "3 T",
        dado: "2d12",
        bonus: [
          "Marca com stacks",
          "Dano verdadeiro",
          "Ampliação de dano"
        ]
      },
      {
        nome: "Toque Frio",
        descricao: "Um toque que desacelera o fluxo vital do alvo. Causa 4d8+12 de dano necrótico, Aplica Lentidão (–2 Reação). Se o alvo estiver marcado: gera +1 stack de Ceifa adicional.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "8 EnR",
        recarga: "2",
        duracao: "1 T",
        dado: "4d8+12",
        bonus: [
          "Dano necrótico",
          "Lentidão",
          "Geração de stacks"
        ]
      },
      {
        nome: "Véu Mortuário",
        descricao: "O corpo do Reaper se torna parcialmente inexistente. Enquanto ativo: +3 Evasão, Reduz dano recebido em 1 dado. Limitação: Não pode usar habilidades pesadas. Bônus: Sair do Véu concede +3 dados no próximo ataque.",
        tipo: "Sustentada",
        alcance: "CaC",
        alvos: "Jogador",
        custo: "11 EnR",
        recarga: "4",
        duracao: "Sustentada",
        dado: "N/A",
        bonus: [
          "Aumento de evasão",
          "Redução de dano",
          "Bônus ao sair"
        ]
      },
      {
        nome: "Corte Espectral",
        descricao: "Um corte que atravessa matéria e alma. Causa 6d8+12 de dano necrótico, Ignora 1 dado de defesa. Se o alvo estiver marcado: ignora 50% defesa, consome 1 stack para causar +2d8.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "25 FaD",
        recarga: "4",
        duracao: "0 T",
        dado: "6d8+12",
        bonus: [
          "Dano espectral",
          "Ignora defesa",
          "Consumo de stacks"
        ]
      },
      {
        nome: "Presságio da Morte",
        descricao: "A presença do Reaper anuncia o fim inevitável. Inimigos na área: –2 Precisão, –2 Reação. Alvos marcados: recebem +1 stack de Ceifa por turno automaticamente.",
        tipo: "Duradoura",
        alcance: "4 m",
        alvos: "AOE (3 m)",
        custo: "19 EnR",
        recarga: "4",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Penalidade em área",
          "Geração de stacks",
          "Aura de morte"
        ]
      },
      {
        nome: "Execução Silenciosa",
        descricao: "Um golpe preciso destinado a finalizar. Causa 6d12+250% de dano necrótico. Se o alvo estiver: Abaixo de 40% HP → dano +3d12, Marcado → consome stacks e causa +2d12 por stack. Se derrotar: reduz todas recargas em 1 turno.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "19 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "6d12",
        bonus: [
          "Golpe de finalização",
          "Bônus em baixa vida",
          "Redução de recarga"
        ]
      },
      {
        nome: "Colheita de Almas",
        descricao: "O Reaper ceifa múltiplas almas simultaneamente. Causa 6d8+12 de dano necrótico. Para cada inimigo atingido: ganha 1 stack de Ceifa global. Para cada inimigo derrotado: recupera 1d10+6 EnR.",
        tipo: "Imediata",
        alcance: "3 m",
        alvos: "AOE (3 m)",
        custo: "21 EnR",
        recarga: "6",
        duracao: "0 T",
        dado: "6d8+12",
        bonus: [
          "Dano em área",
          "Geração de stacks",
          "Recuperação de energia"
        ]
      },
      {
        nome: "Lâmina do Limbo",
        descricao: "Invoca a verdadeira arma da morte. Enquanto ativa: Ataques causam +3d12 necrótico, Ignoram resistência física. Bônus: Cada ataque em alvo marcado gera +1 stack de Ceifa.",
        tipo: "Sustentada",
        alcance: "CaC",
        alvos: "Jogador",
        custo: "7 FaD",
        recarga: "5",
        duracao: "Sustentada",
        dado: "3d12",
        bonus: [
          "Amplificação de dano",
          "Ignora resistência",
          "Geração de stacks"
        ]
      },
      {
        nome: "Fim do Destino",
        descricao: "O golpe final inevitável. Causa 7d12 + 1/4 INT de dano necrótico. Se o alvo estiver: Marcado → dano duplicado, Com 3 stacks → execução garantida (se sobreviver, fica com 1 HP). Se matar: ativa automaticamente Colheita de Almas (sem custo).",
        tipo: "Imediata",
        alcance: "7 m",
        alvos: "1",
        custo: "35 EnR",
        recarga: "7",
        duracao: "0 T",
        dado: "7d12",
        bonus: [
          "Golpe inevitável",
          "Execução com 3 stacks",
          "Ativação de Colheita"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "palhaco",
    nome: "Palhaço",
    raridade: "epico",
    descricao: "O Palhaço, ou Jester, é uma classe que subverte a expectativa, cuja origem está nos artistas de rua e nos bobos da corte que usam o humor para esconder uma letalidade surpreendente. Eles são mestres do caos e da imprevisibilidade, utilizando a Agilidade e a Inteligência para transformar a luta em uma performance bizarra e mortal. Sua jornada é de desmascaramento e sátira, usando a comédia para desarmar a guarda do inimigo e a loucura para esconder sua verdadeira intenção. A capacidade de rir na cara do perigo e a imprevisibilidade são as armas secretas de um Palhaço. Em combate, a mecânica do Palhaço é de desorientação e dano caótico, utilizando sua Agilidade para acrobacias e sua Inteligência para truques inesperados. Eles podem atirar objetos estranhos que causam efeitos aleatórios, usar piadas para enfraquecer a moral do inimigo ou se mover de forma tão errática que se torna impossível acertá-los. O Palhaço pode invocar a sorte a seu favor, transformando falhas em sucessos e o azar do inimigo em sua própria ruína. A vitória do Palhaço é uma piada cruel, onde o inimigo é derrotado pela confusão e pelo ridículo.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/CJuQLiM.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Gargalhada Infecciosa",
        descricao: "Uma risada perturbadora que quebra o foco mental dos inimigos. Inimigos na área sofrem –2 Precisão e devem testar ou ficam Desorientados. Se já estiverem sob outro efeito de controle, tornam-se Confusos.",
        tipo: "Duradoura",
        alcance: "6m",
        alvos: "AOE (3m)",
        custo: "11 EnR",
        recarga: 4,
        duracao: 2,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Passo Errado",
        descricao: "O Palhaço manipula o timing do alvo, fazendo-o agir errado. Sofre –2 Evasão. Se o alvo estiver Desorientado, também sofre –2 Reação.",
        tipo: "Imediata",
        alcance: "6m",
        alvos: "1",
        custo: "9 EnR",
        recarga: 3,
        duracao: 1,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Nariz Vermelho",
        descricao: "O Palhaço assume o papel de distração absoluta. Enquanto ativo: +2 Evasão e inimigos tendem a focá-lo. Sempre que for alvo de ataque, o inimigo sofre –1 Precisão cumulativo (máx. 3).",
        tipo: "Duradoura",
        alcance: "CaC",
        alvos: "jogador",
        custo: "9 FaD",
        recarga: 4,
        duracao: 2,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Truque do Lenço Infinito",
        descricao: "Um espetáculo visual absurdo que confunde percepção e foco. Inimigos na área sofrem –3 Precisão. Se estiverem sob outro efeito, testes mentais recebem penalidade pesada. Aliados dentro da área recebem +1 evasão leve.",
        tipo: "Sustentada",
        alcance: "5m",
        alvos: "AOE (3m)",
        custo: "2 FaD p/ T",
        recarga: 4,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Olhos que Não Batem",
        descricao: "O alvo entra em um estado de hesitação profunda. Primeira ação ofensiva falha (Obstáculo 11). Se estiver Confuso ou Desorientado, perde também a ação leve.",
        tipo: "Duradoura",
        alcance: "9m",
        alvos: "1",
        custo: "15 EnR",
        recarga: 5,
        duracao: 1,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Martelo Inflável",
        descricao: "Um golpe ridículo… e devastador. Causa 4d12+12 de dano físico e empurra o alvo 8m. Se o alvo estiver sob controle, causa +2d12 e aplica Queda.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "10 FaD",
        recarga: 2,
        duracao: 0,
        dado: "4d12+12",
        bonus: []
      },
      {
        nome: "Flor Ácida",
        descricao: "Um truque aparentemente inofensivo que revela sua verdadeira natureza. Causa 6d8+12 de dano por turno. Se o alvo estiver Desorientado ou Confuso, dano aumenta em +2 dados adicionais e aplica –1 dado de Defesa enquanto durar.",
        tipo: "Duradoura",
        alcance: "6m",
        alvos: "1",
        custo: "15 EnR",
        recarga: 5,
        duracao: 3,
        dado: "6d8+12",
        bonus: []
      },
      {
        nome: "Queda Planejada",
        descricao: "O Palhaço transforma caos em oportunidade. Causa 2d12 de dano físico e aplica Queda. Se o alvo já estiver sob efeito mental, também fica Desorientado ao levantar.",
        tipo: "Imediata",
        alcance: "5m",
        alvos: "1",
        custo: "13 FaD",
        recarga: 4,
        duracao: 1,
        dado: "2d12",
        bonus: []
      },
      {
        nome: "Caixa Surpresa",
        descricao: "Uma explosão caótica de energia e confusão. Causa 8d12+6 de dano. Aplica Desorientado em todos. Alvos sob controle tornam-se Confusos. Se atingir 3+ inimigos, ativa Loucura Funcional automaticamente.",
        tipo: "Imediata",
        alcance: "3m",
        alvos: "AOE (3m)",
        custo: "29 EnR",
        recarga: 5,
        duracao: 0,
        dado: "8d12+6",
        bonus: []
      },
      {
        nome: "Riso Final",
        descricao: "O clímax da apresentação — cruel e inevitável. Causa 4d12 de dano. Se o alvo estiver Desorientado → +2d12, Confuso → +3d12, ou sob múltiplos efeitos → dano duplicado. Se derrotar, recupera 2d10 EnR e próximo ataque ganha +3 dados.",
        tipo: "Imediata",
        alcance: "9m",
        alvos: "1",
        custo: "21 EnR",
        recarga: 6,
        duracao: 0,
        dado: "4d12",
        bonus: []
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Loucura Funcional",
        descricao: "O caos alimenta o Palhaço. Sempre que um inimigo falhar ação ou entrar em controle, recupera 1d6+4 Energia.",
        tipo: "Duradoura",
        alcance: "0m",
        alvos: "0",
        custo: "0",
        recarga: 0,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Piada Mortal",
        descricao: "Cada erro do inimigo vira uma oportunidade letal. Sempre que um inimigo for afetado por controle, próximo ataque do Palhaço causa +2 dados. Se o alvo tiver 2+ efeitos, causa +4 dados.",
        tipo: "Duradoura",
        alcance: "0m",
        alvos: "0",
        custo: "0",
        recarga: 0,
        duracao: 0,
        dado: "0d0",
        bonus: []
      }
    ]
  },
  {
    id: "mercenario",
    nome: "Mercenário",
    raridade: "comum",
    descricao: "O Mercenário é um combatente pragmático, cuja origem está nos campos de batalha onde a lealdade é comprada e vendida pelo maior lance. Eles são especialistas em sobrevivência e combate tático, adaptando-se a qualquer situação e utilizando qualquer arma ou armadura que lhes seja útil. Sua jornada é de contratos e pagamentos, valorizando a eficiência e a conclusão da missão acima de qualquer código de honra ou moral. A versatilidade e a experiência em combate em diversos cenários são as qualidades que definem um Mercenário. A mecânica de combate do Mercenário é de adaptabilidade e dano sustentado, utilizando sua Vitalidade e Força para lutar na linha de frente ou na retaguarda. Eles podem alternar entre armas de longo e curto alcance, utilizando granadas, bombas de fumaça e táticas de guerrilha para superar o inimigo. O Mercenário é um mestre em improvisação, utilizando o ambiente e os recursos disponíveis para criar vantagens táticas inesperadas. A vitória do Mercenário é uma transação comercial, onde o resultado é garantido pela competência e pela ausência de escrúpulos.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/IvGJwsL.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Postura de Combate",
        descricao: "O Mercenário assume uma postura ofensiva e disciplinada, equilibrando ataque e defesa. Enquanto ativa, recebe +1 dado de Defesa e +1 dado de ataque. Além disso, sempre que o Mercenário acertar um ataque básico ou habilidade, ganha +1 acúmulo de Ritmo de Combate (máx. 3). Cada acúmulo concede +3 dano fixo em habilidades ofensivas. Ao sair da Postura, todos os acúmulos são consumidos, aumentando o dano do próximo Golpe Calculado em +1d8 por acúmulo.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "3 FaD",
        recarga: "3",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Aumenta Defesa e Ataque",
          "Gera Ritmo de Combate",
          "Bônus de dano ao próximo Golpe Calculado"
        ]
      },
      {
        nome: "Golpe Calculado",
        descricao: "Um ataque preciso e oportunista que causa 3d8 de dano físico. Se o alvo já tiver sido atingido neste turno, o golpe causa +2 dados adicionais de dano. Se o Mercenário possuir acúmulos de Ritmo de Combate, consome todos para causar +1d8 adicional por acúmulo. Caso o alvo esteja com menos de 50% de HP, o ataque ignora parcialmente a defesa (–1 dado de defesa do alvo).",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "9 FaD",
        recarga: "2",
        duracao: "Imediata",
        dado: "3d8",
        bonus: [
          "Dano aumentado se já atingido",
          "Consome Ritmo de Combate",
          "Ignora defesa em alvo crítico"
        ]
      },
      {
        nome: "Passo de Recuo",
        descricao: "O Mercenário se reposiciona rapidamente, movendo-se até 4 metros sem provocar reações. Após o movimento, recebe +2 em Evasão contra o próximo ataque recebido. Se usado Imediatamente após atacar, o Mercenário prepara um contra-ataque: o próximo Corte de Oportunidade causa +1 dado de dano adicional.",
        tipo: "Imediata",
        alcance: "4 metros",
        alvos: "Próprio",
        custo: "3 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Movimento tático",
          "Aumenta Evasão",
          "Bônus ao próximo Corte de Oportunidade"
        ]
      },
      {
        nome: "Foco Frio",
        descricao: "O Mercenário entra em um estado de total controle emocional, ignorando dor e distrações. Durante a duração, ignora penalidades de até –1 provenientes de ferimentos, debuffs leves ou condições mentais simples. Além disso, recebe +1 em testes de resistência. Se o Mercenário estiver abaixo de 50% de HP, também ganha +1 dado de Defesa enquanto o efeito estiver ativo.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Próprio Mercenário",
        custo: "9 FaD",
        recarga: "4",
        duracao: "3 T",
        dado: "N/A",
        bonus: [
          "Ignora penalidades leves",
          "Aumenta resistência",
          "Bônus de defesa em vida crítica"
        ]
      },
      {
        nome: "Linha de Frente",
        descricao: "O Mercenário domina o espaço ao seu redor, impedindo avanços e recuos inimigos. Inimigos dentro da área sofrem –1 em Reação e têm dificuldade em sair da zona. Se tentarem sair, recebem um ataque automático do Mercenário (uma vez por turno). Se o alvo já tiver sido atingido no turno, esse ataque aplica +1 dado de dano adicional. Enquanto ativo, o Mercenário recebe +1 acúmulo de Ritmo de Combate sempre que um inimigo tenta sair da área.",
        tipo: "Sustentada",
        alcance: "3 metros",
        alvos: "Área (3m)",
        custo: "5 FaD",
        recarga: "3",
        duracao: "Sustentada",
        dado: "N/A",
        bonus: [
          "Reduz Reação inimiga",
          "Ataque ao tentar sair",
          "Gera Ritmo de Combate"
        ]
      },
      {
        nome: "Profissional Experiente",
        descricao: "Anos de combate tornaram o Mercenário extremamente resiliente. Sempre que sobreviver a um turno com menos de 50% de HP, recupera 1d4+2 EnR. Se permanecer por 2 Turnos consecutivos nessa condição, também reduz em 1 turno a recarga de uma habilidade ativa. Além disso, ao entrar nessa faixa de vida, ganha Imediatamente +1 acúmulo de Ritmo de Combate.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "Próprio Mercenário",
        custo: "0 EnR",
        recarga: "Passiva",
        duracao: "Passiva",
        dado: "N/A",
        bonus: [
          "Recuperação em vida crítica",
          "Reduz recarga em vida crítica prolongada",
          "Gera Ritmo de Combate automaticamente"
        ]
      },
      {
        nome: "Investida Brutal",
        descricao: "O Mercenário avança com força total, atravessando o campo de batalha. Causa 2d12 de dano físico e empurra o alvo em até 2 metros. Se o alvo colidir com obstáculo ou outro inimigo, sofre +1d12 adicional. Se usado contra um alvo dentro de Linha de Frente, aplica também –1 em Defesa por 1 turno.",
        tipo: "Imediata",
        alcance: "6 metros",
        alvos: "1 Inimigo",
        custo: "11 FaD",
        recarga: "3",
        duracao: "Imediata",
        dado: "2d12",
        bonus: [
          "Empurra inimigo",
          "Dano adicional em colisão",
          "Reduz defesa em Linha de Frente"
        ]
      },
      {
        nome: "Corte de Oportunidade",
        descricao: "O Mercenário explora aberturas no combate com precisão letal. Causa 4d12+12 de dano. Se o alvo tiver atacado neste turno, o dano aumenta em +2d12. Se o ataque for ativado como reação (ex: saída de Linha de Frente ou após Passo de Recuo), o ataque recebe vantagem.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "13 FaD",
        recarga: "2",
        duracao: "Imediata",
        dado: "4d12+12",
        bonus: [
          "Dano letal contra aberturas",
          "Dano aumentado se alvo atacou",
          "Vantagem como reação"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "chacal",
    nome: "Shacal",
    raridade: "mitico",
    descricao: "O Shacal, ou Chacal, é uma classe de origem tribal e selvagem, ligada a rituais de caça e a uma conexão mística com o espírito do predador. Eles são rastreadores e caçadores noturnos, utilizando a Agilidade e a Percepção para emboscar e desmembrar suas presas com eficiência brutal. Sua jornada é de sobrevivência na selva e de respeito à cadeia alimentar, vendo a luta como um ato de predação natural. A furtividade e a ferocidade são as características que definem a natureza selvagem de um Shacal. Em combate, a mecânica do Shacal é de ataque rápido e sangramento, utilizando sua Agilidade para se mover como um fantasma e sua Força para desferir golpes profundos. Eles se especializam em ataques com garras e presas, aplicando venenos e causando ferimentos que sangram profusamente, enfraquecendo o alvo lentamente. O Shacal pode usar gritos de guerra para aterrorizar o inimigo e se camuflar no ambiente para desaparecer e reaparecer em um novo ponto de ataque. A vitória do Shacal é um ato de predação, onde a presa é caçada, ferida e finalmente abatida com uma eficiência fria e calculada.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/TQeGboe.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "2d4+7",
      vitalidade: "2d4+6",
      agilidade: "2d4+7",
      inteligencia: "2d4+5",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Rosto Herdado",
        descricao: "O Shacal assume a identidade de uma presa observada ou conhecida, distorcendo seus traços físicos e postura de forma quase perfeita. Enquanto ativo: Recebe +2 em testes sociais (Enganação/Manipulação). Recebe +1 Precisão contra inimigos que ainda não o atacaram. O primeiro ataque realizado contra um alvo desavisado causa +1 dado adicional de dano.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "Jogador",
        custo: "5 FaD",
        recarga: "2",
        duracao: "3 T",
        dado: "N/A",
        bonus: ["Camuflagem", "Defesa", "Escalação"]
      },
      {
        nome: "Passo do Chacal",
        descricao: "O Shacal se move como um predador silencioso, desaparecendo do campo visual por instantes. Move até 7m sem provocar reações. O próximo ataque neste turno recebe +1 dado de dano. Se atacar pelas costas ou flanco, recebe +1 Precisão adicional.",
        tipo: "Imediata",
        alcance: "—",
        alvos: "Jogador",
        custo: "3 FaD",
        recarga: "1",
        duracao: "1 T",
        dado: "N/A",
        bonus: ["Mobilidade", "Precisão", "Escalável"]
      },
      {
        nome: "Olhos do Caçador",
        descricao: "O Shacal fixa o olhar na presa, enxergando padrões de movimento, respiração e micro falhas. Ignora 1 ponto de Evasão do alvo. Recebe +1 bônus de rolagem contra ele. Se o alvo estiver com Marca do Caçado, ignora também +1 dado de defesa.",
        tipo: "Duradoura",
        alcance: "10m",
        alvos: "1",
        custo: "5 FaD",
        recarga: "3",
        duracao: "3 T",
        dado: "N/A",
        bonus: ["Marca", "Debuff", "Sinergia"]
      },
      {
        nome: "Pele Transitória",
        descricao: "O corpo do Shacal se torna instável e difícil de focar, como uma identidade incompleta. Recebe +2 Evasão. Recebe +1 Reação. Porém causa –1 dado de dano.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "Jogador",
        custo: "7 EnR",
        recarga: "2",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Defesa crescente", "Velocidade", "Escalação"]
      },
      {
        nome: "Presença Incômoda",
        descricao: "A simples presença do Shacal causa desconforto instintivo — algo errado na figura dele. Inimigos na área: Sofrem –1 Precisão e –1 Percepção. Testes de detecção contra o Shacal sofrem penalidade adicional de -2.",
        tipo: "Sustentada",
        alcance: "6m",
        alvos: "AOE",
        custo: "7 EnR",
        recarga: "2",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Debuff inimigo", "Aura", "Escalável"]
      },
      {
        nome: "Legado Vivo",
        descricao: "Cada presa abatida fortalece a essência predatória do Shacal. Ao eliminar um inimigo: recupera 1d12+6 Energia. Se o alvo estava marcado, também ganha +1 bônus de rolagem no próximo turno.",
        tipo: "Duradoura",
        alcance: "6m",
        alvos: "1",
        custo: "11 FaD",
        recarga: "4",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Invocação", "Amplificação", "Controle"]
      },
      {
        nome: "Corte de Máscara",
        descricao: "Um ataque rápido e brutal visando desfigurar e desorientar a presa. Causa 4d8+12 de dano. Aplica Sangramento (3d12 por turno por 2 turnos). Se usado após Passo do Chacal, o alvo sofre –1 Reação.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "8 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "2d8",
        bonus: ["Ignorar defesa", "Sangramento", "Escalável"]
      },
      {
        nome: "Marca do Caçado",
        descricao: "O Shacal escolhe sua presa. Não importa onde ela fuja. O alvo recebe +2 dados de dano de ataques do Shacal. O Shacal sempre sabe a direção aproximada do alvo. Se o alvo estiver com Sangramento, recebe +1 dado adicional.",
        tipo: "Duradoura",
        alcance: "8m",
        alvos: "1",
        custo: "9 FaD",
        recarga: "3",
        duracao: "3 T",
        dado: "N/A",
        bonus: ["Amplificação", "Sinergia sangramento", "Escalável"]
      },
      {
        nome: "Desaparecer Entre Rostos",
        descricao: "Após atacar, o Shacal mistura sua presença com o ambiente ou multidão. Pode se reposicionar até 6m sem reação. Ganha +2 Evasão até o próximo turno. Se não for atacado, o próximo golpe recebe +1 dado de dano.",
        tipo: "Imediata",
        alcance: "—",
        alvos: "Jogador",
        custo: "13 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Evasão", "Mobilidade", "Amplificação"]
      },
      {
        nome: "Execução Ancestral",
        descricao: "Um golpe ritualístico herdado de antigos predadores espirituais. Se o alvo estiver abaixo de 40% HP: causa 6d10 + 12 de dano. Caso contrário: causa 3d10 + 9. Se o alvo estiver com Marca do Caçado, ignora Defesa.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "15 FaD",
        recarga: "4",
        duracao: "0 T",
        dado: "5d12",
        bonus: ["Execução", "Escalável", "Sinergia"]
      },
      {
        nome: "Troca de Portador",
        descricao: "A máscara abandona o corpo atual e assume outro recipiente próximo. Remove 1 condição negativa. Recupera 2d20 Energia. Teleporte para o alvo selecionado. O próximo ataque recebe +2 Precisão.",
        tipo: "Imediata",
        alcance: "8m",
        alvos: "1",
        custo: "11 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Ilusão", "Evasão", "Controle"]
      },
      {
        nome: "A Máscara Sempre Retorna",
        descricao: "A entidade por trás da máscara se recusa a desaparecer. Uma vez por combate, ao cair a 0 HP: Permanece ativo até o fim do turno. Recebe +2 dados de dano. Todos os ataques ignoram Evasão. Se eliminar um inimigo nesse estado, recupera 25% do HP.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "—",
        custo: "0 EnR",
        recarga: "0",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Ressurreição", "Escalação", "Permanência"]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "inquisidor",
    nome: "Inquisitor",
    raridade: "epico",
    descricao: "O Inquisitor é um agente da fé com uma missão sombria, cuja origem está nas alas mais radicais das ordens religiosas dedicadas à erradicação da heresia. Eles são caçadores de bruxas, demônios e qualquer um que se desvie da doutrina, utilizando a Inteligência para interrogar e a Força para punir. Sua jornada é de zelo fanático e de purificação, vendo o mundo em preto e branco e não hesitando em usar métodos brutais para alcançar a \"verdade\". A capacidade de detectar a mentira e a inabalável convicção em sua missão são as armas de um Inquisitor. A mecânica de combate do Inquisitor é de dano sagrado e purificação, utilizando sua Inteligência para invocar magias que expõem e punem a corrupção. Eles se especializam em combate corpo a corpo, imbuindo suas armas com fogo sagrado e utilizando rituais de exorcismo para enfraquecer o inimigo. O Inquisitor pode criar zonas de verdade, onde a magia e as ilusões falham, e usar sua Vitalidade para resistir à tortura e ao dano. A vitória do Inquisitor é a aniquilação da heresia, um ato de fé violento e sem misericórdia.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/rFgbET9.png",
    funcoes: ["OFF Suporting"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Correntes de Penitência",
        descricao: "Correntes espectrais emergem do chão e se prendem ao alvo. O alvo sofre 4d8+6 de dano sagrado e recebe –2 Reação enquanto durar. Se estiver sob Marca do Herege, sofre +2 dados de dano e dificuldade aumentada para escapar.",
        tipo: "Duradoura",
        alcance: "6m",
        alvos: "1",
        custo: "13 EnR",
        recarga: 2,
        duracao: 2,
        dado: "4d8+6",
        bonus: []
      },
      {
        nome: "Marca do Herege",
        descricao: "Marca o alvo com um selo invisível que revela sua corrupção. O alvo sofre -3 em Testes de Obstáculo contra Arts sagradas e recebe 6d8 de dano sagrado sempre que usar uma habilidade ofensiva.",
        tipo: "Duradoura",
        alcance: "7m",
        alvos: "1",
        custo: "19 EnR",
        recarga: 3,
        duracao: 2,
        dado: "6d8",
        bonus: []
      },
      {
        nome: "Chama da Convicção",
        descricao: "O alvo é consumido por chamas sagradas que queimam corpo e alma. Causa 3d8 de dano por turno. Se o alvo estiver marcado, o dano aumenta em +2 dados e reduz –1 Defesa por turno. Ativa sinergia direta com Purificador Implacável.",
        tipo: "Duradoura",
        alcance: "5m",
        alvos: "1",
        custo: "11 EnR",
        recarga: 4,
        duracao: 2,
        dado: "3d8",
        bonus: []
      },
      {
        nome: "Campo da Inquisição",
        descricao: "Cria uma zona sagrada onde mentiras, ilusões e corrupção são esmagadas. Inimigos na área sofrem –2 Precisão e –2 Resistência contra efeitos sagrados. Alvos marcados dentro da área recebem +2 dados de dano de qualquer fonte sagrada.",
        tipo: "Sustentada",
        alcance: "5m",
        alvos: "3m AOE",
        custo: "9 EnR p/ T",
        recarga: 4,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Olhar Julgador",
        descricao: "O Inquisitor encara o alvo e impõe um julgamento absoluto. Se o alvo falhar em um teste, sua próxima ação ofensiva é cancelada. Se estiver sob Marca do Herege, também sofre Desorientação e –2 Reação.",
        tipo: "Imediata",
        alcance: "8m",
        alvos: "1",
        custo: "11 EnR",
        recarga: 4,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Martelo da Expiação",
        descricao: "Um golpe pesado imbuído de fé explode ao impacto. Causa 6d12+8 de dano sagrado em área ao redor do alvo. Se atingir inimigos marcados, aplica +3 dados adicionais e empurra levemente os alvos.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "3 (AOE próximo)",
        custo: "15 FaD & 10 EnR",
        recarga: 3,
        duracao: 0,
        dado: "6d12+8",
        bonus: []
      },
      {
        nome: "Arrastar para o Julgamento",
        descricao: "Correntes sagradas puxam inimigos diretamente até o Inquisitor. Aplica puxão (Obstáculo –9). Alvos marcados ficam Enfraquecidos até o próximo turno. Combina diretamente com Martelo da Expiação.",
        tipo: "Imediata",
        alcance: "6m",
        alvos: "2",
        custo: "15 EnR",
        recarga: 4,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Incêndio Ritual",
        descricao: "O chão é consumido por fogo sagrado purificador. Causa 8d8+6 de dano por turno aos inimigos na área. Inimigos marcados sofrem +2 dado adicional por fonte de dano.",
        tipo: "Duradoura",
        alcance: "4m",
        alvos: "3m AOE",
        custo: "21 EnR",
        recarga: 5,
        duracao: 2,
        dado: "8d8+6",
        bonus: []
      },
      {
        nome: "Explosão da Fé",
        descricao: "Libera uma explosão massiva de energia divina. Causa 4d12+12 de dano sagrado. Para cada inimigo marcado atingido, o dano recebe +1d12 adicional.",
        tipo: "Imediata",
        alcance: "5m",
        alvos: "3m AOE",
        custo: "25 EnR",
        recarga: 5,
        duracao: 0,
        dado: "4d12+12",
        bonus: []
      },
      {
        nome: "Última Absolvição",
        descricao: "O julgamento final é executado com precisão absoluta. Causa 8d12 de dano sagrado. Se o alvo estiver sob Marca do Herege e abaixo de 75% de HP, acerto crítico e ignora Defesa. Se eliminar o alvo, reduz em 1 turno a recarga de todas as habilidades.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "21 EnR",
        recarga: 6,
        duracao: 0,
        dado: "8d12",
        bonus: []
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "cruzado",
    nome: "Crusader",
    raridade: "epico",
    descricao: "O Crusader, ou Cruzado, é um guerreiro sagrado com uma missão de longo alcance, cuja origem está nas grandes campanhas militares em nome da fé. Eles são a infantaria pesada da igreja, combinando a disciplina do Cavaleiro com a devoção do Paladino, mas com um foco maior na guerra de atrito. Sua jornada é de peregrinação e batalha, marchando por terras distantes para libertar locais sagrados ou converter os infiéis. A resistência inabalável e a capacidade de liderar exércitos em nome de sua divindade são as marcas de um Crusader. A mecânica de combate do Crusader é de defesa e dano de área, utilizando sua Vitalidade e Força para suportar o cerco e desferir golpes amplos. Eles se especializam em formação de batalha, protegendo seus aliados com escudos maciços e usando gritos de guerra para inspirar a coragem. O Crusader pode invocar a proteção divina para si e para seus companheiros, tornando-se um muro de carne e aço contra a maré inimiga. A vitória do Crusader é a conquista de um objetivo, uma demonstração de fé e poder militar que não pode ser detida.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/B3slGaZ.jpeg",
    funcoes: ["Suporting"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Benção da Vontade Inquebrável",
        descricao: "O Crusader ergue sua fé como um estandarte vivo, envolvendo aliados em uma aura de determinação absoluta. Aliados na área recebem +2 dados de Defesa e +1 Resistência. Se o Crusader estiver com Muralha da Fé ativa, aliados também recebem redução de dano leve.",
        tipo: "Sustentada",
        alcance: "6m",
        alvos: "3m AOE",
        custo: "9 EnR",
        recarga: 3,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Palavras de Restauração",
        descricao: "Uma oração rápida restaura o corpo e reacende a coragem. Cura 4d12+8 de HP. Se o alvo estiver sob qualquer benção do Crusader, recebe +2d12 adicional e remove uma penalidade leve.",
        tipo: "Imediata",
        alcance: "5m",
        alvos: "2",
        custo: "11 EnR",
        recarga: 2,
        duracao: 0,
        dado: "4d12+8",
        bonus: []
      },
      {
        nome: "Selo da Perseverança",
        descricao: "Marca aliados com um selo sagrado que absorve o impacto da batalha. O primeiro dano sofrido por turno é reduzido em –2 dados de ataque. Se combinado com Escudo da Fé, a absorção total aumenta significativamente.",
        tipo: "Duradoura",
        alcance: "CaC",
        alvos: "2",
        custo: "9 EnR",
        recarga: 3,
        duracao: 2,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Campo de Consagração",
        descricao: "O solo é santificado, fortalecendo aliados e enfraquecendo inimigos. Aliados recebem +1 em testes gerais. Inimigos sofrem –1 Precisão. Se permanecerem por 2 T, aliados recebem regeneração leve (1d6 por turno).",
        tipo: "Sustentada",
        alcance: "4m",
        alvos: "3m AOE",
        custo: "7 EnR p/ T",
        recarga: 4,
        duracao: 2,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Escudo da Fé",
        descricao: "Uma barreira divina protege o alvo contra dano iminente. Absorve 2d12+6 de dano. Se usado em alvo com Selo da Perseverança, também concede +1 dado de Defesa no próximo turno.",
        tipo: "Imediata",
        alcance: "3m",
        alvos: "1",
        custo: "15 EnR",
        recarga: 3,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Martelo da Autoridade",
        descricao: "Um golpe pesado que impõe a presença do Crusader no campo. Causa 5d8+6 de dano físico e empurra o alvo. Se o alvo estiver dentro do Campo de Consagração, também sofre –2 Reação.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "11 FaD",
        recarga: 2,
        duracao: 0,
        dado: "5d8+6",
        bonus: []
      },
      {
        nome: "Provocação Divina",
        descricao: "O Crusader desafia os inimigos com fé inabalável, forçando sua atenção. Inimigos sofrem –3 Precisão ao atacar qualquer alvo que não seja o Crusader. Se estiver sob Benção da Vontade Inquebrável, também recebem –1 dado de dano.",
        tipo: "Duradoura",
        alcance: "5m",
        alvos: "3",
        custo: "13 EnR",
        recarga: 3,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Muralha da Fé",
        descricao: "O Crusader assume uma postura impenetrável. Recebe 20% de redução de dano e +2 dados de Defesa, mas não pode correr. Enquanto ativa, todas as habilidades de proteção recebem bônus adicional.",
        tipo: "Sustentada",
        alcance: "0m",
        alvos: "Jogador",
        custo: "8 EnR",
        recarga: 4,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Impacto Consagrado",
        descricao: "O Crusader golpeia o solo liberando energia sagrada em área. Causa 6d12+12 de dano e reduz Mobilidade dos inimigos atingidos. Se usado após Provocação Divina, aplica –2 Reação adicional.",
        tipo: "Imediata",
        alcance: "3m",
        alvos: "2m AOE",
        custo: "21 EnR & 10 FaD",
        recarga: 3,
        duracao: 0,
        dado: "6d12+12",
        bonus: []
      },
      {
        nome: "Julgamento Descendente",
        descricao: "Um símbolo divino desce dos céus esmagando os inimigos. Causa 12d8+12 de dano sagrado. Para cada aliado dentro da área, o dano recebe +1d8 adicional. Se atingir inimigos sob debuff do Crusader, ignora parcialmente a Defesa.",
        tipo: "Imediata",
        alcance: "4m",
        alvos: "3m AOE",
        custo: "25 EnR",
        recarga: 5,
        duracao: 0,
        dado: "12d8+12",
        bonus: []
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "aprentice",
    nome: "Apontice",
    raridade: "lendario",
    descricao: "A Apontice, é uma classe de transição, cuja origem está nos jovens que iniciam sua jornada em uma das grandes escolas de magia ou combate. Eles são definidos por seu potencial e sua sede de aprendizado, ainda não especializados, mas com uma base sólida em diversas habilidades. Sua jornada é de experimentação e crescimento, utilizando a Inteligência e a Agilidade para absorver novos conhecimentos e técnicas rapidamente. A versatilidade e a capacidade de se adaptar a qualquer papel são as vantagens de um Apontice. Em combate, a mecânica da Apontice é de adaptabilidade e uso de habilidades básicas, utilizando sua Vitalidade e Inteligência para sobreviver e aprender. Eles podem usar uma variedade de armas e magias de baixo nível, focando em táticas de distração e suporte para ajudar os membros mais experientes do grupo. A Apontice pode observar o campo de batalha e replicar habilidades simples de seus aliados ou inimigos, aprendendo em tempo real. A vitória da Apontice é um passo em direção à maestria, uma demonstração de potencial que um dia a transformará em uma lenda.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/YAuvR9Y.jpeg",
    funcoes: ["Control DPS", "OFF Suporting"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Leitura de Combate",
        descricao: "O Apontice analisa padrões de movimento, energia e intenção do alvo. O alvo sofre –2 em Evasão e –1 em Reação. O Apontice recebe +1 Precisão contra ele. Sempre que o alvo ativar uma habilidade, recebe +1 em Testes de Obstáculo contra o Apontice. Se o alvo estiver sob Marca do Herege, os bônus dobram parcialmente.",
        tipo: "Duradoura",
        alcance: "9 m",
        alvos: "1",
        custo: "11 EnR",
        recarga: "3",
        duracao: "3 T",
        dado: "N/A",
        bonus: ["Análise de padrões", "Debuff de evasão", "Bônus de testes"]
      },
      {
        nome: "Trama de Aprendizado",
        descricao: "O Apontice entra em estado de assimilação ativa. Sempre que um inimigo dentro de 9m usar uma habilidade, o Apontice ganha 1 Carga de Aprendizado (máx. 3). Cada carga concede –1 custo de EnR nas próximas habilidades. Consumir cargas aumenta efeitos secundários.",
        tipo: "Sustentada",
        alcance: "0 m",
        alvos: "Jogador",
        custo: "13 EnR",
        recarga: "3",
        duracao: "3 T",
        dado: "N/A",
        bonus: ["Geração de Carga", "Redução de custo", "Amplificação de efeitos"]
      },
      {
        nome: "Golpe da Escrita Ardente",
        descricao: "Um golpe canalizado com inscrições vivas que queimam o alvo. Causa 4d8 + 12 de dano sagrado. Se o alvo estiver sob Marca do Herege, aplica Queimadura Sagrada (2d8 por turno por 2 turnos). Se consumir 1 Carga de Aprendizado: o ataque ignora Defesa adicional.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "11 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "4d8+12",
        bonus: ["Dano sagrado", "Consumo de Carga", "Ignorar defesa"]
      },
      {
        nome: "Reflexo Improvisado",
        descricao: "O Apontice replica parcialmente uma ação observada de um inimigo. Copia o efeito secundário (controle ou debuff) da última habilidade usada com 70% da força original. Se consumir 2 Cargas de Aprendizado: aplica com 100% da força + bônus de +1 Obstáculo contra o alvo.",
        tipo: "Imediata",
        alcance: "9 m",
        alvos: "1",
        custo: "19 EnR",
        recarga: "5",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Cópia de efeitos", "Consumo de Carga", "Amplificação com stacks"]
      },
      {
        nome: "Encadeamento Doutrinário",
        descricao: "Conecta o alvo a uma cadeia de punição progressiva. Sempre que o alvo sofre dano, recebe +1d6 adicional acumulativo (máx. +3d6). Se estiver sob Marca do Herege, o dano adicional sobe para d8. Se consumir 1 Carga: o alvo também sofre –1 Precisão por stack.",
        tipo: "Duradoura",
        alcance: "7 m",
        alvos: "1",
        custo: "13 FaD",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Dano progressivo", "Debuff de precisão", "Amplificação com Marca"]
      },
      {
        nome: "Zona de Dogma Instável",
        descricao: "Cria uma zona onde a realidade é forçada a obedecer regras incompletas. Inimigos: –2 Precisão e –2 em bônus de rolagem. Aliados: +1 em testes. Inimigos marcados sofrem +1 Obstáculo adicional. Consumir 2 Cargas: impede reações dentro da área no primeiro turno.",
        tipo: "Sustentada",
        alcance: "5 m",
        alvos: "AOE (4m)",
        custo: "7 EnR",
        recarga: "5",
        duracao: "3 T",
        dado: "N/A",
        bonus: ["Controle de campo", "Debuff inimigo", "Bônus aliado"]
      },
      {
        nome: "Catalisador de Julgamento",
        descricao: "Detona efeitos já existentes no alvo. Causa 3d10 + 10 de dano base. Para cada efeito ativo no alvo (debuff, marca, DOT), causa +1d10 adicional. Se o alvo estiver sob Marca do Herege: dobra o primeiro dado bônus.",
        tipo: "Imediata",
        alcance: "9 m",
        alvos: "1",
        custo: "15 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "3d10+10",
        bonus: ["Dano escalável com efeitos", "Amplificação com Marca", "Ativação de efeitos"]
      },
      {
        nome: "Vínculo de Observação",
        descricao: "O Apontice sincroniza sua percepção com um aliado. Sempre que o aliado acerta um ataque, o Apontice ganha 1 Carga (1/turno). O aliado recebe +1 Precisão contra alvos sob efeito do Apontice. Se consumir 1 Carga: o aliado ganha +1 dado de dano no próximo ataque.",
        tipo: "Duradoura",
        alcance: "7 m",
        alvos: "1 aliado",
        custo: "9 FaD",
        recarga: "3",
        duracao: "3 T",
        dado: "N/A",
        bonus: ["Sincronização com aliado", "Geração de Carga", "Amplificação de dano"]
      },
      {
        nome: "Colapso de Aprendizado",
        descricao: "O Apontice libera todo o conhecimento acumulado de forma instável. Causa 5d12 + 12 de dano. Consome todas as Cargas: Cada carga adiciona +1d12 de dano. Com 3 cargas: aplica Desorientado + –2 Reação.",
        tipo: "Imediata",
        alcance: "5 m",
        alvos: "AOE (3m)",
        custo: "21 EnR",
        recarga: "5",
        duracao: "0 T",
        dado: "5d12+12",
        bonus: ["Consumo total de Carga", "Dano escalável", "Crowd control"]
      },
      {
        nome: "Despertar do Discípulo",
        descricao: "O Apontice entra em estado de evolução acelerada. Todas habilidades custam –20% EnR. Ganha 1 Carga automática por turno. Habilidades consomem Cargas com efeito máximo automaticamente. Sempre que atingir inimigo marcado, pode realizar 1 ação leve extra (1/turno). Ao final: sofre Exausto por 1 turno.",
        tipo: "Duradoura",
        alcance: "0 m",
        alvos: "Jogador",
        custo: "25 FaD",
        recarga: "6",
        duracao: "3 T",
        dado: "N/A",
        bonus: ["Redução de custo", "Geração automática", "Ação extra", "Exausto após"]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "oraculo",
    nome: "Oráculo",
    raridade: "lendario",
    descricao: "O Oráculo é um vidente e profeta, cuja origem está ligada a um dom inato ou a uma maldição que lhes permite vislumbrar o futuro e o passado. Eles são conselheiros e guias, utilizando sua Percepção e Inteligência para interpretar os sinais e avisar sobre perigos iminentes. Sua jornada é de isolamento e responsabilidade, pois o conhecimento do futuro é um fardo que poucos podem suportar sem enlouquecer. A capacidade de prever eventos e a sabedoria para guiar os outros são os dons de um Oráculo. A mecânica de combate do Oráculo é de suporte e controle temporal, utilizando sua Inteligência para alterar a sorte e o destino no campo de batalha. Eles podem lançar feitiços que causam azar nos inimigos ou concedem sorte aos aliados, transformando falhas em sucessos e vice-versa. O Oráculo pode usar sua visão para desviar de ataques antes que sejam desferidos e para posicionar seus aliados no local mais vantajoso. A vitória do Oráculo é uma manipulação do destino, onde o futuro é dobrado à sua vontade através da sabedoria e da previsão.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/FACSqRo.jpeg",
    funcoes: ["Damage Dealer", "Suporting"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Visão do Instante Anterior",
        descricao: "O Oráculo acessa o fragmento do tempo imediatamente anterior ao presente, prevendo micro movimentos e intenções. Recebe +1 Precisão, +2 Evasão e +1 Reação até o fim do turno. O próximo ataque contra ele sofre –2 Precisão. Se evitar um ataque, ganha 1 Marca de Destino.",
        tipo: "Imediata",
        alcance: "1 m",
        alvos: "1",
        custo: "9 EnR",
        recarga: "2",
        duracao: "1 T",
        dado: "N/A",
        bonus: ["Previsão", "Bônus de evasão", "Geração de Marca"]
      },
      {
        nome: "Linha Provável",
        descricao: "O Oráculo revela o caminho com maior chance de sucesso dentro das múltiplas possibilidades. O alvo recebe +2 em bônus de rolagem, +1 em Testes de Obstáculo e ignora penalidades leves de precisão nesse turno. Se usado em alvo com Marca de Destino: o bônus aumenta para +3 e a ação não pode ser reduzida por efeitos negativos.",
        tipo: "Imediata",
        alcance: "9 m",
        alvos: "1",
        custo: "15 FaD",
        recarga: "2",
        duracao: "1 T",
        dado: "N/A",
        bonus: ["Bônus de rolagem", "Ignorar penalidades", "Amplificação com Marca"]
      },
      {
        nome: "Presságio de Impacto",
        descricao: "O Oráculo marca o momento exato onde o alvo inevitavelmente falhará. Causa 4d8+12 de dano inicial. O alvo sofre –2 Precisão. O primeiro erro do alvo ativa um colapso: +3d8 de dano cósmico. Se consumir 1 Marca de Destino: o colapso ativa também em sucesso crítico.",
        tipo: "Duradoura",
        alcance: "9 m",
        alvos: "1",
        custo: "13 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "4d8+12",
        bonus: ["Dano inicial", "Debuff de precisão", "Dano reativo"]
      },
      {
        nome: "Desvio Antecipado",
        descricao: "O Oráculo reage antes da ação existir no fluxo temporal. +3 Evasão e +10 Defesa Fixa contra o próximo ataque. Se evitar dano, pode se reposicionar 3m. Se tiver Marca de Destino: pode anular completamente o ataque (consome 1 Marca).",
        tipo: "Imediata",
        alcance: "1 m",
        alvos: "1",
        custo: "17 FaD",
        recarga: "3",
        duracao: "1 T",
        dado: "N/A",
        bonus: ["Evasão aprimorada", "Mobilidade", "Anulação com Marca"]
      },
      {
        nome: "Julgamento Prematuro",
        descricao: "O Oráculo ataca eventos futuros antes que eles ocorram. Causa 6d12 de dano em área. Aplica Desorientado por 1 turno. Inimigos com Marca de Destino sofrem +2d10 adicional. Consumir 2 Marcas: aplica também –2 em bônus de rolagem.",
        tipo: "Imediata",
        alcance: "11 m",
        alvos: "AOE (3m)",
        custo: "21 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "6d12",
        bonus: ["Dano em área", "Crowd control", "Consumo de Marca"]
      },
      {
        nome: "Futuro Imediata",
        descricao: "O Oráculo avança sua própria linha temporal. +25% Prontidão. Pode agir antes de inimigos com menor iniciativa. Primeiro ataque no turno recebe +1 dado de dano. Se gerar Marca de Destino: ganha ação leve extra (1/turno).",
        tipo: "Duradoura",
        alcance: "0 m",
        alvos: "Jogador",
        custo: "19 EnR",
        recarga: "4",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Aumento de iniciativa", "Bônus de dano", "Ação extra com Marca"]
      },
      {
        nome: "Memória do Que Foi",
        descricao: "O Oráculo compartilha ecos de experiências passadas perfeitas. +1 bônus de rolagem, +2 Testes de Obstáculo e primeira falha do aliado é ignorada. Se o aliado consumir Marca de Destino: transforma falha em sucesso parcial.",
        tipo: "Duradoura",
        alcance: "6 m",
        alvos: "1 aliado",
        custo: "9 FaD",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Bônus de teste", "Ignorar falha", "Recuperação com Marca"]
      },
      {
        nome: "Eco Persistente",
        descricao: "O tempo entra em loop instável na área. Inimigos: –5 Reação e –2 bônus de rolagem. Sempre que falharem, repetem o erro recebendo –1 adicional cumulativo. Se houver Marca de Destino: o inimigo perde a reação completamente no primeiro turno.",
        tipo: "Sustentada",
        alcance: "5 m",
        alvos: "AOE",
        custo: "11 FaD",
        recarga: "3",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Debuff de reação", "Penalidade cumulativa", "Perda de reação com Marca"]
      },
      {
        nome: "Cura do Tempo Reescrito",
        descricao: "O Oráculo reverte o estado do alvo para um momento anterior sem dano. Cura 1d12 por carga (máx. 8d12). Remove Desorientado, Medo e penalidades leves. Se consumir Marca de Destino: também remove de-buffs fortes.",
        tipo: "Imediata",
        alcance: "1 m",
        alvos: "1",
        custo: "5 FaD",
        recarga: "3",
        duracao: "0 T",
        dado: "1d12",
        bonus: ["Cura escalável", "Remoção de debuffs", "Amplificação com Marca"]
      },
      {
        nome: "Profecia Ancorada",
        descricao: "O Oráculo declara um futuro inevitável e o prende à realidade. +2 bônus de rolagem, +1 Precisão, Evasão e Reação. Primeira falha de cada aliado é ignorada. Sempre que um aliado teria falhado, gera 1 Marca de Destino para o Oráculo. Com 3+ Marcas: aliados recebem +1 dado de dano adicional.",
        tipo: "Duradoura",
        alcance: "7 m",
        alvos: "Aliados",
        custo: "21 EnR",
        recarga: "5",
        duracao: "3 T",
        dado: "N/A",
        bonus: ["Bônus global", "Ignorar falha", "Geração de Marca", "Dano escalável"]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "apostolo",
    nome: "Apóstolo",
    raridade: "epico",
    descricao: "O Apóstolo é um seguidor devoto e carismático, cuja origem está ligada a um líder religioso ou a uma figura messiânica que eles servem incondicionalmente. Eles são a voz e a mão de seu mestre, utilizando sua Inteligência e Vitalidade para espalhar a palavra e proteger seu líder a todo custo. Sua jornada é de fé e proselitismo, buscando converter os outros e fortalecer a causa de sua divindade ou figura de adoração. A capacidade de inspirar a fé e a lealdade inabalável são as características de um Apóstolo. Em combate, a mecânica do Apóstolo é de suporte e inspiração, utilizando sua Inteligência para curar e fortalecer seus aliados com orações e hinos. Eles podem usar sua Vitalidade para se colocar entre o perigo e seu líder, absorvendo o dano e mantendo a linha de frente. O Apóstolo pode invocar a fúria de sua divindade contra os inimigos, desferindo ataques sagrados que são potencializados pela sua fé. A vitória do Apóstolo é a preservação de sua causa e a demonstração do poder de sua fé, inspirando os outros a se juntarem à luta.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/7MRyeiX.jpeg",
    funcoes: ["Control DPS", "OFF Suporting"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Voz Consagrada",
        descricao: "O Apóstolo profere palavras carregadas de autoridade divina, alinhando corpo e espírito do alvo. Concede +1 em bônus de rolagem e +1 em Testes de Obstáculo na próxima ação. Se o alvo estiver sob outra benção do Apóstolo, recebe +1 dado adicional na ação.",
        tipo: "Imediata",
        alcance: "7m",
        alvos: "1",
        custo: "9 EnR",
        recarga: 1,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Canal da Devoção",
        descricao: "O Apóstolo entra em comunhão direta com sua fé, canalizando poder continuamente. Enquanto ativo: recupera 1d8 Energia por turno e suas Arts de suporte recebem +1 dado de efeito. Se houver 2+ aliados afetados por suas habilidades, o ganho aumento de acerto crítico (Reduz para 5).",
        tipo: "Sustentada",
        alcance: "0m",
        alvos: "Jogador",
        custo: "5 EnR p/ T",
        recarga: 1,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Benção Persistente",
        descricao: "Um selo de proteção constante envolve o alvo. Concede 3d8 de aumento de Defesa. Se o alvo sofrer dano, ativa uma cura leve (2d8+6).",
        tipo: "Duradoura",
        alcance: "CaC",
        alvos: "1",
        custo: "13 EnR",
        recarga: 3,
        duracao: 2,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Juramento Compartilhado",
        descricao: "O Apóstolo liga os aliados por um juramento espiritual coletivo. Aliados recebem +2 em bônus de rolagem. Enquanto ativo: parte do dano recebido é redistribuído na vida atual. O Apóstolo sofre –1 Evasão. Se combinado com Benção Persistente, a mitigação aumenta.",
        tipo: "Sustentada",
        alcance: "7m",
        alvos: "3",
        custo: "11 EnR p/ T",
        recarga: 3,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Cura da Palavra Viva",
        descricao: "Uma palavra carregada de fé restaura o alvo profundamente. Cura 4d12 de HP e remove Desorientado ou Medo. Se o alvo estiver sob múltiplas bênçãos, recebe cura adicional (+2d12).",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "21 EnR",
        recarga: 3,
        duracao: 0,
        dado: "4d12",
        bonus: []
      },
      {
        nome: "Decreto da Fé Inabalável",
        descricao: "O Apóstolo impõe um decreto divino que fortalece seus aliados. Concede +10% Prontidão e +2 em Testes de Obstáculo. Aliados sob esse efeito ignoram penalidades leves.",
        tipo: "Duradoura",
        alcance: "7m",
        alvos: "3",
        custo: "19 EnR",
        recarga: 4,
        duracao: 2,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Toque da Convicção",
        descricao: "Um toque carregado de julgamento espiritual atinge o inimigo. Causa 6d8 de dano. Se o alvo agir no próximo turno, sofre penalidade adicional em resistência contra Arts do Apóstolo.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "17 EnR",
        recarga: 2,
        duracao: 0,
        dado: "6d8",
        bonus: []
      },
      {
        nome: "Marca do Enviado",
        descricao: "Marca o alvo como escolhido para julgamento. Sempre que sofrer dano, recebe +2d12+6 de dano fixo adicional de fontes sagradas (ignora defesa). Se múltiplos aliados atacarem, o efeito escala rapidamente.",
        tipo: "Duradoura",
        alcance: "7m",
        alvos: "1",
        custo: "13 EnR",
        recarga: 3,
        duracao: 2,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Julgamento Ecoante",
        descricao: "Uma onda de julgamento reverbera pelo campo. Causa 6d8+12 de dano em área. Inimigos atingidos sofrem –2 em bônus de rolagem. Se estiverem sob Marca do Enviado, recebem dano adicional e têm resistência reduzida.",
        tipo: "Imediata",
        alcance: "11m",
        alvos: "3m AOE",
        custo: "21 EnR",
        recarga: 5,
        duracao: 0,
        dado: "6d8+12",
        bonus: []
      },
      {
        nome: "Veredito do Portador",
        descricao: "O Apóstolo canaliza o julgamento final de sua fé em um único golpe. Causa 4d12+9 de dano fixo. Se o alvo estiver sob qualquer efeito do Apóstolo: ignora Defesa adicional e recebe +3 dados de dano. Se estiver sob Marca do Enviado, o dano é amplificado novamente.",
        tipo: "Imediata",
        alcance: "9m",
        alvos: "1",
        custo: "21 EnR",
        recarga: 5,
        duracao: 0,
        dado: "4d12+9",
        bonus: []
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "artista_marcial",
    nome: "Artista Marcial",
    raridade: "comum",
    descricao: "O Artista Marcial é um combatente focado na técnica e na disciplina, cuja origem está nas academias de luta que buscam a perfeição do movimento humano. Eles são mestres em diversas formas de combate desarmado e com armas leves, utilizando a Agilidade e a Força para desferir golpes precisos e fluidos. Sua jornada é de treinamento contínuo e busca pela harmonia entre corpo e mente, transformando a luta em uma forma de arte. A fluidez do movimento e a capacidade de usar o corpo como uma arma letal são as marcas de um Artista Marcial. A mecânica de combate do Artista Marcial é de ataque rápido e controle de fluxo, utilizando sua Agilidade para desferir sequências de golpes que atordoam o inimigo. Eles podem usar a força do oponente contra ele mesmo, desviando de ataques e contra-atacando com precisão cirúrgica. O Artista Marcial pode canalizar sua energia interna para aumentar a força de seus golpes ou para se curar de ferimentos leves. A vitória do Artista Marcial é uma exibição de técnica, onde a força bruta é superada pela velocidade e pela precisão do movimento.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/KM5uZdS.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Golpe Fundamental",
        descricao: "Um ataque preciso e disciplinado que serve como base de todas as técnicas do Artista Marcial. Causa 4d8+6 de dano físico. Se acertar, o usuário entra em Fluxo de Combate, recebendo +1 em bônus de rolagem no próximo ataque corpo a corpo neste turno. Se utilizado como primeiro ataque do turno, também concede +1 acúmulo de Ritmo Marcial (máx. 3). Ritmo Marcial aumenta o dano de habilidades em +5 por acúmulo e é consumido por técnicas avançadas.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "9 EnR",
        recarga: "1",
        duracao: "Imediata",
        dado: "4d8+6",
        bonus: [
          "Concede Fluxo de Combate",
          "Gera Ritmo Marcial como primeiro ataque",
          "Base para técnicas avançadas"
        ]
      },
      {
        nome: "Sequência de Impactos",
        descricao: "O Artista Marcial executa uma sequência rápida e precisa de golpes encadeados. Causa 2d12 de dano físico. Se o alvo já tiver sofrido dano neste turno, a técnica causa +2 dados adicionais de dano. Consome todos os acúmulos de Ritmo Marcial, causando +1d8 adicional por acúmulo. Se consumir 3 acúmulos, aplica –1 em Defesa do alvo por 1 turno.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "13 EnR",
        recarga: "2",
        duracao: "Imediata",
        dado: "2d12",
        bonus: [
          "Dano aumentado em sequência",
          "Consome Ritmo Marcial",
          "Reduz defesa com máximo Ritmo"
        ]
      },
      {
        nome: "Quebra de Postura",
        descricao: "Um golpe técnico focado em articulações e equilíbrio corporal. Causa 4d12 de dano e aplica –2 em Precisão ao alvo por 1 turno. Se o alvo estiver sob efeito de Ritmo Marcial consumido recentemente ou tiver sofrido múltiplos ataques no turno, também recebe –1 em Evasão. Se utilizado após Sequência de Impactos, prolonga a penalidade por +1 turno.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "15 FaD",
        recarga: "3",
        duracao: "1 T",
        dado: "4d12",
        bonus: [
          "Reduz Precisão do alvo",
          "Penalidade adicional em sequência",
          "Reduz Evasão"
        ]
      },
      {
        nome: "Punho Penetrante",
        descricao: "Um golpe concentrado que atravessa defesas com precisão absoluta. Causa 4d12+6 de dano físico e ignora 50% da Defesa do alvo. Se o alvo estiver sob penalidades de Defesa ou Precisão, o golpe ignora um dado adicional de defesa. Se executado com 2 ou mais acúmulos de Ritmo Marcial, causa +2d12 adicional.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "19 EnR",
        recarga: "4",
        duracao: "Imediata",
        dado: "4d12+6",
        bonus: [
          "Ignora 50% de defesa",
          "Ignora mais defesa em alvo debilitado",
          "Dano aumentado com Ritmo Marcial"
        ]
      },
      {
        nome: "Explosão de Ki",
        descricao: "O Artista Marcial libera energia interna acumulada em uma onda expansiva. Causa 3d12+350% de dano em área e empurra inimigos até 8 metros. Alvos que colidirem com obstáculos sofrem +1d8 adicional. Se ao menos um alvo estiver sob efeito de Quebra de Postura, todos os inimigos atingidos recebem –1 em Reação por 1 turno.",
        tipo: "Imediata",
        alcance: "3 metros",
        alvos: "Área (AOE)",
        custo: "29 EnR",
        recarga: "4",
        duracao: "Imediata",
        dado: "3d12+350%",
        bonus: [
          "Ataque em área massivo",
          "Empurra inimigos",
          "Reduz Reação se alvo debilitado"
        ]
      },
      {
        nome: "Finalização Técnica",
        descricao: "Um golpe devastador direcionado a pontos vitais do corpo. Causa 8d12+12 de dano físico. Se o alvo estiver sob penalidade de Precisão, Defesa ou Evasão, sofre Desorientado por 1 turno. Se o Artista Marcial possuir 3 acúmulos de Ritmo Marcial, o ataque causa +2d12 adicionais e ignora completamente bônus defensivos temporários.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "21 EnR + 5 FaD",
        recarga: "5",
        duracao: "Imediata",
        dado: "8d12+12",
        bonus: [
          "Dano devastador",
          "Aplica Desorientação a alvo debilitado",
          "Ignora bônus defensivos com máximo Ritmo"
        ]
      },
      {
        nome: "Postura Fluida",
        descricao: "O Artista Marcial assume uma postura adaptativa e imprevisível. Enquanto ativa, recebe +1 em Evasão e Reação. Sempre que evitar um ataque, ganha +1 acúmulo de Ritmo Marcial. Se atingir o máximo de acúmulos durante essa postura, o próximo ataque recebe aumento de dano critico (Condição).",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "3 EnR",
        recarga: "1",
        duracao: "Sustentada",
        dado: "N/A",
        bonus: [
          "Aumenta Evasão e Reação",
          "Gera Ritmo Marcial ao evitar",
          "Crítico garantido com máximo Ritmo"
        ]
      },
      {
        nome: "Passo Relâmpago",
        descricao: "O Artista Marcial realiza um deslocamento explosivo e preciso. Move-se até 5 metros sem provocar reações. Se terminar adjacente a um inimigo, recebe +1 em Precisão no próximo ataque. Se usado antes de uma habilidade ofensiva, concede +1 acúmulo de Ritmo Marcial.",
        tipo: "Imediata",
        alcance: "5 metros",
        alvos: "Próprio",
        custo: "9 FaD",
        recarga: "1",
        duracao: "Imediata",
        dado: "N/A",
        bonus: [
          "Deslocamento tático",
          "Bônus de Precisão adjacente",
          "Gera Ritmo Marcial antes de ataque"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "grappler",
    nome: "Grappler",
    raridade: "raro",
    descricao: "O Grappler, ou Lutador de Agarrar, tem sua origem nas arenas de luta e nas escolas de combate que se especializam em imobilização e submissão. Eles são mestres em agarrar, derrubar e prender o inimigo, utilizando a Força e a Vitalidade para dominar fisicamente o oponente. Sua jornada é de treinamento de força e resistência, buscando a capacidade de controlar o corpo do adversário e anular sua capacidade de ataque. O domínio da luta corpo a corpo e a capacidade de imobilizar qualquer inimigo são as especialidades de um Grappler. A mecânica de combate do Grappler é de controle de movimento e dano de submissão, utilizando sua Força para agarrar e sua Vitalidade para resistir a contra-ataques. Eles se jogam no combate corpo a corpo, buscando a oportunidade de prender o inimigo em chaves de braço, estrangulamentos ou arremessos devastadores. O Grappler pode usar sua Agilidade para se esquivar de golpes e se posicionar para o agarramento perfeito, transformando a luta em um duelo de força e técnica. A vitória do Grappler é a submissão total do inimigo, onde a força é usada para anular a capacidade de luta do adversário.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/6dLzlvP.jpeg",
    funcoes: ["Control DPS"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Contra o Chão",
        descricao: "O Grappler agarra o inimigo com força bruta e o arremessa violentamente contra o solo. Causa 4d8 de dano físico e aplica Atordoado por 1 turno. Após o impacto, pode arrastar o alvo causando 2d8 de dano por metro percorrido. Se colidir com obstáculos, recebe +2d8 de dano adicional.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "19 FaD",
        recarga: "5 T",
        duracao: "0 T",
        dado: "4d8",
        bonus: [
          "Arremesso com dano extra",
          "Aplica Atordoado",
          "Arrasto com dano progressivo"
        ]
      },
      {
        nome: "Projeção Controlada",
        descricao: "Um arremesso técnico que utiliza o próprio peso do inimigo contra ele. Causa 3d12 de dano físico e aplica Desorientado por 1 turno. Se o alvo estiver sob Agarre ou Supressão, sofre –1 em Defesa até o próximo turno.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "9 FaD",
        recarga: "3 T",
        duracao: "0 T",
        dado: "3d12",
        bonus: [
          "Técnica de arremesso",
          "Aplica Desorientado",
          "Penalidade extra em Defesa"
        ]
      },
      {
        nome: "Pressão de Junta",
        descricao: "O Grappler aplica uma chave precisa nas articulações do alvo. O inimigo sofre –2 em Precisão enquanto durar. Sempre que o alvo tentar realizar um ataque, recebe 3d6 de dano fixo. Se estiver sob Supressão Total, o dano aumenta para 4d6 e o alvo sofre –1 em Reação.",
        tipo: "Duradoura",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "10 FaD",
        recarga: "4 T",
        duracao: "2 T",
        dado: "3d6",
        bonus: [
          "Penalidade em Precisão",
          "Dano ao atacar",
          "Dano aumentado sob Supressão"
        ]
      },
      {
        nome: "Impacto no Chão",
        descricao: "O Grappler ergue ou arremessa um inimigo contra o chão. Causa 2d12 de dano físico em todos os inimigos próximos. O alvo principal sofre +2d12 adicional. Inimigos atingidos recebem –1 em Evasão no próximo turno. Se o alvo principal estiver sob Agarre, causa Atordoado.",
        tipo: "Imediata",
        alcance: "3 metros",
        alvos: "Área (AOE)",
        custo: "15 FaD",
        recarga: "3 T",
        duracao: "0 T",
        dado: "2d12",
        bonus: [
          "Dano em área",
          "Dano extra ao principal",
          "Penalidade em Evasão"
        ]
      },
      {
        nome: "Supressão Total",
        descricao: "O Grappler domina completamente o oponente. O alvo sofre –3 em bônus de rolagem e não pode se afastar. Enquanto ativo, causa 2d12 de dano automático por turno. Se o alvo tentar se libertar e falhar, sofre +2d12 adicional.",
        tipo: "Sustentada",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "9 FaD p/ T",
        recarga: "3 turnos",
        duracao: "0 T",
        dado: "2d12",
        bonus: [
          "Imobilização completa",
          "Penalidade em rolagens",
          "Dano automático por turno"
        ]
      },
      {
        nome: "Base Inquebrável",
        descricao: "O Grappler fixa sua base e distribui o peso perfeitamente. Recebe +2 dados de Defesa adicional e imunidade a empurrões. Tentativas de deslocamento forçado sofrem –2 na rolagem. Se estiver agarrando um inimigo, o alvo sofre –1 em testes para escapar.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "5 FaD p/ T",
        recarga: "2 T",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Defesa aumentada",
          "Imunidade a empurrões",
          "Penalidade em tentativas de fuga"
        ]
      },
      {
        nome: "Contra-Grapple",
        descricao: "O Grappler transforma defesa em controle. Ao ser alvo de um ataque corpo a corpo, recebe 1d12+6 de Defesa adicional. Se o ataque errar, agarra o inimigo ou o desloca até 3 metros. Se tiver Base Inquebrável ativa, pode aplicar Supressão Total Imediatamente sem custo extra.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "15 FaD",
        recarga: "3 turnos",
        duracao: "0 T",
        dado: "1d12+6",
        bonus: [
          "Defesa adicional",
          "Agarramento automático",
          "Integração com Base Inquebrável"
        ]
      },
      {
        nome: "Finalização de Alavanca",
        descricao: "Uma técnica de submissão extrema que leva o corpo do inimigo ao limite. Causa 6d12 + 12 de dano físico. Se sob Agarre, Supressão Total ou Pressão de Junta, ignora Defesa adicional. Se com menos de 50% de HP, aplica Desorientado por 1 turno. Se usado após Supressão Total, causa +2d12 adicional.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "21 FaD",
        recarga: "6 T",
        duracao: "0 T",
        dado: "6d12+12",
        bonus: [
          "Dano devastador",
          "Ignora Defesa adicional",
          "Efeito extra em low HP"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "glaiver",
    nome: "Glaiver",
    raridade: "raro",
    descricao: "O Glaiver, ou Mestre de Glaive, é um guerreiro especializado no uso de armas de haste longas, cuja origem está nas guardas de elite e nas formações de infantaria. Eles são mestres em manter a distância e controlar o campo de batalha com ataques de longo alcance e varreduras amplas. Sua jornada é de disciplina e coordenação, utilizando a Força e a Agilidade para manusear a glaive com precisão e fluidez. A capacidade de atacar de longe e controlar o posicionamento dos inimigos são as vantagens táticas de um Glaiver. A mecânica de combate do Glaiver é de controle de área e dano de varredura, utilizando sua Força para desferir golpes poderosos em múltiplos inimigos. Eles se mantêm na linha de frente, usando o alcance de sua glaive para impedir que os inimigos se aproximem e para proteger os aliados na retaguarda. O Glaiver pode usar a ponta da glaive para ataques de precisão e a haste para desarmar ou derrubar oponentes, controlando o fluxo da batalha. A vitória do Glaiver é uma demonstração de controle, onde o inimigo é mantido à distância e abatido antes de poder retaliar.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/6ytbDcB.jpeg",
    funcoes: ["Control DPS"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Passo do Glaive",
        descricao: "O Glaiver reposiciona seu corpo com precisão, mantendo o alcance ideal. Move-se até 5 metros sem provocar ataques de oportunidade. Se terminar fora do alcance corpo a corpo, recebe +1 em Precisão no próximo ataque. Se usado antes de um ataque, ignora penalidades de alcance.",
        tipo: "Imediata",
        alcance: "5 metros",
        alvos: "Próprio",
        custo: "3 FaD",
        recarga: "1 T",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Reposicionamento tático",
          "Bônus em Precisão",
          "Ignora penalidades de alcance"
        ]
      },
      {
        nome: "Corte Circular",
        descricao: "Um giro completo com a glaive, atingindo todos ao redor. Causa 4d10 de dano físico em todos os inimigos na área. Inimigos atingidos sofrem –1 em Reação até o próximo turno. Se usado dentro de Zona de Lâminas, causa +1d10 adicional.",
        tipo: "Imediata",
        alcance: "3 metros",
        alvos: "Área (AOE)",
        custo: "15 FaD",
        recarga: "3 T",
        duracao: "0 T",
        dado: "4d10",
        bonus: [
          "Dano em área",
          "Penalidade em Reação",
          "Efeito aumentado em Zona"
        ]
      },
      {
        nome: "Ritmo Cortante",
        descricao: "O Glaiver entra em um fluxo contínuo de ataques e reposicionamento. Recebe +1 em Precisão e +1 em bônus de rolagem em ataques com armas de haste. Sempre que acertar um ataque, pode ajustar sua posição em até 2 metros. Se mantiver por 2 turnos consecutivos, o próximo ataque causa +1d12 adicional.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "9 FaD",
        recarga: "3 T",
        duracao: "2 T",
        dado: "1d12",
        bonus: [
          "Bônus em Precisão",
          "Reposicionamento após acerto",
          "Dano extra progressivo"
        ]
      },
      {
        nome: "Varredura Baixa",
        descricao: "Um golpe rasteiro que visa derrubar e desequilibrar os inimigos. Causa 3d12 de dano físico e aplica –2 em Evasão por 1 turno. Se o alvo já estiver sob penalidade de movimento ou dentro de Zona de Lâminas, também sofre Desorientado leve.",
        tipo: "Imediata",
        alcance: "4 metros",
        alvos: "Até 2 inimigos",
        custo: "15 FaD",
        recarga: "3 T",
        duracao: "0 T",
        dado: "3d12",
        bonus: [
          "Derrubamento",
          "Penalidade em Evasão",
          "Desorientação com condições"
        ]
      },
      {
        nome: "Salto Giratório",
        descricao: "O Glaiver salta e gira no ar, desferindo um ataque descendente com grande alcance. Causa 6d8+6 de dano físico em área ao aterrissar. Inimigos atingidos são empurrados 2 metros para trás. Se atingir apenas um alvo, causa +3d8 adicional.",
        tipo: "Imediata",
        alcance: "5 metros",
        alvos: "Área (AOE)",
        custo: "19 FaD",
        recarga: "4 T",
        duracao: "0 T",
        dado: "6d8+6",
        bonus: [
          "Salto com dano aumentado",
          "Empurrão",
          "Dano concentrado"
        ]
      },
      {
        nome: "Final da Dança",
        descricao: "Um golpe final preciso após uma sequência fluida. Causa 350% de dano físico. Se o alvo estiver sob penalidades ou dentro de Zona de Lâminas, causa +4d12 adicional e ignora Defesa adicional. Se usado após Ritmo Cortante, recebe +1 em Precisão.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1 Inimigo",
        custo: "21 FaD",
        recarga: "6 T",
        duracao: "0 T",
        dado: "350%",
        bonus: [
          "Golpe finalizador",
          "Ignora Defesa em condições",
          "Precisão aumentada"
        ]
      },
      {
        nome: "Guarda Alongada",
        descricao: "O Glaiver mantém sua arma em posição defensiva ideal, cobrindo uma área ampla. Recebe +2 dados de Defesa adicional contra ataques corpo a corpo. Inimigos que tentarem entrar em alcance próximo sofrem –1 em Precisão no ataque. Se o ataque falhar, pode realizar um Contra-Corte sem custo.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "5 FaD p/ T",
        recarga: "1 T",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Defesa aumentada",
          "Penalidade em Precisão",
          "Contra-ataque automático"
        ]
      },
      {
        nome: "Zona de Lâminas",
        descricao: "O Glaiver estabelece uma área de controle absoluto com sua arma. Inimigos dentro sofrem –2 em Reação e –1 em Evasão. Sempre que um inimigo se mover dentro da área, sofre 2d12 de dano físico. Habilidades recebem efeitos adicionais contra alvos dentro da zona.",
        tipo: "Duradoura",
        alcance: "5 metros",
        alvos: "Área (AOE)",
        custo: "19 FaD",
        recarga: "5 T",
        duracao: "3 T",
        dado: "2d12",
        bonus: [
          "Penalidades em área",
          "Dano ao movimento",
          "Efeitos amplificados"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "spiritual_fighter",
    nome: "Spiritual Fighter",
    raridade: "epico",
    descricao: "O Spiritual Fighter, ou Lutador Espiritual, é um Monge que transcendeu o domínio físico para incorporar a energia espiritual em seu combate. Eles são mestres na manipulação do Ki, utilizando-o para aumentar sua Força, Agilidade e Vitalidade, transformando-se em seres de poder sobrenatural. Sua jornada é de meditação e ascensão, buscando a iluminação e o domínio completo da energia que flui através de todos os seres vivos. A capacidade de manifestar a energia espiritual em combate é o que define um Spiritual Fighter. A mecânica de combate do Spiritual Fighter é de dano de energia e velocidade, utilizando sua Agilidade para desferir golpes rápidos e sua Inteligência para canalizar o Ki. Eles podem lançar rajadas de energia, criar escudos de força e se mover a velocidades incríveis, tornando-se um borrão no campo de batalha. O Spiritual Fighter pode usar sua Vitalidade para curar ferimentos graves e sua Força para desferir socos que causam dano explosivo. A vitória do Spiritual Fighter é uma demonstração de poder interior, onde a mente e o espírito superam as limitações do corpo.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/BXkQVZz.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Respiração do Vazio",
        descricao: "O lutador entra em um estado de fluxo espiritual constante, alinhando corpo e mente. Enquanto ativa: sempre que se mover ou usar uma Art, gera 1 Marca Espiritual. Recupera 1d4+2 de Energia por turno.",
        tipo: "Sustentada",
        alcance: "CaC",
        alvos: "Jogador",
        custo: "1 FaD p/ T",
        recarga: 3,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Passo Etéreo",
        descricao: "O corpo se dissolve parcialmente em energia, permitindo um avanço instantâneo e imprevisível. Não provoca ataques de oportunidade e reposiciona livremente. Se usado durante Respiração do Vazio, gera +1 Marca. Ideal para iniciar combos ou escapar antes de explodir dano.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "Jogador",
        custo: "9 EnR",
        recarga: 1,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Palma de Contenção",
        descricao: "Um golpe preciso interrompe o fluxo energético do inimigo. Causa 4d8+12 de dano espiritual e desorganiza sua estrutura interna.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "5 FaD",
        recarga: 1,
        duracao: 0,
        dado: "4d8+12",
        bonus: []
      },
      {
        nome: "Circulação Interna",
        descricao: "O Ki flui de forma contínua e eficiente pelo corpo do lutador. Enquanto ativa: custos de Arts –30%. Ao atingir inimigos diferentes no turno, gera 1 Marca.",
        tipo: "Sustentada",
        alcance: "CaC",
        alvos: "Jogador",
        custo: "3 EnR p/ T",
        recarga: 3,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Impacto Harmonizado",
        descricao: "Um golpe carregado com energia perfeitamente alinhada atinge o alvo com força concentrada. Causa 4d12+10 de dano espiritual. Consumir 1 Marca → empurra o alvo 8m.",
        tipo: "Imediata",
        alcance: "3 m",
        alvos: "1",
        custo: "14 EnR",
        recarga: 2,
        duracao: 0,
        dado: "4d12+10",
        bonus: []
      },
      {
        nome: "Estado de Harmonia",
        descricao: "O lutador atinge equilíbrio absoluto entre corpo e espírito. Enquanto durar: +2 dados de Ataque e Defesa. Se iniciar turno sem Marcas, ganha 1 automaticamente.",
        tipo: "Duradoura",
        alcance: "CaC",
        alvos: "Jogador",
        custo: "15 EnR",
        recarga: 4,
        duracao: 2,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Sequência do Despertar",
        descricao: "Uma sequência veloz de golpes canaliza energia espiritual em cada impacto. Causa 3 golpes de 4d8+12 (total 12d8+36). Consumir 2 Marcas → golpe ignora Defesa.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "15 FaD",
        recarga: 2,
        duracao: 0,
        dado: "12d8+36",
        bonus: []
      },
      {
        nome: "Ruptura Interna",
        descricao: "A energia espiritual é forçada para dentro do inimigo e detonada de dentro para fora. Causa 6d12 + 250% de dano espiritual. Consome TODAS as Marcas. Cada Marca consumida → +1 dado adicional.",
        tipo: "Imediata",
        alcance: "4 m",
        alvos: "1",
        custo: "25 EnR & 10 FaD",
        recarga: 5,
        duracao: 0,
        dado: "6d12",
        bonus: []
      },
      {
        nome: "Corpo como Canal",
        descricao: "O corpo se torna um condutor direto da energia espiritual. Enquanto ativa: ataques corpo a corpo causam +2 dado de dano. Ao consumir Marcas → reduz 1 Fadiga sofrida no turno.",
        tipo: "Sustentada",
        alcance: "CaC",
        alvos: "Jogador",
        custo: "6 EnR & 1 FaD p/ T",
        recarga: 3,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Avatar do Espírito",
        descricao: "O lutador libera completamente sua essência espiritual, transcendendo limites físicos. Enquanto durar (3 T): ataques causam +4d12 de dano espiritual. Ao consumir Marca → ganha 1 ataque adicional (1x por turno). Ao terminar: fica Fraqueza 2 Turnos.",
        tipo: "Duradoura",
        alcance: "CaC",
        alvos: "Jogador",
        custo: "25 EnR & 5 FaD",
        recarga: 5,
        duracao: 3,
        dado: "0d0",
        bonus: []
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "musa",
    nome: "Musa",
    raridade: "raro",
    descricao: "A Musa é uma Barda de inspiração divina, cuja origem está ligada a um chamado das musas ou a uma conexão profunda com a arte e a beleza. Elas são a personificação da graça e da criatividade, utilizando a música, a dança e a poesia para evocar emoções e inspirar feitos heroicos. Sua jornada é de busca pela beleza e pela expressão artística, transformando a performance em uma forma de magia que afeta a alma. A capacidade de inspirar e a beleza de sua arte são as armas mais poderosas de uma Musa. Em combate, a mecânica da Musa é de suporte e controle emocional, utilizando sua Inteligência para lançar feitiços que aumentam o moral e a eficácia dos aliados. Elas podem usar sua música para acalmar a fúria dos inimigos ou para incitar a coragem nos corações dos mais fracos. A Musa pode usar sua Agilidade para dançar pelo campo de batalha, evitando ataques e posicionando-se para maximizar o alcance de sua inspiração. A vitória da Musa é uma sinfonia de emoções, onde a arte e a beleza transformam o medo em triunfo.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/XJG15jT.jpeg",
    funcoes: ["Suporting"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Nota de Abertura",
        descricao: "A Musa inicia sua performance com uma nota pura e precisa. Causa 4d8 de dano sonoro e aplica Desatento por 1 turno. Se o alvo já estiver sob efeito sonoro, a duração do efeito é aumentada em +1 turno.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "1",
        custo: "8 EnR",
        recarga: "1 T",
        duracao: "0 T",
        dado: "4d8",
        bonus: [
          "Dano sonoro",
          "Aplica Desatento",
          "Estende efeitos sonoros"
        ]
      },
      {
        nome: "Canto Sustentado",
        descricao: "A Musa mantém uma melodia contínua que ressoa no campo de batalha. Enquanto ativo: Aliados recebem +1 dado de dano adicional. Habilidades sonoras têm seu custo reduzido em –20% EnR ou FaD.",
        tipo: "Sustentada",
        alcance: "8 m",
        alvos: "no alcance",
        custo: "6 EnR p/ T",
        recarga: "3 T",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Bônus de dano",
          "Redução de custo",
          "Suporte contínuo"
        ]
      },
      {
        nome: "Eco Inspirador",
        descricao: "Uma sequência harmônica ecoa no espírito do aliado, restaurando a vida e fortalecendo sua postura defensiva. O alvo recupera 2d12+12 de vida e recebe +1 dado de Defesa até o próximo turno.",
        tipo: "Imediata",
        alcance: "5 m",
        alvos: "1",
        custo: "11 EnR",
        recarga: "2 T",
        duracao: "0 T",
        dado: "2d12+12",
        bonus: [
          "Recuperação de vida",
          "Bônus de Defesa",
          "Suporte tático"
        ]
      },
      {
        nome: "Ressonância Emocional",
        descricao: "A Musa canaliza emoções intensas em sua voz, criando uma onda sonora. Inimigos na área sofrem –1 Ataque e –1 em Testes Mentais. Aliados recebem +1 em Testes Mentais.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "3 m AOE",
        custo: "15 EnR",
        recarga: "3 T",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Penalidades em inimigos",
          "Bônus em aliados",
          "Controle emocional"
        ]
      },
      {
        nome: "Harmonia Defensiva",
        descricao: "Uma melodia suave envolve os aliados como um escudo invisível. Cada alvo protegido reduz o próximo dano recebido em 4d8. Se estiver sob efeito de Canto Sustentado, o valor reduzido é aumentado em +25%.",
        tipo: "Duradoura",
        alcance: "5 m",
        alvos: "2 inimigos",
        custo: "15 EnR",
        recarga: "3 T",
        duracao: "0 T",
        dado: "4d8",
        bonus: [
          "Redução de dano",
          "Efeito amplificado",
          "Proteção em área"
        ]
      },
      {
        nome: "Silêncio Dirigido",
        descricao: "A Musa interrompe abruptamente o fluxo sonoro ao redor do alvo, criando um vazio acústico. O alvo não pode conjurar ou utilizar habilidades por 2 turnos. Se o alvo estiver sob efeito sonoro, sofre –1 adicional em testes mentais durante o efeito.",
        tipo: "Imediata",
        alcance: "4 m",
        alvos: "1",
        custo: "17 EnR",
        recarga: "4 T",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Silenciamento de habilidades",
          "Restrição de ações",
          "Penalidade mental"
        ]
      },
      {
        nome: "Grito Dissonante",
        descricao: "Um grito carregado de dissonância explode em direção ao inimigo. Causa 6d8 + 12 de dano sonoro. Se o alvo estiver sob efeito emocional ou sonoro, fica Atordoado por 1 ação leve.",
        tipo: "Imediata",
        alcance: "5 m",
        alvos: "1",
        custo: "15 EnR",
        recarga: "3 T",
        duracao: "0 T",
        dado: "6d8+12",
        bonus: [
          "Dano sonoro forte",
          "Aplicação de Atordoado",
          "Controle de ritmo"
        ]
      },
      {
        nome: "Vibração Cortante",
        descricao: "Ondas sonoras comprimidas avançam em linha, vibrando como lâminas invisíveis. Causa 3d12 + 4d8 de dano sonoro em cada alvo atingido. Alvos sob efeito de controle recebem +1 dado adicional de dano.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "3",
        custo: "15 EnR",
        recarga: "4 T",
        duracao: "0 T",
        dado: "3d12+4d8",
        bonus: [
          "Dano em múltiplos alvos",
          "Dano aumentado em controle",
          "Penetração sonora"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Crescendo da Dor",
        descricao: "A Musa intensifica sua melodia conforme o sofrimento do alvo aumenta. Causa 6d12 + 8 de dano sonoro. Se o alvo já sofreu dano sonoro neste combate, causa +1 dado adicional.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "1",
        custo: "19 EnR",
        recarga: "5 T",
        duracao: "0 T",
        dado: "6d12+8",
        bonus: [
          "Dano escalável",
          "Intensificação com sofrimento",
          "Ataque de punição"
        ]
      },
      {
        nome: "Voz Dominante",
        descricao: "A presença da Musa se impõe através de sua voz. Enquanto ativa: Inimigos sofrem –9 Defesa e não podem realizar reações complexas. Se permanecer ativa por 2 turnos, aplica –1 adicional em Precisão.",
        tipo: "Sustentada",
        alcance: "6 m",
        alvos: "AOE",
        custo: "7 EnR",
        recarga: "4 T",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Penalidade massiva de Defesa",
          "Restrição de reações",
          "Efeito progressivo"
        ]
      },
      {
        nome: "Nota Final",
        descricao: "A Musa encerra sua execução com uma nota perfeita. Causa 8d12 + (1/4 INT) de dano sonoro. Se derrotar o alvo, recupera 2d12 + 6 de Energia.",
        tipo: "Imediata",
        alcance: "4 m",
        alvos: "1",
        custo: "25 EnR",
        recarga: "6 T",
        duracao: "0 T",
        dado: "8d12",
        bonus: [
          "Dano finalizador",
          "Recuperação em eliminação",
          "Fechamento épico"
        ]
      },
      {
        nome: "Ária do Apocalipse",
        descricao: "A Musa entoa uma ária carregada de emoção absoluta. Inimigos sofrem 10d12 de dano sonoro ao ativar e 1d12 + (1/5 INT) no turno seguinte. Aliados na área recebem +2 Precisão durante a duração.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "AOE",
        custo: "29 EnR",
        recarga: "5 T",
        duracao: "0 T",
        dado: "10d12",
        bonus: [
          "Dano apocalíptico",
          "Dano continuado",
          "Bônus de Precisão para aliados"
        ]
      }
    ],
    habilidadesExtremas: [
      {
        nome: "Sinfonia Celestial",
        descricao: "A Musa invoca uma sinfonia dos céus que envolve todo o campo de batalha. Todos os inimigos sofrem 12d12 de dano sonoro e ficam Atordoados por 2 turnos. Aliados recebem Regeneração (recuperam 2d10 Energia por turno durante 3 turnos).",
        tipo: "Imediata",
        alcance: "12 m",
        alvos: "AOE",
        custo: "35 EnR",
        recarga: "7 T",
        duracao: "3 T",
        dado: "12d12",
        bonus: [
          "Dano extremo em AOE",
          "Atordoamento massivo",
          "Regeneração para aliados"
        ]
      }
    ]
  },
  {
    id: "flautista",
    nome: "Flautista",
    raridade: "mitico",
    descricao: "O Flautista de Hamelin é um Bardo especializado em controle de criaturas, cuja origem está ligada a lendas de manipulação sonora e encantamento. Eles são mestres em tocar melodias que afetam a mente dos animais e das criaturas menores, forçando-os a obedecer a seus comandos. Sua jornada é de busca por instrumentos mágicos e por melodias ancestrais, utilizando a Inteligência para compor canções de controle. A capacidade de comandar hordas de criaturas e a manipulação sonora são as especialidades de um Flautista Hamelin. A mecânica de combate do Flautista Hamelin é de controle de horda e suporte, utilizando sua Inteligência para invocar e comandar animais e vermes para atacar o inimigo. Eles se mantêm na retaguarda, protegidos por seus lacaios, enquanto tocam melodias que aumentam a ferocidade de suas criaturas ou paralisam oponentes. O Flautista pode usar sua Agilidade para se mover rapidamente e evitar o confronto direto, garantindo que sua performance não seja interrompida. A vitória do Flautista Hamelin é uma demonstração de controle mental, onde a música transforma a fauna em um exército.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/VesJy6Z.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "2d4+5",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+7",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Melodia do Convite",
        descricao: "O Flautista executa uma sequência suave e curiosa, despertando interesse involuntário no alvo. O alvo realiza Teste Mental (Obstáculo –9). Fracasso: sofre Encantado (+1). Sucesso: não sofre efeito. Encantado ativa movimento incontrolável em direção ao Flautista.",
        tipo: "Imediata",
        alcance: "10m",
        alvos: "1-3",
        custo: "5 FaD",
        recarga: "1",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Controle mental", "Movimento forçado", "Escalável"]
      },
      {
        nome: "Ritmo Hipnótico",
        descricao: "Uma batida contínua e hipnotizante que prende a mente. Inimigos em alcance: Teste Mental. Fracasso: –2 Precisão, –2 Defesa. Duração aumenta a cada Encantado no alvo (+1 turno por nível).",
        tipo: "Sustentada",
        alcance: "8m",
        alvos: "AOE",
        custo: "9 EnR",
        recarga: "2",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Debuff", "Sustentada", "Escalação"]
      },
      {
        nome: "Passos Involuntários",
        descricao: "A música força o corpo a dançar contra sua vontade. Alvo marcado com Encantado: afasta-se ou aproxima-se até 5m (escolha do Flautista). Cada nível de Encantado aumenta distância em +2m. Alvo sofre –1 Evasão durante este movimento.",
        tipo: "Imediata",
        alcance: "8m",
        alvos: "1",
        custo: "7 EnR",
        recarga: "2",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Controle de posição", "Movimento forçado", "Debuff"]
      },
      {
        nome: "Distração Melódica",
        descricao: "Uma nota bela e inquietante interrompe pensamentos. Inimigo: não pode usar reações até próximo turno. Se o alvo tem Encantado: também sofre –1 dado em Testes de Defesa. Ativa automático se alvo tem 3 Encantado.",
        tipo: "Imediata",
        alcance: "12m",
        alvos: "1",
        custo: "6 FaD",
        recarga: "1",
        duracao: "1 T",
        dado: "N/A",
        bonus: ["Negação de reação", "Debuff condicional", "Escalável"]
      },
      {
        nome: "Vínculo Sonoro",
        descricao: "O Flautista conecta sua melodia à essência do alvo, criando um liame invisível. Alvo marca com Encantado e fica preso em movimento restrito (pode se mover no máximo 3m do Flautista). Qualquer ataque contra o alvo sofre +1 Precisão adicional.",
        tipo: "Duradoura",
        alcance: "10m",
        alvos: "1",
        custo: "13 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Controle de movimento", "Amplificação", "Sinergia"]
      },
      {
        nome: "Crescente da Submissão",
        descricao: "Cada batida aumenta a influência musical sobre o alvo. Alvo recebe Encantado adicional (+1 nível). Se já tem 3 Encantado: o alvo não pode agir no turno seguinte (paralisia mental). Remove 1 Encantado após paralisia.",
        tipo: "Imediata",
        alcance: "8m",
        alvos: "1",
        custo: "11 EnR",
        recarga: "2",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Escalação encantado", "Controle completo", "Debilitação"]
      },
      {
        nome: "Marcha do Flautista",
        descricao: "O Flautista caminha e qualquer alma encantada o segue obrigatoriamente. Move até 7m e todos inimigos Encantados devem acompanhar (teste Mental para ignorar com penalidade –2). Flautista recebe +1 Evasão durante movimento.",
        tipo: "Imediata",
        alcance: "—",
        alvos: "Jogador + Encantados",
        custo: "8 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Mobilidade", "Reposicionamento forçado", "Evasão"]
      },
      {
        nome: "Comando Harmônico",
        descricao: "Uma nota pura que ordena obediência absoluta. Alvo Encantado: Teste Mental (Obstáculo reduz com Encantado: –2 por nível). Fracasso: alvo segue 1 comando simples (atacar aliado, soltar arma, etc) no turno seguinte.",
        tipo: "Imediata",
        alcance: "12m",
        alvos: "1",
        custo: "15 EnR",
        recarga: "3",
        duracao: "1 T",
        dado: "N/A",
        bonus: ["Controle total", "Manipulação", "Escalável"]
      },
      {
        nome: "Coro das Bestas",
        descricao: "A melodia invoca vozes de criaturas abertas à influência. Invoca 2-3 bestas menores encantadas que agem no turno do Flautista. Cada besta: 2d6 ataque, 1d6+3 dano. Duram até fim do combate ou terem 10 HP destruído.",
        tipo: "Duradoura",
        alcance: "10m",
        alvos: "Invocação",
        custo: "18 EnR",
        recarga: "4",
        duracao: "Sustentada",
        dado: "N/A",
        bonus: ["Invocação", "Controle minion", "Amplificação"]
      },
      {
        nome: "Marionete Viva",
        descricao: "O alvo torna-se extensão viva do Flautista. Alvo com 3 Encantado: o Flautista controla suas ações completamente. Alvo ataca como se fosse aliado do Flautista. Flautista pode canalizar através dele (+1 Magia para qualquer habilidade através da marionete).",
        tipo: "Duradoura",
        alcance: "8m",
        alvos: "1",
        custo: "20 EnR",
        recarga: "5",
        duracao: "3 T",
        dado: "N/A",
        bonus: ["Controle total", "Extensão", "Amplificação"]
      },
      {
        nome: "Nota de Ruptura",
        descricao: "Uma nota discordante que rompe a mente com harmonia quebrada. Causa 5d8+8 dano mental. Se alvo tem Encantado: causa +1 dado adicional. Alvo sofre Confusão (próximo turno: –2 Ataque, –2 Defesa).",
        tipo: "Imediata",
        alcance: "10m",
        alvos: "1-2",
        custo: "12 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "2d12",
        bonus: ["Dano mental", "Confusão", "Escalável"]
      },
      {
        nome: "Procissão do Abismo",
        descricao: "O Flautista toca e toda realidade segue seu ritmo — uma procissão de encantados caminha hacia o abismo. Todos inimigos Encantados ganham movimento forçado em direção escolhida pelo Flautista (até 8m). Se chegarem ao abismo/precipício: sofrem 6d12 queda. Flautista imune.",
        tipo: "Sustentada",
        alcance: "15m",
        alvos: "AOE",
        custo: "25 EnR",
        recarga: "5",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Controle de campo", "Dano ambiental", "Limpeza"]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "violinista",
    nome: "Violinista",
    raridade: "raro",
    descricao: "O Violinn, ou Violinista, é um Bardo que canaliza a emoção pura através de seu instrumento, cuja origem está nas escolas de música que buscam a perfeição técnica e expressiva. Eles são mestres em evocar sentimentos intensos, utilizando a melodia para causar dor, alegria, medo ou fúria no coração de quem os ouve. Sua jornada é de aprimoramento musical e de busca pela ressonância perfeita, transformando o som em uma arma emocional. A capacidade de manipular as emoções e a intensidade de sua performance são as armas de um Violinn. Em combate, a mecânica do Violinn é de dano emocional e controle de área, utilizando sua Inteligência para lançar feitiços que afetam a mente e o corpo. Eles podem tocar melodias que causam dano psíquico, paralisam o inimigo com medo ou curam aliados com canções de esperança. O Violinn pode usar sua Percepção para ler as emoções do inimigo e aplicar a melodia que causa o efeito mais devastador no momento exato. A vitória do Violinn é uma catarse emocional, onde o inimigo é derrotado pela força avassaladora do sentimento.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/PLUDYLA.jpeg",
    funcoes: ["Suporting"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Acorde Inicial",
        descricao: "O Violinista inicia sua execução com um arco firme e preciso. Causa 4d12 + 6 de dano sonoro. Aplica Ressonância (1) no alvo.",
        tipo: "Imediata",
        alcance: "4 m",
        alvos: "1",
        custo: "15 EnR",
        recarga: "2 T",
        duracao: "0 T",
        dado: "4d12+6",
        bonus: [
          "Dano sonoro inicial",
          "Aplica Ressonância",
          "Marca o alvo"
        ]
      },
      {
        nome: "Passagem Rítmica",
        descricao: "Guiado pelo ritmo da própria melodia, o Violinista desliza pelo campo de batalha. Move-se até 4 metros sem provocar reações. Se usado após causar dano sonoro, gera Ressonância (1) adicional no último alvo atingido.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "Próprio",
        custo: "7 EnR",
        recarga: "1 T",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Reposicionamento fluido",
          "Ressonância continuada",
          "Mobilidade tática"
        ]
      },
      {
        nome: "Vibrato Cortante",
        descricao: "O Violinista intensifica a vibração de suas notas, criando ondas sonoras instáveis. Causa 4d10 de dano sonoro em cada alvo. Alvos com Ressonância sofrem +2 dados de dano adicional.",
        tipo: "Imediata",
        alcance: "5 m",
        alvos: "2",
        custo: "15 EnR",
        recarga: "2 T",
        duracao: "0 T",
        dado: "4d10",
        bonus: [
          "Dano em múltiplos alvos",
          "Dano amplificado com Ressonância",
          "Oscilação de defesa"
        ]
      },
      {
        nome: "Ritmo Acelerado",
        descricao: "O Violinista entra em um estado de execução contínua. Enquanto ativa: Recebe +1 dado de ataque. Sempre que acertar um inimigo diferente no turno, aplica Ressonância (1). Se atingir 2 ou mais alvos no mesmo turno, recebe +1 Precisão no próximo.",
        tipo: "Sustentada",
        alcance: "CaC",
        alvos: "Próprio",
        custo: "7 EnR p/ T",
        recarga: "3 T",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Bônus de ataque",
          "Ressonância progressiva",
          "Precisão escalável"
        ]
      },
      {
        nome: "Nota Perfurante",
        descricao: "Uma nota extremamente aguda é liberada em um único ponto, atravessando defesas. Causa 3d12 + 12 de dano sonoro. Se consumir Ressonância (2), ignora completamente a Defesa do alvo.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "1",
        custo: "19 EnR",
        recarga: "2 T",
        duracao: "0 T",
        dado: "3d12+12",
        bonus: [
          "Dano perfurante",
          "Ignora Defesa com Ressonância",
          "Precisão absoluta"
        ]
      },
      {
        nome: "Estado de Concerto",
        descricao: "O Violinista entra em um estado de performance máxima. Enquanto ativa: Todos os ataques causam +3d12 de dano sonoro adicional. O limite máximo de Ressonância por alvo aumenta em +1. Sempre que consumir Ressonância, recebe +1 em bônus de rolagem no próximo ataque.",
        tipo: "Sustentada",
        alcance: "7 m",
        alvos: "Área",
        custo: "11 EnR p/ T",
        recarga: "5 T",
        duracao: "0 T",
        dado: "3d12",
        bonus: [
          "Dano amplificado",
          "Limite de Ressonância aumentado",
          "Bônus de rolagem"
        ]
      },
      {
        nome: "Glissando Fatal",
        descricao: "O arco desliza rapidamente pelas cordas. Causa 8d8 + 12 de dano sonoro. Se consumir Ressonância (1), causa +2d6 adicional e aplica –1 dado de Defesa no alvo por 2 turnos.",
        tipo: "Imediata",
        alcance: "5 m",
        alvos: "1",
        custo: "25 EnR",
        recarga: "5 T",
        duracao: "0 T",
        dado: "8d8+12",
        bonus: [
          "Dano devastador",
          "Dano extra com Ressonância",
          "Penalidade de Defesa"
        ]
      },
      {
        nome: "Corda Rompida",
        descricao: "O Violinista rompe deliberadamente uma corda, liberando uma explosão caótica. Causa 350% (AtK) de dano sonoro em área. Alvos com Ressonância sofrem 4d12 de dano adicional. Se pelo menos um alvo possuir Ressonância (3+), aplica Desorientado por 1 turno.",
        tipo: "Imediata",
        alcance: "3 m",
        alvos: "AOE",
        custo: "17 EnR",
        recarga: "2 T",
        duracao: "0 T",
        dado: "350%",
        bonus: [
          "Explosão caótica",
          "Dano extra com Ressonância",
          "Desorientação em massa"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "menestrel",
    nome: "Menestrel",
    raridade: "epico",
    descricao: "O Menestrel é o Bardo clássico, cuja origem está nas cortes e nas tavernas, sendo o mestre da narrativa e da inspiração através da palavra e da canção. Eles são a memória viva da história, utilizando sua Inteligência e carisma para entreter, informar e motivar as massas. Sua jornada é de viagem e coleta de histórias, transformando a experiência humana em baladas e poemas épicos. A capacidade de inspirar e a eloquência são as ferramentas primárias de um Menestrel. Em combate, a mecânica do Menestrel é de suporte e inspiração, utilizando sua Inteligência para conceder bônus de ataque, defesa e moral aos aliados. Eles podem usar suas canções para desmoralizar o inimigo, contando histórias de suas falhas e fraquezas, ou para curar ferimentos leves. O Menestrel pode usar sua Agilidade para se mover pelo campo de batalha, garantindo que sua voz alcance todos os aliados. A vitória do Menestrel é uma celebração, onde a história da batalha é transformada em uma lenda de triunfo.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/lNPZR54.png",
    funcoes: ["Suporting"],
    atributos: {
      forca: "2d4+6",
      vitalidade: "2d4+6",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Balada de Abertura",
        descricao: "O Menestrel inicia a batalha com uma melodia envolvente que dita o ritmo do confronto. Aliados na área recebem +1 em testes até o próximo turno. Gera 1 Verso.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "3 m AOE",
        custo: "9 EnR",
        recarga: 1,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Ritmo Constante",
        descricao: "Uma cadência contínua mantém os aliados sincronizados em combate. Enquanto ativa: aliados recebem +1 Precisão. Sempre que um aliado agir sob efeito de buff do Menestrel, gera 1 Verso (máx. 3 por turno).",
        tipo: "Sustentada",
        alcance: "6 m",
        alvos: "Aliados na área",
        custo: "9 EnR p/ T",
        recarga: 3,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Passo no Ritmo",
        descricao: "Com um passo ágil, o Menestrel guia o movimento de um aliado como parte da música. O alvo se move até 3 m sem provocar reação (+3 Reação).",
        tipo: "Imediata",
        alcance: "4 m",
        alvos: "1",
        custo: "11 EnR",
        recarga: 1,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Refrão Marcante",
        descricao: "Um refrão poderoso ecoa no campo de batalha, elevando o espírito dos aliados. Aliados recebem +2 dado de Ataque neste turno.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "AOE",
        custo: "11 EnR",
        recarga: 2,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Pausa Dramática",
        descricao: "O silêncio repentino quebra o fluxo dos inimigos, criando uma abertura crítica. Inimigos sofrem Desatento por 1 turno.",
        tipo: "Imediata",
        alcance: "3 m",
        alvos: "AOE",
        custo: "15 EnR",
        recarga: 4,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Improviso Perigoso",
        descricao: "O Menestrel altera o 'roteiro' da batalha no último instante. O alvo deve refazer seu último teste.",
        tipo: "Imediata",
        alcance: "5 m",
        alvos: "1",
        custo: "15 EnR",
        recarga: 4,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Coro dos Companheiros",
        descricao: "Aliados entram em harmonia com o Menestrel, transformando combate em sinfonia coletiva. Enquanto ativa: a cada falha aliado → recupera 1d8+6 Energia. A cada acertos aliados → gera 1 Verso.",
        tipo: "Sustentada",
        alcance: "6 m",
        alvos: "7 m AOE",
        custo: "9 EnR p/ T",
        recarga: 5,
        duracao: 0,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "História que Inspira",
        descricao: "O Menestrel narra feitos lendários, preenchendo os aliados com coragem e propósito. Alvos recebem: +1 Precisão e +2 em testes de Vontade por 2 Turnos.",
        tipo: "Duradoura",
        alcance: "6 m",
        alvos: "2",
        custo: "15 EnR",
        recarga: 4,
        duracao: 2,
        dado: "0d0",
        bonus: []
      },
      {
        nome: "Verso Final",
        descricao: "O Menestrel encerra um trecho da batalha com um golpe sonoro devastador. Causa 4d12+12 de dano sonoro. Cada Verso → +1 dados de dano.",
        tipo: "Imediata",
        alcance: "4 m",
        alvos: "1",
        custo: "17 EnR",
        recarga: 6,
        duracao: 0,
        dado: "4d12+12",
        bonus: []
      },
      {
        nome: "Canção do Último Ato",
        descricao: "O clímax da apresentação transforma aliados em protagonistas de uma lenda viva. Durante 3 T: +2 dados de dano, +1 dados de Defesa e +3 em testes.",
        tipo: "Duradoura",
        alcance: "6 m",
        alvos: "AOE",
        custo: "29 EnR",
        recarga: 5,
        duracao: 3,
        dado: "0d0",
        bonus: []
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "many_faced_god",
    nome: "The Many Faced God",
    raridade: "mitico",
    descricao: "O The Many Faced God, ou O Deus de Muitas Faces, é uma classe de origem misteriosa e ligada a um culto de assassinos e adoradores da morte. Eles são mestres da identidade e do disfarce, capazes de assumir a aparência e a voz de qualquer pessoa, transformando-se em fantasmas vivos. Sua jornada é de anonimato e serviço à morte, utilizando a Inteligência e a Agilidade para se infiltrar e eliminar alvos de alto valor. A capacidade de mudar de identidade e a devoção à morte são as características sombrias de um The Many Faced God. Em combate, a mecânica do The Many Faced God é de infiltração e ataque surpresa, utilizando sua Agilidade para se mover sem ser detectado e sua Inteligência para planejar. Eles se especializam em venenos e em ataques furtivos, buscando o momento perfeito para desferir um golpe fatal que não pode ser rastreado. O The Many Faced God pode usar sua habilidade de disfarce para se aproximar do alvo sem levantar suspeitas, transformando a eliminação em um ato de teatro. A vitória do The Many Faced God é a conclusão silenciosa de um contrato, onde a morte chega de uma face inesperada.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/FXuvC5A.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "1d4+4",
      vitalidade: "2d4+6",
      agilidade: "2d6+10",
      inteligencia: "1d4+4",
      percepcao: "1d4+2",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Sussurro do Deus Sem Rosto",
        descricao: "O Deus Sem Rosto sussurra diretamente à mente do alvo, invocando a presença de algo além da morte. Alvo sofre Teste Mental com penalidade –3. Fracasso: –2 Defesa, –1 Precisão. Sucesso: –1 Defesa apenas. Alvo é marcado com Instabilidade de Identidade (+1).",
        tipo: "Imediata",
        alcance: "10m",
        alvos: "1",
        custo: "5 EnR",
        recarga: "1",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Instabilidade", "Debuff", "Controle"]
      },
      {
        nome: "Lâmina da Oferenda",
        descricao: "Uma lâmina sussurra ao ser desembainhada — é oferta à morte. Causa 4d10+12 de dano. Aplica Veneno (2d8 dano por turno, 2 turnos). Se alvo está com Instabilidade: causa +1 dado adicional e o Veneno dura +1 turno.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "6 EnR",
        recarga: "2",
        duracao: "0 T",
        dado: "4d10+12",
        bonus: ["Veneno escalável", "Sinergia Instabilidade", "Dano persistente"]
      },
      {
        nome: "Marca da Morte Aceita",
        descricao: "O alvo percebe seu destino — está marcado para morrer pela vontade divina. Alvo sofre –2 Defesa, –1 dado de dano ao atacar. Todos ataques contra o alvo recebem +1 Precisão. A marca persiste até ser substituída por outro alvo ou durar 4 turnos.",
        tipo: "Duradoura",
        alcance: "12m",
        alvos: "1",
        custo: "7 EnR",
        recarga: "3",
        duracao: "4 T",
        dado: "N/A",
        bonus: ["Marca coletiva", "Debuff", "Amplificação aliado"]
      },
      {
        nome: "Golpe dos Cem Rostos",
        descricao: "O assassino se move como se fossem múltiplas entidades, atacando de ângulos impossíveis. Realiza 3 ataques rápidos sucessivos: 3d8 cada (total 9d8+18). Alvo sofre –1 Reação até próximo turno. Se todos os ataques acertam: ignora 1 ponto de Evasão.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "11 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "3d8",
        bonus: ["Multiplicador ataque", "Debuff reação", "Bônus acertos"]
      },
      {
        nome: "Execução Silenciosa",
        descricao: "Um golpe sussurrado que ninguém ouve — apenas o silêncio da morte. Se alvo está abaixo de 40% HP: causa 7d12+15 dano. Caso contrário: causa 4d12+12. Se mata o alvo: recupera 50% Energia e próxima habilidade tem recarga –1.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "13 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "7d12+15",
        bonus: ["Execução escalável", "Sustain", "Reset"]
      },
      {
        nome: "O Nome Foi Pago",
        descricao: "O assassino oferece o nome do alvo ao Deus da Morte — uma transação feita. Alvo recebe Instabilidade de Identidade (+1). –2 Vontade contra próximas habilidades. The Many Faced God recupera 1d12+6 Energia por turno enquanto ativo.",
        tipo: "Duradoura",
        alcance: "9m",
        alvos: "1",
        custo: "9 EnR",
        recarga: "2",
        duracao: "3 T",
        dado: "N/A",
        bonus: ["Instabilidade", "Sustain de energia", "Debuff Mental"]
      },
      {
        nome: "Máscara Tomada",
        descricao: "The Many Faced God assume a identidade completa do alvo — seus trejeitos, voz, até sua alma. Recebe +2 Defesa. Pode usar uma habilidade do alvo (à escolha) como se fosse sua. Inimigos sofrem –3 Precisão contra você. Dura 2 turnos ou até ser atacado.",
        tipo: "Duradoura",
        alcance: "8m",
        alvos: "1",
        custo: "15 FaD",
        recarga: "4",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Disfarce total", "Cópia de habilidade", "Evasão amplificada"]
      },
      {
        nome: "Passos Sem Identidade",
        descricao: "Quem existe sem uma face? O assassino se move como um fantasma, invisível às percepções normais. Teleporte até 8m ignorando terreno e obstáculos. Próximo ataque recebe +2 Precisão e +1 dado de dano. Pode atacar múltiplos alvos antes de se tornar visível.",
        tipo: "Imediata",
        alcance: "—",
        alvos: "Jogador",
        custo: "11 EnR",
        recarga: "2",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Invisibilidade", "Mobilidade suprema", "Amplificação de ataque"]
      },
      {
        nome: "Reflexo do Outro",
        descricao: "O assassino reflete a agressão através da identidade roubada do alvo. Qualquer ataque contra você é refletido: o atacante sofre 50% do dano que tentou causar. Se você está com Máscara Tomada: reflexo causa 100% do dano. AOE (6m).",
        tipo: "Duradoura",
        alcance: "6m",
        alvos: "AOE",
        custo: "13 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Contra-ataque escalável", "Sinergia Máscara", "Defesa reativa"]
      },
      {
        nome: "Roubo de Identidade",
        descricao: "O Deus de Muitas Faces rouba a identidade do alvo completamente — ela agora lhe pertence. Alvo recebe Instabilidade de Identidade +3 (máximo). –3 Defesa, –2 em todos testes. The Many Faced God copia completamente a aparência e pode usar qualquer habilidade do alvo.",
        tipo: "Imediata",
        alcance: "10m",
        alvos: "1",
        custo: "19 EnR",
        recarga: "5",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Instabilidade máxima", "Cópia total", "Debilitação completa"]
      },
      {
        nome: "Rosto Quebrado",
        descricao: "Uma desfiguração que não é apenas física — é existencial. O assassino ataca a própria identidade. Causa 6d12+18 dano. Alvo recebe Instabilidade de Identidade +2 permanente (até fim do combate). –2 Defesa constante pelo resto do combate.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "17 FaD",
        recarga: "4",
        duracao: "0 T",
        dado: "6d12+18",
        bonus: ["Dano existencial", "Instabilidade permanente", "Debuff duradouro"]
      },
      {
        nome: "Ninguém",
        descricao: "O usuário deixa de existir como entidade reconhecível. Não pode ser alvo direto por habilidades de alvo único (exceto AOE). +3 Evasão e +2 Reação. Realiza 1 ataque automático crítico (dano dobrado). Todos ataques enquanto ativo ignoram Defesa. Próximo turno: recupera 75% Energia.",
        tipo: "Duradoura",
        alcance: "—",
        alvos: "Jogador",
        custo: "25 EnR",
        recarga: "6",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Invisibilidade absoluta", "Crítico garantido", "Invulnerabilidade parcial"]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "destroyer",
    nome: "Destroyer",
    raridade: "lendario",
    descricao: "O Destroyer, ou Destruidor, é um guerreiro focado na aniquilação total, cuja origem está nas linhas de frente de grandes guerras e na busca por armas de poder massivo. Eles são mestres em armas pesadas e explosivos, utilizando a Força e a Vitalidade para suportar o peso de seu arsenal e o dano da batalha. Sua jornada é de violência e demolição, vendo a luta como uma oportunidade para liberar o máximo de poder destrutivo possível. A capacidade de causar dano em área e a resistência a ataques são as marcas de um Destroyer. A mecânica de combate do Destroyer é de dano de área e atrito, utilizando sua Força para desferir golpes que atingem múltiplos inimigos e sua Vitalidade para resistir. Eles se especializam em armas de duas mãos, como martelos e machados gigantes, e no uso de explosivos para limpar o campo de batalha. O Destroyer pode entrar em um estado de fúria controlada, aumentando seu dano e sua resistência, transformando-se em um furacão de destruição. A vitória do Destroyer é a eliminação total do inimigo, onde o campo de batalha é deixado em ruínas.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/wufCRo5.jpeg",
    funcoes: ["Tank"],
    atributos: {
      forca: "2d6+12",
      vitalidade: "2d6+12",
      agilidade: "1d4+4",
      inteligencia: "1d4+2",
      percepcao: "1d4+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Golpe Sísmico",
        descricao: "O Destroyer descarrega sua força no solo através do alvo, gerando uma onda de impacto concentrada. Causa 4d8+12 de dano. Gera 1 Carga de Impacto. Se o alvo já sofreu controle (derrubado/lento), causa +1d8 adicional.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "5 FaD",
        recarga: "1",
        duracao: "0 T",
        dado: "4d8+12",
        bonus: ["Geração de Carga", "Dano contra controlado", "Impacto concentrado"]
      },
      {
        nome: "Martelo Descendente",
        descricao: "O Destroyer salta e colapsa o chão com o peso do próprio corpo e arma. Causa 2d12 de dano em área. Aplica Lentidão leve (–2 movimento). Converte altura de queda em dano adicional (até +2d12). Se consumir 1 Carga de Impacto: aplica Derrubado (Teste -9).",
        tipo: "Imediata",
        alcance: "3 m",
        alvos: "AOE (3m)",
        custo: "7 EnR",
        recarga: "2",
        duracao: "0 T",
        dado: "2d12",
        bonus: ["Dano em área", "Controle com Carga", "Conversão de altura"]
      },
      {
        nome: "Impacto Devastador",
        descricao: "Um golpe que quebra postura e estrutura defensiva. Causa 3d12+12. Aplica –1 dado de Defesa por 2 turnos. Se o alvo estiver Derrubado: aumenta para –2 dados de Defesa. Se consumir 1 Carga: aplica também –1 Precisão.",
        tipo: "Duradoura",
        alcance: "CaC",
        alvos: "1",
        custo: "5 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "3d12+12",
        bonus: ["Debuff de Defesa", "Amplificação contra derrubado", "Consumo de Carga"]
      },
      {
        nome: "Colisão Titânica",
        descricao: "O Destroyer avança como um aríete vivo, esmagando tudo à frente. Causa 5d12 de dano. Empurra inimigos até 4m. Teste -9 ou ficam Derrubados. Se houver 2+ Cargas de Impacto: causa +2d8 adicional e destrói formação inimiga (–2 Reação).",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "AOE",
        custo: "15 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "5d12",
        bonus: ["Empurrão", "Crowd control", "Amplificação com Carga"]
      },
      {
        nome: "Quebra Montanha",
        descricao: "Um golpe de execução bruta focado em aniquilar defesas. Causa 5d12+12. Ignora Defesa total. +2d12 se alvo estiver Derrubado. Consome todas as Cargas: +1d12 por carga.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "17 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "5d12+12",
        bonus: ["Ignorar Defesa", "Amplificação contra derrubado", "Consumo total de Carga"]
      },
      {
        nome: "Fim do Terreno",
        descricao: "O Destroyer destrói completamente a estrutura do campo de batalha. Causa 8d12+12. Cria terreno difícil por 2 turnos. Inimigos sofrem –2 Reação. Se consumir 2+ Cargas: área aplica dano contínuo (4d8 por turno).",
        tipo: "Duradoura",
        alcance: "5 m",
        alvos: "AOE (4m)",
        custo: "25 EnR",
        recarga: "5",
        duracao: "2 T",
        dado: "8d12+12",
        bonus: ["Dano massivo", "Modificação de terreno", "Dano contínuo com Carga"]
      },
      {
        nome: "Postura Inabalável",
        descricao: "O Destroyer fixa sua base e se torna impossível de deslocar. +1 dado de Defesa adicional. Imune a empurrões leves. Para cada Carga de Impacto ativa: ganha +1 Defesa adicional (máx. +3).",
        tipo: "Sustentada",
        alcance: "0 m",
        alvos: "Jogador",
        custo: "3 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Defesa aprimorada", "Imunidade a empurrão", "Escalável com Carga"]
      },
      {
        nome: "Couraça de Impacto",
        descricao: "O corpo do Destroyer absorve impacto e devolve energia cinética. Ganha 2d6 de Defesa. Sempre que recebe ataque corpo a corpo: gera 1 Carga de Impacto. Se já tiver cargas: reduz dano recebido em –1d6 adicional por carga.",
        tipo: "Duradoura",
        alcance: "0 m",
        alvos: "Jogador",
        custo: "3 FaD",
        recarga: "3",
        duracao: "3 T",
        dado: "2d6",
        bonus: ["Defesa reativa", "Geração de Carga", "Redução de dano escalável"]
      },
      {
        nome: "Avanço Esmagador",
        descricao: "O Destroyer atravessa o campo como um projétil vivo. Move até 9m. Empurra inimigos leves. Causa 2d12 de dano por colisão. Se colidir com inimigo Derrubado: causa +2d12 adicional.",
        tipo: "Imediata",
        alcance: "9 m",
        alvos: "linha",
        custo: "9 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "2d12",
        bonus: ["Mobilidade", "Empurrão", "Amplificação contra derrubado"]
      },
      {
        nome: "Zona de Ruína",
        descricao: "A presença do Destroyer distorce o ritmo da batalha. Inimigos: –30 Prontidão e –2 Reação. Sempre que um inimigo cair ou for Derrubado: gera 1 Carga. Com 3+ Cargas: inimigos também sofrem –1 dado de Defesa.",
        tipo: "Sustentada",
        alcance: "5 m",
        alvos: "AOE (3m)",
        custo: "10 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Debuff de iniciativa", "Geração de Carga", "Debuff de Defesa escalável"]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "heroi",
    nome: "Herói",
    raridade: "lendario",
    descricao: "O Herói é uma classe lendária, cuja origem está nas profecias e nos momentos de grande crise, sendo um indivíduo que transcende as limitações humanas. Eles são a personificação da esperança e da coragem, utilizando uma combinação de Força, Agilidade e Inteligência para superar qualquer desafio. Sua jornada é de sacrifício e glória, buscando proteger os inocentes e derrotar as grandes ameaças que aterrorizam o mundo. A capacidade de inspirar e a versatilidade em todas as formas de combate são as características de um verdadeiro Herói. A mecânica de combate do Herói é de versatilidade e poder equilibrado, utilizando sua Vitalidade e Inteligência para se adaptar a qualquer situação. Eles podem usar qualquer arma ou magia com proficiência, alternando entre ataque, defesa e suporte conforme a necessidade da batalha. O Herói pode invocar um poder especial, uma manifestação de sua vontade e coragem, que lhes concede um bônus temporário de força e resistência. A vitória do Herói é a salvação do dia, um ato de bravura que se torna uma lenda para as gerações futuras.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/Xzqzn9m.jpeg",
    funcoes: ["Hibrid DPS", "Off-Tank", "OFF Suporting"],
    atributos: {
      forca: "2d6+10",
      vitalidade: "2d6+10",
      agilidade: "2d4+6",
      inteligencia: "2d4+6",
      percepcao: "2d4+6",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Impulso Heroico",
        descricao: "O Herói gera Impulso Heroico (IH): +1 ao acertar ataque, +1 ao proteger aliado, +1 ao sobreviver a dano significativo. Máximo: 5 IH. Algumas habilidades consomem IH para efeitos extras.",
        tipo: "Duradoura",
        alcance: "CaC",
        alvos: "1",
        custo: "0 FaD",
        recarga: "0",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Geração de Impulso", "Consumível para bônus", "Stack limitado"]
      },
      {
        nome: "Golpe Determinado",
        descricao: "Um ataque firme e direto, sem hesitação. Causa 4d8 + 6 de dano. Se o Herói possuir IH, pode consumir 1 para: ganhar +1 dado de dano ou +1 Precisão. Se derrotar o alvo: gera +2 IH.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "7 FaD",
        recarga: "1",
        duracao: "0 T",
        dado: "4d8+6",
        bonus: ["Consumo de IH", "Amplificação opcional", "Geração em kill"]
      },
      {
        nome: "Passo do Protagonista",
        descricao: "Movimento fluido e sempre no lugar certo. Move até 6m sem provocar reação. Se terminar adjacente a inimigo: ganha +1 IH. Próximo ataque recebe +1 bônus de rolagem.",
        tipo: "Imediata",
        alcance: "6m",
        alvos: "1",
        custo: "3 FaD",
        recarga: "1",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Mobilidade", "Geração de IH", "Bônus de ataque"]
      },
      {
        nome: "Espírito Inabalável",
        descricao: "A determinação impede a queda. Recebe +1 dado de Defesa. +2 Testes de Obstáculo. Se cair abaixo de 50% HP: ganha +2 IH imediatamente.",
        tipo: "Duradoura",
        alcance: "0m",
        alvos: "Jogador",
        custo: "9 FaD",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Defesa aprimorada", "Bônus de teste", "Geração em baixa vida"]
      },
      {
        nome: "Proteção Instintiva",
        descricao: "O Herói reage antes mesmo de pensar. Reduz o dano recebido pelo aliado em 2d10. Gera +1 IH ao proteger.",
        tipo: "Imediata",
        alcance: "5m",
        alvos: "1 aliado",
        custo: "3 EnR",
        recarga: "2",
        duracao: "0 T",
        dado: "2d10",
        bonus: ["Proteção aliada", "Redução de dano", "Geração de IH"]
      },
      {
        nome: "Combo Ascendente",
        descricao: "Sequência clássica de ataques crescentes. Causa 2d6 por golpe (até 3 golpes = 6d6). Se consumir 2 IH: último golpe causa +2d12 e aplica Derrubado.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "13 EnR",
        recarga: "2",
        duracao: "0 T",
        dado: "6d6",
        bonus: ["Múltiplos golpes", "Consumo de IH", "Crowd control com stack"]
      },
      {
        nome: "Grito de Coragem",
        descricao: "Um grito que levanta espíritos. Aliados recebem: +1 bônus de rolagem, +1 Precisão. A cada aliado afetado: 20% chance de gerar +1 IH.",
        tipo: "Duradoura",
        alcance: "6m",
        alvos: "aliados na área",
        custo: "13 EnR",
        recarga: "3",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Bônus de precisão", "Bônus de rolagem", "Geração de IH"]
      },
      {
        nome: "Contra-Ataque Instintivo",
        descricao: "Transforma defesa em ataque. Ao esquivar ou defender: pode atacar de volta (1 vez por turno). Se consumir 1 IH: contra-ataque ignora bônus de defesa.",
        tipo: "Sustentada",
        alcance: "0m",
        alvos: "Jogador",
        custo: "4 EnR",
        recarga: "2",
        duracao: "1 T",
        dado: "N/A",
        bonus: ["Contra-ataque reativo", "Consumo de IH", "Ignorar defesa com stack"]
      },
      {
        nome: "Determinação Crescente",
        descricao: "Quanto mais luta, mais forte fica. Cada turno ativo: +1 dano acumulativo (máx +9). A cada 3 stacks: ganha +1 IH extra por turno.",
        tipo: "Duradoura",
        alcance: "0m",
        alvos: "Jogador",
        custo: "11 EnR",
        recarga: "6",
        duracao: "4 T",
        dado: "N/A",
        bonus: ["Dano progressivo", "Geração de IH escalonada", "Stack limitado"]
      },
      {
        nome: "Investida Heroica",
        descricao: "Avança quebrando tudo no caminho. Causa 6d8 de dano + empurra 6m. Se consumir 1 IH: atordoa (Teste de Obstáculo).",
        tipo: "Imediata",
        alcance: "8m",
        alvos: "1",
        custo: "10 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "6d8",
        bonus: ["Empurrão", "Consumo de IH", "Crowd control com stack"]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Lâmina do Destino",
        descricao: "Um golpe guiado pelo destino do Herói. Causa 6d10 + 10. Consome todos IH: cada IH adiciona +1d10 e ignora Defesa adicional.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "19 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "6d10+10",
        bonus: ["Consumo total de IH", "Ignorar Defesa", "Dano escalável"]
      },
      {
        nome: "Postura do Último Bastião",
        descricao: "O Herói se torna a linha final. +2 dados de Defesa. Aliados atrás dele recebem redução de dano 20%. Gera +1 IH por turno sob ataque.",
        tipo: "Duradoura",
        alcance: "0m",
        alvos: "Jogador",
        custo: "15 FaD",
        recarga: "4",
        duracao: "3 T",
        dado: "N/A",
        bonus: ["Defesa ampliada", "Proteção aliada", "Geração de IH"]
      },
      {
        nome: "Espírito do Protagonista",
        descricao: "Desperta o verdadeiro poder interior. Gera +1 IH por ação. Ataques causam +4d8. Não pode cair abaixo de 1 HP (1 vez).",
        tipo: "Duradoura",
        alcance: "0m",
        alvos: "Jogador",
        custo: "15 FaD",
        recarga: "5",
        duracao: "3 T",
        dado: "N/A",
        bonus: ["Geração de IH", "Dano amplificado", "Proteção contra morte"]
      },
      {
        nome: "Chamado dos Companheiros",
        descricao: "O Herói luta melhor junto dos outros. Aliados recebem: +2 bônus de rolagem, +1 dado de ataque. Cada ação aliada gera 50% chance de +1 IH.",
        tipo: "Duradoura",
        alcance: "7m",
        alvos: "aliados",
        custo: "19 EnR",
        recarga: "5",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Bônus global aliado", "Geração de IH", "Amplificação de dano"]
      },
      {
        nome: "Ruptura da Esperança",
        descricao: "Explosão de energia emocional acumulada. Causa 6d12 em área. Consome todos IH: aplica ignora a defesa dos inimigos (2 turnos).",
        tipo: "Imediata",
        alcance: "6m",
        alvos: "AOE (3m)",
        custo: "23 EnR",
        recarga: "5",
        duracao: "0 T",
        dado: "6d12",
        bonus: ["Consumo total de IH", "Ignorar Defesa com stack", "Dano em área"]
      },
      {
        nome: "Final: Golpe do Herói",
        descricao: "O golpe final. A cena que define a história. Causa 10d12 + 20 de dano. Se consumir todos IH: dobra os dados finais e ignora TODA defesa. Se derrotar o alvo: não sofre fadiga. Caso contrário: fica Exausto por 1 turno.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "30 EnR",
        recarga: "7",
        duracao: "0 T",
        dado: "10d12+20",
        bonus: ["Consumo total de IH", "Ignora Defesa total", "Sem fadiga em kill"]
      }
    ]
  },
  {
    id: "dragon_slayer",
    nome: "Dragon Slayer",
    raridade: "lendario",
    descricao: "O Dragon Slayer, ou Matador de Dragões, é um guerreiro de elite com uma missão específica, cuja origem está nas ordens dedicadas à caça e eliminação de dragões. Eles são mestres em táticas antidragão, utilizando armas e armaduras forjadas com materiais raros e encantadas para resistir ao fogo e às escamas. Sua jornada é de perigo extremo e glória imortal, utilizando a Força e a Vitalidade para enfrentar as criaturas mais poderosas do mundo. A capacidade de resistir ao fogo e a maestria em armas perfurantes são as especialidades de um Dragon Slayer. A mecânica de combate do Dragon Slayer é de dano de pico e resistência elemental, utilizando sua Força para desferir golpes que penetram a armadura natural do dragão. Eles se especializam em ataques a pontos fracos, como os olhos e as asas, e no uso de balestras e lanças gigantes para imobilizar a fera. O Dragon Slayer pode usar sua Vitalidade para suportar o bafo de fogo e os ataques físicos do dragão, mantendo a linha de frente até o abate. A vitória do Dragon Slayer é a prova de que nem mesmo as criaturas mais temidas são invencíveis, um feito de coragem e técnica.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/bllg0qx.jpeg",
    funcoes: ["Damage Dealer"],
    atributos: {
      forca: "2d6+12",
      vitalidade: "2d6+10",
      agilidade: "1d4+4",
      inteligencia: "1d4+4",
      percepcao: "2d4+6",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Marca da Caça",
        descricao: "Gera Marcas de Caça (MC) ao acertar ataques (principalmente críticos ou precisos), atingir o mesmo alvo repetidamente e explorar fraquezas. Máximo: 5 MC por alvo. MC podem ser consumidas para ignorar defesa, causar dano massivo e aplicar efeitos de ruptura.",
        tipo: "Duradoura",
        alcance: "CaC",
        alvos: "1",
        custo: "0 FaD",
        recarga: "0",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Geração de Marca", "Consumível para efeitos", "Stack limitado"]
      },
      {
        nome: "Corte Perfurante",
        descricao: "Um golpe focado em atravessar escamas e armaduras. Causa 3d10 + 6 de dano. Se o alvo já tiver MC: ganha +1 dado de dano e aplica +1 MC adicional. Se causar dano significativo: aplica 1 MC.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "8 EnR",
        recarga: "1",
        duracao: "0 T",
        dado: "3d10+6",
        bonus: ["Dano escalável com Marca", "Geração de Marca", "Penetração"]
      },
      {
        nome: "Passo do Caçador",
        descricao: "Movimento tático para reposicionamento ofensivo. Move até 6m sem provocar reação. Se terminar adjacente: próximo ataque recebe +1 Precisão e gera +1 MC no acerto.",
        tipo: "Imediata",
        alcance: "6m",
        alvos: "1",
        custo: "5 FaD",
        recarga: "1",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Mobilidade", "Bônus de precisão", "Geração de Marca"]
      },
      {
        nome: "Fôlego de Cinzas",
        descricao: "Treinado para suportar calor extremo e impacto bruto. Reduz dano elemental em 30%. +2 Testes de Obstáculo. Se sofrer dano alto: ganha +1 MC no atacante.",
        tipo: "Duradoura",
        alcance: "0m",
        alvos: "Jogador",
        custo: "7 FaD",
        recarga: "4",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Resistência elemental", "Bônus de teste", "Geração de Marca"]
      },
      {
        nome: "Arpão Draconico",
        descricao: "Dispara um arpão que prende e limita movimento. Causa 4d8+12 e aplica: –3m movimento, –2 Reação. Enquanto preso: cada turno gera +1 MC automaticamente.",
        tipo: "Duradoura",
        alcance: "8m",
        alvos: "1",
        custo: "10 FaD",
        recarga: "2",
        duracao: "2 T",
        dado: "4d8+12",
        bonus: ["Imobilização", "Geração automática de Marca", "Redução de mobilidade"]
      },
      {
        nome: "Golpe na Junta",
        descricao: "Ataque técnico focado em articulações e pontos fracos. Causa 3d12 + 8. Aplica: –1 dado de Defesa, +1 MC. Se consumir 2 MC: aplica +2 dados adicional de dano.",
        tipo: "Duradoura",
        alcance: "CaC",
        alvos: "1",
        custo: "7 EnR",
        recarga: "2",
        duracao: "2 T",
        dado: "3d12+8",
        bonus: ["Debuff de Defesa", "Geração de Marca", "Consumo de Marca"]
      },
      {
        nome: "Investida Quebra-Asas",
        descricao: "Avança mirando mobilidade do alvo. Causa 6d10 e empurra 6m. Se consumir 1 MC: aplica Derrubado e reduz mobilidade em –3m por 2 turnos.",
        tipo: "Imediata",
        alcance: "7m",
        alvos: "1",
        custo: "15 FaD",
        recarga: "3",
        duracao: "0 T",
        dado: "6d10",
        bonus: ["Empurrão", "Consumo de Marca", "Crowd control"]
      },
      {
        nome: "Postura Anti-Colosso",
        descricao: "Adota postura preparada para criaturas gigantes. +1 dado de Defesa, +1 dado de dano contra alvos grandes. Cada ataque recebido: gerar +1 MC no inimigo.",
        tipo: "Sustentada",
        alcance: "0m",
        alvos: "Jogador",
        custo: "9 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Bônus contra gigantes", "Geração de Marca reativa", "Defesa aprimorada"]
      },
      {
        nome: "Perfuração Brutal",
        descricao: "Ataque direto com força máxima. Causa 8d8 + 10. Consome até 3 MC: cada MC ignora 10% da Defesa. Com 3 MC: ignora Defesa adicional totalmente.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "17 FaD",
        recarga: "2",
        duracao: "0 T",
        dado: "8d8+10",
        bonus: ["Dano massivo", "Ignorar Defesa com Marca", "Consumo de Marca"]
      },
      {
        nome: "Marcação do Predador",
        descricao: "Fixa o alvo como presa prioritária. Todos os ataques geram +1 MC adicional. +1 bônus de rolagem contra o alvo. Se o alvo tentar fugir: gera +2 MC.",
        tipo: "Duradoura",
        alcance: "8m",
        alvos: "1",
        custo: "13 FaD",
        recarga: "3",
        duracao: "3 T",
        dado: "N/A",
        bonus: ["Geração ampliada de Marca", "Bônus de rolagem", "Punição à fuga"]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Cravada do Matador",
        descricao: "Um ataque preciso e mortal. Causa 6d10 + 10. Consome todos MC: cada MC adiciona +1d10 e aplica Sangramento (2 turnos).",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "19 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "6d10+10",
        bonus: ["Consumo total de Marca", "Sangramento", "Dano escalável"]
      },
      {
        nome: "Couraça de Escamas Mortas",
        descricao: "Armadura reforçada com restos de dragões. 5d8 Defesa. Resistência elemental elevada. Sempre que sofrer dano: 50% chance de gerar +1 MC.",
        tipo: "Duradoura",
        alcance: "0m",
        alvos: "Jogador",
        custo: "17 EnR",
        recarga: "6",
        duracao: "3 T",
        dado: "5d8",
        bonus: ["Defesa aprimorada", "Resistência elemental", "Geração de Marca reativa"]
      },
      {
        nome: "Caçada Implacável",
        descricao: "Entra em estado de perseguição total. Gera +1 MC por turno automaticamente. +2 Precisão, +2m movimento. Ataques ao alvo marcado causam dano crítico.",
        tipo: "Duradoura",
        alcance: "0m",
        alvos: "Jogador",
        custo: "21 EnR",
        recarga: "5",
        duracao: "3 T",
        dado: "N/A",
        bonus: ["Geração automática de Marca", "Bônus de precisão", "Crítico garantido"]
      },
      {
        nome: "Lança de Execução",
        descricao: "Arremessa uma arma massiva com intenção de matar. Causa 7d10 + 12. Se alvo tiver 3+ MC: ignora Defesa.",
        tipo: "Imediata",
        alcance: "10m",
        alvos: "1",
        custo: "23 EnR",
        recarga: "5",
        duracao: "0 T",
        dado: "7d10+12",
        bonus: ["Dano massivo", "Ignorar Defesa com stack", "Projétil de execução"]
      },
      {
        nome: "Colapso Draconico",
        descricao: "Golpe que derruba estruturas e criaturas massivas. Causa 6d12 em área. Consome todos MC dos alvos: cada MC reduz Defesa em –1 dado (2 turnos).",
        tipo: "Imediata",
        alcance: "4m AOE",
        alvos: "AOE",
        custo: "20 EnR",
        recarga: "5",
        duracao: "0 T",
        dado: "6d12",
        bonus: ["Dano em área", "Consumo de Marca", "Debuff de Defesa escalável"]
      },
      {
        nome: "Execução do Dragão",
        descricao: "O golpe final de um verdadeiro matador de dragões. Causa 10d12 + 20 de dano. Se consumir todos MC: dobra os dados e ignora TODA defesa. Caso contrário: sofre Exausto por 1 turno.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "30 EnR",
        recarga: "7",
        duracao: "0 T",
        dado: "10d12+20",
        bonus: ["Consumo total de Marca", "Dobra de dados", "Ignora Defesa total"]
      }
    ]
  },
  {
    id: "alquimista",
    nome: "Alquimista",
    raridade: "raro",
    descricao: "O Alquimista é um cientista e artesão, cuja origem está nos laboratórios e nas guildas de boticários que buscam a transmutação e a criação de elixires. Eles são mestres na manipulação de substâncias químicas e mágicas, utilizando a Inteligência para criar poções, venenos e explosivos. Sua jornada é de experimentação e descoberta, buscando a pedra filosofal e o elixir da longa vida através da ciência e da magia. A capacidade de criar itens consumíveis poderosos e a manipulação de reações químicas são as especialidades de um Alquimista. A mecânica de combate do Alquimista é de suporte e dano de área, utilizando sua Inteligência para lançar frascos de ácido, fogo ou veneno no campo de batalha. Eles podem criar poções de cura e fortalecimento para seus aliados, transformando-se em um suporte vital para o grupo. O Alquimista pode usar sua Vitalidade para resistir aos efeitos colaterais de suas próprias criações e sua Percepção para identificar os ingredientes raros. A vitória do Alquimista é uma demonstração de ciência e caos, onde a química e a magia se unem para criar a destruição e a cura.",
    limiteAtributo: 110,
    imagem: "https://i.imgur.com/3p8wXFw.jpeg",
    funcoes: ["Control DPS", "Suporting"],
    atributos: {
      forca: "1d4+2",
      vitalidade: "1d4+4",
      agilidade: "1d4+4",
      inteligencia: "2d6+10",
      percepcao: "2d4+6",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Frasco Volátil",
        descricao: "O Alquimista arremessa um frasco instável cuja mistura reage violentamente. Causa 8d6 de dano em área. Alvos atingidos sofrem –1 em Testes de Reação até o próximo turno.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "2 m AOE",
        custo: "9 FaD",
        recarga: "2 T",
        duracao: "0 T",
        dado: "8d6",
        bonus: ["Explosão química", "Penalidade em Reação", "Dispersão de vapores"]
      },
      {
        nome: "Ácido Corrosivo",
        descricao: "Um composto altamente reativo é lançado sobre o alvo, aderindo à superfície. Causa 4d12 de dano. Enquanto durar, o alvo sofre –1 dado de Defesa. Se for atingido por outra habilidade alquímica, a duração é estendida em +1 turno.",
        tipo: "Duradoura",
        alcance: "5 m",
        alvos: "1",
        custo: "13 EnR",
        recarga: "3 T",
        duracao: "0 T",
        dado: "4d12",
        bonus: ["Corrosão contínua", "Penalidade de Defesa", "Extensão com outros ataques"]
      },
      {
        nome: "Névoa Instável",
        descricao: "O Alquimista libera uma mistura volátil que se transforma em uma névoa densa. Inimigos na área sofrem –2 Precisão. Se permanecerem por mais de 1 turno, recebem –1 adicional em Reação.",
        tipo: "Duradoura",
        alcance: "5 m",
        alvos: "3 m AOE",
        custo: "7 FaD",
        recarga: "4 T",
        duracao: "2 T",
        dado: "N/A",
        bonus: ["Penalidade de Precisão", "Penalidade progressiva", "Área de controle"]
      },
      {
        nome: "Reação em Cadeia",
        descricao: "O Alquimista ativa compostos instáveis, provocando uma sequência de explosões secundárias. Causa 4d12 de dano em área. Se houver efeitos alquímicos ativos, causa +2 dado de dano adicional por efeito presente na área.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "3 m AOE",
        custo: "15 EnR",
        recarga: "4 T",
        duracao: "0 T",
        dado: "4d12",
        bonus: ["Explosões secundárias", "Dano escalável", "Sinergia com efeitos"]
      },
      {
        nome: "Fórmula da Ruína",
        descricao: "Um composto raro e altamente refinado é lançado diretamente no alvo. Causa 8d12 de dano. Ignora completamente a Defesa do alvo. Se o alvo estiver sob efeito alquímico, causa +2d12 adicional.",
        tipo: "Imediata",
        alcance: "5 m",
        alvos: "1 a 3",
        custo: "19 FaD",
        recarga: "8 T",
        duracao: "0 T",
        dado: "8d12",
        bonus: ["Dano devastador", "Ignora Defesa", "Dano aumentado com efeitos"]
      },
      {
        nome: "Elixir de Estabilidade",
        descricao: "Um elixir cuidadosamente balanceado fortalece o corpo do aliado. O alvo recebe +2 dado de Defesa. Se estiver sob efeito negativo, reduz a intensidade em –1.",
        tipo: "Duradoura",
        alcance: "CaC",
        alvos: "1",
        custo: "3 EnR",
        recarga: "3 T",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Bônus de Defesa", "Redução de efeitos negativos", "Estabilização vital"]
      },
      {
        nome: "Preparação Meticulosa",
        descricao: "O Alquimista entra em estado de cálculo absoluto. Enquanto ativa: Recebe +2 Precisão ao usar habilidades alquímicas. A primeira habilidade usada a cada turno causa +2 dado de dano adicional.",
        tipo: "Sustentada",
        alcance: "CaC",
        alvos: "Próprio",
        custo: "11 FaD",
        recarga: "6 T",
        duracao: "0 T",
        dado: "N/A",
        bonus: ["Precisão amplificada", "Dano do primeiro ataque", "Cálculo absoluto"]
      },
      {
        nome: "Grande Obra: Nigredo",
        descricao: "O Alquimista executa a fase da dissolução absoluta. Causa 12d12 de dano em área. A área afetada se torna instável por 3 turnos: Inimigos sofrem –3 Reação e consideram o terreno difícil. Se houver efeitos alquímicos ativos, o dano inicial recebe +2 dados adicionais.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "5 m AOE",
        custo: "30 EnR",
        recarga: "8 T",
        duracao: "0 T",
        dado: "12d12",
        bonus: ["Dano apocalíptico", "Área instável", "Terreno difícil criado"]
      }
    ],
    habilidadesAvancadas: []
  }

  // ============================================
  // A CRÔNICA DOS VARKHAN - NOVAS CLASSES
  // Fonte: Pasta/Tipo: A Cronica dos Varkhan
  // ============================================
  ,{
    id: "varokh",
    nome: "Varokh",
    raridade: "comum",
    descricao: "Varokh, ou vanguardas, fazem a linha de frente de uma batalha. Eles são os primeiros a ficar cara a cara com um inimigo. Devido a natureza perigosa dessa função, caçadores que fazem parte dela, têm que ter um corpo muito saudável para que efetuem corretamente seu trabalho. Varokh têm a função também de policiamento dentro de Vareth, pois eles são pessoas difíceis de se parar quando precisam conter problemas dentro do mesmo. Varokh são conhecidos por portar armas pessadas e grandes armaduras, trocando movimentação por defesa. Por conta de serem aqueles que protegem seus aliados fisicamente, não é incomum ver Varokh com membros faltando em seus corpos.",
    colecao: "A Crônica dos Varkhan",
    limiteAtributo: 110,
    imagem: "https://imgur.com/CRkSW5N.png",
    atributos: {
      forca: "2d8+4",
      vitalidade: "2d12+6",
      agilidade: "2d4+2",
      inteligencia: "2d6+2",
      percepcao: "2d6+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Impacto Explosivo",
        descricao: "O usuário fortalece seu corpo com Arcana e avança com brutalidade, efetuando uma jogada de corpo para derrubar o inimigo. Causa 3d8+6 de dano físico. Se o ataque conectar, o adversário deve ser bem-sucedido em um Teste de Atletismo (-7) ou ficará Atordoado por 1 rodada.",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "1 Inimigo",
        custo: "8 EnE",
        recarga: "3",
        duracao: "1 T",
        dado: "3d8+6",
        bonus: [
          "Dano físico direto",
          "Derruba o inimigo",
          "Aplica Atordoamento"
        ]
      },
      {
        nome: "Proteção Desesperada",
        descricao: "O usuário usa sua reação para se atirar na direção de um ataque, colocando-se na frente, fortalecendo seu corpo com a Arcana e redirecionando o dano contra si. Pode proteger até 2 aliados adjacentes. Para cada aliado protegido, a eficiência da defesa diminui em 50%. Defende apenas o impacto inicial.",
        tipo: "Duradoura",
        alcance: "5 metros",
        alvos: "Aliados na Área",
        custo: "15 EnE",
        recarga: "4",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Reação defensiva",
          "Protege múltiplos aliados",
          "Redireciona dano inicial"
        ]
      },
      {
        nome: "Escudo Humano",
        descricao: "O Vanguarda interpõe-se entre um aliado adjacente e os ataques iminentes. Reduz o dano recebido em 2dN+250% DEF, mas o Vanguarda fica Imobilizado por 2 turnos enquanto mantém a defesa.",
        tipo: "Duradoura",
        alcance: "Adjacente",
        alvos: "1 Aliado",
        custo: "8 FaD & 8 EnE",
        recarga: "5",
        duracao: "3 T",
        dado: "N/A",
        bonus: [
          "Absorve dano do aliado",
          "Redução de dano escalável",
          "Sacrifica mobilidade por defesa"
        ]
      },
      {
        nome: "Grito de Desafio",
        descricao: "O Vanguarda emite um grito poderoso que atrai a atenção. Todos os inimigos em um raio de 10 metros devem focar seus ataques no Vanguarda por 1 rodada, ou sofrerão penalidade de -3 em suas rolagens de ataque.",
        tipo: "Imediata",
        alcance: "10 metros",
        alvos: "Inimigos na Área",
        custo: "10 EnE",
        recarga: "4",
        duracao: "1 T",
        dado: "N/A",
        bonus: [
          "Controle de aggro (Provocação)",
          "Penaliza ataques inimigos",
          "Protege a equipe"
        ]
      },
      {
        nome: "Fortaleza Inabalável",
        descricao: "Enquanto o Vanguarda estiver com menos de 30% de sua vida máxima, ele recebe +2dN DEF e +1 em testes de resistência. Este efeito ativa automaticamente em momentos críticos.",
        tipo: "Passiva",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "0 FaD",
        recarga: "Passiva",
        duracao: "Passiva",
        dado: "N/A",
        bonus: [
          "Aumento de defesa com vida baixa",
          "Bônus em resistências",
          "Sobrevivência extrema"
        ]
      },
      {
        nome: "Investida Implacável",
        descricao: "O Vanguarda avança em linha reta por até 10 metros, empurrando e causando 4d8+10 de dano físico a todos no caminho. Inimigos atingidos devem realizar um Teste de Agilidade ou serão derrubados e Atordoados por 1 rodada.",
        tipo: "Imediata",
        alcance: "10 metros",
        alvos: "Inimigos na Linha",
        custo: "15 FaD",
        recarga: "5",
        duracao: "0 T",
        dado: "4d10+8",
        bonus: [
          "Dano em área (linha)",
          "Reposicionamento rápido",
          "Controle de grupo (Derrubar/Atordoar)"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "thyrkan",
    nome: "Thyrkan",
    raridade: "comum",
    descricao: "Thyrkan, também chamados de Punhos de Ferro são os pugilistas de Vareth. São caçadores que preferiram se focar e se adaptar para conseguirem lutar usando sua arcana e seus prórpios punhos contra os inimigos Infernais. Devido a constante treinamento que esses indivíduos tem que se submeter, Thyrkan geralmente crescem de forma muito constante suas habilidades de combate, causando grandes quantidades de dano ao longo do tempo. Em Vareth eles geralmente tem a função de treinar outros caçadores em combate, além de muitas vezes auxiliarem em todo tipo de trabalho a ser realizado. Não é incomum Caçadores que realizam modificaçãoes em seu corpo para poderem atingir seus inimigos com mais potência e precisão.",
    colecao: "A Crônica dos Varkhan",
    limiteAtributo: 110,
    imagem: "https://imgur.com/pBPilTp.png",
    atributos: {
      forca: "2d10+4",
      vitalidade: "2d6+6",
      agilidade: "2d8+4",
      inteligencia: "2d8+4",
      percepcao: "2d6+2",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Disciplina do Desespero",
        descricao: "Quando o personagem atinge 40% ou menos de sua vida, ele pode escolher um dos efeitos disciplinares para o restante do combate: Disciplina de Atenção (+3 em Reação); Disciplina da Resiliência (+2dN de DEF); Disciplina da Vitória (+2 de PreC / +2dN em Dano).",
        tipo: "Passiva",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "0 FaD",
        recarga: "Passiva",
        duracao: "Permanente",
        dado: "N/A",
        bonus: [
          "Bônus adaptativo em combate",
          "Ativação em momentos críticos",
          "Escolha estratégica"
        ]
      },
      {
        nome: "Marreta Arcana",
        descricao: "Concentra Arcana na perna, realizando um salto e desferindo um golpe poderoso para esmagar o oponente no chão. Se o alvo falhar em um Teste de Foco, recebe -3 em Reação.",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "1 Inimigo",
        custo: "10 FaD / 8 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "5d10+12",
        bonus: [
          "Dano físico com controle",
          "Penalidade de reação",
          "Alto impacto"
        ]
      },
      {
        nome: "Punho de Adamantina",
        descricao: "Imbui os punhos com Arcana, tornando-os duros como adamantium. Ataques desarmados ignoram 3dN de armadura do alvo e causam +2dN de dano.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "9 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Ignora armadura",
          "Aumento de dano desarmado",
          "Aprimoramento físico"
        ]
      },
      {
        nome: "Sequência de Golpes",
        descricao: "Realiza uma série rápida de ataques desarmados. Permite três ataques adicionais por turno por 2 rodadas; cada ataque adicional causa 1dN a menos de dano.",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "1 Inimigo",
        custo: "15 FaD",
        recarga: "5",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Múltiplos ataques",
          "Dano contínuo",
          "Pressão ofensiva"
        ]
      },
      {
        nome: "Contra-Ataque Perfeito",
        descricao: "Sempre que o Pugilista desviar ou bloquear um ataque, ele pode realizar um ataque desarmado de reação com +2dN de dano.",
        tipo: "Passiva",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "0 FaD",
        recarga: "Passiva",
        duracao: "Permanente",
        dado: "N/A",
        bonus: [
          "Reação ofensiva",
          "Dano bônus em contra-ataques",
          "Defesa ativa"
        ]
      },
      {
        nome: "Fúria do Dragão",
        descricao: "Entra em um estado de fúria, aumentando Força e Agilidade em +20 e causando 3dN de dano por rodada durante 5 rodadas. Enquanto em fúria, não pode usar habilidades mágicas que aprimorem capacidades físicas.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "25 FaD",
        recarga: "7",
        duracao: "5 T",
        dado: "N/A",
        bonus: [
          "Aumento massivo de atributos",
          "Foco em combate físico",
          "Restrição mágica"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "veyrath",
    nome: "Veyrath",
    raridade: "raro",
    descricao: "Veyrath, ou duelistas, são especialistas em duelos de um contra um. Quando o assunto é lutar contra apenas um de cada vez, os Veyrath são implacáveis. Geralmente são reconhecidos por portarem armas rápidas e afiadas, além de geralmente serem pessoas que prezam bastante pelo o individualismo e o foco no intrapessoal mais do que no desenvolvimento em grupo. Veyrath treinam por bastante tempo para que consigam enfrentar uma grande ameaça sozinhos. Eles têm a tendência de serem caçadores mais egoístas e preferirem trabalhar sozinhos, tendo sua efetividade diminuída quando precisam trabalhar em conjunto ou contra múltiplas ameaças.",
    colecao: "A Crônica dos Varkhan",
    limiteAtributo: 110,
    imagem: "https://imgur.com/afF8e5M.png",
    atributos: {
      forca: "2d6+4",
      vitalidade: "2d6+2",
      agilidade: "2d12+6",
      inteligencia: "2d6+2",
      percepcao: "2d10+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Explosão de Velocidade",
        descricao: "Canaliza Arcana para aumentar exponencialmente a movimentação. Recebe +20 de Agilidade e adiciona seu nível de Agilidade como bônus de dano. Receber qualquer dano encerra o efeito prematuramente.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "12 FaD",
        recarga: "6",
        duracao: "Agi T",
        dado: "N/A",
        bonus: [
          "Aumento massivo de Agilidade",
          "Bônus de dano baseado em Agilidade",
          "Requer evasão perfeita para manter"
        ]
      },
      {
        nome: "Desingage!",
        descricao: "Utiliza agilidade para se desvencilhar. Recebe +3 de ReaC e +3 de EvA ou PreC. Se bem-sucedido, recua 2 metros e evita o ataque inimigo por completo, abrindo mão do próximo turno. Se usado para Contra-Atacar, seu ataque é considerado Crítico.",
        tipo: "Imediata",
        alcance: "3 metros",
        alvos: "Próprio",
        custo: "20 FaD",
        recarga: "4",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Evasão absoluta de emergência",
          "Reposicionamento tático",
          "Alto risco, alta recompensa"
        ]
      },
      {
        nome: "Ataque Preciso",
        descricao: "O Duelista foca em um ponto vital do inimigo, causando dano físico perfurante. Ignora 50% da armadura do alvo e aumenta o acerto crítico.",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "1 Inimigo",
        custo: "12 FaD / 12 EnR",
        recarga: "3",
        duracao: "0 T",
        dado: "4d10+12",
        bonus: [
          "Dano físico perfurante",
          "Ignora 50% de armadura",
          "Aumenta acerto crítico"
        ]
      },
      {
        nome: "Dança das Lâminas",
        descricao: "Executa movimentos evasivos e ataques rápidos. Recebe +2 em Evasão e Reação, também pode realizar 2 ataques adicionais por turno durante 2 rodadas.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "18 FaD",
        recarga: "7",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Aumento de Evasão",
          "Ataque extra por turno",
          "Pressão contínua"
        ]
      },
      {
        nome: "Foco Mortal",
        descricao: "Em situações de combate 1v1 (sem aliados ou outros inimigos interferindo), o Duelista recebe +2dN de dano e +2 em Precisão em todos os seus ataques.",
        tipo: "Passiva",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "0 FaD",
        recarga: "Passiva",
        duracao: "Passiva",
        dado: "N/A",
        bonus: [
          "Bônus passivo em duelos",
          "Aumenta letalidade isolada",
          "Sinergia com a classe"
        ]
      },
      {
        nome: "Golpe Final",
        descricao: "Prepara um ataque devastador causando 6d12 + 250% do Dano de Ataque. Se conectar, o inimigo faz um Teste de Tolerância; se falhar, sofre o dobro do dano total.",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "1 Inimigo",
        custo: "25 FaD",
        recarga: "8",
        duracao: "0 T",
        dado: "6d12+250%",
        bonus: [
          "Dano massivo de finalização",
          "Multiplicador condicional",
          "Alto custo e recarga"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "drahkhan",
    nome: "Drahkhan",
    raridade: "epico",
    descricao: "Drahkhan , ou cavaleiros negros, são a função mais popular da Varkhan. Os Drahkhans tem o dever de eliminar qualquer traço sobrenatural do mundo. Eles sempre marcham em conjunto ocultando os vestígios de tudo de sobrenatural que marchou na Terra. Eliminando ameaças, escondendo provas e levando as pessoas que testemunharam para Vareth, para que assim elas possam ou viver uma vida normal lá dentro, ou se juntar aos Varkhan. Os Drahkhans são bem diversizados entre si, no entanto, quando o assunto é brutalidade e superioridade sobre seu inimigo, eles são os especialistas nisso.",
    colecao: "A Crônica dos Varkhan",
    limiteAtributo: 110,
    imagem: "https://imgur.com/VPJFdFt.png",
    atributos: {
      forca: "2d10+4",
      vitalidade: "2d8+4",
      agilidade: "2d6+4",
      inteligencia: "2d6+2",
      percepcao: "2d6+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Double Tap",
        descricao: "Realiza um ataque rápido seguido de um segundo ataque às cegas, causando 2d10+150% de dano físico. O inimigo faz um teste de Percepção (-7); se falhar, recebe o segundo ataque com 50% da eficiência sem poder reagir.",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "1 Inimigo",
        custo: "15 FaD",
        recarga: "3",
        duracao: "0 T",
        dado: "2d10+150%",
        bonus: [
          "Ataque duplo rápido",
          "Punição por baixa percepção",
          "Dano consistente"
        ]
      },
      {
        nome: "Surto de Arcana",
        descricao: "O usuário canaliza a Arcana em seu corpo para aprimorar seus movimentos ao máximo, forçando seu corpo além de um limite possível por um curto período. Ao fim da habilidade, seu corpo entrará em superaquecimento e ficará Desorientado por 2 turnos.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "12 FaD / 12 EnE",
        recarga: "6",
        duracao: "4 T",
        dado: "2dN+200% ATK / 3dN DEF / +2 ReaC",
        bonus: [
          "Ação extra no turno",
          "Bônus de dano",
          "Risco de exaustão"
        ]
      },
      {
        nome: "Tática de Flanco",
        descricao: "Coordena ataques com aliados. Se um aliado atacar o mesmo alvo na mesma rodada, o Cavaleiro Negro e seu aliado recebem +2dN de dano e +1 em Precisão contra aquele alvo.",
        tipo: "Passiva",
        alcance: "5 metros",
        alvos: "Aliado/Inimigo",
        custo: "9 FaD",
        recarga: "3",
        duracao: "1 T",
        dado: "2dN Dano / +1 PreC",
        bonus: [
          "Sinergia de equipe",
          "Bônus de flanqueamento",
          "Aumenta precisão"
        ]
      },
      {
        nome: "Aura de Comando",
        descricao: "Inspira aliados próximos. Todos os aliados em um raio de 10 metros recebem +1 em todas as rolagens de ataque e defesa e +2dN de ATK e DEF por 3 rodadas.",
        tipo: "Sustentada",
        alcance: "10 metros",
        alvos: "Aliados na Área",
        custo: "18 EnR",
        recarga: "7",
        duracao: "3 T",
        dado: "N/A",
        bonus: [
          "Buff em área",
          "Aumenta ataque e defesa da equipe",
          "Liderança tática"
        ]
      },
      {
        nome: "Determinação Férrea",
        descricao: "O Cavaleiro Negro é imune a efeitos de medo e intimidação Mediana. Uma vez por combate, pode ignorar automaticamente um efeito de Atordoamento ou Imobilização.",
        tipo: "Passiva",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "0 FaD",
        recarga: "Passiva",
        duracao: "Passiva",
        dado: "N/A",
        bonus: [
          "Imunidade a medo",
          "Quebra de CC (1x por combate)",
          "Resiliência mental"
        ]
      },
      {
        nome: "Execução Impecável",
        descricao: "Mira um inimigo enfraquecido. Causa 8d12+15 de dano físico. Se o alvo estiver com menos de 50% de vida, o ataque ignora 50% de armadura e tem chance de crítico aumentada (5).",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "1 Inimigo",
        custo: "18 FaD",
        recarga: "5",
        duracao: "0 T",
        dado: "8d12+15",
        bonus: [
          "Dano massivo de execução",
          "Ignora armadura em alvos feridos",
          "Finalizador de elite"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
  {
    id: "verakhan",
    nome: "Verakhan",
    raridade: "raro",
    descricao: "Verakhan ou guardiões das palavras são a classe especializadas em uso de magia. Muitas vezes são caçadores estrategistas, visto que eles têm que ter um domínio de todos os feitiços além de ter um ampla visão do que está acontecendo dentro de um campo de batalha. Os Verakhan treinaram diversos anos o uso e aprimoramento de magias, isso leva eles a ter uma facilidade maior com o uso das mesmas em períodos críticos. Dominar as artes da magia, significa ser extremamente versátil em combate, no entanto, devido ao foco na mente, os caçadores dessa função tendem a ser menos resilientes que outros caçadores. Verakhan utilizam a magia de forma bruta, focando-se mais em disparos elementais e poderosos de pura Arcana. Eles são o que assemelham mais a imagem de um mago.",
    colecao: "A Crônica dos Varkhan",
    limiteAtributo: 110,
    imagem: "https://imgur.com/gPqunAJ.png",
    atributos: {
      forca: "2d4+2",
      vitalidade: "2d4+2",
      agilidade: "2d6+2",
      inteligencia: "2d12+6",
      percepcao: "2d10+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Incendium",
        descricao: "Cria uma chama em cone que causa dano de fogo e pode deixar o alvo queimando. Se o alvo falhar em um Teste de Tolerância (-7), ficará Queimando.",
        tipo: "Imediata",
        alcance: "10 metros",
        alvos: "Área em Cone",
        custo: "15 EnR",
        recarga: "4",
        duracao: "0 T",
        dado: "5d8+10",
        bonus: [
          "Dano em área de fogo",
          "Aplica queimaduras",
          "Dano contínuo"
        ]
      },
      {
        nome: "Círculo da Restrição",
        descricao: "Aponta para o alvo, fazendo um círculo de Arcana envolvê-lo e espremê-lo. Causa dano mágico e pode Atordoar o inimigo se falhar no teste de Atletismo.",
        tipo: "Imediata",
        alcance: "12 metros",
        alvos: "1 Inimigo",
        custo: "15 EnR",
        recarga: "5",
        duracao: "2 T",
        dado: "3d8+8",
        bonus: [
          "Dano mágico com controle",
          "Atordoamento de longa duração",
          "Controle de grupo"
        ]
      },
      {
        nome: "Barreira Arcana",
        descricao: "Conjura uma barreira de energia mágica que protege a si ou a um aliado. A barreira absorve 4dN + (Nível de Arcanismo x3) de dano mágico ou físico por 2 rodadas.",
        tipo: "Duradoura",
        alcance: "10 metros",
        alvos: "1 Alvo",
        custo: "10 EnR",
        recarga: "4",
        duracao: "2 T",
        dado: "N/A",
        bonus: [
          "Proteção versátil",
          "Absorção de dano",
          "Defesa pontual"
        ]
      },
      {
        nome: "Explosão Elemental",
        descricao: "Invoca uma explosão de energia elemental (fogo, gelo ou eletricidade). Inimigos no raio devem falhar em um Teste de Tolerância (-11) ou sofrer efeito secundário (queimadura, lentidão, choque).",
        tipo: "Imediata",
        alcance: "10 metros",
        alvos: "Área de 5 metros",
        custo: "20 EnR",
        recarga: "6",
        duracao: "0 T",
        dado: "5d12+10",
        bonus: [
          "Dano elemental em área",
          "Efeitos secundários de controle",
          "Versatilidade elemental"
        ]
      },
      {
        nome: "Visão Arcana",
        descricao: "O Guardião pode ver auras mágicas e identificar a natureza de feitiços e encantamentos. Recebe +2 em testes de Percepção Mágica e Inteligência para identificar magias.",
        tipo: "Passiva",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "0 EnR",
        recarga: "Passiva",
        duracao: "Permanente",
        dado: "N/A",
        bonus: [
          "Detecção mágica aprimorada",
          "Bônus em testes de conhecimento",
          "Consciência tática"
        ]
      },
      {
        nome: "Tempestade de Mana",
        descricao: "Libera uma torrente de energia Arcana pura. Todos os inimigos na área recebem dano mágico massivo (o valor inclui multiplicador de Ataque quando aplicável).",
        tipo: "Imediata",
        alcance: "15 metros",
        alvos: "Área de 5 metros",
        custo: "30 EnR",
        recarga: "8",
        duracao: "0 T",
        dado: "8d12 + [500% ATK]",
        bonus: [
          "Dano mágico massivo em área",
          "Alto impacto",
          "Finalizador arcano"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
    {
    id: "Aurekhan",
    nome: "Aurekhan",
    raridade: "raro",
    descricao: "Aurekhan ou simplesmente Guerreiro Santo são a classe especializada em magias divinas. Diferente do que são os Varakhan, os Aurekhan buscam moldar a Arcana para utilizar o melhor dela as mesclando com uma característica sagrada que nem todos conseguem realmente utiliza-la por completo. Normalmente são caçadores extremamente benevolentes que pensam muito mais no bem maior do que em seus objetivos e ou estar em destaque. Aurekhan muitas vezes são procurados para fazer parte de esquadrões por fornecerem o auxílio que o grupo possa precisar. São os principais dominadores da Arte de Caça da Vida, onde não existem melhores do que eles nesse papel.",
    colecao: "A Crônica dos Varkhan",
    limiteAtributo: 110,
    imagem: "https://imgur.com/anfKTBl.png",
    atributos: {
      forca: "2d6+4",
      vitalidade: "2d6+6",
      agilidade: "2d6+2",
      inteligencia: "2d10+4",
      percepcao: "2d8+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Bênção Divina",
        descricao: "Invoca uma bênção que cura um aliado e concede bônus de defesa por 2 turnos. Se o alvo já estiver sob Bênção Divina, a cura é aumentada em 25%.",
        tipo: "Duradoura",
        alcance: "10 metros",
        alvos: "1 Aliado",
        custo: "15 EnR",
        recarga: "2",
        duracao: "2 T",
        dado: "3d8+6",
        bonus: [
          "Cura e defesa para aliado",
          "Bônus de cura condicional",
          "Suporte divino"
        ]
      },
      {
        nome: "Aura de Proteção",
        descricao: "Irradia uma aura que concede aumento de defesa a todos os aliados em um raio de 5 metros. Inimigos que atacarem aliados dentro da aura recebem dano sagrado.",
        tipo: "Sustentada",
        alcance: "5 metros",
        alvos: "Aliados na Área",
        custo: "18 EnR",
        recarga: "5",
        duracao: "3 T",
        dado: "N/A",
        bonus: [
          "Defesa em área",
          "Dano de retribuição",
          "Proteção contínua"
        ]
      },
      {
        nome: "Golpe Sagrado",
        descricao: "Um ataque imbuído de energia sagrada que causa dano sagrado. Se o alvo for um Infernal, o dano é dobrado e o alvo fica Amedrontado por 1 turno.",
        tipo: "Imediata",
        alcance: "Corpo a corpo",
        alvos: "1 Inimigo",
        custo: "12 FaD",
        recarga: "3",
        duracao: "0 T",
        dado: "4d8+10",
        bonus: [
          "Dano sagrado contra Infernais",
          "Aplica Amedrontado",
          "Ataque poderoso"
        ]
      },
      {
        nome: "Fé Inabalável",
        descricao: "Imunidade a Amedrontado e Enfeitiçado. Sempre que o Guerreiro Santo ou um aliado próximo sofrer dano de um Infernal, recupera 5 de EnR.",
        tipo: "Passiva",
        alcance: "Pessoal",
        alvos: "Próprio",
        custo: "0",
        recarga: "Passiva",
        duracao: "Permanente",
        dado: "N/A",
        bonus: [
          "Imunidade a CC",
          "Recuperação de energia",
          "Resiliência contra Infernais"
        ]
      },
      {
        nome: "Intervenção Divina",
        descricao: "Invoca uma barreira de luz que protege um aliado de um ataque iminente, absorvendo 100% do dano. Pode ser usada como reação (máx. 2 usos por Descanso Longo).",
        tipo: "Imediata (Reação)",
        alcance: "15 metros",
        alvos: "1 Aliado",
        custo: "25 EnR",
        recarga: "8",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Proteção total contra um ataque",
          "Habilidade de reação",
          "Salva aliados em perigo"
        ]
      }
    ],
    habilidadesAvancadas: []
  },
    {
    id: "Nekrath",
    nome: "Nekrath",
    raridade: "epico",
    descricao: "Nekrath ou os santos caídos, são a última classe mágica de Vareth. Enquanto os Aurekhan se focaram em utilizar a Arcana como algo bom e puro, os Nekrath se focaram em utilizar a Arcana em sua verdadeira essência, uma essência demoníaca e ruim. Os Nekrath tem em posse de si um artefato amaldiçoado que lhes fornece uma ligação demoníaca, um pacto que lhes dê vantagem. Caçadores que escolheram seguir esse caminho, ficam em contato com o que há de pior constantemente. Muitas vezes os Nekrath são atormentados durante a noite por conta desse contato demoníaco, e não é incomum os ver sucumbindo a sua própria Arcana ou ao seu pacto. Mas quando bem treinados, Nekrath são uma verdadeira força de caçada.",
    colecao: "A Crônica dos Varkhan",
    limiteAtributo: 110,
    imagem: "https://imgur.com/1VQyh3r.png",
    atributos: {
      forca: "2d6+2",
      vitalidade: "2d6+2",
      agilidade: "2d6+4",
      inteligencia: "2d12+6",
      percepcao: "2d10+4",
      sorte: "0"
    },
    habilidadesBasicas: [
      {
        nome: "Sombra Corrosiva",
        descricao: "Libera uma nuvem de energia sombria que causa 5d10+12 de dano necrótico em área. Inimigos atingidos recebem 1 acúmulo de Corrosão (Condição), que reduz a defesa em 2nD por turno por 3 turnos.",
        tipo: "Duradoura",
        alcance: "10 metros",
        alvos: "Área de 4 metros",
        custo: "20 EnR",
        recarga: "4",
        duracao: "3 T",
        dado: "5d10+12",
        bonus: [
          "Dano necrótico em área",
          "Reduz defesa inimiga",
          "Dano contínuo"
        ]
      },
      {
        nome: "Abraço da Escuridão",
        descricao: "O Caído envolve um inimigo em sombras, causando 3d8+8 de dano necrótico por turno e impedindo-o de se mover. O alvo pode tentar um Teste de Atletismo (-11) a cada turno para se libertar.",
        tipo: "Duradoura",
        alcance: "8 metros",
        alvos: "1 Inimigo",
        custo: "22 EnR",
        recarga: "5",
        duracao: "3 T",
        dado: "3d8+8",
        bonus: [
          "Dano necrótico e imobilização",
          "Controle de grupo",
          "Dano contínuo"
        ]
      },
      {
        nome: "Vínculo Sombrio",
        descricao: "Cria um vínculo com um inimigo. Enquanto o vínculo durar, 25% do dano que o Caído recebe é transferido para o alvo. O alvo também sofre -2 em todos os testes de resistência.",
        tipo: "Sustentada",
        alcance: "12 metros",
        alvos: "1 Inimigo",
        custo: "8 EnR",
        recarga: "6",
        duracao: "0 T",
        dado: "N/A",
        bonus: [
          "Redireciona dano",
          "Reduz resistência do alvo",
          "Suporte ofensivo"
        ]
      },
      {
        nome: "Consumir Alma",
        descricao: "Ataca a alma de um inimigo, causando 6d12+15 de dano psíquico. Se o alvo for derrotado por esta habilidade, o Caído recupera 50% de sua vida e mana máxima.",
        tipo: "Imediata",
        alcance: "10 metros",
        alvos: "1 Inimigo",
        custo: "30 EnR",
        recarga: "7",
        duracao: "0 T",
        dado: "6d12+15",
        bonus: [
          "Dano psíquico alto",
          "Recuperação de recursos",
          "Finalizador poderoso"
        ]
      },
      {
        nome: "Maldição Eterna",
        descricao: "Amaldiçoa um inimigo, fazendo com que ele receba 1 acúmulo de Maldição Eterna (Condição). Cada acúmulo aumenta o dano necrótico recebido em 20% e reduz a cura recebida em 10%. Acumula até 5 vezes.",
        tipo: "Duradoura",
        alcance: "15 metros",
        alvos: "1 Inimigo",
        custo: "10% EnR Max.",
        recarga: "8",
        duracao: "5 T",
        dado: "N/A",
        bonus: [
          "Aumenta dano necrótico",
          "Reduz cura do alvo",
          "Debuff poderoso"
        ]
      }
    ],
    habilidadesAvancadas: []
  }
];

/**
 * Obtém todas as classes
 * @returns {Array} Array com todas as classes
 */
function obterTodasAsClasses() {
  return CLASSES_DATABASE;
}

/**
 * Obtém uma classe por ID
 * @param {string} classeId - ID da classe
 * @returns {Object|null} Objeto classe ou null se não encontrado
 */
function obterClassePorId(classeId) {
  return CLASSES_DATABASE.find(classe => classe.id === classeId) || null;
}

console.log('✅ Base de dados de classes carregada com sucesso');
