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
import {
  calcularBonusCultivoTotal,
  calcularLimiteArts,
  calcularPrimariosTotais,
  reorganizarArts,
} from 'common/utils/formulas';
import { useSaving } from 'context/SavingContext';
import { getNome } from 'common/utils/resolveNome';
import useConfirmacao from 'components/ConfirmDialog/useConfirmacao';

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
import {
  ArtsHeader,
  ManualLimitButton,
  ManualLimitControls,
  StatCard,
  StatLabel,
  StatsGrid,
  StatValue,
} from '../arts/styles';

const plural = (quantidade, um, varios) => `${quantidade} ${quantidade === 1 ? um : varios}`;

// O que some junto ao excluir (aparece no diálogo de confirmação).
const consequenciasDaArt = (art, variantes) => {
  const total = variantes.filter(variante => variante.artId === art.id).length;
  return total ? [plural(total, 'Variante desta Art', 'Variantes desta Art')] : [];
};

const consequenciasDoNucleo = (nucleo, arts, variantes) => {
  const artsDoNucleo = arts.filter(art => art.nucleoId === nucleo.id);
  const ids = new Set(artsDoNucleo.map(art => art.id));
  const totalVariantes = variantes.filter(variante => ids.has(variante.artId)).length;
  return [
    artsDoNucleo.length ? plural(artsDoNucleo.length, 'Art deste Núcleo', 'Arts deste Núcleo') : null,
    totalVariantes ? plural(totalVariantes, 'Variante dessas Arts', 'Variantes dessas Arts') : null,
  ].filter(Boolean);
};

const ArtsTab = ({ personagem, onSave }) => {
  const [nucleos, setNucleos] = useState([]);
  const [arts, setArts] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [condicoes, setCondicoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { executar } = useSaving();
  const [confirmar, dialogoConfirmacao] = useConfirmacao();

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
  }, [carregarTudo, personagem]);

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

  const bonusCultivoTotal = useMemo(
    () => calcularBonusCultivoTotal(personagem.cultivoBonus ?? {}),
    [personagem.cultivoBonus],
  );
  const primariosTotais = useMemo(
    () =>
      calcularPrimariosTotais(
        personagem.atributosBase,
        personagem.atributosExtra,
        personagem.atributosBonus,
        bonusCultivoTotal.primarios,
      ),
    [bonusCultivoTotal.primarios, personagem.atributosBase, personagem.atributosBonus, personagem.atributosExtra],
  );
  const limiteCalculado = useMemo(
    () => calcularLimiteArts(primariosTotais),
    [primariosTotais],
  );
  const limiteAdicional = useMemo(
    () => Math.max(0, Number(personagem.artsLimiteAdicional ?? 0) || 0),
    [personagem.artsLimiteAdicional],
  );
  const limite = limiteCalculado + limiteAdicional;
  const ativas = arts.filter(art => art.ativa).length;
  const bloqueadas = arts.length - ativas;

  const handleAjustarLimiteManual = useCallback(
    delta => {
      if (!onSave) {
        return;
      }
      const proximo = Math.max(0, limiteAdicional + delta);
      if (proximo === limiteAdicional) {
        return;
      }
      onSave({ artsLimiteAdicional: proximo });
    },
    [limiteAdicional, onSave],
  );

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
    async nucleo => {
      if (!(await confirmar({
        titulo: `Excluir o Núcleo "${getNome(nucleo)}"?`,
        consequencias: consequenciasDoNucleo(nucleo, arts, variantes),
      }))) return undefined;
      return executar(async () => {
          const artsDoNucleo = arts.filter(art => art.nucleoId === nucleo.id);
          const idsArtsDoNucleo = new Set(artsDoNucleo.map(art => art.id));
          const variantesAfetadas = variantes.filter(variante => idsArtsDoNucleo.has(variante.artId));
  
          await Promise.all(variantesAfetadas.map(variante => removeVariante(personagem.id, variante.id)));
          await Promise.all(artsDoNucleo.map(art => removeArt(personagem.id, art.id)));
          await removeNucleo(personagem.id, nucleo.id);
          await carregarTudo();
        });
    },
    [personagem.id, arts, variantes, carregarTudo, executar, confirmar],
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
    async art => {
      if (!(await confirmar({
        titulo: `Excluir a Art "${getNome(art)}"?`,
        consequencias: consequenciasDaArt(art, variantes),
      }))) return undefined;
      return executar(async () => {
          const variantesDaArt = variantes.filter(variante => variante.artId === art.id);
          await Promise.all(variantesDaArt.map(variante => removeVariante(personagem.id, variante.id)));
          await removeArt(personagem.id, art.id);
          await carregarTudo();
        });
    },
    [personagem.id, variantes, carregarTudo, executar, confirmar],
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
    async variante => {
      if (!(await confirmar({ titulo: `Excluir a Variante "${getNome(variante)}"?` }))) return undefined;
      return executar(async () => {
          await removeVariante(personagem.id, variante.id);
          await carregarTudo();
        });
    },
    [personagem.id, carregarTudo, executar, confirmar],
  );

  return (
    <div>
      {dialogoConfirmacao}
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

      <ManualLimitControls>
        <ManualLimitButton type="button" $variant="adicionar" onClick={() => handleAjustarLimiteManual(1)}>
          + ADICIONAR LIMITE
        </ManualLimitButton>
        <ManualLimitButton
          type="button"
          $variant="remover"
          onClick={() => handleAjustarLimiteManual(-1)}
          disabled={limiteAdicional === 0}
        >
          − REMOVER LIMITE
        </ManualLimitButton>
      </ManualLimitControls>

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
        personagem={personagem}
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
  onSave: PropTypes.func,
};

export default ArtsTab;
