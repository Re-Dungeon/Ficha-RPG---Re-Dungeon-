import React from 'react';
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

// Placeholders — o usuário troca essas URLs pelas imagens finais dos botões depois.
const SALVAR_BADGE_URL = 'https://placehold.co/112x112/1c1830/4ade80?text=Salvar';
const EXCLUIR_BADGE_URL = 'https://i.imgur.com/GS68rHh.png';

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
        <HeroAcaoBadge type="submit" aria-label="Salvar" disabled={salvando}>
          <img src={SALVAR_BADGE_URL} alt="" />
        </HeroAcaoBadge>
        <HeroAcaoBadge type="button" aria-label="Excluir Personagem" onClick={onExcluir}>
          <img src={EXCLUIR_BADGE_URL} alt="" />
        </HeroAcaoBadge>
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
