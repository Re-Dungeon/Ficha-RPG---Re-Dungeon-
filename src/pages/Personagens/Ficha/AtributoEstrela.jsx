import React from 'react';
import PropTypes from 'prop-types';

import AtributoCard from './AtributoCard';
import { EstrelaCentro, EstrelaCentroLabel, EstrelaCentroValor, EstrelaGemaSlot, EstrelaWrapper } from './styles';

// Posições das 6 pontas do hexagrama (estrela-atributos.png), em % do
// wrapper quadrado, sentido horário a partir do topo.
const POSICOES_PONTAS = [
  { top: 16, left: 50 },
  { top: 33, left: 78 },
  { top: 67, left: 78 },
  { top: 84, left: 50 },
  { top: 67, left: 22 },
  { top: 33, left: 22 },
];

const AtributoEstrela = ({ labels, totais, baseTipo, extraTipo, bonusTipo, centroLabel, centroValor }) => (
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
};

export default AtributoEstrela;
