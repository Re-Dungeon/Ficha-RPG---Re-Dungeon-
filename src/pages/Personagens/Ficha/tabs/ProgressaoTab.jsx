import React from 'react';
import PropTypes from 'prop-types';

import { calcularPowerCombat, calcularPrimariosTotais, calcularSecundarios } from 'common/utils/formulas';

import UniversoSelect from '../progressao/UniversoSelect';
import RacaSection from '../progressao/RacaSection';
import ClassesSection from '../progressao/ClassesSection';
import TreinamentoSection from '../progressao/TreinamentoSection';
import { SectionTitle } from '../styles';

const ProgressaoTab = ({ personagem, onSave }) => {
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
    <div>
      <SectionTitle>Universo</SectionTitle>
      <div style={{ marginTop: 12 }}>
        <UniversoSelect personagem={personagem} onSave={onSave} />
      </div>

      <div style={{ marginTop: 32 }}>
        <RacaSection personagem={personagem} onSave={onSave} />
      </div>

      <div style={{ marginTop: 32 }}>
        <ClassesSection personagem={personagem} onSave={onSave} powerCombat={powerCombat} />
      </div>

      <TreinamentoSection personagem={personagem} onSave={onSave} sorteTotal={primariosTotais.sorte} />
    </div>
  );
};

ProgressaoTab.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ProgressaoTab;
