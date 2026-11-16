import { useEffect, useMemo, useRef, useState } from 'react';

import { getArts, getCombosAtaque, getCombosDefesa } from 'service/storage';
import { converterPotencialEmDados } from 'common/utils/ataque';
import {
  extrairExpressaoDeDados,
  preparar,
  rotuloDeRolagem,
} from 'common/utils/gridRolagem';

// Opções do "Rolar…" de um token que é ficha minha (SÓ no site dos jogadores —
// o Re:Master não tem esta cópia): combos de ataque e de defesa salvos na ficha
// e Artes com dados. Lê as subcoleções do personagem (getCombosAtaque,
// getCombosDefesa, getArts) uma vez por personagem enquanto o hook está
// montado (reabrir o diálogo não relê); falha → sem grupos. Retorna
// `{ carregando, grupos: [{ id: 'ataque'|'defesa'|'arte', titulo, itens }] }`,
// itens = { id, rotulo (nome), rotuloChat ("Ataque: nome"), expressao,
// desabilitado, motivo }. Combo cuja fórmula não tem dado (ex.: só "12") ou
// passa do limite de dados vem desabilitado com o motivo; Art sem expressão
// válida é omitida.
const SEM_GRUPOS = [];

// Fórmula do combo: `perfilDano` salvo ("2d8+5"); combos antigos sem ele
// recalculam pelo potencial. null se não há fórmula.
export const expressaoDoCombo = (combo, contexto = 'ataque') => {
  const salva = String(combo?.perfilDano ?? '').trim();
  if (salva) return salva;
  if (combo?.potencialFinal === undefined || combo?.potencialFinal === null) return null;
  try {
    const calculo = converterPotencialEmDados(
      Number(combo.potencialFinal) || 0,
      combo.tipoDano,
      undefined,
      contexto,
    );
    return calculo?.rolling ? String(calculo.rolling).trim() : null;
  } catch {
    return null;
  }
};

const itemDoCombo = (combo, tipo) => {
  const nome = String(combo?.nome ?? '').trim() || 'Combo';
  const expressao = expressaoDoCombo(combo, tipo);
  const base = {
    id: combo.id,
    rotulo: nome,
    rotuloChat: rotuloDeRolagem(tipo, nome),
    expressao: expressao ?? '',
  };
  if (!expressao) return { ...base, desabilitado: true, motivo: 'Sem fórmula de dano.' };
  const preparada = preparar(expressao);
  if (preparada.erro) return { ...base, desabilitado: true, motivo: preparada.erro };
  return { ...base, desabilitado: false, motivo: null };
};

const itemDaArte = art => {
  const expressao = extrairExpressaoDeDados(art?.dados);
  if (!expressao || preparar(expressao).erro) return null;
  const nome = String(art?.nome ?? '').trim() || 'Arte';
  return {
    id: art.id,
    rotulo: nome,
    rotuloChat: rotuloDeRolagem('arte', nome),
    expressao,
    desabilitado: false,
    motivo: null,
  };
};

const montarGrupos = ({ ataques, defesas, arts }) =>
  [
    { id: 'ataque', titulo: 'Ataque', itens: ataques.map(c => itemDoCombo(c, 'ataque')) },
    { id: 'defesa', titulo: 'Defesa', itens: defesas.map(c => itemDoCombo(c, 'defesa')) },
    { id: 'arte', titulo: 'Artes', itens: arts.map(itemDaArte).filter(Boolean) },
  ].filter(grupo => grupo.itens.length);

const SEM_RESULTADOS = {};

const useOpcoesDeRolagem = (personagemId, { ativo = false } = {}) => {
  const chave = ativo && personagemId ? personagemId : null;
  // Grupos já lidos, por personagem. A leitura (3 subcoleções) acontece uma vez
  // por personagem enquanto este hook está montado: fechar e reabrir o "Rolar…"
  // (a chave volta a null e depois ao mesmo id) reaproveita o resultado.
  // Sem setState síncrono no efeito: `carregando` é derivado.
  const [resultados, setResultados] = useState(SEM_RESULTADOS);
  const buscadosRef = useRef(new Set());
  const montadoRef = useRef(false);

  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!chave || buscadosRef.current.has(chave)) return;
    buscadosRef.current.add(chave);
    const ler = leitura => leitura(chave).catch(() => []);
    Promise.all([ler(getCombosAtaque), ler(getCombosDefesa), ler(getArts)]).then(
      ([ataques, defesas, arts]) => {
        if (!montadoRef.current) return;
        const grupos = montarGrupos({ ataques, defesas, arts });
        setResultados(atual => ({ ...atual, [chave]: grupos }));
      },
    );
  }, [chave]);

  return useMemo(() => {
    if (!chave) return { carregando: false, grupos: SEM_GRUPOS };
    if (!(chave in resultados)) return { carregando: true, grupos: SEM_GRUPOS };
    return { carregando: false, grupos: resultados[chave] };
  }, [chave, resultados]);
};

export default useOpcoesDeRolagem;
