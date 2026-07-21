import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';

import { getItensPorUniverso } from 'service/storage';
import { calcularEspacoInventario, calcularPrimariosTotais } from 'common/utils/formulas';
import { getNome } from 'common/utils/resolveNome';
import { useSaving } from 'context/SavingContext';

import ItemCard from '../inventario/ItemCard';
import AdicionarItemDialog from '../inventario/AdicionarItemDialog';
import { AtributoCardWrapper, CardTitle, CardTotal, SectionTitle, StatusValueRow } from '../styles';

const InventarioTab = ({ personagem, onSave }) => {
  const [catalogo, setCatalogo] = useState([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const { executar } = useSaving();

  useEffect(() => {
    if (!personagem.universo) {
      setCatalogo([]);
      return undefined;
    }
    let isMounted = true;
    getItensPorUniverso(personagem.universo).then(itens => {
      if (isMounted) {
        setCatalogo(itens);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [personagem.universo]);

  const inventario = useMemo(() => personagem.inventario ?? [], [personagem.inventario]);

  const primariosTotais = calcularPrimariosTotais(
    personagem.atributosBase,
    personagem.atributosExtra,
    personagem.atributosBonus,
  );

  const inventarioResolvido = inventario.map(entrada => ({
    ...entrada,
    ...(catalogo.find(item => item.id === entrada.itemId) ?? {}),
  }));

  const espaco = calcularEspacoInventario(primariosTotais, inventarioResolvido);

  const handleAdicionar = useCallback(
    (itemId, quantidade) => {
      const existente = inventario.find(entrada => entrada.itemId === itemId);
      const novoInventario = existente
        ? inventario.map(entrada =>
            entrada.itemId === itemId
              ? { ...entrada, quantidade: entrada.quantidade + quantidade }
              : entrada,
          )
        : [...inventario, { itemId, quantidade, equipado: false }];
      return executar(() => onSave({ inventario: novoInventario }));
    },
    [inventario, onSave, executar],
  );

  const handleAlterarQuantidade = useCallback(
    (itemId, delta) => {
      const novoInventario = inventario
        .map(entrada =>
          entrada.itemId === itemId
            ? { ...entrada, quantidade: entrada.quantidade + delta }
            : entrada,
        )
        .filter(entrada => entrada.quantidade > 0);
      return executar(() => onSave({ inventario: novoInventario }));
    },
    [inventario, onSave, executar],
  );

  const handleToggleEquipado = useCallback(
    itemId => {
      const novoInventario = inventario.map(entrada =>
        entrada.itemId === itemId ? { ...entrada, equipado: !entrada.equipado } : entrada,
      );
      return executar(() => onSave({ inventario: novoInventario }));
    },
    [inventario, onSave, executar],
  );

  const handleRemover = useCallback(
    itemId => executar(() => onSave({ inventario: inventario.filter(entrada => entrada.itemId !== itemId) })),
    [inventario, onSave, executar],
  );

  const itensFiltrados = inventarioResolvido.filter(entrada =>
    getNome(entrada).toLowerCase().includes(busca.toLowerCase()),
  );

  const percentualUsado = espaco.espacoTotal > 0 ? Math.min(100, (espaco.espacoUsado / espaco.espacoTotal) * 100) : 0;

  return (
    <div>
      <SectionTitle>
        Inventário
        <Button
          variant="contained"
          size="small"
          disabled={!personagem.universo}
          onClick={() => setDialogAberto(true)}
        >
          + Adicionar Item
        </Button>
      </SectionTitle>

      {!personagem.universo && (
        <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
          Selecione um Universo no menu lateral Info primeiro.
        </StatusValueRow>
      )}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
        <AtributoCardWrapper style={{ minWidth: 140 }}>
          <CardTitle>Total</CardTitle>
          <CardTotal>{espaco.espacoTotal}</CardTotal>
        </AtributoCardWrapper>
        <AtributoCardWrapper style={{ minWidth: 140 }}>
          <CardTitle>Usado</CardTitle>
          <CardTotal>{espaco.espacoUsado}</CardTotal>
        </AtributoCardWrapper>
        <AtributoCardWrapper style={{ minWidth: 140 }}>
          <CardTitle>Livre</CardTitle>
          <CardTotal>{espaco.espacoLivre}</CardTotal>
        </AtributoCardWrapper>
      </div>
      <LinearProgress
        variant="determinate"
        value={percentualUsado}
        sx={{ height: 8, borderRadius: 4, marginTop: 12 }}
      />

      <TextField
        fullWidth
        size="small"
        placeholder="Buscar no inventário..."
        value={busca}
        onChange={event => setBusca(event.target.value)}
        sx={{ marginTop: 20, maxWidth: 320 }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        {itensFiltrados.length === 0 && <StatusValueRow>Nenhum item no inventário.</StatusValueRow>}
        {itensFiltrados.map(entrada => (
          <ItemCard
            key={entrada.itemId}
            item={entrada}
            onAlterarQuantidade={delta => handleAlterarQuantidade(entrada.itemId, delta)}
            onToggleEquipado={() => handleToggleEquipado(entrada.itemId)}
            onRemover={() => handleRemover(entrada.itemId)}
          />
        ))}
      </div>

      <AdicionarItemDialog
        open={dialogAberto}
        onClose={() => setDialogAberto(false)}
        catalogo={catalogo}
        espacoLivre={espaco.espacoLivre}
        onAdicionar={handleAdicionar}
      />
    </div>
  );
};

InventarioTab.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default InventarioTab;
