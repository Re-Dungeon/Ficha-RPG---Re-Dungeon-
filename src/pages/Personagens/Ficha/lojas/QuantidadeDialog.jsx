import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

import { StatusValueRow } from '../styles';

const StyledDialogContent = styled(DialogContent)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 24px 16px;
  text-align: center;
`;

const StyledDialogActions = styled(DialogActions)`
  justify-content: center;
  gap: 12px;
  padding: 16px 24px 22px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const NomeItem = styled(StatusValueRow)`
  display: block;
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-primary);
  margin-bottom: 4px;
`;

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
      <DialogTitle sx={{ textAlign: 'center' }}>{titulo}</DialogTitle>
      <StyledDialogContent>
        <NomeItem>{nomeItem}</NomeItem>
        <TextField
          type="number"
          label="Quantidade"
          size="small"
          value={quantidade}
          onChange={event => setQuantidade(Math.min(max, Math.max(1, Number(event.target.value) || 1)))}
          slotProps={{ htmlInput: { min: 1, max } }}
          sx={{ width: '100%', maxWidth: 200 }}
        />
        <StatusValueRow style={{ display: 'block', marginTop: 0 }}>
          {precoLabel} unitário: {precoUnitario} Rokmas · Total: {total} Rokmas
        </StatusValueRow>
        <StatusValueRow style={{ display: 'block', marginTop: 0 }}>Máximo: {max}</StatusValueRow>
      </StyledDialogContent>
      <StyledDialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={max <= 0} onClick={() => onConfirmar(quantidade)}>
          {acaoLabel}
        </Button>
      </StyledDialogActions>
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
