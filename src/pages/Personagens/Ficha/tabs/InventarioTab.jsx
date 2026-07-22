import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

import {
  addItemInventario,
  addMaterialInventario,
  addReceitaInventario,
  getItensInventario,
  getMateriaisInventario,
  getReceitasInventario,
  removeItemInventario,
  removeMaterialInventario,
  removeReceitaInventario,
  updateItemInventario,
  updateMaterialInventario,
  updateReceitaInventario,
} from 'service/storage';
import { calcularEspacoInventario, calcularPrimariosTotais } from 'common/utils/formulas';
import { getNome } from 'common/utils/resolveNome';
import { useSaving } from 'context/SavingContext';

import ItemCard from '../inventario/ItemCard';
import CriarItemDialog from '../inventario/CriarItemDialog';
import ItemFormDialog from '../inventario/ItemFormDialog';
import ItemViewDialog from '../inventario/ItemViewDialog';
import MaterialCard from '../inventario/MaterialCard';
import CriarMaterialDialog from '../inventario/CriarMaterialDialog';
import MaterialFormDialog from '../inventario/MaterialFormDialog';
import MaterialViewDialog from '../inventario/MaterialViewDialog';
import ReceitaCard from '../inventario/ReceitaCard';
import CriarReceitaDialog from '../inventario/CriarReceitaDialog';
import ReceitaFormDialog from '../inventario/ReceitaFormDialog';
import ReceitaViewDialog from '../inventario/ReceitaViewDialog';
import { QUALIDADE_OPTIONS } from '../inventario/constants';
import {
  EspacoBarraFill,
  EspacoBarraTrack,
  EspacoCard,
  EspacoGrid,
  EspacoLabel,
  EspacoValor,
  InventarioHeaderRow,
  ItemsGrid,
} from '../inventario/styles';
import { SectionTitle, StatusValueRow } from '../styles';

const InventarioTab = ({ personagem, onSave: _onSave }) => {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [qualidadeFiltro, setQualidadeFiltro] = useState('');
  const [itemEmEdicao, setItemEmEdicao] = useState(null);
  const [itemEmVisualizacao, setItemEmVisualizacao] = useState(null);

  const [materiais, setMateriais] = useState([]);
  const [dialogMaterialAberto, setDialogMaterialAberto] = useState(false);
  const [materialEmEdicao, setMaterialEmEdicao] = useState(null);
  const [materialEmVisualizacao, setMaterialEmVisualizacao] = useState(null);

  const [receitas, setReceitas] = useState([]);
  const [dialogReceitaAberto, setDialogReceitaAberto] = useState(false);
  const [receitaEmEdicao, setReceitaEmEdicao] = useState(null);
  const [receitaEmVisualizacao, setReceitaEmVisualizacao] = useState(null);

  const { executar } = useSaving();

  const carregarItens = useCallback(async () => {
    const itensCarregados = await getItensInventario(personagem.id);
    setItens(itensCarregados);
    setCarregando(false);
  }, [personagem.id]);

  const carregarMateriais = useCallback(async () => {
    setMateriais(await getMateriaisInventario(personagem.id));
  }, [personagem.id]);

  const carregarReceitas = useCallback(async () => {
    setReceitas(await getReceitasInventario(personagem.id));
  }, [personagem.id]);

  useEffect(() => {
    carregarItens();
    carregarMateriais();
    carregarReceitas();
  }, [carregarItens, carregarMateriais, carregarReceitas]);

  const primariosTotais = calcularPrimariosTotais(
    personagem.atributosBase,
    personagem.atributosExtra,
    personagem.atributosBonus,
  );

  const itensParaEspaco = itens.map(item => ({
    espaco: item.pesoUnitario ?? 0,
    bonusEspaco: item.bonusEspaco ?? 0,
    quantidade: item.quantidade,
    equipado: item.equipado,
  }));

  const espaco = calcularEspacoInventario(primariosTotais, itensParaEspaco);
  const sobrecarregado = espaco.espacoUsado > espaco.espacoTotal;

  const handleCriar = useCallback(
    dadosItem =>
      executar(async () => {
        await addItemInventario(personagem.id, dadosItem);
        await carregarItens();
      }),
    [personagem.id, carregarItens, executar],
  );

  const handleEditar = useCallback(
    valores =>
      executar(async () => {
        await updateItemInventario(personagem.id, itemEmEdicao.id, valores);
        await carregarItens();
      }),
    [personagem.id, itemEmEdicao, carregarItens, executar],
  );

  const handleToggleEquipado = useCallback(
    item =>
      executar(async () => {
        await updateItemInventario(personagem.id, item.id, { equipado: !item.equipado });
        await carregarItens();
      }),
    [personagem.id, carregarItens, executar],
  );

  const handleRemover = useCallback(
    item =>
      executar(async () => {
        await removeItemInventario(personagem.id, item.id);
        await carregarItens();
      }),
    [personagem.id, carregarItens, executar],
  );

  const itensFiltrados = itens.filter(
    item =>
      getNome(item).toLowerCase().includes(busca.toLowerCase()) &&
      (!qualidadeFiltro || item.qualidade === qualidadeFiltro),
  );

  const percentualUsado = espaco.espacoTotal > 0 ? Math.min(100, (espaco.espacoUsado / espaco.espacoTotal) * 100) : 0;

  const handleCriarMaterial = useCallback(
    dadosMaterial =>
      executar(async () => {
        await addMaterialInventario(personagem.id, dadosMaterial);
        await carregarMateriais();
      }),
    [personagem.id, carregarMateriais, executar],
  );

  const handleEditarMaterial = useCallback(
    valores =>
      executar(async () => {
        await updateMaterialInventario(personagem.id, materialEmEdicao.id, valores);
        await carregarMateriais();
      }),
    [personagem.id, materialEmEdicao, carregarMateriais, executar],
  );

  const handleRemoverMaterial = useCallback(
    material =>
      executar(async () => {
        await removeMaterialInventario(personagem.id, material.id);
        await carregarMateriais();
      }),
    [personagem.id, carregarMateriais, executar],
  );

  const handleCriarReceita = useCallback(
    dadosReceita =>
      executar(async () => {
        await addReceitaInventario(personagem.id, dadosReceita);
        await carregarReceitas();
      }),
    [personagem.id, carregarReceitas, executar],
  );

  const handleEditarReceita = useCallback(
    valores =>
      executar(async () => {
        await updateReceitaInventario(personagem.id, receitaEmEdicao.id, valores);
        await carregarReceitas();
      }),
    [personagem.id, receitaEmEdicao, carregarReceitas, executar],
  );

  const handleRemoverReceita = useCallback(
    receita =>
      executar(async () => {
        await removeReceitaInventario(personagem.id, receita.id);
        await carregarReceitas();
      }),
    [personagem.id, carregarReceitas, executar],
  );

  return (
    <div>
      <SectionTitle>🧰 Inventário</SectionTitle>

      {!personagem.universo && (
        <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
          Selecione um Universo no menu lateral Info primeiro.
        </StatusValueRow>
      )}

      <EspacoGrid>
        <EspacoCard>
          <EspacoLabel>Espaço Total</EspacoLabel>
          <EspacoValor>{espaco.espacoTotal.toFixed(2)}</EspacoValor>
        </EspacoCard>
        <EspacoCard>
          <EspacoLabel>Espaço Usado</EspacoLabel>
          <EspacoValor>{espaco.espacoUsado.toFixed(2)}</EspacoValor>
        </EspacoCard>
        <EspacoCard>
          <EspacoLabel>Espaço Livre</EspacoLabel>
          <EspacoValor>{espaco.espacoLivre.toFixed(2)}</EspacoValor>
        </EspacoCard>
        <EspacoCard>
          <EspacoLabel>Status</EspacoLabel>
          <EspacoValor data-status={sobrecarregado ? 'sobrecarga' : 'ok'}>
            {sobrecarregado ? '⚠️ Sobrecarga' : '✅ OK'}
          </EspacoValor>
        </EspacoCard>
      </EspacoGrid>
      <EspacoBarraTrack>
        <EspacoBarraFill $percentual={percentualUsado} $sobrecarga={sobrecarregado} />
      </EspacoBarraTrack>

      <InventarioHeaderRow style={{ marginTop: 28 }}>
        <SectionTitle style={{ fontSize: '1rem' }}>📦 Itens do Inventário</SectionTitle>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
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
            sx={{ minWidth: 200 }}
          />
          <TextField
            select
            size="small"
            value={qualidadeFiltro}
            onChange={event => setQualidadeFiltro(event.target.value)}
            sx={{ minWidth: 180 }}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="">Todas as Qualidades</MenuItem>
            {QUALIDADE_OPTIONS.map(qualidade => (
              <MenuItem key={qualidade} value={qualidade}>
                {qualidade}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" size="small" onClick={() => setDialogAberto(true)}>
            + Adicionar Item
          </Button>
        </div>
      </InventarioHeaderRow>

      {!carregando && (
        <ItemsGrid>
          {itensFiltrados.length === 0 && <StatusValueRow>Nenhum item no inventário.</StatusValueRow>}
          {itensFiltrados.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onVer={() => setItemEmVisualizacao(item)}
              onEditar={() => setItemEmEdicao(item)}
              onEquipar={() => handleToggleEquipado(item)}
              onRemover={() => handleRemover(item)}
            />
          ))}
        </ItemsGrid>
      )}

      <CriarItemDialog
        open={dialogAberto}
        onClose={() => setDialogAberto(false)}
        personagem={personagem}
        espacoLivre={espaco.espacoLivre}
        onCreate={handleCriar}
      />

      <ItemFormDialog
        open={Boolean(itemEmEdicao)}
        onClose={() => setItemEmEdicao(null)}
        item={itemEmEdicao}
        onSubmit={handleEditar}
      />

      <ItemViewDialog
        open={Boolean(itemEmVisualizacao)}
        onClose={() => setItemEmVisualizacao(null)}
        item={itemEmVisualizacao}
        onEditar={() => {
          setItemEmEdicao(itemEmVisualizacao);
          setItemEmVisualizacao(null);
        }}
      />

      <InventarioHeaderRow style={{ marginTop: 28 }}>
        <SectionTitle style={{ fontSize: '1rem' }}>🧱 Materiais</SectionTitle>
        <Button variant="contained" size="small" onClick={() => setDialogMaterialAberto(true)}>
          + Adicionar Material
        </Button>
      </InventarioHeaderRow>

      {!carregando && (
        <ItemsGrid>
          {materiais.length === 0 && <StatusValueRow>Nenhum material no inventário.</StatusValueRow>}
          {materiais.map(material => (
            <MaterialCard
              key={material.id}
              material={material}
              onVer={() => setMaterialEmVisualizacao(material)}
              onEditar={() => setMaterialEmEdicao(material)}
              onRemover={() => handleRemoverMaterial(material)}
            />
          ))}
        </ItemsGrid>
      )}

      <CriarMaterialDialog
        open={dialogMaterialAberto}
        onClose={() => setDialogMaterialAberto(false)}
        personagem={personagem}
        onCreate={handleCriarMaterial}
      />

      <MaterialFormDialog
        open={Boolean(materialEmEdicao)}
        onClose={() => setMaterialEmEdicao(null)}
        material={materialEmEdicao}
        onSubmit={handleEditarMaterial}
      />

      <MaterialViewDialog
        open={Boolean(materialEmVisualizacao)}
        onClose={() => setMaterialEmVisualizacao(null)}
        material={materialEmVisualizacao}
        onEditar={() => {
          setMaterialEmEdicao(materialEmVisualizacao);
          setMaterialEmVisualizacao(null);
        }}
      />

      <InventarioHeaderRow style={{ marginTop: 28 }}>
        <SectionTitle style={{ fontSize: '1rem' }}>📜 Receitas</SectionTitle>
        <Button variant="contained" size="small" onClick={() => setDialogReceitaAberto(true)}>
          + Adicionar Receita
        </Button>
      </InventarioHeaderRow>

      {!carregando && (
        <ItemsGrid>
          {receitas.length === 0 && <StatusValueRow>Nenhuma receita no inventário.</StatusValueRow>}
          {receitas.map(receita => (
            <ReceitaCard
              key={receita.id}
              receita={receita}
              onVer={() => setReceitaEmVisualizacao(receita)}
              onEditar={() => setReceitaEmEdicao(receita)}
              onRemover={() => handleRemoverReceita(receita)}
            />
          ))}
        </ItemsGrid>
      )}

      <CriarReceitaDialog
        open={dialogReceitaAberto}
        onClose={() => setDialogReceitaAberto(false)}
        personagem={personagem}
        onCreate={handleCriarReceita}
      />

      <ReceitaFormDialog
        open={Boolean(receitaEmEdicao)}
        onClose={() => setReceitaEmEdicao(null)}
        receita={receitaEmEdicao}
        onSubmit={handleEditarReceita}
      />

      <ReceitaViewDialog
        open={Boolean(receitaEmVisualizacao)}
        onClose={() => setReceitaEmVisualizacao(null)}
        receita={receitaEmVisualizacao}
        onEditar={() => {
          setReceitaEmEdicao(receitaEmVisualizacao);
          setReceitaEmVisualizacao(null);
        }}
      />
    </div>
  );
};

InventarioTab.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default InventarioTab;
