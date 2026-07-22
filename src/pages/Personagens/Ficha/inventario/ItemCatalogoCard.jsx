import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

import { getNome } from 'common/utils/resolveNome';

import { ITEM_STAT_CAMPOS, QUALIDADE_META, obterEmojiTipo, obterValorStatItem } from './constants';
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
} from './styles';

// Card compacto do catálogo `itens`, usado na aba "Catálogo" do CriarItemDialog
// — mesma linguagem visual do ItemCard da ficha, mas com um único botão de
// rodapé ("Escolher") em vez das ações de editar/equipar/remover.
const ItemCatalogoCard = ({ item, onEscolher }) => {
  const qualidadeMeta = QUALIDADE_META[item.qualidade] ?? {};

  return (
    <ItemCardWrapper $cor={qualidadeMeta.cor}>
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

        <Button size="small" variant="contained" fullWidth onClick={onEscolher} style={{ marginTop: 8 }}>
          Escolher
        </Button>
      </ItemConteudo>
    </ItemCardWrapper>
  );
};

ItemCatalogoCard.propTypes = {
  item: PropTypes.object.isRequired,
  onEscolher: PropTypes.func.isRequired,
};

export default ItemCatalogoCard;
