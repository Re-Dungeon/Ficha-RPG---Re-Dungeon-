import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import RemoveIcon from '@mui/icons-material/Remove';

import { getCorposEspeciaisPorUniverso } from 'service/storage';
import { getNome } from 'common/utils/resolveNome';
import { useSaving } from 'context/SavingContext';

import { StatusValueRow } from '../styles';
import { EnciclopediaGrid } from '../aptidoes/styles';
import {
  BonusItem,
  BonusLista,
  DescricaoBox,
  DetalheBanner,
  DetalheNomeGrande,
  DetalheTitulo,
  DetalheTopo,
  SecaoTitulo,
} from '../progressao/styles';

const CorpoEspecialCard = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  grid-template-rows: auto auto 1fr auto;
  grid-template-areas:
    'header header'
    'header header'
    'image desc'
    'button button';
  gap: 16px 18px;
  padding: 24px 22px 18px;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(60, 36, 95, 0.34), rgba(29, 13, 50, 0.88));
  border: 1px solid rgba(232, 203, 133, 0.16);
  box-shadow: inset 0 0 16px rgba(255, 255, 255, 0.03);
  transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease, background 220ms ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(232, 203, 133, 0.28);
    box-shadow: 0 18px 60px rgba(0, 0, 0, 0.18), inset 0 0 18px rgba(255, 255, 255, 0.04);
  }

  &[data-selected='true'] {
    border-color: rgba(232, 203, 133, 0.55);
    box-shadow: 0 24px 80px rgba(232, 203, 133, 0.12), inset 0 0 20px rgba(232, 203, 133, 0.08);
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'header'
      'image'
      'desc'
      'button';
  }
`;

const CorpoEspecialCardName = styled.div`
  grid-area: header;
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(232, 203, 133, 0.96);
  line-height: 1.05;
  text-align: center;
  width: 100%;
`;

const CorpoEspecialCardImage = styled.img`
  grid-area: image;
  width: 100%;
  min-height: 120px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
`;

const CorpoEspecialCardPlaceholder = styled.div`
  grid-area: image;
  width: 100%;
  min-height: 120px;
  border-radius: 18px;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.52);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  text-align: center;
  padding: 12px;
`;

const CorpoEspecialCardDescricao = styled.p`
  grid-area: desc;
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.75;
  color: rgba(229, 224, 244, 0.9);
  letter-spacing: 0.02em;
  min-height: 120px;
  display: flex;
  align-items: flex-start;
  white-space: pre-wrap;
  word-break: break-word;
`;

const CorpoEspecialCardActions = styled.div`
  grid-area: button;
`;

const CorpoEspecialGridWrapper = styled(EnciclopediaGrid)`
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const CorpoEspecialGrid = ({ personagem, onSave }) => {
  const [catalogo, setCatalogo] = useState([]);
  // Alterna pra grade mesmo já tendo um corpo especial escolhido, pra permitir trocar.
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false);
  const { executar } = useSaving();

  useEffect(() => {
    if (!personagem.universo) {
      setCatalogo([]);
      return undefined;
    }
    let isMounted = true;
    getCorposEspeciaisPorUniverso(personagem.universo)
      .then(itens => {
        if (isMounted) {
          setCatalogo(itens);
        }
      })
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar corpos especiais:', erro);
      });
    return () => {
      isMounted = false;
    };
  }, [personagem.universo]);

  const corpoEspecialAtual = useMemo(
    () => catalogo.find(item => item.id === personagem.corpoEspecial) ?? null,
    [catalogo, personagem.corpoEspecial],
  );

  const handleEscolher = async itemId => {
    await executar(() => onSave({ corpoEspecial: itemId }));
    setMostrarCatalogo(false);
  };

  if (!personagem.universo) {
    return (
      <StatusValueRow style={{ display: 'block', marginTop: 16 }}>
        Selecione um Universo na aba Perfil primeiro.
      </StatusValueRow>
    );
  }

  if (corpoEspecialAtual && !mostrarCatalogo) {
    const vantagens = (corpoEspecialAtual.bonus ?? []).filter(
      linha => !linha.trim().toLowerCase().startsWith('desvantagem'),
    );
    const desvantagens = (corpoEspecialAtual.bonus ?? []).filter(linha =>
      linha.trim().toLowerCase().startsWith('desvantagem'),
    );

    return (
      <div style={{ marginTop: 16 }}>
        <DetalheTopo>
          <DetalheTitulo>
            <DetalheNomeGrande>{getNome(corpoEspecialAtual).toUpperCase()}</DetalheNomeGrande>
          </DetalheTitulo>
          <Button variant="outlined" onClick={() => setMostrarCatalogo(true)}>
            Trocar Corpo Especial
          </Button>
        </DetalheTopo>

        {corpoEspecialAtual.linkImagem && <DetalheBanner src={corpoEspecialAtual.linkImagem} alt="" />}

        <SecaoTitulo>Descrição</SecaoTitulo>
        <DescricaoBox>{corpoEspecialAtual.descricao || 'Sem descrição cadastrada.'}</DescricaoBox>

        {vantagens.length > 0 && (
          <>
            <SecaoTitulo>Vantagens</SecaoTitulo>
            <BonusLista>
              {vantagens.map((linha, index) => (
                <BonusItem key={index} $variante="check">
                  <CheckIcon fontSize="inherit" />
                  {linha}
                </BonusItem>
              ))}
            </BonusLista>
          </>
        )}

        {desvantagens.length > 0 && (
          <>
            <SecaoTitulo>Desvantagens</SecaoTitulo>
            <BonusLista>
              {desvantagens.map((linha, index) => (
                <BonusItem key={index}>
                  <RemoveIcon fontSize="inherit" />
                  {linha}
                </BonusItem>
              ))}
            </BonusLista>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      {corpoEspecialAtual && (
        <Button
          variant="outlined"
          onClick={() => setMostrarCatalogo(false)}
          sx={{
            mb: 2,
            borderColor: 'rgba(232, 203, 133, 0.35)',
            color: 'rgba(232, 203, 133, 0.95)',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 14,
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': {
              background: 'rgba(232, 203, 133, 0.08)',
              borderColor: 'rgba(232, 203, 133, 0.55)',
            },
          }}
        >
          ← Voltar para {getNome(corpoEspecialAtual)}
        </Button>
      )}

      {catalogo.length === 0 && (
        <StatusValueRow style={{ display: 'block' }}>
          Nenhum corpo especial cadastrado para este universo ainda.
        </StatusValueRow>
      )}

      <CorpoEspecialGridWrapper>
        {catalogo.map(item => {
          const selecionado = item.id === personagem.corpoEspecial;
          return (
            <CorpoEspecialCard key={item.id} data-selected={selecionado}>
              <CorpoEspecialCardName>{getNome(item)}</CorpoEspecialCardName>

              {item.linkImagem ? (
                <CorpoEspecialCardImage src={item.linkImagem} alt="" />
              ) : (
                <CorpoEspecialCardPlaceholder>Sem imagem disponível</CorpoEspecialCardPlaceholder>
              )}

              <CorpoEspecialCardDescricao>
                {item.descricao || 'Sem descrição cadastrada.'}
              </CorpoEspecialCardDescricao>

              <CorpoEspecialCardActions>
                <Button
                  size="small"
                  fullWidth
                  disabled={selecionado}
                  onClick={() => handleEscolher(item.id)}
                  sx={{
                    border: '1px solid var(--color-accent)',
                    color: 'var(--color-accent)',
                    background: 'rgba(91, 124, 250, 0.1)',
                    height: 46,
                    borderRadius: 14,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  {selecionado ? 'Selecionado' : 'Escolher'}
                </Button>
              </CorpoEspecialCardActions>
            </CorpoEspecialCard>
          );
        })}
      </CorpoEspecialGridWrapper>
    </div>
  );
};

CorpoEspecialGrid.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default CorpoEspecialGrid;
