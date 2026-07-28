import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
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
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AirIcon from '@mui/icons-material/Air';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import BoltIcon from '@mui/icons-material/Bolt';
import ShieldIcon from '@mui/icons-material/Shield';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

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

const glowAnimation = keyframes`
  from { opacity: 0.4; transform: scaleX(0.95); }
  to { opacity: 1; transform: scaleX(1); }
`;

const pulseAnimation = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.02); opacity: 0.92; }
`;

const AttributesSectionWrapper = styled.div`
  position: relative;
  padding: 0;
  overflow: hidden;
  min-width: 0;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle at 18% 22%, rgba(91, 124, 250, 0.08), transparent 22%),
      radial-gradient(circle at 86% 64%, rgba(232, 203, 133, 0.05), transparent 20%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 50%, rgba(232, 203, 133, 0.06), transparent 22%),
      radial-gradient(circle at 50% 50%, transparent 46%, rgba(232, 203, 133, 0.04) 47%, rgba(232, 203, 133, 0.04) 48%, transparent 49%),
      radial-gradient(circle at 50% 50%, transparent 58%, rgba(232, 203, 133, 0.02) 60%, transparent 62%);
    opacity: 0.48;
    transform: scale(1.06);
    pointer-events: none;
  }
`;

const AttributeIconWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(232, 203, 133, 0.96);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
`;

const AttributeTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ATTRIBUTE_ICON_MAP = {
  forca: FitnessCenterIcon,
  vitalidade: FavoriteIcon,
  agilidade: AirIcon,
  inteligencia: MenuBookIcon,
  percepcao: VisibilityIcon,
  sorte: StarIcon,
  prontidao: BoltIcon,
  ataque: FitnessCenterIcon,
  defesa: ShieldIcon,
  reacao: FlashOnIcon,
  precisao: TrackChangesIcon,
  evasao: AirIcon,
};

const getAttributeIcon = chave => {
  const IconComponent = ATTRIBUTE_ICON_MAP[chave] || StarIcon;
  return (
    <AttributeIconWrapper>
      <IconComponent fontSize="small" />
    </AttributeIconWrapper>
  );
};

const ProgressCard = styled.div`
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(8, 10, 26, 0.98), rgba(11, 12, 24, 0.96));
  border: 1px solid rgba(232, 203, 133, 0.18);
  border-radius: 28px;
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.30);
  padding: 20px 22px 18px;
  display: grid;
  gap: 18px;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 80% 20%, rgba(91, 124, 250, 0.08), transparent 15%),
      radial-gradient(circle at 25% 60%, rgba(232, 203, 133, 0.05), transparent 18%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 55%;
    width: 360px;
    height: 360px;
    transform: translate(-50%, -50%) rotate(12deg);
    background: radial-gradient(circle, rgba(232, 203, 133, 0.06), transparent 58%);
    opacity: 0.35;
    pointer-events: none;
  }
`;

const ProgressHeader = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 20px;
  z-index: 1;
`;

const ProgressLevelBox = styled.div`
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(232, 203, 133, 0.2);
  border-radius: 22px;
  padding: 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
`;

const LevelLabel = styled.span`
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 0.82rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(232, 203, 133, 0.92);
`;

const LevelValue = styled.span`
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: clamp(2.4rem, 4vw, 3.4rem);
  font-weight: 800;
  line-height: 0.96;
  color: #f8e8b0;
  text-shadow: 0 2px 16px rgba(232, 203, 133, 0.24);
`;

const LevelSubtitle = styled.span`
  color: rgba(255, 255, 255, 0.74);
  font-size: 0.84rem;
  line-height: 1.4;
`;

const ExperienceSection = styled.div`
  position: relative;
  display: grid;
  gap: 12px;
`;

const PremiumStatusBarTrack = styled(StatusBarraTrack)`
  && {
    height: 36px;
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(232, 203, 133, 0.22);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  }
`;

const PremiumStatusBarFill = styled(StatusBarraFill)`
  box-shadow: 0 0 32px rgba(232, 203, 133, 0.16);
  background: linear-gradient(90deg, rgba(255, 229, 158, 0.96), rgba(232, 203, 133, 1) 48%, rgba(255, 255, 255, 0.95) 100%);
  animation: ${glowAnimation} 0.8s ease-out;
`;

const ProgressStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
  gap: 12px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
`;

const StatCard = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(232, 203, 133, 0.14);
  border-radius: 18px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 86px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: rgba(232, 203, 133, 0.12);
  }
`;

const StatLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(232, 203, 133, 0.88);
`;

const StatValue = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
`;

const ActionsRow = styled.div`
  display: grid;
  grid-template-columns: minmax(240px, 1fr) auto;
  gap: 18px;
  align-items: center;
  width: 100%;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const ActionPanel = styled.div`
  display: grid;
  gap: 10px;
  width: 100%;
`;

const ActionNote = styled.span`
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.82rem;
  line-height: 1.55;
  max-width: 520px;
`;

const FooterRow = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0 0;
  margin-top: 8px;
  border-top: 1px solid rgba(232, 203, 133, 0.18);

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 84px;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(232, 203, 133, 0.45), transparent);
    opacity: 0.55;
  }

  &::after {
    content: '✦';
    position: absolute;
    top: -21px;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(232, 203, 133, 0.35);
    font-size: 1rem;
    letter-spacing: 0.08rem;
  }
`;

const FooterMeta = styled(StatusValueRow)`
  color: rgba(255, 255, 255, 0.74);
  font-size: 0.9rem;
  margin: 0;
  flex: 1;
  min-width: 0;
`;

const XpInput = styled(TextField)`
  width: 100%;
  max-width: 240px;
  .MuiInputBase-root {
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(232, 203, 133, 0.18);
    color: #fff;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .MuiInputBase-root.Mui-focused {
    border-color: rgba(91, 124, 250, 0.75);
    box-shadow: 0 0 0 4px rgba(91, 124, 250, 0.08);
  }
  .MuiInputBase-input {
    padding: 15px 18px;
    color: #fff;
    font-weight: 600;
  }
  .MuiInputLabel-root {
    color: rgba(255, 255, 255, 0.72);
  }
  .MuiOutlinedInput-notchedOutline {
    border-color: transparent;
  }
  &:hover .MuiOutlinedInput-notchedOutline {
    border-color: rgba(255, 255, 255, 0.18);
  }
`;

const AddXpButton = styled(Button)`
  && {
    min-width: 190px;
    padding: 16px 26px;
    border-radius: 18px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    background: linear-gradient(135deg, #5e75ff, #2f4ddb);
    color: #fff;
    box-shadow: 0 18px 42px rgba(42, 72, 191, 0.24);
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  &&:hover {
    transform: translateY(-1px);
    box-shadow: 0 22px 52px rgba(42, 72, 191, 0.3);
    background: linear-gradient(135deg, #7187ff, #4162f0);
  }
  &&:active {
    transform: translateY(0);
  }
`;

const ResetButton = styled(Button)`
  && {
    min-width: 160px;
    padding: 14px 20px;
    border-radius: 16px;
    font-weight: 700;
    border: 1px solid rgba(232, 203, 133, 0.18);
    color: rgba(255, 255, 255, 0.78);
    background: rgba(255, 255, 255, 0.03);
    text-transform: uppercase;
    transition: background 0.2s ease, border-color 0.2s ease;
  }
  &&:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(232, 203, 133, 0.26);
  }
`;

const NivelAttributesGrid = styled(AttributesGrid)`
  gap: 10px;
  margin-top: 10px;
  min-width: 0;
  @media (max-width: 920px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
`;

const AttributeSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  min-width: 0;
`;

const AttributeSectionTitle = styled(SectionTitle)`
  margin: 0;
  font-size: 1rem;
  letter-spacing: 0.04em;
`;

const AttributeSectionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(232, 203, 133, 0.28);
  background: linear-gradient(135deg, rgba(232, 203, 133, 0.14), rgba(91, 124, 250, 0.09));
  color: #f8e8b0;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 0 16px rgba(232, 203, 133, 0.06);
  animation: ${pulseAnimation} 3.5s ease-in-out infinite;
`;

const NivelAtributoCardWrapper = styled(AtributoCardWrapper)`
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(7, 12, 33, 0.96), rgba(9, 11, 30, 0.94));
  border: 1px solid rgba(232, 203, 133, 0.14);
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.28);
  border-radius: 22px;
  padding: 14px 14px;
  backdrop-filter: blur(10px);
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top left, rgba(91, 124, 250, 0.1), transparent 24%),
      radial-gradient(circle at 110% 110%, rgba(232, 203, 133, 0.06), transparent 18%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(232, 203, 133, 0.28);
    box-shadow: 0 26px 72px rgba(0, 0, 0, 0.34);
    background: linear-gradient(180deg, rgba(8, 12, 40, 0.98), rgba(10, 12, 34, 0.96));
  }
`;

const SecondaryAtributoCardWrapper = styled(NivelAtributoCardWrapper)`
  background: linear-gradient(180deg, rgba(12, 16, 35, 0.92), rgba(8, 10, 26, 0.92));
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.24);

  &::before {
    background: radial-gradient(circle at top left, rgba(91, 124, 250, 0.08), transparent 24%),
      radial-gradient(circle at 110% 110%, rgba(255, 255, 255, 0.04), transparent 18%);
  }
`;

const AttributeCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  min-width: 0;
`;

const AttributeName = styled.h4`
  margin: 0;
  font-size: 0.86rem;
  color: #f5f1e8;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const AttributeValueLarge = styled(CardTotal)`
  font-size: 1.9rem;
  color: #f9e5a5;
  text-shadow: 0 0 12px rgba(248, 228, 128, 0.22);
  transition: transform 0.2s ease, text-shadow 0.2s ease;
`;

const AttributeControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 8px 8px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
`;

const AttributePointInput = styled(TextField)`
  && {
    width: 72px;
    .MuiInputBase-root {
      border-radius: 16px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #fff;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      backdrop-filter: blur(8px);
    }
    .MuiInputBase-root.Mui-focused {
      border-color: rgba(91, 124, 250, 0.75);
      box-shadow: 0 0 0 4px rgba(91, 124, 250, 0.1);
    }
    .MuiInputBase-input {
      padding: 12px 8px;
      color: #fff;
      font-weight: 800;
      text-align: center;
    }
    .MuiInputLabel-root {
      color: rgba(255, 255, 255, 0.72);
    }
    .MuiOutlinedInput-notchedOutline {
      border-color: transparent;
    }
    &:hover .MuiOutlinedInput-notchedOutline {
      border-color: rgba(255, 255, 255, 0.16);
    }
  }
`;

const AddPointButton = styled(IconButton)`
  && {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid rgba(232, 203, 133, 0.24);
    background: linear-gradient(145deg, rgba(91, 124, 250, 0.2), rgba(232, 203, 133, 0.14));
    color: #fff;
    box-shadow: 0 8px 18px rgba(33, 61, 150, 0.16);
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  &&:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 34px rgba(33, 61, 150, 0.28);
    background: linear-gradient(145deg, rgba(91, 124, 250, 0.28), rgba(232, 203, 133, 0.2));
  }
  &&:active {
    transform: translateY(0);
  }
`;

const SectionDivider = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin: 28px 0 16px;
  color: rgba(232, 203, 133, 0.38);
  font-size: 0.95rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(232, 203, 133, 0.22), transparent);
  }
`;

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
          <ProgressCard>
            <ProgressHeader>
              <ProgressLevelBox>
                <LevelLabel>Nível Atual</LevelLabel>
                <LevelValue>{nivelInfo.atual}</LevelValue>
                <LevelSubtitle>Seu nível atual mostra o poder conquistado até aqui.</LevelSubtitle>
              </ProgressLevelBox>
              <ExperienceSection>
                <SectionTitle style={{ margin: 0, fontSize: '1rem' }}>Experiência</SectionTitle>
                <PremiumStatusBarTrack style={{ marginTop: 8 }}>
                  <PremiumStatusBarFill $variante="nivel" $percentual={percentualXp} />
                  <StatusBarraLabel>
                    {nivelInfo.xpAtual} / {xpNecessario} XP
                  </StatusBarraLabel>
                </PremiumStatusBarTrack>
                <ProgressStats>
                  <StatCard>
                    <StatLabel>XP Atual</StatLabel>
                    <StatValue>{nivelInfo.xpAtual} XP</StatValue>
                  </StatCard>
                  <StatCard>
                    <StatLabel>XP Necessário</StatLabel>
                    <StatValue>{xpNecessario} XP</StatValue>
                  </StatCard>
                  <StatCard>
                    <StatLabel>Progresso</StatLabel>
                    <StatValue>{percentualXp}%</StatValue>
                  </StatCard>
                  <StatCard>
                    <StatLabel>Para o próximo nível</StatLabel>
                    <StatValue>{xpFaltante} XP</StatValue>
                  </StatCard>
                </ProgressStats>
              </ExperienceSection>
            </ProgressHeader>

            <ActionsRow>
              <ActionPanel>
                <XpInput
                  type="number"
                  label="XP ganho"
                  size="small"
                  value={xpGanhoInput}
                  onChange={event => setXpGanhoInput(event.target.value)}
                />
                <ActionNote>Informe a quantidade de XP a ser adicionada e confirme para subir o nível.</ActionNote>
              </ActionPanel>
              <AddXpButton variant="contained" onClick={handleAdicionarXp}>
                Adicionar XP
              </AddXpButton>
            </ActionsRow>

            {(nivelInfo.pontosPrincipaisDisponiveis > 0 || nivelInfo.pontosSecundariosDisponiveis > 0) && (
              <StatusValueRow style={{ display: 'block', marginTop: 0, color: 'var(--color-accent)' }}>
                Você tem {nivelInfo.pontosPrincipaisDisponiveis} ponto(s) principal(is)
                {nivelInfo.pontosSecundariosDisponiveis > 0 &&
                  ` e ${nivelInfo.pontosSecundariosDisponiveis} ponto(s) secundário(s)`}{' '}
                pra distribuir na aba Atributos.
              </StatusValueRow>
            )}

            <FooterRow>
              <FooterMeta>
                Essa ação apenas redefine o nível atual e o XP do personagem.
              </FooterMeta>
              <ResetButton
                variant="outlined"
                startIcon={<RestartAltIcon fontSize="small" />}
                onClick={() => setResetConfirmAberto(true)}
              >
                Resetar Nível
              </ResetButton>
            </FooterRow>
          </ProgressCard>
        )}

        {subAba === 'atributos' && (
          <AttributesSectionWrapper>
            <AttributeSectionHeader>
              <AttributeSectionTitle>Atributos Principais</AttributeSectionTitle>
              {nivelInfo.pontosPrincipaisDisponiveis > 0 && (
                <AttributeSectionBadge>
                  <StarIcon fontSize="small" />
                  {nivelInfo.pontosPrincipaisDisponiveis} ponto(s) disponível(is)
                </AttributeSectionBadge>
              )}
            </AttributeSectionHeader>
            <NivelAttributesGrid>
              {PRINCIPAIS_DISTRIBUIVEIS.map(chave => (
                <NivelAtributoCardWrapper key={chave}>
                  <AttributeCardHeader>
                    <AttributeTitleRow>
                      {getAttributeIcon(chave)}
                      <AttributeName>{PRIMARIOS_LABELS[chave]}</AttributeName>
                    </AttributeTitleRow>
                    <AttributeValueLarge>{primariosTotais[chave]}</AttributeValueLarge>
                  </AttributeCardHeader>
                  {nivelInfo.pontosPrincipaisDisponiveis > 0 && (
                    <AttributeControlRow>
                      <AttributePointInput
                        size="small"
                        value={quantidades[chave] ?? ''}
                        onChange={event => handleQuantidadeChange(chave, event.target.value)}
                        placeholder="1"
                        inputMode="numeric"
                        
                      />
                      <Tooltip title={`Adicionar em ${PRIMARIOS_LABELS[chave]}`}>
                        <AddPointButton
                          size="small"
                          onClick={() => handleGastarPrincipal(chave)}
                          aria-label={`Adicionar pontos em ${PRIMARIOS_LABELS[chave]}`}
                        >
                          <AddIcon fontSize="small" />
                        </AddPointButton>
                      </Tooltip>
                    </AttributeControlRow>
                  )}
                </NivelAtributoCardWrapper>
              ))}
              <NivelAtributoCardWrapper>
                <AttributeCardHeader>
                  <AttributeTitleRow>
                    {getAttributeIcon('sorte')}
                    <AttributeName>{PRIMARIOS_LABELS.sorte}</AttributeName>
                  </AttributeTitleRow>
                  <AttributeValueLarge>{primariosTotais.sorte}</AttributeValueLarge>
                </AttributeCardHeader>
              </NivelAtributoCardWrapper>
            </NivelAttributesGrid>

            <SectionDivider />

            <AttributeSectionHeader>
              <AttributeSectionTitle>Atributos Secundários</AttributeSectionTitle>
              {nivelInfo.pontosSecundariosDisponiveis > 0 && (
                <AttributeSectionBadge>
                  <StarIcon fontSize="small" />
                  {nivelInfo.pontosSecundariosDisponiveis} ponto(s) disponível(is)
                </AttributeSectionBadge>
              )}
            </AttributeSectionHeader>
            <NivelAttributesGrid>
              {SECUNDARIOS_CHAVES.map(chave => (
                <SecondaryAtributoCardWrapper key={chave}>
                  <AttributeCardHeader>
                    <AttributeTitleRow>
                      {getAttributeIcon(chave)}
                      <AttributeName>{SECUNDARIOS_LABELS[chave]}</AttributeName>
                    </AttributeTitleRow>
                    <AttributeValueLarge>{secundariosTotais[chave]}</AttributeValueLarge>
                  </AttributeCardHeader>
                  {nivelInfo.pontosSecundariosDisponiveis > 0 && (
                    <AttributeControlRow>
                      <AttributePointInput
                        size="small"
                        value={quantidades[chave] ?? ''}
                        onChange={event => handleQuantidadeChange(chave, event.target.value)}
                        placeholder="1"
                        inputMode="numeric"
                        
                      />
                      <Tooltip title={`Adicionar em ${SECUNDARIOS_LABELS[chave]}`}>
                        <AddPointButton
                          size="small"
                          onClick={() => handleGastarSecundario(chave)}
                          aria-label={`Adicionar pontos em ${SECUNDARIOS_LABELS[chave]}`}
                        >
                          <AddIcon fontSize="small" />
                        </AddPointButton>
                      </Tooltip>
                    </AttributeControlRow>
                  )}
                </SecondaryAtributoCardWrapper>
              ))}
            </NivelAttributesGrid>
          </AttributesSectionWrapper>
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
