import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

const DefinirRokmasDialog = ({ open, saldoAtual, onConfirmar, onClose }) => {
  const [valor, setValor] = useState(saldoAtual);

  useEffect(() => {
    if (open) {
      setValor(saldoAtual);
    }
  }, [open, saldoAtual]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Definir Rokmas</DialogTitle>
      <DialogContent>
        <TextField
          type="number"
          label="Novo saldo de Rokmas"
          size="small"
          fullWidth
          value={valor}
          onChange={event => setValor(Math.max(0, Number(event.target.value) || 0))}
          slotProps={{ htmlInput: { min: 0 } }}
          sx={{ marginTop: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={() => onConfirmar(valor)}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DefinirRokmasDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  saldoAtual: PropTypes.number.isRequired,
  onConfirmar: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DefinirRokmasDialog;
