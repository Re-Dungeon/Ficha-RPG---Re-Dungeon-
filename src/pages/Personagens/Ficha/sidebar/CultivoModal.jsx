import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import BoltIcon from '@mui/icons-material/Bolt';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';

import { getFirestoreItem, getReinosCultivo } from 'service/storage';
import {
  aplicarFalhaTribulacao,
  aplicarXpCultivo,
  calcularProgressoCultivo,
  ordenarReinosCultivo,
} from 'common/utils/formulas';
import { getNome } from 'common/utils/resolveNome';
import { useSaving } from 'context/SavingContext';

import { CULTIVO_UNIVERSO_ID } from '../cultivo/constants';
import {
  DialogFecharButton,
  DialogHeaderRow,
  DialogHeaderTitle,
  SectionTitle,
  StatusBarraFill,
  StatusBarraLabel,
  StatusBarraTrack,
  StatusValueRow,
} from '../styles';
import {
  CaminhoInfo,
  CaminhoItem,
  CaminhoMarcador,
  CaminhoNome,
  CaminhoStatusLabel,
  CaminhoTitulo,
  CultivoAside,
  CultivoLayout,
  CultivoMain,
  EstrelasRow,
  GanharRow,
  ProximoReinoRow,
  ReinoHero,
  ReinoTitulo,
} from '../cultivo/styles';

const expTotalReino = reino =>
  Math.max(0, reino?.quantidadeSubReinos ?? 0) * Math.max(0, reino?.experienciaPorSubReino ?? 0);

const CultivoModal = ({ open, onClose, personagem, onSave }) => {
  const { executar } = useSaving();
  const [subUniversos, setSubUniversos] = useState([]);
  const [reinos, setReinos] = useState([]);
  const [carregandoReinos, setCarregandoReinos] = useState(false);
  const [xpGanhoInput, setXpGanhoInput] = useState('');
  const [subUniversoPendente, setSubUniversoPendente] = useState(null);
  const [tribulacaoAberta, setTribulacaoAberta] = useState(false);
  const [falhaTribulacaoAberta, setFalhaTribulacaoAberta] = useState(false);
  const [estrelasPerdidasInput, setEstrelasPerdidasInput] = useState('');

  const subUniversoAtual = personagem.cultivo?.subUniverso ?? '';
  const cultivoReinoId = personagem.cultivo?.reinoId ?? '';
  const cultivoXp = personagem.cultivo?.xpAtual ?? 0;

  // Lista de sistemas de cultivo disponíveis vem do campo `SubUniversos` do doc
  // `Cultivo` em `Universo` (somente leitura).
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    let isMounted = true;
    getFirestoreItem('Universo', CULTIVO_UNIVERSO_ID)
      .then(doc => {
        if (isMounted) {
          setSubUniversos(doc?.SubUniversos ?? doc?.subUniversos ?? []);
        }
      })
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar SubUniversos de Cultivo:', erro);
      });
    return () => {
      isMounted = false;
    };
  }, [open]);

  // Reinos do sistema escolhido, já ordenados pela lista ligada `reinoAnterior`.
  useEffect(() => {
    if (!open || !subUniversoAtual) {
      setReinos([]);
      return undefined;
    }
    let isMounted = true;
    setCarregandoReinos(true);
    getReinosCultivo(subUniversoAtual)
      .then(itens => {
        if (isMounted) {
          setReinos(ordenarReinosCultivo(itens));
          setCarregandoReinos(false);
        }
      })
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar Reinos de Cultivo:', erro);
        if (isMounted) {
          setCarregandoReinos(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [open, subUniversoAtual]);

  useEffect(() => {
    if (open) {
      setXpGanhoInput('');
      setSubUniversoPendente(null);
      setTribulacaoAberta(false);
      setFalhaTribulacaoAberta(false);
      setEstrelasPerdidasInput('');
    }
  }, [open]);

  const reinoAtual = useMemo(
    () => reinos.find(reino => reino.id === cultivoReinoId) ?? reinos[0] ?? null,
    [reinos, cultivoReinoId],
  );
  const indexAtual = useMemo(
    () => (reinoAtual ? reinos.findIndex(reino => reino.id === reinoAtual.id) : -1),
    [reinos, reinoAtual],
  );
  const proximoReino = useMemo(
    () => (indexAtual >= 0 ? reinos[indexAtual + 1] ?? null : null),
    [reinos, indexAtual],
  );
  const progresso = useMemo(
    () =>
      calcularProgressoCultivo({
        xpAtual: cultivoXp,
        quantidadeSubReinos: reinoAtual?.quantidadeSubReinos ?? 0,
        experienciaPorSubReino: reinoAtual?.experienciaPorSubReino ?? 0,
      }),
    [cultivoXp, reinoAtual],
  );
  // Caminho do Cultivo mostra só o Reino atual + os 2 próximos, não a trilha inteira
  // (evita rolar por dezenas de Reinos já concluídos ou muito distantes).
  const reinosDoCaminho = useMemo(() => {
    const inicio = indexAtual >= 0 ? indexAtual : 0;
    return reinos.slice(inicio, inicio + 3).map((reino, offset) => ({ reino, indice: inicio + offset }));
  }, [reinos, indexAtual]);

  const aplicarSubUniverso = useCallback(
    nome =>
      executar(() => onSave({ cultivo: { subUniverso: nome, reinoId: '', xpAtual: 0 } })).then(() =>
        setSubUniversoPendente(null),
      ),
    [executar, onSave],
  );

  const handleSelecionarSubUniverso = useCallback(
    event => {
      const nome = event.target.value;
      if (!nome || nome === subUniversoAtual) {
        return undefined;
      }
      // Trocar de sistema zera a progressão do anterior — confirma se já houver algo.
      if (subUniversoAtual && (cultivoXp > 0 || cultivoReinoId)) {
        setSubUniversoPendente(nome);
        return undefined;
      }
      return aplicarSubUniverso(nome);
    },
    [subUniversoAtual, cultivoXp, cultivoReinoId, aplicarSubUniverso],
  );

  const handleGanharXp = useCallback(() => {
    const ganho = Number(xpGanhoInput) || 0;
    if (ganho <= 0 || !reinoAtual) {
      return undefined;
    }
    return executar(async () => {
      const xpAtual = aplicarXpCultivo(
        cultivoXp,
        ganho,
        reinoAtual.quantidadeSubReinos,
        reinoAtual.experienciaPorSubReino,
      );
      await onSave({ cultivo: { subUniverso: subUniversoAtual, reinoId: reinoAtual.id, xpAtual } });
      setXpGanhoInput('');
    });
  }, [xpGanhoInput, reinoAtual, cultivoXp, subUniversoAtual, onSave, executar]);

  const handleConfirmarRuptura = useCallback(() => {
    if (!proximoReino) {
      return undefined;
    }
    return executar(async () => {
      await onSave({ cultivo: { subUniverso: subUniversoAtual, reinoId: proximoReino.id, xpAtual: 0 } });
      setTribulacaoAberta(false);
    });
  }, [proximoReino, subUniversoAtual, onSave, executar]);

  const handleAbrirFalhaTribulacao = useCallback(() => {
    setTribulacaoAberta(false);
    setEstrelasPerdidasInput('');
    setFalhaTribulacaoAberta(true);
  }, []);

  const handleConfirmarFalhaTribulacao = useCallback(() => {
    const estrelasPerdidas = Number(estrelasPerdidasInput) || 0;
    if (estrelasPerdidas <= 0 || !reinoAtual) {
      return undefined;
    }
    return executar(async () => {
      const xpAtual = aplicarFalhaTribulacao(cultivoXp, estrelasPerdidas, reinoAtual.experienciaPorSubReino);
      await onSave({ cultivo: { subUniverso: subUniversoAtual, reinoId: reinoAtual.id, xpAtual } });
      setFalhaTribulacaoAberta(false);
      setEstrelasPerdidasInput('');
    });
  }, [estrelasPerdidasInput, reinoAtual, cultivoXp, subUniversoAtual, onSave, executar]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogHeaderRow>
        <DialogHeaderTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SelfImprovementIcon fontSize="small" /> Sistema de Cultivo
        </DialogHeaderTitle>
        <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </DialogFecharButton>
      </DialogHeaderRow>

      <DialogContent>
        <TextField
          select
          fullWidth
          size="small"
          label="Sistema Atual"
          value={subUniversoAtual}
          onChange={handleSelecionarSubUniverso}
          sx={{ maxWidth: 320, mt: 1 }}
        >
          <MenuItem value="" disabled>
            <em>Escolha um sistema de cultivo</em>
          </MenuItem>
          {subUniversos.map(nome => (
            <MenuItem key={nome} value={nome}>
              {nome}
            </MenuItem>
          ))}
        </TextField>

        {!subUniversoAtual && (
          <StatusValueRow style={{ display: 'block', marginTop: 20 }}>
            Escolha um sistema de cultivo (SubUniverso) acima para definir o caminho do personagem.
          </StatusValueRow>
        )}

        {subUniversoAtual && carregandoReinos && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <CircularProgress size={28} sx={{ color: 'var(--color-primary)' }} />
          </div>
        )}

        {subUniversoAtual && !carregandoReinos && !reinoAtual && (
          <StatusValueRow style={{ display: 'block', marginTop: 20 }}>
            Nenhum Reino cadastrado para este sistema de cultivo.
          </StatusValueRow>
        )}

        {reinoAtual && (
          <CultivoLayout style={{ marginTop: 20 }}>
            <CultivoMain>
              {reinoAtual.linkImagem && <ReinoHero src={reinoAtual.linkImagem} alt="" />}

              <div>
                <StatusValueRow style={{ display: 'block', textAlign: 'center', letterSpacing: 2 }}>
                  REINO ATUAL
                </StatusValueRow>
                <ReinoTitulo>{getNome(reinoAtual)}</ReinoTitulo>
                <EstrelasRow style={{ marginTop: 8 }}>
                  {Array.from({ length: reinoAtual.quantidadeSubReinos ?? 0 }).map((_, estrela) =>
                    estrela < progresso.estrelas ? (
                      <StarRoundedIcon key={estrela} fontSize="small" />
                    ) : (
                      <StarOutlineRoundedIcon
                        key={estrela}
                        fontSize="small"
                        sx={{ color: 'var(--text-muted)' }}
                      />
                    ),
                  )}
                </EstrelasRow>
              </div>

              <div>
                <SectionTitle style={{ fontSize: '0.9rem' }}>Cultivo</SectionTitle>
                <StatusBarraTrack $grande style={{ marginTop: 8 }}>
                  <StatusBarraFill $variante="cultivo" $percentual={progresso.percentual} />
                  <StatusBarraLabel>
                    {progresso.xp} / {progresso.expTotal}
                  </StatusBarraLabel>
                </StatusBarraTrack>
                <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
                  {progresso.noPico
                    ? 'Pico do Reino alcançado — pronto para a Ruptura.'
                    : `Faltam ${progresso.faltante} de Cultivo para o Pico.`}
                </StatusValueRow>
              </div>

              <GanharRow>
                <TextField
                  label="Cultivo ganho"
                  size="small"
                  value={xpGanhoInput}
                  onChange={event => setXpGanhoInput(event.target.value.replace(/[^0-9]/g, ''))}
                  inputMode="numeric"
                  sx={{ maxWidth: 160 }}
                />
                <Button variant="contained" onClick={handleGanharXp}>
                  Ganhar Experiência
                </Button>
              </GanharRow>

              <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 16 }}>
                <ProximoReinoRow>
                  <StatusValueRow>
                    {proximoReino ? (
                      <>
                        Próximo Reino: <strong style={{ color: 'var(--color-primary)' }}>{getNome(proximoReino)}</strong>
                      </>
                    ) : (
                      'Reino máximo alcançado.'
                    )}
                  </StatusValueRow>
                  {proximoReino && (
                    <StatusValueRow>EXP Necessária: {expTotalReino(proximoReino)}</StatusValueRow>
                  )}
                </ProximoReinoRow>
                <Button
                  variant="contained"
                  startIcon={<BoltIcon fontSize="small" />}
                  disabled={!progresso.noPico || !proximoReino}
                  onClick={() => setTribulacaoAberta(true)}
                  sx={{ mt: 1.5 }}
                >
                  Avançar (Ruptura)
                </Button>
                {progresso.noPico && !proximoReino && (
                  <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
                    Você atingiu o último Reino deste sistema de cultivo.
                  </StatusValueRow>
                )}
              </div>
            </CultivoMain>

            <CultivoAside>
              <CaminhoTitulo>Caminho do Cultivo</CaminhoTitulo>
              {reinosDoCaminho.map(({ reino, indice }) => {
                const status =
                  indice < indexAtual ? 'concluido' : indice === indexAtual ? 'atual' : 'bloqueado';
                const rotulo =
                  status === 'concluido'
                    ? 'Já Concluído'
                    : status === 'atual'
                      ? 'Atual'
                      : 'Bloqueado';
                return (
                  <CaminhoItem key={reino.id} $status={status}>
                    <CaminhoMarcador $status={status}>
                      {status === 'concluido' && <CheckCircleRoundedIcon fontSize="small" />}
                      {status === 'atual' && <AutoAwesomeIcon fontSize="small" />}
                      {status === 'bloqueado' && <LockRoundedIcon fontSize="small" />}
                    </CaminhoMarcador>
                    <CaminhoInfo>
                      <CaminhoNome>{getNome(reino)}</CaminhoNome>
                      <CaminhoStatusLabel $status={status}>{rotulo}</CaminhoStatusLabel>
                    </CaminhoInfo>
                  </CaminhoItem>
                );
              })}
            </CultivoAside>
          </CultivoLayout>
        )}
      </DialogContent>

      <Dialog open={Boolean(subUniversoPendente)} onClose={() => setSubUniversoPendente(null)}>
        <DialogTitle>Trocar de sistema de cultivo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Mudar para <strong>{subUniversoPendente}</strong> vai reiniciar a progressão de cultivo
            atual (Reino e Cultivo voltam ao início). Essa ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubUniversoPendente(null)}>Cancelar</Button>
          <Button variant="contained" onClick={() => aplicarSubUniverso(subUniversoPendente)}>
            Trocar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={tribulacaoAberta} onClose={() => setTribulacaoAberta(false)}>
        <DialogTitle>Tribulação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Para concluir a Ruptura e ascender para{' '}
            <strong>{proximoReino ? getNome(proximoReino) : ''}</strong>, o personagem precisa superar
            a Tribulação. Ao confirmar, o Cultivo volta a zero e as estrelas reiniciam no novo Reino.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTribulacaoAberta(false)}>Cancelar</Button>
          <Button
            color="error"
            variant="outlined"
            startIcon={<HeartBrokenIcon fontSize="small" />}
            onClick={handleAbrirFalhaTribulacao}
          >
            Falhou na Tribulação
          </Button>
          <Button variant="contained" onClick={handleConfirmarRuptura}>
            Superar Tribulação
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={falhaTribulacaoAberta} onClose={() => setFalhaTribulacaoAberta(false)}>
        <DialogTitle>Falha na Tribulação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Quantas estrelas (SubReinos) o personagem perdeu ao falhar na Tribulação? O Cultivo
            perdido é <strong>estrelas × {reinoAtual?.experienciaPorSubReino ?? 0}</strong> (o custo
            por estrela de {getNome(reinoAtual)}), descontado do Reino atual — sem avançar nem recuar
            de Reino.
          </DialogContentText>
          <TextField
            label="Estrelas perdidas"
            size="small"
            value={estrelasPerdidasInput}
            onChange={event => setEstrelasPerdidasInput(event.target.value.replace(/[^0-9]/g, ''))}
            inputMode="numeric"
            sx={{ mt: 2, maxWidth: 160 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFalhaTribulacaoAberta(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleConfirmarFalhaTribulacao}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

CultivoModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default CultivoModal;
