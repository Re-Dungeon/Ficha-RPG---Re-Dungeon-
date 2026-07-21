import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { getFirestoreItem } from 'service/storage';
import { getNome } from 'common/utils/resolveNome';

import {
  PersonagemCard,
  PersonagemCardImage,
  PersonagemCardImagePlaceholder,
  PersonagemDetail,
  PersonagemInfo,
  PersonagemNome,
  PersonagemUniverso,
} from './styles';

const PersonagemCardItem = ({ personagem, onClick }) => {
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

  const racaClasse = [racaNome, classesNomes.join(' ➠ ')].filter(Boolean).join(' - ');

  return (
    <PersonagemCard type="button" onClick={onClick}>
      {personagem.linkImagem ? (
        <PersonagemCardImage src={personagem.linkImagem} alt={personagem.nome} />
      ) : (
        <PersonagemCardImagePlaceholder>Sem imagem</PersonagemCardImagePlaceholder>
      )}
      <PersonagemInfo>
        <PersonagemNome>{personagem.nome}</PersonagemNome>
        <PersonagemDetail>{racaClasse || 'Sem raça/classe'}</PersonagemDetail>
        <PersonagemUniverso>{universoNome || 'Sem universo'}</PersonagemUniverso>
      </PersonagemInfo>
    </PersonagemCard>
  );
};

PersonagemCardItem.propTypes = {
  personagem: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default PersonagemCardItem;
