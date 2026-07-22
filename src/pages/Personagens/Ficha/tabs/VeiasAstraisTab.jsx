import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LockIcon from '@mui/icons-material/Lock';

import { getDivindades, getVeiasAstraisPorUniverso } from 'service/storage';
import {
  calcularPcDisponivel,
  calcularPowerCombat,
  calcularPrimariosTotais,
  calcularSecundarios,
} from 'common/utils/formulas';
import { useSaving } from 'context/SavingContext';

import ConstelacaoArvoreModal from '../veiasAstrais/ConstelacaoArvoreModal';
import { agruparVeiasPorDivindade, normalizarVeia } from '../veiasAstrais/constants';
import DivindadeCard from '../veiasAstrais/DivindadeCard';
import NucleoCentralModal from '../veiasAstrais/NucleoCentralModal';
import ResetarVeiasDialog from '../veiasAstrais/ResetarVeiasDialog';
import { DivindadeGrid } from '../veiasAstrais/styles';
import { AtributoCardWrapper, CardTitle, CardTotal, SectionTitle, StatusValueRow } from '../styles';

const VeiasAstraisTab = ({ personagem, onSave }) => {
  const [veias, setVeias] = useState([]);
  const [divindades, setDivindades] = useState([]);
  const [divindadeAbertaId, setDivindadeAbertaId] = useState(null);
  const [nucleoAberto, setNucleoAberto] = useState(false);
  const [resetarAberto, setResetarAberto] = useState(false);
  const { executar } = useSaving();

  useEffect(() => {
    getDivindades()
      .then(setDivindades)
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar divindades:', erro);
      });
  }, []);

  useEffect(() => {
    if (!personagem.universo) {
      setVeias([]);
      return undefined;
    }
    let isMounted = true;
    getVeiasAstraisPorUniverso(personagem.universo)
      .then(itens => {
        if (isMounted) {
          setVeias(itens.map(normalizarVeia));
        }
      })
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar veias astrais:', erro);
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

  const grupos = useMemo(() => agruparVeiasPorDivindade(veias, divindades), [veias, divindades]);
  const grupoAberto = grupos.find(item => item.divindadeId === divindadeAbertaId) ?? null;

  const handleDesbloquear = useCallback(
    async (cadeia, custoTotal) => {
      await executar(() =>
        onSave({
          veiasAstrais: {
            powerCombatGasto: pcGasto + custoTotal,
            nosDesbloqueados: [...idsDesbloqueados, ...cadeia.map(no => no.id)],
          },
        }),
      );
    },
    [pcGasto, idsDesbloqueados, onSave, executar],
  );

  // Bloquear um nó devolve o PC dele — e de qualquer descendente que dependia
  // dele e também foi bloqueado em cascata (ver calcularCadeiaBloqueio).
  const handleBloquear = useCallback(
    async (idsParaBloquear, custoRecuperado) => {
      await executar(() =>
        onSave({
          veiasAstrais: {
            powerCombatGasto: Math.max(0, pcGasto - custoRecuperado),
            nosDesbloqueados: idsDesbloqueados.filter(id => !idsParaBloquear.includes(id)),
          },
        }),
      );
    },
    [pcGasto, idsDesbloqueados, onSave, executar],
  );

  const handleResetarTudo = useCallback(async () => {
    await executar(() =>
      onSave({
        veiasAstrais: { powerCombatGasto: 0, nosDesbloqueados: [] },
      }),
    );
    setResetarAberto(false);
  }, [onSave, executar]);

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

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
        <Button variant="outlined" startIcon={<AutoAwesomeIcon />} onClick={() => setNucleoAberto(true)}>
          Núcleo Central
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LockIcon />}
          disabled={idsDesbloqueados.length === 0}
          onClick={() => setResetarAberto(true)}
        >
          Bloquear Todas as Veias
        </Button>
      </div>

      {!personagem.universo && (
        <StatusValueRow style={{ display: 'block', marginTop: 16 }}>
          Selecione um Universo no menu lateral Info primeiro.
        </StatusValueRow>
      )}

      <DivindadeGrid>
        {grupos.map(grupo => (
          <DivindadeCard
            key={grupo.divindadeId}
            divindade={grupo.divindade}
            veias={grupo.veias}
            totalDesbloqueados={grupo.veias.filter(no => idsDesbloqueados.includes(no.id)).length}
            onClick={() => setDivindadeAbertaId(grupo.divindadeId)}
          />
        ))}
      </DivindadeGrid>
      {personagem.universo && grupos.length === 0 && (
        <StatusValueRow style={{ display: 'block', marginTop: 16 }}>
          Nenhuma veia astral cadastrada para este universo.
        </StatusValueRow>
      )}

      <ConstelacaoArvoreModal
        open={Boolean(grupoAberto)}
        veias={grupoAberto?.veias ?? []}
        divindade={grupoAberto?.divindade ?? null}
        idsDesbloqueados={idsDesbloqueados}
        pcDisponivel={pcDisponivel}
        onClose={() => setDivindadeAbertaId(null)}
        onDesbloquear={handleDesbloquear}
        onBloquear={handleBloquear}
      />

      <NucleoCentralModal
        open={nucleoAberto}
        grupos={grupos}
        idsDesbloqueados={idsDesbloqueados}
        onClose={() => setNucleoAberto(false)}
      />

      <ResetarVeiasDialog
        open={resetarAberto}
        totalDesbloqueadas={idsDesbloqueados.length}
        pcParaRecuperar={pcGasto}
        onClose={() => setResetarAberto(false)}
        onConfirmar={handleResetarTudo}
      />
    </div>
  );
};

VeiasAstraisTab.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default VeiasAstraisTab;
