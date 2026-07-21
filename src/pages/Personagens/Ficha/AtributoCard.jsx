import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useField } from 'formik';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';

import NumberField from 'components/NumberField/NumberField';
import {
  NumberFieldBox,
  NumberFieldLabel,
  NumberFieldWrapper,
} from 'components/NumberField/styles';

import {
  AtributoGemaButton,
  AtributoGemaLabel,
  AtributoGemaValor,
  DialogFecharButton,
  DialogHeaderRow,
  DialogHeaderTitle,
  FieldsRow,
} from './styles';

const AtributoCard = ({ label, total, baseName, extraName, bonusName }) => {
  const tituloId = `dialog-titulo-${baseName}`;
  const [aberto, setAberto] = useState(false);
  const [baseField, , baseHelpers] = useField(baseName);
  const [extraField, , extraHelpers] = useField(extraName);
  const [bonusField, , bonusHelpers] = useField(bonusName);
  const snapshotRef = useRef(null);

  const abrir = () => {
    snapshotRef.current = {
      base: baseField.value,
      extra: extraField.value,
      bonus: bonusField.value,
    };
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
      <AtributoGemaButton type="button" onClick={abrir}>
        <AtributoGemaValor>{total}</AtributoGemaValor>
        <AtributoGemaLabel>{label.slice(0, 3)}</AtributoGemaLabel>
      </AtributoGemaButton>

      <Dialog
        open={aberto}
        onClose={cancelar}
        fullWidth
        maxWidth="xs"
        aria-labelledby={tituloId}
      >
        <DialogHeaderRow>
          <DialogHeaderTitle id={tituloId}>Configurar {label}</DialogHeaderTitle>
          <DialogFecharButton type="button" aria-label="Fechar" onClick={cancelar}>
            <CloseIcon fontSize="small" />
          </DialogFecharButton>
        </DialogHeaderRow>
        <DialogContent style={{ paddingTop: 8 }}>
          <FieldsRow>
            <NumberField name={baseName} label="Base" />
            <NumberField name={extraName} label="Extra" />
          </FieldsRow>
          <FieldsRow style={{ marginTop: 16 }}>
            <NumberFieldWrapper>
              <NumberFieldLabel as="span">
                Total
                <LockIcon fontSize="inherit" />
              </NumberFieldLabel>
              <NumberFieldBox value={total} disabled />
            </NumberFieldWrapper>
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
