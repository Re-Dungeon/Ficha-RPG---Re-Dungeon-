import React from 'react';
import PropTypes from 'prop-types';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';

import {
  AcaoIconButton,
  TabelaAcoes,
  TabelaAptidaoNome,
  TabelaBonus,
  TabelaNivel,
  TabelaRow,
} from './styles';

const AptidaoRow = ({ nome, nivel, nivelMaximo, bonus, limiteAtingido, onUpgrade, onReset, onRemover }) => (
  <TabelaRow>
    <TabelaAptidaoNome>{nome}</TabelaAptidaoNome>
    <TabelaNivel>
      {nivel} / {nivelMaximo}
    </TabelaNivel>
    <TabelaBonus>+{bonus}</TabelaBonus>
    <TabelaAcoes>
      <AcaoIconButton
        type="button"
        aria-label={`Upar ${nome}`}
        disabled={nivel >= nivelMaximo || limiteAtingido}
        onClick={onUpgrade}
      >
        <ArrowUpwardIcon fontSize="inherit" />
      </AcaoIconButton>
      <AcaoIconButton type="button" aria-label={`Resetar ${nome}`} disabled={nivel === 0} onClick={onReset}>
        <RefreshIcon fontSize="inherit" />
      </AcaoIconButton>
      <AcaoIconButton type="button" aria-label={`Remover ${nome}`} $variante="vermelho" onClick={onRemover}>
        <CloseIcon fontSize="inherit" />
      </AcaoIconButton>
    </TabelaAcoes>
  </TabelaRow>
);

AptidaoRow.propTypes = {
  nome: PropTypes.string.isRequired,
  nivel: PropTypes.number.isRequired,
  nivelMaximo: PropTypes.number.isRequired,
  bonus: PropTypes.number.isRequired,
  limiteAtingido: PropTypes.bool.isRequired,
  onUpgrade: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onRemover: PropTypes.func.isRequired,
};

export default AptidaoRow;
