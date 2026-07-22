import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import {
  VeiaAvisoInsuficiente,
  VeiaBloquearBotao,
  VeiaDesbloquearBotao,
  VeiaDialogBody,
  VeiaDialogFechar,
  VeiaDialogHeader,
  VeiaDialogTitulo,
  VeiaEstadoBadge,
  VeiaEstadoRow,
  VeiaSecaoLabel,
  VeiaSecaoTexto,
  VeiaStatCell,
  VeiaStatDivisor,
  VeiaStatLabel,
  VeiaStatValor,
  VeiaStatsRow,
} from './styles';

const DesbloquearNoDialog = ({
  open,
  no,
  cor,
  jaDesbloqueado,
  cadeia,
  custoTotal,
  cadeiaBloqueio,
  custoRecuperado,
  pcDisponivel,
  onClose,
  onDesbloquear,
  onBloquear,
}) => {
  const semSaldo = custoTotal > pcDisponivel;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          style: {
            background: 'var(--bg-secondary)',
            border: `1px solid ${cor}`,
            boxShadow: `0 0 28px ${cor}40`,
            borderRadius: 14,
          },
        },
      }}
    >
      <VeiaDialogHeader $cor={cor}>
        <VeiaDialogTitulo $cor={cor}>{no?.nome ?? 'Veia'}</VeiaDialogTitulo>
        <VeiaDialogFechar type="button" aria-label="Fechar" $cor={cor} onClick={onClose}>
          <CloseIcon fontSize="small" />
        </VeiaDialogFechar>
      </VeiaDialogHeader>

      <VeiaDialogBody>
        {no?.descricao && (
          <div>
            <VeiaSecaoLabel>Descrição</VeiaSecaoLabel>
            <VeiaSecaoTexto>{no.descricao}</VeiaSecaoTexto>
          </div>
        )}

        {no?.aprimoramento && (
          <div>
            <VeiaSecaoLabel>Aprimoramento</VeiaSecaoLabel>
            <VeiaSecaoTexto>{no.aprimoramento}</VeiaSecaoTexto>
          </div>
        )}

        <VeiaStatsRow>
          <VeiaStatCell>
            <VeiaStatLabel>Custo</VeiaStatLabel>
            <VeiaStatValor $cor="var(--color-accent)">{jaDesbloqueado ? no?.custo ?? 0 : custoTotal} PC</VeiaStatValor>
          </VeiaStatCell>
          <VeiaStatDivisor />
          <VeiaStatCell>
            <VeiaStatLabel>Nível atual</VeiaStatLabel>
            <VeiaStatValor>{no?.nivel ?? '-'}</VeiaStatValor>
          </VeiaStatCell>
        </VeiaStatsRow>

        {!jaDesbloqueado && cadeia.length > 1 && (
          <VeiaSecaoTexto style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Inclui {cadeia.length - 1} veia(s) de requisito ainda bloqueada(s) no caminho até a raiz.
          </VeiaSecaoTexto>
        )}

        {jaDesbloqueado && cadeiaBloqueio.length > 1 && (
          <VeiaSecaoTexto style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Bloquear esta veia também bloqueia {cadeiaBloqueio.length - 1} veia(s) que dependem dela, devolvendo{' '}
            {custoRecuperado} PC no total.
          </VeiaSecaoTexto>
        )}

        <VeiaEstadoRow>
          <span>Estado:</span>
          <VeiaEstadoBadge $cor={cor}>
            {jaDesbloqueado ? <LockOpenIcon fontSize="inherit" /> : <LockIcon fontSize="inherit" />}
            {jaDesbloqueado ? 'Desbloqueado' : 'Bloqueado'}
          </VeiaEstadoBadge>
        </VeiaEstadoRow>

        {jaDesbloqueado ? (
          <VeiaBloquearBotao type="button" onClick={onBloquear}>
            <LockIcon fontSize="inherit" />
            Bloquear
          </VeiaBloquearBotao>
        ) : (
          <>
            <VeiaDesbloquearBotao type="button" disabled={semSaldo} onClick={onDesbloquear}>
              <LockOpenIcon fontSize="inherit" />
              Desbloquear
            </VeiaDesbloquearBotao>
            {semSaldo && (
              <VeiaAvisoInsuficiente>PC insuficiente — disponível: {pcDisponivel}</VeiaAvisoInsuficiente>
            )}
          </>
        )}
      </VeiaDialogBody>
    </Dialog>
  );
};

DesbloquearNoDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  no: PropTypes.object,
  cor: PropTypes.string.isRequired,
  jaDesbloqueado: PropTypes.bool.isRequired,
  cadeia: PropTypes.array.isRequired,
  custoTotal: PropTypes.number.isRequired,
  cadeiaBloqueio: PropTypes.array.isRequired,
  custoRecuperado: PropTypes.number.isRequired,
  pcDisponivel: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onDesbloquear: PropTypes.func.isRequired,
  onBloquear: PropTypes.func.isRequired,
};

DesbloquearNoDialog.defaultProps = {
  no: null,
};

export default DesbloquearNoDialog;
