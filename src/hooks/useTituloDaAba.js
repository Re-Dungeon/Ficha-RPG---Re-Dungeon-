import { useEffect, useState } from 'react';

import { contarNaoLidas, idDaUltimaMensagem } from 'common/utils/mesa';

const MENSAGENS_VAZIAS = [];

const lerOculta = () => typeof document !== 'undefined' && document.hidden;

// Título da aba do navegador durante a mesa: "(N) título" com mensagens não
// lidas e "⚔ Seu turno! — título" quando a vez chega com a aba em segundo
// plano (some ao voltar para a aba). Ao desmontar, restaura o título original.
//
// - `mensagens`: as do chat (só o último id importa); as que chegam enquanto a
//   aba está oculta contam como não lidas.
// - `naoLidas`: contagem da própria interface (ex.: Chat do celular com o
//   mapa aberto); vale o maior entre as duas.
// - `meuTurno`: true quando é a vez de um personagem meu.
const useTituloDaAba = ({ mensagens = MENSAGENS_VAZIAS, naoLidas = 0, meuTurno = false } = {}) => {
  const [tituloOriginal] = useState(() => document.title);
  const [oculta, setOculta] = useState(lerOculta);
  const [vistaId, setVistaId] = useState(undefined);
  const [meuTurnoAnterior, setMeuTurnoAnterior] = useState(meuTurno);
  const [alertaTurno, setAlertaTurno] = useState(false);

  useEffect(() => {
    const aoMudarVisibilidade = () => setOculta(lerOculta());
    document.addEventListener('visibilitychange', aoMudarVisibilidade);
    return () => document.removeEventListener('visibilitychange', aoMudarVisibilidade);
  }, []);

  // Aba à vista: tudo o que existe já foi visto e o aviso de turno cai.
  const ultimaId = idDaUltimaMensagem(mensagens);
  if (!oculta && vistaId !== ultimaId) setVistaId(ultimaId);
  if (meuTurno !== meuTurnoAnterior) {
    setMeuTurnoAnterior(meuTurno);
    setAlertaTurno(meuTurno && oculta);
  }
  if (alertaTurno && (!oculta || !meuTurno)) setAlertaTurno(false);

  const naoVistas = oculta ? contarNaoLidas(mensagens, vistaId) : 0;
  const total = Math.max(naoLidas, naoVistas);

  let titulo = tituloOriginal;
  if (alertaTurno) titulo = `⚔ Seu turno! — ${tituloOriginal}`;
  else if (total > 0) titulo = `(${total}) ${tituloOriginal}`;

  useEffect(() => {
    document.title = titulo;
  }, [titulo]);

  useEffect(
    () => () => {
      document.title = tituloOriginal;
    },
    [tituloOriginal],
  );

  return titulo;
};

export default useTituloDaAba;
