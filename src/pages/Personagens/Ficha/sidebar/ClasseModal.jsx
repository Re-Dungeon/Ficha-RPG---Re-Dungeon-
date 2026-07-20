import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

import { calcularPowerCombat, calcularPrimariosTotais, calcularSecundarios } from 'common/utils/formulas';

import ClassesSection from '../progressao/ClassesSection';

const ClasseModal = ({ open, onClose, personagem, onSave }) => {
  const primariosTotais = calcularPrimariosTotais(
    personagem.atributosBase,
    personagem.atributosExtra,
    personagem.atributosBonus,
  );
  const secundariosTotais = calcularSecundarios(
    primariosTotais,
    personagem.secundariosBase,
    personagem.secundariosExtra,
    personagem.secundariosBonus,
  );
  const powerCombat = calcularPowerCombat(primariosTotais, secundariosTotais);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Classe</DialogTitle>
      <DialogContent>
        <ClassesSection personagem={personagem} onSave={onSave} powerCombat={powerCombat} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

ClasseModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ClasseModal;
