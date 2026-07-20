import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { StatusValueRow } from '../styles';

const DesbloquearNoDialog = ({ open, no, cadeia, custoTotal, pcDisponivel, onClose, onConfirmar }) => {
  const semSaldo = custoTotal > pcDisponivel;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{no?.nome ?? 'Nó'}</DialogTitle>
      <DialogContent>
        {cadeia.length === 0 ? (
          <StatusValueRow>Este nó já está desbloqueado.</StatusValueRow>
        ) : (
          <>
            <StatusValueRow style={{ display: 'block' }}>
              {cadeia.length > 1
                ? `Desbloquear este nó exige desbloquear ${cadeia.length} nós no caminho até a raiz (incluindo ele).`
                : 'Desbloquear este nó.'}
            </StatusValueRow>
            <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
              Custo total: {custoTotal} PC
            </StatusValueRow>
            <StatusValueRow
              style={{ display: 'block', color: semSaldo ? '#f87171' : 'var(--color-accent)' }}
            >
              PC disponível: {pcDisponivel}
              {semSaldo && ' — insuficiente'}
            </StatusValueRow>
            {no?.bonusAtributo?.atributo && (
              <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
                Bônus do nó: +{no.bonusAtributo.valor} {no.bonusAtributo.atributo}
              </StatusValueRow>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        {cadeia.length > 0 && (
          <Button variant="contained" disabled={semSaldo} onClick={onConfirmar}>
            Desbloquear
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

DesbloquearNoDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  no: PropTypes.object,
  cadeia: PropTypes.array.isRequired,
  custoTotal: PropTypes.number.isRequired,
  pcDisponivel: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirmar: PropTypes.func.isRequired,
};

DesbloquearNoDialog.defaultProps = {
  no: null,
};

export default DesbloquearNoDialog;
