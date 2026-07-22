import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

import { getNome } from 'common/utils/resolveNome';

import { QUALIDADE_OPTIONS } from '../inventario/constants';
import { ItemsGrid } from '../inventario/styles';
import { StatusValueRow } from '../styles';
import { FiltrosRow } from './styles';
import LojaItemCard from './LojaItemCard';
import QuantidadeDialog from './QuantidadeDialog';

const ORDEM_QUALIDADE = QUALIDADE_OPTIONS.reduce(
  (mapa, qualidade, indice) => ({ ...mapa, [qualidade]: indice }),
  {},
);

const LojaComprarView = ({ personagem, catalogo, saldoRokmas, espacoLivre, posseComPorItemId, onComprar }) => {
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [qualidadeFiltro, setQualidadeFiltro] = useState('');
  const [selecionado, setSelecionado] = useState(null);

  const tiposDisponiveis = useMemo(
    () =>
      [...new Set(catalogo.map(item => item.tipo).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [catalogo],
  );

  const itensFiltrados = useMemo(
    () =>
      catalogo
        .filter(
          item =>
            (getNome(item).toLowerCase().includes(busca.toLowerCase()) ||
              (item.descricao ?? '').toLowerCase().includes(busca.toLowerCase())) &&
            (!tipoFiltro || item.tipo === tipoFiltro) &&
            (!qualidadeFiltro || item.qualidade === qualidadeFiltro),
        )
        .sort((a, b) => {
          const rankA = ORDEM_QUALIDADE[a.qualidade] ?? 999;
          const rankB = ORDEM_QUALIDADE[b.qualidade] ?? 999;
          return rankA !== rankB ? rankA - rankB : getNome(a).localeCompare(getNome(b), 'pt-BR');
        }),
    [catalogo, busca, tipoFiltro, qualidadeFiltro],
  );

  const maxCompra = item => {
    const preco = item.precoCompra ?? 0;
    const maxPorSaldo = preco > 0 ? Math.floor(saldoRokmas / preco) : Infinity;
    const maxPorEspaco = item.pesoUnitario > 0 ? Math.floor(espacoLivre / item.pesoUnitario) : Infinity;
    return Math.max(0, Math.min(maxPorSaldo, maxPorEspaco));
  };

  const handleConfirmarCompra = async quantidade => {
    await onComprar(selecionado, quantidade);
    setSelecionado(null);
  };

  return (
    <div>
      <FiltrosRow>
        <TextField
          size="small"
          placeholder="Buscar item..."
          value={busca}
          onChange={event => setBusca(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <TextField
          select
          size="small"
          value={tipoFiltro}
          onChange={event => setTipoFiltro(event.target.value)}
          sx={{ minWidth: 180 }}
          slotProps={{ select: { displayEmpty: true } }}
        >
          <MenuItem value="">Todos os tipos</MenuItem>
          {tiposDisponiveis.map(tipo => (
            <MenuItem key={tipo} value={tipo}>
              {tipo}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          value={qualidadeFiltro}
          onChange={event => setQualidadeFiltro(event.target.value)}
          sx={{ minWidth: 180 }}
          slotProps={{ select: { displayEmpty: true } }}
        >
          <MenuItem value="">Todas as qualidades</MenuItem>
          {QUALIDADE_OPTIONS.map(qualidade => (
            <MenuItem key={qualidade} value={qualidade}>
              {qualidade}
            </MenuItem>
          ))}
        </TextField>
      </FiltrosRow>

      {itensFiltrados.length === 0 ? (
        <StatusValueRow>
          {personagem.universo ? 'Nenhum item encontrado.' : 'Selecione um Universo no menu lateral Info primeiro.'}
        </StatusValueRow>
      ) : (
        <ItemsGrid>
          {itensFiltrados.map(item => {
            const max = maxCompra(item);
            return (
              <LojaItemCard
                key={item.id}
                item={item}
                posse={posseComPorItemId[item.id] ?? 0}
                precoLabel="Custo"
                precoValor={item.precoCompra ?? 0}
                botaoLabel="Comprar"
                botaoDisabled={max <= 0}
                botaoTitulo={max <= 0 ? 'Saldo ou espaço insuficiente' : undefined}
                onBotaoClick={() => setSelecionado(item)}
              />
            );
          })}
        </ItemsGrid>
      )}

      <QuantidadeDialog
        open={Boolean(selecionado)}
        titulo="Comprar Item"
        nomeItem={selecionado ? getNome(selecionado) : ''}
        max={selecionado ? maxCompra(selecionado) : 0}
        precoUnitario={selecionado?.precoCompra ?? 0}
        precoLabel="Custo"
        acaoLabel="Comprar"
        onConfirmar={handleConfirmarCompra}
        onClose={() => setSelecionado(null)}
      />
    </div>
  );
};

LojaComprarView.propTypes = {
  personagem: PropTypes.object.isRequired,
  catalogo: PropTypes.array.isRequired,
  saldoRokmas: PropTypes.number.isRequired,
  espacoLivre: PropTypes.number.isRequired,
  posseComPorItemId: PropTypes.object.isRequired,
  onComprar: PropTypes.func.isRequired,
};

export default LojaComprarView;
