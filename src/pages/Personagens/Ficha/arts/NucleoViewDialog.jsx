import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { DialogTwoColumns, EssenciaTexto, EssenciaTitle, ImagePreviewBox, NucleoMeta, NucleoNome } from './styles';

const NucleoViewDialog = ({ open, onClose, nucleo, onEditar }) => {
  if (!nucleo) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>🔍 Visualizar Núcleo</DialogTitle>
      <DialogContent>
        <DialogTwoColumns>
          <ImagePreviewBox>
            {nucleo.imagem ? <img src={nucleo.imagem} alt={nucleo.nome} /> : '🎨'}
          </ImagePreviewBox>
          <div>
            <NucleoNome style={{ fontSize: '1.3rem', marginBottom: 12 }}>{nucleo.nome}</NucleoNome>
            <NucleoMeta style={{ display: 'block', marginBottom: 4 }}>
              <strong>Tipo:</strong> {nucleo.tipo || 'Não definido'}
            </NucleoMeta>
            <NucleoMeta style={{ display: 'block' }}>
              <strong>Bônus:</strong> {nucleo.bonus || 'Nenhum'}
            </NucleoMeta>
            <div style={{ marginTop: 16 }}>
              <EssenciaTitle>✨ Essência</EssenciaTitle>
              <EssenciaTexto>{nucleo.descricao || 'Sem descrição'}</EssenciaTexto>
            </div>
          </div>
        </DialogTwoColumns>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        <Button variant="contained" onClick={onEditar}>
          ✏️ Editar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

NucleoViewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  nucleo: PropTypes.object,
  onEditar: PropTypes.func.isRequired,
};

NucleoViewDialog.defaultProps = {
  nucleo: null,
};

export default NucleoViewDialog;
