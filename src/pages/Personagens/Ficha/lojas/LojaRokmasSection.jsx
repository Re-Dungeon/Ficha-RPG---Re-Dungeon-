import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { getItensPorUniverso } from 'service/storage';
import { calcularEspacoInventario, calcularPrimariosTotais } from 'common/utils/formulas';
import { getNome } from 'common/utils/resolveNome';

import { SectionTitle, StatusValueRow } from '../styles';

const SALDO_INICIAL_PADRAO = 150;

const LojaRokmasSection = ({ personagem, onSave }) => {
  const [catalogo, setCatalogo] = useState([]);
  const [busca, setBusca] = useState('');

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
  const saldoRokmas = personagem.lojaRokmas?.saldoRokmas ?? SALDO_INICIAL_PADRAO;
  const historicoCompras = useMemo(
    () => personagem.lojaRokmas?.historicoCompras ?? [],
    [personagem.lojaRokmas?.historicoCompras],
  );

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

  const handleComprar = useCallback(
    async item => {
      const preco = item.preco ?? 0;
      if (saldoRokmas < preco || (item.espaco ?? 0) > espaco.espacoLivre) {
        return;
      }

      const existente = inventario.find(entrada => entrada.itemId === item.id);
      const novoInventario = existente
        ? inventario.map(entrada =>
            entrada.itemId === item.id ? { ...entrada, quantidade: entrada.quantidade + 1 } : entrada,
          )
        : [...inventario, { itemId: item.id, quantidade: 1, equipado: false }];

      const novoHistorico = [
        { tipo: 'compra', itemNome: getNome(item), valor: -preco, data: new Date().toISOString() },
        ...historicoCompras,
      ].slice(0, 20);

      await onSave({
        inventario: novoInventario,
        lojaRokmas: { saldoRokmas: saldoRokmas - preco, historicoCompras: novoHistorico },
      });
    },
    [inventario, saldoRokmas, espaco.espacoLivre, historicoCompras, onSave],
  );

  const handleVender = useCallback(
    async entrada => {
      const item = catalogo.find(cat => cat.id === entrada.itemId);
      const valorVenda = item?.valorVenda ?? Math.floor((item?.preco ?? 0) * 0.5);

      const novoInventario = inventario
        .map(item2 =>
          item2.itemId === entrada.itemId ? { ...item2, quantidade: item2.quantidade - 1 } : item2,
        )
        .filter(item2 => item2.quantidade > 0);

      const novoHistorico = [
        { tipo: 'venda', itemNome: getNome(item) || 'Item', valor: valorVenda, data: new Date().toISOString() },
        ...historicoCompras,
      ].slice(0, 20);

      await onSave({
        inventario: novoInventario,
        lojaRokmas: { saldoRokmas: saldoRokmas + valorVenda, historicoCompras: novoHistorico },
      });
    },
    [catalogo, inventario, saldoRokmas, historicoCompras, onSave],
  );

  const catalogoFiltrado = catalogo.filter(item =>
    getNome(item).toLowerCase().includes(busca.toLowerCase()),
  );
  const itensPossuidos = inventario.filter(entrada => entrada.quantidade > 0);

  return (
    <div>
      <SectionTitle>Loja Rokmas</SectionTitle>
      <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
        Saldo: {saldoRokmas} Rokmas · Espaço livre no inventário: {espaco.espacoLivre}
      </StatusValueRow>

      <TextField
        fullWidth
        size="small"
        placeholder="Buscar item..."
        value={busca}
        onChange={event => setBusca(event.target.value)}
        sx={{ marginTop: 16, maxWidth: 320 }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16, maxHeight: 360, overflowY: 'auto' }}>
        {catalogoFiltrado.map(item => {
          const semSaldo = saldoRokmas < (item.preco ?? 0);
          const semEspaco = (item.espaco ?? 0) > espaco.espacoLivre;
          return (
            <div
              key={item.id}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, gap: 12 }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  {getNome(item)} — {item.preco ?? 0} Rokmas
                </div>
                <StatusValueRow>
                  {[item.qualidade, item.tipo, item.espaco != null && `${item.espaco} espaço`]
                    .filter(Boolean)
                    .join(' · ')}
                </StatusValueRow>
              </div>
              <Button size="small" variant="contained" disabled={semSaldo || semEspaco} onClick={() => handleComprar(item)}>
                Comprar
              </Button>
            </div>
          );
        })}
        {catalogoFiltrado.length === 0 && (
          <StatusValueRow>
            {personagem.universo ? 'Nenhum item encontrado.' : 'Selecione um Universo no menu lateral Info primeiro.'}
          </StatusValueRow>
        )}
      </div>

      <SectionTitle style={{ marginTop: 32 }}>Vender do Inventário</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {itensPossuidos.length === 0 && <StatusValueRow>Nenhum item para vender.</StatusValueRow>}
        {itensPossuidos.map(entrada => {
          const item = catalogo.find(cat => cat.id === entrada.itemId);
          const valorVenda = item?.valorVenda ?? Math.floor((item?.preco ?? 0) * 0.5);
          return (
            <div
              key={entrada.itemId}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 8 }}
            >
              <span>
                {getNome(item) || 'Item'} (x{entrada.quantidade})
              </span>
              <Button size="small" variant="outlined" onClick={() => handleVender(entrada)}>
                Vender por {valorVenda}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

LojaRokmasSection.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default LojaRokmasSection;
