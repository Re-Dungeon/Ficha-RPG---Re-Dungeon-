import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import RemoveIcon from '@mui/icons-material/Remove';

import { getCorposEspeciaisPorUniverso } from 'service/storage';
import { getNome } from 'common/utils/resolveNome';
import { useSaving } from 'context/SavingContext';

import { StatusValueRow } from '../styles';
import { EnciclopediaCard, EnciclopediaDescricao, EnciclopediaGrid, EnciclopediaIcone, EnciclopediaNome } from '../aptidoes/styles';
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
        <Button variant="text" onClick={() => setMostrarCatalogo(false)} sx={{ mb: 2 }}>
          ← Voltar para {getNome(corpoEspecialAtual)}
        </Button>
      )}

      {catalogo.length === 0 && (
        <StatusValueRow style={{ display: 'block' }}>
          Nenhum corpo especial cadastrado para este universo ainda.
        </StatusValueRow>
      )}

      <EnciclopediaGrid>
        {catalogo.map(item => {
          const selecionado = item.id === personagem.corpoEspecial;
          return (
            <EnciclopediaCard key={item.id}>
              <EnciclopediaIcone src={item.linkImagem} alt="" />
              <EnciclopediaNome>{getNome(item)}</EnciclopediaNome>
              {item.descricao && <EnciclopediaDescricao>{item.descricao}</EnciclopediaDescricao>}
              <Button
                size="small"
                fullWidth
                disabled={selecionado}
                onClick={() => handleEscolher(item.id)}
                sx={{
                  border: '1px solid var(--color-accent)',
                  color: 'var(--color-accent)',
                  background: 'rgba(91, 124, 250, 0.1)',
                }}
              >
                {selecionado ? 'Selecionado' : 'Escolher'}
              </Button>
            </EnciclopediaCard>
          );
        })}
      </EnciclopediaGrid>
    </div>
  );
};

CorpoEspecialGrid.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default CorpoEspecialGrid;
