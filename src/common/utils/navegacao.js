import { campanhaIdsDosPersonagens } from 'common/utils/chat';

// Destino dos links "Fichas"/"Campanhas" do cabeçalho: alternar entre as duas
// seções reabre o que estava selecionado em vez de voltar para a lista.
// `selecao` = { personagem: {id, tipo, companheiroDe, campanhas} | null,
//               campanhaId: string | null,
//               visaoCampanha: 'chat' | 'grid' } — mantida pelo Layout
// (context/selecaoContext.js), preenchida pela Ficha e pelo chat e limpa
// pelas páginas de lista.

export const SELECAO_VAZIA = { personagem: null, campanhaId: null, visaoCampanha: 'chat' };

export const destinoFichas = selecao =>
  selecao.personagem ? `/personagens/${selecao.personagem.id}` : '/personagens';

// Com um personagem selecionado, abre a mesa de uma campanha dele — a última
// aberta, se ele estiver nela, senão a primeira da ficha — já "falando como"
// ele, na última visão usada (chat ou grid). NPC/Criatura/companheiro não
// entram na mesa (mesmo critério de common/utils/chat.js), então caem na
// última campanha aberta ou na lista.
export const destinoCampanhas = selecao => {
  const { personagem, campanhaId } = selecao;
  const visao = selecao.visaoCampanha === 'grid' ? 'grid' : 'chat';
  const campanhasDoPersonagem = personagem ? campanhaIdsDosPersonagens([personagem]) : [];

  if (campanhasDoPersonagem.length > 0) {
    const alvo = campanhasDoPersonagem.includes(campanhaId) ? campanhaId : campanhasDoPersonagem[0];
    return { to: `/campanhas/${alvo}/${visao}`, state: { personagemId: personagem.id } };
  }
  if (campanhaId) return { to: `/campanhas/${campanhaId}/${visao}`, state: null };
  return { to: '/campanhas', state: null };
};

const mesmasCampanhas = (a = [], b = []) =>
  a.length === b.length && a.every((id, indice) => id === b[indice]);

// Evita re-render do Layout quando a Ficha salva algo que não muda a seleção.
export const mesmoPersonagemSelecionado = (a, b) =>
  a === b ||
  (Boolean(a) &&
    Boolean(b) &&
    a.id === b.id &&
    a.tipo === b.tipo &&
    a.companheiroDe === b.companheiroDe &&
    mesmasCampanhas(a.campanhas, b.campanhas));

export const resumoPersonagem = personagem => ({
  id: personagem.id,
  tipo: personagem.tipo,
  companheiroDe: personagem.companheiroDe,
  campanhas: personagem.campanhas ?? [],
});
