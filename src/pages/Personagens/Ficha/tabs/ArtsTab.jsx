import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

import { addArt, getArts, removeArt, updateArt } from 'service/storage';
import { calcularLimiteArts, calcularPrimariosTotais, reorganizarArts } from 'common/utils/formulas';
import { useSaving } from 'context/SavingContext';

import ArtCard from '../arts/ArtCard';
import CriarArtDialog from '../arts/CriarArtDialog';
import { SectionTitle, StatusValueRow } from '../styles';

const ArtsTab = ({ personagem, onSave: _onSave }) => {
  const [arts, setArts] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const { executar } = useSaving();

  const carregarArts = useCallback(async () => {
    const itens = await getArts(personagem.id);
    setArts(itens);
    setCarregando(false);
  }, [personagem.id]);

  useEffect(() => {
    carregarArts();
  }, [carregarArts]);

  const primariosTotais = calcularPrimariosTotais(
    personagem.atributosBase,
    personagem.atributosExtra,
    personagem.atributosBonus,
  );
  const limite = calcularLimiteArts(primariosTotais);
  const ativas = arts.filter(art => art.ativa).length;

  const handleCreate = useCallback(
    dadosArt =>
      executar(async () => {
        await addArt(personagem.id, dadosArt);
        await carregarArts();
      }),
    [personagem.id, carregarArts, executar],
  );

  const handleToggleAtiva = useCallback(
    art =>
      executar(async () => {
        await updateArt(personagem.id, art.id, { ativa: !art.ativa });
        await carregarArts();
      }),
    [personagem.id, carregarArts, executar],
  );

  const handleRemover = useCallback(
    art =>
      executar(async () => {
        await removeArt(personagem.id, art.id);
        await carregarArts();
      }),
    [personagem.id, carregarArts, executar],
  );

  const handleReorganizar = useCallback(
    () =>
      executar(async () => {
        const lista = arts.map(art => ({
          id: art.id,
          ativa: art.ativa,
          criadoEm: art.createdAt?.toMillis?.() ?? 0,
        }));
        const reorganizada = reorganizarArts(lista, limite);
        await Promise.all(
          reorganizada
            .filter(item => {
              const original = arts.find(art => art.id === item.id);
              return original && original.ativa !== item.ativa;
            })
            .map(item => updateArt(personagem.id, item.id, { ativa: item.ativa })),
        );
        await carregarArts();
      }),
    [arts, limite, personagem.id, carregarArts, executar],
  );

  return (
    <div>
      <SectionTitle>
        Arts / Habilidades
        <Button variant="contained" size="small" onClick={() => setDialogAberto(true)}>
          + Criar Art
        </Button>
      </SectionTitle>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        <StatusValueRow>
          Arts ativas: {ativas} / {limite}
        </StatusValueRow>
        <Button size="small" variant="outlined" onClick={handleReorganizar}>
          🔓 Reorganizar automaticamente
        </Button>
      </div>
      <StatusValueRow style={{ display: 'block', marginTop: 4 }}>
        Quando os atributos mudam, o limite pode mudar — use o botão acima para bloquear as Arts
        mais recentes ou desbloquear as mais antigas conforme o novo limite.
      </StatusValueRow>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
        {!carregando && arts.length === 0 && <StatusValueRow>Nenhuma Art criada ainda.</StatusValueRow>}
        {arts.map(art => (
          <ArtCard
            key={art.id}
            art={art}
            onToggleAtiva={() => handleToggleAtiva(art)}
            onRemover={() => handleRemover(art)}
          />
        ))}
      </div>

      <CriarArtDialog
        open={dialogAberto}
        onClose={() => setDialogAberto(false)}
        personagem={personagem}
        onCreate={handleCreate}
      />
    </div>
  );
};

ArtsTab.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ArtsTab;
