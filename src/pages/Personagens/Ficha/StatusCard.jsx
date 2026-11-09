import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useField, useFormikContext } from 'formik';
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
  AjusteRapidoRow,
  DialogFecharButton,
  DialogHeaderRow,
  DialogHeaderTitle,
  FieldsRow,
  StatusBarraFill,
  StatusBarraLabel,
  StatusBarraTrack,
  StatusColunaButton,
  StatusSubtitulo,
  StatusTitulo,
} from './styles';

const AJUSTES_RAPIDOS = [-5, -1, 1, 5];

const StatusCard = ({ label, variante, grande = false, maximo, atual, atualName, baseName, extraName, bonusName }) => {
  const tituloId = `dialog-titulo-${atualName}`;
  const [aberto, setAberto] = useState(false);
  const [atualField, , atualHelpers] = useField(atualName);
  const [baseField, , baseHelpers] = useField(baseName);
  const [extraField, , extraHelpers] = useField(extraName);
  const [bonusField, , bonusHelpers] = useField(bonusName);
  const { submitForm } = useFormikContext();
  const snapshotRef = useRef(null);

  const percentual = maximo > 0 ? Math.min(100, Math.max(0, (atual / maximo) * 100)) : 0;

  const abrir = () => {
    snapshotRef.current = {
      atual: atualField.value,
      base: baseField.value,
      extra: extraField.value,
      bonus: bonusField.value,
    };
    setAberto(true);
  };

  const cancelar = () => {
    const snapshot = snapshotRef.current;
    if (snapshot) {
      atualHelpers.setValue(snapshot.atual);
      baseHelpers.setValue(snapshot.base);
      extraHelpers.setValue(snapshot.extra);
      bonusHelpers.setValue(snapshot.bonus);
    }
    setAberto(false);
  };

  // "Salvar" grava a ficha (antes só fechava o diálogo).
  const salvar = event => {
    event.preventDefault();
    event.stopPropagation();
    setAberto(false);
    submitForm();
  };

  // Dano/cura rápidos: ajusta o atual (0..máximo) e grava na hora, sem fechar.
  const ajustarRapido = delta => {
    const atualNumero = Number(atualField.value) || 0;
    const novo = Math.min(Math.max(atualNumero + delta, 0), Math.max(maximo, 0));
    if (novo === atualNumero) return;
    snapshotRef.current = { ...snapshotRef.current, atual: novo };
    Promise.resolve(atualHelpers.setValue(novo)).then(() => submitForm());
  };

  return (
    <>
      <StatusColunaButton type="button" onClick={abrir}>
        <StatusTitulo>{label}</StatusTitulo>
        <StatusSubtitulo>
          {atual} / {maximo}
        </StatusSubtitulo>
        <StatusBarraTrack $grande={grande}>
          <StatusBarraFill $percentual={percentual} $variante={variante} />
          <StatusBarraLabel>{Math.round(percentual)}%</StatusBarraLabel>
        </StatusBarraTrack>
      </StatusColunaButton>

      <Dialog open={aberto} onClose={cancelar} fullWidth maxWidth="xs" aria-labelledby={tituloId}>
        <DialogHeaderRow>
          <DialogHeaderTitle id={tituloId}>Configurar {label}</DialogHeaderTitle>
          <DialogFecharButton type="button" aria-label="Fechar" onClick={cancelar}>
            <CloseIcon fontSize="small" />
          </DialogFecharButton>
        </DialogHeaderRow>
        <form onSubmit={salvar}>
          <DialogContent style={{ paddingTop: 8 }}>
            <FieldsRow>
              <NumberFieldWrapper>
                <NumberFieldLabel as="span">
                  Máximo
                  <LockIcon fontSize="inherit" />
                </NumberFieldLabel>
                <NumberFieldBox value={maximo} disabled />
              </NumberFieldWrapper>
              <NumberField name={atualName} label="Atual" />
            </FieldsRow>
            <AjusteRapidoRow role="group" aria-label={`Ajuste rápido de ${label}`}>
              {AJUSTES_RAPIDOS.map(delta => (
                <Button
                  key={delta}
                  size="small"
                  variant="outlined"
                  onClick={() => ajustarRapido(delta)}
                  aria-label={`${delta > 0 ? 'Somar' : 'Tirar'} ${Math.abs(delta)} de ${label} e salvar`}
                >
                  {delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`}
                </Button>
              ))}
            </AjusteRapidoRow>
            <FieldsRow style={{ marginTop: 16 }}>
              <NumberField name={baseName} label="Base" />
              <NumberField name={extraName} label="Extra" />
            </FieldsRow>
            <FieldsRow style={{ marginTop: 16 }}>
              <NumberField name={bonusName} label="Bônus" />
            </FieldsRow>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelar}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

StatusCard.propTypes = {
  label: PropTypes.string.isRequired,
  variante: PropTypes.string.isRequired,
  grande: PropTypes.bool,
  maximo: PropTypes.number.isRequired,
  atual: PropTypes.number.isRequired,
  atualName: PropTypes.string.isRequired,
  baseName: PropTypes.string.isRequired,
  extraName: PropTypes.string.isRequired,
  bonusName: PropTypes.string.isRequired,
  bonusCultivo: PropTypes.number,
};

export default StatusCard;
