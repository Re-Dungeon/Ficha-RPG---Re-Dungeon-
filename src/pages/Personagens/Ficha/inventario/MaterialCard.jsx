import React from 'react';
import PropTypes from 'prop-types';

import { getNome } from 'common/utils/resolveNome';
import { corRaridade, RaridadeBadge } from '../progressao/styles';

import { MATERIAL_STAT_CAMPOS, obterValorStatItem } from './constants';
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

const MaterialCard = ({ material, onVer, onEditar, onRemover }) => (
  <ItemCardWrapper $cor={corRaridade(material.raridade)}>
    <ItemImagem>{material.linkImagem ? <img src={material.linkImagem} alt={getNome(material)} /> : '🧱'}</ItemImagem>

    <ItemConteudo>
      <ItemHeader>
        <ItemNome>{getNome(material) || 'Material desconhecido'}</ItemNome>
        {material.raridade && (
          <RaridadeBadge $cor={corRaridade(material.raridade)}>{material.raridade}</RaridadeBadge>
        )}
      </ItemHeader>

      <ItemBlocos>
        {MATERIAL_STAT_CAMPOS.map(([label, campo]) => (
          <ItemBloco key={label}>
            <ItemBlocoLabel>{label}</ItemBlocoLabel>
            <ItemBlocoValor>{obterValorStatItem(material, campo) || '—'}</ItemBlocoValor>
          </ItemBloco>
        ))}
      </ItemBlocos>

      <ItemRodape>
        <ItemQuantidade>
          Quantidade: <strong>{material.quantidade}</strong>
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

MaterialCard.propTypes = {
  material: PropTypes.object.isRequired,
  onVer: PropTypes.func.isRequired,
  onEditar: PropTypes.func.isRequired,
  onRemover: PropTypes.func.isRequired,
};

export default MaterialCard;
