// Central de Ações aberta pela faixa de iniciativa do Grid (só em combate):
// de qual ficha? Candidatos = os tokens de jogador da ordem de iniciativa que
// apontam (`refId`) para um personagem meu com a ficha carregada. Preferência:
// o da vez (se é meu), senão o do "Falando como", senão o primeiro na
// iniciativa. Devolve o id do personagem ou null (sem combate/sem token meu).
export const personagemDaCentral = ({
  combate,
  tokens,
  fichas,
  meusPersonagensIds,
  tokenDaVezId = null,
  falandoComo = null,
}) => {
  if (!combate?.ordem?.length) return null;
  const meus = new Set(meusPersonagensIds ?? []);
  const porToken = new Map((tokens ?? []).map(token => [token.id, token]));
  const candidatos = [];
  combate.ordem.forEach(({ tokenId }) => {
    const token = porToken.get(tokenId);
    const refId = token?.tipo === 'jogador' ? token.refId : null;
    if (refId && meus.has(refId) && fichas?.[refId] && !candidatos.includes(refId)) {
      candidatos.push(refId);
    }
  });
  if (candidatos.length === 0) return null;

  const daVez = tokenDaVezId ? porToken.get(tokenDaVezId)?.refId : null;
  if (daVez && candidatos.includes(daVez)) return daVez;
  if (falandoComo && candidatos.includes(falandoComo)) return falandoComo;
  return candidatos[0];
};

// Autor da mensagem de aviso no chat: o personagem da Central (não o
// "Falando como"), no mesmo formato do `autor` de CampanhaChat.
export const autorDaFicha = (uid, ficha) => ({
  uid,
  personagemId: ficha.id,
  autorNome: ficha.nome || 'Jogador',
  autorAvatar: ficha.linkImagem ?? null,
  isMestre: false,
});
