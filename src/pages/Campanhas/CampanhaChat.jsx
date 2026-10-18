import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useAuth } from 'context/AuthContext';
import { useSelecao } from 'context/selecaoContext';
import { getPersonagens, getRmCampanha } from 'service/storage';
import { personagensNaCampanha } from 'common/utils/chat';
import useChatCampanha from 'hooks/useChatCampanha';
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
  const { selecionarPersonagem, selecionarCampanha } = useSelecao();
  // Vindo do link "Campanhas" com uma ficha aberta: já fala como esse personagem.
  const personagemIdPreferido = useLocation().state?.personagemId ?? null;

  const [campanha, setCampanha] = useState(null);
  const [meusPersonagens, setMeusPersonagens] = useState([]);
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [falandoComo, setFalandoComo] = useState('');
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
        const preferido = daCampanha.find(p => p.id === personagemIdPreferido);
        if (daCampanha.length > 0) setFalandoComo((preferido ?? daCampanha[0]).id);
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
  }, [campanhaId, currentUser.uid, personagemIdPreferido]);

  // Lembra este chat (e o personagem com que se está falando) para os links
  // "Fichas"/"Campanhas" do cabeçalho reabrirem aqui / na ficha dele.
  useEffect(() => {
    if (campanha) selecionarCampanha(campanhaId);
  }, [campanha, campanhaId, selecionarCampanha]);

  useEffect(() => {
    const personagem = meusPersonagens.find(p => p.id === falandoComo);
    if (personagem) selecionarPersonagem(personagem);
  }, [falandoComo, meusPersonagens, selecionarPersonagem]);

  const handleVoltar = useCallback(() => navigate('/campanhas'), [navigate]);

  useEffect(() => {
    setHeaderExtra({ nome: campanha?.nome ?? 'Chat', onVoltar: handleVoltar });
    return () => setHeaderExtra(null);
  }, [campanha, handleVoltar, setHeaderExtra]);

  // null até a campanha carregar e o "Falando como" ser definido — mantém o
  // hook do chat inativo (sem ponteiro de membro nem escuta) até lá.
  const autor = useMemo(() => {
    if (!falandoComo) return null;
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

  const chat = useChatCampanha(campanhaId, autor);
  const erroExibido = erro ?? chat.erro;
  const fecharErro = () => {
    setErro(null);
    chat.limparErro();
  };

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
        <ErrorSnackbar open={!!erroExibido} mensagem={erroExibido} onClose={fecharErro} />
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
        mensagens={chat.mensagens}
        carregando={chat.carregando}
        currentUid={currentUser.uid}
        podeApagarTodas={isMestre}
        onEnviarTexto={chat.enviarTexto}
        onEnviarImagem={chat.enviarImagem}
        onApagar={chat.apagar}
        cabecalho={cabecalho}
      />
      <ErrorSnackbar open={!!erroExibido} mensagem={erroExibido} onClose={fecharErro} />
    </ChatPageWrapper>
  );
};

export default CampanhaChat;
