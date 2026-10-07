import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import BoltIcon from '@mui/icons-material/Bolt';
import CasinoIcon from '@mui/icons-material/Casino';
import CloseIcon from '@mui/icons-material/Close';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

import { getNome } from 'common/utils/resolveNome';
import {
  addHistoricoSorte,
  getBeneficiosPorUniverso,
  getEfeitosGuardados,
  getUniverso,
  removeEfeitoGuardado,
  setEfeitoGuardado,
} from 'service/storage';
import { useSaving } from 'context/SavingContext';

import { LIMITE_POR_CATEGORIA } from './catalogoTrapaca';
import { SectionTitle } from '../styles';

const normalizeText = value => String(value ?? '').trim();

const resolveBenefitImage = benefit => {
  const candidates = [
    benefit?.imagem,
    benefit?.image,
    benefit?.imagemUrl,
    benefit?.imageUrl,
    benefit?.urlImagem,
    benefit?.linkImagem,
    benefit?.foto,
    benefit?.coverImage,
    benefit?.cover,
    benefit?.img,
    benefit?.src,
    benefit?.url,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && normalizeText(candidate)) {
      return normalizeText(candidate);
    }

    if (candidate && typeof candidate === 'object') {
      const nested =
        candidate.url ??
        candidate.src ??
        candidate.href ??
        candidate.link ??
        candidate.imagem ??
        candidate.image ??
        candidate.imagemUrl ??
        candidate.imageUrl ??
        candidate.linkImagem ??
        candidate.foto ??
        candidate.coverImage;

      if (typeof nested === 'string' && normalizeText(nested)) {
        return normalizeText(nested);
      }
    }
  }

  return '';
};

const stringifyValue = value => {
  if (value == null) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map(item => stringifyValue(item))
      .filter(item => item && normalizeText(item) !== '')
      .join(', ');
  }
  if (typeof value === 'object') {
    return (
      value.texto ??
      value.descricao ??
      value.descricaoCompleta ??
      value.nome ??
      value.titulo ??
      value.label ??
      value.title ??
      JSON.stringify(value)
    );
  }
  return String(value);
};

const normalizeList = value => {
  if (Array.isArray(value)) {
    return value
      .map(item => stringifyValue(item))
      .filter(item => normalizeText(item) !== '');
  }
  if (!value && value !== 0) return [];
  if (typeof value === 'string') {
    return value
      .split(/[;,|]/)
      .map(item => item.trim())
      .filter(Boolean);
  }
  if (typeof value === 'object') {
    return [stringifyValue(value)].filter(item => normalizeText(item) !== '');
  }
  return [String(value)];
};

const normalizeCategoria = categoria => {
  const valor = normalizeText(categoria);
  return valor || 'Sem categoria';
};

const normalizeBonusValue = value => {
  if (value == null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(item => normalizeBonusValue(item));
  }

  if (typeof value === 'string') {
    return value.trim() ? [{ texto: value.trim(), tipo: '' }] : [];
  }

  if (typeof value === 'object') {
    const texto = stringifyValue(value?.texto ?? value?.descricao ?? value?.descricaoCompleta ?? value?.titulo ?? value?.label ?? value?.nome ?? '');
    const tipo = stringifyValue(value?.tipo ?? value?.tipoBonus ?? value?.categoria ?? value?.tag ?? '');
    return texto ? [{ texto, tipo: tipo || '' }] : [];
  }

  return String(value).trim() ? [{ texto: String(value).trim(), tipo: '' }] : [];
};

const normalizeBenefit = beneficio => {
  const categoria = normalizeCategoria(beneficio?.categoria ?? beneficio?.tag ?? beneficio?.tipo ?? beneficio?.grupo);
  const universos = normalizeList(beneficio?.universos ?? beneficio?.universo ?? []);
  const tokens = normalizeList(beneficio?.tokens ?? beneficio?.tags ?? beneficio?.tipoBonus ?? beneficio?.tag ?? []);
  const tipoAtivacao = beneficio?.tipoAtivacao ?? beneficio?.tipoDeAtivacao ?? (categoria === 'Benefícios Menores' ? 'imediata' : 'manual');
  const ativo = beneficio?.ativo ?? beneficio?.enabled ?? beneficio?.status !== 'inativo';
  const acumulavel = Boolean(beneficio?.acumulavel ?? beneficio?.acumulável ?? false);
  const bonusBruto = beneficio?.bonus ?? beneficio?.efeito ?? beneficio?.resultado ?? beneficio?.beneficio ?? [];
  const bonusLista = normalizeBonusValue(bonusBruto);
  const bonusTexto = bonusLista.map(item => item.texto).join(' • ') || '—';

  return {
    ...beneficio,
    id: beneficio?.id ?? String(beneficio?.nome ?? 'beneficio'),
    nome: beneficio?.nome ?? beneficio?.titulo ?? beneficio?.name ?? 'Benefício',
    categoria,
    tag: stringifyValue(beneficio?.tag ?? beneficio?.categoria ?? 'Narrativo'),
    descricao: stringifyValue(beneficio?.descricao ?? beneficio?.descricaoResumida ?? beneficio?.resumo ?? beneficio?.texto ?? ''),
    bonus: bonusTexto,
    bonusLista,
    tipoBonus: stringifyValue(beneficio?.tipoBonus ?? beneficio?.tipoDeBonus ?? beneficio?.bonusTipo ?? beneficio?.tipo ?? '—'),
    custo: Number(beneficio?.custo ?? beneficio?.preco ?? beneficio?.valor ?? 0),
    tokens: tokens.length > 0 ? tokens : ['Narrativo'],
    imagem: resolveBenefitImage(beneficio),
    ativo,
    acumulavel,
    limiteAcumulo: beneficio?.limiteAcumulo ?? beneficio?.limiteDeAcumulo ?? beneficio?.limiteAcumulacao ?? null,
    limitePeriodo: beneficio?.limitePeriodo ?? beneficio?.limitePorPeriodo ?? beneficio?.limitePorPeriodo ?? null,
    periodo: beneficio?.periodo ?? beneficio?.periodicidade ?? '—',
    universos,
    tipoAtivacao,
  };
};

const parseBooleanFlag = value => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    const normalizado = normalizeText(value).toLowerCase();
    if (['true', 'sim', 'yes', 's', '1', 'ativo', 'on'].includes(normalizado)) {
      return true;
    }
    if (['false', 'nao', 'no', 'n', '0', 'não', 'off', 'inativo'].includes(normalizado)) {
      return false;
    }
  }

  return Boolean(value);
};

const shouldStoreTricksterBenefit = beneficio => {
  if (!beneficio) {
    return false;
  }

  const acumulavel = parseBooleanFlag(beneficio?.acumulavel ?? beneficio?.acumulável);
  const limiteAcumulo = Number(beneficio?.limiteAcumulo ?? beneficio?.limiteDeAcumulo ?? beneficio?.limiteAcumulacao ?? 0);
  const limitePeriodo = Number(beneficio?.limitePeriodo ?? beneficio?.limitePorPeriodo ?? 0);
  const periodo = normalizeText(beneficio?.periodo ?? beneficio?.periodicidade ?? 'Nenhum');

  const possuiRegraDeAcumulo = acumulavel || limiteAcumulo > 0;
  const possuiRegraDePeriodo = limitePeriodo > 0 && !!periodo && !['nenhum', '—'].includes(periodo.toLowerCase());

  return possuiRegraDeAcumulo || possuiRegraDePeriodo;
};

const beneficioTemUniversoCompativel = (beneficio, universoAtual) => {
  if (!universoAtual) {
    return false;
  }

  const universos = beneficio?.universos ?? [];
  if (universos.length === 0) {
    return true;
  }

  const norm = universos.map(item => normalizeText(item).toLowerCase());
  const todos = ['todos', 'all', 'todos os universos', 'todos-os-universos', 'todas', 'qualquer universo'];
  if (norm.some(valor => todos.includes(valor))) {
    return true;
  }

  return norm.includes(normalizeText(universoAtual).toLowerCase());
};

const ALL_UNIVERSE_MARKERS = [
  'todos',
  'all',
  'todos os universos',
  'todos-os-universos',
  'todas',
  'qualquer universo',
];

const resolveUniverseDisplayNames = (rawUniversos, universoMap) => {
  const valores = normalizeList(rawUniversos ?? []);

  if (valores.length === 0) {
    return ['Todos os Universos'];
  }

  const normalizados = valores.map(item => normalizeText(item));
  if (normalizados.some(item => ALL_UNIVERSE_MARKERS.includes(item.toLowerCase()))) {
    return ['Todos os Universos'];
  }

  return normalizados
    .map(item => {
      const universo = universoMap.get(item);
      const nome = getNome(universo) || item;
      return normalizeText(nome) || item;
    })
    .filter(Boolean);
};

const normalizeGuardado = efeito => {
  const id = efeito?.beneficioId ?? efeito?.id ?? 'beneficio-guardado';
  const quantidade = Number(efeito?.quantidade ?? efeito?.qtd ?? 1);

  return {
    ...efeito,
    id,
    beneficioId: efeito?.beneficioId ?? id,
    nome: efeito?.nome ?? 'Benefício guardado',
    categoria: efeito?.categoria ?? 'Benefícios Menores',
    quantidade: Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 1,
    usosPeriodo: Number(efeito?.usosPeriodo ?? efeito?.usos ?? 0),
    referenciaPeriodo: efeito?.referenciaPeriodo ?? null,
    adquiridoEm: efeito?.adquiridoEm ?? efeito?.compradoEm ?? efeito?.createdAt ?? new Date().toISOString(),
  };
};

const mergeEfeitosGuardados = (...listas) => {
  const mapa = new Map();

  listas.flat().forEach(efeito => {
    const item = normalizeGuardado(efeito);
    const chave = item.beneficioId ?? item.id;
    const atual = mapa.get(chave);

    if (!atual) {
      mapa.set(chave, item);
      return;
    }

    mapa.set(chave, normalizeGuardado({
      ...atual,
      ...item,
      quantidade: Math.max(Number(atual.quantidade ?? 0), Number(item.quantidade ?? 0)),
      usosPeriodo: Math.max(Number(atual.usosPeriodo ?? 0), Number(item.usosPeriodo ?? 0)),
    }));
  });

  return Array.from(mapa.values());
};

const getPeriodoReferencia = periodo => {
  const valor = normalizeText(periodo).toLowerCase();

  if (!valor || valor === 'nenhum' || valor === '—') {
    return null;
  }

  if (valor.includes('sessão') || valor.includes('sessao')) {
    return `sessao:${new Date().toISOString().slice(0, 10)}`;
  }

  if (valor.includes('dia')) {
    return `dia:${new Date().toISOString().slice(0, 10)}`;
  }

  if (valor.includes('semana')) {
    return `semana:${new Date().toISOString().slice(0, 10)}`;
  }

  if (valor.includes('mês') || valor.includes('mes')) {
    const hoje = new Date();
    return `mes:${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  }

  return valor;
};

const getPeriodoTextoUso = periodo => {
  const valor = normalizeText(periodo).toLowerCase();

  if (!valor || valor === 'nenhum' || valor === '—') {
    return 'Usos neste período';
  }

  if (valor.includes('sessão') || valor.includes('sessao')) {
    return 'Usos nesta sessão';
  }

  if (valor.includes('dia')) {
    return 'Usos hoje';
  }

  if (valor.includes('combate')) {
    return 'Usos neste combate';
  }

  if (valor.includes('cena')) {
    return 'Usos nesta cena';
  }

  return 'Usos neste período';
};

const formatarTextoCurto = texto => {
  if (!texto) {
    return '—';
  }
  const valor = normalizeText(texto);
  return valor.length > 120 ? `${valor.slice(0, 117)}...` : valor;
};

const LojaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 8px 0 20px;
`;

const CategoryTab = styled.button`
  border: 1px solid rgba(232, 203, 133, 0.22);
  background: ${({ $ativo }) => ($ativo ? 'linear-gradient(135deg, rgba(108,99,255,0.23), rgba(232,195,106,0.12))' : 'rgba(12, 17, 32, 0.7)')};
  color: ${({ $ativo }) => ($ativo ? 'var(--status-gold-strong)' : 'var(--text-primary)')};
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ $ativo }) => ($ativo ? '0 10px 22px rgba(108,99,255,0.14)' : 'none')};

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(232, 203, 133, 0.42);
  }
`;

const BenefitCard = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(232, 203, 133, 0.2);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(8, 15, 30, 0.96), rgba(18, 23, 36, 0.9));
  overflow: hidden;
  text-align: left;
  padding: 0;
  color: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 14px 26px rgba(8, 12, 18, 0.26);

  &:hover {
    border-color: rgba(232, 203, 133, 0.5);
    transform: translateY(-3px);
  }
`;

const CardImage = styled.div`
  position: relative;
  height: 160px;
  background: linear-gradient(135deg, rgba(93, 69, 162, 0.32), rgba(17, 18, 31, 0.92));
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 1px solid rgba(232, 203, 133, 0.18);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const FallbackBadge = styled.div`
  font-size: 1.8rem;
  opacity: 0.8;
`;

const CardPrice = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(9, 12, 26, 0.78);
  border: 1px solid rgba(232, 203, 133, 0.32);
  color: var(--status-gold-strong);
  font-weight: 800;
  font-size: 0.8rem;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 14px 16px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const CardTitle = styled.h4`
  margin: 0;
  font-size: 1.1rem;
  color: var(--status-gold-strong);
  line-height: 1.2;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const MetaPill = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  background: rgba(93, 110, 255, 0.12);
  border: 1px solid ${({ $danger }) => ($danger ? 'rgba(244, 63, 94, 0.42)' : 'rgba(108,99,255,0.35)')};
  color: ${({ $danger }) => ($danger ? '#fca5a5' : 'var(--status-gold)')};
`;

const CardDescription = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.82rem;
  line-height: 1.5;
`;

const BonusBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(232, 203, 133, 0.05);
  border: 1px solid rgba(232, 203, 133, 0.12);
  color: var(--status-gold);
  font-size: 0.8rem;
  line-height: 1.45;

  svg {
    width: 14px;
    height: 14px;
    margin-top: 1px;
    flex-shrink: 0;
  }
`;

const TokenRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const TokenPill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(108, 99, 255, 0.12);
  border: 1px solid rgba(108, 99, 255, 0.3);
  color: var(--text-primary);
  font-size: 0.66rem;
  font-weight: 700;
`;

const EmptyState = styled.div`
  padding: 18px 14px;
  border-radius: 12px;
  border: 1px dashed rgba(232, 203, 133, 0.18);
  color: var(--text-secondary);
  text-align: center;
`;

const SavedEffectsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SavedEffectsHeader = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
`;

const SavedEffectsHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SavedEffectsCount = styled.span`
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
`;

const SavedEffectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const SavedEffectCard = styled.div`
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr);
  gap: 12px;
  padding: 12px;
  background: linear-gradient(180deg, rgba(13, 18, 30, 0.96), rgba(18, 24, 38, 0.94));
  border: 1px solid rgba(232, 203, 133, 0.12);
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18);
  min-width: 0;
`;

const SavedEffectImage = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  border: 1px solid rgba(232, 203, 133, 0.12);
  background: linear-gradient(135deg, rgba(93, 69, 162, 0.28), rgba(17, 18, 31, 0.9));
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const SavedEffectContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const SavedEffectHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
`;

const SavedEffectTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const SavedEffectName = styled.strong`
  color: var(--status-gold-strong);
  font-size: 0.96rem;
  line-height: 1.3;
  word-break: break-word;
`;

const SavedEffectMeta = styled.span`
  color: var(--text-secondary);
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const SavedEffectQuantity = styled.span`
  flex-shrink: 0;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(108, 99, 255, 0.12);
  border: 1px solid rgba(108, 99, 255, 0.3);
  color: var(--status-gold);
  font-size: 0.7rem;
  font-weight: 700;
`;

const SavedEffectBonus = styled.div`
  color: var(--text-primary);
  font-size: 0.78rem;
  line-height: 1.45;
  opacity: 0.92;
`;

const SavedEffectFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
`;

const SavedEffectUsage = styled.span`
  color: var(--text-secondary);
  font-size: 0.74rem;
  line-height: 1.4;
`;

const ErrorState = styled.div`
  padding: 16px;
  color: #fca5a5;
  background: rgba(127, 29, 29, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.28);
  border-radius: 12px;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  color: var(--text-secondary);
`;

const DetailDialogContent = styled(DialogContent)`
  background: linear-gradient(180deg, rgba(9, 11, 20, 0.98), rgba(12, 16, 28, 0.98));
  padding: 0 0 16px;
`;

const DetailImage = styled.div`
  position: relative;
  height: 220px;
  background: linear-gradient(135deg, rgba(93, 69, 162, 0.32), rgba(17, 18, 31, 0.92));
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const DetailBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 18px 0;
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
`;

const DetailTitle = styled.h3`
  margin: 0;
  font-size: clamp(1.2rem, 2vw, 1.8rem);
  color: var(--status-gold-strong);
  line-height: 1.2;
`;

const DetailPrice = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(232, 203, 133, 0.08);
  border: 1px solid rgba(232, 203, 133, 0.28);
  color: var(--status-gold-strong);
  font-weight: 800;
  white-space: nowrap;
`;

const DetailSection = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 10px;
`;

const DetailSectionTitle = styled.h4`
  margin: 0 0 6px;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

const DetailText = styled.p`
  margin: 0;
  color: var(--text-primary);
  font-size: 0.93rem;
  line-height: 1.55;
`;

const BonusStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const BonusEntry = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(232, 203, 133, 0.05);
  border: 1px solid rgba(232, 203, 133, 0.12);
  color: var(--status-gold);
  font-size: 0.82rem;
  line-height: 1.4;
`;

const BonusType = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 6px;
  border-radius: 999px;
  border: 1px solid rgba(232, 203, 133, 0.22);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-secondary);
  white-space: nowrap;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const RuleList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
  font-size: 0.82rem;
  color: var(--text-secondary);

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const RuleItem = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 2px 0;
`;

const RuleLabel = styled.span`
  opacity: 0.82;
`;

const RuleValue = styled.strong`
  color: var(--text-primary);
  font-weight: 700;
  text-align: right;
`;

const UniversePillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
`;

const UniverseOverflowButton = styled.button`
  appearance: none;
  border: 1px solid rgba(232, 203, 133, 0.32);
  border-radius: 999px;
  background: rgba(108, 99, 255, 0.12);
  color: var(--status-gold);
  padding: 5px 9px;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
`;

const UniverseTooltipContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 260px;
  max-height: 180px;
  overflow-y: auto;
  padding: 6px 0;
  color: var(--text-primary);
`;

const UniverseTooltipItem = styled.div`
  padding: 4px 10px;
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.8rem;
  line-height: 1.4;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
`;

const DetailFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const DetailHeaderClose = styled(IconButton)`
  position: absolute;
  top: 10px;
  right: 10px;
  color: var(--text-primary);
  background: rgba(13, 18, 30, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 1;

  &:hover {
    background: rgba(22, 30, 48, 0.8);
  }
`;

const LojaTrapacaSection = ({ personagem, onSave, aba = 'trapaca' }) => {
  const fortunaAtual = personagem.sorte?.fortunaAtual ?? 0;
  const { executar } = useSaving();
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [beneficios, setBeneficios] = useState([]);
  const [efeitosGuardados, setEfeitosGuardados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [mensagemGuardado, setMensagemGuardado] = useState('');
  const [beneficioSelecionado, setBeneficioSelecionado] = useState(null);
  const [universosCatalogo, setUniversosCatalogo] = useState([]);
  const carregamentoGuardadosRef = useRef(0);

  useEffect(() => {
    let ativo = true;

    if (typeof getUniverso !== 'function') {
      setUniversosCatalogo([]);
      return () => {
        ativo = false;
      };
    }

    getUniverso()
      .then(items => {
        if (ativo) {
          setUniversosCatalogo(items ?? []);
        }
      })
      .catch(() => {
        if (ativo) {
          setUniversosCatalogo([]);
        }
      });

    return () => {
      ativo = false;
    };
  }, []);

  const universoMap = useMemo(
    () => new Map((universosCatalogo ?? []).map(universo => [universo.id, universo])),
    [universosCatalogo],
  );

  useEffect(() => {
    const requestId = ++carregamentoGuardadosRef.current;
    let ativo = true;

    getEfeitosGuardados(personagem.id)
      .then(items => {
        if (!ativo || requestId !== carregamentoGuardadosRef.current) {
          return;
        }

        const itensValidos = (items ?? []).filter(item => {
          const beneficioId = item?.beneficioId ?? item?.id;
          const beneficioCatalogado = beneficios.find(beneficio => beneficio.id === beneficioId);

          if (!beneficioCatalogado) {
            return false;
          }

          return shouldStoreTricksterBenefit(beneficioCatalogado);
        });

        setEfeitosGuardados(mergeEfeitosGuardados(itensValidos));
      })
      .catch(() => {
        if (ativo && requestId === carregamentoGuardadosRef.current) {
          setEfeitosGuardados([]);
        }
      });

    return () => {
      ativo = false;
      if (carregamentoGuardadosRef.current === requestId) {
        carregamentoGuardadosRef.current += 1;
      }
    };
  }, [beneficios, personagem.id]);

  const efeitosAtivosLegacy = useMemo(
    () => (personagem.lojaTrapaça?.efeitosAtivos ?? []).filter(efeito => {
      const beneficioId = efeito?.beneficioId ?? efeito?.id;
      const beneficioCatalogado = beneficios.find(beneficio => beneficio.id === beneficioId);

      if (!beneficioCatalogado) {
        return false;
      }

      return shouldStoreTricksterBenefit(beneficioCatalogado);
    }),
    [beneficios, personagem.lojaTrapaça],
  );

  const efeitosAtivos = useMemo(() => mergeEfeitosGuardados(
    efeitosAtivosLegacy,
    efeitosGuardados,
  ), [efeitosAtivosLegacy, efeitosGuardados]);

  useEffect(() => {
    let ativo = true;

    const carregarBeneficios = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const itens = await getBeneficiosPorUniverso(personagem.universo);
        if (!ativo) {
          return;
        }

        const normalizados = itens
          .map(normalizeBenefit)
          .filter(beneficio => beneficio.ativo && beneficioTemUniversoCompativel(beneficio, personagem.universo));
        setBeneficios(normalizados);

        if (normalizados.length > 0) {
          setCategoriaAtiva(actual => {
            if (actual === 'Todos' || (actual && normalizados.some(item => item.categoria === actual))) {
              return actual || 'Todos';
            }
            return 'Todos';
          });
        } else {
          setCategoriaAtiva('Todos');
        }
      } catch {
        if (!ativo) {
          return;
        }
        setErro('Não foi possível carregar os benefícios da Loja da Trapaça.');
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    carregarBeneficios();
    return () => {
      ativo = false;
    };
  }, [personagem.universo]);

  const categoriasDisponiveis = useMemo(() => {
    const categorias = new Map();

    beneficios.forEach(beneficio => {
      const categoria = normalizeCategoria(beneficio.categoria ?? beneficio.tag ?? beneficio.tipo);
      if (categoria && categoria !== 'Sem categoria') {
        const chave = categoria.toLowerCase();
        if (!categorias.has(chave)) {
          categorias.set(chave, categoria);
        }
      }
    });

    return ['Todos', ...Array.from(categorias.values())];
  }, [beneficios]);

  const beneficiosFiltrados = useMemo(
    () => {
      if (categoriaAtiva === 'Todos') {
        return beneficios;
      }
      return beneficios.filter(beneficio => normalizeCategoria(beneficio.categoria ?? beneficio.tag ?? beneficio.tipo) === categoriaAtiva);
    },
    [beneficios, categoriaAtiva],
  );

  const efeitosAtivosGuardaveis = useMemo(() => {
    const catalogoPorId = new Map(beneficios.map(beneficio => [beneficio.id, beneficio]));

    return efeitosAtivos.filter(efeito => {
      const beneficioCatalogado = catalogoPorId.get(efeito.beneficioId ?? efeito.id);
      if (!beneficioCatalogado) {
        return true;
      }

      return shouldStoreTricksterBenefit(beneficioCatalogado);
    });
  }, [beneficios, efeitosAtivos]);

  const contagemPorCategoria = useMemo(
    () => categoria =>
      efeitosAtivosGuardaveis.reduce((total, efeito) => {
        if (efeito.categoria === categoria) {
          return total + Number(efeito.quantidade ?? 1);
        }
        return total;
      }, 0),
    [efeitosAtivosGuardaveis],
  );

  const handleComprar = useCallback(
    beneficio => {
      setMensagemGuardado('');
      const custo = Number(beneficio.custo ?? 0);
      const beneficioId = beneficio.id;
      const deveSerGuardado = shouldStoreTricksterBenefit(beneficio);
      const beneficioExistente = efeitosAtivos.find(efeito => (efeito.beneficioId ?? efeito.id) === beneficioId);
      const beneficioExistenteGuardavel = efeitosAtivosGuardaveis.find(efeito => (efeito.beneficioId ?? efeito.id) === beneficioId);
      const quantidadeAtual = Number(beneficioExistente?.quantidade ?? 0);
      const valorLimiteAcumulo = Number(beneficio?.limiteAcumulo ?? 0);
      const valorLimitePeriodo = Number(beneficio?.limitePeriodo ?? 0);
      const proximaQuantidade = quantidadeAtual + 1;

      if (fortunaAtual < custo) {
        return undefined;
      }

      if (beneficio.ativo === false || !beneficioTemUniversoCompativel(beneficio, personagem.universo)) {
        return undefined;
      }

      if (beneficio.tipoAtivacao === 'manual') {
        const limiteCategoria = LIMITE_POR_CATEGORIA[beneficio.categoria] ?? Infinity;
        if (contagemPorCategoria(beneficio.categoria) >= limiteCategoria) {
          setMensagemGuardado(`Limite de categoria atingido (${limiteCategoria}).`);
          return undefined;
        }
      }

      if (beneficio.acumulavel === false && quantidadeAtual >= 1) {
        setMensagemGuardado('Este benefício não pode ser acumulado em mais de uma unidade.');
        return undefined;
      }

      if (valorLimiteAcumulo > 0 && proximaQuantidade > valorLimiteAcumulo) {
        setMensagemGuardado(`Limite de acúmulo atingido (${valorLimiteAcumulo}/${valorLimiteAcumulo}).`);
        return undefined;
      }

      if (valorLimitePeriodo > 0) {
        const periodoAtual = getPeriodoReferencia(beneficio.periodo);
        const usoAtual = beneficioExistente && periodoAtual && beneficioExistente.referenciaPeriodo === periodoAtual
          ? Number(beneficioExistente.usosPeriodo ?? 0)
          : 0;
        const limitePeriodoAtingido = usoAtual >= valorLimitePeriodo;
        if (limitePeriodoAtingido && beneficioExistente) {
          setMensagemGuardado(`Limite de ${normalizeText(beneficio.periodo || 'período')} atingido (${valorLimitePeriodo}/${valorLimitePeriodo}).`);
          return undefined;
        }
      }

      const adquiridoEm = new Date().toISOString();
      const referenciaPeriodo = getPeriodoReferencia(beneficio.periodo);
      const proximoItem = normalizeGuardado({
        beneficioId,
        id: beneficioId,
        nome: beneficio.nome,
        categoria: beneficio.categoria,
        quantidade: proximaQuantidade,
        usosPeriodo: beneficioExistenteGuardavel ? Number(beneficioExistenteGuardavel.usosPeriodo ?? 0) : 0,
        referenciaPeriodo: referenciaPeriodo || beneficioExistenteGuardavel?.referenciaPeriodo || null,
        adquiridoEm,
      });

      const novosEfeitos = beneficioExistenteGuardavel
        ? efeitosAtivosGuardaveis.map(efeito => ((efeito.beneficioId ?? efeito.id) === beneficioId ? proximoItem : efeito))
        : [...efeitosAtivosGuardaveis, proximoItem];

      return executar(async () => {
        const patch = {
          sorte: { ...personagem.sorte, fortunaAtual: fortunaAtual - custo },
        };

        if (deveSerGuardado) {
          patch.lojaTrapaça = { ...personagem.lojaTrapaça, efeitosAtivos: novosEfeitos };
          setEfeitosGuardados(current => mergeEfeitosGuardados(current, [proximoItem]));
        }

        await onSave(patch);

        if (!deveSerGuardado) {
          await addHistoricoSorte(personagem.id, {
            tipo: 'compra_trapaca',
            descricao: `Comprou "${beneficio.nome}" na Loja da Trapaça`,
            valor: -custo,
          });
          return;
        }

        await setEfeitoGuardado(personagem.id, beneficioId, {
          beneficioId,
          nome: beneficio.nome,
          categoria: beneficio.categoria,
          quantidade: proximaQuantidade,
          usosPeriodo: beneficioExistenteGuardavel ? Number(beneficioExistenteGuardavel.usosPeriodo ?? 0) : 0,
          referenciaPeriodo: referenciaPeriodo || beneficioExistenteGuardavel?.referenciaPeriodo || null,
          adquiridoEm,
        });
        await addHistoricoSorte(personagem.id, {
          tipo: 'compra_trapaca',
          descricao: `Comprou "${beneficio.nome}" na Loja da Trapaça`,
          valor: -custo,
        });
      });
    },
    [contagemPorCategoria, efeitosAtivos, efeitosAtivosGuardaveis, fortunaAtual, executar, onSave, personagem],
  );

  const handleUsar = useCallback(
    index =>
      executar(async () => {
        setMensagemGuardado('');
        const efeito = efeitosAtivosGuardaveis[index];
        if (!efeito) {
          return;
        }

        const beneficioId = efeito.beneficioId ?? efeito.id;
        const beneficioCatalogado = beneficios.find(item => item.id === beneficioId) ?? null;
        const limitePeriodo = Number(beneficioCatalogado?.limitePeriodo ?? beneficioCatalogado?.limitePorPeriodo ?? 0);
        const periodoCatalogado = beneficioCatalogado?.periodo ?? 'Sessão';
        const referenciaAtual = getPeriodoReferencia(periodoCatalogado);
        const usosPeriodo = referenciaAtual && efeito.referenciaPeriodo === referenciaAtual
          ? Number(efeito.usosPeriodo ?? 0)
          : 0;

        if (limitePeriodo > 0 && usosPeriodo >= limitePeriodo) {
          setMensagemGuardado(`Limite de ${normalizeText(periodoCatalogado || 'período')} atingido (${limitePeriodo}/${limitePeriodo}).`);
          return;
        }

        const proximaQuantidade = Number(efeito.quantidade ?? 1) - 1;
        const proximoUsosPeriodo = usosPeriodo + 1;
        const proximoReferencia = referenciaAtual || efeito.referenciaPeriodo || null;
        const proximoLegacy = efeitosAtivosGuardaveis.filter((_efeito, itemIndex) => itemIndex !== index);

        await onSave({
          lojaTrapaça: {
            ...personagem.lojaTrapaça,
            efeitosAtivos: proximoLegacy,
          },
        });

        if (proximaQuantidade > 0) {
          const itemAtualizado = normalizeGuardado({
            ...efeito,
            quantidade: proximaQuantidade,
            usosPeriodo: proximoUsosPeriodo,
            referenciaPeriodo: proximoReferencia,
          });

          await setEfeitoGuardado(personagem.id, beneficioId, {
            beneficioId,
            nome: efeito.nome,
            categoria: efeito.categoria,
            quantidade: proximaQuantidade,
            usosPeriodo: proximoUsosPeriodo,
            referenciaPeriodo: proximoReferencia,
            adquiridoEm: efeito.adquiridoEm,
          });
          setEfeitosGuardados(current =>
            current
              .map(normalizeGuardado)
              .map(item => ((item.beneficioId ?? item.id) === beneficioId ? itemAtualizado : item)),
          );
          return;
        }

        await removeEfeitoGuardado(personagem.id, beneficioId);
        setEfeitosGuardados(current =>
          current
            .map(normalizeGuardado)
            .filter(item => (item.beneficioId ?? item.id) !== beneficioId),
        );
      }),
    [beneficios, efeitosAtivosGuardaveis, onSave, personagem.id, personagem.lojaTrapaça, executar],
  );

  const universosSelecionados = useMemo(() => {
    if (!beneficioSelecionado) {
      return [];
    }

    return resolveUniverseDisplayNames(beneficioSelecionado.universos, universoMap);
  }, [beneficioSelecionado, universoMap]);

  const universosVisiveis = universosSelecionados.length <= 3 ? universosSelecionados : universosSelecionados.slice(0, 3);
  const universosRestantes = universosSelecionados.length > 3 ? universosSelecionados.slice(3) : [];

  const efeitoGuardadoCard = (efeito, index) => {
    const beneficioCatalogado = beneficios.find(item => item.id === (efeito.beneficioId ?? efeito.id)) ?? null;
    const bonusResumo = beneficioCatalogado?.bonus || efeito?.bonus || '—';
    const limitePeriodo = Number(beneficioCatalogado?.limitePeriodo ?? beneficioCatalogado?.limitePorPeriodo ?? 0);
    const periodoTexto = beneficioCatalogado?.periodo ?? 'Sessão';
    const referenciaAtual = getPeriodoReferencia(periodoTexto);
    const usoAtual = referenciaAtual && efeito.referenciaPeriodo === referenciaAtual
      ? Number(efeito.usosPeriodo ?? 0)
      : 0;
    const usoLimitado = limitePeriodo > 0;
    const usarDesabilitado = usoLimitado && usoAtual >= limitePeriodo;

    return (
      <SavedEffectCard key={`${efeito.beneficioId ?? efeito.id}-${index}`}>
        <SavedEffectImage>
          {beneficioCatalogado?.imagem ? (
            <img
              src={beneficioCatalogado.imagem}
              alt={efeito.nome}
              onError={event => {
                event.currentTarget.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.textContent = '✨';
                fallback.style.fontSize = '2.2rem';
                fallback.style.opacity = '0.8';
                event.currentTarget.parentElement.appendChild(fallback);
              }}
            />
          ) : (
            <FallbackBadge>✨</FallbackBadge>
          )}
        </SavedEffectImage>

        <SavedEffectContent>
          <SavedEffectHeader>
            <SavedEffectTitle>
              <SavedEffectName>{efeito.nome}</SavedEffectName>
              <SavedEffectMeta>{efeito.categoria || beneficioCatalogado?.categoria || 'Benefícios Menores'}</SavedEffectMeta>
            </SavedEffectTitle>
            <SavedEffectQuantity>x{Number(efeito.quantidade ?? 1)}</SavedEffectQuantity>
          </SavedEffectHeader>

          <SavedEffectBonus>
            {bonusResumo !== '—' ? `⚡ ${bonusResumo}` : 'Sem bônus resumido.'}
          </SavedEffectBonus>

          <SavedEffectFooter>
            <SavedEffectUsage>
              {usoLimitado ? `${getPeriodoTextoUso(periodoTexto)}: ${usoAtual} / ${limitePeriodo}` : 'Uso ilimitado'}
            </SavedEffectUsage>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() => handleUsar(index)}
              disabled={usarDesabilitado || Number(efeito.quantidade ?? 1) <= 0}
            >
              {usarDesabilitado ? 'Limite atingido' : 'Usar'}
            </Button>
          </SavedEffectFooter>
        </SavedEffectContent>
      </SavedEffectCard>
    );
  };

  return (
    <div>
      {aba === 'trapaca' && (
        <>
          <CategoryTabs>
            {categoriasDisponiveis.map(categoria => (
              <CategoryTab
                key={categoria}
                type="button"
                $ativo={categoriaAtiva === categoria}
                onClick={() => setCategoriaAtiva(categoria)}
              >
                {categoria}
              </CategoryTab>
            ))}
          </CategoryTabs>

          {carregando && <LoadingState>Carregando benefícios...</LoadingState>}
          {!carregando && erro && <ErrorState>{erro}</ErrorState>}

          {!carregando && !erro && beneficiosFiltrados.length === 0 && (
            <EmptyState>
              Nenhum benefício disponível para este universo ou categoria no momento.
            </EmptyState>
          )}

          {!carregando && !erro && beneficiosFiltrados.length > 0 && (
            <LojaGrid>
              {beneficiosFiltrados.map(beneficio => {
                const semSaldo = fortunaAtual < beneficio.custo;
                const limite = LIMITE_POR_CATEGORIA[beneficio.categoria] ?? Infinity;
                const limiteAtingido =
                  beneficio.tipoAtivacao === 'manual' && contagemPorCategoria(beneficio.categoria) >= limite;
                const indisponivel = !beneficio.ativo || !beneficioTemUniversoCompativel(beneficio, personagem.universo);

                return (
                  <BenefitCard
                    key={beneficio.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setBeneficioSelecionado(beneficio)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setBeneficioSelecionado(beneficio);
                      }
                    }}
                    aria-label={`Abrir detalhes de ${beneficio.nome}`}
                  >
                    <CardImage>
                      {beneficio.imagem ? (
                        <img
                          src={beneficio.imagem}
                          alt={beneficio.nome}
                          onError={event => {
                            event.currentTarget.style.display = 'none';
                            event.currentTarget.parentElement.appendChild(
                              Object.assign(document.createElement('div'), {
                                className: 'fallback',
                                textContent: '✨',
                                style: { fontSize: '2.2rem', opacity: '0.8' },
                              }),
                            );
                          }}
                        />
                      ) : (
                        <FallbackBadge>✨</FallbackBadge>
                      )}
                      <CardPrice>
                        <MonetizationOnIcon fontSize="inherit" />
                        {beneficio.custo}
                      </CardPrice>
                    </CardImage>

                    <CardBody>
                      <CardHeader>
                        <CardTitle>{beneficio.nome}</CardTitle>
                      </CardHeader>

                      <MetaRow>
                        <MetaPill>{beneficio.tag}</MetaPill>
                        <MetaPill $danger={!beneficio.ativo}>{beneficio.ativo ? 'Ativo' : 'Inativo'}</MetaPill>
                      </MetaRow>

                      <CardDescription>{formatarTextoCurto(beneficio.descricao)}</CardDescription>

                      <BonusBox>
                        <BoltIcon fontSize="inherit" />
                        <span>{beneficio.bonus}</span>
                      </BonusBox>

                      <TokenRow>
                        {beneficio.tokens.slice(0, 3).map(token => (
                          <TokenPill key={`${beneficio.id}-${token}`}>{token}</TokenPill>
                        ))}
                      </TokenRow>

                      <Button
                        fullWidth
                        variant="contained"
                        disabled={semSaldo || limiteAtingido || indisponivel}
                        onClick={event => {
                          event.stopPropagation();
                          handleComprar(beneficio);
                        }}
                      >
                        {indisponivel
                          ? 'Indisponível'
                          : limiteAtingido
                            ? 'Limite atingido'
                            : semSaldo
                              ? 'Saldo insuficiente'
                              : 'Comprar'}
                      </Button>
                    </CardBody>
                  </BenefitCard>
                );
              })}
            </LojaGrid>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 24,
              paddingTop: 18,
              borderTop: '1px solid rgba(232, 203, 133, 0.18)',
              color: 'var(--status-gold)',
              fontSize: '0.8rem',
              textAlign: 'center',
            }}
          >
            <CasinoIcon fontSize="inherit" />
            Use Fortuna (Ȼ) para comprar itens mágicos e especiais | Limite de 1 Bênção por dia
          </div>
        </>
      )}

      {aba === 'guardados' && (
        <SavedEffectsSection>
          <SavedEffectsHeader>
            <SavedEffectsHeaderText>
              <SectionTitle style={{ margin: 0 }}>Efeitos Guardados</SectionTitle>
              <SavedEffectsCount>
                {efeitosAtivosGuardaveis.length} efeito{efeitosAtivosGuardaveis.length === 1 ? '' : 's'} guardado{efeitosAtivosGuardaveis.length === 1 ? '' : 's'}
              </SavedEffectsCount>
            </SavedEffectsHeaderText>
          </SavedEffectsHeader>

          {mensagemGuardado && (
            <div style={{ color: 'var(--status-gold)', fontSize: '0.8rem' }}>{mensagemGuardado}</div>
          )}

          {efeitosAtivosGuardaveis.length === 0 ? (
            <EmptyState>
              Nenhum efeito guardado. Compre benefícios acumuláveis na Loja da Trapaça para que eles apareçam aqui.
            </EmptyState>
          ) : (
            <SavedEffectGrid>
              {efeitosAtivosGuardaveis.map((efeito, index) => efeitoGuardadoCard(efeito, index))}
            </SavedEffectGrid>
          )}
        </SavedEffectsSection>
      )}

      {beneficioSelecionado && (
        <Dialog
          open={Boolean(beneficioSelecionado)}
          onClose={() => setBeneficioSelecionado(null)}
          maxWidth="sm"
          fullWidth
        >
          <DetailDialogContent>
            <DetailHeaderClose aria-label="Fechar detalhes" onClick={() => setBeneficioSelecionado(null)}>
              <CloseIcon fontSize="small" />
            </DetailHeaderClose>

            <DetailImage>
              {beneficioSelecionado.imagem ? (
                <img
                  src={beneficioSelecionado.imagem}
                  alt={beneficioSelecionado.nome}
                  onError={event => {
                    event.currentTarget.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.textContent = '✨';
                    fallback.style.fontSize = '2.4rem';
                    fallback.style.opacity = '0.8';
                    event.currentTarget.parentElement.appendChild(fallback);
                  }}
                />
              ) : (
                <FallbackBadge>✨</FallbackBadge>
              )}
            </DetailImage>

            <DetailBody>
              <DetailHeader>
                <DetailTitle>{beneficioSelecionado.nome}</DetailTitle>
                <DetailPrice>
                  <MonetizationOnIcon fontSize="inherit" />
                  {beneficioSelecionado.custo}
                </DetailPrice>
              </DetailHeader>

              <MetaRow>
                <MetaPill>{beneficioSelecionado.tag}</MetaPill>
                <MetaPill>{beneficioSelecionado.tipoBonus}</MetaPill>
                <MetaPill $danger={!beneficioSelecionado.ativo}>{beneficioSelecionado.ativo ? 'Ativo' : 'Inativo'}</MetaPill>
                {!beneficioSelecionado.acumulavel ? <MetaPill $danger>Não acumulável</MetaPill> : null}
              </MetaRow>

              <DetailSection>
                <DetailSectionTitle>Descrição</DetailSectionTitle>
                <DetailText>{beneficioSelecionado.descricao || 'Nenhuma descrição disponível.'}</DetailText>
              </DetailSection>

              <DetailSection>
                <DetailSectionTitle>Bônus</DetailSectionTitle>
                {beneficioSelecionado.bonusLista && beneficioSelecionado.bonusLista.length > 0 ? (
                  <BonusStack>
                    {beneficioSelecionado.bonusLista.map((bonus, index) => (
                      <BonusEntry key={`${beneficioSelecionado.id}-bonus-${index}`}>
                        {bonus.tipo ? <BonusType>{bonus.tipo}</BonusType> : null}
                        <span>{bonus.texto || '—'}</span>
                      </BonusEntry>
                    ))}
                  </BonusStack>
                ) : (
                  <DetailText>—</DetailText>
                )}
              </DetailSection>

              <DetailSection>
                <DetailSectionTitle>Tokens</DetailSectionTitle>
                <TokenRow>
                  {beneficioSelecionado.tokens.map(token => (
                    <TokenPill key={`${beneficioSelecionado.id}-${token}`}>{token}</TokenPill>
                  ))}
                </TokenRow>
              </DetailSection>

              <DetailSection>
                <DetailSectionTitle>Regras de Uso</DetailSectionTitle>
                <RuleList>
                  <RuleItem>
                    <RuleLabel>Acumulável</RuleLabel>
                    <RuleValue>{beneficioSelecionado.acumulavel ? 'Sim' : 'Não'}</RuleValue>
                  </RuleItem>
                  <RuleItem>
                    <RuleLabel>Limite de Acúmulo</RuleLabel>
                    <RuleValue>{beneficioSelecionado.limiteAcumulo ?? '—'}</RuleValue>
                  </RuleItem>
                  <RuleItem>
                    <RuleLabel>Limite por Período</RuleLabel>
                    <RuleValue>{beneficioSelecionado.limitePeriodo ?? '—'}</RuleValue>
                  </RuleItem>
                  <RuleItem>
                    <RuleLabel>Período</RuleLabel>
                    <RuleValue>{beneficioSelecionado.periodo || '—'}</RuleValue>
                  </RuleItem>
                </RuleList>
              </DetailSection>

              <DetailSection>
                <DetailSectionTitle>Universos</DetailSectionTitle>
                <UniversePillRow>
                  {universosVisiveis.map(universo => (
                    <TokenPill key={`${beneficioSelecionado.id}-${universo}`}>{universo}</TokenPill>
                  ))}
                  {universosRestantes.length > 0 && (
                    <Tooltip
                      title={
                        <UniverseTooltipContent>
                          <strong style={{ padding: '0 10px', fontSize: '0.74rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                            Outros universos
                          </strong>
                          {universosRestantes.map(universo => (
                            <UniverseTooltipItem key={`${beneficioSelecionado.id}-${universo}`}>
                              {universo}
                            </UniverseTooltipItem>
                          ))}
                        </UniverseTooltipContent>
                      }
                    >
                      <UniverseOverflowButton type="button">+{universosRestantes.length}</UniverseOverflowButton>
                    </Tooltip>
                  )}
                </UniversePillRow>
              </DetailSection>
            </DetailBody>

            <DetailFooter>
              <Button onClick={() => setBeneficioSelecionado(null)} variant="outlined">Fechar</Button>
              <Button
                variant="contained"
                startIcon={<MonetizationOnIcon />}
                onClick={() => {
                  setBeneficioSelecionado(null);
                  handleComprar(beneficioSelecionado);
                }}
                disabled={fortunaAtual < beneficioSelecionado.custo}
              >
                Comprar por {beneficioSelecionado.custo}
              </Button>
            </DetailFooter>
          </DetailDialogContent>
        </Dialog>
      )}
    </div>
  );
};

LojaTrapacaSection.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  aba: PropTypes.oneOf(['trapaca', 'guardados']),
};

export default LojaTrapacaSection;
