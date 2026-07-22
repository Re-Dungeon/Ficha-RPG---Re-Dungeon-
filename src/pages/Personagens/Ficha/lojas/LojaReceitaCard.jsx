import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

import { getNome } from 'common/utils/resolveNome';
import { corRaridade, RaridadeBadge } from '../progressao/styles';

import { ItemBloco, ItemBlocoLabel, ItemBlocoValor, ItemBlocos, ItemCardWrapper, ItemConteudo, ItemHeader, ItemImagem, ItemNome } from '../inventario/styles';
import { ItemLojaPrecoBadge, ItemLojaRodape, ItemPosseBadge } from './styles';

// Card de receita da Loja Rokmas — mesma linguagem visual do LojaItemCard,
// reaproveitado para vender docs de `receitasInventario`.
const LojaReceitaCard = ({ receita, posse = 0, precoLabel, precoValor, botaoLabel, botaoDisabled = false, botaoTitulo, onBotaoClick }) => (
  <ItemCardWrapper $cor={corRaridade(receita.raridade)} style={{ position: 'relative' }}>
    {posse > 0 && <ItemPosseBadge>x{posse}</ItemPosseBadge>}

    <ItemImagem>{receita.linkImagem ? <img src={receita.linkImagem} alt={getNome(receita)} /> : '📜'}</ItemImagem>

    <ItemConteudo>
      <ItemHeader>
        <ItemNome>{getNome(receita) || 'Receita desconhecida'}</ItemNome>
        {receita.raridade && (
          <RaridadeBadge $cor={corRaridade(receita.raridade)}>{receita.raridade}</RaridadeBadge>
        )}
      </ItemHeader>

      <ItemBlocos>
        <ItemBloco>
          <ItemBlocoLabel>Categoria</ItemBlocoLabel>
          <ItemBlocoValor>{receita.categoria || '—'}</ItemBlocoValor>
        </ItemBloco>
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

LojaReceitaCard.propTypes = {
  receita: PropTypes.object.isRequired,
  posse: PropTypes.number,
  precoLabel: PropTypes.string.isRequired,
  precoValor: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  botaoLabel: PropTypes.string.isRequired,
  botaoDisabled: PropTypes.bool,
  botaoTitulo: PropTypes.string,
  onBotaoClick: PropTypes.func.isRequired,
};

export default LojaReceitaCard;
