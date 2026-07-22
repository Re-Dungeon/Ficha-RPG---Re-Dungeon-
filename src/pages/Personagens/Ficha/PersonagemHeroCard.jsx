import React from 'react';
import PropTypes from 'prop-types';

import {
  HeroAcaoBadge,
  HeroAcoesRow,
  HeroCardWrapper,
  HeroClasseRaca,
  HeroNome,
  HeroNomeBox,
  HeroRetratoFrame,
  HeroRetratoImg,
  HeroRetratoMoldura,
  HeroTitulo,
  HeroRace,
  planetaRedungeonImg,
} from './styles';

// Placeholders — o usuário troca essas URLs pelas imagens finais dos botões depois.
const SALVAR_BADGE_URL = 'https://placehold.co/112x112/1c1830/4ade80?text=Salvar';
const EXCLUIR_BADGE_URL = 'https://i.imgur.com/GS68rHh.png';

const PersonagemHeroCard = ({
  personagem,
  racaNome,
  classesNomes,
  onExcluir,
  salvando,
}) => {
  const classes = [classesNomes.join(' ➠ ')].filter(Boolean).join(' - ');

  return (
    <HeroCardWrapper>
      <HeroNomeBox>
        <HeroNome>{personagem.nome}</HeroNome>
        <HeroTitulo>{personagem.jogadorInfo?.titulo || 'Sem Título'}</HeroTitulo>
        {classes && <HeroClasseRaca>{classes}</HeroClasseRaca>}
        <HeroRace>{racaNome || 'Sem Raça'}</HeroRace>
      </HeroNomeBox>

      <HeroRetratoFrame>
        <HeroRetratoImg
          src={personagem.linkImagem || planetaRedungeonImg}
          alt={personagem.nome}
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
  classesNomes: PropTypes.array.isRequired,
  onExcluir: PropTypes.func.isRequired,
  salvando: PropTypes.bool,
};

PersonagemHeroCard.defaultProps = {
  salvando: false,
};

export default PersonagemHeroCard;
