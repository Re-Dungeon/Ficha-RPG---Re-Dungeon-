import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { getFirestoreItem } from 'service/storage';
import { getNome } from 'common/utils/resolveNome';

import {
  PersonagemCard,
  PersonagemCardImage,
  PersonagemCardImagePlaceholder,
  PersonagemInfo,
  PersonagemMeta,
  PersonagemNome,
  PersonagemTag,
  PersonagemMedia,
  PersonagemMediaOverlay,
} from './styles';

const FALLBACK_IMAGES = [
  'https://i.imgur.com/NSDQWT3.png',
  'https://i.imgur.com/G088HoT.png'
];

const PersonagemCardItem = ({ personagem, onClick, isSelected }) => {
  const [racaNome, setRacaNome] = useState('');
  const [classesNomes, setClassesNomes] = useState([]);
  const [universoNome, setUniversoNome] = useState('');

  useEffect(() => {
    if (personagem.raca) {
      getFirestoreItem('racas', personagem.raca).then(item => setRacaNome(getNome(item)));
    } else {
      setRacaNome('');
    }
  }, [personagem.raca]);

  useEffect(() => {
    Promise.all((personagem.classes ?? []).map(id => getFirestoreItem('classes', id))).then(itens =>
      setClassesNomes(itens.filter(Boolean).map(getNome)),
    );
  }, [personagem.classes]);

  useEffect(() => {
    if (personagem.universo) {
      getFirestoreItem('Universo', personagem.universo).then(item => setUniversoNome(getNome(item)));
    } else {
      setUniversoNome('');
    }
  }, [personagem.universo]);

  const fallbackImage =
    FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)] || FALLBACK_IMAGES[0];

  return (
    <PersonagemCard type="button" onClick={onClick} $isSelected={isSelected}>
      <PersonagemMedia>
        {personagem.linkImagem ? (
          <PersonagemCardImage src={personagem.linkImagem} alt={personagem.nome} />
        ) : (
          <PersonagemCardImagePlaceholder as="img" src={fallbackImage} alt="Personagem sem imagem" />
        )}
        <PersonagemMediaOverlay />
      </PersonagemMedia>
      <PersonagemInfo>
        <PersonagemNome $isSelected={isSelected}>{personagem.nome}</PersonagemNome>
        <PersonagemMeta>
          {classesNomes.length > 0 ? (
            classesNomes.map(classe => (
              <PersonagemTag key={classe} $variant="class">
                {classe}
              </PersonagemTag>
            ))
          ) : (
            <PersonagemTag $variant="class">Sem classe</PersonagemTag>
          )}
          {racaNome ? (
            <PersonagemTag $variant="race">{racaNome}</PersonagemTag>
          ) : (
            <PersonagemTag $variant="race">Sem raça</PersonagemTag>
          )}
          <PersonagemTag $variant="realm">{universoNome || 'Sem mesa'}</PersonagemTag>
        </PersonagemMeta>
      </PersonagemInfo>
    </PersonagemCard>
  );
};

PersonagemCardItem.propTypes = {
  personagem: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};

PersonagemCardItem.defaultProps = {
  isSelected: false,
};

export default PersonagemCardItem;
