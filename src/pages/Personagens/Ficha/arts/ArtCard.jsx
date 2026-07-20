import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

import { DOMINIO_LABELS } from './constants';
import { AtributoCardWrapper, CardTitle, StatusValueRow } from '../styles';

const ORIGEM_LABELS = {
  autoral: 'Autoral',
  classe: 'Habilidade de Classe',
  catalogo: 'Catálogo',
};

const ArtCard = ({ art, onToggleAtiva, onRemover }) => (
  <AtributoCardWrapper style={{ alignItems: 'flex-start' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
      <CardTitle>{art.nome}</CardTitle>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="small" variant={art.ativa ? 'contained' : 'outlined'} onClick={onToggleAtiva}>
          {art.ativa ? 'Ativa' : '🔒 Bloqueada'}
        </Button>
        <Button size="small" variant="outlined" color="error" onClick={onRemover}>
          ❌ Remover
        </Button>
      </div>
    </div>

    <StatusValueRow>
      {ORIGEM_LABELS[art.origem] ?? art.origem}
      {art.tipo ? ` · ${art.tipo}` : ''}
      {art.dominio ? ` · Domínio ${art.dominio} (${DOMINIO_LABELS[art.dominio] ?? art.dominio})` : ''}
    </StatusValueRow>

    {(art.custo || art.dano || art.alcance || art.recarga || art.duracao || art.alvos) && (
      <StatusValueRow>
        {[
          art.custo && `Custo: ${art.custo}`,
          art.dano && `Dano: ${art.dano}`,
          art.alcance && `Alcance: ${art.alcance}`,
          art.recarga && `Recarga: ${art.recarga}`,
          art.duracao && `Duração: ${art.duracao}`,
          art.alvos && `Alvos: ${art.alvos}`,
        ]
          .filter(Boolean)
          .join(' · ')}
      </StatusValueRow>
    )}

    {art.descricao && <StatusValueRow>{art.descricao}</StatusValueRow>}
  </AtributoCardWrapper>
);

ArtCard.propTypes = {
  art: PropTypes.object.isRequired,
  onToggleAtiva: PropTypes.func.isRequired,
  onRemover: PropTypes.func.isRequired,
};

export default ArtCard;
