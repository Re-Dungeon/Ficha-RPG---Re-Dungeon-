import React from 'react';
import PropTypes from 'prop-types';

import AtributoCard from './AtributoCard';
import { EstrelaCentro, EstrelaCentroLabel, EstrelaCentroValor, EstrelaGemaSlot, EstrelaWrapper } from './styles';

// Posições das 6 pontas do hexagrama (estrela-atributos.webp), em % do
// wrapper quadrado, sentido horário a partir do topo.
const POSICOES_PONTAS = [
  { top: 18, left: 50 },
  { top: 31.5, left: 77.4 },
  { top: 64, left: 77.4 },
  { top: 77.6, left: 50 },
  { top: 64, left: 23 },
  { top: 31.5, left: 23 },
];

const BONUS_CULTIVO_PADRAO = {};

const AtributoEstrela = ({ labels, totais, baseTipo, extraTipo, bonusTipo, centroLabel, centroValor, bonusCultivo = BONUS_CULTIVO_PADRAO, personagem, onSave = null }) => (
  <EstrelaWrapper>
    <EstrelaCentro>
      <EstrelaCentroValor>{centroValor}</EstrelaCentroValor>
      <EstrelaCentroLabel>{centroLabel}</EstrelaCentroLabel>
    </EstrelaCentro>

    {Object.entries(labels).map(([chave, label], index) => (
      <EstrelaGemaSlot key={chave} $top={POSICOES_PONTAS[index].top} $left={POSICOES_PONTAS[index].left}>
        <AtributoCard
          label={label}
          total={totais[chave]}
          baseName={`${baseTipo}.${chave}`}
          extraName={`${extraTipo}.${chave}`}
          bonusName={`${bonusTipo}.${chave}`}
          bonusCultivo={bonusCultivo?.[chave] ?? 0}
          personagem={personagem}
          onSave={onSave}
        />
      </EstrelaGemaSlot>
    ))}
  </EstrelaWrapper>
);

AtributoEstrela.propTypes = {
  labels: PropTypes.object.isRequired,
  totais: PropTypes.object.isRequired,
  baseTipo: PropTypes.string.isRequired,
  extraTipo: PropTypes.string.isRequired,
  bonusTipo: PropTypes.string.isRequired,
  centroLabel: PropTypes.string.isRequired,
  centroValor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  bonusCultivo: PropTypes.object,
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func,
};
export default AtributoEstrela;
