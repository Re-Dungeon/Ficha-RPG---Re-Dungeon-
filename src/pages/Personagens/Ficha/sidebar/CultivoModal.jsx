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
  calcularPrimariosTotais,
  calcularProgressoCultivo,
  calcularSecundarios,
  calcularStatusMaximos,
  ordenarReinosCultivo,
} from 'common/utils/formulas';
import { getNome } from 'common/utils/resolveNome';
import { useSaving } from 'context/SavingContext';
import { PRIMARIOS_LABELS, SECUNDARIOS_LABELS, STATUS_LABELS } from '../constants';

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
  ResetActionDivider,
  ResetCard,
  ResetCardBadge,
  ResetCardContent,
  ResetCardHint,
  ResetCardIconWrap,
  ResetCardImage,
  ResetCardSubtitle,
  ResetCardTitle,
  ResetCardTitleRow,
  ResetCompleteAction,
  ResetCompleteText,
  ResetCompleteTitle,
  ResetList,
} from '../cultivo/styles';

import styled from 'styled-components';

// (Aviso deslocado; estilo FlashingWarning removido — não utilizado)

const TribulacaoPaperStyles = {
  background: 'rgba(4,8,20,0.94)',
  border: '1px solid rgba(212,175,55,0.12)',
  borderRadius: 12,
  padding: '18px',
  color: 'var(--text-primary)',
  boxShadow: '0 8px 30px rgba(2,6,20,0.6)',
  backdropFilter: 'blur(6px)',
};

const ModalTitle = styled.h2`
  margin: 0;
  padding: 10px 0;
  font-family: Georgia, 'Palatino Linotype', 'Book Antiqua', serif;
  color: var(--status-gold-strong);
  font-size: 1.25rem;
  letter-spacing: 0.6px;
  text-align: center;
  width: 100%;
  background: transparent;
  box-shadow: none;
`;

const TitleDivider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, rgba(233,208,138,0.12), rgba(233,208,138,0.02));
  margin: 6px 0 12px 0;
`;

const ModalDescription = styled.div`
  color: #cfd8e3;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 18px;
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: center;
  padding-top: 12px;
`;

const CancelButton = styled(Button)`
  && {
    background: transparent;
    border: 1px solid rgba(90,130,255,0.18);
    color: #91b0ff;
    padding: 8px 14px;
    text-transform: none;
    box-shadow: none;
  }
`;

const FailedStatus = styled(Button)`
  && {
    background: linear-gradient(180deg, rgba(120,20,20,0.04), rgba(80,10,10,0.02));
    border: 1px solid rgba(255,60,60,0.12);
    color: #ff8b8b;
    padding: 8px 12px;
    text-transform: uppercase;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-shadow: none;
  }
`;

const PrimaryButton = styled(Button)`
  && {
    background: linear-gradient(90deg, #18224a 0%, #3b2b66 100%);
    color: #fff;
    padding: 12px 22px;
    font-weight: 800;
    font-size: 1rem;
    text-transform: uppercase;
    border-radius: 10px;
    border: 1px solid rgba(200,200,255,0.06);
    box-shadow: 0 6px 18px rgba(58,43,102,0.28);
  }
`;

const HighlightWarning = styled.div`
  margin-top: 12px;
  text-align: center;
  color: #e7c86b;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 8px 12px;
  background: linear-gradient(90deg, rgba(231,200,107,0.06), rgba(231,200,107,0.02));
  border: 1px solid rgba(231,200,107,0.12);
  border-radius: 8px;
  font-weight: 700;
`;

const CHAVE_CULTIVO_PADRAO = 'principal';

const expTotalReino = reino =>
  Math.max(0, reino?.quantidadeSubReinos ?? 0) * Math.max(0, reino?.experienciaPorSubReino ?? 0);

const normalizarChaveCultivo = chave => {
  if (!chave || typeof chave !== 'string') {
    return CHAVE_CULTIVO_PADRAO;
  }

  const chaveTrim = chave.trim();
  if (!chaveTrim || chaveTrim.startsWith('__') || chaveTrim.endsWith('__')) {
    return CHAVE_CULTIVO_PADRAO;
  }

  return chaveTrim;
};

const normalizarMapaCultivo = mapa => {
  if (!mapa || typeof mapa !== 'object') {
    return {};
  }

  return Object.entries(mapa).reduce((acc, [chave, valor]) => {
    const chaveNormalizada = normalizarChaveCultivo(chave);
    acc[chaveNormalizada] = valor;
    return acc;
  }, {});
};

const criarPatchCultivo = (mapaAtual, chave, valor) => {
  const mapaNormalizado = normalizarMapaCultivo(mapaAtual);
  return { ...mapaNormalizado, [normalizarChaveCultivo(chave)]: valor };
};

const normalizarPermissao = valor => {
  if (typeof valor === 'boolean') {
    return valor;
  }

  if (typeof valor === 'number') {
    return valor > 0;
  }

  if (typeof valor === 'string') {
    const texto = valor.trim().toLowerCase();
    return ['true', 'yes', 'allow', 'allowed', 'permitido', 'permitida', 'ativo', 'enabled', 'on'].includes(
      texto,
    );
  }

  if (Array.isArray(valor)) {
    return valor.length > 0;
  }

  if (valor && typeof valor === 'object') {
    return Object.values(valor).some(normalizarPermissao);
  }

  return false;
};

const normalizarOpcoesAtributos = lista => {
  if (!Array.isArray(lista)) {
    return [];
  }

  return lista.map(item => {
    if (!item || typeof item !== 'object') {
      return { id: String(item ?? ''), permitido: normalizarPermissao(item) };
    }

    return {
      ...item,
      id: item.id ?? item.chave ?? item.nome ?? item.atributo ?? '',
      permitido: item.permitido ?? item.permitida ?? item.enabled ?? item.ativo ?? item.allowed ?? false,
    };
  });
};

const obterListaAtributosReino = reino => {
  const base = reino?.regras ?? reino?.regrasCultivo ?? {};
  const candidatos = [
    base?.atributos,
    base?.atributosPermitidos,
    base?.permissoes?.atributos,
    base?.categorias?.atributos,
    base?.categorias?.primarios,
    base?.categorias?.secundarios,
    base?.categorias?.status,
  ];

  for (const candidato of candidatos) {
    if (Array.isArray(candidato)) {
      return normalizarOpcoesAtributos(candidato);
    }

    if (candidato && typeof candidato === 'object') {
      const entradas = Object.entries(candidato).map(([chave, valor]) => {
        if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
          return { id: chave, ...valor, permitido: valor.permitido ?? valor.permitida ?? valor.enabled ?? valor.ativo };
        }

        return { id: chave, permitido: normalizarPermissao(valor) };
      });

      if (entradas.length > 0) {
        return entradas;
      }
    }
  }

  return [];
};

const extrairPermissaoPorChave = (reino, grupo, chave) => {
  const base = reino?.regras ?? reino?.regrasCultivo ?? {};
  const listaAtributos = obterListaAtributosReino(reino);
  const chaveBusca = String(chave).trim().toLowerCase();
  const item = listaAtributos.find(entry => {
    const ids = [
      String(entry?.id ?? '').trim().toLowerCase(),
      String(entry?.chave ?? '').trim().toLowerCase(),
      String(entry?.nome ?? '').trim().toLowerCase(),
      String(entry?.atributo ?? '').trim().toLowerCase(),
      String(entry?.key ?? '').trim().toLowerCase(),
    ].filter(Boolean);

    return ids.includes(chaveBusca) || ids.includes(chaveBusca.replace(/_/g, ' '));
  });

  if (item && item.permitido !== undefined) {
    return normalizarPermissao(item.permitido);
  }

  const gruposMap = {
    primarios: ['atributosPrincipais', 'principais', 'primarios'],
    secundarios: ['atributosSecundarios', 'secundarios'],
    status: ['status', 'statusPermitidos'],
  };

  const candidatos = [
    base,
    base?.categorias,
    base?.permissoes,
    base?.configuracao,
    base?.rules,
    base?.[grupo],
    base?.[gruposMap[grupo]?.[0]],
    ...((gruposMap[grupo] ?? []).map(alias => base?.[alias])),
  ];

  for (const candidato of candidatos) {
    if (!candidato || typeof candidato !== 'object') {
      continue;
    }

    const valores = [
      candidato[chave],
      candidato[chave]?.permitido,
      candidato[chave]?.permitida,
      candidato[chave]?.enabled,
      candidato[chave]?.ativo,
      candidato[chave]?.valor,
      candidato[chave]?.status,
    ];

    const valor = valores.find(item => item !== undefined && item !== null);
    if (valor !== undefined) {
      return normalizarPermissao(valor);
    }

    if (Array.isArray(candidato)) {
      if (candidato.includes(chave)) {
        return true;
      }
      const etiqueta = chave.replace(/_/g, ' ');
      if (candidato.some(item => String(item).toLowerCase() === etiqueta)) {
        return true;
      }
    }
  }

  return undefined;
};



const getIconeAtributo = chave => {
  const icones = {
    forca: '⚔',
    vitalidade: '❤️',
    agilidade: '⚡',
    inteligencia: '🧠',
    percepcao: '👁',
    sorte: '🍀',
    prontidao: '⏱',
    ataque: '🗡',
    defesa: '🛡',
    reacao: '⚙',
    precisao: '🎯',
    evasao: '💨',
    hp: '❤️',
    energia: '✨',
    fadiga: '🌙',
  };

  return icones[chave] ?? '✦';
};

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
  const [xpDialogAberto, setXpDialogAberto] = useState(false);
  const [pontosDialogAberto, setPontosDialogAberto] = useState(false);
  const [openPrimarios, setOpenPrimarios] = useState(true);
  const [openSecundarios, setOpenSecundarios] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [hoverPrimarios, setHoverPrimarios] = useState(false);
  const [hoverSecundarios, setHoverSecundarios] = useState(false);
  const [hoverStatus, setHoverStatus] = useState(false);
  const [alocacoesPontos, setAlocacoesPontos] = useState({});
  const [resetDialogAberto, setResetDialogAberto] = useState(false);
  const [resetConfirmAberto, setResetConfirmAberto] = useState(false);
  const [destinoResetId, setDestinoResetId] = useState('');
  const [resetCompleto, setResetCompleto] = useState(false);

  const universoId = personagem.universo;
  // `cultivo` é um mapa keyed por subUniverso; em universos sem múltiplos
  // sistemas usamos uma chave interna estável em vez de `''`, porque Firestore
  // rejeita chaves vazias em objetos aninhados.
  const cultivoMap = useMemo(() => normalizarMapaCultivo(personagem.cultivo), [personagem.cultivo]);
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
  const chaveAtual = temSistemas ? subUniversoSelecionado : CHAVE_CULTIVO_PADRAO;
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
    getReinosCultivo(universoId, temSistemas ? chaveAtual : '')
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
  }, [open, carregandoSistemas, sistemaSelecionadoValido, chaveAtual, temSistemas, universoId]);

  useEffect(() => {
    if (open) {
      setXpGanhoInput('');
      setAddMenuAnchor(null);
      setTribulacaoAberta(false);
      setFalhaTribulacaoAberta(false);
      setEstrelasPerdidasInput('');
      setXpDialogAberto(false);
      setPontosDialogAberto(false);
      setResetDialogAberto(false);
      setResetConfirmAberto(false);
      setDestinoResetId('');
      setResetCompleto(false);
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
  const regrasCultivo = reinoAtual?.regras ?? reinoAtual?.regrasCultivo ?? null;
  const primariosTotais = useMemo(
    () => calcularPrimariosTotais(personagem.atributosBase, personagem.atributosExtra, personagem.atributosBonus),
    [personagem.atributosBase, personagem.atributosExtra, personagem.atributosBonus],
  );
  const secundariosTotais = useMemo(
    () => calcularSecundarios(primariosTotais, personagem.secundariosBase, personagem.secundariosExtra, personagem.secundariosBonus),
    [primariosTotais, personagem.secundariosBase, personagem.secundariosExtra, personagem.secundariosBonus],
  );
  const statusMaximos = useMemo(
    () => calcularStatusMaximos(primariosTotais, personagem.status ?? {}),
    [primariosTotais, personagem.status],
  );
  // A interface visual de Pontos mostrará sempre as três categorias (primários, secundários, status).
  // Os arrays e valores usados na renderização abaixo vêm diretamente dos constantes/valores calculados
  // (`PRIMARIOS_LABELS`, `SECUNDARIOS_LABELS`, `STATUS_LABELS`, `primariosTotais`, `secundariosTotais`, `statusMaximos`).
  const reinosDisponiveisParaReset = useMemo(() => {
    if (indexAtual < 0) {
      return reinos;
    }
    return reinos.slice(0, indexAtual + 1);
  }, [reinos, indexAtual]);
  const destinoResetReino = useMemo(
    () => reinos.find(reino => reino.id === destinoResetId) ?? reinos[0] ?? null,
    [reinos, destinoResetId],
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

  const pontosDisponiveis = useMemo(() => {
    const valorTotal = Number(
      regrasCultivo?.pontos ?? reinoAtual?.pontosDisponiveis ?? reinoAtual?.pontos ?? 0,
    );
    const quantidadeSubReinos = Math.max(1, Number(reinoAtual?.quantidadeSubReinos ?? 1));
    const pontosPorSubReino = Number.isFinite(valorTotal) ? Math.floor(valorTotal / quantidadeSubReinos) : 0;
    const estrelasDesbloqueadas = Math.max(0, Number(progresso?.estrelas ?? cultivoMap[chaveAtual]?.estrelas ?? 0));
    // Se nenhuma estrela desbloqueada, não há pontos disponíveis
    return estrelasDesbloqueadas > 0 ? pontosPorSubReino * estrelasDesbloqueadas : 0;
  }, [regrasCultivo, reinoAtual, progresso, cultivoMap, chaveAtual]);

  const pontosDistribuidos = useMemo(() => {
    const valorBase = Number(
      regrasCultivo?.pontosDistribuidos ?? reinoAtual?.pontosDistribuidos ?? 0,
    );
    const valorAtual = Object.values(alocacoesPontos).reduce((soma, valor) => soma + Number(valor || 0), 0);
    return Math.max(valorBase, valorAtual);
  }, [alocacoesPontos, regrasCultivo, reinoAtual]);

  const pontosRestantes = Math.max(0, pontosDisponiveis - pontosDistribuidos);
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
      const patchCultivo = criarPatchCultivo(cultivoMap, chaveAtual, {
        reinoId: reinoAtual.id,
        xpAtual,
      });
      await onSave({ cultivo: patchCultivo });
      setXpGanhoInput('');
      setXpDialogAberto(false);
    });
  }, [xpGanhoInput, reinoAtual, cultivoXp, cultivoMap, chaveAtual, onSave, executar]);

  const handleAjustarPonto = useCallback(
    (chave, delta) => {
      if (!reinoAtual) {
        return;
      }

      const permitido = extrairPermissaoPorChave(reinoAtual, 'primarios', chave);
      if (permitido === false) {
        return;
      }

      setAlocacoesPontos(prev => {
        const atual = Number(prev[chave] ?? 0);
        const proximo = atual + delta;

        if (proximo < 0) {
          return prev;
        }

        const total = Object.values({ ...prev, [chave]: proximo }).reduce(
          (soma, valor) => soma + Number(valor || 0),
          0,
        );

        if (delta > 0 && total > pontosDisponiveis) {
          return prev;
        }

        return { ...prev, [chave]: proximo };
      });
    },
    [pontosDisponiveis, reinoAtual],
  );

  const handleConfirmarReset = useCallback(() => {
    if (!reinos.length) {
      return undefined;
    }
    const destinoId = resetCompleto ? reinos[0]?.id ?? '' : destinoResetId || reinos[0]?.id || '';
    const destinoReino = reinos.find(reino => reino.id === destinoId) ?? reinos[0] ?? null;
    if (!destinoReino) {
      return undefined;
    }
    return executar(async () => {
      const patchCultivo = criarPatchCultivo(cultivoMap, chaveAtual, {
        reinoId: destinoReino.id,
        xpAtual: 0,
      });
      await onSave({ cultivo: patchCultivo });
      setResetConfirmAberto(false);
      setResetDialogAberto(false);
      setDestinoResetId('');
      setResetCompleto(false);
    });
  }, [reinos, resetCompleto, destinoResetId, cultivoMap, chaveAtual, onSave, executar]);

  const handleConfirmarRuptura = useCallback(() => {
    if (!proximoReino) {
      return undefined;
    }
    return executar(async () => {
      const patchCultivo = criarPatchCultivo(cultivoMap, chaveAtual, {
        reinoId: proximoReino.id,
        xpAtual: 0,
      });
      await onSave({ cultivo: patchCultivo });
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
      const patchCultivo = criarPatchCultivo(cultivoMap, chaveAtual, {
        reinoId: reinoAtual.id,
        xpAtual,
      });
      await onSave({ cultivo: patchCultivo });
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
                  <Button
                    variant="contained"
                    onClick={() => setXpDialogAberto(true)}
                    sx={{
                      minWidth: 160,
                      borderRadius: '16px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                    }}
                  >
                    Experiência
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setPontosDialogAberto(true)}
                    sx={{
                      minWidth: 120,
                      borderRadius: '16px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                    }}
                  >
                    Pontos
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setResetDialogAberto(true)}
                    sx={{
                      minWidth: 140,
                      borderRadius: '16px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                    }}
                  >
                    Resetar
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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
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

      <Dialog open={xpDialogAberto} onClose={() => setXpDialogAberto(false)} fullWidth maxWidth="xs">
        <DialogHeaderRow>
          <DialogHeaderTitle style={{ flex: 1 }}>Experiência de Cultivo</DialogHeaderTitle>
          <DialogFecharButton type="button" aria-label="Fechar" onClick={() => setXpDialogAberto(false)}>
            <CloseIcon fontSize="small" />
          </DialogFecharButton>
        </DialogHeaderRow>
        <DialogContent>
          <DialogContentText>
            Informe a quantidade de experiência de cultivo que deseja adicionar ao reino atual.
          </DialogContentText>
          <TextField
            label="Experiência"
            size="small"
            value={xpGanhoInput}
            onChange={event => setXpGanhoInput(event.target.value.replace(/[^0-9]/g, ''))}
            inputMode="numeric"
            fullWidth
            sx={{ mt: 2, '& .MuiInputBase-root': { borderRadius: '16px' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setXpDialogAberto(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleGanharXp}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={pontosDialogAberto} onClose={() => setPontosDialogAberto(false)} fullWidth maxWidth="lg">
        <DialogHeaderRow>
          <DialogHeaderTitle style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Pontos de Cultivo
          </DialogHeaderTitle>
          <DialogFecharButton type="button" aria-label="Fechar" onClick={() => setPontosDialogAberto(false)}>
            <CloseIcon fontSize="small" />
          </DialogFecharButton>
        </DialogHeaderRow>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
          <div
            style={{
              background: 'linear-gradient(180deg, rgba(232,203,133,0.08), rgba(16,12,24,0.4))',
              border: '1px solid rgba(232, 203, 133, 0.18)',
              borderRadius: '18px',
              padding: '20px 18px',
              marginBottom: '18px',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <div
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                textAlign: 'center',
              }}
            >
              Pontos disponíveis
            </div>
            <div
              style={{
                textAlign: 'center',
                fontSize: '2.4rem',
                fontWeight: 700,
                color: 'var(--status-gold-strong)',
                marginTop: '8px',
                lineHeight: 1,
              }}
            >
              {pontosDisponiveis}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px',
                flexWrap: 'wrap',
                marginTop: '16px',
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
              }}
            >
              <span>Disponíveis: <strong style={{ color: 'var(--text-primary)' }}>{pontosDisponiveis}</strong></span>
              <span>Distribuídos: <strong style={{ color: 'var(--text-primary)' }}>{pontosDistribuidos}</strong></span>
              <span>Restantes: <strong style={{ color: 'var(--text-primary)' }}>{pontosRestantes}</strong></span>
            </div>
          </div>

          {carregandoReinos && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
              <CircularProgress size={22} sx={{ color: 'var(--color-primary)' }} />
            </div>
          )}

          {/* Visual definitivo: sempre mostrar as três categorias (sem ocultar por regras do reino) */}
          <div style={{ display: 'grid', gap: 18 }}>
            {/* Primários */}
            <div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setOpenPrimarios(v => !v)}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpenPrimarios(v => !v)}
                onMouseEnter={() => setHoverPrimarios(true)}
                onMouseLeave={() => setHoverPrimarios(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.02), rgba(232,203,133,0.02))',
                  border: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  transition: 'all 180ms ease',
                  boxShadow: hoverPrimarios ? '0 10px 30px rgba(232,203,133,0.06)' : 'none',
                  transform: hoverPrimarios ? 'translateY(-2px)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>⚔</span>
                  <div style={{ fontWeight: 800, letterSpacing: '0.06em' }}>ATRIBUTOS PRIMÁRIOS</div>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{openPrimarios ? '▲' : '▼'}</div>
              </div>

              {openPrimarios && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 12 }}>
                  {Object.entries(PRIMARIOS_LABELS).map(([chave, label]) => {
                    const valor = primariosTotais[chave] ?? 0;
                    const bonus = Number(alocacoesPontos[chave] ?? 0);
                    return (
                      <div key={chave} style={{ borderRadius: 12, padding: 12, background: 'rgba(12,10,16,0.6)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'box-shadow 160ms ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.78rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span aria-hidden style={{ opacity: 0.95 }}>{getIconeAtributo(chave)}</span><span style={{ letterSpacing: '0.02em' }}>{label}</span></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                          <div style={{ fontWeight: 900, fontSize: '1.6rem', color: 'var(--text-primary)', lineHeight: 1 }}>{valor}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 12, opacity: 0.9 }}>✦</span>
                            <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>+{bonus}</strong>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                          <button type="button" onClick={() => handleAjustarPonto(chave, -1)} disabled={Number(alocacoesPontos[chave] ?? 0) <= 0} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: 'var(--text-primary)' }}>−</button>
                          <div style={{ minWidth: 34, textAlign: 'center', fontWeight: 800 }}>{Number(alocacoesPontos[chave] ?? 0)}</div>
                          <button type="button" onClick={() => handleAjustarPonto(chave, 1)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(232,203,133,0.28)', background: 'rgba(232,203,133,0.04)', color: 'var(--status-gold-strong)' }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Secundários */}
            <div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setOpenSecundarios(v => !v)}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpenSecundarios(v => !v)}
                onMouseEnter={() => setHoverSecundarios(true)}
                onMouseLeave={() => setHoverSecundarios(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.015), rgba(255,255,255,0.01))',
                  border: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  transition: 'all 180ms ease',
                  boxShadow: hoverSecundarios ? '0 8px 22px rgba(0,0,0,0.28)' : 'none',
                  transform: hoverSecundarios ? 'translateY(-1px)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>◈</span>
                  <div style={{ fontWeight: 800, letterSpacing: '0.04em' }}>ATRIBUTOS SECUNDÁRIOS</div>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{openSecundarios ? '▲' : '▼'}</div>
              </div>

              {openSecundarios && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 12 }}>
                  {Object.entries(SECUNDARIOS_LABELS).map(([chave, label]) => {
                    const valor = secundariosTotais[chave] ?? 0;
                    const bonus = Number(alocacoesPontos[chave] ?? 0);
                    return (
                      <div key={chave} style={{ borderRadius: 12, padding: 12, background: 'rgba(12,10,16,0.55)', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.78rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{label}</div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                          <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-primary)', lineHeight: 1 }}>{valor}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 12, opacity: 0.9 }}>✦</span>
                            <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>+{bonus}</strong>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                          <button type="button" onClick={() => handleAjustarPonto(chave, -1)} disabled={Number(alocacoesPontos[chave] ?? 0) <= 0} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: 'var(--text-primary)' }}>−</button>
                          <div style={{ minWidth: 32, textAlign: 'center', fontWeight: 800 }}>{Number(alocacoesPontos[chave] ?? 0)}</div>
                          <button type="button" onClick={() => handleAjustarPonto(chave, 1)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(232,203,133,0.22)', background: 'rgba(232,203,133,0.03)', color: 'var(--status-gold-strong)' }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setOpenStatus(v => !v)}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpenStatus(v => !v)}
                onMouseEnter={() => setHoverStatus(true)}
                onMouseLeave={() => setHoverStatus(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.01), rgba(255,255,255,0.02))',
                  border: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  transition: 'all 180ms ease',
                  boxShadow: hoverStatus ? '0 8px 22px rgba(0,0,0,0.28)' : 'none',
                  transform: hoverStatus ? 'translateY(-1px)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>♥</span>
                  <div style={{ fontWeight: 800, letterSpacing: '0.04em' }}>STATUS</div>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{openStatus ? '▲' : '▼'}</div>
              </div>

              {openStatus && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 12 }}>
                  {Object.entries(STATUS_LABELS).map(([chave, label]) => {
                    const valor = statusMaximos[chave] ?? 0;
                    const bonus = Number(alocacoesPontos[chave] ?? 0);
                    return (
                      <div key={chave} style={{ borderRadius: 12, padding: 12, background: 'rgba(12,10,16,0.6)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.78rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{label}</div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                          <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-primary)', lineHeight: 1 }}>{valor}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 12, opacity: 0.9 }}>✦</span>
                            <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>+{bonus}</strong>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                          <button type="button" onClick={() => handleAjustarPonto(chave, -1)} disabled={Number(alocacoesPontos[chave] ?? 0) <= 0} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: 'var(--text-primary)' }}>−</button>
                          <div style={{ minWidth: 32, textAlign: 'center', fontWeight: 800 }}>{Number(alocacoesPontos[chave] ?? 0)}</div>
                          <button type="button" onClick={() => handleAjustarPonto(chave, 1)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(232,203,133,0.22)', background: 'rgba(232,203,133,0.03)', color: 'var(--status-gold-strong)' }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              // Aplicar apenas visualmente: fecha o diálogo e mantém as alocações em memória
              setPontosDialogAberto(false);
            }}
            sx={{ borderRadius: '14px', minWidth: 160 }}
          >
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resetDialogAberto} onClose={() => setResetDialogAberto(false)} fullWidth maxWidth="sm">
        <DialogHeaderRow>
          <DialogHeaderTitle style={{ flex: 1 }}>Resetar Cultivo</DialogHeaderTitle>
          <DialogFecharButton type="button" aria-label="Fechar" onClick={() => setResetDialogAberto(false)}>
            <CloseIcon fontSize="small" />
          </DialogFecharButton>
        </DialogHeaderRow>
        <DialogContent>
          <DialogContentText>Escolha até qual reino deseja retornar.</DialogContentText>
          <ResetList>
            {reinosDisponiveisParaReset.map(reino => {
              const eReinoAtual = reino.id === reinoAtual?.id;
              const eSelecionado = destinoResetId === reino.id;
              return (
                <ResetCard
                  key={reino.id}
                  type="button"
                  $selected={eSelecionado}
                  $atual={eReinoAtual}
                  onClick={() => {
                    setDestinoResetId(reino.id);
                    setResetDialogAberto(false);
                    setResetCompleto(false);
                    setResetConfirmAberto(true);
                  }}
                >
                  <ResetCardIconWrap>
                    {reino.linkImagem ? (
                      <ResetCardImage src={reino.linkImagem} alt={getNome(reino)} />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.1rem',
                          color: 'var(--color-primary)',
                        }}
                      >
                        ✦
                      </div>
                    )}
                  </ResetCardIconWrap>

                  <ResetCardContent>
                    <ResetCardTitleRow>
                      <ResetCardTitle>{getNome(reino)}</ResetCardTitle>
                      {eReinoAtual && <ResetCardBadge>Atual</ResetCardBadge>}
                    </ResetCardTitleRow>
                    <ResetCardSubtitle>
                      {eReinoAtual ? 'Reino atual' : 'Retornar para este reino'}
                    </ResetCardSubtitle>
                    {!eReinoAtual && <ResetCardHint>Progresso posterior será removido</ResetCardHint>}
                  </ResetCardContent>
                </ResetCard>
              );
            })}
          </ResetList>

          <ResetActionDivider />

          <ResetCompleteAction
            type="button"
            onClick={() => {
              setResetCompleto(true);
              setResetDialogAberto(false);
              setResetConfirmAberto(true);
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <ResetCompleteTitle>Resetar completamente</ResetCompleteTitle>
              <ResetCompleteText>Retornar ao primeiro reino de cultivo.</ResetCompleteText>
            </div>
            <span aria-hidden="true" style={{ fontSize: '1.25rem', color: 'var(--status-gold-strong)' }}>
              ↻
            </span>
          </ResetCompleteAction>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogAberto(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resetConfirmAberto} onClose={() => setResetConfirmAberto(false)} fullWidth maxWidth="sm">
        <DialogHeaderRow>
          <DialogHeaderTitle style={{ flex: 1 }}>
            {resetCompleto ? 'Resetar completamente o cultivo?' : `Retornar para ${getNome(destinoResetReino) ?? 'o reino escolhido'}?`}
          </DialogHeaderTitle>
          <DialogFecharButton type="button" aria-label="Fechar" onClick={() => setResetConfirmAberto(false)}>
            <CloseIcon fontSize="small" />
          </DialogFecharButton>
        </DialogHeaderRow>
        <DialogContent>
          <DialogContentText>
            {resetCompleto
              ? 'Todo o progresso de cultivo será removido e o personagem retornará ao primeiro estágio.'
              : 'Todo o progresso dos reinos posteriores será removido.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetConfirmAberto(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleConfirmarReset}>
            Confirmar Reset
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={tribulacaoAberta} onClose={() => setTribulacaoAberta(false)}>
        <div style={{ ...TribulacaoPaperStyles, padding: '14px 20px' }}>
          <ModalTitle>Tribulação</ModalTitle>
          <TitleDivider />

          <DialogContent>
            <ModalDescription>
              Para concluir a <strong>Ruptura</strong> e ascender para{' '}
              <strong>{proximoReino ? getNome(proximoReino) : 'Formação da Gema'}</strong>, o personagem
              precisa superar a <strong>Tribulação</strong>. Ao confirmar, o Cultivo volta a zero e as
              estrelas reiniciam no novo Reino.
            </ModalDescription>
            <HighlightWarning aria-hidden>
              <span style={{ fontSize: '1rem' }}>⚠</span>
              <span>Ao avançar, os pontos disponíveis serão perdidos.</span>
            </HighlightWarning>
          </DialogContent>

          <div style={{ paddingTop: 12 }}>
            <ActionsRow>
              <CancelButton onClick={() => setTribulacaoAberta(false)}>Cancelar</CancelButton>

              <FailedStatus
                color="error"
                variant="outlined"
                startIcon={<HeartBrokenIcon fontSize="small" />}
                onClick={handleAbrirFalhaTribulacao}
              >
                <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
                  <span style={{ fontSize: '0.78rem' }}>Falhou na</span>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800 }}>Tribulação</span>
                </span>
              </FailedStatus>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <PrimaryButton variant="contained" onClick={handleConfirmarRuptura}>
                  Superar Tribulação
                </PrimaryButton>
              </div>
            </ActionsRow>
          </div>
        </div>
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
