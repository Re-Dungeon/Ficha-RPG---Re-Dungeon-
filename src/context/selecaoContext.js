import { createContext, useContext } from 'react';

import { SELECAO_VAZIA } from 'common/utils/navegacao';

// Seleção atual (personagem aberto / chat aberto) usada pelos links "Fichas" e
// "Campanhas" do cabeçalho. O estado e o Provider vivem no Layout; o valor
// padrão é no-op para páginas renderizadas fora dele (testes).
// Cada lista limpa só a seleção da própria seção (lista de fichas esquece o
// personagem, lista de campanhas esquece o chat) — assim ir de uma ficha sem
// campanha para a lista de campanhas e voltar ainda reabre a ficha.
const noop = () => {};

export const SelecaoContext = createContext({
  selecao: SELECAO_VAZIA,
  selecionarPersonagem: noop,
  selecionarCampanha: noop,
  limparPersonagem: noop,
  limparCampanha: noop,
});

export const useSelecao = () => useContext(SelecaoContext);
