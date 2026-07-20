import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

import { getNome } from 'common/utils/resolveNome';

import { StatusValueRow } from '../styles';

const QUALIDADES = ['Comum', 'Raro', 'Épico', 'Lendário', 'Mítico', 'Celestial'];

const AdicionarItemDialog = ({ open, onClose, catalogo, espacoLivre, onAdicionar }) => {
  const [busca, setBusca] = useState('');
  const [qualidade, setQualidade] = useState('');
  const [selecionado, setSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    if (open) {
      setBusca('');
      setQualidade('');
      setSelecionado(null);
      setQuantidade(1);
    }
  }, [open]);

  const filtrados = catalogo.filter(
    item =>
      getNome(item).toLowerCase().includes(busca.toLowerCase()) &&
      (!qualidade || item.qualidade === qualidade),
  );

  const espacoNecessario = selecionado ? (selecionado.espaco ?? 0) * quantidade : 0;
  const cabe = espacoNecessario <= espacoLivre;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Adicionar Item</DialogTitle>
      <DialogContent>
        {!selecionado && (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, marginTop: 4, flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar item..."
                value={busca}
                onChange={event => setBusca(event.target.value)}
                sx={{ flex: 1, minWidth: 160 }}
              />
              <TextField
                select
                size="small"
                label="Qualidade"
                value={qualidade}
                onChange={event => setQualidade(event.target.value)}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="">Todas</MenuItem>
                {QUALIDADES.map(item => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
              {filtrados.map(item => (
                <div
                  key={item.id}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 8 }}
                >
                  <span>
                    {getNome(item)} {item.qualidade ? `· ${item.qualidade}` : ''}
                  </span>
                  <Button size="small" onClick={() => setSelecionado(item)}>
                    Escolher
                  </Button>
                </div>
              ))}
              {filtrados.length === 0 && (
                <StatusValueRow>
                  {catalogo.length === 0
                    ? 'Selecione um Universo no menu lateral Info primeiro.'
                    : 'Nenhum item encontrado.'}
                </StatusValueRow>
              )}
            </div>
          </>
        )}

        {selecionado && (
          <div>
            <StatusValueRow style={{ display: 'block', fontWeight: 600 }}>{getNome(selecionado)}</StatusValueRow>
            <TextField
              type="number"
              label="Quantidade"
              size="small"
              value={quantidade}
              onChange={event => setQuantidade(Math.max(1, Number(event.target.value) || 1))}
              sx={{ marginTop: 2, width: 160 }}
            />
            <StatusValueRow
              style={{ display: 'block', marginTop: 8, color: cabe ? 'var(--text-secondary)' : '#f87171' }}
            >
              Espaço necessário: {espacoNecessario} / {espacoLivre} livre{!cabe && ' — não cabe!'}
            </StatusValueRow>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        {selecionado && <Button onClick={() => setSelecionado(null)}>Voltar</Button>}
        <Button onClick={onClose}>Cancelar</Button>
        {selecionado && (
          <Button
            variant="contained"
            disabled={!cabe}
            onClick={() => {
              onAdicionar(selecionado.id, quantidade);
              onClose();
            }}
          >
            Adicionar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

AdicionarItemDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  catalogo: PropTypes.array.isRequired,
  espacoLivre: PropTypes.number.isRequired,
  onAdicionar: PropTypes.func.isRequired,
};

export default AdicionarItemDialog;
