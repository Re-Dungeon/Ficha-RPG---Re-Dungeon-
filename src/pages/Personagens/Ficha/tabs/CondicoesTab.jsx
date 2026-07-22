import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

import { getCondicoesPorUniverso } from 'service/storage';
import { getNome } from 'common/utils/resolveNome';
import { useSaving } from 'context/SavingContext';

import { StatusValueRow } from '../styles';
import CondicaoCard from '../condicoes/CondicaoCard';
import CondicaoViewDialog from '../condicoes/CondicaoViewDialog';
import CondicoesCatalogoDialog from '../condicoes/CondicoesCatalogoDialog';
import { CondicoesLista } from '../condicoes/styles';

const hoje = () => new Date().toISOString().slice(0, 10);

const CondicoesTab = ({ personagem, onSave }) => {
  const [catalogo, setCatalogo] = useState([]);
  const [catalogoAberto, setCatalogoAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [condicaoVisualizadaId, setCondicaoVisualizadaId] = useState(null);
  const { executar } = useSaving();

  useEffect(() => {
    if (!personagem.universo) {
      setCatalogo([]);
      return undefined;
    }
    let isMounted = true;
    getCondicoesPorUniverso(personagem.universo).then(itens => {
      if (isMounted) {
        setCatalogo(itens);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [personagem.universo]);

  const condicoesAtivas = useMemo(
    () => personagem.condicoesAtivas ?? [],
    [personagem.condicoesAtivas],
  );

  const handleAdicionar = useCallback(
    condicaoId => {
      const existente = condicoesAtivas.find(item => item.condicaoId === condicaoId);
      const novaLista = existente
        ? condicoesAtivas.map(item =>
            item.condicaoId === condicaoId
              ? { ...item, stack: (item.stack ?? 1) + 1 }
              : item,
          )
        : [
            ...condicoesAtivas,
            { condicaoId, stack: 1, duracaoRestante: null, aplicadoEm: hoje() },
          ];

      return executar(() => onSave({ condicoesAtivas: novaLista }));
    },
    [condicoesAtivas, onSave, executar],
  );

  const handleRemover = useCallback(
    condicaoId =>
      executar(() =>
        onSave({
          condicoesAtivas: condicoesAtivas.filter(item => item.condicaoId !== condicaoId),
        }),
      ),
    [condicoesAtivas, onSave, executar],
  );

  const handleAlterarDuracao = useCallback(
    async (condicaoId, duracaoRestante) => {
      await onSave({
        condicoesAtivas: condicoesAtivas.map(item =>
          item.condicaoId === condicaoId ? { ...item, duracaoRestante } : item,
        ),
      });
    },
    [condicoesAtivas, onSave],
  );

  const catalogoFiltrado = catalogo.filter(item =>
    getNome(item).toLowerCase().includes(busca.toLowerCase()),
  );

  const condicaoVisualizada = catalogo.find(item => item.id === condicaoVisualizadaId) ?? null;
  const ativoVisualizado = condicoesAtivas.find(item => item.condicaoId === condicaoVisualizadaId) ?? null;

  return (
    <div>
      <CondicoesLista>
        {condicoesAtivas.length === 0 && (
          <StatusValueRow>Nenhuma condição ativa no momento.</StatusValueRow>
        )}
        {condicoesAtivas.map(ativo => (
          <CondicaoCard
            key={ativo.condicaoId}
            ativo={ativo}
            condicao={catalogo.find(item => item.id === ativo.condicaoId)}
            onVer={() => setCondicaoVisualizadaId(ativo.condicaoId)}
            onAlterarDuracao={duracaoRestante => handleAlterarDuracao(ativo.condicaoId, duracaoRestante)}
            onRemover={() => handleRemover(ativo.condicaoId)}
          />
        ))}
      </CondicoesLista>

      <Button
        variant="contained"
        fullWidth
        startIcon={<AddIcon />}
        onClick={() => setCatalogoAberto(true)}
        sx={{ marginTop: 2 }}
      >
        Adicionar Condição
      </Button>

      <CondicoesCatalogoDialog
        open={catalogoAberto}
        onClose={() => setCatalogoAberto(false)}
        catalogo={catalogoFiltrado}
        busca={busca}
        onBuscaChange={setBusca}
        temUniverso={Boolean(personagem.universo)}
        onAdicionar={handleAdicionar}
      />

      <CondicaoViewDialog
        open={Boolean(condicaoVisualizadaId)}
        onClose={() => setCondicaoVisualizadaId(null)}
        condicao={condicaoVisualizada}
        ativo={ativoVisualizado}
      />
    </div>
  );
};

CondicoesTab.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default CondicoesTab;
