import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

import { getNome } from 'common/utils/resolveNome';

import { DialogFecharButton, DialogHeaderRow, DialogHeaderTitle } from '../styles';
import {
  COR_GERENCIAR,
  CatalogoCard,
  CatalogoCheckBadge,
  CatalogoGrid,
  CatalogoIcone,
  CatalogoNome,
  StatBar,
  StatCard,
  StatLabel,
  StatValor,
} from './styles';
import { StatusValueRow } from '../styles';

const GerenciarAptidoesDialog = ({
  open,
  onClose,
  catalogo,
  idsAdquiridos,
  limite,
  atual,
  ganhas,
  maximo,
  proximoEm,
  onConfirm,
}) => {
  const [selecionados, setSelecionados] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    if (open) {
      setSelecionados([]);
      setBusca('');
    }
  }, [open]);

  const filtrados = catalogo.filter(item => getNome(item).toLowerCase().includes(busca.toLowerCase()));

  const toggle = id => {
    if (idsAdquiridos.includes(id)) {
      return;
    }
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" aria-labelledby="dialog-titulo-gerenciar-aptidoes">
      <DialogHeaderRow>
        <DialogHeaderTitle id="dialog-titulo-gerenciar-aptidoes">Gerenciar Aptidões</DialogHeaderTitle>
        <TextField
          size="small"
          placeholder="Filtrar..."
          value={busca}
          onChange={event => setBusca(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ flex: 1, maxWidth: 260 }}
        />
        <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </DialogFecharButton>
      </DialogHeaderRow>
      <DialogContent>
        <StatBar style={{ marginBottom: 20, marginTop: 4 }}>
          <StatCard>
            <StatLabel>Atual</StatLabel>
            <StatValor>{atual}</StatValor>
          </StatCard>
          <StatCard>
            <StatLabel>Ganhas</StatLabel>
            <StatValor>{ganhas}</StatValor>
          </StatCard>
          <StatCard>
            <StatLabel>Máximo</StatLabel>
            <StatValor>{maximo}</StatValor>
          </StatCard>
          <StatCard>
            <StatLabel>+1 Atributo</StatLabel>
            <StatValor>{proximoEm}</StatValor>
          </StatCard>
        </StatBar>

        <CatalogoGrid>
          {filtrados.map(item => {
            const adquirida = idsAdquiridos.includes(item.id);
            const selecionado = selecionados.includes(item.id);
            const bloqueado = !adquirida && !selecionado && selecionados.length >= limite;

            return (
              <CatalogoCard
                key={item.id}
                type="button"
                disabled={adquirida || bloqueado}
                $selecionado={selecionado}
                $desabilitado={adquirida || bloqueado}
                onClick={() => toggle(item.id)}
              >
                {adquirida && (
                  <CatalogoCheckBadge>
                    <CheckIcon fontSize="inherit" />
                  </CatalogoCheckBadge>
                )}
                <CatalogoIcone src={item.linkImagem} alt="" />
                <CatalogoNome>{getNome(item)}</CatalogoNome>
              </CatalogoCard>
            );
          })}
          {filtrados.length === 0 && <StatusValueRow>Nenhuma aptidão encontrada.</StatusValueRow>}
        </CatalogoGrid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>
          Cancelar
        </Button>
        <Button
          disabled={selecionados.length === 0}
          onClick={() => onConfirm(selecionados)}
          sx={{
            background: COR_GERENCIAR,
            color: '#1c1830',
            '&:hover': { background: COR_GERENCIAR, filter: 'brightness(1.08)' },
            '&.Mui-disabled': { background: 'rgba(249, 115, 22, 0.25)', color: 'rgba(28, 24, 48, 0.5)' },
          }}
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
  atual: PropTypes.number.isRequired,
  ganhas: PropTypes.number.isRequired,
  maximo: PropTypes.number.isRequired,
  proximoEm: PropTypes.number.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default GerenciarAptidoesDialog;
