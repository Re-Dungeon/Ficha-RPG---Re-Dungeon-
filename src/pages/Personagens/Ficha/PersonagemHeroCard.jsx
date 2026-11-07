import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';

import {
  HeroAcaoBadge,
  HeroAcoesRow,
  HeroCardWrapper,
  HeroNome,
  HeroNomeBox,
  HeroRace,
  HeroRaceIcon,
  HeroRaceIconPlaceholder,
  HeroRetratoFrame,
  HeroRetratoImg,
  HeroRetratoMoldura,
  HeroTitulo,
  HeroTokenList,
  HeroToken,
  planetaRedungeonImg,
} from './styles';

const SALVAR_BADGE_URL = 'https://i.imgur.com/WDQEQb8.png';
const EXCLUIR_BADGE_URL = 'https://i.imgur.com/9JyaulF.png';

const PersonagemHeroCard = ({
  personagem,
  racaNome,
  racaLinkImagem,
  classesNomes,
  onExcluir,
  salvando,
}) => {
  const classTokens = classesNomes.filter(Boolean);

  return (
    <HeroCardWrapper>
      <HeroNomeBox>
        <HeroNome>{personagem.nome}</HeroNome>
        <HeroTitulo>{personagem.jogadorInfo?.titulo || 'Sem Título'}</HeroTitulo>
        <HeroRace>
          <HeroRaceIcon>
            {racaLinkImagem ? (
              <img src={racaLinkImagem} alt={racaNome || 'Raça'} />
            ) : (
              <HeroRaceIconPlaceholder>🏰</HeroRaceIconPlaceholder>
            )}
          </HeroRaceIcon>
          {racaNome || 'Sem Raça'}
        </HeroRace>
        {classTokens.length > 0 && (
          <HeroTokenList>
            {classTokens.map((nome, index) => (
              <HeroToken key={`${nome}-${index}`}>{nome}</HeroToken>
            ))}
          </HeroTokenList>
        )}
      </HeroNomeBox>

      <HeroRetratoFrame>
        <HeroRetratoImg
          src={personagem.linkImagem || planetaRedungeonImg}
          alt={personagem.nome}
          $isPlaceholder={!personagem.linkImagem}
        />
        <HeroRetratoMoldura />
      </HeroRetratoFrame>

      <HeroAcoesRow>
        <Tooltip title="Salvar personagem" arrow placement="top">
          <HeroAcaoBadge type="submit" aria-label="Salvar personagem" disabled={salvando}>
            <img src={SALVAR_BADGE_URL} alt="" />
          </HeroAcaoBadge>
        </Tooltip>

        <Tooltip title="Remover personagem" arrow placement="top">
          <HeroAcaoBadge type="button" aria-label="Remover personagem" onClick={onExcluir}>
            <img src={EXCLUIR_BADGE_URL} alt="" />
          </HeroAcaoBadge>
        </Tooltip>
      </HeroAcoesRow>
    </HeroCardWrapper>
  );
};

PersonagemHeroCard.propTypes = {
  personagem: PropTypes.object.isRequired,
  racaNome: PropTypes.string.isRequired,
  racaLinkImagem: PropTypes.string,
  classesNomes: PropTypes.array.isRequired,
  onExcluir: PropTypes.func.isRequired,
  salvando: PropTypes.bool,
};

PersonagemHeroCard.defaultProps = {
  racaLinkImagem: '',
  salvando: false,
};

export default PersonagemHeroCard;
