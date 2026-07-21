import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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
  CardTotal,
  SectionTitle,
  StatusValueRow,
} from '../styles';

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
    getHistoricoSorte(personagem.id).then(itens => {
      if (isMounted) {
        setHistorico(itens);
      }
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

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
        <AtributoCardWrapper style={{ minWidth: 160 }}>
          <CardTitle>Sorte Total</CardTitle>
          <CardTotal>{sorteTotal}</CardTotal>
        </AtributoCardWrapper>
        <AtributoCardWrapper style={{ minWidth: 160 }}>
          <CardTitle>Bônus Base</CardTitle>
          <CardTotal>{bonusBase}</CardTotal>
        </AtributoCardWrapper>
        <AtributoCardWrapper style={{ minWidth: 160 }}>
          <CardTitle>Fortuna Atual (Ȼ)</CardTitle>
          <CardTotal>{fortunaAtual}</CardTotal>
        </AtributoCardWrapper>
      </div>

      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button variant="contained" disabled={!podeRolar} onClick={handleRolar}>
          🎲 Rolar Fortuna
        </Button>
        <StatusValueRow>
          {podeRolar
            ? 'Disponível hoje.'
            : 'Você já rolou hoje — libera à meia-noite.'}
        </StatusValueRow>
      </div>

      {ultimoResultado !== null && (
        <StatusValueRow style={{ display: 'block', marginTop: 8, color: 'var(--color-accent)' }}>
          Última rolagem: +{ultimoResultado} Fortuna
        </StatusValueRow>
      )}

      <SectionTitle style={{ marginTop: 32 }}>Histórico</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {historico.length === 0 && <StatusValueRow>Nenhuma ação registrada ainda.</StatusValueRow>}
        {historico.map(evento => (
          <AtributoCardWrapper key={evento.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
            <StatusValueRow>{evento.descricao}</StatusValueRow>
            <StatusValueRow style={{ color: 'var(--color-accent)' }}>
              {evento.timestamp ? formatarData(evento.timestamp) : 'agora'} · +{evento.valor}
            </StatusValueRow>
          </AtributoCardWrapper>
        ))}
      </div>
    </div>
  );
};

SorteTab.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default SorteTab;
