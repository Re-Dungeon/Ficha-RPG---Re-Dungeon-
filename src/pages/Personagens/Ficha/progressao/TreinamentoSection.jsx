import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';

import {
  aplicarXpTreino,
  calcularBonusPorSorte,
  calcularResultadoTreino,
  calcularXpNecessario,
} from 'common/utils/formulas';
import { useSaving } from 'context/SavingContext';

import { PRIMARIOS_LABELS } from '../constants';
import { AttributesGrid, AtributoCardWrapper, CardTitle, CardTotal, SectionTitle, StatusValueRow } from '../styles';

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

  const handleTreinar = useCallback(async () => {
    const chave = atributoAberto;
    const nivelAtual = personagem.treinamento?.[chave]?.nivel ?? personagem.atributosBase?.[chave] ?? 0;
    const xpAtualAntes = personagem.treinamento?.[chave]?.xpAtual ?? 0;
    const bonusSorte = calcularBonusPorSorte(sorteTotal);

    const resultadoTreino = calcularResultadoTreino({ nivelAtual, horas, bonusSorte, bonusMestre });
    const { nivel, xpAtual } = aplicarXpTreino(nivelAtual, xpAtualAntes, resultadoTreino.xpGanho);

    await executar(() =>
      onSave({
        treinamento: { ...personagem.treinamento, [chave]: { nivel, xpAtual } },
        atributosBase: { ...personagem.atributosBase, [chave]: nivel },
      }),
    );

    setResultado({ ...resultadoTreino, nivelAnterior: nivelAtual, nivelNovo: nivel });
  }, [atributoAberto, bonusMestre, horas, onSave, personagem, sorteTotal, executar]);

  return (
    <div>
      <SectionTitle style={{ marginTop: 32 }}>Treinamento</SectionTitle>
      <AttributesGrid style={{ marginTop: 16 }}>
        {Object.entries(PRIMARIOS_LABELS).map(([chave, label]) => {
          const nivelAtual =
            personagem.treinamento?.[chave]?.nivel ?? personagem.atributosBase?.[chave] ?? 0;
          const xpAtual = personagem.treinamento?.[chave]?.xpAtual ?? 0;
          const xpNecessario = calcularXpNecessario(nivelAtual);

          return (
            <AtributoCardWrapper key={chave}>
              <CardTitle>{label}</CardTitle>
              <CardTotal>{nivelAtual}</CardTotal>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (xpAtual / xpNecessario) * 100)}
                sx={{ height: 6, borderRadius: 4 }}
              />
              <StatusValueRow>
                {xpAtual} / {xpNecessario} XP
              </StatusValueRow>
              <Button size="small" variant="outlined" onClick={() => abrirTreino(chave)}>
                Treinar
              </Button>
            </AtributoCardWrapper>
          );
        })}
      </AttributesGrid>

      <Dialog open={Boolean(atributoAberto)} onClose={fechar} fullWidth maxWidth="xs">
        <DialogTitle>Treinar {atributoAberto && PRIMARIOS_LABELS[atributoAberto]}</DialogTitle>
        <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
          <TextField
            type="number"
            label="Horas de treinamento (1-12)"
            size="small"
            value={horas}
            onChange={event => setHoras(Math.min(12, Math.max(1, Number(event.target.value) || 1)))}
          />
          <TextField
            type="number"
            label="Bônus do Mestre (0-20)"
            size="small"
            value={bonusMestre}
            onChange={event =>
              setBonusMestre(Math.min(20, Math.max(0, Number(event.target.value) || 0)))
            }
          />
          {resultado && (
            <div style={{ border: '1px solid var(--border-primary)', borderRadius: 8, padding: 12 }}>
              <StatusValueRow style={{ display: 'block' }}>
                Resultado: <strong>{resultado.tier}</strong> (rolagem {resultado.rolagem} vs
                obstáculo {resultado.obstaculo})
              </StatusValueRow>
              <StatusValueRow style={{ display: 'block' }}>
                XP ganho: +{resultado.xpGanho}
              </StatusValueRow>
              {resultado.nivelNovo > resultado.nivelAnterior && (
                <StatusValueRow style={{ display: 'block', color: 'var(--color-accent)' }}>
                  Subiu de {resultado.nivelAnterior} para {resultado.nivelNovo}!
                </StatusValueRow>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={fechar}>Fechar</Button>
          <Button variant="contained" onClick={handleTreinar}>
            Iniciar Treinamento
          </Button>
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
