import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import BoltIcon from '@mui/icons-material/Bolt';
import CasinoIcon from '@mui/icons-material/Casino';

import { addHistoricoSorte } from 'service/storage';
import { useSaving } from 'context/SavingContext';

import { CATALOGO_TRAPACA, CATEGORIAS_TRAPACA, LIMITE_POR_CATEGORIA } from './catalogoTrapaca';
import {
  CategoriaBloco,
  CategoriaHeader,
  CategoriaIcone,
  CategoriaSubtitulo,
  CategoriaTitulo,
  GuardadoItem,
  GuardadosGrid,
  ItemCard,
  ItemDescricao,
  ItemEfeitoBox,
  ItemEfeitoTexto,
  ItemHeader,
  ItemIcone,
  ItemNome,
  ItemNomeRow,
  ItemPreco,
  ItemTag,
  ItemTagsRow,
  ItensGrid,
  RodapeInfo,
} from './styles';
import { SectionTitle, StatusValueRow } from '../styles';

const CATEGORIAS = Object.keys(CATEGORIAS_TRAPACA);

const LojaTrapacaSection = ({ personagem, onSave }) => {
  const fortunaAtual = personagem.sorte?.fortunaAtual ?? 0;
  const { executar } = useSaving();
  const efeitosAtivos = useMemo(
    () => personagem.lojaTrapaça?.efeitosAtivos ?? [],
    [personagem.lojaTrapaça?.efeitosAtivos],
  );

  const contagemPorCategoria = useCallback(
    categoria => efeitosAtivos.filter(efeito => efeito.categoria === categoria).length,
    [efeitosAtivos],
  );

  const handleComprar = useCallback(
    efeito => {
      if (fortunaAtual < efeito.custo) {
        return undefined;
      }
      const limite = LIMITE_POR_CATEGORIA[efeito.categoria] ?? Infinity;
      if (efeito.tipoAtivacao === 'manual' && contagemPorCategoria(efeito.categoria) >= limite) {
        return undefined;
      }

      const novosEfeitos =
        efeito.tipoAtivacao === 'manual'
          ? [
              ...efeitosAtivos,
              { id: efeito.id, nome: efeito.nome, categoria: efeito.categoria, adquiridoEm: new Date().toISOString() },
            ]
          : efeitosAtivos;

      return executar(async () => {
        await onSave({
          sorte: { ...personagem.sorte, fortunaAtual: fortunaAtual - efeito.custo },
          lojaTrapaça: { ...personagem.lojaTrapaça, efeitosAtivos: novosEfeitos },
        });
        await addHistoricoSorte(personagem.id, {
          tipo: 'compra_trapaca',
          descricao: `Comprou "${efeito.nome}" na Loja da Trapaça`,
          valor: -efeito.custo,
        });
      });
    },
    [fortunaAtual, efeitosAtivos, onSave, personagem, contagemPorCategoria, executar],
  );

  const handleUsar = useCallback(
    index =>
      executar(() =>
        onSave({
          lojaTrapaça: {
            ...personagem.lojaTrapaça,
            efeitosAtivos: efeitosAtivos.filter((_efeito, itemIndex) => itemIndex !== index),
          },
        }),
      ),
    [efeitosAtivos, onSave, personagem.lojaTrapaça, executar],
  );

  return (
    <div>
      {CATEGORIAS.map(categoria => {
        const { icone, cor, subtitulo } = CATEGORIAS_TRAPACA[categoria];
        return (
          <CategoriaBloco key={categoria}>
            <CategoriaHeader>
              <CategoriaIcone>{icone}</CategoriaIcone>
              <CategoriaTitulo $cor={cor}>{categoria}</CategoriaTitulo>
            </CategoriaHeader>
            <CategoriaSubtitulo>{subtitulo}</CategoriaSubtitulo>

            <ItensGrid>
              {CATALOGO_TRAPACA.filter(efeito => efeito.categoria === categoria).map(efeito => {
                const semSaldo = fortunaAtual < efeito.custo;
                const limite = LIMITE_POR_CATEGORIA[categoria];
                const limiteAtingido =
                  efeito.tipoAtivacao === 'manual' && contagemPorCategoria(categoria) >= (limite ?? Infinity);

                return (
                  <ItemCard key={efeito.id}>
                    <ItemHeader>
                      <ItemNomeRow>
                        <ItemIcone>{efeito.icone}</ItemIcone>
                        <ItemNome>{efeito.nome}</ItemNome>
                      </ItemNomeRow>
                      <ItemPreco>{efeito.custo}Ȼ</ItemPreco>
                    </ItemHeader>

                    <ItemDescricao>{efeito.descricao}</ItemDescricao>

                    <ItemEfeitoBox>
                      <BoltIcon fontSize="inherit" />
                      <ItemEfeitoTexto>{efeito.efeito}</ItemEfeitoTexto>
                    </ItemEfeitoBox>

                    <ItemTagsRow>
                      {efeito.tags.map(tag => (
                        <ItemTag key={tag}>{tag}</ItemTag>
                      ))}
                    </ItemTagsRow>

                    <Button
                      fullWidth
                      variant="contained"
                      disabled={semSaldo || limiteAtingido}
                      onClick={() => handleComprar(efeito)}
                    >
                      {limiteAtingido ? 'Limite atingido' : semSaldo ? 'Saldo insuficiente' : 'Comprar'}
                    </Button>
                  </ItemCard>
                );
              })}
            </ItensGrid>
          </CategoriaBloco>
        );
      })}

      <SectionTitle style={{ marginTop: 32 }}>Efeitos Guardados</SectionTitle>
      <GuardadosGrid style={{ marginTop: 12 }}>
        {efeitosAtivos.length === 0 && <StatusValueRow>Nenhum efeito guardado.</StatusValueRow>}
        {efeitosAtivos.map((efeito, index) => (
          <GuardadoItem key={`${efeito.id}-${index}`}>
            <span>{efeito.nome}</span>
            <Button size="small" variant="outlined" onClick={() => handleUsar(index)}>
              Usar
            </Button>
          </GuardadoItem>
        ))}
      </GuardadosGrid>

      <RodapeInfo>
        <CasinoIcon fontSize="inherit" />
        Use Fortuna (Ȼ) para comprar itens mágicos e especiais | Limite de 1 Bênção por dia
      </RodapeInfo>
    </div>
  );
};

LojaTrapacaSection.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default LojaTrapacaSection;
