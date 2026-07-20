import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

const AjusteGanhasDialog = ({ open, titulo, onClose, onConfirm }) => {
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    if (open) {
      setQuantidade(1);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        <TextField
          type="number"
          label="Quantidade (1-9)"
          size="small"
          fullWidth
          value={quantidade}
          onChange={event =>
            setQuantidade(Math.min(9, Math.max(1, Number(event.target.value) || 1)))
          }
          sx={{ marginTop: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={() => onConfirm(quantidade)}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AjusteGanhasDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  titulo: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default AjusteGanhasDialog;
