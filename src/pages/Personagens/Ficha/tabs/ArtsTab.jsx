import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import {
  addArt,
  addNucleo,
  addVariante,
  getArts,
  getCondicoesPorUniverso,
  getNucleos,
  getVariantes,
  removeArt,
  removeNucleo,
  removeVariante,
  updateArt,
  updateNucleo,
  updateVariante,
} from 'service/storage';
import { calcularLimiteArts, calcularPrimariosTotais, reorganizarArts } from 'common/utils/formulas';
import { useSaving } from 'context/SavingContext';

import ArtsSection from '../arts/ArtsSection';
import ArtFormDialog from '../arts/ArtFormDialog';
import ArtViewDialog from '../arts/ArtViewDialog';
import CriarArtDialog from '../arts/CriarArtDialog';
import NucleoFormDialog from '../arts/NucleoFormDialog';
import NucleoViewDialog from '../arts/NucleoViewDialog';
import NucleosSection from '../arts/NucleosSection';
import VarianteFormDialog from '../arts/VarianteFormDialog';
import VarianteViewDialog from '../arts/VarianteViewDialog';
import VariantesSection from '../arts/VariantesSection';
import { ArtsHeader, StatCard, StatLabel, StatsGrid, StatValue } from '../arts/styles';

const ArtsTab = ({ personagem }) => {
  const [nucleos, setNucleos] = useState([]);
  const [arts, setArts] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [condicoes, setCondicoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { executar } = useSaving();

  const [nucleoFormAberto, setNucleoFormAberto] = useState(false);
  const [nucleoEmEdicao, setNucleoEmEdicao] = useState(null);
  const [nucleoEmVisualizacao, setNucleoEmVisualizacao] = useState(null);

  const [criarArtAberto, setCriarArtAberto] = useState(false);
  const [artEmEdicao, setArtEmEdicao] = useState(null);
  const [artEmVisualizacao, setArtEmVisualizacao] = useState(null);

  const [varianteFormAberto, setVarianteFormAberto] = useState(false);
  const [varianteEmEdicao, setVarianteEmEdicao] = useState(null);
  const [varianteEmVisualizacao, setVarianteEmVisualizacao] = useState(null);

  const carregarTudo = useCallback(async () => {
    try {
      const [nucleosCarregados, artsCarregadas, variantesCarregadas] = await Promise.all([
        getNucleos(personagem.id),
        getArts(personagem.id),
        getVariantes(personagem.id),
      ]);
      setNucleos(nucleosCarregados);
      setArts(artsCarregadas);
      setVariantes(variantesCarregadas);
    } catch (erro) {
      // eslint-disable-next-line no-console
      console.error('Falha ao carregar arts/núcleos/variantes:', erro);
    } finally {
      setCarregando(false);
    }
  }, [personagem.id]);

  useEffect(() => {
    carregarTudo();
  }, [carregarTudo]);

  // Catálogo `condicoes` (somente leitura) pra Arts poderem aplicar condições —
  // mesma coleção já usada pela aba Condições.
  useEffect(() => {
    if (!personagem.universo) {
      setCondicoes([]);
      return undefined;
    }
    let isMounted = true;
    getCondicoesPorUniverso(personagem.universo)
      .then(itens => {
        if (isMounted) {
          setCondicoes(itens);
        }
      })
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar condições:', erro);
      });
    return () => {
      isMounted = false;
    };
  }, [personagem.universo]);

  const primariosTotais = calcularPrimariosTotais(
    personagem.atributosBase,
    personagem.atributosExtra,
    personagem.atributosBonus,
  );
  const limite = calcularLimiteArts(primariosTotais);
  const ativas = arts.filter(art => art.ativa).length;
  const bloqueadas = arts.length - ativas;

  const nucleosPorId = useMemo(() => new Map(nucleos.map(nucleo => [nucleo.id, nucleo])), [nucleos]);
  const artsPorId = useMemo(() => new Map(arts.map(art => [art.id, art])), [arts]);

  // ── Núcleos ─────────────────────────────────────────────────────────────

  const handleAbrirCriarNucleo = useCallback(() => {
    setNucleoEmEdicao(null);
    setNucleoFormAberto(true);
  }, []);

  const handleAbrirEditarNucleo = useCallback(nucleo => {
    setNucleoEmVisualizacao(null);
    setNucleoEmEdicao(nucleo);
    setNucleoFormAberto(true);
  }, []);

  const handleFecharFormNucleo = useCallback(() => {
    setNucleoFormAberto(false);
    setNucleoEmEdicao(null);
  }, []);

  const handleSalvarNucleo = useCallback(
    valores =>
      executar(async () => {
        if (nucleoEmEdicao) {
          await updateNucleo(personagem.id, nucleoEmEdicao.id, valores);
        } else {
          await addNucleo(personagem.id, valores);
        }
        await carregarTudo();
      }),
    [personagem.id, nucleoEmEdicao, carregarTudo, executar],
  );

  const handleRemoverNucleo = useCallback(
    nucleo =>
      executar(async () => {
        const artsDoNucleo = arts.filter(art => art.nucleoId === nucleo.id);
        const idsArtsDoNucleo = new Set(artsDoNucleo.map(art => art.id));
        const variantesAfetadas = variantes.filter(variante => idsArtsDoNucleo.has(variante.artId));

        await Promise.all(variantesAfetadas.map(variante => removeVariante(personagem.id, variante.id)));
        await Promise.all(artsDoNucleo.map(art => removeArt(personagem.id, art.id)));
        await removeNucleo(personagem.id, nucleo.id);
        await carregarTudo();
      }),
    [personagem.id, arts, variantes, carregarTudo, executar],
  );

  // ── Arts ────────────────────────────────────────────────────────────────

  const handleCriarArt = useCallback(
    dadosArt =>
      executar(async () => {
        await addArt(personagem.id, dadosArt);
        await carregarTudo();
      }),
    [personagem.id, carregarTudo, executar],
  );

  const handleSalvarEdicaoArt = useCallback(
    valores =>
      executar(async () => {
        await updateArt(personagem.id, artEmEdicao.id, valores);
        await carregarTudo();
      }),
    [personagem.id, artEmEdicao, carregarTudo, executar],
  );

  const handleToggleAtiva = useCallback(
    art =>
      executar(async () => {
        await updateArt(personagem.id, art.id, { ativa: !art.ativa });
        await carregarTudo();
      }),
    [personagem.id, carregarTudo, executar],
  );

  const handleRemoverArt = useCallback(
    art =>
      executar(async () => {
        const variantesDaArt = variantes.filter(variante => variante.artId === art.id);
        await Promise.all(variantesDaArt.map(variante => removeVariante(personagem.id, variante.id)));
        await removeArt(personagem.id, art.id);
        await carregarTudo();
      }),
    [personagem.id, variantes, carregarTudo, executar],
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
        await carregarTudo();
      }),
    [arts, limite, personagem.id, carregarTudo, executar],
  );

  const handleAbrirEditarArt = useCallback(art => {
    setArtEmVisualizacao(null);
    setArtEmEdicao(art);
  }, []);

  // ── Variantes ───────────────────────────────────────────────────────────

  const handleAbrirCriarVariante = useCallback(() => {
    setVarianteEmEdicao(null);
    setVarianteFormAberto(true);
  }, []);

  const handleAbrirEditarVariante = useCallback(variante => {
    setVarianteEmVisualizacao(null);
    setVarianteEmEdicao(variante);
    setVarianteFormAberto(true);
  }, []);

  const handleFecharFormVariante = useCallback(() => {
    setVarianteFormAberto(false);
    setVarianteEmEdicao(null);
  }, []);

  const handleSalvarVariante = useCallback(
    valores =>
      executar(async () => {
        if (varianteEmEdicao) {
          await updateVariante(personagem.id, varianteEmEdicao.id, valores);
        } else {
          await addVariante(personagem.id, valores);
        }
        await carregarTudo();
      }),
    [personagem.id, varianteEmEdicao, carregarTudo, executar],
  );

  const handleRemoverVariante = useCallback(
    variante =>
      executar(async () => {
        await removeVariante(personagem.id, variante.id);
        await carregarTudo();
      }),
    [personagem.id, carregarTudo, executar],
  );

  return (
    <div>
      <ArtsHeader>⚔️ Habilidades & Arts</ArtsHeader>

      <StatsGrid>
        <StatCard>
          <StatLabel>Limite de Arts</StatLabel>
          <StatValue>{limite}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Arts Ativas</StatLabel>
          <StatValue data-warning={ativas >= limite}>{ativas}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Arts Bloqueadas</StatLabel>
          <StatValue>{bloqueadas}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Variações</StatLabel>
          <StatValue>{variantes.length}</StatValue>
        </StatCard>
      </StatsGrid>

      {!carregando && (
        <>
          <NucleosSection
            nucleos={nucleos}
            arts={arts}
            onCriar={handleAbrirCriarNucleo}
            onVer={setNucleoEmVisualizacao}
            onEditar={handleAbrirEditarNucleo}
            onRemover={handleRemoverNucleo}
          />

          <ArtsSection
            arts={arts}
            nucleos={nucleos}
            condicoes={condicoes}
            onCriar={() => setCriarArtAberto(true)}
            onVer={setArtEmVisualizacao}
            onEditar={handleAbrirEditarArt}
            onRemover={handleRemoverArt}
            onToggleAtiva={handleToggleAtiva}
            onReorganizar={handleReorganizar}
          />

          <VariantesSection
            variantes={variantes}
            arts={arts}
            nucleos={nucleos}
            condicoes={condicoes}
            onCriar={handleAbrirCriarVariante}
            onVer={setVarianteEmVisualizacao}
            onEditar={handleAbrirEditarVariante}
            onRemover={handleRemoverVariante}
          />
        </>
      )}

      <NucleoFormDialog
        open={nucleoFormAberto}
        onClose={handleFecharFormNucleo}
        nucleo={nucleoEmEdicao}
        onSubmit={handleSalvarNucleo}
      />
      <NucleoViewDialog
        open={Boolean(nucleoEmVisualizacao)}
        onClose={() => setNucleoEmVisualizacao(null)}
        nucleo={nucleoEmVisualizacao}
        onEditar={() => handleAbrirEditarNucleo(nucleoEmVisualizacao)}
      />

      <CriarArtDialog
        open={criarArtAberto}
        onClose={() => setCriarArtAberto(false)}
        personagem={personagem}
        nucleos={nucleos}
        condicoes={condicoes}
        onCreate={handleCriarArt}
      />
      <ArtFormDialog
        open={Boolean(artEmEdicao)}
        onClose={() => setArtEmEdicao(null)}
        art={artEmEdicao}
        nucleos={nucleos}
        condicoes={condicoes}
        onSubmit={handleSalvarEdicaoArt}
      />
      <ArtViewDialog
        open={Boolean(artEmVisualizacao)}
        onClose={() => setArtEmVisualizacao(null)}
        art={artEmVisualizacao}
        nucleo={nucleosPorId.get(artEmVisualizacao?.nucleoId)}
        condicoes={condicoes}
        onEditar={() => handleAbrirEditarArt(artEmVisualizacao)}
      />

      <VarianteFormDialog
        open={varianteFormAberto}
        onClose={handleFecharFormVariante}
        variante={varianteEmEdicao}
        arts={arts}
        condicoes={condicoes}
        onSubmit={handleSalvarVariante}
      />
      <VarianteViewDialog
        open={Boolean(varianteEmVisualizacao)}
        onClose={() => setVarianteEmVisualizacao(null)}
        variante={varianteEmVisualizacao}
        art={artsPorId.get(varianteEmVisualizacao?.artId)}
        nucleo={nucleosPorId.get(artsPorId.get(varianteEmVisualizacao?.artId)?.nucleoId)}
        condicoes={condicoes}
        onEditar={() => handleAbrirEditarVariante(varianteEmVisualizacao)}
      />
    </div>
  );
};

ArtsTab.propTypes = {
  personagem: PropTypes.object.isRequired,
};

export default ArtsTab;
