import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { getReceitasPorUniverso } from 'service/storage';
import { getNome } from 'common/utils/resolveNome';

import { ReceitaFormBody, receitaEdicaoSchema } from './ReceitaFormDialog';
import ReceitaCatalogoCard from './ReceitaCatalogoCard';
import { RARIDADE_OPTIONS, RECEITA_AUTORAL_INICIAL, extrairCamposReceita } from './constants';
import { ItemsGrid } from './styles';
import { StatusValueRow } from '../styles';

const CriarReceitaDialog = ({ open, onClose, personagem, onCreate }) => {
  const [origem, setOrigem] = useState('autoral');
  const [catalogo, setCatalogo] = useState([]);
  const [busca, setBusca] = useState('');
  const [raridadeFiltro, setRaridadeFiltro] = useState('');
  const [selecionado, setSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    if (!open) {
      return;
    }
    setOrigem('autoral');
    setSelecionado(null);
    setQuantidade(1);
    setBusca('');
    setRaridadeFiltro('');
  }, [open]);

  useEffect(() => {
    if (!open || origem !== 'catalogo' || !personagem.universo) {
      setCatalogo([]);
      return undefined;
    }
    let isMounted = true;
    getReceitasPorUniverso(personagem.universo)
      .then(receitas => {
        if (isMounted) {
          setCatalogo(receitas);
        }
      })
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar catálogo de receitas:', erro);
      });
    return () => {
      isMounted = false;
    };
  }, [open, origem, personagem.universo]);

  const handleAutoralSubmit = async (values, { setSubmitting }) => {
    await onCreate({ origem: 'autoral', receitaId: null, ...values });
    setSubmitting(false);
    onClose();
  };

  const handleEscolherDoCatalogo = receita => {
    setSelecionado(receita);
    setQuantidade(1);
  };

  const handleConfirmarCatalogo = async () => {
    await onCreate({
      origem: 'catalogo',
      receitaId: selecionado.id,
      nome: getNome(selecionado),
      quantidade,
      ...extrairCamposReceita(selecionado),
    });
    onClose();
  };

  const receitasFiltradas = catalogo.filter(
    receita =>
      getNome(receita).toLowerCase().includes(busca.toLowerCase()) &&
      (!raridadeFiltro || receita.raridade === raridadeFiltro),
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={origem === 'autoral' ? 'sm' : 'lg'}>
      <DialogTitle>Adicionar Receita</DialogTitle>

      <Tabs
        value={origem}
        onChange={(_event, novaOrigem) => setOrigem(novaOrigem)}
        variant="fullWidth"
        textColor="inherit"
        slotProps={{ indicator: { style: { backgroundColor: 'var(--color-accent)' } } }}
      >
        <Tab value="autoral" label="Autoral" />
        <Tab value="catalogo" label="Catálogo" />
      </Tabs>

      {origem === 'autoral' && (
        <Formik
          initialValues={RECEITA_AUTORAL_INICIAL}
          validationSchema={receitaEdicaoSchema}
          onSubmit={handleAutoralSubmit}
        >
          {formik => <ReceitaFormBody formik={formik} onClose={onClose} />}
        </Formik>
      )}

      {origem === 'catalogo' && !selecionado && (
        <>
          <DialogContent style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar receita..."
                value={busca}
                onChange={event => setBusca(event.target.value)}
                sx={{ flex: 1, minWidth: 160 }}
              />
              <TextField
                select
                size="small"
                value={raridadeFiltro}
                onChange={event => setRaridadeFiltro(event.target.value)}
                sx={{ minWidth: 180 }}
                slotProps={{ select: { displayEmpty: true } }}
              >
                <MenuItem value="">Todas as Raridades</MenuItem>
                {RARIDADE_OPTIONS.map(raridade => (
                  <MenuItem key={raridade} value={raridade}>
                    {raridade}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <ItemsGrid>
              {receitasFiltradas.map(receita => (
                <ReceitaCatalogoCard
                  key={receita.id}
                  receita={receita}
                  onEscolher={() => handleEscolherDoCatalogo(receita)}
                />
              ))}
            </ItemsGrid>
            {receitasFiltradas.length === 0 && (
              <StatusValueRow>
                {personagem.universo
                  ? 'Nenhuma receita encontrada.'
                  : 'Selecione um Universo no menu lateral Info primeiro.'}
              </StatusValueRow>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancelar</Button>
          </DialogActions>
        </>
      )}

      {origem === 'catalogo' && selecionado && (
        <>
          <DialogContent>
            <StatusValueRow style={{ display: 'block', fontWeight: 600, marginTop: 4 }}>
              {getNome(selecionado)}
            </StatusValueRow>
            <TextField
              type="number"
              label="Quantidade"
              size="small"
              value={quantidade}
              onChange={event => setQuantidade(Math.max(1, Number(event.target.value) || 1))}
              sx={{ marginTop: 2, width: 160 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelecionado(null)}>Voltar</Button>
            <Button onClick={onClose}>Cancelar</Button>
            <Button variant="contained" onClick={handleConfirmarCatalogo}>
              Adicionar
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

CriarReceitaDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default CriarReceitaDialog;
