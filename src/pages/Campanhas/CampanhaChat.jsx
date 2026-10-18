import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useAuth } from 'context/AuthContext';
import {
  addChatMensagem,
  getPersonagens,
  getRmCampanha,
  removeChatMensagem,
  setChatMembro,
  subscribeChatMensagens,
} from 'service/storage';
import { montarMensagemImagem, montarMensagemTexto, personagensNaCampanha } from 'common/utils/chat';
import ChatSala from 'components/Chat/ChatSala';
import ErrorSnackbar from 'components/ErrorSnackbar/ErrorSnackbar';
import { EmptyState } from 'pages/Personagens/styles';

import { ChatPageWrapper } from './styles';

const FALAR_COMO_MESTRE = '__mestre__';

const CampanhaChat = () => {
  const { id: campanhaId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { setHeaderExtra } = useOutletContext();

  const [campanha, setCampanha] = useState(null);
  const [meusPersonagens, setMeusPersonagens] = useState([]);
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [falandoComo, setFalandoComo] = useState('');
  const [membroPronto, setMembroPronto] = useState(false);
  const [mensagens, setMensagens] = useState([]);
  const [carregandoMensagens, setCarregandoMensagens] = useState(true);
  const [erro, setErro] = useState(null);

  const isMestre = campanha?.mestreId === currentUser.uid;
  const temAcesso = isMestre || meusPersonagens.length > 0;

  useEffect(() => {
    let isMounted = true;
    Promise.all([getRmCampanha(campanhaId), getPersonagens(currentUser.uid)])
      .then(([campanhaDoc, personagens]) => {
        if (!isMounted) return;
        const daCampanha = personagensNaCampanha(personagens, campanhaId);
        setCampanha(campanhaDoc);
        setMeusPersonagens(daCampanha);
        if (daCampanha.length > 0) setFalandoComo(daCampanha[0].id);
        else if (campanhaDoc?.mestreId === currentUser.uid) setFalandoComo(FALAR_COMO_MESTRE);
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar a campanha:', error);
        if (isMounted) setErro('Não foi possível carregar a campanha.');
      })
      .finally(() => {
        if (isMounted) setCarregandoInicial(false);
      });
    return () => {
      isMounted = false;
    };
  }, [campanhaId, currentUser.uid]);

  const handleVoltar = useCallback(() => navigate('/campanhas'), [navigate]);

  useEffect(() => {
    setHeaderExtra({ nome: campanha?.nome ?? 'Chat', onVoltar: handleVoltar });
    return () => setHeaderExtra(null);
  }, [campanha, handleVoltar, setHeaderExtra]);

  // O ponteiro chatMembros/{uid} é o que a regra de leitura usa para achar o
  // personagem do jogador — (re)gravado ao abrir o chat e ao trocar o
  // "Falando como". O mestre não precisa dele (acesso via `mestreId`).
  useEffect(() => {
    if (!falandoComo) return undefined;
    if (falandoComo === FALAR_COMO_MESTRE) {
      setMembroPronto(true);
      return undefined;
    }
    let isMounted = true;
    setChatMembro(campanhaId, currentUser.uid, falandoComo)
      .then(() => {
        if (isMounted) setMembroPronto(true);
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Falha ao registrar no chat:', error);
        if (isMounted) setErro('Não foi possível entrar no chat desta campanha.');
      });
    return () => {
      isMounted = false;
    };
  }, [campanhaId, currentUser.uid, falandoComo]);

  useEffect(() => {
    if (!membroPronto) return undefined;
    return subscribeChatMensagens(
      campanhaId,
      novasMensagens => {
        setMensagens(novasMensagens);
        setCarregandoMensagens(false);
      },
      error => {
        // eslint-disable-next-line no-console
        console.error('Falha ao ouvir mensagens:', error);
        setErro('Sem permissão para ver as mensagens desta campanha.');
        setCarregandoMensagens(false);
      },
    );
  }, [campanhaId, membroPronto]);

  const autor = useMemo(() => {
    if (falandoComo === FALAR_COMO_MESTRE) {
      return { uid: currentUser.uid, autorNome: 'Mestre', isMestre: true };
    }
    const personagem = meusPersonagens.find(p => p.id === falandoComo);
    return {
      uid: currentUser.uid,
      personagemId: personagem?.id ?? null,
      autorNome: personagem?.nome ?? 'Jogador',
      autorAvatar: personagem?.linkImagem ?? null,
      isMestre: false,
    };
  }, [falandoComo, meusPersonagens, currentUser.uid]);

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

  const handleEnviarTexto = useCallback(texto => enviar(montarMensagemTexto(autor, texto)), [enviar, autor]);
  const handleEnviarImagem = useCallback(url => enviar(montarMensagemImagem(autor, url)), [enviar, autor]);

  const handleApagar = useCallback(
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

  if (carregandoInicial) {
    return (
      <EmptyState>
        <CircularProgress size={28} sx={{ color: 'var(--color-primary)' }} />
      </EmptyState>
    );
  }

  if (!campanha || !temAcesso) {
    return (
      <EmptyState>
        <p>Você não tem um personagem nesta campanha.</p>
        <ErrorSnackbar open={!!erro} mensagem={erro} onClose={() => setErro(null)} />
      </EmptyState>
    );
  }

  const opcoesFalarComo = [
    ...meusPersonagens.map(p => ({ value: p.id, label: p.nome })),
    ...(isMestre ? [{ value: FALAR_COMO_MESTRE, label: 'Mestre' }] : []),
  ];

  const cabecalho = (
    <>
      <Typography sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>Chat da campanha</Typography>
      {opcoesFalarComo.length > 1 ? (
        <TextField
          select
          size="small"
          label="Falando como"
          value={falandoComo}
          onChange={event => setFalandoComo(event.target.value)}
          sx={{ minWidth: 200 }}
        >
          {opcoesFalarComo.map(opcao => (
            <MenuItem key={opcao.value} value={opcao.value}>
              {opcao.label}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          Falando como <strong>{opcoesFalarComo[0]?.label}</strong>
        </Typography>
      )}
    </>
  );

  return (
    <ChatPageWrapper>
      <ChatSala
        mensagens={mensagens}
        carregando={carregandoMensagens}
        currentUid={currentUser.uid}
        podeApagarTodas={isMestre}
        onEnviarTexto={handleEnviarTexto}
        onEnviarImagem={handleEnviarImagem}
        onApagar={handleApagar}
        cabecalho={cabecalho}
      />
      <ErrorSnackbar open={!!erro} mensagem={erro} onClose={() => setErro(null)} />
    </ChatPageWrapper>
  );
};

export default CampanhaChat;
