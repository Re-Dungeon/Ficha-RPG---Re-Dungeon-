import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import {
  getAptidoesAdquiridas,
  getAptidoesPorUniverso,
  removeAptidaoAdquirida,
  setAptidaoAdquirida,
} from 'service/storage';
import {
  calcularMaximoAptidoes,
  calcularPrimariosTotais,
  calcularProximoAptidaoEm,
} from 'common/utils/formulas';
import { getNome } from 'common/utils/resolveNome';

import AjusteGanhasDialog from '../aptidoes/AjusteGanhasDialog';
import GerenciarAptidoesDialog from '../aptidoes/GerenciarAptidoesDialog';
import AptidaoRow from '../aptidoes/AptidaoRow';
import {
  COR_GANHAR,
  COR_GERENCIAR,
  COR_REMOVER,
  AcoesRow,
  ColunaCard,
  ColunasRow,
  ColunaTitulo,
  StatBar,
  StatCard,
  StatLabel,
  StatValor,
  TabelaBody,
  TabelaHeaderRow,
  VantagemCard,
  VantagemHeader,
  VantagemTexto,
  VantagemTitulo,
  VantagensGrid,
} from '../aptidoes/styles';
import { SectionTitle, StatusValueRow } from '../styles';

const AptidoesTab = ({ personagem, onSave }) => {
  const [catalogo, setCatalogo] = useState([]);
  const [adquiridas, setAdquiridas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [dialogGanhar, setDialogGanhar] = useState(false);
  const [dialogRemover, setDialogRemover] = useState(false);
  const [dialogGerenciar, setDialogGerenciar] = useState(false);
  const [ganhas, setGanhas] = useState(personagem.aptidoesGanhas ?? 0);
  const [erro, setErro] = useState(null);

  // Espelha o valor otimista com o que vem do personagem (ex.: troca de personagem
  // ou o próprio onSave confirmando o mesmo valor já aplicado localmente).
  useEffect(() => {
    setGanhas(personagem.aptidoesGanhas ?? 0);
  }, [personagem.id, personagem.aptidoesGanhas]);

  const primariosTotais = useMemo(
    () =>
      calcularPrimariosTotais(
        personagem.atributosBase,
        personagem.atributosExtra,
        personagem.atributosBonus,
      ),
    [personagem.atributosBase, personagem.atributosExtra, personagem.atributosBonus],
  );

  const maximo = calcularMaximoAptidoes(primariosTotais, ganhas);
  const proximoEm = calcularProximoAptidaoEm(primariosTotais);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      personagem.universo
        ? getAptidoesPorUniverso(personagem.universo)
        : Promise.resolve([]),
      getAptidoesAdquiridas(personagem.id),
    ])
      .then(([catalogoItens, adquiridasItens]) => {
        if (isMounted) {
          setCatalogo(catalogoItens);
          setAdquiridas(adquiridasItens);
          setCarregando(false);
        }
      })
      .catch(erroCarregamento => {
        if (isMounted) {
          // eslint-disable-next-line no-console
          console.error('Falha ao carregar aptidões:', erroCarregamento);
          setCarregando(false);
          setErro('Não foi possível carregar as aptidões. Tente novamente.');
        }
      });
    return () => {
      isMounted = false;
    };
  }, [personagem.id, personagem.universo]);

  // Atualiza a UI na hora (otimista) e só dispara a escrita no Firestore em segundo
  // plano — sem overlay bloqueante. Se a escrita falhar, desfaz o estado local e avisa.
  const handleAjustarGanhas = useCallback(
    delta => {
      const anterior = ganhas;
      const proximo = Math.max(0, anterior + delta);
      setGanhas(proximo);
      setErro(null);
      onSave({ aptidoesGanhas: proximo }).catch(() => {
        setGanhas(anterior);
        setErro('Não foi possível salvar a alteração. Tente novamente.');
      });
    },
    [ganhas, onSave],
  );

  const handleAdquirir = useCallback(
    aptidaoIds => {
      setAdquiridas(prev => [...prev, ...aptidaoIds.map(id => ({ id, nivel: 1 }))]);
      setErro(null);
      Promise.all(aptidaoIds.map(id => setAptidaoAdquirida(personagem.id, id, 1))).catch(() => {
        setAdquiridas(prev => prev.filter(item => !aptidaoIds.includes(item.id)));
        setErro('Não foi possível salvar a alteração. Tente novamente.');
      });
    },
    [personagem.id],
  );

  const handleUpgrade = useCallback(
    (aptidaoId, nivelAtual, nivelMaximo, atualTotal, maximoTotal) => {
      if (nivelAtual >= nivelMaximo || atualTotal >= maximoTotal) {
        return;
      }
      const novoNivel = nivelAtual + 1;
      setAdquiridas(prev =>
        prev.map(item => (item.id === aptidaoId ? { ...item, nivel: novoNivel } : item)),
      );
      setErro(null);
      setAptidaoAdquirida(personagem.id, aptidaoId, novoNivel).catch(() => {
        setAdquiridas(prev =>
          prev.map(item => (item.id === aptidaoId ? { ...item, nivel: nivelAtual } : item)),
        );
        setErro('Não foi possível salvar a alteração. Tente novamente.');
      });
    },
    [personagem.id],
  );

  const handleReset = useCallback(
    (aptidaoId, nivelAtual) => {
      setAdquiridas(prev =>
        prev.map(item => (item.id === aptidaoId ? { ...item, nivel: 0 } : item)),
      );
      setErro(null);
      setAptidaoAdquirida(personagem.id, aptidaoId, 0).catch(() => {
        setAdquiridas(prev =>
          prev.map(item => (item.id === aptidaoId ? { ...item, nivel: nivelAtual } : item)),
        );
        setErro('Não foi possível salvar a alteração. Tente novamente.');
      });
    },
    [personagem.id],
  );

  const handleRemover = useCallback(
    aptidaoId => {
      let removida = null;
      setAdquiridas(prev => {
        removida = prev.find(item => item.id === aptidaoId) ?? null;
        return prev.filter(item => item.id !== aptidaoId);
      });
      setErro(null);
      removeAptidaoAdquirida(personagem.id, aptidaoId).catch(() => {
        setAdquiridas(prev => (removida ? [...prev, removida] : prev));
        setErro('Não foi possível salvar a alteração. Tente novamente.');
      });
    },
    [personagem.id],
  );

  const atual = adquiridas.reduce((soma, item) => soma + (item.nivel ?? 0), 0);
  const idsAdquiridos = adquiridas.map(item => item.id);
  const disponiveisParaEscolher = Math.max(0, maximo - atual);

  // Por nível desbloqueado (nivel <= nivelAtual): possuiBonus true vira um card de
  // vantagem narrativa; possuiBonus false soma +1 ao contador de Bônus da linha.
  const linhasAdquiridas = useMemo(
    () =>
      adquiridas.map(item => {
        const aptidao = catalogo.find(cat => cat.id === item.id);
        const nivelAtual = item.nivel ?? 0;
        const niveisDesbloqueados = (aptidao?.progressaoNiveis ?? []).filter(
          nivelInfo => nivelInfo.nivel <= nivelAtual,
        );
        const bonus = niveisDesbloqueados.filter(
          nivelInfo => !nivelInfo.possuiBonus,
        ).length;
        const vantagens = niveisDesbloqueados
          .filter(nivelInfo => nivelInfo.possuiBonus)
          .map(nivelInfo => ({
            aptidaoId: item.id,
            aptidaoNome: getNome(aptidao) || 'Aptidão',
            nivel: nivelInfo.nivel,
            descricao: nivelInfo.bonus?.descricaoCompleta ?? '',
          }));

        return {
          id: item.id,
          nome: getNome(aptidao) || 'Aptidão',
          nivel: nivelAtual,
          nivelMaximo: aptidao?.nivelMaximo ?? 1,
          bonus,
          vantagens,
        };
      }),
    [adquiridas, catalogo],
  );

  const vantagensDesbloqueadas = useMemo(
    () => linhasAdquiridas.flatMap(linha => linha.vantagens),
    [linhasAdquiridas],
  );

  return (
    <div>
      <SectionTitle>Aptidões</SectionTitle>

      <StatBar style={{ marginTop: 16 }}>
        <StatCard>
          <StatLabel>Atual</StatLabel>
          <StatValor>{atual}</StatValor>
        </StatCard>
        <StatCard>
          <StatLabel>Ganhas</StatLabel>
          <StatValor>{ganhas}</StatValor>
        </StatCard>
        <StatCard>
          <StatLabel>Máximo</StatLabel>
          <StatValor>{maximo}</StatValor>
        </StatCard>
        <StatCard>
          <StatLabel>Atributo p/+1</StatLabel>
          <StatValor>{proximoEm}</StatValor>
        </StatCard>
      </StatBar>

      <AcoesRow style={{ marginTop: 20 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={() => setDialogGanhar(true)}
          sx={{
            flex: 1,
            minWidth: 200,
            border: `1px solid ${COR_GANHAR}`,
            color: COR_GANHAR,
            background: 'rgba(74, 222, 128, 0.1)',
            '&:hover': { background: 'rgba(74, 222, 128, 0.18)' },
          }}
        >
          Ganhar Aptidão
        </Button>
        <Button
          disabled={!personagem.universo || disponiveisParaEscolher === 0}
          onClick={() => setDialogGerenciar(true)}
          sx={{
            flex: 1,
            minWidth: 200,
            background: COR_GERENCIAR,
            color: '#1c1830',
            '&:hover': { background: COR_GERENCIAR, filter: 'brightness(1.08)' },
            '&.Mui-disabled': {
              background: 'rgba(249, 115, 22, 0.25)',
              color: 'rgba(28, 24, 48, 0.5)',
            },
          }}
        >
          Gerenciar Aptidões
        </Button>
        <Button
          startIcon={<RemoveIcon />}
          disabled={ganhas === 0}
          onClick={() => setDialogRemover(true)}
          sx={{
            flex: 1,
            minWidth: 200,
            border: `1px solid ${COR_REMOVER}`,
            color: COR_REMOVER,
            background: 'rgba(248, 113, 113, 0.1)',
            '&:hover': { background: 'rgba(248, 113, 113, 0.18)' },
          }}
        >
          Remover Aptidão
        </Button>
      </AcoesRow>

      {!personagem.universo && (
        <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
          Selecione um Universo no menu lateral Info para gerenciar aptidões.
        </StatusValueRow>
      )}

      {erro && (
        <StatusValueRow style={{ display: 'block', marginTop: 8, color: '#f87171' }}>
          {erro}
        </StatusValueRow>
      )}

      <ColunasRow style={{ marginTop: 32 }}>
        <ColunaCard>
          <ColunaTitulo>Aptidões Adquiridas</ColunaTitulo>
          {!carregando && linhasAdquiridas.length === 0 && (
            <StatusValueRow>Nenhuma aptidão adquirida ainda.</StatusValueRow>
          )}
          {linhasAdquiridas.length > 0 && (
            <>
              <TabelaHeaderRow>
                <span>Aptidão</span>
                <span>Nível</span>
                <span>Bônus</span>
                <span>Ações</span>
              </TabelaHeaderRow>
              <TabelaBody>
                {linhasAdquiridas.map(linha => (
                  <AptidaoRow
                    key={linha.id}
                    nome={linha.nome}
                    nivel={linha.nivel}
                    nivelMaximo={linha.nivelMaximo}
                    bonus={linha.bonus}
                    limiteAtingido={atual >= maximo}
                    onUpgrade={() =>
                      handleUpgrade(
                        linha.id,
                        linha.nivel,
                        linha.nivelMaximo,
                        atual,
                        maximo,
                      )
                    }
                    onReset={() => handleReset(linha.id, linha.nivel)}
                    onRemover={() => handleRemover(linha.id)}
                  />
                ))}
              </TabelaBody>
            </>
          )}
        </ColunaCard>

        <ColunaCard>
          <ColunaTitulo>Vantagens Desbloqueadas</ColunaTitulo>
          {vantagensDesbloqueadas.length === 0 ? (
            <StatusValueRow>Nenhuma vantagem desbloqueada ainda.</StatusValueRow>
          ) : (
            <VantagensGrid>
              {vantagensDesbloqueadas.map(vantagem => (
                <VantagemCard key={`${vantagem.aptidaoId}-${vantagem.nivel}`}>
                  <VantagemHeader>
                    <VantagemTitulo>
                      <AutoAwesomeIcon fontSize="inherit" />
                      {vantagem.aptidaoNome} - Nível {vantagem.nivel}
                    </VantagemTitulo>
                  </VantagemHeader>
                  <VantagemTexto>{vantagem.descricao}</VantagemTexto>
                </VantagemCard>
              ))}
            </VantagensGrid>
          )}
        </ColunaCard>
      </ColunasRow>

      <AjusteGanhasDialog
        open={dialogGanhar}
        titulo="Quantas aptidões deseja ganhar?"
        onClose={() => setDialogGanhar(false)}
        onConfirm={quantidade => {
          handleAjustarGanhas(quantidade);
          setDialogGanhar(false);
        }}
      />
      <AjusteGanhasDialog
        open={dialogRemover}
        titulo="Quantas aptidões deseja remover?"
        onClose={() => setDialogRemover(false)}
        onConfirm={quantidade => {
          handleAjustarGanhas(-quantidade);
          setDialogRemover(false);
        }}
      />
      <GerenciarAptidoesDialog
        open={dialogGerenciar}
        onClose={() => setDialogGerenciar(false)}
        catalogo={catalogo}
        idsAdquiridos={idsAdquiridos}
        limite={disponiveisParaEscolher}
        atual={atual}
        ganhas={ganhas}
        maximo={maximo}
        proximoEm={proximoEm}
        onConfirm={ids => {
          handleAdquirir(ids);
          setDialogGerenciar(false);
        }}
      />
    </div>
  );
};

AptidoesTab.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AptidoesTab;
