import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

import { addHistoricoSorte } from 'service/storage';

import { CATALOGO_TRAPACA, LIMITE_POR_CATEGORIA } from './catalogoTrapaca';
import { CardTitle, SectionTitle, StatusValueRow } from '../styles';

const CATEGORIAS = [...new Set(CATALOGO_TRAPACA.map(efeito => efeito.categoria))];

const LojaTrapacaSection = ({ personagem, onSave }) => {
  const fortunaAtual = personagem.sorte?.fortunaAtual ?? 0;
  const efeitosAtivos = useMemo(
    () => personagem.lojaTrapaça?.efeitosAtivos ?? [],
    [personagem.lojaTrapaça?.efeitosAtivos],
  );

  const contagemPorCategoria = useCallback(
    categoria => efeitosAtivos.filter(efeito => efeito.categoria === categoria).length,
    [efeitosAtivos],
  );

  const handleComprar = useCallback(
    async efeito => {
      if (fortunaAtual < efeito.custo) {
        return;
      }
      const limite = LIMITE_POR_CATEGORIA[efeito.categoria] ?? Infinity;
      if (efeito.tipoAtivacao === 'manual' && contagemPorCategoria(efeito.categoria) >= limite) {
        return;
      }

      const novosEfeitos =
        efeito.tipoAtivacao === 'manual'
          ? [
              ...efeitosAtivos,
              { id: efeito.id, nome: efeito.nome, categoria: efeito.categoria, adquiridoEm: new Date().toISOString() },
            ]
          : efeitosAtivos;

      await onSave({
        sorte: { ...personagem.sorte, fortunaAtual: fortunaAtual - efeito.custo },
        lojaTrapaça: { ...personagem.lojaTrapaça, efeitosAtivos: novosEfeitos },
      });
      await addHistoricoSorte(personagem.id, {
        tipo: 'compra_trapaca',
        descricao: `Comprou "${efeito.nome}" na Loja da Trapaça`,
        valor: -efeito.custo,
      });
    },
    [fortunaAtual, efeitosAtivos, onSave, personagem, contagemPorCategoria],
  );

  const handleUsar = useCallback(
    async index => {
      await onSave({
        lojaTrapaça: {
          ...personagem.lojaTrapaça,
          efeitosAtivos: efeitosAtivos.filter((_efeito, itemIndex) => itemIndex !== index),
        },
      });
    },
    [efeitosAtivos, onSave, personagem.lojaTrapaça],
  );

  return (
    <div>
      <SectionTitle>Loja da Trapaça</SectionTitle>
      <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
        Saldo de Fortuna: {fortunaAtual} Ȼ
      </StatusValueRow>

      {CATEGORIAS.map(categoria => {
        const limite = LIMITE_POR_CATEGORIA[categoria];
        return (
          <div key={categoria} style={{ marginTop: 20 }}>
            <CardTitle>
              {categoria}
              {limite !== Infinity && ` (${contagemPorCategoria(categoria)}/${limite} guardados)`}
            </CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {CATALOGO_TRAPACA.filter(efeito => efeito.categoria === categoria).map(efeito => {
                const semSaldo = fortunaAtual < efeito.custo;
                const limiteAtingido =
                  efeito.tipoAtivacao === 'manual' && contagemPorCategoria(categoria) >= (limite ?? Infinity);
                return (
                  <div
                    key={efeito.id}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, gap: 12 }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {efeito.nome} — {efeito.custo} Ȼ
                      </div>
                      <StatusValueRow>{efeito.descricao}</StatusValueRow>
                    </div>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={semSaldo || limiteAtingido}
                      onClick={() => handleComprar(efeito)}
                    >
                      💳 Comprar
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <SectionTitle style={{ marginTop: 32 }}>Efeitos Guardados</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {efeitosAtivos.length === 0 && <StatusValueRow>Nenhum efeito guardado.</StatusValueRow>}
        {efeitosAtivos.map((efeito, index) => (
          <div
            key={`${efeito.id}-${index}`}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 8 }}
          >
            <span>{efeito.nome}</span>
            <Button size="small" variant="outlined" onClick={() => handleUsar(index)}>
              Usar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

LojaTrapacaSection.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default LojaTrapacaSection;
