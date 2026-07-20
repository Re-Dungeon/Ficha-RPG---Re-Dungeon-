import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import SorteTab from '../tabs/SorteTab';
import LojaTrapacaSection from '../lojas/LojaTrapacaSection';

const SorteModal = ({ open, onClose, personagem, onSave }) => {
  const [subAba, setSubAba] = useState('sorte');

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Tabs
        value={subAba}
        onChange={(_event, novaSubAba) => setSubAba(novaSubAba)}
        textColor="inherit"
        variant="fullWidth"
        slotProps={{ indicator: { style: { backgroundColor: 'var(--color-accent)' } } }}
      >
        <Tab value="sorte" label="Sorte" />
        <Tab value="trapaca" label="Loja da Trapaça" />
      </Tabs>
      <DialogContent>
        {subAba === 'sorte' && <SorteTab personagem={personagem} onSave={onSave} />}
        {subAba === 'trapaca' && <LojaTrapacaSection personagem={personagem} onSave={onSave} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

SorteModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default SorteModal;
