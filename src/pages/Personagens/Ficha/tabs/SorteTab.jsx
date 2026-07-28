import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from '@mui/material/Button';

import { addHistoricoSorte, getHistoricoSorte } from 'service/storage';
import {
  calcularBonusPorSorte,
  calcularPrimariosTotais,
  calcularRolagemFortuna,
  podeRolarFortunaHoje,
} from 'common/utils/formulas';
import { useSaving } from 'context/SavingContext';

import {
  AtributoCardWrapper,
  CardTitle,
  SectionTitle,
  StatusValueRow,
} from '../styles';
import { keyframes } from 'styled-components';

const floatUp = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0); }
`;

const CardsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 8px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(AtributoCardWrapper)`
  background: linear-gradient(180deg, rgba(29,27,47,0.9), rgba(29,27,47,0.8));
  border: 1px solid rgba(232,203,133,0.06);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  transition: transform 220ms ease, box-shadow 220ms ease;
  &:hover { transform: translateY(-6px); box-shadow: 0 10px 30px rgba(16,14,28,0.5); }
`;

const StatIcon = styled.div`
  font-size: 1.2rem;
`;

const StatValue = styled.div`
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
`;

const CenterPanel = styled.div`
  position: relative;
  margin: 20px 0;
  padding: 28px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(29,27,47,0.45), rgba(20,16,33,0.35));
  border: 1px solid rgba(255,255,255,0.03);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const BackgroundSymbol = styled.div`
  position: absolute;
  font-size: 120px;
  opacity: 0.05;
  pointer-events: none;
  transform: translateY(-10px);
`;

const CenterText = styled.div`
  position: relative;
  z-index: 1;
  color: var(--text-secondary);
`;

const RollSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
`;

const RollButton = styled(Button)`
  && {
    padding: 14px 26px;
    font-weight: 800;
    font-size: 1.05rem;
    color: #fff;
    background: linear-gradient(90deg, rgba(108,99,255,0.95), rgba(91,124,250,0.95));
    border: 2px solid rgba(232,195,106,0.9);
    box-shadow: 0 8px 30px rgba(108,99,255,0.12), 0 2px 12px rgba(232,195,106,0.06);
    border-radius: 12px;
    transition: transform 160ms ease, box-shadow 200ms ease, filter 200ms ease;
    animation: ${floatUp} 3s ease-in-out infinite;
  }
  &&:hover { transform: translateY(-4px) scale(1.02); filter: brightness(1.03); }
  &&.Mui-disabled { background: linear-gradient(90deg, #3a3a4a, #2d2b3b); border-color: rgba(255,255,255,0.02); animation: none; box-shadow: none; }
`;

const HistoryGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const EmptyIllustration = styled.div`
  text-align: center;
  color: var(--text-secondary);
  padding: 18px;
`;

const SortePanel = styled.div`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 22px;
  padding: 22px;
`;

const HistoryCard = styled(AtributoCardWrapper)`
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
  padding: 14px 16px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
`;

const HistoryText = styled(StatusValueRow)`
  color: var(--text-secondary);
  font-size: 0.88rem;
  line-height: 1.5;
`;

const HistoryTimestamp = styled(StatusValueRow)`
  color: var(--color-accent);
  font-size: 0.82rem;
  white-space: nowrap;
`;

const formatarData = timestamp => {
  const data = timestamp?.toDate ? timestamp.toDate() : null;
  return data ? data.toLocaleString('pt-BR') : '';
};

const SorteTab = ({ personagem, onSave }) => {
  const [historico, setHistorico] = useState([]);
  const [ultimoResultado, setUltimoResultado] = useState(null);
  const { executar } = useSaving();

  useEffect(() => {
    let isMounted = true;
    getHistoricoSorte(personagem.id)
      .then(itens => {
        if (isMounted) {
          setHistorico(itens);
        }
      })
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar histórico de sorte:', erro);
      });
    return () => {
      isMounted = false;
    };
  }, [personagem.id]);

  const primariosTotais = calcularPrimariosTotais(
    personagem.atributosBase,
    personagem.atributosExtra,
    personagem.atributosBonus,
  );
  const sorteTotal = primariosTotais.sorte;
  const bonusBase = calcularBonusPorSorte(sorteTotal);
  const fortunaAtual = personagem.sorte?.fortunaAtual ?? 0;
  const ultimaRolagemData = personagem.sorte?.ultimaRolagemData ?? '';
  const podeRolar = podeRolarFortunaHoje(ultimaRolagemData);

  const handleRolar = useCallback(async () => {
    const resultado = calcularRolagemFortuna(sorteTotal);
    const hoje = new Date().toISOString().slice(0, 10);
    const evento = {
      tipo: 'rolagem_fortuna',
      descricao: `${resultado.quantidadeDados}d6 (${resultado.rolagens.join(' + ')}) + bônus ${resultado.bonusBase}`,
      valor: resultado.resultado,
    };

    await executar(async () => {
      await onSave({
        sorte: { fortunaAtual: fortunaAtual + resultado.resultado, ultimaRolagemData: hoje },
      });
      await addHistoricoSorte(personagem.id, evento);
    });

    setHistorico(current => [{ id: `local-${Date.now()}`, ...evento }, ...current].slice(0, 10));
    setUltimoResultado(resultado.resultado);
  }, [fortunaAtual, onSave, personagem.id, sorteTotal, executar]);

  return (
    <div>
      <SectionTitle>Sorte e Fortuna</SectionTitle>

      <CardsRow>
        <StatCard>
          <StatIcon>🍀</StatIcon>
          <CardTitle>Sorte Total</CardTitle>
          <StatValue>{sorteTotal}</StatValue>
          <StatusValueRow style={{ color: 'var(--text-secondary)' }}>Sua sorte acumulada.</StatusValueRow>
        </StatCard>

        <StatCard>
          <StatIcon>⭐</StatIcon>
          <CardTitle>Bônus Base</CardTitle>
          <StatValue style={{ color: 'var(--color-accent, #6C63FF)' }}>{bonusBase}</StatValue>
          <StatusValueRow style={{ color: 'var(--text-secondary)' }}>Bônus permanente de sorte.</StatusValueRow>
        </StatCard>

        <StatCard>
          <StatIcon>💰</StatIcon>
          <CardTitle>Fortuna Atual</CardTitle>
          <StatValue style={{ color: 'var(--color-success, #4CD964)' }}>{fortunaAtual} Ȼ</StatValue>
          <StatusValueRow style={{ color: 'var(--text-secondary)' }}>Moeda obtida através da sorte.</StatusValueRow>
        </StatCard>
      </CardsRow>

      <CenterPanel>
        <BackgroundSymbol>🍀</BackgroundSymbol>
        <CenterText>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>A Fortuna sorri apenas aos mais persistentes.</div>
          <div style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
            Você pode rolar a fortuna uma vez por dia para receber moedas, bônus ou recompensas especiais.
          </div>
        </CenterText>
      </CenterPanel>

      <SortePanel>
        <RollSection>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '1.02rem' }}>🎲 Rolar Fortuna</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>Role um dado encantado e receba sua recompensa diária.</div>
          </div>

          <RollButton variant="contained" disabled={!podeRolar} onClick={handleRolar}>
            🎲 Rolar Fortuna
          </RollButton>

          <StatusValueRow>
            {podeRolar ? 'Disponível hoje.' : 'Você já rolou hoje — libera à meia-noite.'}
          </StatusValueRow>

          {ultimoResultado !== null && (
            <StatusValueRow style={{ display: 'block', color: 'var(--color-accent)' }}>
              Última rolagem: +{ultimoResultado} Fortuna
            </StatusValueRow>
          )}
        </RollSection>
      </SortePanel>

      <SectionTitle style={{ marginTop: 28 }}>Histórico</SectionTitle>
      <HistoryGrid>
        {historico.length === 0 && (
          <EmptyIllustration>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✨</div>
            Nenhuma fortuna registrada ainda.
          </EmptyIllustration>
        )}

        {historico.map(evento => (
          <HistoryCard key={evento.id}>
            <HistoryText>
              {evento.tipo === 'rolagem_fortuna' ? '🎲 ' : '🍀 '}
              {evento.descricao}
            </HistoryText>
            <HistoryTimestamp>
              {evento.timestamp ? formatarData(evento.timestamp) : 'agora'} · +{evento.valor}
            </HistoryTimestamp>
          </HistoryCard>
        ))}
      </HistoryGrid>
    </div>
  );
};

SorteTab.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default SorteTab;
