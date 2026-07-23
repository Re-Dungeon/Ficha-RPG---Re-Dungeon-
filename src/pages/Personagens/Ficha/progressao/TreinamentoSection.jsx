import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CloseIcon from '@mui/icons-material/Close';

import {
  aplicarXpTreino,
  calcularBonusPorSorte,
  calcularObstaculoTreino,
  calcularResultadoTreino,
  calcularXpNecessario,
} from 'common/utils/formulas';
import { useSaving } from 'context/SavingContext';

import { PRIMARIOS_ICONES, PRIMARIOS_LABELS } from '../constants';
import { DialogFecharButton, DialogHeaderRow, DialogHeaderTitle, SectionTitle } from '../styles';
import {
  TreinoBarraFill,
  TreinoBarraTrack,
  TreinoBonusHint,
  TreinoBonusInput,
  TreinoBonusRow,
  TreinoBotao,
  TreinoBotaoConcluir,
  TreinoBotaoIniciar,
  TreinoCardWrapper,
  TreinoDialogSubtitulo,
  TreinoGrid,
  TreinoHeaderRow,
  TreinoNivelBadge,
  TreinoNome,
  TreinoPainel,
  TreinoPainelTexto,
  TreinoPainelTitulo,
  TreinoResultadoLabel,
  TreinoResultadoLinha,
  TreinoResultadoTitulo,
  TreinoResultadoValor,
  TreinoStatusBox,
  TreinoStatusBoxesRow,
  TreinoStatusLabel,
  TreinoStatusValor,
  TreinoStepperBtn,
  TreinoStepperLabel,
  TreinoStepperNumero,
  TreinoStepperRow,
  TreinoStepperValor,
  TreinoXpRow,
  TreinoXpTexto,
} from './styles';

const COR_NIVEL = '#4ade80';
const COR_DIFICULDADE = '#f87171';
const COR_TEMPO = '#5b7cfa';
const COR_BONUS = '#a855f7';
const COR_OURO = '#e8cb85';

const TIER_META = {
  critico: { label: 'Crítico', icone: '⚡' },
  sucesso: { label: 'Sucesso', icone: '✅' },
  quase: { label: 'Quase lá', icone: '➖' },
  falha: { label: 'Falha', icone: '❌' },
};

const TreinamentoSection = ({ personagem, onSave, sorteTotal }) => {
  const [atributoAberto, setAtributoAberto] = useState(null);
  const [horas, setHoras] = useState(1);
  const [bonusMestre, setBonusMestre] = useState(0);
  const [resultado, setResultado] = useState(null);
  const { executar } = useSaving();

  const abrirTreino = useCallback(chave => {
    setAtributoAberto(chave);
    setHoras(1);
    setBonusMestre(0);
    setResultado(null);
  }, []);

  const fechar = useCallback(() => setAtributoAberto(null), []);

  const bonusSorte = calcularBonusPorSorte(sorteTotal);

  const nivelAtual = atributoAberto ? personagem.atributosBase?.[atributoAberto] ?? 0 : 0;
  const xpAtual = atributoAberto ? personagem.treinamento?.[atributoAberto]?.xpAtual ?? 0 : 0;
  const xpNecessario = calcularXpNecessario(nivelAtual);
  const obstaculo = calcularObstaculoTreino(nivelAtual);

  const handleTreinar = useCallback(async () => {
    const chave = atributoAberto;
    const xpAtualAntes = personagem.treinamento?.[chave]?.xpAtual ?? 0;

    const resultadoTreino = calcularResultadoTreino({ nivelAtual, horas, bonusSorte, bonusMestre });
    const { nivel, xpAtual: novoXpAtual } = aplicarXpTreino(nivelAtual, xpAtualAntes, resultadoTreino.xpGanho);

    await executar(() =>
      onSave({
        treinamento: { ...personagem.treinamento, [chave]: { nivel, xpAtual: novoXpAtual } },
        atributosBase: { ...personagem.atributosBase, [chave]: nivel },
      }),
    );

    setResultado({ ...resultadoTreino, nivelAnterior: nivelAtual, nivelNovo: nivel });
  }, [atributoAberto, bonusMestre, bonusSorte, horas, nivelAtual, onSave, personagem, executar]);

  const tierMeta = resultado ? TIER_META[resultado.tier] : null;
  const rolagemBase = resultado ? resultado.rolagem - bonusSorte - bonusMestre : 0;
  const bonusAplicado = resultado ? resultado.diferenca > 0 : false;

  return (
    <div>
      <SectionTitle style={{ marginTop: 32 }}>Treinamento</SectionTitle>
      <TreinoGrid style={{ marginTop: 16 }}>
        {Object.entries(PRIMARIOS_LABELS).map(([chave, label]) => {
          const nivel = personagem.atributosBase?.[chave] ?? 0;
          const xp = personagem.treinamento?.[chave]?.xpAtual ?? 0;
          const xpNec = calcularXpNecessario(nivel);
          const percentual = Math.min(100, (xp / xpNec) * 100);

          return (
            <TreinoCardWrapper key={chave}>
              <TreinoHeaderRow>
                <TreinoNome>
                  {PRIMARIOS_ICONES[chave]} {label}
                </TreinoNome>
                <TreinoNivelBadge>Nv. {nivel}</TreinoNivelBadge>
              </TreinoHeaderRow>
              <TreinoBarraTrack>
                <TreinoBarraFill $percentual={percentual} />
              </TreinoBarraTrack>
              <TreinoXpTexto>
                {xp} / {xpNec} XP
              </TreinoXpTexto>
              <TreinoBotao type="button" onClick={() => abrirTreino(chave)}>
                Treinar
              </TreinoBotao>
            </TreinoCardWrapper>
          );
        })}
      </TreinoGrid>

      <Dialog open={Boolean(atributoAberto)} onClose={fechar} fullWidth maxWidth="xs">
        <DialogHeaderRow>
          <div>
            <DialogHeaderTitle>⚔️ Treinar Atributo</DialogHeaderTitle>
            <TreinoDialogSubtitulo>Melhore suas habilidades através do treinamento</TreinoDialogSubtitulo>
          </div>
          <DialogFecharButton type="button" aria-label="Fechar" onClick={fechar}>
            <CloseIcon fontSize="small" />
          </DialogFecharButton>
        </DialogHeaderRow>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 16 }}>
          <TextField select size="small" fullWidth value={atributoAberto ?? ''} onChange={event => abrirTreino(event.target.value)}>
            {Object.entries(PRIMARIOS_LABELS).map(([chave, label]) => (
              <MenuItem key={chave} value={chave}>
                {PRIMARIOS_ICONES[chave]} {label}
              </MenuItem>
            ))}
          </TextField>

          <TreinoPainel $cor={COR_NIVEL}>
            <TreinoPainelTitulo>Status do Atributo</TreinoPainelTitulo>
            <TreinoStatusBoxesRow>
              <TreinoStatusBox $cor={COR_NIVEL}>
                <TreinoStatusLabel>Nível</TreinoStatusLabel>
                <TreinoStatusValor $cor={COR_NIVEL}>{nivelAtual}</TreinoStatusValor>
              </TreinoStatusBox>
              <TreinoStatusBox $cor={COR_DIFICULDADE}>
                <TreinoStatusLabel>Dificuldade</TreinoStatusLabel>
                <TreinoStatusValor $cor={COR_DIFICULDADE}>{obstaculo}</TreinoStatusValor>
              </TreinoStatusBox>
            </TreinoStatusBoxesRow>
            <TreinoXpRow>
              <span>Progresso de Experiência</span>
              <span>
                {xpAtual} / {xpNecessario}
              </span>
            </TreinoXpRow>
            <TreinoBarraTrack>
              <TreinoBarraFill $percentual={Math.min(100, (xpAtual / xpNecessario) * 100)} />
            </TreinoBarraTrack>
          </TreinoPainel>

          <TreinoPainel $cor={COR_TEMPO}>
            <TreinoPainelTitulo>⏱️ Tempo de Treinamento</TreinoPainelTitulo>
            <TreinoPainelTexto>Quanto tempo você deseja treinar?</TreinoPainelTexto>
            <TreinoStepperRow>
              <TreinoStepperBtn type="button" disabled={horas <= 1} onClick={() => setHoras(Math.max(1, horas - 1))}>
                −
              </TreinoStepperBtn>
              <TreinoStepperValor>
                <TreinoStepperNumero>{horas}</TreinoStepperNumero>
                <TreinoStepperLabel>HORAS</TreinoStepperLabel>
              </TreinoStepperValor>
              <TreinoStepperBtn type="button" disabled={horas >= 12} onClick={() => setHoras(Math.min(12, horas + 1))}>
                +
              </TreinoStepperBtn>
            </TreinoStepperRow>
            <TreinoPainelTexto style={{ textAlign: 'center' }}>Mínimo: 1h | Máximo: 12h</TreinoPainelTexto>
          </TreinoPainel>

          <TreinoPainel $cor={COR_BONUS}>
            <TreinoPainelTitulo>🎯 Bônus do Mestre</TreinoPainelTitulo>
            <TreinoPainelTexto>Modificador adicional aplicado manualmente</TreinoPainelTexto>
            <TreinoBonusRow>
              <TreinoBonusInput
                type="number"
                value={bonusMestre}
                onChange={event => setBonusMestre(Math.min(20, Math.max(0, Number(event.target.value) || 0)))}
              />
              <TreinoBonusHint>(0–20)</TreinoBonusHint>
            </TreinoBonusRow>
          </TreinoPainel>

          <TreinoBotaoIniciar type="button" onClick={handleTreinar}>
            ▶ Iniciar Treinamento
          </TreinoBotaoIniciar>

          {resultado && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <TreinoResultadoTitulo>Resultado do Treinamento</TreinoResultadoTitulo>
              <TreinoResultadoLinha>
                <TreinoResultadoLabel>Rolagem 1d6 + Bônus:</TreinoResultadoLabel>
                <TreinoResultadoValor>
                  1d6: {rolagemBase} + Extra: +{bonusMestre} + Sorte: +{bonusSorte} = {resultado.rolagem}
                </TreinoResultadoValor>
              </TreinoResultadoLinha>
              <TreinoResultadoLinha $cor={bonusAplicado ? COR_NIVEL : COR_DIFICULDADE}>
                <TreinoResultadoLabel>Obstáculo:</TreinoResultadoLabel>
                <TreinoResultadoValor $cor={bonusAplicado ? COR_NIVEL : COR_DIFICULDADE}>
                  {resultado.obstaculo} ({tierMeta.icone} {tierMeta.label})
                </TreinoResultadoValor>
              </TreinoResultadoLinha>
              <TreinoResultadoLinha>
                <TreinoResultadoLabel>Dado Definido:</TreinoResultadoLabel>
                <TreinoResultadoValor>
                  {horas}x 1d{resultado.dadoXp}
                </TreinoResultadoValor>
              </TreinoResultadoLinha>
              <TreinoResultadoLinha>
                <TreinoResultadoLabel>Rolagem Final:</TreinoResultadoLabel>
                <TreinoResultadoValor>{resultado.rolagensXp.join(' + ')}</TreinoResultadoValor>
              </TreinoResultadoLinha>
              <TreinoResultadoLinha>
                <TreinoResultadoLabel>Bônus/Penalidade:</TreinoResultadoLabel>
                <TreinoResultadoValor $cor={bonusAplicado ? COR_NIVEL : undefined}>
                  {bonusAplicado ? '✅ Sucesso! (+20% XP)' : `${tierMeta.icone} Sem bônus`}
                </TreinoResultadoValor>
              </TreinoResultadoLinha>
              <TreinoResultadoLinha $cor={COR_OURO}>
                <TreinoResultadoLabel>XP Ganho:</TreinoResultadoLabel>
                <TreinoResultadoValor $cor={COR_NIVEL}>+{resultado.xpGanho} XP</TreinoResultadoValor>
              </TreinoResultadoLinha>
              {resultado.nivelNovo > resultado.nivelAnterior && (
                <TreinoResultadoLinha $cor={COR_OURO}>
                  <TreinoResultadoLabel>Nível:</TreinoResultadoLabel>
                  <TreinoResultadoValor $cor="var(--status-gold-strong)">
                    {resultado.nivelAnterior} → {resultado.nivelNovo}!
                  </TreinoResultadoValor>
                </TreinoResultadoLinha>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <TreinoBotaoConcluir type="button" onClick={fechar}>
            ✓ Concluir
          </TreinoBotaoConcluir>
        </DialogActions>
      </Dialog>
    </div>
  );
};

TreinamentoSection.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  sorteTotal: PropTypes.number.isRequired,
};

export default TreinamentoSection;
