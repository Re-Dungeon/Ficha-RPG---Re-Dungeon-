import React from 'react';
import PropTypes from 'prop-types';

import { getNome } from 'common/utils/resolveNome';

import {
  DivindadeCardButton,
  DivindadeImagem,
  DivindadeInfo,
  DivindadeNomeTitulo,
  DivindadeProgressoBadge,
} from './styles';

const DivindadeCard = ({ divindade, veias, totalDesbloqueados, onClick }) => {

  const total = veias.length || 0;
  const pct = total > 0 ? Math.round((totalDesbloqueados / total) * 100) : 0;

  // expose CSS vars for color and progress only for visual styling
  const cssVars = {
    '--cor': divindade?.cor ?? 'var(--color-accent)',
    '--progress': `${pct}%`,
  };

  return (
    <DivindadeCardButton type="button" onClick={onClick} style={cssVars}>
      <DivindadeImagem>{divindade?.linkImagem ? <img src={divindade.linkImagem} alt="" /> : '✨'}</DivindadeImagem>
      <DivindadeInfo>
        <DivindadeNomeTitulo>{getNome(divindade) || 'Divindade desconhecida'}</DivindadeNomeTitulo>
        {/* descrição removida do card: mantemos todos os dados intactos (visual-only) */}
        <DivindadeProgressoBadge>
          {totalDesbloqueados} / {total} veias desbloqueadas
          <span aria-hidden={true} />
        </DivindadeProgressoBadge>
      </DivindadeInfo>
    </DivindadeCardButton>
  );
};

DivindadeCard.propTypes = {
  divindade: PropTypes.object,
  veias: PropTypes.array.isRequired,
  totalDesbloqueados: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};

DivindadeCard.defaultProps = {
  divindade: null,
};

export default DivindadeCard;
