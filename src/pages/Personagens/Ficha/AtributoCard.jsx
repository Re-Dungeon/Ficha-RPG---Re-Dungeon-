import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useField } from 'formik';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import NumberField from 'components/NumberField/NumberField';

import { AtributoCardButton, CardTitle, CardTotal, FieldsRow } from './styles';

const AtributoCard = ({ label, total, baseName, extraName, bonusName }) => {
  const [aberto, setAberto] = useState(false);
  const [baseField, , baseHelpers] = useField(baseName);
  const [extraField, , extraHelpers] = useField(extraName);
  const [bonusField, , bonusHelpers] = useField(bonusName);
  const snapshotRef = useRef(null);

  const abrir = () => {
    snapshotRef.current = { base: baseField.value, extra: extraField.value, bonus: bonusField.value };
    setAberto(true);
  };

  const cancelar = () => {
    const snapshot = snapshotRef.current;
    if (snapshot) {
      baseHelpers.setValue(snapshot.base);
      extraHelpers.setValue(snapshot.extra);
      bonusHelpers.setValue(snapshot.bonus);
    }
    setAberto(false);
  };

  return (
    <>
      <AtributoCardButton type="button" onClick={abrir}>
        <CardTitle>{label}</CardTitle>
        <CardTotal>{total}</CardTotal>
      </AtributoCardButton>

      <Dialog open={aberto} onClose={cancelar} fullWidth maxWidth="xs">
        <DialogTitle>Configurar {label}</DialogTitle>
        <DialogContent style={{ paddingTop: 8 }}>
          <FieldsRow>
            <NumberField name={baseName} label="Base" />
            <NumberField name={extraName} label="Extra" />
          </FieldsRow>
          <FieldsRow style={{ marginTop: 16 }}>
            <TextField label="Total" value={total} size="small" disabled />
            <NumberField name={bonusName} label="Bônus" />
          </FieldsRow>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelar}>Cancelar</Button>
          <Button variant="contained" onClick={() => setAberto(false)}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

AtributoCard.propTypes = {
  label: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
  baseName: PropTypes.string.isRequired,
  extraName: PropTypes.string.isRequired,
  bonusName: PropTypes.string.isRequired,
};

export default AtributoCard;
