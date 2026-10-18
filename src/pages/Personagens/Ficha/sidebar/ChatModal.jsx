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
import CloseIcon from '@mui/icons-material/Close';
import GridOnIcon from '@mui/icons-material/GridOn';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';

import { useAuth } from 'context/AuthContext';
import { getRmCampanha } from 'service/storage';
import { campanhaIdsDosPersonagens } from 'common/utils/chat';
import useChatCampanha from 'hooks/useChatCampanha';
import ChatSala from 'components/Chat/ChatSala';
import ErrorSnackbar from 'components/ErrorSnackbar/ErrorSnackbar';

import { DialogFecharButton, DialogHeaderRow, DialogHeaderTitle } from '../styles';

const textoMutedSx = { color: 'var(--text-secondary)', textAlign: 'center', py: 4 };

// Conteúdo só é montado com o modal aberto (Dialog não renderiza os filhos
// fechado) — a escuta em tempo real do chat vive só enquanto ele está visível.
const ChatModalConteudo = ({ personagem }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const campanhaIds = useMemo(() => campanhaIdsDosPersonagens([personagem]), [personagem]);

  const [campanhas, setCampanhas] = useState(null);
  const [campanhaId, setCampanhaId] = useState(campanhaIds[0] ?? '');

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

  if (campanhaIds.length === 0 && (personagem.campanhas ?? []).length > 0) {
    return (
      <Typography sx={textoMutedSx}>
        Só personagens jogáveis participam do chat — NPCs, Criaturas e companheiros ficam com o
        mestre.
      </Typography>
    );
  }

  if (campanhaIds.length === 0) {
    return (
      <Typography sx={textoMutedSx}>
        Este personagem não está em nenhuma campanha. Vincule uma campanha em Info → Perfil para
        conversar com a mesa.
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
    return <Typography sx={textoMutedSx}>Não foi possível carregar a campanha deste personagem.</Typography>;
  }

  const cabecalho = (
    <>
      {campanhas.length > 1 ? (
        <TextField
          select
          size="small"
          label="Campanha"
          value={campanhaId}
          onChange={event => setCampanhaId(event.target.value)}
          sx={{ minWidth: 200 }}
        >
          {campanhas.map(c => (
            <MenuItem key={c.id} value={c.id}>
              {c.nome}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        <Typography sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>{campanha.nome}</Typography>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          Falando como <strong>{personagem.nome}</strong>
        </Typography>
        <Button
          size="small"
          startIcon={<GridOnIcon fontSize="small" />}
          onClick={() =>
            navigate(`/campanhas/${campanha.id}/grid`, { state: { personagemId: personagem.id } })
          }
        >
          Abrir grid
        </Button>
        <Button
          size="small"
          startIcon={<OpenInFullIcon fontSize="small" />}
          onClick={() =>
            navigate(`/campanhas/${campanha.id}/chat`, { state: { personagemId: personagem.id } })
          }
        >
          Tela cheia
        </Button>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '70vh', minHeight: 360 }}>
      <ChatSala
        mensagens={chat.mensagens}
        carregando={chat.carregando}
        currentUid={currentUser.uid}
        podeApagarTodas={campanha.mestreId === currentUser.uid}
        onEnviarTexto={chat.enviarTexto}
        onEnviarImagem={chat.enviarImagem}
        onRolar={chat.rolar}
        macros={chat.macros}
        onApagar={chat.apagar}
        cabecalho={cabecalho}
      />
      <ErrorSnackbar open={!!chat.erro} mensagem={chat.erro} onClose={chat.limparErro} />
    </Box>
  );
};

ChatModalConteudo.propTypes = {
  personagem: PropTypes.object.isRequired,
};

const ChatModal = ({ open, onClose, personagem }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogHeaderRow>
      <DialogHeaderTitle>💬 Chat da Campanha</DialogHeaderTitle>
      <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
        <CloseIcon fontSize="small" />
      </DialogFecharButton>
    </DialogHeaderRow>
    <DialogContent>
      <ChatModalConteudo personagem={personagem} />
    </DialogContent>
  </Dialog>
);

ChatModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
};

export default ChatModal;
