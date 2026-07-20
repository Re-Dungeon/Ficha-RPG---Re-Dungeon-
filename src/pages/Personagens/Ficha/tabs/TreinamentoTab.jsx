import React from 'react';
import PropTypes from 'prop-types';

import { calcularPrimariosTotais } from 'common/utils/formulas';

import TreinamentoSection from '../progressao/TreinamentoSection';

const TreinamentoTab = ({ personagem, onSave }) => {
  const primariosTotais = calcularPrimariosTotais(
    personagem.atributosBase,
    personagem.atributosExtra,
    personagem.atributosBonus,
  );

  return (
    <div>
      <TreinamentoSection personagem={personagem} onSave={onSave} sorteTotal={primariosTotais.sorte} />
    </div>
  );
};

TreinamentoTab.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default TreinamentoTab;
