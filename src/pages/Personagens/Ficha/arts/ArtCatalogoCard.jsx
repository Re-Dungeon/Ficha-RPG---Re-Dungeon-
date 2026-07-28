import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlaceIcon from '@mui/icons-material/Place';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import BoltIcon from '@mui/icons-material/Bolt';
import UpdateIcon from '@mui/icons-material/Update';
import CasinoIcon from '@mui/icons-material/Casino';
import TimerIcon from '@mui/icons-material/Timer';

import { AcaoBadge, HabilidadeCard, HabilidadeChip, HabilidadeChipsGrid, HabilidadeDescricao, HabilidadeHeader, HabilidadeNome } from '../progressao/styles';
import { ImageThumb } from './styles';

// Card compacto de Art usado na aba "Catálogo" do CriarArtDialog, com a mesma
// linguagem visual do card de habilidade de classe para ficar consistente.
const ArtCatalogoCard = ({ art, disabled, onEscolher }) => {
  const chips = [
    art.alcance ? { icon: <PlaceIcon fontSize="inherit" />, label: art.alcance } : null,
    art.alvos ? { icon: <GpsFixedIcon fontSize="inherit" />, label: art.alvos } : null,
    art.custo ? { icon: <BoltIcon fontSize="inherit" />, label: art.custo } : null,
    art.recarga ? { icon: <UpdateIcon fontSize="inherit" />, label: art.recarga } : null,
    art.dados ? { icon: <CasinoIcon fontSize="inherit" />, label: art.dados } : null,
    art.duracao ? { icon: <TimerIcon fontSize="inherit" />, label: art.duracao } : null,
  ].filter(Boolean);

  return (
    <HabilidadeCard data-testid="catalogo-art-card" $clicavel>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <ImageThumb $size={96}>
          {art.imagem || art.linkImagem ? (
            <img src={art.imagem || art.linkImagem} alt={art.nome} />
          ) : (
            '🎴'
          )}
        </ImageThumb>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <HabilidadeHeader style={{ alignItems: 'flex-start' }}>
            <HabilidadeNome style={{ flex: 1, minWidth: 0 }}>
              <AutoAwesomeIcon fontSize="inherit" />
              <span>{art.nome}</span>
            </HabilidadeNome>
            {art.tipoAcao ? <AcaoBadge>{art.tipoAcao}</AcaoBadge> : null}
          </HabilidadeHeader>

          {art.descricao ? <HabilidadeDescricao>{art.descricao}</HabilidadeDescricao> : null}
        </div>
      </div>

      {chips.length > 0 ? (
        <HabilidadeChipsGrid>
          {chips.map((chip, index) => (
            <HabilidadeChip key={`${chip.label}-${index}`}>
              {chip.icon}
              <span>{chip.label}</span>
            </HabilidadeChip>
          ))}
        </HabilidadeChipsGrid>
      ) : null}

      <Button size="small" variant="contained" fullWidth disabled={disabled} onClick={onEscolher}>
        Escolher
      </Button>
    </HabilidadeCard>
  );
};

ArtCatalogoCard.propTypes = {
  art: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  onEscolher: PropTypes.func.isRequired,
};

ArtCatalogoCard.defaultProps = {
  disabled: false,
};

export default ArtCatalogoCard;
