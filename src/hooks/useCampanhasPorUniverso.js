import { useEffect, useState } from 'react';

import { getRmCampanhasPorUniverso } from 'service/storage';

/**
 * Campanhas (`rmCampanhas`) são atreladas a um universo — carrega só as do
 * universo selecionado e limpa a lista quando nenhum universo está escolhido
 * ainda (evita mostrar campanhas de um universo diferente do personagem).
 */
export const useCampanhasPorUniverso = universoId => {
  const [campanhas, setCampanhas] = useState([]);

  useEffect(() => {
    if (!universoId) {
      setCampanhas([]);
      return undefined;
    }

    let isMounted = true;
    getRmCampanhasPorUniverso(universoId)
      .then(items => {
        if (isMounted) {
          setCampanhas(items);
        }
      })
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar campanhas:', erro);
      });

    return () => {
      isMounted = false;
    };
  }, [universoId]);

  return campanhas;
};
