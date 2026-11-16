import { removerChatMembroDoPersonagem } from 'service/storage';

import { esquecerRegistroMembroDoChat } from './useMembroDoChat';

// Só neste site. As regras do chat/grid conferem só que o ponteiro
// rmCampanhas/{id}/chatMembros/{uid} existe, então:
// - campanha desmarcada na ficha (ou personagem excluído) → apaga o ponteiro
//   (se ele aponta para este personagem), cortando o acesso;
// - campanha marcada → esquece o registro em memória do useMembroDoChat, para
//   a próxima abertura do chat gravar o ponteiro na hora.
// Melhor esforço: uma falha não impede o salvamento da ficha (e é devolvida
// para quem chamou decidir se avisa).
export const sincronizarMembrosDoChat = async ({ uid, personagemId, antes = [], depois = [] }) => {
  if (!uid || !personagemId) return [];
  const anteriores = new Set(antes.filter(Boolean));
  const atuais = new Set(depois.filter(Boolean));
  const removidas = [...anteriores].filter(id => !atuais.has(id));
  const adicionadas = [...atuais].filter(id => !anteriores.has(id));

  [...removidas, ...adicionadas].forEach(campanhaId => esquecerRegistroMembroDoChat(campanhaId, uid));

  const resultados = await Promise.allSettled(
    // async: um erro síncrono vira rejeição e não derruba quem chamou.
    removidas.map(async campanhaId => removerChatMembroDoPersonagem(campanhaId, uid, personagemId)),
  );
  return resultados.filter(resultado => resultado.status === 'rejected').map(resultado => resultado.reason);
};
