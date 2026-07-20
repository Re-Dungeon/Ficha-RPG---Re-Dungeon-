import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';

import { getFirestoreItem } from 'service/storage';

import { PersonagemCard, PersonagemDetail, PersonagemInfo, PersonagemNome } from './styles';

const PersonagemCardItem = ({ personagem, onClick }) => {
  const [racaNome, setRacaNome] = useState('');
  const [classesNomes, setClassesNomes] = useState([]);

  useEffect(() => {
    if (personagem.raca) {
      getFirestoreItem('racas', personagem.raca).then(item => setRacaNome(item?.Nome ?? ''));
    } else {
      setRacaNome('');
    }
  }, [personagem.raca]);

  useEffect(() => {
    Promise.all((personagem.classes ?? []).map(id => getFirestoreItem('classes', id))).then(itens =>
      setClassesNomes(itens.filter(Boolean).map(item => item.Nome)),
    );
  }, [personagem.classes]);

  return (
    <PersonagemCard type="button" onClick={onClick}>
      <Avatar
        src={personagem.linkImagem || undefined}
        alt={personagem.nome}
        sx={{ width: 72, height: 72, border: '1px solid var(--border-primary)' }}
      />
      <PersonagemInfo>
        <PersonagemNome>{personagem.nome}</PersonagemNome>
        <PersonagemDetail>{classesNomes.length > 0 ? classesNomes.join(' ➠ ') : 'Sem classe'}</PersonagemDetail>
        <PersonagemDetail>{racaNome || 'Sem raça'}</PersonagemDetail>
      </PersonagemInfo>
    </PersonagemCard>
  );
};

PersonagemCardItem.propTypes = {
  personagem: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default PersonagemCardItem;
