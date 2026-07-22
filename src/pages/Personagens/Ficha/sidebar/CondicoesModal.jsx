import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';

import { DialogFecharButton, DialogHeaderRow, DialogHeaderTitle } from '../styles';
import CondicoesTab from '../tabs/CondicoesTab';

const CondicoesModal = ({ open, onClose, personagem, onSave }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogHeaderRow>
      <DialogHeaderTitle>⚠️ Condições Ativas</DialogHeaderTitle>
      <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
        <CloseIcon fontSize="small" />
      </DialogFecharButton>
    </DialogHeaderRow>
    <DialogContent>
      <CondicoesTab personagem={personagem} onSave={onSave} />
    </DialogContent>
  </Dialog>
);

CondicoesModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default CondicoesModal;
