import React from 'react';
import PropTypes from 'prop-types';
import LinearProgress from '@mui/material/LinearProgress';

import NumberField from 'components/NumberField/NumberField';

import { AtributoCardWrapper, CardTitle, FieldsRow, StatusValueRow } from './styles';

const StatusCard = ({ label, maximo, atual, atualName, baseName, extraName, bonusName }) => {
  const percentual = maximo > 0 ? Math.min(100, Math.max(0, (atual / maximo) * 100)) : 0;

  return (
    <AtributoCardWrapper>
      <CardTitle>{label}</CardTitle>
      <StatusValueRow>
        {atual} / {maximo}
      </StatusValueRow>
      <LinearProgress
        variant="determinate"
        value={percentual}
        sx={{ borderRadius: 4, height: 8 }}
      />
      <FieldsRow>
        <NumberField name={atualName} label="Atual" />
        <NumberField name={baseName} label="Base" />
        <NumberField name={extraName} label="Extra" />
        <NumberField name={bonusName} label="Bônus" />
      </FieldsRow>
    </AtributoCardWrapper>
  );
};

StatusCard.propTypes = {
  label: PropTypes.string.isRequired,
  maximo: PropTypes.number.isRequired,
  atual: PropTypes.number.isRequired,
  atualName: PropTypes.string.isRequired,
  baseName: PropTypes.string.isRequired,
  extraName: PropTypes.string.isRequired,
  bonusName: PropTypes.string.isRequired,
};

export default StatusCard;
