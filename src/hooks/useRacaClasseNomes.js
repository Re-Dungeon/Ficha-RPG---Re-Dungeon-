import { useEffect, useState } from 'react';

import { getFirestoreItem } from 'service/storage';
import { getNome } from 'common/utils/resolveNome';

export const useRacaClasseNomes = personagem => {
  const [racaNome, setRacaNome] = useState('');
  const [classesNomes, setClassesNomes] = useState([]);

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

  return { racaNome, classesNomes };
};
