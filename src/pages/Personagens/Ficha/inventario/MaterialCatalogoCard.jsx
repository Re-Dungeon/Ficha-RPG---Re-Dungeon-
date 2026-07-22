import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

import { getNome } from 'common/utils/resolveNome';
import { corRaridade, RaridadeBadge } from '../progressao/styles';

import { MATERIAL_STAT_CAMPOS, obterValorStatItem } from './constants';
import { ItemBloco, ItemBlocoLabel, ItemBlocoValor, ItemBlocos, ItemCardWrapper, ItemConteudo, ItemHeader, ItemImagem, ItemNome } from './styles';

// Card compacto do catálogo `materiais`, usado na aba "Catálogo" do
// CriarMaterialDialog — mesma linguagem visual do MaterialCard da ficha.
const MaterialCatalogoCard = ({ material, onEscolher }) => (
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

      <Button size="small" variant="contained" fullWidth onClick={onEscolher} style={{ marginTop: 8 }}>
        Escolher
      </Button>
    </ItemConteudo>
  </ItemCardWrapper>
);

MaterialCatalogoCard.propTypes = {
  material: PropTypes.object.isRequired,
  onEscolher: PropTypes.func.isRequired,
};

export default MaterialCatalogoCard;
