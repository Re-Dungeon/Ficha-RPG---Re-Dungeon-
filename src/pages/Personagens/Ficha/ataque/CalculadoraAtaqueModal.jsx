import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CasinoIcon from '@mui/icons-material/Casino';
import BoltIcon from '@mui/icons-material/Bolt';
import ShieldIcon from '@mui/icons-material/Shield';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { useAuth } from 'context/AuthContext';
import { MOBILE } from 'common/styles/breakpoints';

import {
  ATAQUE_PERFIS,
  TIPOS_DANO_ATAQUE,
  calcularAtaqueDaFicha,
  calcularAumentoPotencial,
  calcularCustoEnergia,
  calcularDefesaDaFicha,
  calcularPotencialBase,
  calcularPotencialFinal,
  converterPotencialEmDados,
  extrairBonusNumericoAtaque,
  extrairBonusNumericoItem,
} from 'common/utils/ataque';
import {
  getArts,
  getCombosAtaque,
  getCombosDefesa,
  getItensInventario,
  addComboAtaque,
  addComboDefesa,
  updateComboAtaque,
  updateComboDefesa,
  removeComboAtaque,
  removeComboDefesa,
  consumirRecursosPersonagem,
} from 'service/storage';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    display: 'flex',
    flexDirection: 'column',
    width: 'min(1200px, 96vw)',
    maxWidth: '1200px',
    maxHeight: '94vh',
    minHeight: 0,
    background: 'linear-gradient(165deg, rgba(22, 18, 51, 0.98) 0%, rgba(12, 10, 22, 0.98) 100%)',
    border: '1.5px solid rgba(232, 203, 133, 0.78)',
    borderRadius: 18,
    boxShadow: '0 18px 42px rgba(0, 0, 0, 0.7), inset 0 0 14px rgba(232, 203, 133, 0.12)',
    overflow: 'hidden',
    color: '#f1f1f4',
  },
  '& .MuiDialogContent-root': {
    padding: 0,
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'hidden',
    background: 'linear-gradient(180deg, rgba(11, 13, 24, 0.2), rgba(13, 12, 23, 0.32))',
  },
  '& .MuiDialog-container': {
    alignItems: 'center',
    padding: 0,
  },
  [theme.breakpoints.down('sm')]: {
    '& .MuiDialog-paper': {
      margin: 12,
      maxHeight: '92vh',
    },
  },
}));

const DarkDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    background: 'linear-gradient(180deg, rgba(22, 18, 35, 0.98) 0%, rgba(10, 10, 17, 0.98) 100%)',
    border: '1px solid rgba(232, 203, 133, 0.52)',
    borderRadius: 16,
    boxShadow: '0 18px 42px rgba(0, 0, 0, 0.72), inset 0 0 14px rgba(232, 203, 133, 0.08)',
    color: '#f1f1f4',
    overflow: 'hidden',
  },
  '& .MuiDialogContent-root': {
    background: 'linear-gradient(180deg, rgba(15, 14, 22, 0.96), rgba(11, 11, 17, 0.98))',
    color: '#f1f1f4',
  },
  '& .MuiDialogActions-root': {
    background: 'linear-gradient(180deg, rgba(16, 15, 24, 0.98), rgba(11, 11, 18, 0.98))',
    borderTop: '1px solid rgba(232, 203, 133, 0.2)',
  },
  '& .MuiDialogTitle-root': {
    background: 'linear-gradient(180deg, rgba(30, 24, 43, 0.98), rgba(18, 16, 27, 0.9))',
    color: '#f4dda2',
    borderBottom: '1px solid rgba(232, 203, 133, 0.5)',
  },
}));

const HeaderBar = styled(Box)(() => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '18px 20px 16px',
  borderBottom: '1px solid rgba(232, 203, 133, 0.6)',
  background: 'linear-gradient(180deg, rgba(30, 24, 43, 0.98), rgba(18, 16, 27, 0.9))',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(232, 203, 133, 0.2)',
  // Celular: título à esquerda numa linha só, espaço reservado para o ✕.
  [MOBILE]: {
    justifyContent: 'flex-start',
    padding: '14px 60px 12px 14px',
  },
}));

const HeaderOrnament = styled(Box)(() => ({
  position: 'absolute',
  left: 18,
  right: 18,
  top: 8,
  height: 1,
  background: 'linear-gradient(90deg, transparent 0%, rgba(232, 203, 133, 0.6) 12%, rgba(232, 203, 133, 0.9) 50%, rgba(232, 203, 133, 0.6) 88%, transparent 100%)',
  boxShadow: '0 0 18px rgba(232, 203, 133, 0.2)',
}));

const HeaderTitle = styled(Typography)(() => ({
  position: 'relative',
  zIndex: 1,
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: 'clamp(1.2rem, 2vw, 2.1rem)',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#f4dda2',
  textShadow: '0 0 12px rgba(232, 203, 133, 0.45)',
  fontWeight: 700,
  [MOBILE]: {
    fontSize: '0.92rem',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
}));

const CloseButton = styled(IconButton)(() => ({
  position: 'absolute',
  right: 12,
  top: 12,
  width: 36,
  height: 36,
  borderRadius: '50%',
  color: '#f4dda2',
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(232, 203, 133, 0.52)',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
  '&:hover': {
    background: 'rgba(232, 203, 133, 0.08)',
    borderColor: 'rgba(232, 203, 133, 0.9)',
  },
  [MOBILE]: {
    top: '50%',
    right: 12,
    transform: 'translateY(-50%)',
  },
}));

const HeaderInfoButton = styled(IconButton)(() => ({
  position: 'relative',
  zIndex: 1,
  width: 30,
  height: 30,
  marginLeft: 10,
  borderRadius: '50%',
  color: '#f4dda2',
  background: 'rgba(244, 221, 162, 0.06)',
  border: '1px solid rgba(232, 203, 133, 0.45)',
  '&:hover': {
    background: 'rgba(232, 203, 133, 0.12)',
    borderColor: 'rgba(232, 203, 133, 0.8)',
  },
  [MOBILE]: {
    flexShrink: 0,
    marginLeft: 8,
  },
}));

const ModalBody = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  flex: '1 1 auto',
  minHeight: 0,
  padding: '16px 18px 18px',
  overflowY: 'auto',
  overflowX: 'hidden',
  overscrollBehaviorY: 'contain',
  background: 'linear-gradient(180deg, rgba(10, 9, 19, 0.16), rgba(11, 11, 22, 0.24))',
  [MOBILE]: {
    gap: 12,
    padding: '10px 10px 14px',
  },
}));

const BoardGrid = styled(Box)(() => ({
  display: 'grid',
  gridTemplateColumns: '1.45fr 1fr',
  gap: 16,
  alignItems: 'stretch',
  minHeight: 0,
  flex: '1 1 auto',
  // Celular: uma coluna (configuração → resumo → prévia → combinações). Com
  // 2 colunas a da esquerda ficava espremida em ~20px.
  [MOBILE]: {
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: 12,
    flex: '0 0 auto',
  },
}));

const SectionCard = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  background: 'linear-gradient(180deg, rgba(20, 17, 35, 0.96), rgba(14, 13, 24, 0.96))',
  border: '1px solid rgba(232, 203, 133, 0.48)',
  borderRadius: 14,
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03), 0 8px 20px rgba(0, 0, 0, 0.18)',
  overflow: 'hidden',
}));

const SectionHeader = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '12px 14px',
  borderBottom: '1px solid rgba(232, 203, 133, 0.42)',
  background: 'linear-gradient(90deg, rgba(232, 203, 133, 0.09), rgba(71, 52, 88, 0.08), rgba(232, 203, 133, 0.04))',
  color: '#f4dda2',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 700,
  fontSize: '0.8rem',
  fontFamily: 'Georgia, "Times New Roman", serif',
  [MOBILE]: {
    padding: '10px 12px',
  },
}));

const SectionBody = styled(Box)(() => ({
  display: 'grid',
  gap: 14,
  padding: 14,
  flex: '1 1 auto',
  minHeight: 0,
  [MOBILE]: {
    gap: 12,
    padding: 12,
  },
}));

const FieldGroup = styled(Box)(() => ({
  display: 'grid',
  gap: 12,
}));

const TwoColFields = styled(Box)(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 12,
  [MOBILE]: {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(10, 13, 28, 0.8)',
    borderRadius: 10,
    color: '#f1f1f4',
    transition: 'all 0.2s ease',
    '& fieldset': {
      borderColor: 'rgba(91, 124, 250, 0.5)',
      borderWidth: 1.1,
    },
    '&:hover fieldset': {
      borderColor: 'rgba(232, 203, 133, 0.75)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#f4dda2',
      boxShadow: '0 0 0 1px rgba(244, 221, 162, 0.16)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#c9c7d8',
    '&.Mui-focused': {
      color: '#f4dda2',
    },
  },
  '& .MuiInputBase-input': {
    color: '#f1f1f4',
    paddingTop: 12,
    paddingBottom: 12,
  },
  [theme.breakpoints.down('sm')]: {
    '& .MuiInputBase-input': {
      fontSize: '0.96rem',
    },
  },
}));

const StyledSelect = styled(FormControl)(() => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(10, 13, 28, 0.8)',
    borderRadius: 10,
    color: '#f1f1f4',
    '& fieldset': {
      borderColor: 'rgba(91, 124, 250, 0.5)',
      borderWidth: 1.1,
    },
    '&:hover fieldset': {
      borderColor: 'rgba(232, 203, 133, 0.75)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#f4dda2',
      boxShadow: '0 0 0 1px rgba(244, 221, 162, 0.16)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#c9c7d8',
    '&.Mui-focused': {
      color: '#f4dda2',
    },
  },
  '& .MuiSelect-select': {
    color: '#f1f1f4',
    paddingTop: 12,
    paddingBottom: 12,
  },
}));

const SummaryRow = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '8px 2px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  color: '#e7e6ee',
  fontSize: '0.98rem',
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const SummaryLabel = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: '#dfe4ff',
}));

const SummaryValue = styled(Box)(() => ({
  fontWeight: 700,
  color: '#f1f1f4',
  textAlign: 'right',
}));

const SummaryValueWithMeta = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 6,
  flexWrap: 'wrap',
  fontWeight: 700,
  color: '#f1f1f4',
  textAlign: 'right',
  whiteSpace: 'nowrap',
}));

const FinalValueMeta = styled('span')(() => ({
  color: '#c9c7d8',
  fontWeight: 600,
}));

const PotencializacaoSlider = styled(Slider)(() => ({
  color: '#f4dda2',
  height: 6,
  '& .MuiSlider-track': {
    background: 'linear-gradient(90deg, rgba(232, 203, 133, 0.9), rgba(162, 24, 38, 0.98))',
    border: 'none',
  },
  '& .MuiSlider-rail': {
    background: 'rgba(255,255,255,0.12)',
    opacity: 1,
  },
  '& .MuiSlider-thumb': {
    height: 18,
    width: 18,
    background: '#f4dda2',
    border: '2px solid rgba(18, 14, 25, 0.9)',
    boxShadow: '0 0 18px rgba(232, 203, 133, 0.5)',
    '&:hover, &.Mui-focusVisible': {
      boxShadow: '0 0 0 8px rgba(244, 221, 162, 0.14)',
    },
  },
  '& .MuiSlider-mark': {
    background: 'rgba(255,255,255,0.2)',
    height: 6,
    width: 2,
    borderRadius: 2,
  },
  '& .MuiSlider-markActive': {
    background: '#f8d9c8',
  },
}));

const HighlightValue = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  background: 'linear-gradient(135deg, rgba(104, 24, 38, 0.98), rgba(52, 16, 25, 0.9))',
  border: '1px solid rgba(232, 203, 133, 0.72)',
  borderRadius: 12,
  padding: '12px 14px',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 0 18px rgba(145, 23, 38, 0.24)',
  color: '#f8d9c8',
}));

const FinalSummaryHighlight = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  width: '100%',
  background: 'linear-gradient(135deg, rgba(103, 76, 26, 0.94), rgba(62, 48, 19, 0.9))',
  border: '1px solid rgba(232, 203, 133, 0.72)',
  borderRadius: 12,
  padding: '12px 14px',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 16px rgba(232, 203, 133, 0.12)',
  color: '#f4dda2',
}));

const ResultValue = styled(Typography)(() => ({
  fontSize: '2.1rem',
  lineHeight: 1,
  fontWeight: 800,
  color: '#f8d9c8',
  textShadow: '0 0 20px rgba(255, 96, 96, 0.55)',
  letterSpacing: '0.06em',
}));

const ComboCard = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  flex: '0 0 auto',
  width: '100%',
  minHeight: 0,
  background: 'linear-gradient(180deg, rgba(17, 20, 31, 0.86), rgba(11, 12, 22, 0.92))',
  border: '1px solid rgba(232, 203, 133, 0.46)',
  borderRadius: 12,
  padding: 12,
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02)',
}));

const ComboListScroller = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  gap: 12,
  flex: '1 1 auto',
  minHeight: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
  overscrollBehavior: 'contain',
  paddingRight: 4,
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(232, 203, 133, 0.6) rgba(17, 20, 31, 0.85)',
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    width: 8,
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(17, 20, 31, 0.85)',
    borderRadius: 999,
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(232, 203, 133, 0.6)',
    borderRadius: 999,
    border: '2px solid rgba(17, 20, 31, 0.85)',
  },
  // Celular: sem rolagem própria — o corpo do modal já rola (rolagem dentro
  // de rolagem no toque prende o dedo).
  [MOBILE]: {
    overflowY: 'visible',
    paddingRight: 0,
  },
}));

const ComboActions = styled(Box)(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  alignItems: 'stretch',
  gap: 8,
  width: '100%',
  minWidth: 0,
  '@media (max-width: 480px)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
}));

const ComboDetails = styled(Box)(() => ({
  display: 'grid',
  gap: 6,
  background: 'rgba(9, 11, 20, 0.72)',
  border: '1px solid rgba(232, 203, 133, 0.2)',
  borderRadius: 10,
  padding: '10px 12px',
}));

const DetailLine = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  fontSize: '0.77rem',
  color: '#dfe4ff',
}));

const DetailValue = styled(Box)(() => ({
  fontWeight: 700,
  color: '#f4dda2',
  textAlign: 'right',
}));

const ResourceBadge = styled(Box)(({ variant }) => {
  const isFadiga = variant === 'fadiga';
  const isSaude = variant === 'saude';

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    padding: '3px 7px',
    fontSize: '0.62rem',
    lineHeight: 1.2,
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: isSaude ? '#ffd4d4' : isFadiga ? '#dfe9ff' : '#f4dda2',
    background: isSaude ? 'rgba(239, 68, 68, 0.14)' : isFadiga ? 'rgba(91, 124, 250, 0.14)' : 'rgba(232, 203, 133, 0.12)',
    border: `1px solid ${isSaude ? 'rgba(239, 68, 68, 0.52)' : isFadiga ? 'rgba(91, 124, 250, 0.52)' : 'rgba(232, 203, 133, 0.42)'}`,
    boxShadow: isSaude ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.08)' : isFadiga ? 'inset 0 0 0 1px rgba(91, 124, 250, 0.08)' : 'inset 0 0 0 1px rgba(232, 203, 133, 0.08)',
    whiteSpace: 'nowrap',
  };
});

const UseComboButton = styled(Button)(() => ({
  width: '100%',
  minWidth: 0,
  height: 36,
  textTransform: 'uppercase',
  borderRadius: 10,
  fontWeight: 800,
  letterSpacing: '0.04em',
  padding: '8px 12px',
  background: 'linear-gradient(135deg, rgba(232, 203, 133, 0.98), rgba(170, 143, 77, 0.94))',
  color: '#120e19',
  border: '1px solid rgba(232, 203, 133, 0.85)',
  boxShadow: '0 0 18px rgba(232, 203, 133, 0.18)',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(244, 221, 162, 1), rgba(198, 165, 93, 0.98))',
  },
  '&:disabled': {
    opacity: 0.55,
    cursor: 'not-allowed',
  },
}));

const TinyActionButton = styled(Button)(() => ({
  width: '100%',
  minWidth: 0,
  height: 36,
  textTransform: 'none',
  borderRadius: 10,
  padding: '7px 10px',
  fontWeight: 700,
  fontSize: '0.72rem',
  border: '1px solid rgba(91, 124, 250, 0.42)',
  color: '#dfe5ff',
  background: 'rgba(12, 14, 25, 0.7)',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '&:hover': {
    borderColor: 'rgba(232, 203, 133, 0.8)',
    background: 'rgba(232, 203, 133, 0.08)',
  },
}));

const TinyDangerButton = styled(Button)(() => ({
  width: '100%',
  minWidth: 0,
  height: 36,
  textTransform: 'none',
  borderRadius: 10,
  padding: '7px 10px',
  fontWeight: 700,
  fontSize: '0.72rem',
  border: '1px solid rgba(239, 68, 68, 0.48)',
  color: '#ffd7d7',
  background: 'rgba(81, 18, 18, 0.7)',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '&:hover': {
    background: 'rgba(132, 30, 30, 0.86)',
    borderColor: 'rgba(239, 68, 68, 0.75)',
  },
}));

const ActionFooter = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  flex: '0 0 auto',
  padding: '14px 18px 18px',
  borderTop: '1px solid rgba(232, 203, 133, 0.38)',
  background: 'linear-gradient(180deg, rgba(16, 16, 25, 0.68), rgba(10, 9, 18, 0.9))',
}));

const ResourceSelectCard = styled(Button)(() => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  boxSizing: 'border-box',
  minWidth: 0,
  minHeight: 0,
  padding: '10px 10px 8px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(12, 14, 25, 0.72)',
  color: '#e7e6ee',
  textAlign: 'left',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: 'rgba(232, 203, 133, 0.6)',
    background: 'rgba(22, 19, 31, 0.86)',
  },
}));

const ResourceCardHeader = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  minWidth: 0,
  gap: 8,
}));

const ResourceCardContent = styled(Box)(() => ({
  display: 'grid',
  gap: 8,
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
}));

const ResourceInfoRow = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  minWidth: 0,
  gap: 12,
}));

const ResourceInfoLabel = styled(Box)(() => ({
  flex: '1 1 auto',
  minWidth: 0,
  fontSize: '0.72rem',
  lineHeight: 1.4,
  color: '#dfe4ff',
  textAlign: 'left',
}));

const ResourceInfoValue = styled(Box)(() => ({
  flex: '0 0 auto',
  marginLeft: 'auto',
  minWidth: 0,
  textAlign: 'right',
  whiteSpace: 'nowrap',
  fontWeight: 700,
  color: '#f4dda2',
  fontVariantNumeric: 'tabular-nums',
}));

const ResourceProgressTrack = styled(Box)(() => ({
  width: '100%',
  minWidth: 0,
  height: 6,
  borderRadius: 999,
  overflow: 'hidden',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxSizing: 'border-box',
}));

const ResourceProgressFill = styled(Box)(() => ({
  height: '100%',
  borderRadius: 999,
}));

const ResourceStatusPill = styled(Box)(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minWidth: 0,
  paddingLeft: 8,
  paddingRight: 8,
  paddingTop: 2,
  paddingBottom: 2,
  borderRadius: 999,
  fontSize: '0.66rem',
  fontWeight: 700,
  lineHeight: 1.2,
  boxSizing: 'border-box',
}));

const ToastStack = styled(Box)(() => ({
  position: 'fixed',
  top: 16,
  right: 16,
  zIndex: 2000,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: 'min(420px, calc(100vw - 32px))',
  pointerEvents: 'none',
}));

const ToastAlert = styled(Alert)(() => ({
  pointerEvents: 'auto',
  width: '100%',
  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.34)',
}));

const ConfirmDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    background: 'linear-gradient(180deg, rgba(18, 16, 29, 0.98), rgba(12, 11, 20, 0.98))',
    border: '1.5px solid rgba(232, 203, 133, 0.82)',
    borderRadius: 18,
    boxShadow: '0 20px 42px rgba(0, 0, 0, 0.68), inset 0 0 18px rgba(232, 203, 133, 0.12)',
    overflow: 'hidden',
    color: '#f1f1f4',
  },
  '& .MuiDialogContent-root': {
    padding: 0,
    background: 'linear-gradient(180deg, rgba(16, 14, 25, 0.9), rgba(10, 10, 18, 0.96))',
  },
  '& .MuiDialogActions-root': {
    padding: '12px 18px 18px',
    gap: 10,
    borderTop: '1px solid rgba(232, 203, 133, 0.22)',
    background: 'linear-gradient(180deg, rgba(13, 12, 20, 0.94), rgba(10, 9, 17, 0.98))',
  },
}));

const ConfirmHeader = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '18px 18px 14px',
  borderBottom: '1px solid rgba(232, 203, 133, 0.38)',
  background: 'linear-gradient(180deg, rgba(31, 26, 44, 0.98), rgba(18, 16, 28, 0.96))',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
}));

const ConfirmTitleText = styled(Typography)(() => ({
  margin: 0,
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: 'clamp(1.05rem, 1.8vw, 1.6rem)',
  lineHeight: 1.15,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#f4dda2',
  textShadow: '0 0 12px rgba(232, 203, 133, 0.35)',
}));

const ConfirmSubtitle = styled(Typography)(() => ({
  margin: 0,
  color: '#c9c7d8',
  fontSize: '0.75rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}));

const ConfirmBody = styled(Box)(() => ({
  display: 'grid',
  gap: 16,
  padding: '18px 18px 12px',
  background: 'linear-gradient(180deg, rgba(15, 14, 22, 0.86), rgba(10, 10, 17, 0.96))',
}));

const ConfirmSummaryCard = styled(Box)(() => ({
  display: 'grid',
  gap: 8,
  padding: '14px 14px 12px',
  borderRadius: 12,
  border: '1px solid rgba(232, 203, 133, 0.3)',
  background: 'linear-gradient(180deg, rgba(22, 18, 34, 0.96), rgba(13, 12, 21, 0.96))',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02)',
}));

const ComboIdentityName = styled(Typography)(() => ({
  margin: 0,
  fontWeight: 800,
  fontSize: '1.15rem',
  color: '#f4dda2',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}));

const ComboMetaRow = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
  flexWrap: 'wrap',
}));

const ComboMetaPill = styled(Box)(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 8px',
  borderRadius: 999,
  fontSize: '0.66rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  background: 'rgba(232, 203, 133, 0.09)',
  border: '1px solid rgba(232, 203, 133, 0.32)',
  color: '#f4dda2',
}));

const ConfirmSection = styled(Box)(() => ({
  display: 'grid',
  gap: 12,
  padding: '14px 14px 12px',
  borderRadius: 12,
  border: '1px solid rgba(232, 203, 133, 0.24)',
  background: 'rgba(11, 13, 24, 0.9)',
}));

const ConfirmSectionHeader = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  color: '#f4dda2',
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
}));

const ConfirmInfoGrid = styled(Box)(() => ({
  display: 'grid',
  gap: 8,
}));

const ConfirmInfoRow = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
  minHeight: 32,
  paddingBottom: 6,
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  '&:last-child': {
    borderBottom: 'none',
    paddingBottom: 0,
  },
}));

const ConfirmInfoLabel = styled(Box)(() => ({
  color: '#dfe4ff',
  fontSize: '0.8rem',
}));

const ConfirmInfoValue = styled(Box)(() => ({
  color: '#f1f1f4',
  fontSize: '0.82rem',
  fontWeight: 700,
  letterSpacing: '0.01em',
  textAlign: 'right',
}));

const ConfirmResourcePanel = styled(Box)(({ tone }) => {
  const palette = tone === 'saude'
    ? {
        bg: 'linear-gradient(135deg, rgba(93, 16, 16, 0.88), rgba(39, 13, 15, 0.96))',
        border: 'rgba(239, 68, 68, 0.7)',
        glow: 'rgba(239, 68, 68, 0.18)',
        text: '#ffd7d7',
      }
    : tone === 'fadiga'
      ? {
          bg: 'linear-gradient(135deg, rgba(22, 36, 71, 0.9), rgba(15, 20, 33, 0.96))',
          border: 'rgba(91, 124, 250, 0.72)',
          glow: 'rgba(91, 124, 250, 0.18)',
          text: '#dfe9ff',
        }
      : {
          bg: 'linear-gradient(135deg, rgba(91, 71, 25, 0.78), rgba(34, 28, 17, 0.96))',
          border: 'rgba(232, 203, 133, 0.72)',
          glow: 'rgba(232, 203, 133, 0.18)',
          text: '#f4dda2',
        };

  return {
    display: 'grid',
    gap: 12,
    padding: '14px',
    borderRadius: 12,
    border: `1px solid ${palette.border}`,
    background: palette.bg,
    boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.03), 0 0 18px ${palette.glow}`,
    color: palette.text,
  };
});

const ConfirmResourceBadge = styled(Box)(({ tone }) => {
  const palette = tone === 'saude'
    ? {
        bg: 'rgba(239, 68, 68, 0.16)',
        border: 'rgba(239, 68, 68, 0.58)',
        text: '#ffd7d7',
      }
    : tone === 'fadiga'
      ? {
          bg: 'rgba(91, 124, 250, 0.16)',
          border: 'rgba(91, 124, 250, 0.58)',
          text: '#dfe9ff',
        }
      : {
          bg: 'rgba(232, 203, 133, 0.12)',
          border: 'rgba(232, 203, 133, 0.52)',
          text: '#f4dda2',
        };

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    width: 'fit-content',
    padding: '5px 9px',
    borderRadius: 999,
    background: palette.bg,
    border: `1px solid ${palette.border}`,
    color: palette.text,
    fontSize: '0.7rem',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  };
});

const ConfirmResourceGrid = styled(Box)(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 8,
  '@media (max-width: 480px)': {
    gridTemplateColumns: '1fr',
  },
}));

const ConfirmResourceStat = styled(Box)(() => ({
  display: 'grid',
  gap: 4,
  padding: '10px 10px 8px',
  borderRadius: 10,
  background: 'rgba(9, 11, 18, 0.72)',
  border: '1px solid rgba(255,255,255,0.06)',
}));

const ConfirmResourceStatLabel = styled(Box)(() => ({
  color: '#c9c7d8',
  fontSize: '0.68rem',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}));

const ConfirmResourceStatValue = styled(Box)(() => ({
  color: '#f1f1f4',
  fontWeight: 800,
  fontVariantNumeric: 'tabular-nums',
}));

const ConfirmNote = styled(Box)(() => ({
  padding: '10px 12px',
  borderRadius: 10,
  background: 'rgba(232, 203, 133, 0.06)',
  border: '1px solid rgba(232, 203, 133, 0.2)',
  color: '#dfe4ff',
  fontSize: '0.78rem',
  lineHeight: 1.5,
}));

const ConfirmCompactSummary = styled(Box)(() => ({
  display: 'grid',
  gap: 6,
  padding: '10px 10px 0',
  borderRadius: 10,
  background: 'rgba(9, 11, 18, 0.72)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
}));

const ConfirmCompactRow = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  fontSize: '0.74rem',
  color: '#dfe4ff',
  paddingBottom: 6,
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  '&:last-child': {
    borderBottom: 'none',
    paddingBottom: 0,
  },
}));

const defaultForm = {
  nome: '',
  tipoDano: 'Contundente',
  artId: '',
  itemInventarioId: '',
  bonusExtra: 0,
  potencializacao: 0,
};

const getCalculadoraAtaqueAvisoKey = uid => `re.calculadora_ataque.aviso.${uid || 'anon'}`;

const DEFESA_LABELS = {
  Contundente: 'Defesa Física',
  Cortante: 'Defesa Mágica',
  Perfurante: 'Defesa Energética',
  Mágico: 'Defesa Espiritual',
  Especial: 'Defesa Especial',
  'Resistência a Impacto': 'Defesa Física',
  'Resistência a Cortes': 'Defesa Mágica',
  'Resistência a Perfurações': 'Defesa Energética',
  'Proteção Mágica': 'Defesa Espiritual',
  'Proteção Especial': 'Defesa Especial',
};

const getTipoDanoLabel = (tipoDano, contexto = 'ataque') => {
  if (contexto === 'defesa') {
    return DEFESA_LABELS[tipoDano] ?? DEFESA_LABELS[String(tipoDano).trim()] ?? ATAQUE_PERFIS[tipoDano]?.label ?? tipoDano ?? 'Contundente';
  }

  return ATAQUE_PERFIS[tipoDano]?.label ?? tipoDano ?? 'Contundente';
};

const getContextConfig = contexto => {
  const isDefesa = contexto === 'defesa';
  return {
    titulo: isDefesa ? 'Calculadora de Defesa' : 'Calculadora de Ataque',
    tituloAviso: isDefesa ? 'Sobre a Calculadora de Defesa' : 'Sobre a Calculadora de Ataque',
    tituloMecanicas: isDefesa ? 'Mecânicas de Defesa' : 'Mecânicas de Ataque',
    nomeConfiguracao: isDefesa ? 'Configuração da Defesa' : 'Configuração do Ataque',
    tipoDanoLabel: isDefesa ? 'Tipo de Proteção' : 'Tipo de dano',
    tipoDanoLegenda: isDefesa ? 'Tipo de Proteção' : 'Tipo de dano',
    resumoValorLabel: isDefesa ? 'Defesa da ficha' : 'Ataque da ficha',
    resumoPotencialBaseLabel: isDefesa ? 'Potencial de Defesa' : 'Potencial de Ataque',
    resumoDanoFixo: isDefesa ? 'Proteção Fixa' : 'Dano Fixo',
    descricaoAviso: isDefesa
      ? 'A Calculadora de Defesa é uma ferramenta de apoio do Re, desenvolvida para visualizar e configurar combinações defensivas conforme as mecânicas do sistema.'
      : 'A Calculadora de Ataque é uma ferramenta de apoio do Re, desenvolvida para visualizar e configurar combinações de dano conforme as mecânicas do sistema.',
    footerLabel: isDefesa ? 'Configuração da Defesa' : 'Configuração do Ataque',
  };
};

const formatarValor = valor => (Number.isFinite(Number(valor)) ? Number(valor) : 0);
const calcularCustoPercentualRecurso = (recursoMaximo = 0, percentualPotencializacao = 0) =>
  Math.max(0, Math.ceil((Number(recursoMaximo) || 0) * (Math.min(30, Math.max(0, Number(percentualPotencializacao) || 0)) / 100)));

const resetAttackCombinationForm = ({ setForm, setSelectedComboId, setResourceSelecionada, setErro, setComboEmUso, setComboEmExclusao, setNotificacaoUso, setConfirmarNovaCombinacao }) => {
  setForm(defaultForm);
  setSelectedComboId('');
  setResourceSelecionada('energia');
  setErro('');
  setComboEmUso(null);
  setComboEmExclusao(null);
  setNotificacaoUso('');
  setConfirmarNovaCombinacao(false);
};

const CalculadoraAtaqueModal = ({ open, onClose, personagem, onSave, contexto = 'ataque' }) => {
  const contextConfig = getContextConfig(contexto);
  const isDefesaContexto = contexto === 'defesa';
  const tiposDanoOptions = useMemo(
    () => TIPOS_DANO_ATAQUE.map(tipo => ({ value: tipo, label: getTipoDanoLabel(tipo, contexto) })),
    [contexto],
  );
  const [form, setForm] = useState(defaultForm);
  const [combos, setCombos] = useState([]);
  const [arts, setArts] = useState([]);
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [preview, setPreview] = useState(null);
  const [selectedComboId, setSelectedComboId] = useState('');
  const [resourceSelecionada, setResourceSelecionada] = useState('energia');
  const [confirmarNovaCombinacao, setConfirmarNovaCombinacao] = useState(false);
  const [avisoInformativoAberto, setAvisoInformativoAberto] = useState(false);
  const [naoMostrarAvisoNovamente, setNaoMostrarAvisoNovamente] = useState(false);
  const auth = useAuth?.() ?? {};
  const currentUser = auth.currentUser;
  const avisoKey = getCalculadoraAtaqueAvisoKey(currentUser?.uid || 'anon', contexto);

  const fecharAvisoInformativo = () => {
    if (naoMostrarAvisoNovamente && typeof window !== 'undefined') {
      window.localStorage.setItem(avisoKey, 'true');
    } else if (typeof window !== 'undefined') {
      window.localStorage.removeItem(avisoKey);
    }

    setNaoMostrarAvisoNovamente(false);
    setAvisoInformativoAberto(false);
  };

  const normalizarTipoRecurso = tipo => {
    if (tipo === 'saude' || tipo === 'hp') {
      return 'saude';
    }
    if (tipo === 'energia' || tipo === 'fadiga') {
      return tipo;
    }
    return tipo;
  };
  const [comboEmExclusao, setComboEmExclusao] = useState(null);
  const [comboEmUso, setComboEmUso] = useState(null);
  const [processandoUsoComboId, setProcessandoUsoComboId] = useState('');
  const [notificacaoUso, setNotificacaoUso] = useState('');
  const conteudoPrincipalRef = useRef(null);

  const valorBaseAtual = useMemo(() => {
    if (isDefesaContexto) {
      return calcularDefesaDaFicha(personagem);
    }

    return calcularAtaqueDaFicha(personagem);
  }, [isDefesaContexto, personagem]);

  useEffect(() => {
    if (!open || !personagem?.id) {
      return undefined;
    }

    let ativo = true;
    setCarregando(true);
    const comboGetter = isDefesaContexto ? getCombosDefesa : getCombosAtaque;

    Promise.all([
      getArts(personagem.id),
      getItensInventario(personagem.id),
      comboGetter(personagem.id),
    ])
      .then(([artsCarregadas, itensCarregados, combosCarregados]) => {
        if (!ativo) return;
        setArts(artsCarregadas ?? []);
        setItens(itensCarregados ?? []);
        setCombos((combosCarregados ?? []).sort((a, b) => (b.updatedAt?.seconds ?? 0) - (a.updatedAt?.seconds ?? 0)));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [isDefesaContexto, open, personagem?.id]);

  const artSelecionada = useMemo(
    () => arts.find(art => art.id === form.artId) ?? null,
    [arts, form.artId],
  );

  const itemSelecionado = useMemo(
    () => itens.find(item => item.id === form.itemInventarioId) ?? null,
    [itens, form.itemInventarioId],
  );

  const bonusArte = useMemo(() => extrairBonusNumericoAtaque(artSelecionada).valor, [artSelecionada]);
  const bonusItem = useMemo(() => extrairBonusNumericoItem(itemSelecionado).valor, [itemSelecionado]);
  const potencialBase = useMemo(
    () => calcularPotencialBase(valorBaseAtual, bonusArte, bonusItem, formatarValor(form.bonusExtra)),
    [valorBaseAtual, bonusArte, bonusItem, form.bonusExtra],
  );

  const aumentoPotencial = useMemo(
    () => calcularAumentoPotencial(potencialBase, form.potencializacao),
    [potencialBase, form.potencializacao],
  );

  const potencialFinal = useMemo(
    () => calcularPotencialFinal(potencialBase, form.potencializacao),
    [potencialBase, form.potencializacao],
  );

  useEffect(() => {
    const calculo = converterPotencialEmDados(potencialFinal, form.tipoDano);
    setPreview({
      potencialBase,
      aumentoPotencial,
      potencialFinal,
      parcelaFixa: calculo.fixo,
      bonusFixo: calculo.bonusFixo,
      perfil: calculo.perfil,
      rolling: calculo.rolling,
      resultadoRolagem: calculo.rolagemObtida,
      resultadoFinal: calculo.resultadoFinal,
      rolagemMaxima: calculo.rolagemMaxima,
      quantidadeDados: calculo.quantidadeDados,
      minimo: calculo.minimo,
      media: calculo.media,
      maximo: calculo.maximo,
    });
  }, [aumentoPotencial, potencialBase, potencialFinal, form.tipoDano]);

  useEffect(() => {
    if (open && conteudoPrincipalRef.current) {
      conteudoPrincipalRef.current.scrollTop = 0;
    }
  }, [open, personagem?.id]);

  useEffect(() => {
    if (!open) {
      setAvisoInformativoAberto(false);
      setNaoMostrarAvisoNovamente(false);
      resetAttackCombinationForm({
        setForm,
        setSelectedComboId,
        setResourceSelecionada,
        setErro,
        setComboEmUso,
        setComboEmExclusao,
        setNotificacaoUso,
        setConfirmarNovaCombinacao,
      });
      return undefined;
    }

    if (typeof window !== 'undefined') {
      const ocultarAviso = window.localStorage.getItem(avisoKey) === 'true';
      setAvisoInformativoAberto(!ocultarAviso);
      setNaoMostrarAvisoNovamente(false);
    }
  }, [avisoKey, isDefesaContexto, open]);

  const comboSelecionada = useMemo(
    () => combos.find(combo => combo.id === selectedComboId) ?? null,
    [combos, selectedComboId],
  );

  const modoEdicao = useMemo(() => {
    if (!selectedComboId) {
      return 'Nova combinação';
    }

    return `Editando: ${comboSelecionada?.nome || 'combinação'}`;
  }, [comboSelecionada?.nome, selectedComboId]);

  const energiaAtual = Number(personagem?.status?.energia?.atual ?? 0);
  const energiaMaxima = Number(personagem?.statusMaximos?.energia ?? personagem?.status?.energia?.maximo ?? 0);
  const fadigaAtual = Number(personagem?.status?.fadiga?.atual ?? 0);
  const fadigaMaxima = Number(personagem?.statusMaximos?.fadiga ?? personagem?.status?.fadiga?.maximo ?? 0);
  const saudeAtual = Number(personagem?.status?.hp?.atual ?? personagem?.status?.saude?.atual ?? 0);
  const saudeMaxima = Number(personagem?.statusMaximos?.hp ?? personagem?.statusMaximos?.saude ?? personagem?.status?.hp?.maximo ?? personagem?.status?.saude?.maximo ?? 0);
  const energiaDadosDisponiveis = Number.isFinite(energiaAtual) && Number.isFinite(energiaMaxima) && (energiaMaxima > 0 || energiaAtual >= 0);
  const fadigaDadosDisponiveis = Number.isFinite(fadigaAtual) && Number.isFinite(fadigaMaxima) && (fadigaMaxima > 0 || fadigaAtual >= 0);
  const saudeDadosDisponiveis = Number.isFinite(saudeAtual) && Number.isFinite(saudeMaxima) && (saudeMaxima > 0 || saudeAtual >= 0);
  const custoEnergia = useMemo(
    () => (resourceSelecionada === 'energia' ? calcularCustoEnergia(energiaMaxima, form.potencializacao) : 0),
    [energiaMaxima, form.potencializacao, resourceSelecionada],
  );
  const custoFadiga = useMemo(
    () => (resourceSelecionada === 'fadiga' ? calcularCustoPercentualRecurso(fadigaMaxima, form.potencializacao) : 0),
    [fadigaMaxima, form.potencializacao, resourceSelecionada],
  );
  const custoSaude = useMemo(
    () => (resourceSelecionada === 'saude' ? calcularCustoPercentualRecurso(saudeMaxima, form.potencializacao) : 0),
    [saudeMaxima, form.potencializacao, resourceSelecionada],
  );
  const energiaAposUso = Math.max(0, energiaAtual - custoEnergia);
  const fadigaAposUso = Math.max(0, fadigaAtual - custoFadiga);
  const saudeAposUso = Math.max(0, saudeAtual - custoSaude);
  const energiaPercentualBarra = energiaMaxima > 0 ? Math.min(100, Math.max(0, (energiaAtual / energiaMaxima) * 100)) : 0;
  const fadigaPercentualBarra = fadigaMaxima > 0 ? Math.min(100, Math.max(0, (fadigaAtual / fadigaMaxima) * 100)) : 0;
  const saudePercentualBarra = saudeMaxima > 0 ? Math.min(100, Math.max(0, (saudeAtual / saudeMaxima) * 100)) : 0;
  const energiaSuficiente = energiaDadosDisponiveis && energiaAtual >= custoEnergia;
  const fadigaSuficiente = fadigaDadosDisponiveis && fadigaAtual >= custoFadiga;
  const saudeSuficiente = saudeDadosDisponiveis && saudeAtual >= custoSaude;
  const perfilRoll = preview?.perfil ?? ATAQUE_PERFIS[form.tipoDano]?.dados ?? 'd8';
  const danoFixo = Number(preview?.parcelaFixa ?? 0);
  const rollingTexto = danoFixo === 0
    ? (perfilRoll && perfilRoll !== '0' ? perfilRoll : '0')
    : `${perfilRoll}${danoFixo >= 0 ? '+' : ''}${danoFixo}`;
  const energiaStatusMensagem = !energiaDadosDisponiveis
    ? 'Energia indisponível'
    : energiaSuficiente
      ? 'Energia suficiente'
      : `Energia insuficiente — faltam ${Math.max(0, custoEnergia - energiaAtual)} pontos.`;
  const fadigaStatusMensagem = !fadigaDadosDisponiveis
    ? 'Fadiga indisponível'
    : fadigaSuficiente
      ? 'Fadiga suficiente'
      : `Fadiga insuficiente — faltam ${Math.max(0, custoFadiga - fadigaAtual)} pontos.`;
  const saudeStatusMensagem = !saudeDadosDisponiveis
    ? 'Saúde indisponível'
    : saudeSuficiente
      ? 'Saúde suficiente'
      : `Saúde insuficiente — faltam ${Math.max(0, custoSaude - saudeAtual)} pontos.`;

  const hasUnsavedChanges = useMemo(() => {
    if (!selectedComboId && !comboSelecionada) {
      return Boolean(
        form.nome ||
        form.tipoDano !== 'Contundente' ||
        form.artId ||
        form.itemInventarioId ||
        form.bonusExtra !== 0 ||
        form.potencializacao !== 0 ||
        resourceSelecionada !== 'energia',
      );
    }

    if (!comboSelecionada) {
      return true;
    }

    const tipoRecursoSelecionado = normalizarTipoRecurso(comboSelecionada?.costResourceType);
    const custoSaudeCombo = Number(comboSelecionada?.custoSaude ?? comboSelecionada?.custoHp ?? 0);
    const custoFadigaCombo = Number(comboSelecionada?.custoFadiga ?? 0);
    const custoEnergiaCombo = Number(comboSelecionada?.custoEnergia ?? 0);
    const tipoRecursoConsolidado = tipoRecursoSelecionado === 'saude' || tipoRecursoSelecionado === 'energia' || tipoRecursoSelecionado === 'fadiga'
      ? tipoRecursoSelecionado
      : custoSaudeCombo > 0 && custoEnergiaCombo > 0
        ? 'ambos'
        : custoSaudeCombo > 0
          ? 'saude'
          : custoFadigaCombo > 0 && custoEnergiaCombo > 0
            ? 'ambos'
            : custoFadigaCombo > 0
              ? 'fadiga'
              : 'energia';

    return (
      String(form.nome || '').trim() !== String(comboSelecionada.nome || '').trim() ||
      String(form.tipoDano || 'Contundente') !== String(comboSelecionada.tipoDano || 'Contundente') ||
      String(form.artId || '') !== String(comboSelecionada.artId || '') ||
      String(form.itemInventarioId || '') !== String(comboSelecionada.itemInventarioId || '') ||
      Number(form.bonusExtra || 0) !== Number(comboSelecionada.bonusExtra || 0) ||
      Number(form.potencializacao || 0) !== Number(comboSelecionada.potencializacao || 0) ||
      resourceSelecionada !== (tipoRecursoConsolidado === 'ambos' ? 'energia' : tipoRecursoConsolidado || 'energia')
    );
  }, [comboSelecionada, form.artId, form.bonusExtra, form.itemInventarioId, form.nome, form.potencializacao, form.tipoDano, resourceSelecionada, selectedComboId]);

  const getResourceTypeForCombo = combo => {
    const explicit = normalizarTipoRecurso(combo?.costResourceType);
    if (explicit === 'saude' || explicit === 'energia' || explicit === 'fadiga') {
      return explicit;
    }

    const custoSaudeCombo = Number(combo?.custoSaude ?? combo?.custoHp ?? 0);
    const custoFadigaCombo = Number(combo?.custoFadiga ?? 0);
    const custoEnergiaCombo = Number(combo?.custoEnergia ?? 0);

    if (custoSaudeCombo > 0 && custoEnergiaCombo > 0) {
      return 'ambos';
    }

    if (custoSaudeCombo > 0) {
      return 'saude';
    }

    if (custoFadigaCombo > 0 && custoEnergiaCombo > 0) {
      return 'ambos';
    }

    if (custoFadigaCombo > 0) {
      return 'fadiga';
    }

    return 'energia';
  };

  const formatarRollingCombo = combo => {
    if (combo?.perfilDano) {
      return combo.perfilDano;
    }

    const perfil = ATAQUE_PERFIS[combo?.tipoDano]?.dados || 'd8';
    const bonusExtra = Number(combo?.bonusExtra ?? 0);
    const sinal = bonusExtra >= 0 ? '+' : '-';
    return bonusExtra !== 0 ? `${perfil}${sinal}${Math.abs(bonusExtra)}` : perfil;
  };

  const obterCustoCombo = combo => {
    if (!energiaDadosDisponiveis) return 0;
    const tipo = getResourceTypeForCombo(combo);
    if (tipo === 'fadiga') return 0;
    return Math.max(0, calcularCustoEnergia(energiaMaxima, Number(combo?.potencializacao ?? 0)));
  };

  const obterCustoFadigaCombo = combo => {
    if (!fadigaDadosDisponiveis) return 0;
    const tipo = getResourceTypeForCombo(combo);
    if (tipo === 'energia' || tipo === 'saude') return 0;
    return Math.max(0, calcularCustoPercentualRecurso(fadigaMaxima, Number(combo?.potencializacao ?? 0)));
  };

  const obterCustoSaudeCombo = combo => {
    if (!saudeDadosDisponiveis) return 0;
    const tipo = getResourceTypeForCombo(combo);
    if (tipo === 'energia' || tipo === 'fadiga') return 0;
    return Math.max(0, calcularCustoPercentualRecurso(saudeMaxima, Number(combo?.potencializacao ?? 0)));
  };

  const obterCustoSelecionado = combo => {
    const tipo = getResourceTypeForCombo(combo);
    if (tipo === 'fadiga') {
      return obterCustoFadigaCombo(combo);
    }
    if (tipo === 'saude') {
      return obterCustoSaudeCombo(combo);
    }
    return obterCustoCombo(combo);
  };

  const atualizarCampo = field => event => {
    const valor = event.target.value;
    setErro('');
    const valorNumerico = field === 'bonusExtra' || field === 'potencializacao'
      ? Number(valor || 0)
      : valor;
    setForm(current => ({ ...current, [field]: valorNumerico }));
  };

  const handleSalvar = async () => {
    const nomeSalvavel = form.nome.trim().replace(/\s+/g, ' ');
    if (!nomeSalvavel) {
      setErro('Informe um nome para a combinação antes de salvar.');
      return;
    }

    const comboIdParaSalvar = selectedComboId || '';
    const custoEnergiaPersistido = resourceSelecionada === 'energia'
      ? calcularCustoEnergia(energiaMaxima, Number(form.potencializacao || 0))
      : 0;
    const custoFadigaPersistido = resourceSelecionada === 'fadiga'
      ? calcularCustoPercentualRecurso(fadigaMaxima, Number(form.potencializacao || 0))
      : 0;
    const custoSaudePersistido = resourceSelecionada === 'saude'
      ? calcularCustoPercentualRecurso(saudeMaxima, Number(form.potencializacao || 0))
      : 0;

    const payload = {
      nome: nomeSalvavel,
      tipoDano: form.tipoDano,
      artId: artSelecionada?.id ?? '',
      itemInventarioId: itemSelecionado?.id ?? '',
      bonusExtra: Number(form.bonusExtra || 0),
      potencializacao: Number(form.potencializacao || 0),
      custoEnergia: custoEnergiaPersistido,
      custoFadiga: custoFadigaPersistido,
      custoSaude: custoSaudePersistido,
      costResourceType: resourceSelecionada,
      valorBaseFicha: valorBaseAtual,
      ...(isDefesaContexto ? { defesaDaFicha: valorBaseAtual } : { ataqueDaFicha: valorBaseAtual }),
      bonusArte: bonusArte,
      bonusItem: bonusItem,
      potencialBase,
      potencialFinal,
      perfilDano: preview?.rolling ?? `${perfilRoll}${danoFixo === 0 ? '' : danoFixo >= 0 ? `+${danoFixo}` : `${danoFixo}`}`,
    };

    try {
      const comboAPI = isDefesaContexto
      ? { add: addComboDefesa, update: updateComboDefesa, remove: removeComboDefesa, getAll: getCombosDefesa }
      : { add: addComboAtaque, update: updateComboAtaque, remove: removeComboAtaque, getAll: getCombosAtaque };

    if (comboIdParaSalvar) {
        await comboAPI.update(personagem.id, comboIdParaSalvar, payload);
        setSelectedComboId(comboIdParaSalvar);
      } else {
        await comboAPI.add(personagem.id, payload);
        setSelectedComboId('');
      }

      const atualizados = await comboAPI.getAll(personagem.id);
      setCombos((atualizados ?? []).sort((a, b) => (b.updatedAt?.seconds ?? 0) - (a.updatedAt?.seconds ?? 0)));
      setErro('');
      setForm(current => ({ ...current, nome: nomeSalvavel }));
    } catch {
      setErro('Não foi possível salvar a combinação de ataque.');
    }
  };

  const handleSelecionarCombo = combo => {
    setSelectedComboId(combo.id);
    setErro('');
    const recursoCombo = getResourceTypeForCombo(combo);
    setResourceSelecionada(recursoCombo === 'saude' || recursoCombo === 'energia' || recursoCombo === 'fadiga' ? recursoCombo : 'energia');
    setForm({
      nome: combo.nome ?? '',
      tipoDano: combo.tipoDano ?? 'Contundente',
      artId: combo.artId ?? '',
      itemInventarioId: combo.itemInventarioId ?? '',
      bonusExtra: Number(combo.bonusExtra ?? 0),
      potencializacao: Number(combo.potencializacao ?? 0),
    });
  };

  const handleNovaCombinacao = () => {
    if (hasUnsavedChanges && selectedComboId) {
      setConfirmarNovaCombinacao(true);
      return;
    }

    resetAttackCombinationForm({
      setForm,
      setSelectedComboId,
      setResourceSelecionada,
      setErro,
      setComboEmUso,
      setComboEmExclusao,
      setNotificacaoUso,
      setConfirmarNovaCombinacao,
    });
  };

  const handleExcluirCombo = combo => {
    setComboEmExclusao(combo);
  };

  const handleUsarCombo = combo => {
    const tipoRecurso = getResourceTypeForCombo(combo);
    const custoCombo = tipoRecurso === 'fadiga' || tipoRecurso === 'saude' ? 0 : obterCustoCombo(combo);
    const custoFadigaCombo = tipoRecurso === 'energia' || tipoRecurso === 'saude' ? 0 : obterCustoFadigaCombo(combo);
    const custoSaudeCombo = tipoRecurso === 'energia' || tipoRecurso === 'fadiga' ? 0 : obterCustoSaudeCombo(combo);
    const energiaRestante = Math.max(0, energiaAtual - (tipoRecurso === 'energia' || tipoRecurso === 'ambos' ? custoCombo : 0));
    const fadigaRestante = Math.max(0, fadigaAtual - (tipoRecurso === 'fadiga' || tipoRecurso === 'ambos' ? custoFadigaCombo : 0));
    const saudeRestante = Math.max(0, saudeAtual - (tipoRecurso === 'saude' || tipoRecurso === 'ambos' ? custoSaudeCombo : 0));

    if (tipoRecurso === 'energia' || tipoRecurso === 'ambos') {
      if (!energiaDadosDisponiveis) {
        setErro('Energia indisponível para usar esta combinação no momento.');
        return;
      }

      if (energiaAtual < custoCombo) {
        setErro(`Energia insuficiente — faltam ${Math.max(0, custoCombo - energiaAtual)} pontos.`);
        return;
      }
    }

    if (tipoRecurso === 'fadiga' || tipoRecurso === 'ambos') {
      if (!fadigaDadosDisponiveis) {
        setErro('Fadiga indisponível para usar esta combinação no momento.');
        return;
      }

      if (Number(combo?.potencializacao ?? 0) > 0 && custoFadigaCombo <= 0) {
        setErro('Para usar Fadiga como recurso, informe um custo positivo de Fadiga antes de confirmar.');
        return;
      }

      if (fadigaAtual < custoFadigaCombo) {
        setErro(`Fadiga insuficiente — faltam ${Math.max(0, custoFadigaCombo - fadigaAtual)} pontos.`);
        return;
      }
    }

    if (tipoRecurso === 'saude' || tipoRecurso === 'ambos') {
      if (!saudeDadosDisponiveis) {
        setErro('Saúde indisponível para usar esta combinação no momento.');
        return;
      }

      if (Number(combo?.potencializacao ?? 0) > 0 && custoSaudeCombo <= 0) {
        setErro('Para usar Saúde como recurso, informe um custo positivo de Saúde antes de confirmar.');
        return;
      }

      if (saudeAtual < custoSaudeCombo) {
        setErro(`Saúde insuficiente — faltam ${Math.max(0, custoSaudeCombo - saudeAtual)} pontos.`);
        return;
      }
    }

    setErro('');
    setComboEmUso({
      combo,
      custo: tipoRecurso === 'energia' || tipoRecurso === 'ambos' ? custoCombo : 0,
      custoFadiga: tipoRecurso === 'fadiga' || tipoRecurso === 'ambos' ? custoFadigaCombo : 0,
      custoSaude: tipoRecurso === 'saude' || tipoRecurso === 'ambos' ? custoSaudeCombo : 0,
      resourceType: tipoRecurso,
      energiaAtual,
      energiaMaxima,
      energiaRestante,
      fadigaAtual,
      fadigaMaxima,
      fadigaRestante,
      saudeAtual,
      saudeMaxima,
      saudeRestante,
    });
  };

  const confirmarUsoCombo = async () => {
    if (!comboEmUso) {
      return;
    }

    const {
      combo,
      custo,
      custoFadiga,
      custoSaude,
      resourceType,
      energiaAtual: energiaAtualAntes,
      energiaMaxima: energiaMaximaCombo,
      fadigaAtual: fadigaAtualAntes,
      fadigaMaxima: fadigaMaximaCombo,
      saudeAtual: saudeAtualAntes,
      saudeMaxima: saudeMaximaCombo,
    } = comboEmUso;
    const custoFinal = Number(custo ?? 0);
    const custoFadigaFinal = Number(custoFadiga ?? 0);
    const custoSaudeFinal = Number(custoSaude ?? 0);
    const idEmUso = combo?.id ?? 'combo';

    if ((resourceType === 'energia' || resourceType === 'ambos') && energiaAtualAntes < custoFinal) {
      setErro(`Energia insuficiente — faltam ${Math.max(0, custoFinal - energiaAtualAntes)} pontos.`);
      setComboEmUso(null);
      return;
    }

    if ((resourceType === 'fadiga' || resourceType === 'ambos') && fadigaAtualAntes < custoFadigaFinal) {
      setErro(`Fadiga insuficiente — faltam ${Math.max(0, custoFadigaFinal - fadigaAtualAntes)} pontos.`);
      setComboEmUso(null);
      return;
    }

    if ((resourceType === 'saude' || resourceType === 'ambos') && saudeAtualAntes < custoSaudeFinal) {
      setErro(`Saúde insuficiente — faltam ${Math.max(0, custoSaudeFinal - saudeAtualAntes)} pontos.`);
      setComboEmUso(null);
      return;
    }

    setProcessandoUsoComboId(idEmUso);

    try {
      const payloadConsumo = {
        energia: resourceType === 'energia' || resourceType === 'ambos' ? custoFinal : 0,
        fadiga: resourceType === 'fadiga' || resourceType === 'ambos' ? custoFadigaFinal : 0,
        ...(resourceType === 'saude' || resourceType === 'ambos' ? { saude: custoSaudeFinal } : {}),
      };

      const resultado = await consumirRecursosPersonagem(personagem.id, payloadConsumo);
      const proximaEnergia = Number(resultado?.energia?.atual ?? Math.max(0, energiaAtualAntes - custoFinal));
      const proximaFadiga = Number(resultado?.fadiga?.atual ?? Math.max(0, fadigaAtualAntes - custoFadigaFinal));
      const proximaSaude = Number(resultado?.saude?.atual ?? Math.max(0, saudeAtualAntes - custoSaudeFinal));

      const statusAtual = personagem?.status ?? {};
      const proximaStatus = {
        ...statusAtual,
        hp: {
          ...((statusAtual.hp ?? statusAtual.saude ?? {})),
          atual: resourceType === 'saude' || resourceType === 'ambos' ? proximaSaude : Number(statusAtual?.hp?.atual ?? statusAtual?.saude?.atual ?? saudeAtualAntes),
          maximo: saudeMaximaCombo || Number(statusAtual?.hp?.maximo ?? statusAtual?.saude?.maximo ?? 0),
        },
        ...(Object.prototype.hasOwnProperty.call(statusAtual, 'saude') || Object.prototype.hasOwnProperty.call(statusAtual, 'hp')
          ? {
              saude: {
                ...((statusAtual.saude ?? statusAtual.hp ?? {})),
                atual: resourceType === 'saude' || resourceType === 'ambos' ? proximaSaude : Number(statusAtual?.saude?.atual ?? statusAtual?.hp?.atual ?? saudeAtualAntes),
                maximo: saudeMaximaCombo || Number(statusAtual?.saude?.maximo ?? statusAtual?.hp?.maximo ?? 0),
              },
            }
          : {}),
        energia: {
          ...((statusAtual.energia ?? {})),
          atual: resourceType === 'energia' || resourceType === 'ambos' ? proximaEnergia : Number(statusAtual?.energia?.atual ?? energiaAtualAntes),
          maximo: energiaMaximaCombo || Number(statusAtual?.energia?.maximo ?? 0),
        },
        fadiga: {
          ...((statusAtual.fadiga ?? {})),
          atual: resourceType === 'fadiga' || resourceType === 'ambos' ? proximaFadiga : Number(statusAtual?.fadiga?.atual ?? fadigaAtualAntes),
          maximo: fadigaMaximaCombo || Number(statusAtual?.fadiga?.maximo ?? 0),
        },
      };

      const proximoStatusMaximos = {
        ...(personagem?.statusMaximos ?? {}),
        hp: resourceType === 'saude' || resourceType === 'ambos' ? (saudeMaximaCombo || Number(personagem?.statusMaximos?.hp ?? personagem?.statusMaximos?.saude ?? statusAtual?.hp?.maximo ?? statusAtual?.saude?.maximo ?? 0)) : Number(personagem?.statusMaximos?.hp ?? personagem?.statusMaximos?.saude ?? statusAtual?.hp?.maximo ?? statusAtual?.saude?.maximo ?? 0),
        ...(Object.prototype.hasOwnProperty.call(personagem?.statusMaximos ?? {}, 'saude') || Object.prototype.hasOwnProperty.call(statusAtual, 'saude')
          ? {
              saude: resourceType === 'saude' || resourceType === 'ambos' ? (saudeMaximaCombo || Number(personagem?.statusMaximos?.saude ?? personagem?.statusMaximos?.hp ?? statusAtual?.saude?.maximo ?? statusAtual?.hp?.maximo ?? 0)) : Number(personagem?.statusMaximos?.saude ?? personagem?.statusMaximos?.hp ?? statusAtual?.saude?.maximo ?? statusAtual?.hp?.maximo ?? 0),
            }
          : {}),
        energia: resourceType === 'energia' || resourceType === 'ambos' ? (energiaMaximaCombo || Number(personagem?.statusMaximos?.energia ?? statusAtual?.energia?.maximo ?? 0)) : Number(personagem?.statusMaximos?.energia ?? statusAtual?.energia?.maximo ?? 0),
        fadiga: resourceType === 'fadiga' || resourceType === 'ambos' ? (fadigaMaximaCombo || Number(personagem?.statusMaximos?.fadiga ?? statusAtual?.fadiga?.maximo ?? 0)) : Number(personagem?.statusMaximos?.fadiga ?? statusAtual?.fadiga?.maximo ?? 0),
      };

      await onSave?.({ status: proximaStatus, statusMaximos: proximoStatusMaximos });
      const resourceLabel = resourceType === 'ambos' ? 'Energia + Fadiga' : resourceType === 'saude' ? 'Saúde' : resourceType === 'fadiga' ? 'Fadiga' : 'Energia';
      setNotificacaoUso(
        `Combo utilizado! Recurso: ${resourceLabel}. ${resourceType === 'energia' || resourceType === 'ambos' ? `Energia consumida: ${custoFinal}. Energia restante: ${proximaEnergia}/${energiaMaximaCombo || energiaAtualAntes}.` : resourceType === 'saude' ? `Saúde consumida: ${custoSaudeFinal}. Saúde restante: ${proximaSaude}/${saudeMaximaCombo || saudeAtualAntes}.` : `Fadiga consumida: ${custoFadigaFinal}. Fadiga restante: ${proximaFadiga}/${fadigaMaximaCombo || fadigaAtualAntes}.`}`,
      );
      setErro('');
      setComboEmUso(null);
    } catch (error) {
      setErro(error?.message || 'Não foi possível utilizar a combinação.');
    } finally {
      setProcessandoUsoComboId('');
    }
  };

  const confirmarExclusaoCombo = async () => {
    if (!comboEmExclusao) {
      return;
    }

    const comboId = comboEmExclusao.id;

    try {
      const comboAPI = isDefesaContexto
        ? { add: addComboDefesa, update: updateComboDefesa, remove: removeComboDefesa, getAll: getCombosDefesa }
        : { add: addComboAtaque, update: updateComboAtaque, remove: removeComboAtaque, getAll: getCombosAtaque };

      await comboAPI.remove(personagem.id, comboId);
      const atualizados = await comboAPI.getAll(personagem.id);
      setCombos((atualizados ?? []).sort((a, b) => (b.updatedAt?.seconds ?? 0) - (a.updatedAt?.seconds ?? 0)));

      if (selectedComboId === comboId) {
        setSelectedComboId('');
        setForm(defaultForm);
      }

      setErro('');
      setComboEmExclusao(null);
    } catch {
      setErro('Não foi possível remover a combinação salva.');
      setComboEmExclusao(null);
    }
  };

  if (!open || !personagem) {
    return null;
  }

  return (
    <>
      <DarkDialog
        open={open && avisoInformativoAberto}
        onClose={fecharAvisoInformativo}
        maxWidth="sm"
        fullWidth
        aria-labelledby="aviso-calculadora-ataque-titulo"
      >
        <DialogTitle id="aviso-calculadora-ataque-titulo" sx={{
          background: 'linear-gradient(180deg, rgba(30, 24, 43, 0.98), rgba(18, 16, 27, 0.9))',
          borderBottom: '1px solid rgba(232, 203, 133, 0.5)',
          color: '#f4dda2',
          fontFamily: 'Georgia, "Times New Roman", serif',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontSize: '1rem',
          py: 2,
        }}>
          {contextConfig.tituloAviso}
        </DialogTitle>
        <DialogContent sx={{
          background: 'linear-gradient(180deg, rgba(15, 14, 22, 0.98), rgba(11, 11, 17, 0.98))',
          p: 3,
          display: 'grid',
          gap: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: '#f4dda2', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.72rem' }}>
            <InfoOutlinedIcon fontSize="small" />
            Atenção aos custos
          </Box>

          <DialogContentText sx={{ color: '#e9ebff', lineHeight: 1.7, fontSize: '0.94rem', m: 0 }}>
            {contextConfig.descricaoAviso}
          </DialogContentText>

          <Box sx={{
            border: '1px solid rgba(232, 203, 133, 0.45)',
            borderRadius: 2,
            background: 'rgba(232, 203, 133, 0.04)',
            p: 1.5,
            display: 'grid',
            gap: 1,
          }}>
            <Typography sx={{ color: '#f4dda2', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.72rem' }}>
              Atenção aos custos
            </Typography>
            <DialogContentText sx={{ color: '#e9ebff', lineHeight: 1.7, fontSize: '0.9rem', m: 0 }}>
              O custo de Saúde, Energia ou Fadiga apresentado pela calculadora corresponde exclusivamente à mecânica de <strong>Potencialização</strong>.
            </DialogContentText>
            <DialogContentText sx={{ color: '#e9ebff', lineHeight: 1.7, fontSize: '0.9rem', m: 0 }}>
              Custos próprios de Artes, Habilidades, equipamentos e outros efeitos não estão incluídos nesse valor e devem ser considerados separadamente.
            </DialogContentText>
            <DialogContentText sx={{ color: '#e9ebff', lineHeight: 1.7, fontSize: '0.9rem', m: 0 }}>
              Ao utilizar uma combinação, o desconto automático corresponde somente ao recurso gasto na Potencialização.
            </DialogContentText>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={naoMostrarAvisoNovamente}
                onChange={event => setNaoMostrarAvisoNovamente(event.target.checked)}
                sx={{
                  color: '#f4dda2',
                  '&.Mui-checked': { color: '#f4dda2' },
                }}
              />
            }
            label="Não mostrar este aviso novamente"
            sx={{
              color: '#e9ebff',
              '& .MuiFormControlLabel-label': { fontSize: '0.9rem' },
            }}
          />
        </DialogContent>
        <DialogActions sx={{
          background: 'linear-gradient(180deg, rgba(16, 15, 24, 0.98), rgba(11, 11, 18, 0.98))',
          borderTop: '1px solid rgba(232, 203, 133, 0.32)',
          px: 3,
          py: 2,
        }}>
          <Button
            onClick={fecharAvisoInformativo}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, rgba(232, 203, 133, 0.98), rgba(170, 143, 77, 0.94))',
              color: '#120e19',
              fontWeight: 800,
              border: '1px solid rgba(232, 203, 133, 0.8)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              px: 3,
            }}
          >
            Entendi
          </Button>
        </DialogActions>
      </DarkDialog>

      <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="lg" aria-labelledby="calculadora-ataque-titulo">
        <HeaderBar>
          <HeaderOrnament />
          <HeaderTitle id="calculadora-ataque-titulo">{contextConfig.titulo}</HeaderTitle>
          <HeaderInfoButton aria-label="Reabrir aviso da calculadora" onClick={() => setAvisoInformativoAberto(true)}>
            <InfoOutlinedIcon fontSize="small" />
          </HeaderInfoButton>
          <CloseButton aria-label="Fechar calculadora" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </CloseButton>
        </HeaderBar>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <ModalBody ref={conteudoPrincipalRef}>
          <BoardGrid>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <SectionCard>
                <SectionHeader>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
                      <ShieldIcon fontSize="small" />
                      <Box sx={{ display: 'grid', minWidth: 0 }}>
                        <Box sx={{ fontSize: '0.82rem', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.2 }}>{contextConfig.nomeConfiguracao}</Box>
                        <Box sx={{ fontSize: '0.68rem', color: '#dfe4ff', letterSpacing: '0.04em', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                          {modoEdicao}
                        </Box>
                      </Box>
                    </Box>
                    <Button
                      type="button"
                      size="small"
                      startIcon={<AddIcon fontSize="small" />}
                      onClick={handleNovaCombinacao}
                      sx={{
                        minWidth: 0,
                        height: 32,
                        px: 1.25,
                        borderRadius: 1.5,
                        border: '1px solid rgba(232, 203, 133, 0.72)',
                        background: 'rgba(12, 14, 25, 0.7)',
                        color: '#f4dda2',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        fontSize: '0.64rem',
                        '&:hover': {
                          background: 'rgba(232, 203, 133, 0.08)',
                          borderColor: 'rgba(232, 203, 133, 0.92)',
                        },
                      }}
                    >
                      Nova Combinação
                    </Button>
                  </Box>
                </SectionHeader>
                <SectionBody>
                  <FieldGroup>
                    <StyledTextField label="Nome da combinação" value={form.nome} onChange={atualizarCampo('nome')} fullWidth />
                  </FieldGroup>

                  <TwoColFields>
                    <StyledSelect fullWidth>
                      <InputLabel id="tipo-dano-label">{contextConfig.tipoDanoLabel}</InputLabel>
                      <Select labelId="tipo-dano-label" label={contextConfig.tipoDanoLegenda} value={form.tipoDano} onChange={atualizarCampo('tipoDano')}>
                        {tiposDanoOptions.map(tipo => (
                          <MenuItem key={tipo.value} value={tipo.value}>{tipo.label}</MenuItem>
                        ))}
                      </Select>
                    </StyledSelect>

                    <StyledSelect fullWidth>
                      <InputLabel id="art-label">Arte/Habilidade</InputLabel>
                      <Select labelId="art-label" label="Arte/Habilidade" value={form.artId} onChange={atualizarCampo('artId')}>
                        <MenuItem value="">Nenhuma</MenuItem>
                        {arts.map(art => (
                          <MenuItem key={art.id} value={art.id}>{art.nome}</MenuItem>
                        ))}
                      </Select>
                    </StyledSelect>
                  </TwoColFields>

                  <TwoColFields>
                    <StyledSelect fullWidth>
                      <InputLabel id="item-label">Item/Equipamento</InputLabel>
                      <Select labelId="item-label" label="Item/Equipamento" value={form.itemInventarioId} onChange={atualizarCampo('itemInventarioId')}>
                        <MenuItem value="">Nenhum</MenuItem>
                        {itens.map(item => (
                          <MenuItem key={item.id} value={item.id}>{item.nome || 'Item sem nome'}</MenuItem>
                        ))}
                      </Select>
                    </StyledSelect>

                    <StyledTextField label="Bônus extra" type="number" value={form.bonusExtra} onChange={atualizarCampo('bonusExtra')} fullWidth />
                  </TwoColFields>

                  <Box sx={{ display: 'grid', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#c9c7d8', fontWeight: 600 }}>
                        <BoltIcon fontSize="small" sx={{ color: '#f4dda2' }} />
                        Potencialização
                      </Box>
                      <Box sx={{ minWidth: 72, textAlign: 'right', color: '#f4dda2', fontWeight: 700, background: 'rgba(244, 221, 162, 0.08)', border: '1px solid rgba(244, 221, 162, 0.2)', borderRadius: 999, px: 1.25, py: 0.5 }}>
                        {form.potencializacao}%
                      </Box>
                    </Box>
                    <PotencializacaoSlider
                      aria-label="Potencialização de Energia"
                      value={form.potencializacao}
                      min={0}
                      max={30}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                      valueLabelFormat={valor => `${valor}%`}
                      onChange={(_, valor) => {
                        const percentual = Number(valor);
                        setErro('');
                        setForm(current => ({ ...current, potencializacao: percentual }));
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#8e93af', fontSize: '0.72rem', px: 0.25 }}>
                      <span>0%</span>
                      <span>10%</span>
                      <span>20%</span>
                      <span>30%</span>
                    </Box>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 1.5,
                      }}
                    >
                      <ResourceSelectCard
                        onClick={() => setResourceSelecionada('saude')}
                        aria-pressed={resourceSelecionada === 'saude'}
                        sx={resourceSelecionada === 'saude' ? {
                          borderColor: 'rgba(239, 68, 68, 0.9)',
                          background: 'linear-gradient(180deg, rgba(63, 18, 18, 0.82), rgba(21, 17, 28, 0.9))',
                          boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.25), 0 0 20px rgba(239, 68, 68, 0.14)',
                          transform: 'translateY(-1px)',
                        } : {}}
                      >
                        <ResourceCardHeader>
                          <Box sx={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fda4af', fontWeight: 800, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Saúde</Box>
                          {resourceSelecionada === 'saude' && (
                            <Box sx={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.42)', color: '#fda4af', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0 }}>
                              ✓
                            </Box>
                          )}
                        </ResourceCardHeader>

                        {carregando ? (
                          <Typography sx={{ fontSize: '0.76rem', color: '#c9c7d8', width: '100%', minWidth: 0 }}>Carregando saúde...</Typography>
                        ) : !saudeDadosDisponiveis ? (
                          <Typography sx={{ fontSize: '0.76rem', color: '#f0b4b4', fontWeight: 700, width: '100%', minWidth: 0 }}>Saúde indisponível</Typography>
                        ) : (
                          <ResourceCardContent>
                            <ResourceInfoRow>
                              <ResourceInfoLabel>Atual/Máxima</ResourceInfoLabel>
                              <ResourceInfoValue>{saudeAtual} / {saudeMaxima}</ResourceInfoValue>
                            </ResourceInfoRow>
                            <ResourceInfoRow>
                              <ResourceInfoLabel>Custo</ResourceInfoLabel>
                              <ResourceInfoValue>{custoSaude} pts</ResourceInfoValue>
                            </ResourceInfoRow>
                            <ResourceInfoRow>
                              <ResourceInfoLabel>Após uso</ResourceInfoLabel>
                              <ResourceInfoValue>{saudeAposUso} / {saudeMaxima}</ResourceInfoValue>
                            </ResourceInfoRow>
                            <Box sx={{ display: 'grid', gap: 0.45, width: '100%', minWidth: 0 }}>
                              <ResourceProgressTrack>
                                <ResourceProgressFill sx={{ width: `${saudePercentualBarra}%`, background: saudeSuficiente ? 'linear-gradient(90deg, rgba(248, 113, 113, 0.9), rgba(239, 68, 68, 0.9))' : 'linear-gradient(90deg, rgba(248, 113, 113, 0.9), rgba(185, 28, 28, 0.9))' }} />
                              </ResourceProgressTrack>
                              <ResourceInfoRow sx={{ fontSize: '0.68rem', color: '#dfe4ff' }}>
                                <ResourceInfoLabel sx={{ fontSize: '0.68rem', color: '#dfe4ff' }}>Disponibilidade</ResourceInfoLabel>
                                <ResourceInfoValue sx={{ fontSize: '0.68rem', color: '#fda4af' }}>{Math.round(saudePercentualBarra)}%</ResourceInfoValue>
                              </ResourceInfoRow>
                            </Box>
                          </ResourceCardContent>
                        )}
                        {!carregando && saudeDadosDisponiveis && (
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', minWidth: 0 }}>
                            <ResourceStatusPill sx={{ background: saudeSuficiente ? 'rgba(239, 68, 68, 0.12)' : 'rgba(127, 29, 29, 0.2)', border: `1px solid ${saudeSuficiente ? 'rgba(239, 68, 68, 0.4)' : 'rgba(248, 113, 113, 0.5)'}`, color: saudeSuficiente ? '#ffd4d4' : '#ffb4b4' }}>
                              {saudeStatusMensagem}
                            </ResourceStatusPill>
                          </Box>
                        )}
                      </ResourceSelectCard>

                      <ResourceSelectCard
                        onClick={() => setResourceSelecionada('energia')}
                        aria-pressed={resourceSelecionada === 'energia'}
                        sx={resourceSelecionada === 'energia' ? {
                          borderColor: 'rgba(232, 203, 133, 0.9)',
                          background: 'linear-gradient(180deg, rgba(55, 45, 28, 0.82), rgba(21, 17, 28, 0.9))',
                          boxShadow: '0 0 0 1px rgba(232, 203, 133, 0.25), 0 0 20px rgba(232, 203, 133, 0.14)',
                          transform: 'translateY(-1px)',
                        } : {}}
                      >
                        <ResourceCardHeader>
                          <Box sx={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f4dda2', fontWeight: 800, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Energia</Box>
                          {resourceSelecionada === 'energia' && (
                            <Box sx={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(244, 221, 162, 0.12)', border: '1px solid rgba(244, 221, 162, 0.42)', color: '#f4dda2', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0 }}>
                              ✓
                            </Box>
                          )}
                        </ResourceCardHeader>

                        {carregando ? (
                          <Typography sx={{ fontSize: '0.76rem', color: '#c9c7d8', width: '100%', minWidth: 0 }}>Carregando energia...</Typography>
                        ) : !energiaDadosDisponiveis ? (
                          <Typography sx={{ fontSize: '0.76rem', color: '#f0b4b4', fontWeight: 700, width: '100%', minWidth: 0 }}>Energia indisponível</Typography>
                        ) : (
                          <ResourceCardContent>
                            <ResourceInfoRow>
                              <ResourceInfoLabel>Atual/Máxima</ResourceInfoLabel>
                              <ResourceInfoValue>{energiaAtual} / {energiaMaxima}</ResourceInfoValue>
                            </ResourceInfoRow>
                            <ResourceInfoRow>
                              <ResourceInfoLabel>Custo</ResourceInfoLabel>
                              <ResourceInfoValue>{custoEnergia} pts</ResourceInfoValue>
                            </ResourceInfoRow>
                            <ResourceInfoRow>
                              <ResourceInfoLabel>Após uso</ResourceInfoLabel>
                              <ResourceInfoValue>{energiaAposUso} / {energiaMaxima}</ResourceInfoValue>
                            </ResourceInfoRow>
                            <Box sx={{ display: 'grid', gap: 0.45, width: '100%', minWidth: 0 }}>
                              <ResourceProgressTrack>
                                <ResourceProgressFill sx={{ width: `${energiaPercentualBarra}%`, background: energiaSuficiente ? 'linear-gradient(90deg, rgba(45, 212, 191, 0.9), rgba(16, 185, 129, 0.9))' : 'linear-gradient(90deg, rgba(248, 113, 113, 0.9), rgba(220, 38, 38, 0.9))' }} />
                              </ResourceProgressTrack>
                              <ResourceInfoRow sx={{ fontSize: '0.68rem', color: '#dfe4ff' }}>
                                <ResourceInfoLabel sx={{ fontSize: '0.68rem', color: '#dfe4ff' }}>Disponibilidade</ResourceInfoLabel>
                                <ResourceInfoValue sx={{ fontSize: '0.68rem', color: '#f4dda2' }}>{Math.round(energiaPercentualBarra)}%</ResourceInfoValue>
                              </ResourceInfoRow>
                            </Box>
                          </ResourceCardContent>
                        )}
                        {!carregando && energiaDadosDisponiveis && (
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', minWidth: 0 }}>
                            <ResourceStatusPill sx={{ background: energiaSuficiente ? 'rgba(16, 185, 129, 0.12)' : 'rgba(127, 29, 29, 0.2)', border: `1px solid ${energiaSuficiente ? 'rgba(45, 212, 191, 0.4)' : 'rgba(248, 113, 113, 0.5)'}`, color: energiaSuficiente ? '#b8f0d4' : '#ffb4b4' }}>
                              {energiaStatusMensagem}
                            </ResourceStatusPill>
                          </Box>
                        )}
                      </ResourceSelectCard>

                      <ResourceSelectCard
                        onClick={() => setResourceSelecionada('fadiga')}
                        aria-pressed={resourceSelecionada === 'fadiga'}
                        sx={resourceSelecionada === 'fadiga' ? {
                          borderColor: 'rgba(232, 203, 133, 0.9)',
                          background: 'linear-gradient(180deg, rgba(55, 45, 28, 0.82), rgba(21, 17, 28, 0.9))',
                          boxShadow: '0 0 0 1px rgba(232, 203, 133, 0.25), 0 0 20px rgba(232, 203, 133, 0.14)',
                          transform: 'translateY(-1px)',
                        } : {}}
                      >
                        <ResourceCardHeader>
                          <Box sx={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f4dda2', fontWeight: 800, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Fadiga</Box>
                          {resourceSelecionada === 'fadiga' && (
                            <Box sx={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(244, 221, 162, 0.12)', border: '1px solid rgba(244, 221, 162, 0.42)', color: '#f4dda2', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0 }}>
                              ✓
                            </Box>
                          )}
                        </ResourceCardHeader>

                        {carregando ? (
                          <Typography sx={{ fontSize: '0.76rem', color: '#c9c7d8', width: '100%', minWidth: 0 }}>Carregando fadiga...</Typography>
                        ) : !fadigaDadosDisponiveis ? (
                          <Typography sx={{ fontSize: '0.76rem', color: '#f0b4b4', fontWeight: 700, width: '100%', minWidth: 0 }}>Fadiga indisponível</Typography>
                        ) : (
                          <ResourceCardContent>
                            <ResourceInfoRow>
                              <ResourceInfoLabel>Atual/Máxima</ResourceInfoLabel>
                              <ResourceInfoValue>{fadigaAtual} / {fadigaMaxima}</ResourceInfoValue>
                            </ResourceInfoRow>
                            <ResourceInfoRow>
                              <ResourceInfoLabel>Custo</ResourceInfoLabel>
                              <ResourceInfoValue>{custoFadiga} pts</ResourceInfoValue>
                            </ResourceInfoRow>
                            <ResourceInfoRow>
                              <ResourceInfoLabel>Após uso</ResourceInfoLabel>
                              <ResourceInfoValue>{fadigaAposUso} / {fadigaMaxima}</ResourceInfoValue>
                            </ResourceInfoRow>
                            <Box sx={{ display: 'grid', gap: 0.45, width: '100%', minWidth: 0 }}>
                              <ResourceProgressTrack>
                                <ResourceProgressFill sx={{ width: `${fadigaPercentualBarra}%`, background: fadigaSuficiente ? 'linear-gradient(90deg, rgba(45, 212, 191, 0.9), rgba(16, 185, 129, 0.9))' : 'linear-gradient(90deg, rgba(248, 113, 113, 0.9), rgba(220, 38, 38, 0.9))' }} />
                              </ResourceProgressTrack>
                              <ResourceInfoRow sx={{ fontSize: '0.68rem', color: '#dfe4ff' }}>
                                <ResourceInfoLabel sx={{ fontSize: '0.68rem', color: '#dfe4ff' }}>Disponibilidade</ResourceInfoLabel>
                                <ResourceInfoValue sx={{ fontSize: '0.68rem', color: '#f4dda2' }}>{Math.round(fadigaPercentualBarra)}%</ResourceInfoValue>
                              </ResourceInfoRow>
                            </Box>
                          </ResourceCardContent>
                        )}
                        {!carregando && fadigaDadosDisponiveis && (
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', minWidth: 0 }}>
                            <ResourceStatusPill sx={{ background: fadigaSuficiente ? 'rgba(16, 185, 129, 0.12)' : 'rgba(127, 29, 29, 0.2)', border: `1px solid ${fadigaSuficiente ? 'rgba(45, 212, 191, 0.4)' : 'rgba(248, 113, 113, 0.5)'}`, color: fadigaSuficiente ? '#b8f0d4' : '#ffb4b4' }}>
                              {fadigaStatusMensagem}
                            </ResourceStatusPill>
                          </Box>
                        )}
                      </ResourceSelectCard>
                    </Box>
                  </Box>
                </SectionBody>
              </SectionCard>

              <SectionCard>
                <SectionHeader>
                  <BoltIcon fontSize="small" />
                  Resumo do Cálculo
                </SectionHeader>
                <SectionBody>
                  <Box sx={{ display: 'grid', gap: 1.5 }}>
                    <SummaryRow>
                      <SummaryLabel>
                        <AutoFixHighIcon fontSize="small" sx={{ color: '#f4dda2' }} />
                        {contextConfig.resumoValorLabel}
                      </SummaryLabel>
                      <SummaryValue>{valorBaseAtual}</SummaryValue>
                    </SummaryRow>
                    <SummaryRow>
                      <SummaryLabel>
                        <AutoFixHighIcon fontSize="small" sx={{ color: '#f4dda2' }} />
                        Bônus da arte
                      </SummaryLabel>
                      <SummaryValue>{bonusArte}</SummaryValue>
                    </SummaryRow>
                    <SummaryRow>
                      <SummaryLabel>
                        <EmojiEventsIcon fontSize="small" sx={{ color: '#f4dda2' }} />
                        Bônus do item
                      </SummaryLabel>
                      <SummaryValue>{bonusItem}</SummaryValue>
                    </SummaryRow>
                    <SummaryRow>
                      <SummaryLabel>
                        <BoltIcon fontSize="small" sx={{ color: '#f4dda2' }} />
                        Bônus extra
                      </SummaryLabel>
                      <SummaryValue>{Number(form.bonusExtra || 0)}</SummaryValue>
                    </SummaryRow>
                    <SummaryRow>
                      <SummaryLabel>
                        <CasinoIcon fontSize="small" sx={{ color: '#f4dda2' }} />
                        {contextConfig.resumoPotencialBaseLabel}
                      </SummaryLabel>
                      <SummaryValue>{potencialBase}</SummaryValue>
                    </SummaryRow>
                    <SummaryRow>
                      <SummaryLabel>
                        <AutoFixHighIcon fontSize="small" sx={{ color: '#f4dda2' }} />
                        Aumento de Potencial
                      </SummaryLabel>
                      <SummaryValue>{`+${aumentoPotencial} (${form.potencializacao}%)`}</SummaryValue>
                    </SummaryRow>
                  </Box>

                  <FinalSummaryHighlight>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                      <AutoFixHighIcon sx={{ color: '#f8d9c8' }} />
                      Potencial final
                    </Box>
                    <ResultValue sx={{ fontSize: '1.75rem', color: '#f8d9c8', textShadow: '0 0 16px rgba(232, 203, 133, 0.3)' }}>{potencialFinal}</ResultValue>
                  </FinalSummaryHighlight>
                </SectionBody>
              </SectionCard>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
              <SectionCard sx={{ flex: '0 0 auto' }}>
                <SectionHeader>
                  <CasinoIcon fontSize="small" />
                  Prévia dos Dados
                </SectionHeader>
                <SectionBody>
                  <Box sx={{ display: 'grid', gap: 1.5 }}>
                    <SummaryRow>
                      <SummaryLabel>Potencial-base</SummaryLabel>
                      <SummaryValueWithMeta>
                        <span>{preview?.potencialBase ?? potencialBase}</span>
                        <FinalValueMeta> (Final: {potencialFinal}) </FinalValueMeta>
                      </SummaryValueWithMeta>
                    </SummaryRow>
                    <SummaryRow>
                      <SummaryLabel>Aumento de Potencial</SummaryLabel>
                      <SummaryValue>{`+${preview?.aumentoPotencial ?? aumentoPotencial} (${form.potencializacao}%)`}</SummaryValue>
                    </SummaryRow>
                    <SummaryRow>
                      <SummaryLabel>Roll</SummaryLabel>
                      <SummaryValue>{perfilRoll}</SummaryValue>
                    </SummaryRow>
                    <SummaryRow>
                      <SummaryLabel>{contextConfig.resumoDanoFixo}</SummaryLabel>
                      <SummaryValue>{`+${danoFixo}`}</SummaryValue>
                    </SummaryRow>
                  </Box>

                  <HighlightValue>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                      <CasinoIcon sx={{ color: '#f8d9c8' }} />
                      Rolling
                    </Box>
                    <ResultValue>{rollingTexto}</ResultValue>
                  </HighlightValue>
                </SectionBody>
              </SectionCard>

              <SectionCard sx={{ flex: '1 1 auto', minHeight: 0 }}>
                <SectionHeader>
                  <EmojiEventsIcon fontSize="small" />
                  Combinações Salvas
                </SectionHeader>
                <SectionBody sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: '1 1 auto' }}>
                  {carregando ? (
                    <Typography variant="body2" sx={{ color: '#c9c7d8' }}>Carregando combinações...</Typography>
                  ) : combos.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#c9c7d8' }}>Nenhuma combinação salva.</Typography>
                  ) : (
                    <ComboListScroller>
                      {combos.map(combo => {
                        const comboResourceType = getResourceTypeForCombo(combo);
                        const comboResourceLabel = comboResourceType === 'saude' ? 'Saúde' : comboResourceType === 'fadiga' ? 'Fadiga' : 'Energia';

                        return (
                          <ComboCard key={combo.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0 }}>
                              <Box sx={{ fontWeight: 800, color: '#f4dda2', letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{combo.nome}</Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                <Box sx={{ borderRadius: 999, px: 1, py: 0.35, fontSize: '0.7rem', fontWeight: 700, color: '#f0d9a6', background: 'rgba(232, 203, 133, 0.08)', border: '1px solid rgba(232, 203, 133, 0.24)', maxWidth: '100%', wordBreak: 'break-word' }}>
                                  {getTipoDanoLabel(combo.tipoDano ?? 'Contundente', contexto)}
                                </Box>
                                <ResourceBadge variant={comboResourceType === 'saude' ? 'saude' : comboResourceType === 'fadiga' ? 'fadiga' : 'energia'}>
                                  {comboResourceType === 'saude' ? <FavoriteIcon fontSize="inherit" sx={{ fontSize: '0.7rem' }} /> : comboResourceType === 'fadiga' ? <ShieldIcon fontSize="inherit" sx={{ fontSize: '0.7rem' }} /> : <BoltIcon fontSize="inherit" sx={{ fontSize: '0.7rem' }} />}
                                  {comboResourceLabel}
                                </ResourceBadge>
                              </Box>
                            </Box>

                            <ComboDetails>
                            <DetailLine>
                              <span>Rolling</span>
                              <DetailValue>{formatarRollingCombo(combo)}</DetailValue>
                            </DetailLine>
                            <DetailLine>
                              <span>Potencial total</span>
                              <DetailValue>{Number(combo?.potencialFinal ?? combo?.potencialBase ?? 0)}</DetailValue>
                            </DetailLine>
                            <DetailLine>
                              <span>Potencialização</span>
                              <DetailValue>{Number(combo?.potencializacao ?? 0)}%</DetailValue>
                            </DetailLine>
                            <DetailLine>
                              <span>Recurso</span>
                              <DetailValue>{getResourceTypeForCombo(combo) === 'ambos' ? 'Energia + Fadiga' : getResourceTypeForCombo(combo) === 'saude' ? 'Saúde' : getResourceTypeForCombo(combo) === 'fadiga' ? 'Fadiga' : 'Energia'}</DetailValue>
                            </DetailLine>
                            <DetailLine>
                              <span>Custo</span>
                              <DetailValue>{obterCustoSelecionado(combo)} pts</DetailValue>
                            </DetailLine>
                          </ComboDetails>

                          <ComboActions>
                            <TinyActionButton size="small" onClick={() => handleSelecionarCombo(combo)}>Selecionar</TinyActionButton>
                            <TinyDangerButton size="small" onClick={() => handleExcluirCombo(combo)}>Excluir</TinyDangerButton>
                            <UseComboButton
                              size="small"
                              type="button"
                              onClick={() => handleUsarCombo(combo)}
                              disabled={processandoUsoComboId === combo.id || ((getResourceTypeForCombo(combo) === 'energia' || getResourceTypeForCombo(combo) === 'ambos') && (!energiaDadosDisponiveis || energiaAtual < obterCustoCombo(combo))) || ((getResourceTypeForCombo(combo) === 'fadiga' || getResourceTypeForCombo(combo) === 'ambos') && (!fadigaDadosDisponiveis || fadigaAtual < obterCustoFadigaCombo(combo))) || ((getResourceTypeForCombo(combo) === 'saude' || getResourceTypeForCombo(combo) === 'ambos') && (!saudeDadosDisponiveis || saudeAtual < obterCustoSaudeCombo(combo)))}
                            >
                              {processandoUsoComboId === combo.id ? 'Processando...' : 'USAR'}
                            </UseComboButton>
                          </ComboActions>
                          </ComboCard>
                        );
                      })}
                    </ComboListScroller>
                  )}
                </SectionBody>
              </SectionCard>
            </Box>
          </BoardGrid>

          {(notificacaoUso || erro) && (
            <ToastStack>
              {notificacaoUso && (
                <ToastAlert severity="success" sx={{ borderRadius: 2 }}>
                  {notificacaoUso}
                </ToastAlert>
              )}
              {erro && (
                <ToastAlert severity="error" sx={{ borderRadius: 2 }}>
                  {erro}
                </ToastAlert>
              )}
            </ToastStack>
          )}
        </ModalBody>
      </DialogContent>

      <ConfirmDialog
        open={Boolean(comboEmUso)}
        onClose={() => setComboEmUso(null)}
        aria-labelledby="confirmar-uso-titulo"
        maxWidth="sm"
        fullWidth
      >
        <ConfirmHeader>
          <Box sx={{ display: 'grid', gap: 4 }}>
            <ConfirmTitleText id="confirmar-uso-titulo">UTILIZAR COMBINAÇÃO</ConfirmTitleText>
            <ConfirmSubtitle>Confirmar uso</ConfirmSubtitle>
          </Box>
        </ConfirmHeader>

        <DialogContent sx={{ padding: 0 }}>
          <ConfirmBody>
            <ConfirmSummaryCard>
              <ComboIdentityName>{comboEmUso?.combo?.nome}</ComboIdentityName>
              <ComboMetaRow>
                <ComboMetaPill>{formatarRollingCombo(comboEmUso?.combo)}</ComboMetaPill>
                <ComboMetaPill>{Number(comboEmUso?.combo?.potencializacao ?? 0)}% potencialização</ComboMetaPill>
              </ComboMetaRow>
            </ConfirmSummaryCard>

            <ConfirmSection>
              <ConfirmSectionHeader>
                <span>Recurso do uso</span>
                <span>{comboEmUso?.resourceType === 'ambos' ? 'Energia + Fadiga' : comboEmUso?.resourceType === 'saude' ? 'Saúde' : comboEmUso?.resourceType === 'fadiga' ? 'Fadiga' : 'Energia'}</span>
              </ConfirmSectionHeader>

              <ConfirmResourcePanel tone={comboEmUso?.resourceType === 'saude' ? 'saude' : comboEmUso?.resourceType === 'fadiga' ? 'fadiga' : 'energia'}>
                <ConfirmResourceBadge tone={comboEmUso?.resourceType === 'saude' ? 'saude' : comboEmUso?.resourceType === 'fadiga' ? 'fadiga' : 'energia'}>
                  {comboEmUso?.resourceType === 'saude' ? '♥ Saúde' : comboEmUso?.resourceType === 'fadiga' ? '◈ Fadiga' : '⚡ Energia'}
                </ConfirmResourceBadge>

                <ConfirmResourceGrid>
                  <ConfirmResourceStat>
                    <ConfirmResourceStatLabel>Atual</ConfirmResourceStatLabel>
                    <ConfirmResourceStatValue>
                      {comboEmUso?.resourceType === 'saude'
                        ? `${comboEmUso?.saudeAtual ?? saudeAtual}/${comboEmUso?.saudeMaxima ?? saudeMaxima}`
                        : comboEmUso?.resourceType === 'fadiga'
                          ? `${comboEmUso?.fadigaAtual ?? fadigaAtual}/${comboEmUso?.fadigaMaxima ?? fadigaMaxima}`
                          : `${comboEmUso?.energiaAtual ?? energiaAtual}/${comboEmUso?.energiaMaxima ?? energiaMaxima}`}
                    </ConfirmResourceStatValue>
                  </ConfirmResourceStat>

                  <ConfirmResourceStat>
                    <ConfirmResourceStatLabel>Custo</ConfirmResourceStatLabel>
                    <ConfirmResourceStatValue>
                      {comboEmUso?.resourceType === 'saude'
                        ? `${comboEmUso?.custoSaude ?? 0}`
                        : comboEmUso?.resourceType === 'fadiga'
                          ? `${comboEmUso?.custoFadiga ?? 0}`
                          : `${comboEmUso?.custo ?? 0}`}
                    </ConfirmResourceStatValue>
                  </ConfirmResourceStat>

                  <ConfirmResourceStat>
                    <ConfirmResourceStatLabel>Após uso</ConfirmResourceStatLabel>
                    <ConfirmResourceStatValue>
                      {comboEmUso?.resourceType === 'saude'
                        ? `${comboEmUso?.saudeRestante ?? saudeAtual}/${comboEmUso?.saudeMaxima ?? saudeMaxima}`
                        : comboEmUso?.resourceType === 'fadiga'
                          ? `${comboEmUso?.fadigaRestante ?? fadigaAtual}/${comboEmUso?.fadigaMaxima ?? fadigaMaxima}`
                          : `${comboEmUso?.energiaRestante ?? energiaAtual}/${comboEmUso?.energiaMaxima ?? energiaMaxima}`}
                    </ConfirmResourceStatValue>
                  </ConfirmResourceStat>
                </ConfirmResourceGrid>
              </ConfirmResourcePanel>
            </ConfirmSection>

            <ConfirmSection>
              <ConfirmSectionHeader>
                <span>Detalhes da combinação</span>
              </ConfirmSectionHeader>

              <ConfirmInfoGrid>
                <ConfirmInfoRow>
                  <ConfirmInfoLabel>Rolling</ConfirmInfoLabel>
                  <ConfirmInfoValue>{formatarRollingCombo(comboEmUso?.combo)}</ConfirmInfoValue>
                </ConfirmInfoRow>
                <ConfirmInfoRow>
                  <ConfirmInfoLabel>Potencialização</ConfirmInfoLabel>
                  <ConfirmInfoValue>{Number(comboEmUso?.combo?.potencializacao ?? 0)}%</ConfirmInfoValue>
                </ConfirmInfoRow>
                <ConfirmInfoRow>
                  <ConfirmInfoLabel>Recurso selecionado</ConfirmInfoLabel>
                  <ConfirmInfoValue>
                    {comboEmUso?.resourceType === 'ambos' ? 'Energia + Fadiga' : comboEmUso?.resourceType === 'saude' ? 'Saúde' : comboEmUso?.resourceType === 'fadiga' ? 'Fadiga' : 'Energia'}
                  </ConfirmInfoValue>
                </ConfirmInfoRow>
              </ConfirmInfoGrid>
            </ConfirmSection>

            <ConfirmCompactSummary>
              {comboEmUso?.resourceType === 'saude' ? (
                <ConfirmCompactRow>
                  <span>Saúde após utilização:</span>
                  <strong>{`${comboEmUso?.saudeRestante ?? saudeAtual}/${comboEmUso?.saudeMaxima ?? saudeMaxima}`}</strong>
                </ConfirmCompactRow>
              ) : (
                <>
                  <ConfirmCompactRow>
                    <span>Energia após utilização:</span>
                    <strong>{`${comboEmUso?.energiaRestante ?? energiaAtual}/${comboEmUso?.energiaMaxima ?? energiaMaxima}`}</strong>
                  </ConfirmCompactRow>
                  <ConfirmCompactRow>
                    <span>Fadiga após utilização:</span>
                    <strong>{`${comboEmUso?.fadigaRestante ?? fadigaAtual}/${comboEmUso?.fadigaMaxima ?? fadigaMaxima}`}</strong>
                  </ConfirmCompactRow>
                </>
              )}
            </ConfirmCompactSummary>

            <ConfirmNote>
              Esta ação consumirá recursos do personagem de acordo com o valor calculado pela combinação selecionada.
            </ConfirmNote>
          </ConfirmBody>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setComboEmUso(null)} color="inherit" sx={{ color: '#dfe4ff', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(17, 17, 25, 0.8)' }}>
            Cancelar
          </Button>
          <Button
            onClick={confirmarUsoCombo}
            variant="contained"
            disabled={processandoUsoComboId !== ''}
            sx={{
              background: 'linear-gradient(135deg, rgba(232, 203, 133, 0.98), rgba(170, 143, 77, 0.94))',
              color: '#120e19',
              border: '1px solid rgba(232, 203, 133, 0.8)',
              boxShadow: '0 0 16px rgba(232, 203, 133, 0.18)',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              minWidth: 170,
            }}
          >
            Confirmar uso
          </Button>
        </DialogActions>
      </ConfirmDialog>

      <DarkDialog
        open={confirmarNovaCombinacao}
        onClose={() => setConfirmarNovaCombinacao(false)}
        aria-labelledby="confirmar-nova-combinacao-titulo"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="confirmar-nova-combinacao-titulo">Nova combinação</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#dfe4ff' }}>
            Existem alterações não salvas. Deseja iniciar uma nova combinação?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setConfirmarNovaCombinacao(false)} color="inherit">Cancelar</Button>
          <Button
            onClick={() => {
              resetAttackCombinationForm({
                setForm,
                setSelectedComboId,
                setResourceSelecionada,
                setErro,
                setComboEmUso,
                setComboEmExclusao,
                setNotificacaoUso,
                setConfirmarNovaCombinacao,
              });
            }}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, rgba(232, 203, 133, 0.98), rgba(170, 143, 77, 0.94))',
              color: '#120e19',
              border: '1px solid rgba(232, 203, 133, 0.8)',
              boxShadow: '0 0 16px rgba(232, 203, 133, 0.18)',
              fontWeight: 800,
            }}
          >
            Criar nova
          </Button>
        </DialogActions>
      </DarkDialog>

      <DarkDialog
        open={Boolean(comboEmExclusao)}
        onClose={() => setComboEmExclusao(null)}
        aria-labelledby="confirmar-exclusao-titulo"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="confirmar-exclusao-titulo">Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#dfe4ff' }}>
            Deseja excluir a combinação salva selecionada? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setComboEmExclusao(null)} color="inherit">Cancelar</Button>
          <Button onClick={confirmarExclusaoCombo} color="error" variant="contained">Confirmar</Button>
        </DialogActions>
      </DarkDialog>

      <ActionFooter>
        <Button onClick={onClose} variant="contained" color="inherit" sx={{ minWidth: 120, background: 'rgba(17, 17, 25, 0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#e8e8ef' }}>
          Fechar
        </Button>
        <Button
          variant="contained"
          onClick={handleSalvar}
          sx={{
            minWidth: 160,
            background: 'linear-gradient(135deg, rgba(232, 203, 133, 0.98), rgba(170, 143, 77, 0.94))',
            color: '#120e19',
            border: '1px solid rgba(232, 203, 133, 0.85)',
            boxShadow: '0 0 20px rgba(162, 24, 38, 0.45)',
          }}
        >
          Salvar
        </Button>
      </ActionFooter>
    </StyledDialog>
    </>
  );
};

CalculadoraAtaqueModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func,
};

CalculadoraAtaqueModal.defaultProps = {
  onSave: null,
};

export default CalculadoraAtaqueModal;
