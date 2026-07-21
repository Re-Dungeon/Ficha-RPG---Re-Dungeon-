import React from 'react';
import PropTypes from 'prop-types';
import { useField } from 'formik';

import { NumberFieldBox, NumberFieldLabel, NumberFieldWrapper } from './styles';

const NumberField = ({ name, label }) => {
  const [field, , helpers] = useField(name);

  return (
    <NumberFieldWrapper>
      <NumberFieldLabel htmlFor={name}>{label}</NumberFieldLabel>
      <NumberFieldBox
        id={name}
        type="number"
        name={name}
        value={field.value ?? 0}
        onChange={event => {
          const raw = event.target.value;
          helpers.setValue(raw === '' ? 0 : Number(raw));
        }}
        onBlur={field.onBlur}
      />
    </NumberFieldWrapper>
  );
};

NumberField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default NumberField;
