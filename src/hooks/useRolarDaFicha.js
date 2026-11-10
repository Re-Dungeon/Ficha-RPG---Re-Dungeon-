import { useCallback, useMemo } from 'react';

import { useAuth } from 'context/AuthContext';
import { addChatMensagem } from 'service/storage';
import { campanhaDeRolagem } from 'common/utils/campanhaDeRolagem';
import { campanhaIdsDosPersonagens, montarMensagemRolagem } from 'common/utils/chat';
import { rolarEspecificacao } from 'common/utils/dados';
import { preparar } from 'common/utils/gridRolagem';
import { useRolagemFicha } from 'context/RolagemFichaContext';

// "Rolar" a partir da ficha (Artes e Variantes com dados) — SÓ no site dos
// jogadores. Posta a rolagem pública no chat da campanha, falando como o
// personagem da ficha (o mesmo autor do Calculador de Ataque), com o `rotulo`
// de onde veio ("Arte: Golpe Duplo").
//
// A campanha vem de `campanhaDeRolagem` (a aberta no chat da ficha → a única
// do personagem). Retorna `{ campanhaIds, campanhaId, precisaEscolher,
// semCampanha, rolar }`: `precisaEscolher` = 2+ campanhas e nenhuma aberta no
// chat (a tela pergunta e passa `campanhaId` no `rolar`); `semCampanha` = o
// personagem não está em nenhuma. `rolar({ expressao, rotulo, campanhaId })`
// devolve true se postou, `{ erro }` se a expressão não vale, false se não
// havia para onde postar ou a escrita falhou (`onErro` avisa).
const useRolarDaFicha = ({ onErro } = {}) => {
  const currentUser = useAuth()?.currentUser ?? null;
  const { personagem, campanhaPreferida } = useRolagemFicha();

  const campanhaIds = useMemo(
    () => campanhaIdsDosPersonagens(personagem ? [personagem] : []),
    [personagem],
  );
  const campanhaId = campanhaDeRolagem(personagem, campanhaPreferida);

  const rolar = useCallback(
    async ({ expressao, rotulo = null, campanhaId: escolhida = null }) => {
      const destino = campanhaId ?? (campanhaIds.includes(escolhida) ? escolhida : null);
      if (!destino || !personagem || !currentUser?.uid) return false;
      const preparada = preparar(expressao);
      if (preparada.erro) return { erro: preparada.erro };
      const autor = {
        uid: currentUser.uid,
        personagemId: personagem.id ?? null,
        autorNome: personagem.nome ?? 'Jogador',
        autorAvatar: personagem.linkImagem ?? null,
        isMestre: false,
      };
      try {
        await addChatMensagem(
          destino,
          montarMensagemRolagem(autor, rolarEspecificacao(preparada), false, rotulo),
        );
        return true;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Falha ao enviar a rolagem da ficha:', error);
        onErro?.('Não foi possível enviar a rolagem.');
        return false;
      }
    },
    [campanhaId, campanhaIds, personagem, currentUser, onErro],
  );

  return {
    campanhaIds,
    campanhaId,
    precisaEscolher: !campanhaId && campanhaIds.length >= 2,
    semCampanha: campanhaIds.length === 0,
    rolar,
  };
};

export default useRolarDaFicha;
