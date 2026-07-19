/**
 * LOJA.JS - Sistema da Loja da Trapaça
 * Contém todos os itens disponíveis para compra na loja
 */

const LOJA_ITENS = {
  // ===== CONSUMÍVEIS =====
  pocaoVida: {
    id: 'loja-pocao-vida',
    nome: 'Poção de Vida',
    preco: 50,
    quantidade: 999,
    tipo: 'consumivel',
    descricao: 'Restaura 50 HP instantaneamente',
    efeito: { saude: 50 },
    imagem: '🧪'
  },

  elixirRecomecoAbsoluto: {
    id: 'loja-elixir-recomeço-absoluto',
    nome: '🔮 Elixir do Recomeço Absoluto',
    preco: 99999,
    quantidade: 10,
    tipo: 'consumivel',
    categoria: 'Elixires',
    raridade: 'Lendário',
    atributo: 'Inteligência',
    tempo: '8 Horas contínuas',
    custoIngredientes: 69696,
    dificuldade: 'Difícil (-13)',
    descricao: 'Restaura 100% da Vida e Mana. Remove todas as condições negativas (venenos, doenças, maldições, exaustão, debuffs). Cura ferimentos críticos, regenera tecidos danificados, remove efeitos de morte iminente. Concede Imunidade a condições negativas por 24 horas. Reseta penalidades acumuladas temporárias ou permanentes.',
    efeito: {
      vidaCompleta: 100,
      manaCompleta: 100,
      removeCondicoes: true,
      removeVeneno: true,
      removeDoenca: true,
      removeMaldicao: true,
      removeExaustao: true,
      curaFerimentos: true,
      regeneraTecidos: true,
      imunidadeCondicoes: 24 // 24 horas
    },
    imagem: '🔮',
    imagemUrl: 'https://i.imgur.com/ztxHi9d.jpeg'
  },

  pocaoEnergia: {
    id: 'loja-pocao-energia',
    nome: 'Poção de Energia',
    preco: 40,
    quantidade: 999,
    tipo: 'consumivel',
    descricao: 'Restaura 40 de Energia',
    efeito: { energia: 40 },
    imagem: '⚡'
  },

  pocaoResistencia: {
    id: 'loja-pocao-resistencia',
    nome: 'Poção de Resistência',
    preco: 60,
    quantidade: 999,
    tipo: 'consumivel',
    descricao: 'Aumenta defesa em 15 por 5 turnos',
    efeito: { defesa: 15, duracao: 5 },
    imagem: '🛡️'
  },

  pocaoAtaque: {
    id: 'loja-pocao-ataque',
    nome: 'Poção de Ataque',
    preco: 60,
    quantidade: 999,
    tipo: 'consumivel',
    descricao: 'Aumenta ataque em 20 por 5 turnos',
    efeito: { ataque: 20, duracao: 5 },
    imagem: '💪'
  },

  pocaoVeneno: {
    id: 'loja-pocao-veneno',
    nome: 'Poção de Veneno',
    preco: 75,
    quantidade: 100,
    tipo: 'consumivel',
    descricao: 'Aplica veneno ao alvo (5 dano/turno por 10 turnos)',
    efeito: { condicao: 'envenenado' },
    imagem: '☠️'
  },

  pocaoRessurreicao: {
    id: 'loja-pocao-ressurreicao',
    nome: 'Poção de Ressurreição',
    preco: 500,
    quantidade: 50,
    tipo: 'consumivel',
    descricao: 'Revive aliado caído com 50% HP',
    efeito: { revive: 0.5 },
    imagem: '✨'
  },

  kitMedicoCampo: {
    id: 'loja-kit-medico-campo',
    nome: '🩺 Kit Médico de Campo',
    preco: 45,
    quantidade: 999,
    tipo: 'consumivel',
    categoria: 'Consumíveis',
    raridade: 'Comum',
    atributo: 'Inteligência',
    custoIngredientes: 20,
    dificuldade: 'Fácil (-7)',
    descricao: 'Kit médico portátil que recupera 4d6 + 6 HP ao utilizar em si mesmo ou em um aliado. Remove Sangramento leve ou Ferimento superficial. Pode ser utilizado fora de combate sem limite, mas apenas 1 vez por alvo durante combate.',
    efeito: {
      saude: '4d6+6',
      removeSangramento: true,
      removeWerimentoSuperficial: true,
      usosCombate: 1
    },
    imagem: '🩺',
    imagemUrl: 'https://i.imgur.com/2wsRS8m.jpeg',
    ingredientes: [
      { nome: 'Bandagem Esterilizada', quantidade: 2 },
      { nome: 'Ervas Cicatrizantes', quantidade: 1 },
      { nome: 'Álcool Medicinal', quantidade: 1 }
    ]
  },

  // ===== ARMAS =====
  espadaAco: {
    id: 'loja-espada-aco',
    nome: 'Espada de Aço',
    preco: 200,
    quantidade: 50,
    tipo: 'arma',
    descricao: 'Arma comum que aumenta ataque em 10',
    bonus: { ataque: 10 },
    imagem: '⚔️'
  },

  espadaPrata: {
    id: 'loja-espada-prata',
    nome: 'Espada de Prata',
    preco: 400,
    quantidade: 30,
    tipo: 'arma',
    descricao: 'Arma rara que aumenta ataque em 20 e dano mágico em 5',
    bonus: { ataque: 20, magia: 5 },
    imagem: '⚔️'
  },

  excaliburFalso: {
    id: 'loja-excalibur-falso',
    nome: 'Excalibur Falso',
    preco: 1000,
    quantidade: 10,
    tipo: 'arma',
    descricao: 'Épica! Espada lendária que aumenta ataque em 50',
    bonus: { ataque: 50 },
    imagem: '⚔️'
  },

  arcoMadeira: {
    id: 'loja-arco-madeira',
    nome: 'Arco de Madeira',
    preco: 150,
    quantidade: 40,
    tipo: 'arma',
    descricao: 'Arco básico que aumenta ataque à distância em 8',
    bonus: { ataque: 8 },
    imagem: '🏹'
  },

  arcoMagia: {
    id: 'loja-arco-magia',
    nome: 'Arco da Magia',
    preco: 500,
    quantidade: 20,
    tipo: 'arma',
    descricao: 'Arco mágico que aumenta ataque em 25 e magia em 10',
    bonus: { ataque: 25, magia: 10 },
    imagem: '🏹'
  },

  equilioEspada: {
    id: 'loja-equilio-espada',
    nome: 'Equilíbrio Eterno',
    preco: 2000,
    quantidade: 5,
    tipo: 'arma',
    descricao: 'Lendária! Espada que equilibra força e magia (+30 ambos)',
    bonus: { ataque: 30, magia: 30 },
    imagem: '✨'
  },

  // ===== ARMADURAS =====
  couroBasico: {
    id: 'loja-couro-basico',
    nome: 'Armadura de Couro',
    preco: 150,
    quantidade: 50,
    tipo: 'armadura',
    descricao: 'Armadura básica que aumenta defesa em 10',
    bonus: { defesa: 10 },
    imagem: '🥾'
  },

  peitoralFerro: {
    id: 'loja-peitoral-ferro',
    nome: 'Peitoral de Ferro',
    preco: 400,
    quantidade: 30,
    tipo: 'armadura',
    descricao: 'Armadura pesada que aumenta defesa em 25',
    bonus: { defesa: 25 },
    imagem: '🛡️'
  },

  placaMithril: {
    id: 'loja-placa-mithril',
    nome: 'Placa de Mithril',
    preco: 1000,
    quantidade: 15,
    tipo: 'armadura',
    descricao: 'Épica! Armadura mágica que aumenta defesa em 50',
    bonus: { defesa: 50 },
    imagem: '⛓️'
  },

  veoDragao: {
    id: 'loja-veu-dragao',
    nome: 'Véu de Dragão',
    preco: 2500,
    quantidade: 5,
    tipo: 'armadura',
    descricao: 'Lendária! Armadura que aumenta defesa em 75 e resistência mágica em 30',
    bonus: { defesa: 75, resistenciaMagia: 30 },
    imagem: '🐉'
  },

  armaduraCouro: {
    id: 'loja-armadura-couro',
    nome: '🛡️ Armadura de Couro',
    preco: 120,
    quantidade: 40,
    tipo: 'armadura',
    categoria: 'Armaduras',
    raridade: 'Raro',
    atributo: 'Destreza',
    custoIngredientes: 60,
    dificuldade: 'Fácil (-7)',
    descricao: 'Armadura leve feita de couro reforçado. Concede 3d6+5 de Defesa. Não penaliza movimentos ou furtividade.',
    ingredientes: 'Couro Curtido x2, Fivela de Ferro x2, Linha Resistente x1',
    bonus: { defesa: 10 },
    imagem: '🛡️',
    imagemURL: 'https://i.imgur.com/2HDFp3J.png'
  },

  armaduraCouroReorcado: {
    id: 'loja-armadura-couro-reorcado',
    nome: '🛡️ Armadura de Couro Reforçado',
    preco: 180,
    quantidade: 30,
    tipo: 'armadura',
    categoria: 'Armaduras',
    raridade: 'Raro',
    atributo: 'Destreza',
    custoIngredientes: 95,
    dificuldade: 'Moderado (-9)',
    descricao: 'Couro tratado e reforçado com placas leves. Concede 2d8+3 de Defesa. Aumenta +25 HP enquanto usa.',
    ingredientes: 'Couro Curtido x3, Placa de Ferro Leve x1, Rebites Metálicos x2',
    bonus: { defesa: 15, vidaMaxima: 25 },
    imagem: '🛡️',
    imagemURL: 'https://i.imgur.com/6BPNbmv.png'
  },

  armaduraMalha: {
    id: 'loja-armadura-malha',
    nome: '🛡️ Armadura de Malha',
    preco: 320,
    quantidade: 20,
    tipo: 'armadura',
    categoria: 'Armaduras',
    raridade: 'Raro',
    atributo: 'Força',
    custoIngredientes: 170,
    dificuldade: 'Moderado (-9)',
    descricao: 'Malha metálica entrelaçada que protege o torso e braços. Concede 3d8+9 de Defesa. Aumenta +50 HP enquanto usa.',
    ingredientes: 'Anéis de Ferro x5, Minério de Ferro Refinado x2, Couro Interno x1',
    bonus: { defesa: 25, vidaMaxima: 50 },
    imagem: '🛡️',
    imagemURL: 'https://i.imgur.com/SZQgylM.png'
  },

  armaduraEscamas: {
    id: 'loja-armadura-escamas',
    nome: '🛡️ Armadura de Escamas de Ferro',
    preco: 420,
    quantidade: 15,
    tipo: 'armadura',
    categoria: 'Armaduras',
    raridade: 'Raro',
    atributo: 'Força',
    custoIngredientes: 220,
    dificuldade: 'Desafiadora (-11)',
    descricao: 'Armadura composta por placas sobrepostas em formato de escamas. Concede 3d10+5 de Defesa. Aumenta +75 HP enquanto usa.',
    ingredientes: 'Escamas Metálicas x6, Minério de Ferro Refinado x3, Couro Reforçado x1',
    bonus: { defesa: 35, vidaMaxima: 75 },
    imagem: '🛡️',
    imagemURL: 'https://i.imgur.com/tSGJbaH.png'
  },

  // ===== ACESSÓRIOS =====
  anel: {
    id: 'loja-anel',
    nome: 'Anel de Poder',
    preco: 300,
    quantidade: 40,
    tipo: 'acessorio',
    descricao: 'Aumenta inteligência em 5',
    bonus: { inteligencia: 5 },
    imagem: '💍'
  },

  colarResistencia: {
    id: 'loja-colar-resistencia',
    nome: 'Colar de Resistência',
    preco: 350,
    quantidade: 35,
    tipo: 'acessorio',
    descricao: 'Aumenta vitalidade em 10',
    bonus: { vitalidade: 10 },
    imagem: '📿'
  },

  boasFortuna: {
    id: 'loja-boas-fortuna',
    nome: 'Boas da Fortuna',
    preco: 200,
    quantidade: 60,
    tipo: 'acessorio',
    descricao: 'Aumenta sorte em 15',
    bonus: { sorte: 15 },
    imagem: '👢'
  },

  // ===== MATERIAIS =====
  ouroMinerais: {
    id: 'loja-ouro-minerais',
    nome: 'Ouro Mineral',
    preco: 100,
    quantidade: 200,
    tipo: 'material',
    descricao: 'Material raro para crafting',
    bonus: {},
    imagem: '⭐'
  },

  pedraLua: {
    id: 'loja-pedra-lua',
    nome: 'Pedra da Lua',
    preco: 150,
    quantidade: 150,
    tipo: 'material',
    descricao: 'Material místico para artes mágicas',
    bonus: {},
    imagem: '🌙'
  },

  essenciaFogo: {
    id: 'loja-essencia-fogo',
    nome: 'Essência de Fogo',
    preco: 200,
    quantidade: 100,
    tipo: 'material',
    descricao: 'Essência elemental para criação de habilidades',
    bonus: {},
    imagem: '🔥'
  },

  penugemAgua: {
    id: 'loja-penuagem-agua',
    nome: 'Pena de Água',
    preco: 180,
    quantidade: 120,
    tipo: 'material',
    descricao: 'Material aquático para crafting',
    bonus: {},
    imagem: '💧'
  },

  cristalEstruMagestr: {
    id: 'loja-cristal-estrutura',
    nome: 'Cristal de Estrutura',
    preco: 250,
    quantidade: 80,
    tipo: 'material',
    descricao: 'Cristal raramente para armadilhas de estrutura',
    bonus: {},
    imagem: '💎'
  }
};

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LOJA_ITENS };
}
