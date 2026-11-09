import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import CloseIcon from '@mui/icons-material/Close';
import GridOnIcon from '@mui/icons-material/GridOn';

import { useAuth } from 'context/AuthContext';
import { useSelecao } from 'context/selecaoContext';
import {
  addChatMensagem,
  atualizarRecursoAtualPersonagem,
  getCondicoesPorUniverso,
  getPersonagens,
  getRmCampanha,
  normalizarPersonagemCarregado,
  updatePersonagem,
} from 'service/storage';
import { montarMensagemTexto, personagensNaCampanha } from 'common/utils/chat';
import { avancarDuracaoCondicoes } from 'common/utils/formulas';
import { corDoPing } from 'common/utils/grid';
import { podeEditarArea } from 'common/utils/gridAreas';
import { autorDoToken } from 'common/utils/gridRolagem';
import { contarNaoLidas, idDaUltimaMensagem } from 'common/utils/mesa';
import { MOBILE } from 'common/styles/breakpoints';
import useAvisarAcoesChat from 'hooks/useAvisarAcoesChat';
import useIsMobile from 'hooks/useIsMobile';
import useChatCampanha from 'hooks/useChatCampanha';
import useGridCampanha from 'hooks/useGridCampanha';
import useOpcoesDeRolagem from 'hooks/useOpcoesDeRolagem';
import useRolarDoToken from 'hooks/useRolarDoToken';
import ChatSala from 'components/Chat/ChatSala';
import GridMapa from 'components/Grid/GridMapa';
import RolarDoTokenDialog from 'components/Grid/RolarDoTokenDialog';
import ErrorSnackbar from 'components/ErrorSnackbar/ErrorSnackbar';
import { EmptyState } from 'pages/Personagens/styles';
import {
  calcularPpMaximo,
  estadoDoNovoTurno,
  normalizarEstadoCombate,
  prontidaoMaximaDaFicha,
} from 'pages/Personagens/Ficha/prontidao/config';
import { textoAvisoAcao } from 'pages/Personagens/Ficha/prontidao/avisoChat';
import ProntidaoModal from 'pages/Personagens/Ficha/prontidao/ProntidaoModal';
import { autorDaFicha, personagemDaCentral } from './centralNoGrid';
import DivisorMesa from './DivisorMesa';
import useDivisorMesa from './useDivisorMesa';

import { ChatPageWrapper, MesaBarra, MesaChatPainel, MesaCorpo } from './styles';

const FALAR_COMO_MESTRE = '__mestre__';
const SEM_CONDICOES = [];
const STORAGE_KEY_CHAT_ABERTO = 'reDungeonChatAberto';
const STORAGE_KEY_PAINEL_LATERAL = 'reDungeonChatPainelLateral';

const lerEstadoPersistido = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  const valor = window.localStorage.getItem(key);
  if (valor === null) return fallback;
  return valor === 'true';
};

// Mesa da campanha: `visao` "chat" (/campanhas/:id/chat) ou "grid"
// (/campanhas/:id/grid — mapa tático com o chat num painel lateral). As duas
// rotas compartilham o carregamento da campanha e o "Falando como".
const CampanhaChat = ({ visao = 'chat' }) => {
  const { id: campanhaId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { setHeaderExtra } = useOutletContext();
  const { selecao, selecionarPersonagem, selecionarCampanha } = useSelecao();
  const location = useLocation();
  // Vindo do link "Campanhas" com uma ficha aberta: já fala como esse personagem.
  const personagemIdPreferido = location.state?.personagemId ?? null;
  const personagemIdVoltar = personagemIdPreferido ?? selecao.personagem?.id ?? null;

  const [campanha, setCampanha] = useState(null);
  const [meusPersonagens, setMeusPersonagens] = useState([]);
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [falandoComo, setFalandoComo] = useState('');
  const [erro, setErro] = useState(null);
  const [chatAberto, setChatAberto] = useState(() => lerEstadoPersistido(STORAGE_KEY_CHAT_ABERTO, true));
  const [painelLateralMinimizado, setPainelLateralMinimizado] = useState(() =>
    lerEstadoPersistido(STORAGE_KEY_PAINEL_LATERAL, false),
  );
  // Celular, visão grid: mapa OU chat em tela cheia (começa no mapa). O badge
  // do "Chat" conta o que chegou desde a última vez que se saiu do chat.
  const isMobile = useIsMobile();
  // Divisão arrastável mapa | chat (fora do celular). Até 900px o chat fica
  // abaixo do mapa (styles.js) e a divisão passa a mudar a altura.
  const empilhado = useMediaQuery('(max-width: 900px)');
  const divisorMesa = useDivisorMesa({
    orientacao: empilhado ? 'vertical' : 'horizontal',
    ativo: !isMobile,
  });
  const [abaMesa, setAbaMesa] = useState('mapa');
  const [ultimaVistaId, setUltimaVistaId] = useState(undefined);
  // Catálogo de condições do universo (ícones/nomes das condições nos tokens
  // do grid), guardado com o universo a que pertence.
  const [catalogoCondicoes, setCatalogoCondicoes] = useState({
    universoId: null,
    lista: SEM_CONDICOES,
  });
  // Turno (combate.chaveTurno) em que o "Seu turno! Restaurar PP" já foi
  // usado — o botão some até o próximo turno. Recarregar a página durante o
  // próprio turno mostra o botão de novo (limitação aceita).
  const [ppRestauradoEm, setPpRestauradoEm] = useState(null);
  // Token em nome de quem se está rolando (diálogo "Rolar…" do grid).
  const [tokenRolando, setTokenRolando] = useState(null);
  // Central de Ações aberta pela faixa de iniciativa (combate no grid).
  const [centralAberta, setCentralAberta] = useState(false);

  const isMestre = campanha?.mestreId === currentUser.uid;
  const universoId = campanha?.universoId ?? null;
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

  // Só a visão grid usa o catálogo. Falha não é erro para o usuário: os
  // tokens só ficam sem os ícones de condição.
  useEffect(() => {
    if (visao !== 'grid' || !universoId) return undefined;
    let isMounted = true;
    getCondicoesPorUniverso(universoId)
      .then(lista => {
        if (isMounted)
          setCatalogoCondicoes({ universoId, lista: lista ?? SEM_CONDICOES });
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar o catálogo de condições:', error);
      });
    return () => {
      isMounted = false;
    };
  }, [universoId, visao]);

  const handleVoltar = useCallback(() => {
    if (personagemIdVoltar) {
      navigate(`/personagens/${personagemIdVoltar}`);
      return;
    }
    navigate('/campanhas');
  }, [navigate, personagemIdVoltar]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY_CHAT_ABERTO, String(chatAberto));
    }
  }, [chatAberto]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY_PAINEL_LATERAL, String(painelLateralMinimizado));
    }
  }, [painelLateralMinimizado]);

  useEffect(() => {
    setHeaderExtra({
      nome:
        campanha?.nome ??
        (visao === 'grid' ? 'Grid' : visao === 'lateral' ? 'Chat lateral' : 'Chat'),
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
  const grid = useGridCampanha((visao === 'grid' || visao === 'lateral') && autor ? campanhaId : null, {
    uid: currentUser.uid,
    personagemId: autor?.personagemId ?? null,
    isMestre: Boolean(autor?.isMestre),
    ehMestreDaCampanha: isMestre,
    // Nome no meu sinal do mapa (quem estou sendo no "Falando como").
    nome: autor?.autorNome ?? null,
    mestreId: campanha?.mestreId ?? null,
    catalogoCondicoes:
      catalogoCondicoes.universoId === universoId
        ? catalogoCondicoes.lista
        : SEM_CONDICOES,
    // Mensagens de combate ("Encerrar meu turno") assinadas como no chat.
    autorCombate: autor,
  });

  // "Rolar…" no token: o autor é o do TOKEN (não o "Falando como"). Jogador:
  // a ficha do token (ou a do "Falando como" se o token não tem ficha); mestre:
  // a persona do token de NPC/criatura.
  const autorDoTokenRolado = useCallback(
    token =>
      autorDoToken(token, {
        uid: currentUser.uid,
        personagensDoUsuario: meusPersonagens,
        personagemPadraoId: autor?.personagemId ?? null,
        mestre: Boolean(isMestre && autor?.isMestre),
      }),
    [currentUser.uid, meusPersonagens, autor, isMestre],
  );
  const podeRolarToken = useCallback(
    token => grid.ehMeu(token) && Boolean(autorDoTokenRolado(token)),
    [grid, autorDoTokenRolado],
  );
  // Edição de PV/Energia/Fadiga atuais no cartão do próprio token de jogador
  // (ficha do usuário; as barras de todos atualizam pelo listener das fichas).
  const podeEditarRecursos = useCallback(
    token =>
      token.tipo === 'jogador' &&
      Boolean(token.refId) &&
      meusPersonagens.some(p => p.id === token.refId),
    [meusPersonagens],
  );
  const handleAlterarRecurso = useCallback(async (token, recurso, valor) => {
    try {
      await atualizarRecursoAtualPersonagem(token.refId, recurso, valor);
    } catch (error) {
      setErro('Não foi possível atualizar o recurso do personagem.');
      throw error;
    }
  }, []);
  const fichaDoTokenRolando = tokenRolando?.refId
    ? (meusPersonagens.find(p => p.id === tokenRolando.refId) ?? null)
    : null;
  const opcoesRolagem = useOpcoesDeRolagem(fichaDoTokenRolando?.id ?? null, {
    ativo: Boolean(fichaDoTokenRolando),
  });
  const personagemEmChat = useMemo(
    () => meusPersonagens.find(p => p.id === falandoComo) ?? null,
    [falandoComo, meusPersonagens],
  );
  const opcoesCombate = useOpcoesDeRolagem(personagemEmChat?.id ?? null, {
    ativo: Boolean(personagemEmChat),
  });
  const gruposCombate = useMemo(
    () => (opcoesCombate.grupos ?? []).filter(grupo => ['ataque', 'defesa'].includes(grupo.id)),
    [opcoesCombate.grupos],
  );
  const rolarDoToken = useRolarDoToken(campanhaId, { onErro: setErro });
  const handleRolarDoToken = useCallback(
    (expressao, rotulo) =>
      rolarDoToken({ autor: autorDoTokenRolado(tokenRolando), expressao, rotulo }),
    [rolarDoToken, autorDoTokenRolado, tokenRolando],
  );
  const fecharRolarDoToken = useCallback(() => setTokenRolando(null), []);

  // Combate: na vez de um token de jogador meu, "Seu turno! Restaurar PP"
  // faz o mesmo que "Iniciar novo turno" da ficha (não é automático).
  const { combate: combateGrid, tokenDaVez, meuTurno, fichas: fichasGrid } = grid;
  const chaveTurno = combateGrid?.chaveTurno ?? null;
  const fichaDaVez =
    meuTurno && tokenDaVez?.tipo === 'jogador' && tokenDaVez.refId
      ? (fichasGrid?.[tokenDaVez.refId] ?? null)
      : null;
  const podeRestaurarPp =
    Boolean(fichaDaVez) &&
    fichaDaVez.uid === currentUser.uid &&
    Boolean(chaveTurno) &&
    ppRestauradoEm !== chaveTurno;
  const handleRestaurarPp = useCallback(async () => {
    if (!fichaDaVez || !chaveTurno) return;
    try {
      const ficha = normalizarPersonagemCarregado(fichaDaVez);
      const ppMaximo = calcularPpMaximo(prontidaoMaximaDaFicha(ficha));
      // Turno novo do personagem: as condições com duração perdem 1 turno.
      const condicoes = avancarDuracaoCondicoes(ficha.condicoesAtivas);
      await updatePersonagem(
        ficha.id,
        {
          estadoCombate: estadoDoNovoTurno(normalizarEstadoCombate(ficha, ppMaximo), ppMaximo),
          ...(condicoes.mudou ? { condicoesAtivas: condicoes.condicoesAtivas } : {}),
        },
        { base: ficha },
      );
      setPpRestauradoEm(chaveTurno);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Falha ao restaurar a Prontidão:', error);
      setErro('Não foi possível restaurar a Prontidão.');
    }
  }, [chaveTurno, fichaDaVez]);

  // Central de Ações no grid: aparece durante todo o combate para quem tem
  // personagem na iniciativa (centralNoGrid.js escolhe qual). Com a opção do
  // mestre `avisarAcoesChat` ligada, cada ação vira mensagem no chat como o
  // personagem.
  const avisarAcoesChat = useAvisarAcoesChat(visao === 'grid' || visao === 'lateral' ? campanhaId : null);
  const personagemCentralId = personagemDaCentral({
    combate: combateGrid,
    tokens: grid.tokens,
    fichas: fichasGrid,
    meusPersonagensIds: meusPersonagens.map(p => p.id),
    tokenDaVezId: tokenDaVez?.id ?? null,
    falandoComo,
  });
  const fichaBrutaCentral = personagemCentralId ? (fichasGrid?.[personagemCentralId] ?? null) : null;
  const fichaCentral = useMemo(
    () => (fichaBrutaCentral ? normalizarPersonagemCarregado(fichaBrutaCentral) : null),
    [fichaBrutaCentral],
  );
  const salvarFichaCentral = useCallback(
    async patch => {
      if (!fichaCentral) return;
      try {
        // base = a ficha que a Central mostrou: a mescla em três vias não
        // desfaz o que mudou no documento enquanto isso.
        await updatePersonagem(fichaCentral.id, patch, { base: fichaCentral });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Falha ao salvar a Central de Ações:', error);
        setErro('Não foi possível salvar a ação.');
        throw error;
      }
    },
    [fichaCentral],
  );
  const avisarAcaoNoChat = useCallback(
    async acao => {
      if (!avisarAcoesChat || !fichaCentral) return;
      try {
        await addChatMensagem(
          campanhaId,
          montarMensagemTexto(autorDaFicha(currentUser.uid, fichaCentral), textoAvisoAcao(acao)),
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Falha ao avisar a ação no chat:', error);
        setErro('A ação foi salva, mas não foi possível avisar no chat.');
      }
    },
    [avisarAcoesChat, campanhaId, currentUser.uid, fichaCentral],
  );
  // O combate acabou (ou meu token saiu dele): a Central fecha sozinha.
  if (centralAberta && !fichaCentral) setCentralAberta(false);
  if (ultimaVistaId === undefined && !chat.carregando) {
    setUltimaVistaId(idDaUltimaMensagem(chat.mensagens));
  }
  const naoLidas =
    isMobile && abaMesa === 'mapa' ? contarNaoLidas(chat.mensagens, ultimaVistaId) : 0;
  const trocarAbaMesa = (_event, novaAba) => {
    if (!novaAba || novaAba === abaMesa) return;
    if (novaAba === 'mapa') setUltimaVistaId(idDaUltimaMensagem(chat.mensagens));
    setAbaMesa(novaAba);
  };

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
      {visao === 'lateral' && (
        <ToggleButton value="lateral" aria-label="Painel lateral">
          <ChatOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} /> Painel lateral
        </ToggleButton>
      )}
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
        sx={{ minWidth: 200, [MOBILE]: { minWidth: 0, flex: 1 } }}
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

  const nomeFalandoComo =
    opcoesFalarComo.find(opcao => opcao.value === falandoComo)?.label ??
    opcoesFalarComo[0]?.label ??
    'Mestre';

  const cabecalhoChat = (
    <Box sx={{ display: 'flex', width: '100%', alignItems: 'stretch', gap: 1.5, flexWrap: 'wrap' }}>
      <Box
        sx={{
          flex: '1 1 180px',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 0.25,
        }}
      >
        <Typography variant="caption" sx={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Campanha
        </Typography>
        <Typography sx={{ color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.3 }}>
          {campanha.nome}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: '1 1 180px',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 0.25,
        }}
      >
        <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
          {nomeFalandoComo}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1,
          flexWrap: 'wrap',
          ml: 'auto',
        }}
      >
        <Button
          size="small"
          variant="contained"
          startIcon={<GridOnIcon fontSize="small" />}
          onClick={() =>
            navigate(`/campanhas/${campanha.id}/grid`, {
              state: { personagemId: falandoComo !== FALAR_COMO_MESTRE ? falandoComo : null },
            })
          }
          sx={{
            background: 'linear-gradient(180deg, rgba(91, 124, 250, 0.2), rgba(91, 124, 250, 0.08))',
            color: 'var(--text-primary)',
            border: '1px solid rgba(91, 124, 250, 0.45)',
            '&:hover': { background: 'rgba(91, 124, 250, 0.18)' },
          }}
        >
          Abrir Grid
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<ChatOutlinedIcon fontSize="small" />}
          onClick={() =>
            navigate(`/campanhas/${campanha.id}/chat`, {
              state: { personagemId: falandoComo !== FALAR_COMO_MESTRE ? falandoComo : null },
            })
          }
          sx={{
            background: 'linear-gradient(180deg, rgba(91, 124, 250, 0.2), rgba(91, 124, 250, 0.08))',
            color: 'var(--text-primary)',
            border: '1px solid rgba(91, 124, 250, 0.45)',
            '&:hover': { background: 'rgba(91, 124, 250, 0.18)' },
          }}
        >
          Tela Cheia
        </Button>
        {(visao === 'lateral' || visao === 'grid') && (
          <>
            <Button
              size="small"
              variant="text"
              onClick={() => {
                if (visao === 'lateral') setPainelLateralMinimizado(value => !value);
                else setChatAberto(value => !value);
              }}
              sx={{ minWidth: 0, color: 'var(--text-secondary)' }}
            >
              {visao === 'lateral' ? (painelLateralMinimizado ? 'Reabrir' : 'Minimizar') : chatAberto ? 'Ocultar' : 'Mostrar'}
            </Button>
            <Tooltip title="Fechar painel">
              <IconButton
                size="small"
                aria-label="Fechar painel"
                onClick={() => {
                  if (visao === 'lateral') setPainelLateralMinimizado(true);
                  else setChatAberto(false);
                }}
                sx={{
                  color: 'rgba(248, 113, 113, 0.9)',
                  background: 'rgba(127, 29, 29, 0.16)',
                  border: '1px solid rgba(248,113,113,0.25)',
                  '&:hover': { background: 'rgba(127,29,29,0.28)' },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Box>
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
      audio={chat.audio}
      onApagar={chat.apagar}
      cabecalho={cabecalho}
      opcoesCombate={gruposCombate}
      chaveHistorico={`reDungeonChatHistorico_${campanhaId}`}
    />
  );

  // No celular o alternador Mapa | Chat substitui Chat|Grid e "Ocultar chat".
  const alternadorMesa = (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={abaMesa}
      onChange={trocarAbaMesa}
      aria-label="Mostrar mapa ou chat"
    >
      <ToggleButton value="mapa" aria-label="Mapa">
        <GridOnIcon fontSize="small" sx={{ mr: 0.5 }} /> Mapa
      </ToggleButton>
      <ToggleButton value="chat" aria-label={naoLidas ? `Chat, ${naoLidas} novas` : 'Chat'}>
        <Badge badgeContent={naoLidas} color="secondary" max={99} sx={{ mr: 0.5 }}>
          <ChatOutlinedIcon fontSize="small" />
        </Badge>{' '}
        Chat
      </ToggleButton>
    </ToggleButtonGroup>
  );

  if (visao === 'grid' || visao === 'lateral') {
    let aviso = null;
    if (grid.carregando) aviso = 'Carregando o grid…';
    else if (grid.semCena) aviso = 'O mestre ainda não abriu uma cena.';
    const mostrarPainelChat = visao === 'lateral' ? !painelLateralMinimizado : chatAberto || isMobile;
    const mostrarDivisor = mostrarPainelChat && !isMobile;
    return (
      <ChatPageWrapper>
        <MesaBarra>
          {isMobile ? alternadorMesa : seletorVisao}
          {falandoComoCampo}
          {grid.nomeCena && (
            <Typography
              variant="body2"
              sx={{
                color: 'var(--text-secondary)',
                [MOBILE]: { width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
              }}
            >
              Cena: <strong>{grid.nomeCena}</strong>
            </Typography>
          )}
          {!isMobile && (
            <Button
              size="small"
              startIcon={<ChatOutlinedIcon fontSize="small" />}
              onClick={() => {
                if (visao === 'lateral') {
                  setPainelLateralMinimizado(value => !value);
                  return;
                }
                setChatAberto(aberto => !aberto);
              }}
              aria-label={visao === 'lateral' ? (painelLateralMinimizado ? 'Reabrir chat' : 'Minimizar chat') : (chatAberto ? 'Ocultar chat' : 'Mostrar chat')}
              aria-pressed={visao === 'lateral' ? !painelLateralMinimizado : chatAberto}
              sx={{ ml: 'auto' }}
            >
              {visao === 'lateral'
                ? painelLateralMinimizado
                  ? 'Reabrir chat'
                  : 'Minimizar chat'
                : chatAberto
                  ? 'Ocultar chat'
                  : 'Mostrar chat'}
            </Button>
          )}
        </MesaBarra>
        {/* data-aba: no celular, o CSS mostra só o mapa ou só o chat — os dois
            seguem montados (zoom do mapa e rolagem do chat não se perdem). */}
        <MesaCorpo
          ref={divisorMesa.refCorpo}
          data-aba={isMobile ? abaMesa : undefined}
          data-divisor={mostrarDivisor ? 'true' : undefined}
        >
          {/* key: trocar de cena recomeça zoom/pan (mapa encaixado). */}
          <GridMapa
            key={grid.cenaId ?? 'sem-cena'}
            config={grid.config}
            tokens={grid.tokens}
            podeMover={grid.podeMover}
            ehMeu={grid.ehMeu}
            onMover={grid.mover}
            rastros={grid.rastrosAtivos}
            aviso={aviso}
            mestre={grid.veTudo}
            onPing={grid.pingar}
            pings={grid.pings}
            detalhes={grid.detalhes}
            combate={grid.combate}
            travamento={grid.travamento}
            camadas={grid.camadas}
            marcadores={grid.marcadores}
            desenhos={grid.desenhos}
            onDesenhar={grid.desenhar}
            acoesDesenho={{
              apagarMeus: grid.apagarMeusDesenhos,
              apagarTodos: grid.veTudo ? grid.apagarTodosDesenhos : undefined,
            }}
            areas={grid.areas}
            acoesAreas={grid.acoesAreas}
            podeEditarArea={area => podeEditarArea(area, currentUser.uid, grid.veTudo)}
            corAreaPadrao={corDoPing(currentUser.uid, campanha?.mestreId ?? null)}
            podeRolarToken={podeRolarToken}
            podeEditarRecursos={podeEditarRecursos}
            onAlterarRecurso={handleAlterarRecurso}
            onRolarToken={setTokenRolando}
            acoesCombate={{
              encerrarTurno: grid.meuTurno ? grid.encerrarTurno : undefined,
              restaurarPp: podeRestaurarPp ? handleRestaurarPp : undefined,
              centralAcoes: fichaCentral ? () => setCentralAberta(true) : undefined,
              ...(grid.veTudo
                ? { anterior: () => grid.mudarTurno(-1), proximo: () => grid.mudarTurno(1) }
                : {}),
            }}
          />
          {mostrarDivisor && <DivisorMesa {...divisorMesa.divisor} />}
          {mostrarPainelChat && (
            <MesaChatPainel
              ref={divisorMesa.refPainel}
              style={divisorMesa.estiloPainel}
              data-ajustado={divisorMesa.estiloPainel ? 'true' : undefined}
            >
              {chatSala(cabecalhoChat)}
            </MesaChatPainel>
          )}
        </MesaCorpo>
        <RolarDoTokenDialog
          open={Boolean(tokenRolando)}
          token={tokenRolando}
          grupos={opcoesRolagem.grupos}
          carregando={opcoesRolagem.carregando}
          onRolar={handleRolarDoToken}
          onClose={fecharRolarDoToken}
        />
        {fichaCentral && (
          <ProntidaoModal
            open={centralAberta}
            onClose={() => setCentralAberta(false)}
            personagem={fichaCentral}
            onSave={salvarFichaCentral}
            prontidaoValor={prontidaoMaximaDaFicha(fichaCentral)}
            tipo="central"
            origem="grid"
            onAcaoRegistrada={avisarAcaoNoChat}
          />
        )}
        <ErrorSnackbar open={!!erroExibido} mensagem={erroExibido} onClose={fecharErro} />
      </ChatPageWrapper>
    );
  }

  return (
    <ChatPageWrapper>
      <MesaBarra>
        {isMobile ? alternadorMesa : seletorVisao}
        {falandoComoCampo}
        {grid.nomeCena && (
          <Typography
            variant="body2"
            sx={{
              color: 'var(--text-secondary)',
              [MOBILE]: { width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
            }}
          >
            Cena: <strong>{grid.nomeCena}</strong>
          </Typography>
        )}
        {!isMobile && (
          <Button
            size="small"
            startIcon={<ChatOutlinedIcon fontSize="small" />}
            onClick={() => {
              setChatAberto(aberto => !aberto);
            }}
            aria-label={chatAberto ? 'Ocultar chat' : 'Mostrar chat'}
            aria-pressed={chatAberto}
            sx={{ ml: 'auto' }}
          >
            {chatAberto ? 'Ocultar chat' : 'Mostrar chat'}
          </Button>
        )}
      </MesaBarra>
      {chatSala(cabecalhoChat)}
      <ErrorSnackbar open={!!erroExibido} mensagem={erroExibido} onClose={fecharErro} />
    </ChatPageWrapper>
  );
};

CampanhaChat.propTypes = {
  visao: PropTypes.oneOf(['chat', 'grid', 'lateral']),
};

export default CampanhaChat;
