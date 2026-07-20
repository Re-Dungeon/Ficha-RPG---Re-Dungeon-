import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

import { StatusValueRow } from '../styles';

const GerenciarAptidoesDialog = ({ open, onClose, catalogo, idsAdquiridos, limite, onConfirm }) => {
  const [selecionados, setSelecionados] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    if (open) {
      setSelecionados([]);
      setBusca('');
    }
  }, [open]);

  const disponiveis = catalogo.filter(item => !idsAdquiridos.includes(item.id));
  const filtrados = disponiveis.filter(item =>
    (item.Nome ?? '').toLowerCase().includes(busca.toLowerCase()),
  );

  const toggle = id => {
    setSelecionados(current => {
      if (current.includes(id)) {
        return current.filter(item => item !== id);
      }
      if (current.length >= limite) {
        return current;
      }
      return [...current, id];
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Gerenciar Aptidões ({selecionados.length}/{limite})
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar aptidão..."
          value={busca}
          onChange={event => setBusca(event.target.value)}
          sx={{ marginBottom: 2, marginTop: 1 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
          {filtrados.map(item => {
            const selecionado = selecionados.includes(item.id);
            const bloqueado = !selecionado && selecionados.length >= limite;
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  border: `1px solid ${selecionado ? 'var(--color-accent)' : 'var(--border-primary)'}`,
                  borderRadius: 8,
                }}
              >
                <span>{item.Nome}</span>
                <Button
                  size="small"
                  variant={selecionado ? 'contained' : 'outlined'}
                  disabled={bloqueado}
                  onClick={() => toggle(item.id)}
                >
                  {selecionado ? 'Selecionada' : bloqueado ? '🔒 Limite atingido' : 'Selecionar'}
                </Button>
              </div>
            );
          })}
          {filtrados.length === 0 && <StatusValueRow>Nenhuma aptidão disponível.</StatusValueRow>}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={selecionados.length === 0}
          onClick={() => onConfirm(selecionados)}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

GerenciarAptidoesDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  catalogo: PropTypes.array.isRequired,
  idsAdquiridos: PropTypes.array.isRequired,
  limite: PropTypes.number.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default GerenciarAptidoesDialog;
