import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Badge from '@mui/material/Badge';
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
import {
  getCondicoesPorUniverso,
  getPersonagens,
  getRmCampanha,
  normalizarPersonagemCarregado,
  updatePersonagem,
} from 'service/storage';
import { personagensNaCampanha } from 'common/utils/chat';
import { corDoPing } from 'common/utils/grid';
import { podeEditarArea } from 'common/utils/gridAreas';
import { autorDoToken } from 'common/utils/gridRolagem';
import { contarNaoLidas, idDaUltimaMensagem } from 'common/utils/mesa';
import { MOBILE } from 'common/styles/breakpoints';
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

import { ChatPageWrapper, MesaBarra, MesaChatPainel, MesaCorpo } from './styles';

const FALAR_COMO_MESTRE = '__mestre__';
const SEM_CONDICOES = [];

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
  // Celular, visão grid: mapa OU chat em tela cheia (começa no mapa). O badge
  // do "Chat" conta o que chegou desde a última vez que se saiu do chat.
  const isMobile = useIsMobile();
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
  const fichaDoTokenRolando = tokenRolando?.refId
    ? (meusPersonagens.find(p => p.id === tokenRolando.refId) ?? null)
    : null;
  const opcoesRolagem = useOpcoesDeRolagem(fichaDoTokenRolando?.id ?? null, {
    ativo: Boolean(fichaDoTokenRolando),
  });
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
      await updatePersonagem(ficha.id, {
        estadoCombate: estadoDoNovoTurno(normalizarEstadoCombate(ficha, ppMaximo), ppMaximo),
      });
      setPpRestauradoEm(chaveTurno);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Falha ao restaurar a Prontidão:', error);
      setErro('Não foi possível restaurar a Prontidão.');
    }
  }, [chaveTurno, fichaDaVez]);
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
    />
  );

  if (visao === 'grid') {
    let aviso = null;
    if (grid.carregando) aviso = 'Carregando o grid…';
    else if (grid.semCena) aviso = 'O mestre ainda não abriu uma cena.';
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
              onClick={() => setChatAberto(aberto => !aberto)}
              aria-pressed={chatAberto}
              sx={{ ml: 'auto' }}
            >
              {chatAberto ? 'Ocultar chat' : 'Mostrar chat'}
            </Button>
          )}
        </MesaBarra>
        {/* data-aba: no celular, o CSS mostra só o mapa ou só o chat — os dois
            seguem montados (zoom do mapa e rolagem do chat não se perdem). */}
        <MesaCorpo data-aba={isMobile ? abaMesa : undefined}>
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
            onRolarToken={setTokenRolando}
            acoesCombate={{
              encerrarTurno: grid.meuTurno ? grid.encerrarTurno : undefined,
              restaurarPp: podeRestaurarPp ? handleRestaurarPp : undefined,
              ...(grid.veTudo
                ? { anterior: () => grid.mudarTurno(-1), proximo: () => grid.mudarTurno(1) }
                : {}),
            }}
          />
          {(chatAberto || isMobile) && (
            <MesaChatPainel>
              {chatSala(
                <Typography sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  Chat
                </Typography>,
              )}
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
