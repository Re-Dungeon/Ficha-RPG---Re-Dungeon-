import React from 'react';
import PropTypes from 'prop-types';

import { getNome } from 'common/utils/resolveNome';

import { ITEM_STAT_CAMPOS, QUALIDADE_META, obterEmojiTipo, obterValorStatItem } from './constants';
import {
  EquipadoBadge,
  ItemBloco,
  ItemBlocoLabel,
  ItemBlocoValor,
  ItemBlocos,
  ItemBotoesGrid,
  ItemBtn,
  ItemCardWrapper,
  ItemConteudo,
  ItemEspacoInfo,
  ItemEspacoValor,
  ItemHeader,
  ItemImagem,
  ItemNome,
  ItemQuantidade,
  ItemRodape,
  QualidadeBadge,
} from './styles';

const ItemCard = ({ item, onVer, onEditar, onEquipar, onRemover }) => {
  const qualidadeMeta = QUALIDADE_META[item.qualidade] ?? {};
  const espacoUnitario = item.pesoUnitario ?? 0;
  const espacoTotal = espacoUnitario * (item.quantidade ?? 1);

  return (
    <ItemCardWrapper $cor={qualidadeMeta.cor} data-equipado={Boolean(item.equipado)}>
      {item.equipado && <EquipadoBadge>⚔️ Equipado</EquipadoBadge>}

      <ItemImagem>
        {item.linkImagem ? <img src={item.linkImagem} alt={getNome(item)} /> : obterEmojiTipo(item.tipo)}
      </ItemImagem>

      <ItemConteudo>
        <ItemHeader>
          <ItemNome>{getNome(item) || 'Item desconhecido'}</ItemNome>
          {item.qualidade && <QualidadeBadge $cor={qualidadeMeta.cor}>{item.qualidade}</QualidadeBadge>}
        </ItemHeader>

        <ItemBlocos>
          {ITEM_STAT_CAMPOS.map(([label, campo]) => (
            <ItemBloco key={label}>
              <ItemBlocoLabel>{label}</ItemBlocoLabel>
              <ItemBlocoValor>{obterValorStatItem(item, campo) || '—'}</ItemBlocoValor>
            </ItemBloco>
          ))}
        </ItemBlocos>

        <ItemRodape>
          <ItemQuantidade>
            Quantidade: <strong>{item.quantidade}</strong>
          </ItemQuantidade>
          <ItemEspacoInfo>
            <span>
              <small>Unitário</small>
              <ItemEspacoValor>{espacoUnitario.toFixed(2)}</ItemEspacoValor>
            </span>
            <span>
              <small>Total</small>
              <ItemEspacoValor>{espacoTotal.toFixed(2)}</ItemEspacoValor>
            </span>
          </ItemEspacoInfo>

          <ItemBotoesGrid>
            <ItemBtn $variante="editar" onClick={onEditar}>
              ✏️ Editar
            </ItemBtn>
            <ItemBtn $variante="ver" onClick={onVer}>
              👁️ Ver
            </ItemBtn>
            <ItemBtn $variante="equipar" onClick={onEquipar}>
              {item.equipado ? '🗝️ Desequipar' : '⚔️ Equipar'}
            </ItemBtn>
            <ItemBtn $variante="deletar" onClick={onRemover}>
              🗑️ Deletar
            </ItemBtn>
          </ItemBotoesGrid>
        </ItemRodape>
      </ItemConteudo>
    </ItemCardWrapper>
  );
};

ItemCard.propTypes = {
  item: PropTypes.object.isRequired,
  onVer: PropTypes.func.isRequired,
  onEditar: PropTypes.func.isRequired,
  onEquipar: PropTypes.func.isRequired,
  onRemover: PropTypes.func.isRequired,
};

export default ItemCard;
