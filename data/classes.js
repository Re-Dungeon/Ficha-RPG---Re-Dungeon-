/**
 * CLASSES.JS - Sistema de Classes
 * Contém todas as classes disponíveis no jogo com habilidades base e bônus
 */

const CLASSES_SISTEMA = {
  guerreiro: {
    id: 'guerreiro',
    nome: 'Guerreiro',
    descricao: 'Mestre do combate corporal, especializado em armas e armaduras pesadas',
    atributosPrimarios: ['Força', 'Vitalidade'],
    habilidadesBase: [
      'Golpe Pesado',
      'Bloqueio',
      'Grito de Guerra'
    ],
    bonus: {
      ataque: 2,
      defesa: 1,
      magia: -1
    },
    imagem: '⚔️',
    cor: '#b22222'
  },

  mago: {
    id: 'mago',
    nome: 'Mago',
    descricao: 'Manipulador das arcanas, especializado em magia elementar e projeções',
    atributosPrimarios: ['Inteligência', 'Percepção'],
    habilidadesBase: [
      'Bola de Fogo',
      'Escudo Mágico',
      'Telecinese'
    ],
    bonus: {
      ataque: -1,
      defesa: 0,
      magia: 2
    },
    imagem: '🧙',
    cor: '#4169e1'
  },

  arqueiro: {
    id: 'arqueiro',
    nome: 'Arqueiro',
    descricao: 'Especialista em combate à distância com precisão letal',
    atributosPrimarios: ['Agilidade', 'Percepção'],
    habilidadesBase: [
      'Tiro Certeiro',
      'Barrage',
      'Flecha Penetrante'
    ],
    bonus: {
      ataque: 1,
      defesa: 0,
      magia: 0
    },
    imagem: '🏹',
    cor: '#ffd700'
  },

  clerigo: {
    id: 'clerigo',
    nome: 'Clérigo',
    descricao: 'Curandeiro abençoado com poder divino, suporta aliados',
    atributosPrimarios: ['Inteligência', 'Vitalidade'],
    habilidadesBase: [
      'Cura Divina',
      'Bênção',
      'Luz Sagrada'
    ],
    bonus: {
      ataque: 0,
      defesa: 1,
      magia: 1
    },
    imagem: '⛪',
    cor: '#ffd700'
  },

  ladrao: {
    id: 'ladrao',
    nome: 'Ladrão',
    descricao: 'Discreto e rápido, especialista em furtividade e críticos',
    atributosPrimarios: ['Agilidade', 'Inteligência'],
    habilidadesBase: [
      'Golpe Furtivo',
      'Evasão',
      'Invisibilidade'
    ],
    bonus: {
      ataque: 1,
      defesa: -1,
      magia: 0
    },
    imagem: '🗡️',
    cor: '#2f4f4f'
  },

  paladino: {
    id: 'paladino',
    nome: 'Paladino',
    descricao: 'Guerreiro sagrado que combina força com magia divina',
    atributosPrimarios: ['Força', 'Inteligência'],
    habilidadesBase: [
      'Golpe Divino',
      'Escudo Sagrado',
      'Justiça Celestial'
    ],
    bonus: {
      ataque: 1,
      defesa: 2,
      magia: 1
    },
    imagem: '⚡',
    cor: '#ffd700'
  },

  xamã: {
    id: 'xama',
    nome: 'Xamã',
    descricao: 'Conectado com espíritos da natureza, controla elementos naturais',
    atributosPrimarios: ['Inteligência', 'Percepção'],
    habilidadesBase: [
      'Invocação de Espíritos',
      'Controle de Natureza',
      'Cura Natureza'
    ],
    bonus: {
      ataque: 0,
      defesa: 1,
      magia: 2
    },
    imagem: '🌿',
    cor: '#228b22'
  },

  assassino: {
    id: 'assassino',
    nome: 'Assassino',
    descricao: 'Mestre do combate letal, especializado em eliminar alvos únicos',
    atributosPrimarios: ['Agilidade', 'Inteligência'],
    habilidadesBase: [
      'Execução',
      'Sombras',
      'Veneno Letal'
    ],
    bonus: {
      ataque: 2,
      defesa: -2,
      magia: -1
    },
    imagem: '🔪',
    cor: '#000000'
  },

  cavaleiro: {
    id: 'cavaleiro',
    nome: 'Cavaleiro',
    descricao: 'O Cavaleiro não é meramente um soldado, mas o pilar sobre o qual repousam os restos da civilização. Enquanto outros buscam a glória no ouro ou na magia, ele busca a imortalidade através do sacrifício. Nascido do rigor das ordens militares e batizado no sangue da linhagem feudal, este guerreiro é forjado sob o fogo de um juramento inquebrável: um pacto que vincula sua vida ao destino do reino.\n\nSua jornada é um rastro de suor e disciplina que começa na alvorada da juventude. Como escudeiro, aprendeu que o peso da placa de aço é menor que o peso da honra; como homem, dominou a linguagem da guerra. No lombo de seu corcel, ele é o trovão que anuncia a justiça, uma força da natureza que transforma o pavor em esperança com um único brado.\n\nEm combate, o Cavaleiro é a tempestade contida. Ele não apenas empunha a espada, ele é a barreira. Enquanto o mundo desmorona ao seu redor, ele permanece imóvel, absorvendo o ódio dos inimigos para que os seus não sofram. Sua presença é um farol de virtude marcial: uma silhueta prateada que desafia o caos, provando que, enquanto houver um Cavaleiro de pé, a escuridão jamais triunfará sobre a ordem.',
    atributosPrimarios: ['Força', 'Vitalidade'],
    atributosRolagem: {
      forca: '2d10+6',
      vitalidade: '2d12+4',
      agilidade: '2d8+6',
      percepcao: '2d6+4',
      inteligencia: '1d4+6'
    },
    habilidadesBase: [
      'Guarda Protetora',
      'Carga Montada',
      'Escudo Unido'
    ],
    bonus: {
      ataque: 1,
      defesa: 3,
      magia: -1
    },
    raridade: 'Raro',
    imagem: 'https://i.imgur.com/llliatr.png',
    emoji: '🛡️',
    cor: '#696969'
  }
};

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CLASSES_SISTEMA };
}
