// Catálogo da Loja da Trapaça — NÃO vem do Firestore (MIGRACAO-REACT-FIREBASE.md
// §4: "nenhuma coleção equivalente ... permanecem embutidas"). É conteúdo
// autoral, embutido no código, servindo como ponto de partida representativo
// das categorias descritas em FUNCIONALIDADES.md §15 — editável aqui conforme
// a mesa quiser expandir.

export const CATALOGO_TRAPACA = [
  {
    id: 'encontro-favoravel',
    categoria: 'Benefícios Menores',
    nome: 'Encontro Favorável',
    custo: 5,
    descricao: 'O próximo encontro aleatório é favorável ao grupo.',
    tipoAtivacao: 'imediata',
  },
  {
    id: 'pista-oportuna',
    categoria: 'Benefícios Menores',
    nome: 'Pista Oportuna',
    custo: 5,
    descricao: 'O mestre revela uma pista útil sobre o objetivo atual.',
    tipoAtivacao: 'imediata',
  },
  {
    id: 'rerolar-dado',
    categoria: 'Vantagens Táticas',
    nome: 'Rerolar um Dado',
    custo: 15,
    descricao: 'Guarde para rerolar qualquer um dado seu quando quiser.',
    tipoAtivacao: 'manual',
  },
  {
    id: 'bonus-rolagem',
    categoria: 'Vantagens Táticas',
    nome: '+3 numa Rolagem',
    custo: 15,
    descricao: 'Guarde para somar +3 a uma rolagem à sua escolha.',
    tipoAtivacao: 'manual',
  },
  {
    id: 'reducao-dano',
    categoria: 'Efeitos Avançados',
    nome: 'Redução de Dano',
    custo: 30,
    descricao: 'Guarde para reduzir à metade o dano do próximo golpe recebido.',
    tipoAtivacao: 'manual',
  },
  {
    id: 'sobreviver-1hp',
    categoria: 'Bênçãos Únicas',
    nome: 'Sobreviver com 1 HP',
    custo: 50,
    descricao: 'Guarde para sobreviver com 1 HP a um dano que te derrubaria.',
    tipoAtivacao: 'manual',
  },
  {
    id: 'critico-garantido',
    categoria: 'Bênçãos Únicas',
    nome: 'Crítico Garantido',
    custo: 50,
    descricao: 'Guarde para transformar seu próximo ataque em um acerto crítico.',
    tipoAtivacao: 'manual',
  },
];

export const LIMITE_POR_CATEGORIA = {
  'Benefícios Menores': Infinity,
  'Vantagens Táticas': 2,
  'Efeitos Avançados': 1,
  'Bênçãos Únicas': 1,
};
