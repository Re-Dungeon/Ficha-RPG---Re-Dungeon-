import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import {
  aplicarXpNivel,
  calcularGanhoSecundarioPorNivel,
  calcularPrimariosTotais,
  calcularSecundarios,
  calcularXpNecessarioNivel,
} from 'common/utils/formulas';
import { useSaving } from 'context/SavingContext';

import { PRIMARIOS_LABELS, SECUNDARIOS_LABELS } from '../constants';
import {
  AtributoCardWrapper,
  AttributesGrid,
  CardTitle,
  CardTotal,
  DialogFecharButton,
  DialogHeaderRow,
  DialogHeaderTitle,
  SectionTitle,
  StatusBarraFill,
  StatusBarraLabel,
  StatusBarraTrack,
  StatusValueRow,
} from '../styles';

// Sorte fica fora da lista: seu ponto (múltiplos ímpares de 5) é aplicado
// automaticamente, sem escolha do jogador — ver calcularBonusNivel.
const PRINCIPAIS_DISTRIBUIVEIS = ['forca', 'vitalidade', 'agilidade', 'inteligencia', 'percepcao'];
const SECUNDARIOS_CHAVES = Object.keys(SECUNDARIOS_LABELS);

const ZERO_PRINCIPAIS = Object.fromEntries(PRINCIPAIS_DISTRIBUIVEIS.map(chave => [chave, 0]));
const ZERO_SECUNDARIOS = Object.fromEntries(SECUNDARIOS_CHAVES.map(chave => [chave, 0]));
const HISTORICO_VAZIO = { principais: ZERO_PRINCIPAIS, secundarios: ZERO_SECUNDARIOS, sorte: 0 };

// Chaves de principais e secundários nunca colidem, então dá pra guardar as
// quantidades digitadas de ambos os grupos num só state.
const sanitizarQuantidade = valor => valor.replace(/[^0-9]/g, '');

const NivelModal = ({ open, onClose, personagem, onSave }) => {
  const [subAba, setSubAba] = useState('progresso');
  const [xpGanhoInput, setXpGanhoInput] = useState('');
  const [quantidades, setQuantidades] = useState({});
  const [resetConfirmAberto, setResetConfirmAberto] = useState(false);
  const { executar } = useSaving();

  const handleQuantidadeChange = useCallback((chave, valor) => {
    setQuantidades(current => ({ ...current, [chave]: sanitizarQuantidade(valor) }));
  }, []);

  // `historico` guarda só o que veio do sistema de Nível (separado de edições
  // manuais dos mesmos campos em atributosBonus/secundariosBonus feitas na aba
  // Atributos) — é o que "Resetar Nível" precisa pra saber quanto descontar.
  const nivelInfo = useMemo(() => {
    const bruto = personagem.nivel ?? {};
    return {
      atual: 0,
      xpAtual: 0,
      pontosPrincipaisDisponiveis: 0,
      pontosSecundariosDisponiveis: 0,
      ...bruto,
      historico: {
        principais: { ...ZERO_PRINCIPAIS, ...bruto.historico?.principais },
        secundarios: { ...ZERO_SECUNDARIOS, ...bruto.historico?.secundarios },
        sorte: bruto.historico?.sorte ?? 0,
      },
    };
  }, [personagem.nivel]);

  const xpNecessario = calcularXpNecessarioNivel(nivelInfo.atual);
  const percentualXp = Math.min(100, Math.round((nivelInfo.xpAtual / xpNecessario) * 100));
  const xpFaltante = Math.max(0, xpNecessario - nivelInfo.xpAtual);

  const primariosTotais = useMemo(
    () =>
      calcularPrimariosTotais(personagem.atributosBase, personagem.atributosExtra, personagem.atributosBonus),
    [personagem.atributosBase, personagem.atributosExtra, personagem.atributosBonus],
  );

  const secundariosTotais = useMemo(
    () =>
      calcularSecundarios(
        primariosTotais,
        personagem.secundariosBase,
        personagem.secundariosExtra,
        personagem.secundariosBonus,
      ),
    [primariosTotais, personagem.secundariosBase, personagem.secundariosExtra, personagem.secundariosBonus],
  );

  const handleAdicionarXp = useCallback(() => {
    const ganho = Number(xpGanhoInput) || 0;
    if (ganho <= 0) {
      return undefined;
    }
    return executar(async () => {
      const resultado = aplicarXpNivel(nivelInfo.atual, nivelInfo.xpAtual, ganho);
      const patch = {
        nivel: {
          ...nivelInfo,
          atual: resultado.nivel,
          xpAtual: resultado.xpAtual,
          pontosPrincipaisDisponiveis:
            nivelInfo.pontosPrincipaisDisponiveis + resultado.pontosPrincipaisGanhos,
          pontosSecundariosDisponiveis:
            nivelInfo.pontosSecundariosDisponiveis + resultado.pontosSecundariosGanhos,
          historico: {
            ...nivelInfo.historico,
            sorte: nivelInfo.historico.sorte + resultado.pontosSorteGanhos,
          },
        },
      };
      if (resultado.pontosSorteGanhos > 0) {
        patch.atributosBonus = {
          ...personagem.atributosBonus,
          sorte: (personagem.atributosBonus?.sorte ?? 0) + resultado.pontosSorteGanhos,
        };
      }
      await onSave(patch);
      setXpGanhoInput('');
    });
  }, [xpGanhoInput, nivelInfo, onSave, personagem.atributosBonus, executar]);

  const handleGastarPrincipal = useCallback(
    chave => {
      const quantidade = Math.min(
        nivelInfo.pontosPrincipaisDisponiveis,
        Math.max(1, Number(quantidades[chave]) || 1),
      );
      if (quantidade <= 0) {
        return undefined;
      }
      return executar(() =>
        onSave({
          atributosBonus: {
            ...personagem.atributosBonus,
            [chave]: (personagem.atributosBonus?.[chave] ?? 0) + quantidade,
          },
          nivel: {
            ...nivelInfo,
            pontosPrincipaisDisponiveis: nivelInfo.pontosPrincipaisDisponiveis - quantidade,
            historico: {
              ...nivelInfo.historico,
              principais: {
                ...nivelInfo.historico.principais,
                [chave]: nivelInfo.historico.principais[chave] + quantidade,
              },
            },
          },
        }),
      ).then(() => setQuantidades(current => ({ ...current, [chave]: '' })));
    },
    [nivelInfo, onSave, personagem.atributosBonus, quantidades, executar],
  );

  const handleGastarSecundario = useCallback(
    chave => {
      const quantidade = Math.min(
        nivelInfo.pontosSecundariosDisponiveis,
        Math.max(1, Number(quantidades[chave]) || 1),
      );
      if (quantidade <= 0) {
        return undefined;
      }
      // Prontidão vale 5 por ponto investido; os outros secundários valem 1
      // (calcularGanhoSecundarioPorNivel) — a quantidade descontada do pool
      // continua sendo o número de pontos, não o ganho já multiplicado.
      const ganho = calcularGanhoSecundarioPorNivel(chave, quantidade);
      return executar(() =>
        onSave({
          secundariosBonus: {
            ...personagem.secundariosBonus,
            [chave]: (personagem.secundariosBonus?.[chave] ?? 0) + ganho,
          },
          nivel: {
            ...nivelInfo,
            pontosSecundariosDisponiveis: nivelInfo.pontosSecundariosDisponiveis - quantidade,
            historico: {
              ...nivelInfo.historico,
              secundarios: {
                ...nivelInfo.historico.secundarios,
                [chave]: nivelInfo.historico.secundarios[chave] + ganho,
              },
            },
          },
        }),
      ).then(() => setQuantidades(current => ({ ...current, [chave]: '' })));
    },
    [nivelInfo, onSave, personagem.secundariosBonus, quantidades, executar],
  );

  const handleResetarNivel = useCallback(() => {
    return executar(async () => {
      const atributosBonus = { ...personagem.atributosBonus };
      PRINCIPAIS_DISTRIBUIVEIS.forEach(chave => {
        atributosBonus[chave] = (atributosBonus[chave] ?? 0) - nivelInfo.historico.principais[chave];
      });
      atributosBonus.sorte = (atributosBonus.sorte ?? 0) - nivelInfo.historico.sorte;

      const secundariosBonus = { ...personagem.secundariosBonus };
      SECUNDARIOS_CHAVES.forEach(chave => {
        secundariosBonus[chave] = (secundariosBonus[chave] ?? 0) - nivelInfo.historico.secundarios[chave];
      });

      await onSave({
        atributosBonus,
        secundariosBonus,
        nivel: {
          atual: 0,
          xpAtual: 0,
          pontosPrincipaisDisponiveis: 0,
          pontosSecundariosDisponiveis: 0,
          historico: HISTORICO_VAZIO,
        },
      });
      setResetConfirmAberto(false);
    });
  }, [nivelInfo, onSave, personagem.atributosBonus, personagem.secundariosBonus, executar]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogHeaderRow>
        <DialogHeaderTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUpIcon fontSize="small" /> Nível
        </DialogHeaderTitle>
        <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </DialogFecharButton>
      </DialogHeaderRow>
      <Tabs
        value={subAba}
        onChange={(_event, novaSubAba) => setSubAba(novaSubAba)}
        textColor="inherit"
        variant="fullWidth"
      >
        <Tab value="progresso" label="Progresso" />
        <Tab value="atributos" label="Atributos" />
      </Tabs>
      <DialogContent>
        {subAba === 'progresso' && (
          <div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <AtributoCardWrapper style={{ minWidth: 160 }}>
                <CardTitle>Nível Atual</CardTitle>
                <CardTotal>{nivelInfo.atual}</CardTotal>
              </AtributoCardWrapper>
            </div>

            <SectionTitle style={{ marginTop: 24, fontSize: '0.9rem' }}>Experiência</SectionTitle>
            <StatusBarraTrack style={{ marginTop: 8 }}>
              <StatusBarraFill $variante="nivel" $percentual={percentualXp} />
              <StatusBarraLabel>
                {nivelInfo.xpAtual} / {xpNecessario} XP
              </StatusBarraLabel>
            </StatusBarraTrack>
            <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
              Faltam {xpFaltante} XP para o nível {nivelInfo.atual + 1}.
            </StatusValueRow>

            <div
              style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}
            >
              <TextField
                type="number"
                label="XP ganho"
                size="small"
                value={xpGanhoInput}
                onChange={event => setXpGanhoInput(event.target.value)}
                slotProps={{ htmlInput: { min: 0 } }}
                sx={{ maxWidth: 160 }}
              />
              <Button variant="contained" onClick={handleAdicionarXp}>
                Adicionar XP
              </Button>
            </div>

            {(nivelInfo.pontosPrincipaisDisponiveis > 0 || nivelInfo.pontosSecundariosDisponiveis > 0) && (
              <StatusValueRow style={{ display: 'block', marginTop: 20, color: 'var(--color-accent)' }}>
                Você tem {nivelInfo.pontosPrincipaisDisponiveis} ponto(s) principal(is)
                {nivelInfo.pontosSecundariosDisponiveis > 0 &&
                  ` e ${nivelInfo.pontosSecundariosDisponiveis} ponto(s) secundário(s)`}{' '}
                pra distribuir na aba Atributos.
              </StatusValueRow>
            )}

            <div
              style={{
                marginTop: 32,
                paddingTop: 16,
                borderTop: '1px solid var(--border-primary)',
              }}
            >
              <Button
                color="error"
                variant="outlined"
                startIcon={<RestartAltIcon fontSize="small" />}
                onClick={() => setResetConfirmAberto(true)}
              >
                Resetar Nível
              </Button>
            </div>
          </div>
        )}

        {subAba === 'atributos' && (
          <div>
            <SectionTitle style={{ fontSize: '0.9rem' }}>
              Atributos Principais
              {nivelInfo.pontosPrincipaisDisponiveis > 0 && (
                <span style={{ color: 'var(--color-accent)', fontSize: '0.8rem' }}>
                  {nivelInfo.pontosPrincipaisDisponiveis} ponto(s) disponível(is)
                </span>
              )}
            </SectionTitle>
            <AttributesGrid style={{ marginTop: 12 }}>
              {PRINCIPAIS_DISTRIBUIVEIS.map(chave => (
                <AtributoCardWrapper key={chave}>
                  <CardTitle>{PRIMARIOS_LABELS[chave]}</CardTitle>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <CardTotal>{primariosTotais[chave]}</CardTotal>
                    {nivelInfo.pontosPrincipaisDisponiveis > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <TextField
                          size="small"
                          value={quantidades[chave] ?? ''}
                          onChange={event => handleQuantidadeChange(chave, event.target.value)}
                          placeholder="1"
                          inputMode="numeric"
                          sx={{ width: 48 }}
                          slotProps={{ htmlInput: { style: { textAlign: 'center', padding: '6px 4px' } } }}
                        />
                        <Tooltip title={`Adicionar em ${PRIMARIOS_LABELS[chave]}`}>
                          <IconButton
                            size="small"
                            onClick={() => handleGastarPrincipal(chave)}
                            aria-label={`Adicionar pontos em ${PRIMARIOS_LABELS[chave]}`}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </AtributoCardWrapper>
              ))}
              <AtributoCardWrapper>
                <CardTitle>{PRIMARIOS_LABELS.sorte}</CardTitle>
                <CardTotal>{primariosTotais.sorte}</CardTotal>
              </AtributoCardWrapper>
            </AttributesGrid>

            <SectionTitle style={{ marginTop: 32, fontSize: '0.9rem' }}>
              Atributos Secundários
              {nivelInfo.pontosSecundariosDisponiveis > 0 && (
                <span style={{ color: 'var(--color-accent)', fontSize: '0.8rem' }}>
                  {nivelInfo.pontosSecundariosDisponiveis} ponto(s) disponível(is)
                </span>
              )}
            </SectionTitle>
            <AttributesGrid style={{ marginTop: 12 }}>
              {SECUNDARIOS_CHAVES.map(chave => (
                <AtributoCardWrapper key={chave}>
                  <CardTitle>{SECUNDARIOS_LABELS[chave]}</CardTitle>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <CardTotal>{secundariosTotais[chave]}</CardTotal>
                    {nivelInfo.pontosSecundariosDisponiveis > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <TextField
                          size="small"
                          value={quantidades[chave] ?? ''}
                          onChange={event => handleQuantidadeChange(chave, event.target.value)}
                          placeholder="1"
                          inputMode="numeric"
                          sx={{ width: 48 }}
                          slotProps={{ htmlInput: { style: { textAlign: 'center', padding: '6px 4px' } } }}
                        />
                        <Tooltip title={`Adicionar em ${SECUNDARIOS_LABELS[chave]}`}>
                          <IconButton
                            size="small"
                            onClick={() => handleGastarSecundario(chave)}
                            aria-label={`Adicionar pontos em ${SECUNDARIOS_LABELS[chave]}`}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </AtributoCardWrapper>
              ))}
            </AttributesGrid>
          </div>
        )}
      </DialogContent>

      <Dialog open={resetConfirmAberto} onClose={() => setResetConfirmAberto(false)}>
        <DialogTitle>Resetar Nível</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Isso vai zerar o nível e o XP do personagem, e remover todos os pontos de atributo
            (principais, secundários e Sorte) ganhos através do sistema de Nível. Bônus adicionados
            manualmente na aba Atributos não são afetados. Essa ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetConfirmAberto(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleResetarNivel}>
            Resetar
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

NivelModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default NivelModal;
