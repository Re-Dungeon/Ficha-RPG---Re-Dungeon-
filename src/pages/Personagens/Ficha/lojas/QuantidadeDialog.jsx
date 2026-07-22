import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

import { StatusValueRow } from '../styles';

// Popup de quantidade reutilizado por Comprar (limitado por saldo + espaço
// livre) e Vender (limitado pela quantidade possuída) — mesma ideia do popup
// de compra do site vanilla (menu-itens-ui.js), mas via MUI Dialog.
const QuantidadeDialog = ({ open, titulo, nomeItem, max, precoUnitario, precoLabel, acaoLabel, onConfirmar, onClose }) => {
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    if (open) {
      setQuantidade(1);
    }
  }, [open]);

  const total = quantidade * precoUnitario;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        <StatusValueRow style={{ display: 'block', fontWeight: 600, marginBottom: 12 }}>{nomeItem}</StatusValueRow>
        <TextField
          type="number"
          label="Quantidade"
          size="small"
          value={quantidade}
          onChange={event => setQuantidade(Math.min(max, Math.max(1, Number(event.target.value) || 1)))}
          slotProps={{ htmlInput: { min: 1, max } }}
          sx={{ width: 160 }}
        />
        <StatusValueRow style={{ display: 'block', marginTop: 12 }}>
          {precoLabel} unitário: {precoUnitario} Rokmas · Total: {total} Rokmas
        </StatusValueRow>
        <StatusValueRow style={{ display: 'block', marginTop: 4 }}>Máximo: {max}</StatusValueRow>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={max <= 0} onClick={() => onConfirmar(quantidade)}>
          {acaoLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

QuantidadeDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  titulo: PropTypes.string.isRequired,
  nomeItem: PropTypes.string.isRequired,
  max: PropTypes.number.isRequired,
  precoUnitario: PropTypes.number.isRequired,
  precoLabel: PropTypes.string.isRequired,
  acaoLabel: PropTypes.string.isRequired,
  onConfirmar: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default QuantidadeDialog;
