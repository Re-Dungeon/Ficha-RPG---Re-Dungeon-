import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { atualizarRecursoAtualPersonagem } from 'service/storage';
import { ajustarRecursoAtual, corDaBarra, fracaoDaBarra, recursosDaFicha } from 'common/utils/grid';
import { MOBILE } from 'common/styles/breakpoints';
import ErrorSnackbar from 'components/ErrorSnackbar/ErrorSnackbar';

import { calcularPpMaximo, normalizarEstadoCombate, prontidaoMaximaDaFicha } from './prontidao/config';

const RECURSOS = [
  { id: 'pv', rotulo: 'PV' },
  { id: 'energia', rotulo: 'Energia' },
  { id: 'fadiga', rotulo: 'Fadiga' },
];

const COR_PP = '#e8cb85';

const Faixa = styled.div`
  position: sticky;
  top: 0;
  z-index: 2;
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  padding: 10px 12px;
  background: rgba(10, 9, 19, 0.88);
  backdrop-filter: blur(6px);
  border: 1px solid var(--border-primary);
  border-radius: 12px;

  ${MOBILE} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    padding: 8px;
  }
`;

const Item = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Topo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  min-width: 0;
`;

const Rotulo = styled.span`
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const Valor = styled.span`
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

const Controles = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const Barra = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;

  > span {
    display: block;
    height: 100%;
    border-radius: inherit;
    transition: width 0.2s ease;
  }
`;

const Passo = styled.button`
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: var(--border-hover);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }

  ${MOBILE} {
    width: 32px;
    height: 32px;
  }
`;

// Faixa de PV/Energia/Fadiga/PP no topo da ficha, em todas as abas. −/+ gravam
// na hora (atualizarRecursoAtualPersonagem limita a 0..máximo e só mexe no
// `atual`); o valor volta pelo subscribePersonagem da Ficha. O PP é só
// leitura aqui — gasta-se pela Central de Ações.
const StatusFaixa = ({ personagem }) => {
  const recursos = useMemo(() => recursosDaFicha(personagem), [personagem]);
  const [otimista, setOtimista] = useState({});
  const [ocupados, setOcupados] = useState({});
  const [erro, setErro] = useState(null);

  const atualPv = recursos.pv?.atual;
  const atualEnergia = recursos.energia?.atual;
  const atualFadiga = recursos.fadiga?.atual;

  // Chegou um valor novo da ficha (a gravação voltou ou outra fonte mexeu):
  // o valor otimista deixa de valer.
  useEffect(() => {
    setOtimista(current => (Object.keys(current).length ? {} : current));
  }, [atualPv, atualEnergia, atualFadiga]);

  const ppMaximo = calcularPpMaximo(prontidaoMaximaDaFicha(personagem));
  const ppAtual = normalizarEstadoCombate(personagem, ppMaximo).ppAtual;

  const alterar = async (id, delta) => {
    const recurso = recursos[id];
    const exibido = otimista[id] ?? recurso.atual;
    const novo = ajustarRecursoAtual({ ...recurso, atual: exibido }, delta);
    if (novo === null || novo === exibido) return;

    setOtimista(current => ({ ...current, [id]: novo }));
    setOcupados(current => ({ ...current, [id]: true }));
    try {
      await atualizarRecursoAtualPersonagem(personagem.id, id, novo);
    } catch {
      setOtimista(current =>
        Object.fromEntries(Object.entries(current).filter(([chave]) => chave !== id)),
      );
      setErro('Não foi possível atualizar o valor. Tente novamente.');
    } finally {
      setOcupados(current => ({ ...current, [id]: false }));
    }
  };

  return (
    <Faixa aria-label="Recursos do personagem">
      {RECURSOS.map(({ id, rotulo }) => {
        const recurso = recursos[id];
        if (!recurso) return null;
        const atual = otimista[id] ?? recurso.atual;
        const fracao = fracaoDaBarra(id, { ...recurso, atual });
        return (
          <Item key={id} data-testid={`faixa-${id}`}>
            <Topo>
              <Rotulo>{rotulo}</Rotulo>
              <Valor>
                {atual}/{recurso.max}
              </Valor>
            </Topo>
            <Controles>
              <Passo
                type="button"
                aria-label={`Diminuir ${rotulo}`}
                disabled={ocupados[id] || atual <= 0}
                onClick={() => alterar(id, -1)}
              >
                −
              </Passo>
              <Barra aria-hidden="true">
                <span style={{ width: `${fracao * 100}%`, background: corDaBarra(id, fracao) }} />
              </Barra>
              <Passo
                type="button"
                aria-label={`Aumentar ${rotulo}`}
                disabled={ocupados[id] || atual >= recurso.max}
                onClick={() => alterar(id, 1)}
              >
                +
              </Passo>
            </Controles>
          </Item>
        );
      })}
      {ppMaximo > 0 && (
        <Item data-testid="faixa-pp">
          <Topo>
            <Rotulo>PP</Rotulo>
            <Valor>
              {ppAtual}/{ppMaximo}
            </Valor>
          </Topo>
          <Controles>
            <Barra aria-hidden="true">
              <span style={{ width: `${(ppAtual / ppMaximo) * 100}%`, background: COR_PP }} />
            </Barra>
          </Controles>
        </Item>
      )}
      <ErrorSnackbar open={Boolean(erro)} mensagem={erro ?? ''} onClose={() => setErro(null)} />
    </Faixa>
  );
};

StatusFaixa.propTypes = {
  personagem: PropTypes.object.isRequired,
};

export default StatusFaixa;
