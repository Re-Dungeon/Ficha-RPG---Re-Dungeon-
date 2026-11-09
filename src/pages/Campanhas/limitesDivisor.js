// Limites do painel do chat na mesa (divisão arrastável entre mapa e chat).
// 'horizontal' = lado a lado (largura do chat); 'vertical' = chat abaixo do
// mapa, entre 600 e 900px de janela (altura do chat).
export const LIMITES_DIVISOR = {
  horizontal: {
    chave: 'reDungeonChatPainelLargura',
    minChat: 280,
    minMapa: 360,
    maxFracao: 0.7,
  },
  vertical: {
    chave: 'reDungeonChatPainelAltura',
    minChat: 200,
    minMapa: 240,
    maxFracao: 0.7,
  },
};

// Largura da faixa da divisão (ocupa o `gap` que existia entre mapa e chat).
export const DIVISOR_ESPESSURA = 12;

// `total` = tamanho do corpo da mesa na mesma direção. Devolve os limites e o
// valor já limitado (inteiro). O máximo nunca fica abaixo do mínimo.
export const limitarTamanhoChat = (valor, total, orientacao) => {
  const { minChat, minMapa, maxFracao } = LIMITES_DIVISOR[orientacao];
  const max = Math.max(
    minChat,
    Math.floor(Math.min(total * maxFracao, total - minMapa - DIVISOR_ESPESSURA)),
  );
  return { min: minChat, max, valor: Math.round(Math.min(max, Math.max(minChat, valor))) };
};

export const lerTamanhoSalvo = chave => {
  try {
    const bruto = window.localStorage.getItem(chave);
    const numero = bruto === null ? NaN : Number(bruto);
    return Number.isFinite(numero) && numero > 0 ? numero : null;
  } catch {
    return null;
  }
};

export const gravarTamanho = (chave, valor) => {
  try {
    if (valor === null) window.localStorage.removeItem(chave);
    else window.localStorage.setItem(chave, String(Math.round(valor)));
  } catch {
    // Sem localStorage: o tamanho vale só até recarregar.
  }
};
