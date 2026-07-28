import { useEffect, useState } from 'react';

import { getFirestoreItem } from 'service/storage';
import { getNome } from 'common/utils/resolveNome';

export const useRacaClasseNomes = personagem => {
  const [racaNome, setRacaNome] = useState('');
  const [racaLinkImagem, setRacaLinkImagem] = useState('');
  const [classesNomes, setClassesNomes] = useState([]);

  useEffect(() => {
    if (personagem.raca) {
      getFirestoreItem('racas', personagem.raca)
        .then(item => {
          setRacaNome(getNome(item));
          setRacaLinkImagem(item?.linkImagem ?? '');
        })
        .catch(erro => {
          // eslint-disable-next-line no-console
          console.error('Falha ao carregar nome da raça:', erro);
        });
    } else {
      setRacaNome('');
      setRacaLinkImagem('');
    }
  }, [personagem.raca]);

  useEffect(() => {
    Promise.all((personagem.classes ?? []).map(id => getFirestoreItem('classes', id)))
      .then(itens => setClassesNomes(itens.filter(Boolean).map(getNome)))
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar nomes das classes:', erro);
      });
  }, [personagem.classes]);

  return { racaNome, racaLinkImagem, classesNomes };
};
