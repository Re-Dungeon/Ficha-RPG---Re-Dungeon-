import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { getNome } from 'common/utils/resolveNome';

import { ItemsGrid } from '../inventario/styles';
import { SectionTitle, StatusValueRow } from '../styles';
import LojaItemCard from './LojaItemCard';
import LojaReceitaCard from './LojaReceitaCard';
import QuantidadeDialog from './QuantidadeDialog';

const LojaVenderView = ({ itensInventario, catalogoPorId, onVender, receitasInventario, catalogoReceitasPorId, onVenderReceita }) => {
  const [selecionado, setSelecionado] = useState(null);
  const [receitaSelecionada, setReceitaSelecionada] = useState(null);

  const valorVendaDe = item => {
    const itemCatalogo = item.itemId ? catalogoPorId.get(item.itemId) : null;
    return itemCatalogo?.precoVenda ?? 0;
  };

  const valorVendaReceitaDe = receita => {
    const receitaCatalogo = receita.receitaId ? catalogoReceitasPorId.get(receita.receitaId) : null;
    return Number(receitaCatalogo?.valorVenda) || 0;
  };

  const handleConfirmarVenda = async quantidade => {
    await onVender(selecionado, quantidade);
    setSelecionado(null);
  };

  const handleConfirmarVendaReceita = async quantidade => {
    await onVenderReceita(receitaSelecionada, quantidade);
    setReceitaSelecionada(null);
  };

  return (
    <div>
      <SectionTitle style={{ fontSize: '1rem' }}>📦 Itens</SectionTitle>
      {itensInventario.length === 0 ? (
        <StatusValueRow>Nenhum item no inventário para vender.</StatusValueRow>
      ) : (
        <ItemsGrid>
          {itensInventario.map(item => {
            const valorVenda = valorVendaDe(item);
            return (
              <LojaItemCard
                key={item.id}
                item={item}
                posse={item.quantidade ?? 0}
                precoLabel="Venda"
                precoValor={valorVenda}
                botaoLabel="Vender"
                botaoDisabled={valorVenda <= 0}
                botaoTitulo={valorVenda <= 0 ? 'Sem valor de venda definido no catálogo' : undefined}
                onBotaoClick={() => setSelecionado(item)}
              />
            );
          })}
        </ItemsGrid>
      )}

      <SectionTitle style={{ fontSize: '1rem', marginTop: 28 }}>📜 Receitas</SectionTitle>
      {receitasInventario.length === 0 ? (
        <StatusValueRow>Nenhuma receita no inventário para vender.</StatusValueRow>
      ) : (
        <ItemsGrid>
          {receitasInventario.map(receita => {
            const valorVenda = valorVendaReceitaDe(receita);
            return (
              <LojaReceitaCard
                key={receita.id}
                receita={receita}
                posse={receita.quantidade ?? 0}
                precoLabel="Venda"
                precoValor={valorVenda}
                botaoLabel="Vender"
                botaoDisabled={valorVenda <= 0}
                botaoTitulo={valorVenda <= 0 ? 'Sem valor de venda definido no catálogo' : undefined}
                onBotaoClick={() => setReceitaSelecionada(receita)}
              />
            );
          })}
        </ItemsGrid>
      )}

      <QuantidadeDialog
        open={Boolean(selecionado)}
        titulo="Vender Item"
        nomeItem={selecionado ? getNome(selecionado) : ''}
        max={selecionado?.quantidade ?? 0}
        precoUnitario={selecionado ? valorVendaDe(selecionado) : 0}
        precoLabel="Venda"
        acaoLabel="Vender"
        onConfirmar={handleConfirmarVenda}
        onClose={() => setSelecionado(null)}
      />

      <QuantidadeDialog
        open={Boolean(receitaSelecionada)}
        titulo="Vender Receita"
        nomeItem={receitaSelecionada ? getNome(receitaSelecionada) : ''}
        max={receitaSelecionada?.quantidade ?? 0}
        precoUnitario={receitaSelecionada ? valorVendaReceitaDe(receitaSelecionada) : 0}
        precoLabel="Venda"
        acaoLabel="Vender"
        onConfirmar={handleConfirmarVendaReceita}
        onClose={() => setReceitaSelecionada(null)}
      />
    </div>
  );
};

LojaVenderView.propTypes = {
  itensInventario: PropTypes.array.isRequired,
  catalogoPorId: PropTypes.instanceOf(Map).isRequired,
  onVender: PropTypes.func.isRequired,
  receitasInventario: PropTypes.array.isRequired,
  catalogoReceitasPorId: PropTypes.instanceOf(Map).isRequired,
  onVenderReceita: PropTypes.func.isRequired,
};

export default LojaVenderView;
