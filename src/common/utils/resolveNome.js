/**
 * Resolve um id referenciando outra coleção (racas, classes, Universo etc.)
 * para o campo `Nome` do documento correspondente, já carregado em memória.
 * Convenção descrita em MIGRACAO-REACT-FIREBASE.md §4.2: `personagens` sempre
 * salva o id, nunca o nome como string solta — a UI resolve para exibição.
 */
export const resolveNome = (colecaoCarregada, id) => {
  if (!id) {
    return '';
  }
  return colecaoCarregada.find(item => item.id === id)?.Nome ?? '';
};
