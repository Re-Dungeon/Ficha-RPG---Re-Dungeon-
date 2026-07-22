import React from 'react';
import PropTypes from 'prop-types';

import { NoCirculo, NoCustoBadge, NoNomeLabel, NoWrapper } from './styles';

const NoNode = ({ no, desbloqueado, disponivel, cor, x, y, onClick }) => (
  <NoWrapper style={{ left: x, top: y }}>
    <NoCirculo
      type="button"
      title={no.nome}
      $desbloqueado={desbloqueado}
      $disponivel={disponivel}
      $cor={cor}
      onClick={onClick}
    >
      {no.linkImagem ? <img src={no.linkImagem} alt="" /> : desbloqueado ? '⭐' : '🔒'}
    </NoCirculo>
    <NoNomeLabel $desbloqueado={desbloqueado}>{no.nome ?? `Nó ${no.id}`}</NoNomeLabel>
    <NoCustoBadge>{no.custo} PC</NoCustoBadge>
  </NoWrapper>
);

NoNode.propTypes = {
  no: PropTypes.object.isRequired,
  desbloqueado: PropTypes.bool.isRequired,
  disponivel: PropTypes.bool.isRequired,
  cor: PropTypes.string.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default NoNode;
