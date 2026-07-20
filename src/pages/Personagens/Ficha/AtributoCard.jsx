import React from 'react';
import PropTypes from 'prop-types';

import NumberField from 'components/NumberField/NumberField';

import { AtributoCardWrapper, CardTitle, CardTotal, FieldsRow } from './styles';

const AtributoCard = ({ label, total, baseName, extraName, bonusName }) => (
  <AtributoCardWrapper>
    <CardTitle>{label}</CardTitle>
    <CardTotal>{total}</CardTotal>
    <FieldsRow>
      <NumberField name={baseName} label="Base" />
      <NumberField name={extraName} label="Extra" />
      <NumberField name={bonusName} label="Bônus" />
    </FieldsRow>
  </AtributoCardWrapper>
);

AtributoCard.propTypes = {
  label: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
  baseName: PropTypes.string.isRequired,
  extraName: PropTypes.string.isRequired,
  bonusName: PropTypes.string.isRequired,
};

export default AtributoCard;
