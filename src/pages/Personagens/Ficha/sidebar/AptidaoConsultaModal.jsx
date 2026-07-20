import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { getAptidoesPorUniverso } from 'service/storage';
import { getNome } from 'common/utils/resolveNome';

import { StatusValueRow } from '../styles';

const AptidaoConsultaModal = ({ open, onClose, personagem }) => {
  const [catalogo, setCatalogo] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    if (!personagem.universo) {
      setCatalogo([]);
      return undefined;
    }
    let isMounted = true;
    getAptidoesPorUniverso(personagem.universo).then(itens => {
      if (isMounted) {
        setCatalogo(itens);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [open, personagem.universo]);

  useEffect(() => {
    if (open) {
      setBusca('');
    }
  }, [open]);

  const catalogoFiltrado = catalogo.filter(item =>
    getNome(item).toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Aptidões do Universo</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar aptidão..."
          value={busca}
          onChange={event => setBusca(event.target.value)}
          sx={{ marginBottom: 2, marginTop: 1 }}
        />

        {!personagem.universo && (
          <StatusValueRow style={{ display: 'block' }}>
            Selecione um Universo no menu lateral Info primeiro.
          </StatusValueRow>
        )}

        {personagem.universo && catalogoFiltrado.length === 0 && (
          <StatusValueRow style={{ display: 'block' }}>Nenhuma aptidão encontrada.</StatusValueRow>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
          {catalogoFiltrado.map(item => {
            const vantagens = [...(item.vantagens ?? [])].sort((a, b) => a.nivel - b.nivel);
            return (
              <Accordion
                key={item.id}
                sx={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                  '&::before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text-secondary)' }} />}>
                  {getNome(item)} {item.nivelMaximo ? `(máx. nível ${item.nivelMaximo})` : ''}
                </AccordionSummary>
                <AccordionDetails style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {item.descricao && (
                    <StatusValueRow style={{ display: 'block', color: 'var(--text-secondary)' }}>
                      {item.descricao}
                    </StatusValueRow>
                  )}
                  {vantagens.map(vantagem => (
                    <StatusValueRow key={vantagem.nivel} style={{ display: 'block' }}>
                      Nível {vantagem.nivel}: {vantagem.texto}
                    </StatusValueRow>
                  ))}
                  {vantagens.length === 0 && !item.descricao && (
                    <StatusValueRow>Sem detalhes cadastrados.</StatusValueRow>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

AptidaoConsultaModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
};

export default AptidaoConsultaModal;
