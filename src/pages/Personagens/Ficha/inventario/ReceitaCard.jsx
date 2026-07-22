import React from 'react';
import PropTypes from 'prop-types';

import { getNome } from 'common/utils/resolveNome';
import { corRaridade, RaridadeBadge } from '../progressao/styles';

import { RECEITA_STAT_CAMPOS, obterValorStatItem } from './constants';
import {
  ItemBloco,
  ItemBlocoLabel,
  ItemBlocoValor,
  ItemBlocos,
  ItemBotoesGrid,
  ItemBtn,
  ItemCardWrapper,
  ItemConteudo,
  ItemHeader,
  ItemImagem,
  ItemNome,
  ItemQuantidade,
  ItemRodape,
} from './styles';

const ReceitaCard = ({ receita, onVer, onEditar, onRemover }) => (
  <ItemCardWrapper $cor={corRaridade(receita.raridade)}>
    <ItemImagem>{receita.linkImagem ? <img src={receita.linkImagem} alt={getNome(receita)} /> : '📜'}</ItemImagem>

    <ItemConteudo>
      <ItemHeader>
        <ItemNome>{getNome(receita) || 'Receita desconhecida'}</ItemNome>
        {receita.raridade && (
          <RaridadeBadge $cor={corRaridade(receita.raridade)}>{receita.raridade}</RaridadeBadge>
        )}
      </ItemHeader>

      <ItemBlocos>
        {RECEITA_STAT_CAMPOS.map(([label, campo]) => (
          <ItemBloco key={label}>
            <ItemBlocoLabel>{label}</ItemBlocoLabel>
            <ItemBlocoValor>{obterValorStatItem(receita, campo) || '—'}</ItemBlocoValor>
          </ItemBloco>
        ))}
      </ItemBlocos>

      <ItemRodape>
        <ItemQuantidade>
          Quantidade: <strong>{receita.quantidade}</strong>
        </ItemQuantidade>

        <ItemBotoesGrid style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <ItemBtn $variante="editar" onClick={onEditar}>
            ✏️ Editar
          </ItemBtn>
          <ItemBtn $variante="ver" onClick={onVer}>
            👁️ Ver
          </ItemBtn>
          <ItemBtn $variante="deletar" onClick={onRemover}>
            🗑️ Deletar
          </ItemBtn>
        </ItemBotoesGrid>
      </ItemRodape>
    </ItemConteudo>
  </ItemCardWrapper>
);

ReceitaCard.propTypes = {
  receita: PropTypes.object.isRequired,
  onVer: PropTypes.func.isRequired,
  onEditar: PropTypes.func.isRequired,
  onRemover: PropTypes.func.isRequired,
};

export default ReceitaCard;
