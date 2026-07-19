/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   CULTIVAÇÃO - CONSTANTES DE ELEMENTOS E TAMANHOS
   
   Define os elementos do Wu Xing e tamanhos de Mar Espiritual
   
   Data: 1 de março de 2026
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

const CULTIVACAO_ELEMENTOS = {
    // 🌿 Elementos Fundamentais (Wu Xing)
    'fundamentais': {
        nome: '🌿 Elementos Fundamentais (Wu Xing)',
        elementos: [
            { id: 'madeira', nome: 'Madeira', emoji: '🌳' },
            { id: 'fogo', nome: 'Fogo', emoji: '🔥' },
            { id: 'terra', nome: 'Terra', emoji: '🌍' },
            { id: 'metal', nome: 'Metal', emoji: '⚔️' },
            { id: 'agua', nome: 'Água', emoji: '💧' }
        ]
    },

    // ⚡ Elementos Naturais Expandidos
    'naturais': {
        nome: '⚡ Elementos Naturais Expandidos',
        elementos: [
            { id: 'vento', nome: 'Vento', emoji: '💨' },
            { id: 'gelo', nome: 'Gelo', emoji: '❄️' },
            { id: 'relampago', nome: 'Relâmpago', emoji: '⚡' },
            { id: 'luz', nome: 'Luz', emoji: '✨' },
            { id: 'trevas', nome: 'Trevas', emoji: '🌑' },
            { id: 'veneno', nome: 'Veneno', emoji: '☠️' },
            { id: 'som', nome: 'Som', emoji: '🔊' },
            { id: 'areia', nome: 'Areia', emoji: '🏜️' },
            { id: 'magma', nome: 'Magma', emoji: '🌋' },
            { id: 'nevoa', nome: 'Névoa', emoji: '🌫️' },
            { id: 'cinzas', nome: 'Cinzas', emoji: '🩶' }
        ]
    },

    // 🩸 Elementos Corporais e Espirituais
    'corporais': {
        nome: '🩸 Elementos Corporais e Espirituais',
        elementos: [
            { id: 'sangue', nome: 'Sangue', emoji: '🩸' },
            { id: 'ossos', nome: 'Ossos', emoji: '🦴' },
            { id: 'alma', nome: 'Alma', emoji: '👻' },
            { id: 'espirito', nome: 'Espírito', emoji: '🔮' },
            { id: 'ilusao', nome: 'Ilusão', emoji: '🎭' },
            { id: 'yin', nome: 'Yin', emoji: '☯️' },
            { id: 'yang', nome: 'Yang', emoji: '☯️' },
            { id: 'emocao', nome: 'Emoção', emoji: '💓' },
            { id: 'consciencia', nome: 'Consciência', emoji: '🧠' }
        ]
    },

    // 🌌 Elementos Conceituais
    'conceituais': {
        nome: '🌌 Elementos Conceituais (nível "isso já virou Lei")',
        elementos: [
            { id: 'espaco', nome: 'Espaço', emoji: '🌌' },
            { id: 'tempo', nome: 'Tempo', emoji: '⏳' },
            { id: 'gravidade', nome: 'Gravidade', emoji: '📉' },
            { id: 'destino', nome: 'Destino', emoji: '🎲' },
            { id: 'karma', nome: 'Karma', emoji: '♻️' },
            { id: 'criacao', nome: 'Criação', emoji: '🌱' },
            { id: 'destruicao', nome: 'Destruição', emoji: '💥' },
            { id: 'vida', nome: 'Vida', emoji: '🌿' },
            { id: 'morte', nome: 'Morte', emoji: '💀' },
            { id: 'ordem', nome: 'Ordem', emoji: '📐' },
            { id: 'caos', nome: 'Caos', emoji: '🌪️' },
            { id: 'vazio', nome: 'Vazio', emoji: '⬛' }
        ]
    },

    // 🐉 Elementos Supremos / Lendários
    'supremos': {
        nome: '🐉 Elementos Supremos / Lendários',
        elementos: [
            { id: 'primordial', nome: 'Primordial', emoji: '🌀' },
            { id: 'celestial', nome: 'Celestial', emoji: '✨' },
            { id: 'abissal', nome: 'Abissal', emoji: '🫧' },
            { id: 'draconico', nome: 'Dracônico', emoji: '🐉' },
            { id: 'divino', nome: 'Divino', emoji: '👼' },
            { id: 'demonaico', nome: 'Demoníaco', emoji: '😈' },
            { id: 'reencarnacao', nome: 'Reencarnação', emoji: '🔄' },
            { id: 'estelar', nome: 'Estelar', emoji: '⭐' },
            { id: 'infinito', nome: 'Infinito', emoji: '∞' }
        ]
    }
};

const CULTIVACAO_TAMANHOS_MAR = [
    { id: 0, nome: 'Poça Espiritual', nivel: 'Iniciante' },
    { id: 1, nome: 'Lago Espiritual', nivel: 'Inicial' },
    { id: 2, nome: 'Lago Profundo', nivel: 'Novato' },
    { id: 3, nome: 'Grande Lago Espiritual', nivel: 'Aprendiz' },
    { id: 4, nome: 'Mar Interior', nivel: 'Intermediário' },
    { id: 5, nome: 'Grande Mar Espiritual', nivel: 'Avançado' },
    { id: 6, nome: 'Oceano Espiritual', nivel: 'Expert' },
    { id: 7, nome: 'Oceano Profundo', nivel: 'Mestre' },
    { id: 8, nome: 'Oceano Abissal', nivel: 'Grande Mestre' },
    { id: 9, nome: 'Mar Sem Margens', nivel: 'Sábio' },
    { id: 10, nome: 'Mar Celestial', nivel: 'Imortal' },
    { id: 11, nome: 'Mar Estelar', nivel: 'Celestial' },
    { id: 12, nome: 'Mar Primordial', nivel: 'Primordial' },
    { id: 13, nome: 'Mar Infinito', nivel: 'Infinito' }
];

const CULTIVACAO_DENSIDADES_QI = [
    { id: 0, nome: 'Qi Ralo', descricao: 'Basicíssimo, disperso' },
    { id: 1, nome: 'Qi Fluido', descricao: 'Flui livremente' },
    { id: 2, nome: 'Qi Condensado', descricao: 'Começando a concentração' },
    { id: 3, nome: 'Qi Comprimido', descricao: 'Fortemente comprimido' },
    { id: 4, nome: 'Qi Denso', descricao: 'Muito denso e pesado' },
    { id: 5, nome: 'Qi Pesado', descricao: 'Extremamente pesado' },
    { id: 6, nome: 'Qi Refinado', descricao: 'Refinado e puro' },
    { id: 7, nome: 'Qi Cristalino', descricao: 'Forma cristalina' },
    { id: 8, nome: 'Qi Solidificado', descricao: 'Quase sólido' },
    { id: 9, nome: 'Qi Núcleo Espiritual', descricao: 'Formou um núcleo' },
    { id: 10, nome: 'Qi Pressurizado', descricao: 'Pressão extrema' },
    { id: 11, nome: 'Qi Gravitacional', descricao: 'Distorção gravitacional' },
    { id: 12, nome: 'Qi Abissal', descricao: 'Poder do abismo' },
    { id: 13, nome: 'Qi Celestial', descricao: 'Poder celestial' },
    { id: 14, nome: 'Qi Primordial', descricao: 'Qi primitivo original' },
    { id: 15, nome: 'Qi Infinito', descricao: 'Infinitude manifestada' }
];

// Função auxiliar para obter todas as opções de elementos em um único array
function obterTodosOsElementos() {
    const todos = [];
    for (const categoria in CULTIVACAO_ELEMENTOS) {
        const grupo = CULTIVACAO_ELEMENTOS[categoria];
        todos.push({
            categoria: grupo.nome,
            elementos: grupo.elementos
        });
    }
    return todos;
}
