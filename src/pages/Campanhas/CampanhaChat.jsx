import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import GridOnIcon from '@mui/icons-material/GridOn';

import { useAuth } from 'context/AuthContext';
import { useSelecao } from 'context/selecaoContext';
import { getPersonagens, getRmCampanha } from 'service/storage';
import { personagensNaCampanha } from 'common/utils/chat';
import useChatCampanha from 'hooks/useChatCampanha';
import useGridCampanha from 'hooks/useGridCampanha';
import ChatSala from 'components/Chat/ChatSala';
import GridMapa from 'components/Grid/GridMapa';
import ErrorSnackbar from 'components/ErrorSnackbar/ErrorSnackbar';
import { EmptyState } from 'pages/Personagens/styles';

import { ChatPageWrapper, MesaBarra, MesaChatPainel, MesaCorpo } from './styles';

const FALAR_COMO_MESTRE = '__mestre__';

// Mesa da campanha: `visao` "chat" (/campanhas/:id/chat) ou "grid"
// (/campanhas/:id/grid — mapa tático com o chat num painel lateral). As duas
// rotas compartilham o carregamento da campanha e o "Falando como".
const CampanhaChat = ({ visao = 'chat' }) => {
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
  const [chatAberto, setChatAberto] = useState(true);

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
        else if (campanhaDoc?.mestreId === currentUser.uid)
          setFalandoComo(FALAR_COMO_MESTRE);
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
    if (campanha) selecionarCampanha(campanhaId, visao);
  }, [campanha, campanhaId, visao, selecionarCampanha]);

  useEffect(() => {
    const personagem = meusPersonagens.find(p => p.id === falandoComo);
    if (personagem) selecionarPersonagem(personagem);
  }, [falandoComo, meusPersonagens, selecionarPersonagem]);

  const handleVoltar = useCallback(() => navigate('/campanhas'), [navigate]);

  useEffect(() => {
    setHeaderExtra({
      nome: campanha?.nome ?? (visao === 'grid' ? 'Grid' : 'Chat'),
      onVoltar: handleVoltar,
    });
    return () => setHeaderExtra(null);
  }, [campanha, visao, handleVoltar, setHeaderExtra]);

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

  const chat = useChatCampanha(campanhaId, autor, { ehMestreDaCampanha: isMestre });
  // Grid só escuta na visão "grid" (e depois que o "Falando como" existe).
  const grid = useGridCampanha(visao === 'grid' && autor ? campanhaId : null, {
    uid: currentUser.uid,
    personagemId: autor?.personagemId ?? null,
    isMestre: Boolean(autor?.isMestre),
    ehMestreDaCampanha: isMestre,
  });
  const erroExibido = erro ?? chat.erro ?? grid.erro;
  const fecharErro = () => {
    setErro(null);
    chat.limparErro();
    grid.limparErro();
  };

  const trocarVisao = (_event, novaVisao) => {
    if (!novaVisao || novaVisao === visao) return;
    const personagemId =
      falandoComo && falandoComo !== FALAR_COMO_MESTRE ? falandoComo : null;
    navigate(`/campanhas/${campanhaId}/${novaVisao}`, {
      state: personagemId ? { personagemId } : null,
    });
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

  const seletorVisao = (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={visao}
      onChange={trocarVisao}
      aria-label="Visão da campanha"
    >
      <ToggleButton value="chat" aria-label="Chat">
        <ChatOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} /> Chat
      </ToggleButton>
      <ToggleButton value="grid" aria-label="Grid">
        <GridOnIcon fontSize="small" sx={{ mr: 0.5 }} /> Grid
      </ToggleButton>
    </ToggleButtonGroup>
  );

  const falandoComoCampo =
    opcoesFalarComo.length > 1 ? (
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
    );

  const chatSala = cabecalho => (
    <ChatSala
      mensagens={chat.mensagens}
      carregando={chat.carregando}
      currentUid={currentUser.uid}
      podeApagarTodas={isMestre}
      onEnviarTexto={chat.enviarTexto}
      onEnviarImagem={chat.enviarImagem}
      onRolar={chat.rolar}
      macros={chat.macros}
      onApagar={chat.apagar}
      cabecalho={cabecalho}
    />
  );

  if (visao === 'grid') {
    let aviso = null;
    if (grid.carregando) aviso = 'Carregando o grid…';
    else if (grid.semCena) aviso = 'O mestre ainda não abriu uma cena.';
    return (
      <ChatPageWrapper>
        <MesaBarra>
          {seletorVisao}
          {falandoComoCampo}
          {grid.nomeCena && (
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              Cena: <strong>{grid.nomeCena}</strong>
            </Typography>
          )}
          <Button
            size="small"
            startIcon={<ChatOutlinedIcon fontSize="small" />}
            onClick={() => setChatAberto(aberto => !aberto)}
            aria-pressed={chatAberto}
            sx={{ ml: 'auto' }}
          >
            {chatAberto ? 'Ocultar chat' : 'Mostrar chat'}
          </Button>
        </MesaBarra>
        <MesaCorpo>
          {/* key: trocar de cena recomeça zoom/pan (mapa encaixado). */}
          <GridMapa
            key={grid.cenaId ?? 'sem-cena'}
            config={grid.config}
            tokens={grid.tokens}
            podeMover={grid.podeMover}
            onMover={grid.mover}
            aviso={aviso}
          />
          {chatAberto && (
            <MesaChatPainel>
              {chatSala(
                <Typography sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  Chat
                </Typography>,
              )}
            </MesaChatPainel>
          )}
        </MesaCorpo>
        <ErrorSnackbar open={!!erroExibido} mensagem={erroExibido} onClose={fecharErro} />
      </ChatPageWrapper>
    );
  }

  return (
    <ChatPageWrapper>
      {chatSala(
        <>
          {seletorVisao}
          {falandoComoCampo}
        </>,
      )}
      <ErrorSnackbar open={!!erroExibido} mensagem={erroExibido} onClose={fecharErro} />
    </ChatPageWrapper>
  );
};

CampanhaChat.propTypes = {
  visao: PropTypes.oneOf(['chat', 'grid']),
};

export default CampanhaChat;
