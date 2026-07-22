import React from 'react';
import PropTypes from 'prop-types';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

import { getNome } from 'common/utils/resolveNome';

import { OrigemCardButton, OrigemImagem, OrigemInfo, OrigemNomeTitulo, OrigemReputacaoResumo, ReputacaoBadge } from './styles';

const OrigemReputacaoCard = ({ origem, fama, terror, onClick }) => (
  <OrigemCardButton type="button" onClick={onClick}>
    <OrigemImagem>{origem.linkImagem ? <img src={origem.linkImagem} alt="" /> : '🌍'}</OrigemImagem>
    <OrigemInfo>
      <OrigemNomeTitulo>{getNome(origem) || 'Origem desconhecida'}</OrigemNomeTitulo>
      <OrigemReputacaoResumo>
        <ReputacaoBadge $variante="fama">
          <MilitaryTechIcon fontSize="inherit" /> Fama {fama}
        </ReputacaoBadge>
        <ReputacaoBadge $variante="terror">
          <SentimentVeryDissatisfiedIcon fontSize="inherit" /> Terror {terror}
        </ReputacaoBadge>
      </OrigemReputacaoResumo>
    </OrigemInfo>
  </OrigemCardButton>
);

OrigemReputacaoCard.propTypes = {
  origem: PropTypes.object.isRequired,
  fama: PropTypes.number.isRequired,
  terror: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default OrigemReputacaoCard;
