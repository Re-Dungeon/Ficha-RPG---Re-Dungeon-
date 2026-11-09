import { createContext, useContext } from 'react';

// Campanha "preferida" para postar rolagens feitas pela ficha: a que o jogador
// deixou aberta no chat (modal ou painel lateral). A Ficha provê o valor; o
// Calculador de Ataque e o "Rolar" das Artes consomem via `campanhaDeRolagem`
// (common/utils/campanhaDeRolagem.js). Fora da Ficha (testes) = sem preferida.
export const RolagemFichaContext = createContext({ personagem: null, campanhaPreferida: null });

export const useRolagemFicha = () => useContext(RolagemFichaContext);
