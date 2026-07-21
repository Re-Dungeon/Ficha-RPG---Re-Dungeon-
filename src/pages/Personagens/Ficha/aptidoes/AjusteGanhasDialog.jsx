import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';

import { DialogFecharButton, DialogHeaderRow, DialogHeaderTitle } from '../styles';
import { NumeroBotao, NumeroGrid } from './styles';

const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const AjusteGanhasDialog = ({ open, titulo, onClose, onConfirm }) => {
  const tituloId = `dialog-titulo-ajuste-${titulo.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" aria-labelledby={tituloId}>
      <DialogHeaderRow>
        <DialogHeaderTitle id={tituloId}>{titulo}</DialogHeaderTitle>
        <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </DialogFecharButton>
      </DialogHeaderRow>
      <DialogContent>
        <NumeroGrid style={{ marginTop: 8 }}>
          {NUMEROS.map(numero => (
            <NumeroBotao key={numero} type="button" onClick={() => onConfirm(numero)}>
              {numero}
            </NumeroBotao>
          ))}
        </NumeroGrid>
      </DialogContent>
    </Dialog>
  );
};

AjusteGanhasDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  titulo: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default AjusteGanhasDialog;
