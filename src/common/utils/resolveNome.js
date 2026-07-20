/**
 * Lê o nome de um documento de catálogo, aceitando tanto `Nome` quanto `nome`
 * — o banco administrativo não é consistente sobre a capitalização do campo.
 */
export const getNome = item => item?.Nome ?? item?.nome ?? '';

/**
 * Resolve um id referenciando outra coleção (racas, classes, Universo etc.)
 * para o nome do documento correspondente, já carregado em memória.
 * Convenção descrita em MIGRACAO-REACT-FIREBASE.md §4.2: `personagens` sempre
 * salva o id, nunca o nome como string solta — a UI resolve para exibição.
 */
export const resolveNome = (colecaoCarregada, id) => {
  if (!id) {
    return '';
  }
  return getNome(colecaoCarregada.find(item => item.id === id));
};
