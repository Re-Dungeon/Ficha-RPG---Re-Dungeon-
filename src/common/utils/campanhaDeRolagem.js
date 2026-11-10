import { campanhaIdsDosPersonagens } from 'common/utils/chat';

// Em qual campanha uma rolagem feita pela ficha (combo do Calculador de Ataque,
// "Rolar" de Arte/Variante) deve ser postada. Função pura:
// 1. a `preferida` (campanha aberta no chat da ficha), se for uma campanha do
//    personagem;
// 2. a única campanha do personagem;
// 3. null — sem campanha (nada a postar) ou 2+ campanhas sem preferida (a tela
//    precisa perguntar; use `campanhaIdsDosPersonagens` para listar as opções).
export const campanhaDeRolagem = (personagem, preferida = null) => {
  if (!personagem) return null;
  const ids = campanhaIdsDosPersonagens([personagem]);
  if (preferida && ids.includes(preferida)) return preferida;
  return ids.length === 1 ? ids[0] : null;
};

export default campanhaDeRolagem;
