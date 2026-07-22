import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

import { getNome } from 'common/utils/resolveNome';

import { ITEM_STAT_CAMPOS, QUALIDADE_META, obterEmojiTipo, obterValorStatItem } from '../inventario/constants';
import {
  ItemBloco,
  ItemBlocoLabel,
  ItemBlocoValor,
  ItemBlocos,
  ItemCardWrapper,
  ItemConteudo,
  ItemHeader,
  ItemImagem,
  ItemNome,
  QualidadeBadge,
} from '../inventario/styles';
import { ItemLojaPrecoBadge, ItemLojaRodape, ItemPosseBadge } from './styles';

// Card de item da Loja Rokmas — mesma linguagem visual do ItemCard/ItemCatalogoCard
// do Inventário (seção "Padrão de card" do CLAUDE.md), reaproveitado tanto para
// comprar (item do catálogo `itens`) quanto para vender (doc de `itensInventario`).
const LojaItemCard = ({
  item,
  posse = 0,
  precoLabel,
  precoValor,
  botaoLabel,
  botaoDisabled = false,
  botaoTitulo,
  onBotaoClick,
}) => {
  const qualidadeMeta = QUALIDADE_META[item.qualidade] ?? {};

  return (
    <ItemCardWrapper $cor={qualidadeMeta.cor} style={{ position: 'relative' }}>
      {posse > 0 && <ItemPosseBadge>x{posse}</ItemPosseBadge>}

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

        <ItemLojaRodape>
          <ItemLojaPrecoBadge>
            {precoLabel}: {precoValor}
          </ItemLojaPrecoBadge>
          <Button
            size="small"
            variant="contained"
            fullWidth
            disabled={botaoDisabled}
            title={botaoTitulo}
            onClick={onBotaoClick}
          >
            {botaoLabel}
          </Button>
        </ItemLojaRodape>
      </ItemConteudo>
    </ItemCardWrapper>
  );
};

LojaItemCard.propTypes = {
  item: PropTypes.object.isRequired,
  posse: PropTypes.number,
  precoLabel: PropTypes.string.isRequired,
  precoValor: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  botaoLabel: PropTypes.string.isRequired,
  botaoDisabled: PropTypes.bool,
  botaoTitulo: PropTypes.string,
  onBotaoClick: PropTypes.func.isRequired,
};

export default LojaItemCard;
