import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import GridOnIcon from '@mui/icons-material/GridOn';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { useAuth } from 'context/AuthContext';
import { getRmCampanha } from 'service/storage';
import { campanhaIdsDosPersonagens } from 'common/utils/chat';
import useChatCampanha from 'hooks/useChatCampanha';
import useOpcoesDeRolagem from 'hooks/useOpcoesDeRolagem';
import ChatSala from 'components/Chat/ChatSala';
import ErrorSnackbar from 'components/ErrorSnackbar/ErrorSnackbar';

import { DialogFecharButton, DialogHeaderRow, DialogHeaderTitle } from '../styles';

const textoMutedSx = { color: 'var(--text-secondary)', textAlign: 'center', py: 4 };

// Conteúdo só é montado com o modal aberto (Dialog não renderiza os filhos
// fechado) — a escuta em tempo real do chat vive só enquanto ele está visível.
export const ChatModalConteudo = ({ personagem, modo = 'modal', onAbrirPainelLateral, onClose = null, campanhaIdInicial = null, onCampanhaChange = null }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 599.95px)');
  const campanhaIds = useMemo(
    () => campanhaIdsDosPersonagens([personagem]),
    [personagem],
  );

  const [campanhas, setCampanhas] = useState(null);
  const [campanhaId, setCampanhaId] = useState(campanhaIdInicial ?? campanhaIds[0] ?? '');

  useEffect(() => {
    if (campanhaIdInicial && campanhaIds.includes(campanhaIdInicial)) {
      setCampanhaId(campanhaIdInicial);
    }
  }, [campanhaIdInicial, campanhaIds]);

  useEffect(() => {
    let isMounted = true;
    Promise.all(campanhaIds.map(id => getRmCampanha(id).catch(() => null))).then(docs => {
      if (isMounted) setCampanhas(docs.filter(Boolean));
    });
    return () => {
      isMounted = false;
    };
  }, [campanhaIds]);

  const campanha = campanhas?.find(c => c.id === campanhaId) ?? null;

  // Na ficha o jogador fala sempre como este personagem.
  const autor = useMemo(
    () =>
      campanha
        ? {
            uid: currentUser.uid,
            personagemId: personagem.id,
            autorNome: personagem.nome,
            autorAvatar: personagem.linkImagem ?? null,
            isMestre: false,
          }
        : null,
    [campanha, currentUser.uid, personagem.id, personagem.nome, personagem.linkImagem],
  );

  const chat = useChatCampanha(campanha?.id ?? null, autor, {
    ehMestreDaCampanha: campanha?.mestreId === currentUser.uid,
  });
  const opcoesCombate = useOpcoesDeRolagem(personagem?.id ?? null, {
    ativo: Boolean(personagem?.id),
  });
  const gruposCombate = useMemo(
    () => (opcoesCombate.grupos ?? []).filter(grupo => ['ataque', 'defesa'].includes(grupo.id)),
    [opcoesCombate.grupos],
  );

  if (campanhaIds.length === 0 && (personagem.campanhas ?? []).length > 0) {
    return (
      <Typography sx={textoMutedSx}>
        Só personagens jogáveis e companheiros vinculados participam do chat — NPCs e
        Criaturas ficam com o mestre.
      </Typography>
    );
  }

  if (campanhaIds.length === 0) {
    return (
      <Typography sx={textoMutedSx}>
        Este personagem não está em nenhuma campanha. Vincule uma campanha em Info →
        Perfil para conversar com a mesa.
      </Typography>
    );
  }

  if (campanhas === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={28} sx={{ color: 'var(--color-primary)' }} />
      </Box>
    );
  }

  if (!campanha) {
    return (
      <Typography sx={textoMutedSx}>
        Não foi possível carregar a campanha deste personagem.
      </Typography>
    );
  }

  const cabecalho = (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        alignItems: 'stretch',
        gap: { xs: 1, sm: 1.5 },
        flexWrap: 'wrap',
      }}
    >
      <Box
        sx={{
          flex: isMobile ? '1 1 100%' : '1 1 170px',
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
        {campanhas.length > 1 ? (
          <TextField
            select
            size="small"
            label="Campanha"
            value={campanhaId}
            onChange={event => {
              setCampanhaId(event.target.value);
              onCampanhaChange?.(event.target.value);
            }}
            sx={{ minWidth: 180, maxWidth: 220 }}
          >
            {campanhas.map(c => (
              <MenuItem key={c.id} value={c.id}>
                {c.nome}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <Typography sx={{ color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.3 }}>
            {campanha.nome}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          flex: isMobile ? '1 1 100%' : '1 1 180px',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 0.25,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: 'var(--text-secondary)',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: isMobile ? 'nowrap' : 'normal',
          }}
        >
          Falando como <strong>{personagem.nome}</strong>
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobile ? 'stretch' : 'flex-end',
          gap: 1,
          flexWrap: 'wrap',
          ml: isMobile ? 0 : 'auto',
          flex: isMobile ? '1 1 100%' : '0 0 auto',
        }}
      >
        <Button
          size="small"
          variant="contained"
          startIcon={<GridOnIcon fontSize="small" />}
          onClick={() =>
            navigate(`/campanhas/${campanha.id}/grid`, {
              state: { personagemId: personagem.id },
            })
          }
          sx={{
            background: 'linear-gradient(180deg, rgba(91, 124, 250, 0.2), rgba(91, 124, 250, 0.08))',
            color: 'var(--text-primary)',
            border: '1px solid rgba(91, 124, 250, 0.45)',
            minWidth: isMobile ? 'auto' : undefined,
            flex: isMobile ? '1 1 140px' : undefined,
            '&:hover': { background: 'rgba(91, 124, 250, 0.18)' },
          }}
        >
          Abrir Grid
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<OpenInFullIcon fontSize="small" />}
          onClick={() =>
            navigate(`/campanhas/${campanha.id}/chat`, {
              state: { personagemId: personagem.id },
            })
          }
          sx={{
            background: 'linear-gradient(180deg, rgba(91, 124, 250, 0.2), rgba(91, 124, 250, 0.08))',
            color: 'var(--text-primary)',
            border: '1px solid rgba(91, 124, 250, 0.45)',
            minWidth: isMobile ? 'auto' : undefined,
            flex: isMobile ? '1 1 140px' : undefined,
            '&:hover': { background: 'rgba(91, 124, 250, 0.18)' },
          }}
        >
          Tela Cheia
        </Button>
        {modo === 'modal' && (
          <Button
            size="small"
            startIcon={<ChatOutlinedIcon fontSize="small" />}
            onClick={() => {
              onAbrirPainelLateral?.(campanha.id);
              onClose?.();
            }}
            sx={{
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            Painel lateral
          </Button>
        )}
        {modo === 'painel' && (
          <Tooltip title="Fechar painel">
            <IconButton
              size="small"
              aria-label="Fechar painel"
              onClick={onClose}
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
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        flex: 1,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: isMobile ? 0 : { xs: 560, sm: 700 },
          maxHeight: isMobile ? '100dvh' : undefined,
        }}
      >
        <ChatSala
          mensagens={chat.mensagens}
          carregando={chat.carregando}
          currentUid={currentUser.uid}
          podeApagarTodas={campanha.mestreId === currentUser.uid}
          onEnviarTexto={chat.enviarTexto}
          onEnviarImagem={chat.enviarImagem}
          onRolar={chat.rolar}
          macros={chat.macros}
          audio={chat.audio}
          onApagar={chat.apagar}
          cabecalho={cabecalho}
          compactHeader={modo === 'painel'}
          opcoesCombate={gruposCombate}
          onCarregarAnteriores={chat.carregarAnteriores}
          temMaisAnteriores={chat.temMaisAntigas}
          carregandoAnteriores={chat.carregandoAntigas}
        />
      </Box>
      <ErrorSnackbar open={!!chat.erro} mensagem={chat.erro} onClose={chat.limparErro} />
    </Box>
  );
};

ChatModalConteudo.propTypes = {
  personagem: PropTypes.object.isRequired,
  modo: PropTypes.oneOf(['modal', 'painel']),
  onAbrirPainelLateral: PropTypes.func,
  onClose: PropTypes.func,
  campanhaIdInicial: PropTypes.string,
  onCampanhaChange: PropTypes.func,
};

const ChatModal = ({ open, onClose, personagem, onAbrirPainelLateral, onCampanhaChange = null }) => {
  const isMobile = useMediaQuery('(max-width: 599.95px)');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="md"
      keepMounted
      sx={{
        '& .MuiDialog-paper': {
          minHeight: isMobile ? '100dvh' : { xs: 560, sm: 700 },
          height: isMobile ? '100dvh' : 'min(86vh, 1040px)',
          maxHeight: isMobile ? '100dvh' : 'min(86vh, 1040px)',
          width: isMobile ? '100vw' : undefined,
          maxWidth: isMobile ? '100vw' : undefined,
          m: isMobile ? 0 : undefined,
          borderRadius: isMobile ? 0 : undefined,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pb: isMobile ? 'env(safe-area-inset-bottom)' : undefined,
        },
      }}
    >
    <DialogHeaderRow>
      <DialogHeaderTitle>💬 Chat da Campanha</DialogHeaderTitle>
      <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
        <CloseIcon fontSize="small" />
      </DialogFecharButton>
    </DialogHeaderRow>
    <DialogContent sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <ChatModalConteudo personagem={personagem} onAbrirPainelLateral={onAbrirPainelLateral} onClose={onClose} onCampanhaChange={onCampanhaChange} />
    </DialogContent>
    </Dialog>
  );
};

ChatModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
  onAbrirPainelLateral: PropTypes.func,
  onCampanhaChange: PropTypes.func,
};

export default ChatModal;
