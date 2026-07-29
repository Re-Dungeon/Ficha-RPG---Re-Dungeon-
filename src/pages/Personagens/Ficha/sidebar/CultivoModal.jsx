import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Menu from '@mui/material/Menu';
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
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';

import { getFirestoreItem, getReinosCultivo } from 'service/storage';
import {
  aplicarFalhaTribulacao,
  aplicarXpCultivo,
  calcularProgressoCultivo,
  ordenarReinosCultivo,
} from 'common/utils/formulas';
import { getNome } from 'common/utils/resolveNome';
import { useSaving } from 'context/SavingContext';

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
  CaminhoCard,
  CaminhoInfo,
  CaminhoItem,
  CaminhoMarcador,
  CaminhoMarcadorImage,
  CaminhoNome,
  CaminhoSeta,
  CaminhoStatusLabel,
  CaminhoTitulo,
  CultivoActionRow,
  CultivoAside,
  CultivoCard,
  CultivoLayout,
  CultivoMain,
  CultivoStatusRow,
  EstrelasRow,
  ReinoBanner,
  ReinoTitulo,
} from '../cultivo/styles';

const expTotalReino = reino =>
  Math.max(0, reino?.quantidadeSubReinos ?? 0) * Math.max(0, reino?.experienciaPorSubReino ?? 0);

const CultivoModal = ({ open, onClose, personagem, onSave }) => {
  const { executar } = useSaving();
  const [subUniversos, setSubUniversos] = useState([]);
  const [carregandoSistemas, setCarregandoSistemas] = useState(false);
  const [reinos, setReinos] = useState([]);
  const [carregandoReinos, setCarregandoReinos] = useState(false);
  const [xpGanhoInput, setXpGanhoInput] = useState('');
  const [subUniversoSelecionado, setSubUniversoSelecionado] = useState('');
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [tribulacaoAberta, setTribulacaoAberta] = useState(false);
  const [falhaTribulacaoAberta, setFalhaTribulacaoAberta] = useState(false);
  const [estrelasPerdidasInput, setEstrelasPerdidasInput] = useState('');

  const universoId = personagem.universo;
  // `cultivo` é um mapa keyed por subUniverso ('' pro universo sem múltiplos
  // sistemas) — cada chave guarda a progressão independente daquele sistema,
  // permitindo cultivar em mais de um sistema/subUniverso ao mesmo tempo sem
  // perder progresso ao trocar de aba (ver docs/MIGRACAO-REACT-FIREBASE.md §5).
  const cultivoMap = useMemo(() => personagem.cultivo ?? {}, [personagem.cultivo]);
  // Universos com múltiplos sistemas paralelos (ex.: Cultivo → "Doupo
  // Cangqiong", "Martial Peak") têm o campo `SubUniversos` no doc `Universo` e
  // exigem escolher um antes de ver os Reinos. Universos sem esse campo vão
  // direto pra trilha (Reinos com `subUniverso: ''`).
  const temSistemas = subUniversos.length > 0;
  // Aba mostra só os sistemas que o personagem já possui (uma entrada no mapa
  // `cultivo`) — trocar entre eles é só clicar na aba, sem reabrir seletor.
  // "+" abre o menu com os sistemas restantes pra começar um novo em paralelo.
  const iniciados = useMemo(
    () => subUniversos.filter(nome => cultivoMap[nome]),
    [subUniversos, cultivoMap],
  );
  const naoIniciados = useMemo(
    () => subUniversos.filter(nome => !cultivoMap[nome]),
    [subUniversos, cultivoMap],
  );
  const chaveAtual = temSistemas ? subUniversoSelecionado : '';
  const cultivoReinoId = cultivoMap[chaveAtual]?.reinoId ?? '';
  const cultivoXp = cultivoMap[chaveAtual]?.xpAtual ?? 0;

  // Lista de sistemas de cultivo disponíveis (se houver) vem do campo
  // `SubUniversos` do doc do universo do personagem em `Universo` (somente leitura).
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    let isMounted = true;
    setCarregandoSistemas(true);
    getFirestoreItem('Universo', universoId)
      .then(doc => {
        if (isMounted) {
          setSubUniversos(doc?.SubUniversos ?? doc?.subUniversos ?? []);
          setCarregandoSistemas(false);
        }
      })
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar SubUniversos de Cultivo:', erro);
        if (isMounted) {
          setCarregandoSistemas(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [open, universoId]);

  // Um sistema "pronto" pra mostrar Reinos é: o universo não ter múltiplos
  // sistemas, ou a aba selecionada ser um dos sistemas já iniciados.
  const sistemaSelecionadoValido = !temSistemas || iniciados.includes(subUniversoSelecionado);

  // Reinos da trilha (do universo, e do sistema escolhido quando o universo
  // tiver mais de um), já ordenados pela lista ligada `reinoAnterior`.
  useEffect(() => {
    if (!open || carregandoSistemas || !sistemaSelecionadoValido) {
      setReinos([]);
      return undefined;
    }
    let isMounted = true;
    setCarregandoReinos(true);
    getReinosCultivo(universoId, chaveAtual)
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
  }, [open, carregandoSistemas, sistemaSelecionadoValido, chaveAtual, universoId]);

  useEffect(() => {
    if (open) {
      setXpGanhoInput('');
      setAddMenuAnchor(null);
      setTribulacaoAberta(false);
      setFalhaTribulacaoAberta(false);
      setEstrelasPerdidasInput('');
    }
  }, [open]);

  // Ao abrir o modal (ou assim que um sistema é iniciado/removido), seleciona
  // automaticamente a primeira aba de sistema já iniciado. Só troca a
  // visualização — nunca mexe na progressão de nenhum sistema. Se nenhum
  // sistema foi iniciado ainda, não seleciona nada (mostra o estado vazio).
  useEffect(() => {
    if (!open || !temSistemas || iniciados.length === 0) {
      return;
    }
    if (iniciados.includes(subUniversoSelecionado)) {
      return;
    }
    setSubUniversoSelecionado(iniciados[0]);
  }, [open, temSistemas, iniciados, subUniversoSelecionado]);

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
  // Caminho do Cultivo mostra o Reino atual + os 4 próximos, não a trilha inteira.
  // (evita rolar por dezenas de Reinos já concluídos ou muito distantes.)
  const reinosDoCaminho = useMemo(() => {
    const inicio = indexAtual >= 0 ? indexAtual : 0;
    return reinos.slice(inicio, inicio + 5).map((reino, offset) => ({ reino, indice: inicio + offset }));
  }, [reinos, indexAtual]);

  // Trocar de aba é só uma troca de visualização agora — cada sistema tem
  // sua própria progressão no mapa `cultivo`, então não há nada pra confirmar.
  const handleSelecionarSubUniverso = useCallback((event, nome) => {
    setSubUniversoSelecionado(nome);
  }, []);

  // Começar a cultivar num sistema novo grava uma progressão zerada no mapa
  // (é o que faz o sistema aparecer como uma aba própria a partir de agora) e
  // muda a visualização pra ele — os demais sistemas continuam intactos.
  const handleAdicionarSistema = useCallback(
    nome => {
      setAddMenuAnchor(null);
      return executar(() =>
        onSave({ cultivo: { ...cultivoMap, [nome]: { reinoId: '', xpAtual: 0 } } }),
      ).then(() => setSubUniversoSelecionado(nome));
    },
    [cultivoMap, onSave, executar],
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
      await onSave({ cultivo: { ...cultivoMap, [chaveAtual]: { reinoId: reinoAtual.id, xpAtual } } });
      setXpGanhoInput('');
    });
  }, [xpGanhoInput, reinoAtual, cultivoXp, cultivoMap, chaveAtual, onSave, executar]);

  const handleConfirmarRuptura = useCallback(() => {
    if (!proximoReino) {
      return undefined;
    }
    return executar(async () => {
      await onSave({ cultivo: { ...cultivoMap, [chaveAtual]: { reinoId: proximoReino.id, xpAtual: 0 } } });
      setTribulacaoAberta(false);
    });
  }, [proximoReino, cultivoMap, chaveAtual, onSave, executar]);

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
      await onSave({ cultivo: { ...cultivoMap, [chaveAtual]: { reinoId: reinoAtual.id, xpAtual } } });
      setFalhaTribulacaoAberta(false);
      setEstrelasPerdidasInput('');
    });
  }, [estrelasPerdidasInput, reinoAtual, cultivoXp, cultivoMap, chaveAtual, onSave, executar]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{ paper: { sx: {
          width: 'min(100%, 920px)',
          maxHeight: 'min(100vh, 94vh)',
          borderRadius: '22px',
          backgroundImage: "linear-gradient(rgba(10, 9, 19, 0.88), rgba(10, 9, 19, 0.88)), url('https://i.imgur.com/6ewUzUs.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        } } }}
      scroll="paper"
    >
      <DialogHeaderRow>
        <DialogHeaderTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SelfImprovementIcon fontSize="small" /> Sistema de Cultivo
        </DialogHeaderTitle>
        <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </DialogFecharButton>
      </DialogHeaderRow>

      <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 3 }}>
        {carregandoSistemas && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <CircularProgress size={28} sx={{ color: 'var(--color-primary)' }} />
          </div>
        )}

        {!carregandoSistemas && temSistemas && iniciados.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Tabs
              value={iniciados.includes(subUniversoSelecionado) ? subUniversoSelecionado : false}
              onChange={handleSelecionarSubUniverso}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 40,
                flex: 1,
                minWidth: 0,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                '& .MuiTab-root': { minHeight: 40, textTransform: 'none', borderRadius: '12px 12px 0 0' },
              }}
            >
              {iniciados.map(nome => (
                <Tab key={nome} value={nome} label={nome} />
              ))}
            </Tabs>
            {naoIniciados.length > 0 && (
              <IconButton
                type="button"
                aria-label="Começar a cultivar em outro sistema"
                size="small"
                onClick={event => setAddMenuAnchor(event.currentTarget)}
                sx={{ color: 'var(--color-primary)' }}
              >
                <AddCircleOutlineRoundedIcon fontSize="small" />
              </IconButton>
            )}
          </div>
        )}

        {!carregandoSistemas && temSistemas && naoIniciados.length > 0 && (
          <Menu anchorEl={addMenuAnchor} open={Boolean(addMenuAnchor)} onClose={() => setAddMenuAnchor(null)}>
            {naoIniciados.map(nome => (
              <MenuItem key={nome} onClick={() => handleAdicionarSistema(nome)}>
                {nome}
              </MenuItem>
            ))}
          </Menu>
        )}

        {!carregandoSistemas && temSistemas && iniciados.length === 0 && (
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <StatusValueRow style={{ display: 'block', marginBottom: 12 }}>
              Nenhum sistema de cultivo iniciado ainda. Escolha um para começar — o personagem pode
              cultivar em mais de um sistema ao mesmo tempo, cada um com sua própria progressão.
            </StatusValueRow>
            <Button
              variant="outlined"
              onClick={event => setAddMenuAnchor(event.currentTarget)}
              sx={{ borderRadius: '16px' }}
            >
              Escolher sistema de cultivo
            </Button>
          </div>
        )}

        {!carregandoSistemas && sistemaSelecionadoValido && carregandoReinos && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <CircularProgress size={28} sx={{ color: 'var(--color-primary)' }} />
          </div>
        )}

        {!carregandoSistemas && sistemaSelecionadoValido && !carregandoReinos && !reinoAtual && (
          <StatusValueRow style={{ display: 'block', marginTop: 20 }}>
            Nenhum Reino de Cultivo cadastrado para este universo{temSistemas ? ' e sistema' : ''}.
          </StatusValueRow>
        )}

        {reinoAtual && (
          <CultivoLayout style={{ marginTop: 20 }}>
            <CultivoMain>
              <CultivoCard>
                <div>
                  <StatusValueRow style={{ display: 'block', textAlign: 'center', letterSpacing: 2 }}>
                    REINO ATUAL
                  </StatusValueRow>
                  <ReinoTitulo>{getNome(reinoAtual)}</ReinoTitulo>
                  <EstrelasRow style={{ marginTop: 10, gap: 6 }}>
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
                  <ReinoBanner src="https://i.imgur.com/ZD2QY5R.png" alt="Reino do Cultivo" />
                </div>

                <div>
                  <SectionTitle style={{ fontSize: '0.95rem' }}>Cultivo</SectionTitle>
                  <StatusBarraTrack $grande style={{ marginTop: 12 }}>
                    <StatusBarraFill $variante="cultivo" $percentual={progresso.percentual} />
                    <StatusBarraLabel>
                      {progresso.xp} / {progresso.expTotal}
                    </StatusBarraLabel>
                  </StatusBarraTrack>
                  <StatusValueRow style={{ display: 'block', marginTop: 12 }}>
                    {progresso.noPico
                      ? 'Pico do Reino alcançado — pronto para a Ruptura.'
                      : `Faltam ${progresso.faltante} de Cultivo para o Pico.`}
                  </StatusValueRow>
                </div>

                <CultivoActionRow>
                  <TextField
                    label="Cultivo ganho"
                    size="small"
                    value={xpGanhoInput}
                    onChange={event => setXpGanhoInput(event.target.value.replace(/[^0-9]/g, ''))}
                    inputMode="numeric"
                    sx={{ maxWidth: 200, width: '100%', '& .MuiInputBase-root': { borderRadius: '16px' } }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleGanharXp}
                    sx={{ minWidth: 172, borderRadius: '16px' }}
                  >
                    Ganhar Experiência
                  </Button>
                </CultivoActionRow>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 18 }}>
                  <CultivoStatusRow>
                    <StatusValueRow style={{ maxWidth: '65%' }}>
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
                  </CultivoStatusRow>
                  <Button
                    variant="contained"
                    startIcon={<BoltIcon fontSize="small" />}
                    disabled={!progresso.noPico || !proximoReino}
                    onClick={() => setTribulacaoAberta(true)}
                    sx={{
                      mt: 2,
                      borderRadius: '16px',
                      minWidth: 190,
                      mx: 'auto',
                      display: 'block',
                      whiteSpace: 'nowrap',
                      justifyContent: 'center',
                    }}
                  >
                    Avançar (Ruptura)
                  </Button>
                  {progresso.noPico && !proximoReino && (
                    <StatusValueRow style={{ display: 'block', marginTop: 12 }}>
                      Você atingiu o último Reino deste sistema de cultivo.
                    </StatusValueRow>
                  )}
                </div>
              </CultivoCard>
            </CultivoMain>

            <CultivoAside>
              <CaminhoCard>
                <CaminhoTitulo>Caminho do Cultivo</CaminhoTitulo>
                {reinosDoCaminho.map(({ reino, indice }, index) => {
                  const status =
                    indice < indexAtual ? 'concluido' : indice === indexAtual ? 'atual' : 'bloqueado';
                  const rotulo =
                    status === 'concluido'
                      ? 'Já Concluído'
                      : status === 'atual'
                        ? 'Atual'
                        : 'Bloqueado';
                  return (
                    <React.Fragment key={reino.id}>
                      <CaminhoItem $status={status}>
                        <CaminhoMarcador $status={status}>
                          {reino.linkImagem ? (
                            <CaminhoMarcadorImage src={reino.linkImagem} alt={getNome(reino)} />
                          ) : status === 'concluido' ? (
                            <CheckCircleRoundedIcon fontSize="small" />
                          ) : status === 'atual' ? (
                            <AutoAwesomeIcon fontSize="small" />
                          ) : (
                            <LockRoundedIcon fontSize="small" />
                          )}
                        </CaminhoMarcador>
                        <CaminhoInfo>
                          <CaminhoNome>{getNome(reino)}</CaminhoNome>
                          <CaminhoStatusLabel $status={status}>{rotulo}</CaminhoStatusLabel>
                        </CaminhoInfo>
                      </CaminhoItem>
                      {index < reinosDoCaminho.length - 1 && (
                        <CaminhoSeta>↓</CaminhoSeta>
                      )}
                    </React.Fragment>
                  );
                })}
              </CaminhoCard>
            </CultivoAside>
          </CultivoLayout>
        )}
      </DialogContent>

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
