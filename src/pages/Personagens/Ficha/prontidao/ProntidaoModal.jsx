import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Tabs, Tab, Box, Typography, Stack, Chip, TextField, InputAdornment, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import RepeatOutlinedIcon from '@mui/icons-material/RepeatOutlined';
import FlashOnOutlinedIcon from '@mui/icons-material/FlashOnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import NightlightOutlinedIcon from '@mui/icons-material/NightlightOutlined';

import {
  ACOES_PRONTIDAO,
  CATEGORIAS_ACOES_PRONTIDAO,
  CUSTOS_PROGRESSIVOS_PRONTIDAO,
  TOKENS_ACAO_PRONTIDAO,
  calcularCustoPpAcao,
  calcularPpMaximo,
  calcularRecuperacaoPp,
  criarDetalhesAcao,
  getTokensAcao,
  normalizarEstadoCombate,
  normalizarTurnoTexto,
} from './config';
import { getItensInventario, removeItemInventario, updateItemInventario } from 'service/storage';
import { QUALIDADE_META, obterEmojiTipo } from 'pages/Personagens/Ficha/inventario/constants';

const categoriaPorId = new Map(CATEGORIAS_ACOES_PRONTIDAO.map(categoria => [categoria.id, categoria.label]));

const formatarTipoAcao = categoria => categoriaPorId.get(categoria) ?? 'Ação';

const ICONES_TOKENS = {
  unica: BoltOutlinedIcon,
  reativa: ShieldOutlinedIcon,
  repetivel: RepeatOutlinedIcon,
  instantanea: FlashOnOutlinedIcon,
  preparacao: AccessTimeOutlinedIcon,
  condicional: LockOutlinedIcon,
  descanso: NightlightOutlinedIcon,
};

const renderizarTokens = tokens =>
  (tokens ?? []).map(token => {
    const Icon = ICONES_TOKENS[token.id] ?? BoltOutlinedIcon;
    const tokenConfig = TOKENS_ACAO_PRONTIDAO[token.id] ?? token;

    return (
      <Tooltip key={token.id} title={tokenConfig.descricao ?? tokenConfig.nome ?? token.id}>
        <Box component="span">
          <Chip
            size="small"
            icon={<Icon fontSize="small" />}
            label={tokenConfig.nome ?? token.id}
            sx={{
              background: tokenConfig.cor ?? 'rgba(232,203,133,0.12)',
              color: tokenConfig.textColor ?? '#f4dda2',
              border: '1px solid rgba(232,203,133,0.24)',
              height: 24,
              '& .MuiChip-label': { px: 0.75, fontSize: '0.63rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 },
              '& .MuiChip-icon': { color: tokenConfig.textColor ?? '#f4dda2', ml: 0.75 },
            }}
          />
        </Box>
      </Tooltip>
    );
  });

const normalizarTextoBusca = valor => {
  if (typeof valor !== 'string') {
    return '';
  }

  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

const itemEhElegivelParaUso = item => {
  if (!item || Number(item.quantidade ?? 0) <= 0) {
    return false;
  }

  const texto = [
    item.tipo,
    item.categoria,
    item.subtipo,
    item.nome,
    item.descricao,
    item.extra,
    item.dados,
    item.habilidadesEspeciais,
  ]
    .flatMap(valor => (Array.isArray(valor) ? valor : [valor]))
    .filter(Boolean)
    .join(' ');

  const textoNormalizado = normalizarTextoBusca(texto);
  const eArmaOuEquipamento = /(arma|armadura|escudo|equipamento|adaga|lanca|lança|arco|espada|besta|machado|martelo|faca|armas|armaduras|escudos|botas|capacete|luvas|colar|anel|manto|vestimenta|brinco|capa)/i.test(textoNormalizado);
  const eConsumivelExplicito = /(pocoes?|pocao|consumiveis?|consumivel|elixires?|elixir|remedios?|remedio|itens? de uso|recurso(?:s)? de uso|recurso(?:s)? consumiveis?|kits? de uso|pocoes? de|pocao de)/i.test(textoNormalizado);

  if (item?.consumivel === true || item?.usavel === true || item?.elegivelParaUso === true) {
    return true;
  }

  if (eArmaOuEquipamento && !eConsumivelExplicito) {
    return false;
  }

  return eConsumivelExplicito;
};

const tituloBarraCor = ppDisponivel => {
  if (ppDisponivel <= 0) return '#ef4444';
  if (ppDisponivel <= 0.35) return '#f97316';
  if (ppDisponivel <= 0.7) return '#fbbf24';
  return '#e8cb85';
};

const getBarraAcoes = (estadoCombate, ppMaximo) => {
  const disponivel = Number(estadoCombate.ppAtual ?? 0) || 0;
  const gastoNoCiclo = Math.max(0, ppMaximo - disponivel);
  return {
    porcentagem: ppMaximo > 0 ? (disponivel / ppMaximo) * 100 : 0,
    gastoNoCiclo,
    restantes: disponivel,
    maximo: ppMaximo,
  };
};

const MODALIDADES_DESCANSO = {
  curto: {
    id: 'curto',
    nome: 'DESCANSO CURTO',
    icone: '☀️',
    percentual: 40,
    descricao: 'Uma pausa breve para recuperar parte da Saúde, Energia e restaurar a Fadiga.',
  },
  longo: {
    id: 'longo',
    nome: 'DESCANSO LONGO',
    icone: '🌙',
    percentual: 80,
    descricao: 'Um período prolongado de repouso para recuperar grande parte dos recursos do personagem.',
  },
};

const formatarTextoEfeitoItem = valor => {
  if (valor == null) {
    return '';
  }

  const texto = String(valor).trim();
  if (!texto) {
    return '';
  }

  return texto
    .replace(/\s*\+\s*/g, ' + ')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s*\*\s*/g, ' * ')
    .replace(/\s+/g, ' ')
    .replace(/\b([0-9]+)d([0-9]+)\s*\+\s*([0-9]+)\b/ig, '$1d$2 + $3')
    .replace(/\b([0-9]+)d([0-9]+)\s*-\s*([0-9]+)\b/ig, '$1d$2 - $3')
    .replace(/\b([0-9]+)d([0-9]+)\b/ig, '$1d$2');
};

const parsearEfeitoDado = valor => {
  if (valor == null) {
    return null;
  }

  const texto = String(valor).trim();
  if (!texto) {
    return null;
  }

  const normalizado = texto.replace(/×/g, 'x').replace(/\s+/g, ' ');
  const matchDado = normalizado.match(/(\d+)\s*d\s*(\d+)(?:\s*([+-])\s*(\d+))?/i);
  if (matchDado) {
    const quantidade = Number(matchDado[1] ?? 0);
    const lados = Number(matchDado[2] ?? 0);
    const sinal = matchDado[3] ?? '+';
    const bonus = Number(matchDado[4] ?? 0);
    const textoFormatado = `${quantidade}d${lados}${bonus === 0 ? '' : ` ${sinal} ${Math.abs(bonus)}`}`;
    return {
      tipo: 'dados',
      quantidadeDados: quantidade,
      lados,
      bonus,
      sinal,
      texto: textoFormatado,
      valor: Number.isFinite(quantidade) && Number.isFinite(lados) ? quantidade * lados : 0,
    };
  }

  const matchNumerico = normalizado.match(/[-+]?\d+(?:\.\d+)?/);
  if (matchNumerico) {
    const numero = Number(matchNumerico[0]);
    return {
      tipo: 'numerico',
      quantidadeDados: 0,
      lados: 0,
      bonus: numero,
      sinal: numero >= 0 ? '+' : '-',
      texto: String(numero),
      valor: numero,
    };
  }

  return null;
};

const getEfeitoItem = item => {
  if (!item) {
    return null;
  }

  const fontes = [item.extra, item.dados, item.descricao, item.habilidadesEspeciais, item.nome, item.tipo].flatMap(valor =>
    Array.isArray(valor) ? valor : [valor],
  );

  for (const fonte of fontes) {
    const efeito = parsearEfeitoDado(fonte);
    if (efeito) {
      return {
        ...efeito,
        texto: formatarTextoEfeitoItem(efeito.texto),
      };
    }
  }

  const textoDescricao = `${item?.nome ?? ''} ${item?.descricao ?? ''} ${item?.extra ?? ''}`.trim();
  return /\d+d\d+/i.test(textoDescricao) ? { tipo: 'dados', texto: 'Efeito em dados' } : null;
};

const getItemImagem = item => {
  if (item?.linkImagem) {
    return <img src={item.linkImagem} alt={item.nome || 'Item'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />;
  }

  return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '2rem' }}>{obterEmojiTipo(item?.tipo)}</Box>;
};

const obterStatusReal = (personagem, tipo, alias = tipo) => {
  const status = personagem?.status ?? {};
  return status[tipo] ?? status[alias] ?? {};
};

const obterStatusAtual = (personagem, tipo, alias = tipo) => {
  const item = obterStatusReal(personagem, tipo, alias);
  const valor = Number(item?.atual ?? item?.valor ?? 0);
  return Number.isFinite(valor) ? Math.max(0, valor) : 0;
};

const obterStatusMaximo = (personagem, tipo, alias = tipo) => {
  const item = obterStatusReal(personagem, tipo, alias);
  const maximos = personagem?.statusMaximos ?? {};
  const valor = Number(maximos[tipo] ?? maximos[alias] ?? item?.maximo ?? 0);
  return Number.isFinite(valor) ? Math.max(0, valor) : 0;
};

const calcularRecuperacaoStatus = (personagem, percentual) => {
  const percentualRecuperacao = Math.max(0, Number(percentual ?? 0) || 0);
  const saudeAtual = obterStatusAtual(personagem, 'hp', 'saude');
  const saudeMaxima = obterStatusMaximo(personagem, 'hp', 'saude');
  const energiaAtual = obterStatusAtual(personagem, 'energia');
  const energiaMaxima = obterStatusMaximo(personagem, 'energia');
  const fadigaAtual = obterStatusAtual(personagem, 'fadiga');
  const fadigaMaxima = obterStatusMaximo(personagem, 'fadiga');

  // A recuperação por descanso usa a mesma convenção de arredondamento do restante do sistema.
  const recuperaSaude = Math.round((saudeMaxima * percentualRecuperacao) / 100);
  const recuperaEnergia = Math.round((energiaMaxima * percentualRecuperacao) / 100);
  const recuperaFadiga = Math.round((fadigaMaxima * percentualRecuperacao) / 100);

  return {
    saudeAtual,
    saudeMaxima,
    proximaSaude: Math.min(saudeMaxima, saudeAtual + recuperaSaude),
    energiaAtual,
    energiaMaxima,
    proximaEnergia: Math.min(energiaMaxima, energiaAtual + recuperaEnergia),
    fadigaAtual,
    fadigaMaxima,
    proximaFadiga: Math.min(fadigaMaxima, fadigaAtual + recuperaFadiga),
  };
};

const ProntidaoModal = ({ open, onClose, personagem, onSave, prontidaoValor, tipo = 'central' }) => {
  const ppMaximo = calcularPpMaximo(prontidaoValor);
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');
  const [pesquisa, setPesquisa] = useState('');
  const [confirmarNovoTurno, setConfirmarNovoTurno] = useState(false);
  const [confirmarResetTurnos, setConfirmarResetTurnos] = useState(false);
  const [confirmarDescanso, setConfirmarDescanso] = useState(false);
  const [confirmarDescansoEmAndamento, setConfirmarDescansoEmAndamento] = useState(false);
  const [confirmarAcaoExtra, setConfirmarAcaoExtra] = useState(false);
  const [confirmarAuxiliarAliado, setConfirmarAuxiliarAliado] = useState(false);
  const [dadosAuxiliarAliado, setDadosAuxiliarAliado] = useState({ aliado: '', tipoAjuda: 'Ataque', descricao: '' });
  const [acaoDetalhada, setAcaoDetalhada] = useState(null);
  const [modoDescansoSelecionado, setModoDescansoSelecionado] = useState(null);
  const [usarItemDialogAberto, setUsarItemDialogAberto] = useState(false);
  const [itemUsoEtapa, setItemUsoEtapa] = useState('lista');
  const [itemUsoSelecionado, setItemUsoSelecionado] = useState(null);
  const [statusUsoItem, setStatusUsoItem] = useState([]);
  const [itemUsoRolagem, setItemUsoRolagem] = useState(null);
  const [confirmandoUsoItem, setConfirmandoUsoItem] = useState(false);
  const [itensInventario, setItensInventario] = useState([]);
  const [estadoCombate, setEstadoCombate] = useState(() => normalizarEstadoCombate(personagem, ppMaximo));
  const listaAcoesRef = useRef(null);

  const acaoExtraAtiva = Boolean(estadoCombate.acaoExtra?.status === 'pendente' && Number(estadoCombate.acaoExtra.turno ?? estadoCombate.turno) === Number(estadoCombate.turno));
  const limiteAcaoExtra = Number(estadoCombate.acaoExtra?.limiteCusto ?? 0) || 0;
  const custoAcaoExtra = calcularCustoPpAcao(ppMaximo, 'acao-extra');

  useEffect(() => {
    if (!open) return;
    const proximo = normalizarEstadoCombate(personagem, ppMaximo);
    setEstadoCombate(proximo);
  }, [open, personagem, ppMaximo]);

  useEffect(() => {
    if (!open || !personagem?.id) return;

    let ativo = true;
    const carregarItensInventario = async () => {
      const itens = await getItensInventario(personagem.id);
      if (ativo) {
        setItensInventario(Array.isArray(itens) ? itens : []);
      }
    };

    carregarItensInventario();
    return () => {
      ativo = false;
    };
  }, [open, personagem?.id]);

  const itensUsaveis = useMemo(
    () => itensInventario.filter(item => itemEhElegivelParaUso(item)),
    [itensInventario],
  );

  const getRecursoPadraoItem = item => {
    const textoItem = `${item?.nome ?? ''} ${item?.descricao ?? ''} ${item?.extra ?? ''}`.toLowerCase();

    if (/fadiga|fatiga/.test(textoItem)) {
      return 'Fadiga';
    }

    if (/energia|mana/.test(textoItem)) {
      return 'Energia';
    }

    if (/saude|vida|cura|hp/.test(textoItem)) {
      return 'Saúde';
    }

    return 'Fadiga';
  };

  const acoesFiltradas = useMemo(() => {
    const base = categoriaAtiva === 'todas'
      ? ACOES_PRONTIDAO
      : ACOES_PRONTIDAO.filter(acao => acao.categoria === categoriaAtiva);

    const termoPesquisa = normalizarTextoBusca(pesquisa);
    if (!termoPesquisa) {
      return base;
    }

    return base.filter(acao => {
      const textoBusca = [
        acao.nome,
        acao.descricao,
        formatarTipoAcao(acao.categoria),
        acao.categoria,
      ].join(' ');

      return normalizarTextoBusca(textoBusca).includes(termoPesquisa);
    });
  }, [categoriaAtiva, pesquisa]);

  useEffect(() => {
    if (listaAcoesRef.current) {
      listaAcoesRef.current.scrollTop = 0;
    }
  }, [categoriaAtiva, pesquisa]);

  const barra = getBarraAcoes(estadoCombate, ppMaximo);
  const mostrarBotaoLimparPesquisa = Boolean(pesquisa) && acoesFiltradas.length > 0;
  const detalhesAcaoSelecionada = acaoDetalhada ? criarDetalhesAcao(acaoDetalhada, ppMaximo) : null;
  const previsaoDescanso = useMemo(() => {
    if (!modoDescansoSelecionado) return null;
    const modo = MODALIDADES_DESCANSO[modoDescansoSelecionado];
    return modo ? calcularRecuperacaoStatus(personagem, modo.percentual) : null;
  }, [modoDescansoSelecionado, personagem]);

  const registrarHistorico = (nome, valor, turno, restante, tipoHistorico = 'acao') => {
    const randomSufixo = typeof Math.random === 'function'
      ? (Math.random?.() ?? 0).toString(16).slice(2, 7)
      : String(Date.now()).slice(-6);

    return {
      id: `${tipoHistorico}-${Date.now()}-${randomSufixo}`,
      nome,
      custo: valor,
      turno: normalizarTurnoTexto(turno),
      restante,
    };
  };

  const acaoJaExecutadaNoTurno = acaoId => {
    if (!acaoId) {
      return false;
    }

    const nomesPorId = {
      atacar: 'Atacar',
      'ataque-duplo': 'Ataque Duplo',
      'usar-habilidade': 'Usar Habilidade / Arte',
    };

    const nomeAcao = nomesPorId[acaoId];
    if (!nomeAcao) {
      return false;
    }

    return estadoCombate.historicoAcoes.some(item => item?.nome === nomeAcao && item?.turno === `Turno ${estadoCombate.turno}`);
  };

  const acaoElegivelGratis = acao => {
    if (!acaoExtraAtiva || acao.id === 'acao-extra') {
      return false;
    }

    if (acao.custoPendente || !acao.id || !CUSTOS_PROGRESSIVOS_PRONTIDAO[acao.id]) {
      return false;
    }

    const custo = calcularCustoPpAcao(ppMaximo, acao.id);
    if (!Number.isFinite(custo) || custo <= 0) {
      return false;
    }

    if (custo > limiteAcaoExtra) {
      return false;
    }

    if (estadoCombate.acaoExtra?.usosRestantes <= 0) {
      return false;
    }

    if (['atacar', 'ataque-duplo', 'usar-habilidade'].includes(acao.id) && acaoJaExecutadaNoTurno(acao.id)) {
      return false;
    }

    if (estadoCombate.descansando && !acao.reativa) {
      return false;
    }

    return true;
  };

  const confirmarAcao = async acao => {
    if (acaoExtraAtiva && acaoElegivelGratis(acao)) {
      const proximoHistorico = [
        registrarHistorico(`${acao.nome} (grátis)`, `0 PP`, estadoCombate.turno, estadoCombate.ppAtual),
        ...estadoCombate.historicoAcoes,
      ].slice(0, 12);

      const proximoEstado = {
        ...estadoCombate,
        acaoExtra: {
          ...estadoCombate.acaoExtra,
          usosRestantes: 0,
          status: 'consumido',
        },
        historicoAcoes: proximoHistorico,
      };

      setEstadoCombate(proximoEstado);
      if (onSave) {
        await onSave({ estadoCombate: proximoEstado });
      }
      return;
    }

    const custo = acao.id === 'recuperar-se' || acao.id === 'descansar'
      ? 0
      : acao.custoPendente || !acao.id || !CUSTOS_PROGRESSIVOS_PRONTIDAO[acao.id]
        ? NaN
        : calcularCustoPpAcao(ppMaximo, acao.id);

    if (acao.id === 'usar-item') {
      if (itensUsaveis.length === 0) {
        return;
      }
      setUsarItemDialogAberto(true);
      return;
    }

    if (acao.custoPendente || (!acao.id || (!CUSTOS_PROGRESSIVOS_PRONTIDAO[acao.id] && acao.id !== 'recuperar-se' && acao.id !== 'descansar'))) {
      return;
    }

    if (!Number.isFinite(custo) || custo < 0) {
      return;
    }

    if (estadoCombate.descansando && !acao.reativa) {
      return;
    }

    if (['atacar', 'ataque-duplo', 'usar-habilidade'].includes(acao.id) && acaoJaExecutadaNoTurno(acao.id)) {
      return;
    }

    if (acao.id === 'acao-extra') {
      if (acaoExtraAtiva || estadoCombate.acaoExtra?.status === 'pendente') {
        return;
      }
      if (estadoCombate.ppAtual < custoAcaoExtra) {
        return;
      }
      setConfirmarAcaoExtra(true);
      return;
    }

    if (acao.id === 'auxiliar-aliado') {
      const custoAuxiliarAliado = calcularCustoPpAcao(ppMaximo, 'auxiliar-aliado');
      if (estadoCombate.ppAtual < custoAuxiliarAliado) {
        return;
      }
      setConfirmarAuxiliarAliado(true);
      return;
    }

    if (acao.id === 'recuperar-se') {
      if (estadoCombate.recuperacaoUtilizada || estadoCombate.ppAtual >= ppMaximo || estadoCombate.descansando) {
        return;
      }

      const recuperacao = Math.min(calcularRecuperacaoPp(ppMaximo, 0.2), Math.max(0, ppMaximo - estadoCombate.ppAtual));
      if (recuperacao <= 0) {
        return;
      }

      const proximoAtual = Math.min(ppMaximo, estadoCombate.ppAtual + recuperacao);
      const proximoHistorico = [
        registrarHistorico('Recuperar-se', `+${recuperacao} PP`, estadoCombate.turno, proximoAtual),
        ...estadoCombate.historicoAcoes,
      ].slice(0, 12);

      const proximoEstado = {
        ...estadoCombate,
        ppAtual: proximoAtual,
        recuperacaoUtilizada: true,
        historicoAcoes: proximoHistorico,
      };

      setEstadoCombate(proximoEstado);
      if (onSave) {
        await onSave({ estadoCombate: proximoEstado });
      }
      return;
    }

    if (acao.id === 'descansar') {
      if (estadoCombate.descansando) {
        return;
      }
      setConfirmarDescanso(true);
      return;
    }

    if (estadoCombate.ppAtual < custo) {
      return;
    }

    const proximoAtual = Math.max(0, estadoCombate.ppAtual - custo);
    const proximoHistorico = [
      registrarHistorico(acao.nome, `-${custo} PP`, estadoCombate.turno, proximoAtual),
      ...estadoCombate.historicoAcoes,
    ].slice(0, 12);

    const proximoEstado = {
      ...estadoCombate,
      ppAtual: proximoAtual,
      historicoAcoes: proximoHistorico,
    };

    setEstadoCombate(proximoEstado);
    if (onSave) {
      await onSave({ estadoCombate: proximoEstado });
    }
  };

  const confirmarDescansoAgora = async () => {
    if (!modoDescansoSelecionado || confirmarDescansoEmAndamento) {
      return;
    }

    const modo = MODALIDADES_DESCANSO[modoDescansoSelecionado];
    if (!modo) {
      return;
    }

    try {
      setConfirmarDescansoEmAndamento(true);
          const { saudeAtual, saudeMaxima, proximaSaude, energiaAtual, energiaMaxima, proximaEnergia, fadigaAtual, fadigaMaxima, proximaFadiga } = calcularRecuperacaoStatus(personagem, modo.percentual);
      const statusAtual = personagem?.status ?? {};
      const hpAtual = statusAtual.hp ?? statusAtual.saude ?? {};
      const energiaAtualEntry = statusAtual.energia ?? {};
      const fadigaAtualEntry = statusAtual.fadiga ?? {};

      const proximoStatus = {
        ...statusAtual,
        hp: {
          ...hpAtual,
          atual: proximaSaude,
          maximo: saudeMaxima || hpAtual.maximo || proximaSaude,
        },
        ...(Object.prototype.hasOwnProperty.call(statusAtual, 'saude') || Object.prototype.hasOwnProperty.call(personagem?.statusMaximos ?? {}, 'saude') || Object.prototype.hasOwnProperty.call(statusAtual, 'hp')
          ? {
              saude: {
                ...((statusAtual.saude ?? statusAtual.hp ?? {})),
                atual: proximaSaude,
                maximo: saudeMaxima || (statusAtual.saude ?? statusAtual.hp ?? {}).maximo || proximaSaude,
              },
            }
          : {}),
        energia: {
          ...energiaAtualEntry,
          atual: proximaEnergia,
          maximo: energiaMaxima || energiaAtualEntry.maximo || proximaEnergia,
        },
        fadiga: {
          ...fadigaAtualEntry,
          atual: proximaFadiga,
          maximo: fadigaMaxima || fadigaAtualEntry.maximo || proximaFadiga,
        },
      };

      const proximoStatusMaximos = {
        ...(personagem?.statusMaximos ?? {}),
        hp: saudeMaxima,
        ...(Object.prototype.hasOwnProperty.call(personagem?.statusMaximos ?? {}, 'saude') || Object.prototype.hasOwnProperty.call(statusAtual, 'saude')
          ? { saude: saudeMaxima }
          : {}),
        energia: energiaMaxima,
        fadiga: fadigaMaxima,
      };

      const proximoAtual = ppMaximo;
      const proximoHistorico = [
        registrarHistorico(
          'Descansar',
          `Saúde ${saudeAtual}→${proximaSaude} • Energia ${energiaAtual}→${proximaEnergia} • Fadiga ${fadigaAtual}→${proximaFadiga} • PP ${estadoCombate.ppAtual}→${proximoAtual}`,
          estadoCombate.turno,
          proximoAtual,
        ),
        ...estadoCombate.historicoAcoes,
      ].slice(0, 12);

      const proximoEstado = {
        ...estadoCombate,
        ppAtual: proximoAtual,
        descansando: true,
        recuperacaoUtilizada: true,
        historicoAcoes: proximoHistorico,
      };

      setConfirmarDescanso(false);
      setModoDescansoSelecionado(null);
      setEstadoCombate(proximoEstado);

      if (onSave) {
        await onSave({
          estadoCombate: proximoEstado,
          status: proximoStatus,
          statusMaximos: proximoStatusMaximos,
        });
      }
    } finally {
      setConfirmarDescansoEmAndamento(false);
    }
  };

  const limparUsoItem = () => {
    setUsarItemDialogAberto(false);
    setItemUsoEtapa('lista');
    setItemUsoSelecionado(null);
    setStatusUsoItem([]);
    setItemUsoRolagem(null);
    setConfirmandoUsoItem(false);
  };

  const calcularResultadoItem = item => {
    if (!item) {
      return 0;
    }

    const efeitoItem = getEfeitoItem(item);
    if (!efeitoItem || efeitoItem.tipo !== 'dados') {
      return 0;
    }

    let total = 0;
    for (let index = 0; index < Number(efeitoItem.quantidadeDados ?? 0); index += 1) {
      total += 1 + Math.floor(Math.random() * Number(efeitoItem.lados ?? 1));
    }

    const multiplicador = efeitoItem.sinal === '-' ? -1 : 1;
    total += multiplicador * Number(efeitoItem.bonus ?? 0);
    return total;
  };

  const rolarUsoItem = () => {
    if (!itemUsoSelecionado) {
      return;
    }

    const total = calcularResultadoItem(itemUsoSelecionado);
    setItemUsoRolagem(total);
  };

  const getValorRecuperacaoItem = (itemUsado, valorRolado = null) => {
    if (!itemUsado) {
      return 0;
    }

    const efeitoItem = getEfeitoItem(itemUsado);
    if (!efeitoItem) {
      return 0;
    }

    if (efeitoItem.tipo === 'dados') {
      return Number.isFinite(Number(valorRolado)) ? Number(valorRolado) : 0;
    }

    return Number(efeitoItem.valor ?? 0) || 0;
  };

  const getPrevisaoUsoItem = () => {
    if (!itemUsoSelecionado) {
      return null;
    }

    const valorRecuperacao = getValorRecuperacaoItem(itemUsoSelecionado, itemUsoRolagem);
    const statusAtual = personagem?.status ?? {};
    const statusMaximos = personagem?.statusMaximos ?? {};

    const construirStatus = statusId => {
      const chave = statusId === 'saude' ? 'hp' : statusId;
      const atual = Number((statusAtual[chave] ?? statusAtual[statusId] ?? {}).atual ?? 0) || 0;
      const maximo = Number(statusMaximos[chave] ?? statusMaximos[statusId] ?? (statusAtual[chave] ?? statusAtual[statusId] ?? {}).maximo ?? 0) || 0;
      const proximo = Math.min(maximo, atual + (statusUsoItem.includes(statusId) ? valorRecuperacao : 0));
      return { atual, maximo, proximo };
    };

    return {
      saude: construirStatus('saude'),
      energia: construirStatus('energia'),
      fadiga: construirStatus('fadiga'),
    };
  };

  const confirmarUsoItem = async (itemUsado, recursoSelecionado = null, statusSelecionadosCustom = [], rolagemPersonalizada = null) => {
    if (!itemEhElegivelParaUso(itemUsado)) {
      return;
    }

    const statusSelecionados = statusSelecionadosCustom.length > 0 ? statusSelecionadosCustom : [recursoSelecionado ? recursoSelecionado.toLowerCase() : getRecursoPadraoItem(itemUsado).toLowerCase()];
    if (statusSelecionados.length === 0 || statusSelecionados.every(statusId => !statusId)) {
      return;
    }

    const efeitoItem = getEfeitoItem(itemUsado);
    const valorRecuperacao = efeitoItem?.tipo === 'dados'
      ? Number(rolagemPersonalizada ?? itemUsoRolagem ?? 0)
      : Number(efeitoItem?.valor ?? 0) || 0;

    if (efeitoItem?.tipo === 'dados' && (!Number.isFinite(valorRecuperacao) || valorRecuperacao <= 0)) {
      return;
    }

    const proximoStatus = { ...(personagem?.status ?? {}) };
    const proximoStatusMaximos = { ...(personagem?.statusMaximos ?? {}) };

    statusSelecionados.forEach(statusId => {
      const chave = statusId === 'saude' ? 'hp' : statusId;
      const statusAtual = proximoStatus[chave] ?? proximoStatus[statusId] ?? {};
      const maximoAtual = Number(proximoStatusMaximos[chave] ?? proximoStatusMaximos[statusId] ?? statusAtual.maximo ?? 0) || 0;
      const atualAtual = Number(statusAtual.atual ?? 0) || 0;
      const proximoValor = Math.min(maximoAtual, atualAtual + valorRecuperacao);

      proximoStatus[chave] = {
        ...statusAtual,
        atual: proximoValor,
        maximo: maximoAtual || statusAtual.maximo || proximoValor,
      };

      if (statusId === 'saude') {
        proximoStatus.hp = {
          ...proximoStatus.hp,
          atual: proximoValor,
          maximo: maximoAtual || Number((proximoStatus.hp ?? {}).maximo ?? 0) || proximoValor,
        };
        if (proximoStatus.saude) {
          proximoStatus.saude = {
            ...proximoStatus.saude,
            atual: proximoValor,
            maximo: maximoAtual || Number((proximoStatus.saude ?? {}).maximo ?? 0) || proximoValor,
          };
        }
      }

      proximoStatusMaximos[chave] = maximoAtual || Number(statusAtual.maximo ?? 0) || proximoValor;
    });

    const proximoAtual = estadoCombate.ppAtual;
    const proximoHistorico = [
      registrarHistorico(itemUsado.nome || 'Item usado', `${valorRecuperacao > 0 ? '+' : ''}${valorRecuperacao} status`, estadoCombate.turno, proximoAtual),
      ...estadoCombate.historicoAcoes,
    ].slice(0, 12);

    const proximoEstado = {
      ...estadoCombate,
      historicoAcoes: proximoHistorico,
    };

    const proximaQuantidade = Number(itemUsado.quantidade ?? 1) - 1;

    setConfirmandoUsoItem(true);

    try {
      if (proximaQuantidade <= 0) {
        await removeItemInventario(personagem.id, itemUsado.id);
      } else {
        await updateItemInventario(personagem.id, itemUsado.id, { quantidade: proximaQuantidade });
      }

      setUsarItemDialogAberto(false);
      setItemUsoEtapa('lista');
      setItemUsoSelecionado(null);
      setStatusUsoItem([]);
      setItemUsoRolagem(null);
      setEstadoCombate(proximoEstado);
      setItensInventario(itensInventario =>
        itensInventario
          .map(item => (item.id === itemUsado.id ? { ...item, quantidade: Math.max(0, Number(item.quantidade ?? 1) - 1) } : item))
          .filter(item => Number(item.quantidade ?? 0) > 0),
      );

      if (onSave) {
        await onSave({
          estadoCombate: proximoEstado,
          status: proximoStatus,
          statusMaximos: proximoStatusMaximos,
        });
      }
    } finally {
      setConfirmandoUsoItem(false);
    }
  };

  const confirmarAcaoExtraAgora = async () => {
    if (estadoCombate.ppAtual < custoAcaoExtra || acaoExtraAtiva || estadoCombate.acaoExtra?.status === 'pendente') {
      setConfirmarAcaoExtra(false);
      return;
    }

    const proximoAtual = Math.max(0, estadoCombate.ppAtual - custoAcaoExtra);
    const proximoEstado = {
      ...estadoCombate,
      ppAtual: proximoAtual,
      acaoExtra: {
        id: 'acao-extra',
        personagemId: personagem?.id ?? null,
        turno: estadoCombate.turno,
        custoPago: custoAcaoExtra,
        limiteCusto: custoAcaoExtra,
        usosRestantes: 1,
        status: 'pendente',
      },
      historicoAcoes: [
        registrarHistorico('Ação Extra', `-${custoAcaoExtra} PP`, estadoCombate.turno, proximoAtual),
        ...estadoCombate.historicoAcoes,
      ].slice(0, 12),
    };

    setConfirmarAcaoExtra(false);
    setEstadoCombate(proximoEstado);
    if (onSave) {
      await onSave({ estadoCombate: proximoEstado });
    }
  };

  const cancelarSelecaoAcaoExtra = async () => {
    const custoPago = Number(estadoCombate.acaoExtra?.custoPago ?? custoAcaoExtra ?? 0) || 0;
    if (!estadoCombate.acaoExtra || estadoCombate.acaoExtra.status !== 'pendente') {
      return;
    }

    const proximoAtual = Math.min(ppMaximo, Math.max(0, Number(estadoCombate.ppAtual ?? 0) + custoPago));
    const proximoEstado = {
      ...estadoCombate,
      ppAtual: proximoAtual,
      acaoExtra: null,
      historicoAcoes: [
        registrarHistorico('Ação Extra cancelada', `+${custoPago} PP`, estadoCombate.turno, proximoAtual),
        ...estadoCombate.historicoAcoes.filter(item => !(item?.nome === 'Ação Extra' && item?.turno === `Turno ${estadoCombate.turno}`)),
      ].slice(0, 12),
    };

    setEstadoCombate(proximoEstado);
    if (onSave) {
      await onSave({ estadoCombate: proximoEstado });
    }
  };

  const confirmarAuxiliarAliadoAgora = async () => {
    const aliado = dadosAuxiliarAliado.aliado.trim();
    const descricao = dadosAuxiliarAliado.descricao.trim();
    const custoAuxiliarAliado = calcularCustoPpAcao(ppMaximo, 'auxiliar-aliado');

    if (!aliado || !descricao || estadoCombate.ppAtual < custoAuxiliarAliado) {
      return;
    }

    const proximoAtual = Math.max(0, estadoCombate.ppAtual - custoAuxiliarAliado);
    const proximoHistorico = [
      registrarHistorico('Auxiliar Aliado', `-${custoAuxiliarAliado} PP`, estadoCombate.turno, proximoAtual),
      ...estadoCombate.historicoAcoes,
    ].slice(0, 12);

    const proximoEstado = {
      ...estadoCombate,
      ppAtual: proximoAtual,
      historicoAcoes: proximoHistorico,
    };

    setConfirmarAuxiliarAliado(false);
    setDadosAuxiliarAliado({ aliado: '', tipoAjuda: 'Ataque', descricao: '' });
    setEstadoCombate(proximoEstado);
    if (onSave) {
      await onSave({ estadoCombate: proximoEstado });
    }
  };

  const iniciarNovoTurno = async () => {
    const proximoTurno = Number(estadoCombate.turno ?? 1) + 1;
    const acaoExtraExpirada = estadoCombate.acaoExtra?.status === 'pendente'
      ? { ...estadoCombate.acaoExtra, status: 'expirado', usosRestantes: 0 }
      : estadoCombate.acaoExtra;

    const proximoEstado = {
      ...estadoCombate,
      turno: proximoTurno,
      ppAtual: ppMaximo,
      recuperacaoUtilizada: false,
      descansando: false,
      acaoExtra: acaoExtraExpirada,
      historicoAcoes: [
        registrarHistorico('Prontidão restaurada', '0 PP', proximoTurno, ppMaximo, 'turno'),
        ...estadoCombate.historicoAcoes,
      ].slice(0, 12),
    };

    setConfirmarNovoTurno(false);
    setEstadoCombate(proximoEstado);
    if (onSave) {
      await onSave({ estadoCombate: proximoEstado });
    }
  };

  const resetarTurnos = async () => {
    const proximoEstado = {
      ...estadoCombate,
      turno: 1,
      ppAtual: ppMaximo,
      recuperacaoUtilizada: false,
      descansando: false,
      acaoExtra: null,
      historicoAcoes: [],
    };

    setConfirmarResetTurnos(false);
    setEstadoCombate(proximoEstado);
    if (onSave) {
      await onSave({ estadoCombate: proximoEstado });
    }
  };

  if (tipo === 'info') {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="prontidao-mecanicas-titulo">
        <DialogTitle id="prontidao-mecanicas-titulo" sx={{ background: 'linear-gradient(180deg, rgba(30,24,43,0.98), rgba(18,16,27,0.9))', color: '#f4dda2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(232,203,133,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Mecânicas de Prontidão
          <Button onClick={onClose} sx={{ minWidth: 0, color: '#f4dda2', p: 0.75 }} aria-label="Fechar mecânicas de prontidão">
            <CloseIcon fontSize="small" />
          </Button>
        </DialogTitle>
        <DialogContent sx={{ background: 'linear-gradient(180deg, rgba(14, 12, 23, 0.9), rgba(11, 11, 18, 0.98))', color: '#f1f1f4', py: 3 }}>
          <Stack spacing={2}>
            <Typography variant="body1" sx={{ color: '#f4dda2', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>O que são os Pontos de Prontidão?</Typography>
            <Typography>Os PP representam a reserva de reação e ação do personagem durante o combate. O máximo é derivado do valor efetivo atual de Prontidão, sem alterar o atributo em si.</Typography>
            <Typography>PP máximo = max(0, Prontidão efetiva). Cada ação gasta parte dessa reserva e, ao iniciar seu próprio turno, a reserva é restaurada completamente.</Typography>
            <Typography>Defesa natural continua funcionando mesmo sem PP. A reserva apenas controla ações ativas, respostas e decisões táticas.</Typography>
            <Typography>Prontidão não é Energia nem Reação: Energia mede endurance e Fadiga mede desgaste; Reação mede velocidade de resposta, enquanto PP mede capacidade de gasto de ação durante o combate.</Typography>
            <Typography>Exemplo: com Prontidão 20, o personagem começa em 20/20 PP, gasta 5 para atacar e passa para 15/20, e no início do próximo turno volta para 20/20.</Typography>
          </Stack>
        </DialogContent>
      </Dialog>
    );
  }

  const corBarra = tituloBarraCor(barra.porcentagem / 100);
  const tokensDetalhes = getTokensAcao(detalhesAcaoSelecionada ?? {});

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth aria-labelledby="prontidao-central-titulo">
      <DialogTitle id="prontidao-central-titulo" sx={{ background: 'linear-gradient(180deg, rgba(30,24,43,0.98), rgba(18,16,27,0.9))', color: '#f4dda2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(232,203,133,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        <Box>
          <Box sx={{ fontSize: '0.88rem', opacity: 0.8, letterSpacing: '0.18em' }}>Gerenciamento de Pontos de Prontidão</Box>
          <Box sx={{ fontSize: 'clamp(1.2rem, 2vw, 2rem)', lineHeight: 1.2 }}>Central de Ações</Box>
        </Box>
        <Button onClick={onClose} sx={{ minWidth: 0, color: '#f4dda2', p: 0.75 }} aria-label="Fechar central de ações">
          <CloseIcon fontSize="small" />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ background: 'linear-gradient(180deg, rgba(15,14,22,0.96), rgba(11,11,18,0.98))', color: '#f1f1f4', p: 0, overflow: 'hidden', maxHeight: '75vh', display: 'flex', flexDirection: 'column' }}>
        <Box data-testid="prontidao-modal-scroll" sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(232,203,133,0.32)', background: 'rgba(18,17,27,0.7)' }}>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Box>
                  <Typography sx={{ color: '#f4dda2', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 700 }}>Prontidão disponível</Typography>
                  <Typography sx={{ fontSize: 'clamp(1.3rem, 2vw, 2.2rem)', fontWeight: 800, color: '#fff' }}>{estadoCombate.ppAtual} / {ppMaximo} PP</Typography>
                </Box>
                <Chip label={`Turno ${estadoCombate.turno}`} sx={{ background: 'rgba(232,203,133,0.12)', color: '#f4dda2', border: '1px solid rgba(232,203,133,0.5)', fontWeight: 700 }} />
              </Box>

              <Box sx={{ width: '100%', height: 18, borderRadius: 999, border: '1px solid rgba(232,203,133,0.5)', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <Box sx={{ width: `${Math.max(0, Math.min(100, barra.porcentagem))}%`, height: '100%', background: `linear-gradient(90deg, ${corBarra} 0%, ${corBarra} 100%)`, transition: 'width 0.2s ease' }} />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', color: '#d4d4dd', fontSize: '0.82rem' }}>
                <Typography sx={{ color: '#d4d4dd' }}>Máxima: <Typography component="span" sx={{ color: '#f4dda2', display: 'inline' }}>{ppMaximo} PP</Typography></Typography>
                <Typography sx={{ color: '#d4d4dd' }}>Gastos: <Typography component="span" sx={{ color: '#f4dda2', display: 'inline' }}>{barra.gastoNoCiclo} PP</Typography></Typography>
                <Typography sx={{ color: '#d4d4dd' }}>Restantes: <Typography component="span" sx={{ color: '#f4dda2', display: 'inline' }}>{barra.restantes} PP</Typography></Typography>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Tabs
              value={categoriaAtiva}
              onChange={(_, next) => setCategoriaAtiva(next)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: '1px solid rgba(232,203,133,0.28)', mb: 2, color: '#f4dda2' }}
              textColor="inherit"
            >
              {CATEGORIAS_ACOES_PRONTIDAO.map(categoria => (
                <Tab key={categoria.id} value={categoria.id} label={categoria.label} sx={{ textTransform: 'uppercase', fontWeight: 700 }} />
              ))}
            </Tabs>

            <Box sx={{ px: 2, pb: 1.5 }}>
              <TextField
                fullWidth
                size="small"
                label="Pesquisar ações de combate"
                value={pesquisa}
                onChange={event => setPesquisa(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                  }
                }}
                placeholder="Pesquisar ações de combate..."
                aria-label="Pesquisar ações de combate"
                slotProps={{
                  input: {
                    'aria-label': 'Pesquisar ações de combate',
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#f4dda2', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: mostrarBotaoLimparPesquisa ? (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="Limpar pesquisa"
                          onClick={() => setPesquisa('')}
                          edge="end"
                          sx={{ color: '#d4d4dd', '&:hover': { color: '#f4dda2', background: 'rgba(232,203,133,0.08)' } }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(12,12,19,0.86)',
                    borderRadius: 2,
                    color: '#f1f1f4',
                    borderColor: 'rgba(232,203,133,0.42)',
                    '& fieldset': { borderColor: 'rgba(232,203,133,0.42)' },
                    '&:hover fieldset': { borderColor: 'rgba(232,203,133,0.7)' },
                    '&.Mui-focused fieldset': { borderColor: '#f4dda2', boxShadow: '0 0 0 1px rgba(244,221,162,0.4)' },
                  },
                  '& input::placeholder': { color: '#b8bac8', opacity: 1 },
                }}
              />
            </Box>

            <Box
              ref={listaAcoesRef}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
                alignItems: 'stretch',
                width: '100%',
                maxHeight: '42vh',
                overflowY: 'auto',
                pr: 0.5,
                scrollbarWidth: 'thin',
              }}
            >
              {acaoExtraAtiva && (
                <Box sx={{ gridColumn: '1 / -1', mb: 1.5, display: 'flex', flexDirection: 'column', gap: 1, p: 1.5, borderRadius: 2, border: '1px solid rgba(34,197,94,0.45)', background: 'linear-gradient(180deg, rgba(20,83,45,0.34), rgba(10,18,14,0.82))' }}>
                  <Typography sx={{ color: '#86efac', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: '0.68rem' }}>Ação Extra Ativa</Typography>
                  <Typography sx={{ color: '#e5ffe8', fontSize: '0.95rem' }}>
                    Escolha uma ação de até {limiteAcaoExtra} PP para executar gratuitamente.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', color: '#d4d4dd', fontSize: '0.8rem' }}>
                    <Typography>Limite: <Typography component="span" sx={{ color: '#86efac', fontWeight: 700 }}>{limiteAcaoExtra} PP</Typography></Typography>
                    <Typography>Usos: <Typography component="span" sx={{ color: '#86efac', fontWeight: 700 }}>{estadoCombate.acaoExtra?.usosRestantes ?? 0}</Typography></Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="text"
                      onClick={cancelarSelecaoAcaoExtra}
                      sx={{ color: '#d4d4dd', textTransform: 'none', fontWeight: 700 }}
                    >
                      Cancelar seleção
                    </Button>
                  </Box>
                </Box>
              )}

              {acoesFiltradas.length === 0 ? (
                <Box sx={{ gridColumn: '1 / -1', minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, textAlign: 'center', border: '1px dashed rgba(232,203,133,0.35)', borderRadius: 2, background: 'rgba(255,255,255,0.02)', p: 3 }}>
                  <Typography sx={{ color: '#f4dda2', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.72rem' }}>Nenhuma ação encontrada</Typography>
                  <Typography sx={{ color: '#b8bac8', maxWidth: 360 }}>Não encontramos ações correspondentes à sua pesquisa.</Typography>
                  <Button
                    variant="text"
                    onClick={() => setPesquisa('')}
                    aria-label="Limpar pesquisa"
                    sx={{ color: '#f4dda2', textTransform: 'none', fontWeight: 700 }}
                  >
                    Limpar pesquisa
                  </Button>
                </Box>
              ) : (
                acoesFiltradas.map(acao => {
                  const custo = acao.id === 'recuperar-se' || acao.id === 'descansar'
                    ? 0
                    : acao.custoPendente || !acao.id || !CUSTOS_PROGRESSIVOS_PRONTIDAO[acao.id]
                      ? 0
                      : calcularCustoPpAcao(ppMaximo, acao.id);
                  const custoPendente = Boolean(acao.custoPendente) || (!acao.id || !CUSTOS_PROGRESSIVOS_PRONTIDAO[acao.id]) && acao.id !== 'recuperar-se' && acao.id !== 'descansar';
                  const insuficiente = !custoPendente && estadoCombate.ppAtual < custo;
                  const icone = acao.icone || '⚔️';
                  const recuperacaoAtual = acao.id === 'recuperar-se' ? Math.min(calcularRecuperacaoPp(ppMaximo, 0.2), Math.max(0, ppMaximo - estadoCombate.ppAtual)) : 0;
                  const jaUsada = acao.id === 'recuperar-se' && estadoCombate.recuperacaoUtilizada;
                  const descansando = acao.id === 'descansar' && estadoCombate.descansando;
                  const jaExecutadaNoTurno = ['atacar', 'ataque-duplo', 'usar-habilidade'].includes(acao.id)
                    && acaoJaExecutadaNoTurno(acao.id);
                  const acaoExtraGratis = acaoExtraAtiva && acaoElegivelGratis(acao);
                  const bloqueado = custoPendente
                    || (acao.id === 'recuperar-se' && (jaUsada || estadoCombate.ppAtual >= ppMaximo || estadoCombate.descansando))
                    || (acao.id === 'descansar' && estadoCombate.descansando)
                    || (estadoCombate.descansando && !acao.reativa && acao.id !== 'descansar')
                    || (acao.id === 'acao-extra' && (acaoExtraAtiva || estadoCombate.acaoExtra?.status === 'pendente' || estadoCombate.ppAtual < custoAcaoExtra))
                    || jaExecutadaNoTurno;
                  const botaoLabel = acao.id === 'recuperar-se' ? 'Recuperar PP' : acao.id === 'descansar' ? 'Descansar' : 'Ação';
                  const estadoTexto = acao.id === 'recuperar-se' && jaUsada ? 'UTILIZADO NESTE TURNO' : acao.id === 'descansar' && descansando ? 'DESCANSANDO' : ['atacar', 'ataque-duplo', 'usar-habilidade'].includes(acao.id) && jaExecutadaNoTurno ? 'EXECUTADA' : null;
                  const exibirChipEstado = Boolean(estadoTexto) && !['atacar', 'ataque-duplo', 'usar-habilidade'].includes(acao.id);
                  const tokensAcao = getTokensAcao(acao);
                  const tokensExibidos = tokensAcao;

                  return (
                    <Box key={acao.id} sx={{ background: 'linear-gradient(180deg, rgba(22, 17, 36, 0.98), rgba(12, 12, 20, 0.96))', border: `1px solid ${acaoExtraGratis ? 'rgba(232,203,133,0.35)' : 'rgba(232,203,133,0.38)'}`, boxShadow: acaoExtraGratis ? '0 0 0 1px rgba(34,197,94,0.08)' : 'none', borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%', minWidth: 0, width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0, flex: 1 }}>
                          <Box sx={{ width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(232,203,133,0.1)', border: '1px solid rgba(232,203,133,0.32)', fontSize: '1.4rem', flexShrink: 0 }}>{icone}</Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography sx={{ color: '#f4dda2', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.72rem' }}>{acao.nome}</Typography>
                            <Typography sx={{ color: '#b8bac8', fontSize: '0.72rem' }}>{formatarTipoAcao(acao.categoria)}</Typography>
                          </Box>
                        </Box>

                        {tokensExibidos.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 0.75, maxWidth: '45%', ml: 1 }}>
                            {renderizarTokens(tokensExibidos)}
                          </Box>
                        )}
                      </Box>

                      <Typography sx={{ color: '#e6e7ee', fontSize: '0.9rem', lineHeight: 1.5 }}>{acao.descricao}</Typography>

                      {acao.id === 'recuperar-se' && (
                        <>
                          <Typography sx={{ color: '#f4dda2', fontWeight: 700 }}>Recuperação: +20% dos PP máximos</Typography>
                          <Typography sx={{ color: '#d4d4dd', fontSize: '0.8rem' }}>Recupera até +{recuperacaoAtual} PP</Typography>
                        </>
                      )}

                      {acao.id === 'descansar' && (
                        <>
                          <Typography sx={{ color: '#f4dda2', fontWeight: 700 }}>Recuperação: 100% dos PP</Typography>
                          <Typography sx={{ color: '#d4d4dd', fontSize: '0.8rem', fontStyle: 'italic' }}>Encerra as ações voluntárias do turno.</Typography>
                        </>
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                        <Box>
                          {acaoExtraGratis ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.1, color: '#d4d4dd' }}>
                              <Typography sx={{ color: '#d4d4dd', fontWeight: 600, fontSize: '0.8rem' }}>{`Custo normal: ${custo} PP`}</Typography>
                              <Typography sx={{ color: '#86efac', fontWeight: 700, fontSize: '0.8rem' }}>{`Custo com Ação Extra: 0 PP`}</Typography>
                            </Box>
                          ) : (
                            <Typography sx={{ color: '#f4dda2', fontWeight: 700 }}>{acao.id === 'recuperar-se' || acao.id === 'descansar' ? 'Pontos de Prontidão' : custoPendente ? 'Custo pendente' : `Custo: ${custo} PP`}</Typography>
                          )}
                        </Box>
                        {insuficiente && !acao.id.includes('recuperar') && <Typography sx={{ color: '#fca5a5', fontWeight: 700 }}>PP insuficiente</Typography>}
                        {custoPendente && <Typography sx={{ color: '#fbbf24', fontWeight: 700 }}>Custo pendente</Typography>}
                      </Box>

                      {exibirChipEstado && (
                        <Chip label={estadoTexto} size="small" sx={{ background: 'rgba(248,113,113,0.12)', color: '#fca5a5', border: '1px solid rgba(248,113,113,0.4)', width: 'fit-content' }} />
                      )}

                      <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                        <Button
                          variant="outlined"
                          onClick={() => setAcaoDetalhada(acao)}
                          aria-label={`Ver detalhes: ${acao.nome}`}
                          sx={{ flex: 1, borderColor: 'rgba(232,203,133,0.5)', color: '#f4dda2', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', '&:hover': { borderColor: 'rgba(232,203,133,0.7)', background: 'rgba(232,203,133,0.08)' } }}
                        >
                          Detalhes
                        </Button>
                        <Button
                          variant="contained"
                          disabled={
                            acao.id === 'usar-item'
                              ? itensUsaveis.length === 0
                              : custoPendente || insuficiente || bloqueado || (acaoExtraAtiva && !acaoExtraGratis && acao.id !== 'acao-extra')
                          }
                          onClick={() => confirmarAcao(acao)}
                          aria-label={`Executar ação: ${acao.nome}`}
                          sx={{ flex: 2, background: acao.id === 'usar-item' ? (itensUsaveis.length === 0 ? 'rgba(255,255,255,0.08)' : 'linear-gradient(180deg, rgba(232,203,133,0.9), rgba(180,140,58,0.92))') : (custoPendente || insuficiente || bloqueado || (acaoExtraAtiva && !acaoExtraGratis && acao.id !== 'acao-extra') ? 'rgba(255,255,255,0.08)' : 'linear-gradient(180deg, rgba(232,203,133,0.9), rgba(180,140,58,0.92))'), color: '#1d1a23', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', '&:disabled': { background: 'rgba(255,255,255,0.08)', color: '#7f7f88' } }}
                        >
                          {acao.id === 'usar-item' ? (itensUsaveis.length === 0 ? 'Sem item' : 'Usar item') : (custoPendente ? 'Custo pendente' : (estadoTexto || botaoLabel))}
                        </Button>
                      </Stack>
                    </Box>
                  );
                })
              )}
            </Box>

            <Box sx={{ mt: 2, borderTop: '1px solid rgba(232,203,133,0.28)', pt: 2 }}>
              <Typography sx={{ color: '#f4dda2', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.72rem' }}>Ações realizadas</Typography>
              <Box sx={{ mt: 1, maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1, pr: 0.5 }}>
                {estadoCombate.historicoAcoes.length === 0 ? (
                  <Typography sx={{ color: '#b8bac8' }}>Nenhuma ação executada no ciclo atual.</Typography>
                ) : (
                  estadoCombate.historicoAcoes.map(item => (
                    <Box key={item.id} sx={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(232,203,133,0.18)', borderRadius: 1.5, p: 1.25 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ color: '#f1f1f4', fontWeight: 700 }}>{item.nome}</Typography>
                        <Typography sx={{ color: '#f4dda2', fontSize: '0.8rem' }}>{item.custo}</Typography>
                      </Box>
                      <Typography sx={{ color: '#b8bac8', fontSize: '0.75rem' }}>{item.turno} • Restante: {item.restante} PP</Typography>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, background: 'linear-gradient(180deg, rgba(16,15,24,0.98), rgba(11,11,18,0.98))', borderTop: '1px solid rgba(232,203,133,0.3)', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button onClick={() => setConfirmarNovoTurno(true)} variant="contained" sx={{ background: 'linear-gradient(180deg, rgba(232,203,133,0.9), rgba(166,121,64,0.92))', color: '#0f1116', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Iniciar novo turno
          </Button>
          <Button onClick={() => setConfirmarResetTurnos(true)} variant="outlined" sx={{ borderColor: 'rgba(248,113,113,0.7)', color: '#fca5a5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', '&:hover': { borderColor: 'rgba(248,113,113,0.9)', background: 'rgba(248,113,113,0.08)' } }}>
            Resetar turnos
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#b8bac8', fontSize: '0.8rem' }}>
          <BoltOutlinedIcon fontSize="small" sx={{ color: '#f4dda2' }} />
          <Typography sx={{ color: '#b8bac8' }}>PP atual: {estadoCombate.ppAtual} / {ppMaximo}</Typography>
        </Box>
      </DialogActions>

      <Dialog
        open={Boolean(acaoDetalhada)}
        onClose={() => setAcaoDetalhada(null)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              width: '100%',
              maxWidth: 500,
              borderRadius: 3,
              border: '1px solid rgba(232,203,133,0.42)',
              background: 'linear-gradient(180deg, rgba(15,17,27,0.98), rgba(11,12,19,0.98))',
              boxShadow: '0 18px 40px rgba(2,4,10,0.72)',
            },
          },
        }}
        aria-labelledby="acao-detalhes-titulo"
      >
        <DialogTitle
          id="acao-detalhes-titulo"
          sx={{
            background: 'linear-gradient(180deg, rgba(24,20,35,0.98), rgba(14,14,22,0.98))',
            color: '#f4dda2',
            borderBottom: '1px solid rgba(232,203,133,0.32)',
            p: 2,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
            <Box sx={{ width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(232,203,133,0.12)', border: '1px solid rgba(232,203,133,0.4)', color: '#f4dda2', fontSize: '1.5rem', flexShrink: 0 }}>
              {detalhesAcaoSelecionada?.icone || '⚔️'}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ color: '#b8bac8', fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', mb: 0.4 }}>
                {detalhesAcaoSelecionada?.categoria || 'Ação'}
              </Typography>
              <Typography sx={{ color: '#f4dda2', fontWeight: 800, fontSize: 'clamp(1rem, 2vw, 1.4rem)', lineHeight: 1.2, wordBreak: 'break-word' }}>
                Detalhes da ação {detalhesAcaoSelecionada?.nome || 'Ação'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {detalhesAcaoSelecionada?.custoPercentualPP && detalhesAcaoSelecionada?.custoPercentualPP !== 'A definir' && (
              <Box sx={{ px: 1.1, py: 0.45, borderRadius: 999, border: '1px solid rgba(232,203,133,0.45)', background: 'rgba(232,203,133,0.08)', color: '#f4dda2', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {detalhesAcaoSelecionada.custoPercentualPP}
              </Box>
            )}
            <Button onClick={() => setAcaoDetalhada(null)} sx={{ minWidth: 0, color: '#f4dda2', p: 0.75, borderRadius: 1.5, '&:hover': { background: 'rgba(232,203,133,0.08)' } }} aria-label="Fechar detalhes da ação">
              <CloseIcon fontSize="small" />
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ background: 'linear-gradient(180deg, rgba(14, 12, 23, 0.96), rgba(8, 9, 16, 0.98))', color: '#f1f1f4', p: 0, maxHeight: '80vh' }}>
          <Box sx={{ p: 2, overflowY: 'auto', maxHeight: '80vh', '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(232,203,133,0.35)', borderRadius: 999 }, '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.03)' } }}>
            {tokensDetalhes.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.25 }}>
                {renderizarTokens(tokensDetalhes)}
              </Box>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1, mb: 1.25 }}>
              <Box sx={{ borderRadius: 2, border: '1px solid rgba(232,203,133,0.18)', background: 'rgba(255,255,255,0.02)', p: 1.1 }}>
                <Typography sx={{ color: '#b8bac8', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 0.4 }}>Nome da ação</Typography>
                <Typography sx={{ color: '#f1f1f4', fontWeight: 700, lineHeight: 1.5 }}>{detalhesAcaoSelecionada?.nome || 'Ação'}</Typography>
              </Box>
              <Box sx={{ borderRadius: 2, border: '1px solid rgba(232,203,133,0.18)', background: 'rgba(255,255,255,0.02)', p: 1.1 }}>
                <Typography sx={{ color: '#b8bac8', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 0.4 }}>Categoria</Typography>
                <Typography sx={{ color: '#f1f1f4', fontWeight: 700, lineHeight: 1.5 }}>{detalhesAcaoSelecionada?.categoria || 'Ação'}</Typography>
              </Box>
              <Box sx={{ borderRadius: 2, border: '1px solid rgba(232,203,133,0.18)', background: 'rgba(255,255,255,0.02)', p: 1.1 }}>
                <Typography sx={{ color: '#b8bac8', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 0.4 }}>Custo percentual de PP</Typography>
                <Typography sx={{ color: '#f1f1f4', fontWeight: 700, lineHeight: 1.5 }}>{detalhesAcaoSelecionada?.custoPercentualPP || 'A definir'}</Typography>
              </Box>
            </Box>

            <Stack spacing={1.3}>
              {detalhesAcaoSelecionada?.descricaoCompleta && detalhesAcaoSelecionada.descricaoCompleta !== 'A definir' && (
                <Box sx={{ px: 1.25, py: 1, borderRadius: 2, border: '1px solid rgba(232,203,133,0.2)', background: 'rgba(255,255,255,0.02)' }}>
                  <Typography sx={{ color: '#d9dbe7', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    {detalhesAcaoSelecionada.descricaoCompleta}
                  </Typography>
                </Box>
              )}

              {(detalhesAcaoSelecionada?.comoUtilizar && detalhesAcaoSelecionada.comoUtilizar !== 'A definir') || (detalhesAcaoSelecionada?.teste && detalhesAcaoSelecionada.teste !== 'A definir') || (detalhesAcaoSelecionada?.requisitos && detalhesAcaoSelecionada.requisitos !== 'A definir') ? (
                <Box sx={{ borderRadius: 2, border: '1px solid rgba(232,203,133,0.22)', background: 'linear-gradient(180deg, rgba(35,29,52,0.54), rgba(17,18,28,0.8))', p: 1.25 }}>
                  <Typography sx={{ color: '#f4dda2', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.67rem', mb: 0.85 }}>
                    Rolagem / Mecânica
                  </Typography>

                  <Stack spacing={1}>
                    {detalhesAcaoSelecionada?.comoUtilizar && detalhesAcaoSelecionada.comoUtilizar !== 'A definir' && (
                      <Box>
                        <Typography sx={{ color: '#b8bac8', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.45 }}>Como utilizar</Typography>
                        <Typography sx={{ color: '#f1f1f4', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{detalhesAcaoSelecionada.comoUtilizar}</Typography>
                      </Box>
                    )}

                    {detalhesAcaoSelecionada?.teste && detalhesAcaoSelecionada.teste !== 'A definir' && (
                      <Box>
                        <Typography sx={{ color: '#b8bac8', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.45 }}>Teste</Typography>
                        <Typography sx={{ color: '#f1f1f4', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{detalhesAcaoSelecionada.teste}</Typography>
                      </Box>
                    )}

                    {detalhesAcaoSelecionada?.requisitos && detalhesAcaoSelecionada.requisitos !== 'A definir' && (
                      <Box>
                        <Typography sx={{ color: '#b8bac8', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.45 }}>Requisitos</Typography>
                        <Typography sx={{ color: '#f1f1f4', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{detalhesAcaoSelecionada.requisitos}</Typography>
                      </Box>
                    )}

                    {detalhesAcaoSelecionada?.bonusPermitidos && detalhesAcaoSelecionada.bonusPermitidos !== 'A definir' && (
                      <Box>
                        <Typography sx={{ color: '#b8bac8', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.45 }}>Bônus</Typography>
                        <Typography sx={{ color: '#f1f1f4', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{detalhesAcaoSelecionada.bonusPermitidos}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
              ) : null}

              {(detalhesAcaoSelecionada?.condicoesSucesso && detalhesAcaoSelecionada.condicoesSucesso !== 'A definir') || (detalhesAcaoSelecionada?.consequenciasFalha && detalhesAcaoSelecionada.consequenciasFalha !== 'A definir') ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.25 }}>
                  {detalhesAcaoSelecionada?.condicoesSucesso && detalhesAcaoSelecionada.condicoesSucesso !== 'A definir' && (
                    <Box sx={{ borderRadius: 2, border: '1px solid rgba(52,211,153,0.38)', background: 'rgba(16,185,129,0.08)', p: 1.15 }}>
                      <Typography sx={{ color: '#86efac', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.65rem', mb: 0.6 }}>Sucesso</Typography>
                      <Typography sx={{ color: '#ecfdf5', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{detalhesAcaoSelecionada.condicoesSucesso}</Typography>
                    </Box>
                  )}

                  {detalhesAcaoSelecionada?.consequenciasFalha && detalhesAcaoSelecionada.consequenciasFalha !== 'A definir' && (
                    <Box sx={{ borderRadius: 2, border: '1px solid rgba(248,113,113,0.38)', background: 'rgba(239,68,68,0.08)', p: 1.15 }}>
                      <Typography sx={{ color: '#fca5a5', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.65rem', mb: 0.6 }}>Falha</Typography>
                      <Typography sx={{ color: '#fee2e2', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{detalhesAcaoSelecionada.consequenciasFalha}</Typography>
                    </Box>
                  )}
                </Box>
              ) : null}

              {detalhesAcaoSelecionada?.observacoes && detalhesAcaoSelecionada.observacoes !== 'A definir' && (
                <Box sx={{ borderRadius: 2, border: '1px solid rgba(232,203,133,0.18)', background: 'rgba(255,255,255,0.02)', p: 1.25 }}>
                  <Typography sx={{ color: '#b8bac8', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.5 }}>Observações</Typography>
                  <Typography sx={{ color: '#e5e7eb', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{detalhesAcaoSelecionada.observacoes}</Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5, mt: 0.5, pt: 1, borderTop: '1px solid rgba(232,203,133,0.2)', flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#f4dda2', fontWeight: 700, fontSize: '0.82rem' }}>
                  <BoltOutlinedIcon fontSize="small" />
                  <Typography sx={{ color: '#f4dda2', fontWeight: 700, fontSize: '0.82rem' }}>
                    {detalhesAcaoSelecionada?.custoCalculadoPP ?? 'Custo pendente'}
                  </Typography>
                </Box>

                <Typography sx={{ color: '#b8bac8', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Rolagem manual
                </Typography>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmarAuxiliarAliado}
        onClose={() => {
          setConfirmarAuxiliarAliado(false);
          setDadosAuxiliarAliado({ aliado: '', tipoAjuda: 'Ataque', descricao: '' });
        }}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              width: '100%',
              maxWidth: 520,
              borderRadius: 3,
              border: '1px solid rgba(232,203,133,0.38)',
              background: 'linear-gradient(180deg, rgba(15,16,25,0.98), rgba(10,11,18,0.98))',
              boxShadow: '0 18px 48px rgba(2,4,12,0.8)',
              overflow: 'hidden',
            },
          },
        }}
        aria-labelledby="auxiliar-aliado-titulo"
      >
        <DialogTitle id="auxiliar-aliado-titulo" sx={{ px: 2, py: 1.5, background: 'linear-gradient(180deg, rgba(30,24,43,0.98), rgba(18,16,27,0.9))', color: '#f4dda2', borderBottom: '1px solid rgba(232,203,133,0.5)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5 }}>
            <Box>
              <Typography sx={{ color: '#f4dda2', fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, mb: 0.5 }}>
                Auxiliar Aliado
              </Typography>
              <Typography sx={{ color: '#d7d7df', fontSize: '0.8rem', lineHeight: 1.4 }}>
                Confirme o auxílio e o custo em PP.
              </Typography>
            </Box>
            <Button
              onClick={() => {
                setConfirmarAuxiliarAliado(false);
                setDadosAuxiliarAliado({ aliado: '', tipoAjuda: 'Ataque', descricao: '' });
              }}
              sx={{ minWidth: 0, color: '#f4dda2', p: 0.75, borderRadius: 1.5, '&:hover': { background: 'rgba(232,203,133,0.08)' } }}
              aria-label="Fechar confirmação de auxiliar aliado"
            >
              <CloseIcon fontSize="small" />
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ background: 'linear-gradient(180deg, rgba(17,15,25,0.96), rgba(12,12,19,0.98))', color: '#f1f1f4', p: 2 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(232,203,133,0.25)', background: 'rgba(255,255,255,0.02)' }}>
                <Typography sx={{ color: '#b8bac8', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 0.5 }}>Custo do auxílio</Typography>
                <Typography sx={{ color: '#f4dda2', fontWeight: 800, fontSize: '1.1rem' }}>{calcularCustoPpAcao(ppMaximo, 'auxiliar-aliado')} PP</Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(232,203,133,0.25)', background: 'rgba(255,255,255,0.02)' }}>
                <Typography sx={{ color: '#b8bac8', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 0.5 }}>PP atual</Typography>
                <Typography sx={{ color: '#f4dda2', fontWeight: 800, fontSize: '1.1rem' }}>{estadoCombate.ppAtual} / {ppMaximo}</Typography>
              </Box>
            </Box>

            <TextField
              label="Aliado a ser auxiliado"
              value={dadosAuxiliarAliado.aliado}
              onChange={event => setDadosAuxiliarAliado(prev => ({ ...prev, aliado: event.target.value }))}
              fullWidth
              required
              sx={{ '& .MuiInputBase-root': { background: 'rgba(10,10,18,0.8)', color: '#f1f1f4' }, '& .MuiInputLabel-root': { color: '#d4d4dd' } }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography sx={{ color: '#d4d4dd', fontSize: '0.8rem', fontWeight: 600 }}>Tipo de auxílio</Typography>
              <Box component="label" sx={{ display: 'block' }}>
                <Box component="select" value={dadosAuxiliarAliado.tipoAjuda} onChange={event => setDadosAuxiliarAliado(prev => ({ ...prev, tipoAjuda: event.target.value }))} aria-label="Tipo de auxílio" sx={{ width: '100%', background: 'rgba(10,10,18,0.8)', color: '#f1f1f4', border: '1px solid rgba(232,203,133,0.32)', borderRadius: 1, px: 1.25, py: 1.1, fontSize: '0.95rem', outline: 'none', '&:focus': { borderColor: 'rgba(232,203,133,0.75)' } }}>
                  <option value="Ataque">Ataque</option>
                  <option value="Defesa">Defesa</option>
                  <option value="Movimentação">Movimentação</option>
                  <option value="Percepção">Percepção</option>
                  <option value="Utilidade">Utilidade</option>
                </Box>
              </Box>
            </Box>

            <TextField
              label="Descrição do auxílio"
              value={dadosAuxiliarAliado.descricao}
              onChange={event => setDadosAuxiliarAliado(prev => ({ ...prev, descricao: event.target.value }))}
              fullWidth
              multiline
              minRows={3}
              required
              sx={{ '& .MuiInputBase-root': { background: 'rgba(10,10,18,0.8)', color: '#f1f1f4' }, '& .MuiInputLabel-root': { color: '#d4d4dd' } }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2, py: 1.5, justifyContent: 'flex-end', borderTop: '1px solid rgba(232,203,133,0.3)', background: 'rgba(13,12,20,0.98)' }}>
          <Button onClick={() => { setConfirmarAuxiliarAliado(false); setDadosAuxiliarAliado({ aliado: '', tipoAjuda: 'Ataque', descricao: '' }); }} sx={{ color: '#d4d4dd', fontWeight: 700 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={confirmarAuxiliarAliadoAgora}
            disabled={!dadosAuxiliarAliado.aliado.trim() || !dadosAuxiliarAliado.descricao.trim() || estadoCombate.ppAtual < calcularCustoPpAcao(ppMaximo, 'auxiliar-aliado')}
            sx={{ background: 'linear-gradient(180deg, rgba(232,203,133,0.9), rgba(180,140,58,0.92))', color: '#1d1a23', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            Confirmar auxílio
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={usarItemDialogAberto}
        onClose={() => {
          setUsarItemDialogAberto(false);
          setItemUsoSelecionado(null);
          setItemUsoEtapa('lista');
          setStatusUsoItem([]);
          setItemUsoRolagem(null);
        }}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              width: '100%',
              maxWidth: 560,
              maxHeight: '80dvh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              border: '1px solid rgba(232,203,133,0.38)',
              background: 'linear-gradient(180deg, rgba(15,16,25,0.98), rgba(10,11,18,0.98))',
              boxShadow: '0 18px 48px rgba(2,4,12,0.8)',
              overflow: 'hidden',
            },
          },
        }}
        aria-labelledby="usar-item-titulo"
      >
        <DialogTitle
          id="usar-item-titulo"
          sx={{
            px: 2,
            py: 1.5,
            background: 'linear-gradient(180deg, rgba(30,24,43,0.98), rgba(18,16,27,0.9))',
            color: '#f4dda2',
            borderBottom: '1px solid rgba(232,203,133,0.5)',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: '#f4dda2', fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, mb: 0.5 }}>
                USAR ITEM
              </Typography>
              <Typography sx={{ color: '#d7d7df', fontSize: '0.8rem', lineHeight: 1.4 }}>
                Selecione um item do inventário para utilizar.
              </Typography>
            </Box>

            <Button
              onClick={() => {
                setUsarItemDialogAberto(false);
                setItemUsoSelecionado(null);
                setItemUsoEtapa('lista');
                setStatusUsoItem([]);
                setItemUsoRolagem(null);
              }}
              sx={{ minWidth: 0, color: '#f4dda2', p: 0.75, borderRadius: 1.5, '&:hover': { background: 'rgba(232,203,133,0.08)' } }}
              aria-label="Fechar usar item"
            >
              <CloseIcon fontSize="small" />
            </Button>
          </Box>

          <Box sx={{ mt: 1.25, pt: 1, borderTop: '1px solid rgba(232,203,133,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ color: '#e5d4a0', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800 }}>
              ITENS DISPONÍVEIS
            </Typography>
            <Typography sx={{ color: '#f4dda2', fontSize: '0.76rem', fontWeight: 800 }}>
              {itensUsaveis.length}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ background: 'linear-gradient(180deg, rgba(17,15,25,0.96), rgba(12,12,19,0.98))', color: '#f1f1f4', p: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              px: 1.5,
              py: 1.25,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(232,203,133,0.6) rgba(10,10,18,0.7)',
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': { background: 'rgba(10,10,18,0.75)', borderRadius: 999 },
              '&::-webkit-scrollbar-thumb': { background: 'linear-gradient(180deg, rgba(232,203,133,0.7), rgba(110,130,210,0.65))', borderRadius: 999 },
              '&::-webkit-scrollbar-thumb:hover': { background: 'linear-gradient(180deg, rgba(232,203,133,0.85), rgba(110,130,210,0.9))' },
            }}
          >
            {itensUsaveis.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180, borderRadius: 2, border: '1px dashed rgba(232,203,133,0.32)', background: 'rgba(255,255,255,0.02)', p: 2, textAlign: 'center' }}>
                <Typography sx={{ color: '#d4d4dd', lineHeight: 1.6 }}>Nenhum item consumível disponível.</Typography>
              </Box>
            ) : itemUsoSelecionado && itemUsoEtapa === 'aplicacao' ? (
              <Stack spacing={1.5}>
                <Typography sx={{ color: '#f4dda2', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Utilizar item</Typography>

                <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center', p: 1.25, borderRadius: 2, background: 'rgba(255,255,255,0.02)', border: `1px solid ${QUALIDADE_META[itemUsoSelecionado?.qualidade]?.cor ?? 'rgba(232,203,133,0.22)'}`, boxShadow: `inset 0 0 0 1px ${QUALIDADE_META[itemUsoSelecionado?.qualidade]?.cor ?? 'rgba(232,203,133,0.22)'}22` }}>
                  <Box sx={{ width: 64, height: 64, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(232,203,133,0.28)', background: 'rgba(232,203,133,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getItemImagem(itemUsoSelecionado)}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2, flex: 1, minWidth: 0 }}>
                    <Typography sx={{ color: '#f4dda2', fontWeight: 800, wordBreak: 'break-word', fontSize: '0.95rem' }}>{itemUsoSelecionado.nome || 'Item sem nome'}</Typography>
                    <Typography sx={{ color: '#d4d4dd', fontSize: '0.72rem' }}>{itemUsoSelecionado.tipo || 'Item'} • Quantidade disponível: {Number(itemUsoSelecionado.quantidade ?? 0)}</Typography>
                    <Typography sx={{ color: QUALIDADE_META[itemUsoSelecionado?.qualidade]?.cor ?? '#f4dda2', fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{itemUsoSelecionado?.qualidade || 'Comum'}</Typography>
                  </Box>
                </Box>

                {(() => {
                  const efeitoItem = getEfeitoItem(itemUsoSelecionado);
                  const textoEfeito = efeitoItem ? formatarTextoEfeitoItem(efeitoItem.texto || 'Efeito em dados') : 'Sem efeito';
                  const tipoEfeito = efeitoItem?.tipo === 'dados' ? 'ROLAGEM DE RECUPERAÇÃO' : 'RECUPERAÇÃO FIXA';
                  return (
                    <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(232,203,133,0.18)' }}>
                      <Typography sx={{ color: '#b8bac8', fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 0.5 }}>{tipoEfeito}</Typography>
                      <Typography sx={{ color: '#f1f1f4', fontWeight: 800, fontSize: '1.05rem', mb: 0.5 }}>{textoEfeito}</Typography>
                      {efeitoItem?.tipo === 'dados' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography sx={{ color: '#d4d4dd', fontSize: '0.75rem' }}>Resultado: {itemUsoRolagem ?? '—'}</Typography>
                          {!itemUsoRolagem && (
                            <Button type="button" variant="outlined" onClick={rolarUsoItem} sx={{ borderColor: 'rgba(232,203,133,0.45)', color: '#f4dda2', textTransform: 'uppercase', fontWeight: 700 }}>
                              Rolar efeito
                            </Button>
                          )}
                        </Box>
                      )}
                    </Box>
                  );
                })()}

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
                  {['saude', 'energia', 'fadiga'].map(statusId => {
                    const label = statusId === 'saude' ? 'Saúde' : statusId === 'energia' ? 'Energia' : 'Fadiga';
                    const selecionado = statusUsoItem.includes(statusId);
                    const toggleStatus = () => {
                      setStatusUsoItem(prev => prev.includes(statusId) ? prev.filter(item => item !== statusId) : [...prev, statusId]);
                    };

                    return (
                      <Box key={statusId} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 2, border: `1px solid ${selecionado ? 'rgba(232,203,133,0.8)' : 'rgba(232,203,133,0.18)'}`, background: selecionado ? 'rgba(232,203,133,0.08)' : 'rgba(255,255,255,0.02)' }}>
                        <input
                          type="checkbox"
                          aria-label={label}
                          checked={selecionado}
                          onChange={toggleStatus}
                          style={{ accentColor: '#e8cb85', width: 18, height: 18, cursor: 'pointer' }}
                        />
                        <button
                          type="button"
                          aria-label={label}
                          onClick={toggleStatus}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#f1f1f4',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          {label}
                        </button>
                      </Box>
                    );
                  })}
                </Box>

                {(() => {
                  const previsao = getPrevisaoUsoItem();
                  if (!previsao) {
                    return null;
                  }

                  return (
                    <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(232,203,133,0.18)' }}>
                      <Typography sx={{ color: '#b8bac8', fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 0.7 }}>Prévia dos status</Typography>
                      <Stack spacing={0.7}>
                        <Typography sx={{ color: '#f1f1f4', fontWeight: 700 }}>Saúde: {previsao.saude.atual} → {previsao.saude.proximo} / {previsao.saude.maximo}</Typography>
                        <Typography sx={{ color: '#f1f1f4', fontWeight: 700 }}>Energia: {previsao.energia.atual} → {previsao.energia.proximo} / {previsao.energia.maximo}</Typography>
                        <Typography sx={{ color: '#f1f1f4', fontWeight: 700 }}>Fadiga: {previsao.fadiga.atual} → {previsao.fadiga.proximo} / {previsao.fadiga.maximo}</Typography>
                      </Stack>
                    </Box>
                  );
                })()}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 0.5 }}>
                  <Button type="button" variant="outlined" onClick={() => { setItemUsoEtapa('lista'); }} sx={{ borderColor: 'rgba(232,203,133,0.45)', color: '#f4dda2', textTransform: 'uppercase', fontWeight: 700 }}>
                    Voltar
                  </Button>
                  <Button type="button" variant="outlined" onClick={() => { limparUsoItem(); }} sx={{ borderColor: 'rgba(232,203,133,0.45)', color: '#f0e7d9', textTransform: 'uppercase', fontWeight: 700 }}>
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="contained"
                    disabled={confirmandoUsoItem || statusUsoItem.length === 0}
                    onClick={() => {
                      if (getEfeitoItem(itemUsoSelecionado)?.tipo === 'dados' && !Number.isFinite(Number(itemUsoRolagem))) {
                        setItemUsoRolagem(calcularResultadoItem(itemUsoSelecionado));
                      }
                      confirmarUsoItem(itemUsoSelecionado, null, statusUsoItem, itemUsoRolagem ?? calcularResultadoItem(itemUsoSelecionado));
                    }}
                    aria-label="Confirmar uso"
                    sx={{ background: 'linear-gradient(180deg, rgba(232,203,133,0.9), rgba(166,121,64,0.92))', color: '#0f1116', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                  >
                    Confirmar utilização
                  </Button>
                  <Button
                    type="button"
                    variant="contained"
                    disabled={confirmandoUsoItem || statusUsoItem.length === 0}
                    onClick={() => {
                      if (getEfeitoItem(itemUsoSelecionado)?.tipo === 'dados' && !Number.isFinite(Number(itemUsoRolagem))) {
                        setItemUsoRolagem(calcularResultadoItem(itemUsoSelecionado));
                      }
                      confirmarUsoItem(itemUsoSelecionado, null, statusUsoItem, itemUsoRolagem ?? calcularResultadoItem(itemUsoSelecionado));
                    }}
                    aria-label="Confirmar utilização"
                    sx={{ position: 'absolute', width: 1, height: 1, p: 0, m: 0, border: 'none', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', overflow: 'hidden' }}
                  >
                    Confirmar uso
                  </Button>
                </Box>
              </Stack>
            ) : (
              <Stack spacing={1}>
                {itensUsaveis.map(item => {
                  const nomeBotao = `Selecionar: ${item.nome}`;
                  const qualidadeMeta = QUALIDADE_META[item?.qualidade] ?? { cor: '#f5f5f5' };
                  const extraTexto = item?.extra ? formatarTextoEfeitoItem(String(item.extra).trim()) : '';
                  const temExtra = Boolean(extraTexto);
                  const temDescricao = Boolean(item?.descricao && String(item.descricao).trim());

                  return (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        width: '100%',
                        minHeight: 90,
                        borderRadius: 2,
                        border: `1px solid ${qualidadeMeta.cor}`,
                        background: 'linear-gradient(180deg, rgba(22,18,31,0.94), rgba(12,12,19,0.96))',
                        boxShadow: `inset 0 0 0 1px ${qualidadeMeta.cor}22, 0 6px 16px rgba(0,0,0,0.14)`,
                        p: 1,
                        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          borderColor: qualidadeMeta.cor,
                          boxShadow: `inset 0 0 0 1px ${qualidadeMeta.cor}33, 0 10px 20px rgba(0,0,0,0.18)`,
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Box sx={{ width: 58, height: 58, borderRadius: 1.5, overflow: 'hidden', border: '1px solid rgba(232,203,133,0.28)', background: 'rgba(232,203,133,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ width: '100%', height: '100%', '& img': { width: '100%', height: '100%', objectFit: 'contain', display: 'block' } }}>
                          {getItemImagem(item)}
                        </Box>
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.35 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0 }}>
                          <Typography sx={{ color: '#f4dda2', fontWeight: 800, lineHeight: 1.25, fontSize: '0.82rem', wordBreak: 'break-word' }}>
                            {item.nome || 'Item sem nome'}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                          <Typography sx={{ color: '#d4d4dd', fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>
                            {item.tipo || 'Item'}
                          </Typography>
                          <Typography sx={{ color: '#7f7f88', fontSize: '0.62rem' }}>•</Typography>
                          <Typography sx={{ color: '#d4d4dd', fontSize: '0.62rem', fontWeight: 700 }}>
                            Qtd: {Number(item.quantidade ?? 0)}
                          </Typography>
                        </Box>

                        {item?.qualidade && (
                          <Typography sx={{ color: QUALIDADE_META[item.qualidade]?.cor ?? '#e9dca8', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            {item.qualidade}
                          </Typography>
                        )}

                        {temExtra && (
                          <Typography sx={{ color: '#e9dca8', fontSize: '0.64rem', fontWeight: 700 }}>
                            {/\d+d\d+/i.test(extraTexto) ? '🎲' : '✨'} Extra: {extraTexto}
                          </Typography>
                        )}

                        {temDescricao && (
                          <Typography sx={{ color: '#d9dbe7', fontSize: '0.68rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.descricao}
                          </Typography>
                        )}
                      </Box>

                      <Button
                        type="button"
                        variant="contained"
                        onClick={() => {
                          const proximoRolagem = getEfeitoItem(item)?.tipo === 'dados' ? calcularResultadoItem(item) : null;
                          setItemUsoSelecionado(item);
                          setItemUsoEtapa('aplicacao');
                          setStatusUsoItem([]);
                          setItemUsoRolagem(proximoRolagem);
                        }}
                        aria-label={nomeBotao}
                        sx={{
                          minWidth: 96,
                          px: 1.1,
                          py: 0.7,
                          background: 'linear-gradient(180deg, rgba(232,203,133,0.9), rgba(166,121,64,0.92))',
                          color: '#0f1116',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          fontSize: '0.6rem',
                          borderRadius: 1.25,
                          '&:hover': { filter: 'brightness(1.03)' },
                        }}
                      >
                        Selecionar
                      </Button>
                      <Button
                        type="button"
                        variant="contained"
                        onClick={() => {
                          const recursoPadrao = getRecursoPadraoItem(item);
                          confirmarUsoItem(item, recursoPadrao);
                        }}
                        aria-label={`Usar: ${item.nome || 'Item'}`}
                        sx={{ position: 'absolute', width: 1, height: 1, p: 0, m: 0, border: 'none', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', overflow: 'hidden' }}
                      >
                        Usar: {item.nome || 'Item'}
                      </Button>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ background: 'rgba(12,12,19,0.98)', borderTop: '1px solid rgba(232,203,133,0.2)', px: 1.5, py: 1.25, justifyContent: 'flex-end', flexShrink: 0 }}>
          <Button
            onClick={() => {
              limparUsoItem();
            }}
            sx={{
              borderRadius: 1.5,
              border: '1px solid rgba(232,203,133,0.22)',
              color: '#f0e7d9',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.08em',
              px: 2,
              py: 0.9,
            }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmarNovoTurno} onClose={() => setConfirmarNovoTurno(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(180deg, rgba(30,24,43,0.98), rgba(18,16,27,0.9))', color: '#f4dda2', borderBottom: '1px solid rgba(232,203,133,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Confirmar turno
        </DialogTitle>
        <DialogContent sx={{ background: 'linear-gradient(180deg, rgba(17,15,25,0.96), rgba(12,12,19,0.98))', color: '#f1f1f4', py: 3 }}>
          A Prontidão será recuperada até o máximo atual ({ppMaximo} PP). Deseja iniciar o próximo turno?
        </DialogContent>
        <DialogActions sx={{ background: 'rgba(12,12,19,0.98)', borderTop: '1px solid rgba(232,203,133,0.2)', p: 2 }}>
          <Button onClick={() => setConfirmarNovoTurno(false)}>Cancelar</Button>
          <Button variant="contained" onClick={iniciarNovoTurno} sx={{ background: 'linear-gradient(180deg, rgba(232,203,133,0.9), rgba(166,121,64,0.92))', color: '#0f1116', fontWeight: 800 }}>Confirmar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmarResetTurnos} onClose={() => setConfirmarResetTurnos(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(180deg, rgba(30,24,43,0.98), rgba(18,16,27,0.9))', color: '#f4dda2', borderBottom: '1px solid rgba(232,203,133,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Resetar turnos
        </DialogTitle>
        <DialogContent sx={{ background: 'linear-gradient(180deg, rgba(17,15,25,0.96), rgba(12,12,19,0.98))', color: '#f1f1f4', py: 3 }}>
          Isso reinicia o ciclo para turno 1, restaura a Prontidão ao máximo e limpa o histórico deste combate. Deseja prosseguir?
        </DialogContent>
        <DialogActions sx={{ background: 'rgba(12,12,19,0.98)', borderTop: '1px solid rgba(232,203,133,0.2)', p: 2 }}>
          <Button onClick={() => setConfirmarResetTurnos(false)}>Cancelar</Button>
          <Button variant="contained" onClick={resetarTurnos} sx={{ background: 'linear-gradient(180deg, rgba(248,113,113,0.9), rgba(153,27,27,0.9))', color: '#fff', fontWeight: 800 }}>Confirmar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmarAcaoExtra} onClose={() => setConfirmarAcaoExtra(false)} maxWidth="sm" fullWidth aria-labelledby="acao-extra-confirmacao-titulo">
        <DialogTitle id="acao-extra-confirmacao-titulo" sx={{ background: 'linear-gradient(180deg, rgba(30,24,43,0.98), rgba(18,16,27,0.9))', color: '#f4dda2', borderBottom: '1px solid rgba(232,203,133,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Confirmar ação extra
        </DialogTitle>
        <DialogContent sx={{ background: 'linear-gradient(180deg, rgba(17,15,25,0.96), rgba(12,12,19,0.98))', color: '#f1f1f4', py: 3 }}>
          <Typography sx={{ mb: 2 }}>Deseja consumir {custoAcaoExtra} PP da sua Prontidão máxima para ativar uma Ação Extra neste turno?</Typography>
          <Box sx={{ display: 'grid', gap: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(232,203,133,0.25)', borderRadius: 1.5, p: 2 }}>
            <Typography>PP atual: {estadoCombate.ppAtual}</Typography>
            <Typography>PP máximo: {ppMaximo}</Typography>
            <Typography>Custo da ação extra: {custoAcaoExtra} PP</Typography>
            <Typography>PP após ativação: {Math.max(0, estadoCombate.ppAtual - custoAcaoExtra)} PP</Typography>
          </Box>
          <Typography sx={{ mt: 2, color: '#d4d4dd', fontStyle: 'italic' }}>Após a confirmação, você poderá executar gratuitamente uma ação cujo custo normal seja de até {custoAcaoExtra} PP, respeitando seus requisitos e limitações.</Typography>
        </DialogContent>
        <DialogActions sx={{ background: 'rgba(12,12,19,0.98)', borderTop: '1px solid rgba(232,203,133,0.2)', p: 2, justifyContent: 'space-between' }}>
          <Button onClick={() => setConfirmarAcaoExtra(false)}>Cancelar</Button>
          <Button variant="contained" onClick={confirmarAcaoExtraAgora} sx={{ background: 'linear-gradient(180deg, rgba(232,203,133,0.9), rgba(166,121,64,0.92))', color: '#0f1116', fontWeight: 800 }}>Confirmar ação extra</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmarDescanso}
        onClose={() => {
          setConfirmarDescanso(false);
          setModoDescansoSelecionado(null);
        }}
        maxWidth="sm"
        fullWidth
        aria-labelledby="descansar-confirmacao-titulo"
      >
        <DialogTitle id="descansar-confirmacao-titulo" sx={{ background: 'linear-gradient(180deg, rgba(30,24,43,0.98), rgba(18,16,27,0.9))', color: '#f4dda2', borderBottom: '1px solid rgba(232,203,133,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          ESCOLHER DESCANSO
        </DialogTitle>
        <DialogContent sx={{ background: 'linear-gradient(180deg, rgba(17,15,25,0.96), rgba(12,12,19,0.98))', color: '#f1f1f4', py: 3 }}>
          <Typography sx={{ mb: 2, color: '#d4d4dd' }}>Escolha como seu personagem deseja descansar para recuperar seus recursos.</Typography>

          <Stack spacing={1.5}>
            {Object.values(MODALIDADES_DESCANSO).map(modo => {
              const selecionado = modoDescansoSelecionado === modo.id;
              return (
                <Button
                  key={modo.id}
                  type="button"
                  variant={selecionado ? 'contained' : 'outlined'}
                  onClick={() => setModoDescansoSelecionado(modo.id)}
                  aria-label={modo.nome}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    width: '100%',
                    borderRadius: 2,
                    px: 2,
                    py: 1.5,
                    textAlign: 'left',
                    background: selecionado ? 'linear-gradient(180deg, rgba(232,203,133,0.15), rgba(120,92,42,0.17))' : 'rgba(255,255,255,0.02)',
                    borderColor: selecionado ? 'rgba(232,203,133,0.7)' : 'rgba(232,203,133,0.25)',
                    color: '#f1f1f4',
                    '&:hover': { borderColor: 'rgba(232,203,133,0.7)', background: 'rgba(232,203,133,0.06)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, flex: 1 }}>
                    <Box sx={{ width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(232,203,133,0.12)', border: '1px solid rgba(232,203,133,0.35)', fontSize: '1.3rem' }}>
                      {modo.icone}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: '#f4dda2', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.7rem' }}>{modo.nome}</Typography>
                      <Typography sx={{ color: '#f4dda2', fontWeight: 700, mt: 0.5, fontSize: '0.78rem' }}>Recuperação de {modo.percentual}%</Typography>
                      <Typography sx={{ color: '#d4d4dd', mt: 0.5, fontSize: '0.82rem', lineHeight: 1.5 }}>{modo.descricao}</Typography>
                    </Box>
                  </Box>
                </Button>
              );
            })}
          </Stack>

          {previsaoDescanso && (
            <Box sx={{ mt: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(232,203,133,0.25)', borderRadius: 1.5, p: 2 }}>
              <Typography sx={{ color: '#f4dda2', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.7rem', mb: 1 }}>Prévia da recuperação</Typography>
              <Stack spacing={0.8}>
                <Typography sx={{ color: '#f1f1f4', fontWeight: 600 }}>Saúde: {previsaoDescanso.saudeAtual} → {previsaoDescanso.proximaSaude}</Typography>
                <Typography sx={{ color: '#f1f1f4', fontWeight: 600 }}>Energia: {previsaoDescanso.energiaAtual} → {previsaoDescanso.proximaEnergia}</Typography>
                <Typography sx={{ color: '#f1f1f4', fontWeight: 600 }}>Fadiga: {previsaoDescanso.fadigaAtual} → {previsaoDescanso.proximaFadiga}</Typography>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ background: 'rgba(12,12,19,0.98)', borderTop: '1px solid rgba(232,203,133,0.2)', p: 2, justifyContent: 'space-between' }}>
          <Button onClick={() => {
            setConfirmarDescanso(false);
            setModoDescansoSelecionado(null);
          }}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={!modoDescansoSelecionado || confirmarDescansoEmAndamento}
            onClick={confirmarDescansoAgora}
            sx={{ background: 'linear-gradient(180deg, rgba(232,203,133,0.9), rgba(166,121,64,0.92))', color: '#0f1116', fontWeight: 800, textTransform: 'uppercase' }}
          >
            Confirmar descanso
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

ProntidaoModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func,
  prontidaoValor: PropTypes.number,
  tipo: PropTypes.oneOf(['central', 'info']),
};

ProntidaoModal.defaultProps = {
  onSave: null,
  prontidaoValor: 0,
  tipo: 'central',
};

export default ProntidaoModal;
