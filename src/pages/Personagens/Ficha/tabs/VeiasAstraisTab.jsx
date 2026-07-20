import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { getDivindades, getVeiasAstraisPorUniverso } from 'service/storage';
import {
  calcularCustoDesbloqueio,
  calcularPcDisponivel,
  calcularPowerCombat,
  calcularPrimariosTotais,
  calcularSecundarios,
} from 'common/utils/formulas';

import ConstelacaoCard from '../veiasAstrais/ConstelacaoCard';
import DesbloquearNoDialog from '../veiasAstrais/DesbloquearNoDialog';
import { AtributoCardWrapper, CardTitle, CardTotal, SectionTitle, StatusValueRow } from '../styles';

const VeiasAstraisTab = ({ personagem, onSave }) => {
  const [constelacoes, setConstelacoes] = useState([]);
  const [divindades, setDivindades] = useState([]);
  const [selecao, setSelecao] = useState(null);

  useEffect(() => {
    getDivindades().then(setDivindades);
  }, []);

  useEffect(() => {
    if (!personagem.universo) {
      setConstelacoes([]);
      return undefined;
    }
    let isMounted = true;
    getVeiasAstraisPorUniverso(personagem.universo).then(itens => {
      if (isMounted) {
        setConstelacoes(itens);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [personagem.universo]);

  const primariosTotais = calcularPrimariosTotais(
    personagem.atributosBase,
    personagem.atributosExtra,
    personagem.atributosBonus,
  );
  const secundariosTotais = calcularSecundarios(
    primariosTotais,
    personagem.secundariosBase,
    personagem.secundariosExtra,
    personagem.secundariosBonus,
  );
  const powerCombat = calcularPowerCombat(primariosTotais, secundariosTotais);

  const pcGasto = personagem.veiasAstrais?.powerCombatGasto ?? 0;
  const pcDisponivel = calcularPcDisponivel(powerCombat, pcGasto);
  const idsDesbloqueados = useMemo(
    () => personagem.veiasAstrais?.nosDesbloqueados ?? [],
    [personagem.veiasAstrais?.nosDesbloqueados],
  );

  const selecaoInfo = selecao
    ? calcularCustoDesbloqueio(selecao.constelacao.nos ?? [], selecao.no.id, idsDesbloqueados)
    : null;

  const handleConfirmar = useCallback(async () => {
    if (!selecaoInfo || selecaoInfo.cadeia.length === 0) {
      return;
    }

    const novoAtributosBonus = { ...personagem.atributosBonus };
    selecaoInfo.cadeia.forEach(no => {
      const atributo = no.bonusAtributo?.atributo;
      if (atributo) {
        novoAtributosBonus[atributo] = (novoAtributosBonus[atributo] ?? 0) + (no.bonusAtributo.valor ?? 0);
      }
    });

    await onSave({
      veiasAstrais: {
        powerCombatGasto: pcGasto + selecaoInfo.custoTotal,
        nosDesbloqueados: [...idsDesbloqueados, ...selecaoInfo.cadeia.map(no => no.id)],
      },
      atributosBonus: novoAtributosBonus,
    });
    setSelecao(null);
  }, [selecaoInfo, personagem.atributosBonus, pcGasto, idsDesbloqueados, onSave]);

  const nomeDivindade = divindadeId => divindades.find(item => item.id === divindadeId)?.Nome;

  return (
    <div>
      <SectionTitle>Veias Astrais</SectionTitle>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
        <AtributoCardWrapper style={{ minWidth: 160 }}>
          <CardTitle>Power Combat</CardTitle>
          <CardTotal>{powerCombat}</CardTotal>
        </AtributoCardWrapper>
        <AtributoCardWrapper style={{ minWidth: 160 }}>
          <CardTitle>PC Gasto</CardTitle>
          <CardTotal>{pcGasto}</CardTotal>
        </AtributoCardWrapper>
        <AtributoCardWrapper style={{ minWidth: 160 }}>
          <CardTitle>PC Disponível</CardTitle>
          <CardTotal>{pcDisponivel}</CardTotal>
        </AtributoCardWrapper>
      </div>

      {!personagem.universo && (
        <StatusValueRow style={{ display: 'block', marginTop: 16 }}>
          Selecione um Universo na aba Progressão primeiro.
        </StatusValueRow>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
        {constelacoes.map(constelacao => (
          <ConstelacaoCard
            key={constelacao.id}
            constelacao={constelacao}
            divindadeNome={nomeDivindade(constelacao.divindadeId)}
            idsDesbloqueados={idsDesbloqueados}
            onSelecionarNo={(cons, no) => setSelecao({ constelacao: cons, no })}
          />
        ))}
        {personagem.universo && constelacoes.length === 0 && (
          <StatusValueRow>Nenhuma constelação cadastrada para este universo.</StatusValueRow>
        )}
      </div>

      <DesbloquearNoDialog
        open={Boolean(selecao)}
        no={selecao?.no}
        cadeia={selecaoInfo?.cadeia ?? []}
        custoTotal={selecaoInfo?.custoTotal ?? 0}
        pcDisponivel={pcDisponivel}
        onClose={() => setSelecao(null)}
        onConfirmar={handleConfirmar}
      />
    </div>
  );
};

VeiasAstraisTab.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default VeiasAstraisTab;
