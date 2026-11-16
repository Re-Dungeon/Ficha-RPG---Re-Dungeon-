import { useEffect, useState } from 'react';

import { getCatalogoItem } from 'service/storage';
import { getNome } from 'common/utils/resolveNome';

export const useRacaClasseNomes = personagem => {
  const [racaNome, setRacaNome] = useState('');
  const [racaLinkImagem, setRacaLinkImagem] = useState('');
  const [classesNomes, setClassesNomes] = useState([]);

  useEffect(() => {
    if (personagem.raca) {
      getCatalogoItem('racas', personagem.raca)
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

  // `personagem.classes` é um array novo a cada snapshot da ficha ao vivo; a
  // chave em texto só muda quando os ids mudam de verdade.
  const classesChave = (personagem.classes ?? []).join('|');

  useEffect(() => {
    const ids = classesChave ? classesChave.split('|') : [];
    Promise.all(ids.map(id => getCatalogoItem('classes', id)))
      .then(itens => setClassesNomes(itens.filter(Boolean).map(getNome)))
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar nomes das classes:', erro);
      });
  }, [classesChave]);

  return { racaNome, racaLinkImagem, classesNomes };
};
