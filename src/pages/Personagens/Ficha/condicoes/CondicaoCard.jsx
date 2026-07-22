import React from 'react';
import PropTypes from 'prop-types';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';

import { getNome } from 'common/utils/resolveNome';

import {
  CondicaoAcaoBtn,
  CondicaoAcoesRow,
  CondicaoCardWrapper,
  CondicaoDescricaoResumo,
  CondicaoDuracaoBadge,
  CondicaoIcone,
  CondicaoInfo,
  CondicaoNome,
} from './styles';

const CondicaoCard = ({ ativo, condicao, onVer, onAlterarDuracao, onRemover }) => {
  const nome = getNome(condicao) || 'Condição';

  return (
    <CondicaoCardWrapper>
      <CondicaoIcone>
        {condicao?.linkImagem ? <img src={condicao.linkImagem} alt="" /> : '⚠️'}
      </CondicaoIcone>

      <CondicaoInfo>
        <CondicaoNome>
          {nome} {ativo.stack > 1 ? `(x${ativo.stack})` : ''}
        </CondicaoNome>
        {condicao?.descricao && <CondicaoDescricaoResumo>{condicao.descricao}</CondicaoDescricaoResumo>}
      </CondicaoInfo>

      <CondicaoDuracaoBadge>
        <input
          type="number"
          aria-label={`Duração restante de ${nome} em turnos`}
          value={ativo.duracaoRestante ?? ''}
          onChange={event =>
            onAlterarDuracao(event.target.value === '' ? null : Number(event.target.value))
          }
        />
        T
      </CondicaoDuracaoBadge>

      <CondicaoAcoesRow>
        <CondicaoAcaoBtn type="button" $variante="ver" aria-label={`Ver detalhes de ${nome}`} onClick={onVer}>
          <VisibilityIcon fontSize="inherit" />
        </CondicaoAcaoBtn>
        <CondicaoAcaoBtn type="button" $variante="remover" aria-label={`Remover ${nome}`} onClick={onRemover}>
          <CloseIcon fontSize="inherit" />
        </CondicaoAcaoBtn>
      </CondicaoAcoesRow>
    </CondicaoCardWrapper>
  );
};

CondicaoCard.propTypes = {
  ativo: PropTypes.object.isRequired,
  condicao: PropTypes.object,
  onVer: PropTypes.func.isRequired,
  onAlterarDuracao: PropTypes.func.isRequired,
  onRemover: PropTypes.func.isRequired,
};

CondicaoCard.defaultProps = {
  condicao: null,
};

export default CondicaoCard;
