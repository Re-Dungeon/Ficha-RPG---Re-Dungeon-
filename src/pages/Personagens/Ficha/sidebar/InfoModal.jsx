import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { useSaving } from 'context/SavingContext';

import PerfilTab from '../tabs/PerfilTab';
import CorpoEspecialGrid from '../corpoEspecial/CorpoEspecialGrid';
import { SectionTitle } from '../styles';

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px 32px 16px;
  border-bottom: 1px solid rgba(216, 180, 106, 0.18);
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: #f4f3ff;
`;

const ModalOrnament = styled.span`
  flex: 1;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(216, 180, 106, 0.85), transparent);
  opacity: 0.88;
`;

const StyledDialogContent = styled(DialogContent)`
  padding: 28px 32px 20px;
  background: rgba(33, 27, 55, 0.72);
  backdrop-filter: blur(10px);
`;

const StyledDialogActions = styled(DialogActions)`
  justify-content: flex-end;
  gap: 16px;
  padding: 18px 32px 24px;
  border-top: 1px solid rgba(216, 180, 106, 0.16);
`;

const InfoModal = ({ open, onClose, personagem, onSave }) => {
  const { executar } = useSaving();
  const [aba, setAba] = useState('perfil');

  const handleSalvarPerfil = useCallback(patch => executar(() => onSave(patch)), [onSave, executar]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <ModalHeader>
        <ModalOrnament />
        <ModalTitle>EDITAR PERSONAGEM</ModalTitle>
        <ModalOrnament />
      </ModalHeader>

      <Tabs
        value={aba}
        onChange={(event, value) => setAba(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          px: 4,
          py: 1,
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '999px',
          border: '1px solid rgba(110, 90, 168, 0.18)',
          mx: 3,
          mt: 2,
          '.MuiTabs-indicator': {
            display: 'none',
          },
          '.MuiTabs-flexContainer': {
            gap: 1,
            padding: '6px',
          },
          '.MuiTab-root': {
            minHeight: 'auto',
            minWidth: 120,
            px: 3,
            py: 1.2,
            textTransform: 'none',
            color: '#AAA7C5',
            fontWeight: 700,
            borderRadius: '999px',
            transition: 'all 0.25s ease',
            '&.Mui-selected': {
              background: 'rgba(216, 180, 106, 0.18)',
              color: '#D8B46A',
              boxShadow: '0 0 20px rgba(84, 125, 255, 0.16)',
            },
            '&:hover': {
              background: 'rgba(84, 125, 255, 0.08)',
            },
          },
        }}
      >
        <Tab value="perfil" label="Perfil" />
        <Tab value="geral" label="Informações Gerais" />
        <Tab value="background" label="Background" />
        <Tab value="corpoEspecial" label="Corpo Especial" />
      </Tabs>

      <StyledDialogContent>
        {aba === 'corpoEspecial' ? (
          <CorpoEspecialGrid personagem={personagem} onSave={onSave} />
        ) : (
          <PerfilTab personagem={personagem} onSave={handleSalvarPerfil} aba={aba} />
        )}
      </StyledDialogContent>

      <StyledDialogActions>
        <Button
          variant="text"
          onClick={onClose}
          sx={{
            color: '#AAA7C5',
            border: '1px solid rgba(84, 125, 255, 0.32)',
            background: 'rgba(84, 125, 255, 0.08)',
            '&:hover': {
              background: 'rgba(84, 125, 255, 0.14)',
            },
          }}
        >
          Fechar
        </Button>
        {aba !== 'corpoEspecial' && (
          <Button
            type="submit"
            form="perfil-form"
            variant="contained"
            sx={{
              px: 4,
              textTransform: 'uppercase',
              boxShadow: '0 0 24px rgba(216, 180, 106, 0.22)',
            }}
          >
            Salvar
          </Button>
        )}
      </StyledDialogActions>
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
