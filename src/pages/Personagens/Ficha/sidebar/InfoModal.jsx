import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

import PerfilTab from '../tabs/PerfilTab';
import UniversoSelect from '../progressao/UniversoSelect';
import { SectionTitle } from '../styles';

const InfoModal = ({ open, onClose, personagem, onSave }) => {
  const [salvando, setSalvando] = useState(false);

  const handleSalvarPerfil = useCallback(
    async patch => {
      setSalvando(true);
      try {
        await onSave(patch);
      } finally {
        setSalvando(false);
      }
    },
    [onSave],
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogContent>
        <SectionTitle>Universo</SectionTitle>
        <div style={{ marginTop: 12, marginBottom: 32 }}>
          <UniversoSelect personagem={personagem} onSave={onSave} />
        </div>

        <PerfilTab personagem={personagem} onSave={handleSalvarPerfil} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        <Button type="submit" form="perfil-form" variant="contained" disabled={salvando}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

InfoModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default InfoModal;
