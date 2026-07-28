import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CasinoIcon from '@mui/icons-material/Casino';
import CloseIcon from '@mui/icons-material/Close';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

import SorteTab from '../tabs/SorteTab';
import LojaTrapacaSection from '../lojas/LojaTrapacaSection';
import { DialogFecharButton, DialogHeaderRow, DialogHeaderTitle } from '../styles';
import { SaldoBadge } from '../lojas/styles';

const SorteModal = ({ open, onClose, personagem, onSave }) => {
  const [subAba, setSubAba] = useState('sorte');
  const fortunaAtual = personagem.sorte?.fortunaAtual ?? 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogHeaderRow>
        <DialogHeaderTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CasinoIcon fontSize="small" /> Loja da Sorte
        </DialogHeaderTitle>
        <SaldoBadge>
          <MonetizationOnIcon fontSize="inherit" />
          Saldo: {fortunaAtual} Ȼ
        </SaldoBadge>
        <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </DialogFecharButton>
      </DialogHeaderRow>
      <Tabs
        value={subAba}
        onChange={(_event, novaSubAba) => setSubAba(novaSubAba)}
        textColor="inherit"
        variant="fullWidth"
      >
        <Tab value="sorte" label="Sorte" />
        <Tab value="trapaca" label="Loja da Trapaça" />
      </Tabs>
      <DialogContent>
        {subAba === 'sorte' && <SorteTab personagem={personagem} onSave={onSave} />}
        {subAba === 'trapaca' && <LojaTrapacaSection personagem={personagem} onSave={onSave} />}
      </DialogContent>
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
