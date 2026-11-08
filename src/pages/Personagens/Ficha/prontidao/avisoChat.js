import { CHAT_TEXTO_MAX } from 'common/utils/chat';

// Texto da mensagem que a Central de Ações (aberta pelo Grid em combate) posta
// no chat quando o mestre liga "Ações no chat" (grid/atual.avisarAcoesChat).
// Ex.: "⚡ Atacar — -2 PP (PP 3/8)". `ppAtual` null omite o sufixo de PP
// (o descanso já descreve o PP no detalhe).
export const textoAvisoAcao = ({ nome, detalhe, ppAtual = null, ppMaximo = null }) => {
  const titulo = String(nome ?? '').trim() || 'Ação';
  const descricao = String(detalhe ?? '').trim();
  const numero = valor => (valor === null || valor === undefined ? NaN : Number(valor));
  const pp =
    Number.isFinite(numero(ppAtual)) && Number.isFinite(numero(ppMaximo))
      ? ` (PP ${numero(ppAtual)}/${numero(ppMaximo)})`
      : '';
  const texto = `⚡ ${titulo}${descricao ? ` — ${descricao}` : ''}${pp}`;
  return texto.length > CHAT_TEXTO_MAX ? `${texto.slice(0, CHAT_TEXTO_MAX - 1)}…` : texto;
};

const ROTULOS_STATUS = { saude: 'Saúde', energia: 'Energia', fadiga: 'Fadiga' };

// "Saúde, Energia" a partir dos ids escolhidos no uso de item.
export const rotulosDosStatus = ids =>
  (ids ?? [])
    .filter(Boolean)
    .map(id => ROTULOS_STATUS[id] ?? id)
    .join(', ');
