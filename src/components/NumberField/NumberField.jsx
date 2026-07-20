import React from 'react';
import PropTypes from 'prop-types';
import { useField } from 'formik';
import TextField from '@mui/material/TextField';

const NumberField = ({ name, label }) => {
  const [field, , helpers] = useField(name);

  return (
    <TextField
      type="number"
      name={name}
      label={label}
      size="small"
      value={field.value ?? 0}
      onChange={event => {
        const raw = event.target.value;
        helpers.setValue(raw === '' ? 0 : Number(raw));
      }}
      onBlur={field.onBlur}
    />
  );
};

NumberField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default NumberField;
