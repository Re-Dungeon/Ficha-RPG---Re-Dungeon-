import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

import {
  CardFooterActions,
  Divider,
  EssenciaTexto,
  EssenciaTitle,
  ImageThumb,
  NucleoArtsBadge,
  NucleoCardWrapper,
  NucleoInfo,
  NucleoMeta,
  NucleoNome,
  NucleoTopRow,
} from './styles';

const NucleoCard = ({ nucleo, artsCount, onVer, onEditar, onRemover }) => (
  <NucleoCardWrapper>
    <NucleoArtsBadge>📜 {artsCount} art(s)</NucleoArtsBadge>

    <NucleoTopRow>
      <ImageThumb $size={80}>
        {nucleo.imagem ? <img src={nucleo.imagem} alt={nucleo.nome} /> : '🎨'}
      </ImageThumb>
      <NucleoInfo>
        <NucleoNome>{nucleo.nome}</NucleoNome>
        <NucleoMeta>
          <strong>Tipo:</strong> {nucleo.tipo || 'Sem tipo'}
        </NucleoMeta>
        <NucleoMeta>
          <strong>Essência:</strong> {nucleo.bonus || 'Não definida'}
        </NucleoMeta>
        {nucleo.classeId && (
          <NucleoMeta style={{ fontSize: '0.7rem' }}>🏫 Vinculado à classe</NucleoMeta>
        )}
      </NucleoInfo>
    </NucleoTopRow>

    <Divider />

    <div>
      <EssenciaTitle>✨ Essência</EssenciaTitle>
      <EssenciaTexto>
        {nucleo.descricao
          ? nucleo.descricao.slice(0, 150) + (nucleo.descricao.length > 150 ? '...' : '')
          : 'Sem descrição'}
      </EssenciaTexto>
    </div>

    <Divider />

    <CardFooterActions>
      <Button size="small" variant="outlined" onClick={onVer} sx={{ flex: 1 }}>
        🔍 Ver
      </Button>
      <Button size="small" variant="outlined" onClick={onEditar} sx={{ flex: 1 }}>
        ✏️ Editar
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="error"
        onClick={onRemover}
        sx={{ flex: 1 }}
      >
        🗑️ Remover
      </Button>
    </CardFooterActions>
  </NucleoCardWrapper>
);

NucleoCard.propTypes = {
  nucleo: PropTypes.object.isRequired,
  artsCount: PropTypes.number.isRequired,
  onVer: PropTypes.func.isRequired,
  onEditar: PropTypes.func.isRequired,
  onRemover: PropTypes.func.isRequired,
};

export default NucleoCard;
