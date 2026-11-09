import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import PlayerAudioMesa from 'components/Chat/PlayerAudioMesa';
import useAudioMesa from 'hooks/useAudioMesa';

const AudioMesaContext = createContext({
  audio: null,
  registrarAudio: () => {},
});

const normalizarAudio = atual => {
  if (!atual || typeof atual !== 'object') return null;
  return {
    videoId: atual.videoId ?? null,
    estado: atual.estado ?? null,
    posicaoBase: Number.isFinite(Number(atual.posicaoBase)) ? Number(atual.posicaoBase) : 0,
    referenciaEm: Number.isFinite(Number(atual.referenciaEm)) ? Number(atual.referenciaEm) : 0,
    repetir: Boolean(atual.repetir),
  };
};

const normalizarPlayer = player => {
  if (!player || typeof player !== 'object') return { volume: null, mudo: null };
  return {
    volume: Number.isFinite(Number(player.volume)) ? Number(player.volume) : null,
    mudo: Boolean(player.mudo),
  };
};

const audioIgual = (audioA, audioB) => {
  const atualA = normalizarAudio(audioA?.atual ?? audioA?.player?.atual ?? null);
  const atualB = normalizarAudio(audioB?.atual ?? audioB?.player?.atual ?? null);
  const playerA = normalizarPlayer(audioA?.player ?? audioA ?? null);
  const playerB = normalizarPlayer(audioB?.player ?? audioB ?? null);

  if (!atualA && !atualB) {
    return playerA.volume === playerB.volume && playerA.mudo === playerB.mudo;
  }
  if (!atualA || !atualB) return false;

  const mesmaFaixa = Object.keys(atualA).every(chave => atualA[chave] === atualB[chave]);
  const mesmoPlayer = playerA.volume === playerB.volume && playerA.mudo === playerB.mudo;

  return mesmaFaixa && mesmoPlayer;
};

export const AudioMesaProvider = ({ children }) => {
  const [audio, setAudio] = useState(null);
  const audioRef = useRef(null);

  const registrarAudio = useCallback(proximoAudio => {
    if (!proximoAudio) return;
    const atualGlobal = audioRef.current?.atual ?? audioRef.current?.player?.atual ?? null;
    const atualNovo = proximoAudio?.atual ?? proximoAudio?.player?.atual ?? null;

    // Quando o chat fecha ou a campanha ainda está carregando, os hooks podem
    // emitir um objeto "vazio" com `atual: null`. Esse placeholder não deve
    // sobrescrever a instância real que já está tocando. O player global só
    // troca quando a nova música/estado efetivamente é válido.
    if (!atualNovo && atualGlobal) return;
    if (audioRef.current && audioIgual(audioRef.current, proximoAudio)) return;
    if (audioRef.current === proximoAudio) return;

    audioRef.current = proximoAudio;
    setAudio(proximoAudio);
  }, []);

  const value = useMemo(
    () => ({ audio, registrarAudio }),
    [audio, registrarAudio],
  );

  return (
    <AudioMesaContext.Provider value={value}>
      {children}
      {audio?.player && <PlayerAudioMesa {...audio.player} />}
    </AudioMesaContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAudioMesaGlobal = () => useContext(AudioMesaContext);

// Música da mesa vista pelo chat (hooks/useChatCampanha.js, cópia
// compartilhada com o Re:Master). Cada app liga o áudio do seu jeito — aqui
// o chat ouve a campanha e registra a faixa no player global (que segue
// tocando ao trocar de página); no Re:Master vem do provider da campanha
// ativa. A assinatura é a mesma nos dois arquivos.
// eslint-disable-next-line react-refresh/only-export-components
export const useAudioDoChat = (campanhaId, { podeOuvir, podeControlar }) => {
  const audio = useAudioMesa(campanhaId, { ativo: podeOuvir, podeControlar });
  const { registrarAudio } = useAudioMesaGlobal();

  useEffect(() => {
    if (!campanhaId || !podeOuvir || !audio) return;
    const atual = audio?.atual ?? audio?.player?.atual ?? null;
    if (!atual && !audio.tocando && !audio.pausado) return;
    registrarAudio(audio);
  }, [audio, campanhaId, podeOuvir, registrarAudio]);

  return audio;
};

export default AudioMesaContext;
