import React from 'react';
import PropTypes from 'prop-types';

import { getNome } from 'common/utils/resolveNome';

import {
  DivindadeCardButton,
  DivindadeDescricaoTexto,
  DivindadeImagem,
  DivindadeInfo,
  DivindadeNomeTitulo,
  DivindadeProgressoBadge,
} from './styles';

const RESUMO_TAMANHO = 140;

const DivindadeCard = ({ divindade, veias, totalDesbloqueados, onClick }) => {
  const descricao = divindade?.descricao ?? '';
  const resumo = descricao.length > RESUMO_TAMANHO ? `${descricao.slice(0, RESUMO_TAMANHO)}...` : descricao;

  return (
    <DivindadeCardButton type="button" onClick={onClick}>
      <DivindadeImagem>{divindade?.linkImagem ? <img src={divindade.linkImagem} alt="" /> : '✨'}</DivindadeImagem>
      <DivindadeInfo>
        <DivindadeNomeTitulo>{getNome(divindade) || 'Divindade desconhecida'}</DivindadeNomeTitulo>
        {resumo && <DivindadeDescricaoTexto>{resumo}</DivindadeDescricaoTexto>}
        <DivindadeProgressoBadge>
          {totalDesbloqueados} / {veias.length} veias desbloqueadas
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
