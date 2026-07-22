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

import { getItensPorUniverso } from 'service/storage';
import { getNome } from 'common/utils/resolveNome';

import { ItemFormBody, itemEdicaoSchema } from './ItemFormDialog';
import ItemCatalogoCard from './ItemCatalogoCard';
import { ITEM_AUTORAL_INICIAL, QUALIDADE_OPTIONS, extrairCamposItem } from './constants';
import { ItemsGrid } from './styles';
import { StatusValueRow } from '../styles';

const CriarItemDialog = ({ open, onClose, personagem, espacoLivre, onCreate }) => {
  const [origem, setOrigem] = useState('autoral');
  const [catalogo, setCatalogo] = useState([]);
  const [busca, setBusca] = useState('');
  const [qualidadeFiltro, setQualidadeFiltro] = useState('');
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
    setQualidadeFiltro('');
  }, [open]);

  useEffect(() => {
    if (!open || origem !== 'catalogo' || !personagem.universo) {
      setCatalogo([]);
      return undefined;
    }
    let isMounted = true;
    getItensPorUniverso(personagem.universo)
      .then(itens => {
        if (isMounted) {
          setCatalogo(itens);
        }
      })
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar catálogo de itens:', erro);
      });
    return () => {
      isMounted = false;
    };
  }, [open, origem, personagem.universo]);

  const handleAutoralSubmit = async (values, { setSubmitting }) => {
    await onCreate({ origem: 'autoral', itemId: null, ...values });
    setSubmitting(false);
    onClose();
  };

  const handleEscolherDoCatalogo = item => {
    setSelecionado(item);
    setQuantidade(1);
  };

  const handleConfirmarCatalogo = async () => {
    await onCreate({
      origem: 'catalogo',
      itemId: selecionado.id,
      nome: getNome(selecionado),
      quantidade,
      equipado: false,
      ...extrairCamposItem(selecionado),
    });
    onClose();
  };

  const itensFiltrados = catalogo.filter(
    item =>
      getNome(item).toLowerCase().includes(busca.toLowerCase()) &&
      (!qualidadeFiltro || item.qualidade === qualidadeFiltro),
  );

  const espacoNecessario = selecionado ? (selecionado.pesoUnitario ?? 0) * quantidade : 0;
  const cabe = espacoNecessario <= espacoLivre;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={origem === 'autoral' ? 'sm' : 'lg'}>
      <DialogTitle>Adicionar Item</DialogTitle>

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
        <Formik initialValues={ITEM_AUTORAL_INICIAL} validationSchema={itemEdicaoSchema} onSubmit={handleAutoralSubmit}>
          {formik => <ItemFormBody formik={formik} onClose={onClose} />}
        </Formik>
      )}

      {origem === 'catalogo' && !selecionado && (
        <>
          <DialogContent style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
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
                value={qualidadeFiltro}
                onChange={event => setQualidadeFiltro(event.target.value)}
                sx={{ minWidth: 180 }}
                slotProps={{ select: { displayEmpty: true } }}
              >
                <MenuItem value="">Todas as Qualidades</MenuItem>
                {QUALIDADE_OPTIONS.map(qualidade => (
                  <MenuItem key={qualidade} value={qualidade}>
                    {qualidade}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <ItemsGrid>
              {itensFiltrados.map(item => (
                <ItemCatalogoCard key={item.id} item={item} onEscolher={() => handleEscolherDoCatalogo(item)} />
              ))}
            </ItemsGrid>
            {itensFiltrados.length === 0 && (
              <StatusValueRow>
                {personagem.universo ? 'Nenhum item encontrado.' : 'Selecione um Universo no menu lateral Info primeiro.'}
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
            <StatusValueRow
              style={{ display: 'block', marginTop: 8, color: cabe ? 'var(--text-secondary)' : '#f87171' }}
            >
              Espaço necessário: {espacoNecessario.toFixed(2)} / {espacoLivre.toFixed(2)} livre
              {!cabe && ' — não cabe!'}
            </StatusValueRow>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelecionado(null)}>Voltar</Button>
            <Button onClick={onClose}>Cancelar</Button>
            <Button variant="contained" disabled={!cabe} onClick={handleConfirmarCatalogo}>
              Adicionar
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

CriarItemDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
  espacoLivre: PropTypes.number.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default CriarItemDialog;
