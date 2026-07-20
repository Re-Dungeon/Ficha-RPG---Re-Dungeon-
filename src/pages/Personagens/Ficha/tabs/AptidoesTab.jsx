import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

import {
  getAptidoesAdquiridas,
  getAptidoesPorUniverso,
  removeAptidaoAdquirida,
  setAptidaoAdquirida,
} from 'service/storage';
import {
  calcularMaximoAptidoes,
  calcularPrimariosTotais,
  calcularProximoAptidaoEm,
} from 'common/utils/formulas';
import { getNome } from 'common/utils/resolveNome';

import AjusteGanhasDialog from '../aptidoes/AjusteGanhasDialog';
import GerenciarAptidoesDialog from '../aptidoes/GerenciarAptidoesDialog';
import AptidaoRow from '../aptidoes/AptidaoRow';
import { AtributoCardWrapper, CardTitle, CardTotal, SectionTitle, StatusValueRow } from '../styles';

const AptidoesTab = ({ personagem, onSave }) => {
  const [catalogo, setCatalogo] = useState([]);
  const [adquiridas, setAdquiridas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [dialogGanhar, setDialogGanhar] = useState(false);
  const [dialogRemover, setDialogRemover] = useState(false);
  const [dialogGerenciar, setDialogGerenciar] = useState(false);

  const primariosTotais = useMemo(
    () =>
      calcularPrimariosTotais(
        personagem.atributosBase,
        personagem.atributosExtra,
        personagem.atributosBonus,
      ),
    [personagem.atributosBase, personagem.atributosExtra, personagem.atributosBonus],
  );

  const ganhas = personagem.aptidoesGanhas ?? 0;
  const maximo = calcularMaximoAptidoes(primariosTotais, ganhas);
  const proximoEm = calcularProximoAptidaoEm(primariosTotais);

  const carregarAdquiridas = useCallback(async () => {
    const itens = await getAptidoesAdquiridas(personagem.id);
    setAdquiridas(itens);
  }, [personagem.id]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      personagem.universo ? getAptidoesPorUniverso(personagem.universo) : Promise.resolve([]),
      getAptidoesAdquiridas(personagem.id),
    ]).then(([catalogoItens, adquiridasItens]) => {
      if (isMounted) {
        setCatalogo(catalogoItens);
        setAdquiridas(adquiridasItens);
        setCarregando(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [personagem.id, personagem.universo]);

  const handleAjustarGanhas = useCallback(
    async delta => {
      await onSave({ aptidoesGanhas: Math.max(0, ganhas + delta) });
    },
    [ganhas, onSave],
  );

  const handleAdquirir = useCallback(
    async aptidaoIds => {
      await Promise.all(aptidaoIds.map(id => setAptidaoAdquirida(personagem.id, id, 1)));
      await carregarAdquiridas();
    },
    [personagem.id, carregarAdquiridas],
  );

  const handleUpgrade = useCallback(
    async (aptidaoId, nivelAtual, nivelMaximo) => {
      if (nivelAtual >= nivelMaximo) {
        return;
      }
      await setAptidaoAdquirida(personagem.id, aptidaoId, nivelAtual + 1);
      await carregarAdquiridas();
    },
    [personagem.id, carregarAdquiridas],
  );

  const handleReset = useCallback(
    async aptidaoId => {
      await setAptidaoAdquirida(personagem.id, aptidaoId, 0);
      await carregarAdquiridas();
    },
    [personagem.id, carregarAdquiridas],
  );

  const handleRemover = useCallback(
    async aptidaoId => {
      await removeAptidaoAdquirida(personagem.id, aptidaoId);
      await carregarAdquiridas();
    },
    [personagem.id, carregarAdquiridas],
  );

  const atual = adquiridas.length;
  const idsAdquiridos = adquiridas.map(item => item.id);
  const disponiveisParaEscolher = Math.max(0, maximo - atual);

  return (
    <div>
      <SectionTitle>Aptidões</SectionTitle>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
        <AtributoCardWrapper style={{ minWidth: 140 }}>
          <CardTitle>Atual</CardTitle>
          <CardTotal>{atual}</CardTotal>
        </AtributoCardWrapper>
        <AtributoCardWrapper style={{ minWidth: 140 }}>
          <CardTitle>Ganhas</CardTitle>
          <CardTotal>{ganhas}</CardTotal>
        </AtributoCardWrapper>
        <AtributoCardWrapper style={{ minWidth: 140 }}>
          <CardTitle>Máximo</CardTitle>
          <CardTotal>{maximo}</CardTotal>
        </AtributoCardWrapper>
        <AtributoCardWrapper style={{ minWidth: 140 }}>
          <CardTitle>Atributo p/+1</CardTitle>
          <CardTotal>{proximoEm}</CardTotal>
        </AtributoCardWrapper>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={() => setDialogGanhar(true)}>
          ➕ Ganhar Aptidão
        </Button>
        <Button
          variant="contained"
          disabled={!personagem.universo || disponiveisParaEscolher === 0}
          onClick={() => setDialogGerenciar(true)}
        >
          Gerenciar Aptidões
        </Button>
        <Button variant="outlined" color="error" disabled={ganhas === 0} onClick={() => setDialogRemover(true)}>
          ➖ Remover Aptidão
        </Button>
      </div>

      {!personagem.universo && (
        <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
          Selecione um Universo no menu lateral Info para gerenciar aptidões.
        </StatusValueRow>
      )}

      <SectionTitle style={{ marginTop: 32 }}>Aptidões Adquiridas</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {!carregando && adquiridas.length === 0 && (
          <StatusValueRow>Nenhuma aptidão adquirida ainda.</StatusValueRow>
        )}
        {adquiridas.map(item => {
          const aptidao = catalogo.find(cat => cat.id === item.id);
          const nivelMaximo = aptidao?.nivelMaximo ?? 5;
          return (
            <AptidaoRow
              key={item.id}
              nome={getNome(aptidao) || 'Aptidão'}
              nivel={item.nivel ?? 0}
              nivelMaximo={nivelMaximo}
              vantagens={aptidao?.vantagens ?? []}
              onUpgrade={() => handleUpgrade(item.id, item.nivel ?? 0, nivelMaximo)}
              onReset={() => handleReset(item.id)}
              onRemover={() => handleRemover(item.id)}
            />
          );
        })}
      </div>

      <AjusteGanhasDialog
        open={dialogGanhar}
        titulo="Ganhar Aptidão"
        onClose={() => setDialogGanhar(false)}
        onConfirm={quantidade => {
          handleAjustarGanhas(quantidade);
          setDialogGanhar(false);
        }}
      />
      <AjusteGanhasDialog
        open={dialogRemover}
        titulo="Remover Aptidão"
        onClose={() => setDialogRemover(false)}
        onConfirm={quantidade => {
          handleAjustarGanhas(-quantidade);
          setDialogRemover(false);
        }}
      />
      <GerenciarAptidoesDialog
        open={dialogGerenciar}
        onClose={() => setDialogGerenciar(false)}
        catalogo={catalogo}
        idsAdquiridos={idsAdquiridos}
        limite={disponiveisParaEscolher}
        onConfirm={async ids => {
          await handleAdquirir(ids);
          setDialogGerenciar(false);
        }}
      />
    </div>
  );
};

AptidoesTab.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AptidoesTab;
