import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { useAuth } from 'context/AuthContext';
import { addPersonagem } from 'service/storage';
import { nomeSchema } from 'common/utils/yupSchemas';

import { duplicarPersonagem } from './duplicarPersonagem';
import { OpcoesCriarRow } from './styles';

const CriarCompanheiroModal = ({ open, onClose, personagem }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [criando, setCriando] = useState(false);

  const handleFechar = useCallback(() => {
    if (criando) {
      return;
    }
    setNome('');
    setErro('');
    onClose();
  }, [criando, onClose]);

  const validarNome = useCallback(async () => {
    try {
      const nomeValidado = await nomeSchema.validate(nome);
      setErro('');
      return nomeValidado;
    } catch (validationError) {
      setErro(validationError.message);
      return null;
    }
  }, [nome]);

  const finalizarCriacao = useCallback(
    novoId => {
      setNome('');
      setErro('');
      setCriando(false);
      onClose();
      navigate(`/personagens/${novoId}`);
    },
    [onClose, navigate],
  );

  const handleCriarEmBranco = useCallback(async () => {
    const nomeValidado = await validarNome();
    if (!nomeValidado) {
      return;
    }
    setCriando(true);
    try {
      const novoId = await addPersonagem({
        uid: currentUser.uid,
        nome: nomeValidado,
        universo: personagem.universo,
        companheiroDe: personagem.id,
      });
      finalizarCriacao(novoId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Falha ao criar companheiro:', error);
      setErro('Não foi possível criar o companheiro. Verifique sua conexão e tente novamente.');
      setCriando(false);
    }
  }, [validarNome, currentUser.uid, personagem, finalizarCriacao]);

  const handleDuplicar = useCallback(async () => {
    const nomeValidado = await validarNome();
    if (!nomeValidado) {
      return;
    }
    setCriando(true);
    try {
      const novoId = await duplicarPersonagem(personagem, {
        uid: currentUser.uid,
        nome: nomeValidado,
        companheiroDe: personagem.id,
      });
      finalizarCriacao(novoId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Falha ao duplicar personagem:', error);
      setErro('Não foi possível duplicar o personagem. Verifique sua conexão e tente novamente.');
      setCriando(false);
    }
  }, [validarNome, currentUser.uid, personagem, finalizarCriacao]);

  return (
    <Dialog open={open} onClose={handleFechar} fullWidth maxWidth="xs">
      <DialogTitle>Criar Companheiro</DialogTitle>
      <DialogContent>
        <TextField
          label="Nome do companheiro"
          value={nome}
          onChange={event => setNome(event.target.value)}
          error={Boolean(erro)}
          helperText={erro}
          fullWidth
          size="small"
          disabled={criando}
          sx={{ mt: 1 }}
        />

        <OpcoesCriarRow>
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={handleCriarEmBranco}
            disabled={criando}
          >
            Criar em Branco
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleDuplicar}
            disabled={criando}
          >
            Duplicar Este Personagem
          </Button>
        </OpcoesCriarRow>
      </DialogContent>
      <DialogActions>
        {criando && <CircularProgress size={20} sx={{ color: 'var(--color-primary)', mr: 1 }} />}
        <Button onClick={handleFechar} disabled={criando}>
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

CriarCompanheiroModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
};

export default CriarCompanheiroModal;
