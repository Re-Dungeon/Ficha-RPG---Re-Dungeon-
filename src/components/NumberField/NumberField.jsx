import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useField } from 'formik';

import { NumberFieldBox, NumberFieldLabel, NumberFieldWrapper } from './styles';

const NumberField = ({ name, label }) => {
  const [field, , helpers] = useField(name);
  // Texto bruto do input, separado do valor numérico do Formik: digitar "-" (primeiro
  // caractere de um valor negativo válido, ex. penalidade de atributo) precisa ficar
  // visível sem virar NaN no estado — Number('-') é NaN, e NaN não é filtrado por
  // `?? 0` em formulas.js (NaN não é nullish), então "vazava" pros totais calculados.
  const [raw, setRaw] = useState(() => String(field.value ?? 0));

  useEffect(() => {
    setRaw(prev => (Number(prev) !== (field.value ?? 0) ? String(field.value ?? 0) : prev));
  }, [field.value]);

  const handleChange = event => {
    const valor = event.target.value;
    setRaw(valor);

    if (valor === '') {
      helpers.setValue(0);
      return;
    }
    const parsed = Number(valor);
    if (!Number.isNaN(parsed)) {
      helpers.setValue(parsed);
    }
  };

  const handleBlur = event => {
    field.onBlur(event);
    setRaw(String(field.value ?? 0));
  };

  return (
    <NumberFieldWrapper>
      <NumberFieldLabel htmlFor={name}>{label}</NumberFieldLabel>
      <NumberFieldBox id={name} type="number" name={name} value={raw} onChange={handleChange} onBlur={handleBlur} />
    </NumberFieldWrapper>
  );
};

NumberField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default NumberField;
