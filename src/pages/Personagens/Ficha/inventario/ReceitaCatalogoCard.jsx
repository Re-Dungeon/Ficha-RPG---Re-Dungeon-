import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

import { getNome } from 'common/utils/resolveNome';
import { corRaridade, RaridadeBadge } from '../progressao/styles';

import { RECEITA_STAT_CAMPOS, obterValorStatItem } from './constants';
import { ItemBloco, ItemBlocoLabel, ItemBlocoValor, ItemBlocos, ItemCardWrapper, ItemConteudo, ItemHeader, ItemImagem, ItemNome } from './styles';

// Card compacto do catálogo `receitas`, usado na aba "Catálogo" do
// CriarReceitaDialog — mesma linguagem visual do ReceitaCard da ficha.
const ReceitaCatalogoCard = ({ receita, onEscolher }) => (
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

      <Button size="small" variant="contained" fullWidth onClick={onEscolher} style={{ marginTop: 8 }}>
        Escolher
      </Button>
    </ItemConteudo>
  </ItemCardWrapper>
);

ReceitaCatalogoCard.propTypes = {
  receita: PropTypes.object.isRequired,
  onEscolher: PropTypes.func.isRequired,
};

export default ReceitaCatalogoCard;
