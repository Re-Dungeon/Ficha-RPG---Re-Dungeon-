import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
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

const HeaderIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(232, 195, 106, 0.12), rgba(108, 99, 255, 0.06));
  color: var(--color-primary, #e8c36a);
  box-shadow: 0 6px 18px rgba(108,99,255,0.06), 0 2px 8px rgba(232,195,106,0.06);
`;

const HeaderTitleWrap = styled.div`
  display: flex;
  flex-direction: column;
`;

const HeaderSubtitle = styled.span`
  font-size: 0.78rem;
  color: var(--text-secondary, #A8A8C8);
  margin-top: 2px;
  font-weight: 400;
`;

const SaldoCard = styled.div`
  display: inline-flex;
  gap: 8px;
  align-items: center;
  background: linear-gradient(180deg, rgba(232,195,106,0.08), rgba(232,195,106,0.02));
  border: 1px solid rgba(232,203,133,0.18);
  color: #fff;
  padding: 8px 12px;
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 6px 20px rgba(232,195,106,0.06);
`;

const SorteContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SortePanel = styled.div`
  position: relative;
  background: linear-gradient(180deg, rgba(8, 10, 26, 0.98), rgba(11, 13, 28, 0.96));
  border: 1px solid rgba(232, 203, 133, 0.16);
  border-radius: 24px;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.22);
  padding: 24px;
  overflow: hidden;
`;

const SorteModal = ({ open, onClose, personagem, onSave }) => {
  const [subAba, setSubAba] = useState('sorte');
  const fortunaAtual = personagem.sorte?.fortunaAtual ?? 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogHeaderRow>
        <DialogHeaderTitle style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <HeaderIcon>
            <CasinoIcon fontSize="small" />
          </HeaderIcon>
          <HeaderTitleWrap>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Loja da Sorte</div>
            <HeaderSubtitle>Desafie a Fortuna diariamente.</HeaderSubtitle>
          </HeaderTitleWrap>
        </DialogHeaderTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SaldoCard>
            <MonetizationOnIcon fontSize="small" /> {fortunaAtual} Ȼ
          </SaldoCard>
          <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </DialogFecharButton>
        </div>
      </DialogHeaderRow>
      <Tabs
        value={subAba}
        onChange={(_event, novaSubAba) => setSubAba(novaSubAba)}
        textColor="inherit"
        indicatorColor="secondary"
        variant="fullWidth"
        sx={{
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          mb: 2,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 700,
            transition: 'all 220ms ease',
            '&:hover': { transform: 'translateY(-2px)', opacity: 0.95 },
          },
          '& .MuiTabs-indicator': {
            height: 4,
            borderRadius: 6,
            background: 'linear-gradient(90deg, rgba(108,99,255,0.9), rgba(232,195,106,0.9))',
            boxShadow: '0 6px 18px rgba(108,99,255,0.12)',
          },
        }}
      >
        <Tab value="sorte" label="Sorte" />
        <Tab value="trapaca" label="Loja da Trapaça" />
      </Tabs>
      <DialogContent sx={{ px: { xs: 2, sm: 3 }, pb: 3, pt: 0 }}>
        <SortePanel>
          <SorteContent>
            {subAba === 'sorte' && <SorteTab personagem={personagem} onSave={onSave} />}
            {subAba === 'trapaca' && <LojaTrapacaSection personagem={personagem} onSave={onSave} />}
          </SorteContent>
        </SortePanel>
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
