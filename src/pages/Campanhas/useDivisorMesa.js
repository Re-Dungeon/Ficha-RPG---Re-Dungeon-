import { useEffect, useRef, useState } from 'react';

import {
  LIMITES_DIVISOR,
  gravarTamanho,
  lerTamanhoSalvo,
  limitarTamanhoChat,
} from './limitesDivisor';

// Tamanho padrão do chat quando ainda não dá para medir (jsdom, 1º render).
const PADRAO_SEM_MEDIDA = { horizontal: 420, vertical: 0.45 };

const medir = el => (el ? { horizontal: el.clientWidth, vertical: el.clientHeight } : null);

// Estado da divisão arrastável da mesa: o tamanho escolhido do painel do chat
// por orientação (null = o padrão do CSS), medido contra o corpo da mesa e
// guardado no localStorage ao fim de cada ajuste. `ativo` false (celular)
// desliga o estilo inline — lá vale o layout de abas Mapa | Chat.
const useDivisorMesa = ({ orientacao, ativo }) => {
  const [salvos, setSalvos] = useState(() => ({
    horizontal: lerTamanhoSalvo(LIMITES_DIVISOR.horizontal.chave),
    vertical: lerTamanhoSalvo(LIMITES_DIVISOR.vertical.chave),
  }));
  const [corpoEl, setCorpoEl] = useState(null);
  const [painelEl, setPainelEl] = useState(null);
  const [medidas, setMedidas] = useState({ corpo: null, painel: null });
  const ultimoRef = useRef(null);

  useEffect(() => {
    const atualizar = () => setMedidas({ corpo: medir(corpoEl), painel: medir(painelEl) });
    atualizar();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observador = new ResizeObserver(atualizar);
    [corpoEl, painelEl].forEach(el => el && observador.observe(el));
    return () => observador.disconnect();
  }, [corpoEl, painelEl]);

  const horizontal = orientacao === 'horizontal';
  const total =
    medidas.corpo?.[orientacao] || (horizontal ? window.innerWidth : window.innerHeight);
  const salvo = salvos[orientacao];
  const atual =
    salvo ??
    (medidas.painel?.[orientacao] ||
      (horizontal ? PADRAO_SEM_MEDIDA.horizontal : total * PADRAO_SEM_MEDIDA.vertical));
  const { min, max, valor } = limitarTamanhoChat(atual, total, orientacao);
  const { chave } = LIMITES_DIVISOR[orientacao];

  const onMudar = novo => {
    const limitado = limitarTamanhoChat(novo, total, orientacao).valor;
    ultimoRef.current = limitado;
    setSalvos(anteriores => ({ ...anteriores, [orientacao]: limitado }));
  };

  const onSoltar = () => {
    if (ultimoRef.current !== null) gravarTamanho(chave, ultimoRef.current);
    ultimoRef.current = null;
  };

  const onResetar = () => {
    ultimoRef.current = null;
    setSalvos(anteriores => ({ ...anteriores, [orientacao]: null }));
    gravarTamanho(chave, null);
  };

  const estiloPainel =
    ativo && salvo !== null ? { [horizontal ? 'width' : 'height']: valor } : undefined;

  return {
    refCorpo: setCorpoEl,
    refPainel: setPainelEl,
    estiloPainel,
    divisor: { orientacao, valor, min, max, onMudar, onSoltar, onResetar },
  };
};

export default useDivisorMesa;
