import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import { getNome } from 'common/utils/resolveNome';

import { AtributoCardWrapper, CardTitle, StatusValueRow } from '../styles';

const ItemCard = ({ item, onAlterarQuantidade, onToggleEquipado, onRemover }) => (
  <AtributoCardWrapper style={{ alignItems: 'flex-start' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
      <CardTitle>{getNome(item) || 'Item desconhecido'}</CardTitle>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Button size="small" variant={item.equipado ? 'contained' : 'outlined'} onClick={onToggleEquipado}>
          {item.equipado ? 'Equipado' : 'Equipar'}
        </Button>
        <Button size="small" variant="outlined" color="error" onClick={onRemover}>
          ❌
        </Button>
      </div>
    </div>

    <StatusValueRow>
      {[item.qualidade, item.tipo, item.espaco != null ? `${item.espaco} espaço/un.` : null, item.bonusEspaco ? `+${item.bonusEspaco} espaço (armazenamento)` : null]
        .filter(Boolean)
        .join(' · ')}
    </StatusValueRow>

    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
      <IconButton size="small" onClick={() => onAlterarQuantidade(-1)} disabled={item.quantidade <= 1}>
        <RemoveIcon fontSize="small" />
      </IconButton>
      <StatusValueRow>{item.quantidade}</StatusValueRow>
      <IconButton size="small" onClick={() => onAlterarQuantidade(1)}>
        <AddIcon fontSize="small" />
      </IconButton>
    </div>
  </AtributoCardWrapper>
);

ItemCard.propTypes = {
  item: PropTypes.object.isRequired,
  onAlterarQuantidade: PropTypes.func.isRequired,
  onToggleEquipado: PropTypes.func.isRequired,
  onRemover: PropTypes.func.isRequired,
};

export default ItemCard;
