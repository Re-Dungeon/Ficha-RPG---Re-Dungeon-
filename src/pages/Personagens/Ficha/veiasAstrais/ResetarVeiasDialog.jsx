import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { DialogFecharButton, DialogHeaderRow, DialogHeaderTitle, StatusValueRow } from '../styles';

const ResetarVeiasDialog = ({ open, totalDesbloqueadas, pcParaRecuperar, onClose, onConfirmar }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
    <DialogHeaderRow>
      <DialogHeaderTitle style={{ flex: 1 }}>Bloquear todas as veias?</DialogHeaderTitle>
      <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
        <CloseIcon fontSize="small" />
      </DialogFecharButton>
    </DialogHeaderRow>

    <DialogContent>
      <StatusValueRow style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171' }}>
        <WarningAmberIcon fontSize="small" />
        Esta ação não pode ser desfeita.
      </StatusValueRow>
      <StatusValueRow style={{ display: 'block', marginTop: 12 }}>
        Isso vai bloquear as {totalDesbloqueadas} veia(s) desbloqueada(s) em todas as divindades e devolver{' '}
        {pcParaRecuperar} PC.
      </StatusValueRow>
    </DialogContent>

    <DialogActions>
      <Button onClick={onClose}>Cancelar</Button>
      <Button variant="contained" color="error" onClick={onConfirmar}>
        Bloquear todas
      </Button>
    </DialogActions>
  </Dialog>
);

ResetarVeiasDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  totalDesbloqueadas: PropTypes.number.isRequired,
  pcParaRecuperar: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirmar: PropTypes.func.isRequired,
};

export default ResetarVeiasDialog;
