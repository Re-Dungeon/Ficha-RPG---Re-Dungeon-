import { useCallback, useEffect, useState } from 'react';

import {
  addChatMensagem,
  removeChatMensagem,
  setChatMembro,
  subscribeChatMensagens,
} from 'service/storage';
import { montarMensagemImagem, montarMensagemTexto } from 'common/utils/chat';

// Liga um componente ao chat de uma campanha (rmCampanhas/{id}/chatMensagens):
// registra o ponteiro chatMembros/{uid} do jogador, ouve as mensagens em tempo
// real e expõe enviar/apagar. Usado pela página /campanhas/:id/chat e pelo
// modal "Chat" da ficha. `autor` = campos de montarMensagem* (uid,
// personagemId, autorNome, autorAvatar, isMestre); `null` deixa o hook inativo
// (ex.: enquanto a campanha ainda carrega).
const useChatCampanha = (campanhaId, autor) => {
  const uid = autor?.uid ?? null;
  const personagemId = autor?.personagemId ?? null;
  const isMestre = Boolean(autor?.isMestre);

  // Campanha para a qual o ponteiro de membro já foi gravado ao menos uma vez.
  // Trocar de personagem dentro da mesma campanha regrava o ponteiro, mas não
  // derruba a escuta (a regra de leitura é revalidada a cada request).
  const [membroDaCampanha, setMembroDaCampanha] = useState(null);
  // Mensagens guardadas junto da campanha a que pertencem: ao trocar de
  // campanha, `carregando` volta a true sem setState síncrono no efeito.
  const [recebido, setRecebido] = useState({ campanhaId: null, mensagens: [] });
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!campanhaId || !uid || isMestre || !personagemId) return undefined;
    let isMounted = true;
    setChatMembro(campanhaId, uid, personagemId)
      .then(() => {
        if (isMounted) setMembroDaCampanha(campanhaId);
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Falha ao registrar no chat:', error);
        if (!isMounted) return;
        setErro('Não foi possível entrar no chat desta campanha.');
        setRecebido({ campanhaId, mensagens: [] });
      });
    return () => {
      isMounted = false;
    };
  }, [campanhaId, uid, personagemId, isMestre]);

  // O mestre não precisa do ponteiro (acesso via `mestreId` da campanha).
  const podeOuvir = Boolean(campanhaId && uid && (isMestre || membroDaCampanha === campanhaId));

  useEffect(() => {
    if (!podeOuvir) return undefined;
    return subscribeChatMensagens(
      campanhaId,
      mensagens => setRecebido({ campanhaId, mensagens }),
      error => {
        // eslint-disable-next-line no-console
        console.error('Falha ao ouvir mensagens:', error);
        setErro('Sem permissão para ver as mensagens desta campanha.');
        setRecebido({ campanhaId, mensagens: [] });
      },
    );
  }, [campanhaId, podeOuvir]);

  const enviar = useCallback(
    async mensagem => {
      try {
        await addChatMensagem(campanhaId, mensagem);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Falha ao enviar mensagem:', error);
        setErro('Não foi possível enviar a mensagem.');
        throw error;
      }
    },
    [campanhaId],
  );

  const enviarTexto = useCallback(texto => enviar(montarMensagemTexto(autor, texto)), [enviar, autor]);
  const enviarImagem = useCallback(url => enviar(montarMensagemImagem(autor, url)), [enviar, autor]);

  const apagar = useCallback(
    async mensagem => {
      if (!window.confirm('Apagar esta mensagem?')) return;
      try {
        await removeChatMensagem(campanhaId, mensagem.id);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Falha ao apagar mensagem:', error);
        setErro('Não foi possível apagar a mensagem.');
      }
    },
    [campanhaId],
  );

  const limparErro = useCallback(() => setErro(null), []);

  const carregando = recebido.campanhaId !== campanhaId;

  return {
    mensagens: carregando ? [] : recebido.mensagens,
    carregando,
    erro,
    limparErro,
    enviarTexto,
    enviarImagem,
    apagar,
  };
};

export default useChatCampanha;
