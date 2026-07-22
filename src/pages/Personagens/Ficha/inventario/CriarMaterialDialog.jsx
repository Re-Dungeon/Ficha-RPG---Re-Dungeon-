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

import { getMateriaisPorUniverso } from 'service/storage';
import { getNome } from 'common/utils/resolveNome';

import { MaterialFormBody, materialEdicaoSchema } from './MaterialFormDialog';
import MaterialCatalogoCard from './MaterialCatalogoCard';
import { MATERIAL_AUTORAL_INICIAL, RARIDADE_OPTIONS, extrairCamposMaterial } from './constants';
import { ItemsGrid } from './styles';
import { StatusValueRow } from '../styles';

const CriarMaterialDialog = ({ open, onClose, personagem, onCreate }) => {
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
    getMateriaisPorUniverso(personagem.universo)
      .then(materiais => {
        if (isMounted) {
          setCatalogo(materiais);
        }
      })
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar catálogo de materiais:', erro);
      });
    return () => {
      isMounted = false;
    };
  }, [open, origem, personagem.universo]);

  const handleAutoralSubmit = async (values, { setSubmitting }) => {
    await onCreate({ origem: 'autoral', materialId: null, ...values });
    setSubmitting(false);
    onClose();
  };

  const handleEscolherDoCatalogo = material => {
    setSelecionado(material);
    setQuantidade(1);
  };

  const handleConfirmarCatalogo = async () => {
    await onCreate({
      origem: 'catalogo',
      materialId: selecionado.id,
      nome: getNome(selecionado),
      quantidade,
      ...extrairCamposMaterial(selecionado),
    });
    onClose();
  };

  const materiaisFiltrados = catalogo.filter(
    material =>
      getNome(material).toLowerCase().includes(busca.toLowerCase()) &&
      (!raridadeFiltro || material.raridade === raridadeFiltro),
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={origem === 'autoral' ? 'sm' : 'lg'}>
      <DialogTitle>Adicionar Material</DialogTitle>

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
          initialValues={MATERIAL_AUTORAL_INICIAL}
          validationSchema={materialEdicaoSchema}
          onSubmit={handleAutoralSubmit}
        >
          {formik => <MaterialFormBody formik={formik} onClose={onClose} />}
        </Formik>
      )}

      {origem === 'catalogo' && !selecionado && (
        <>
          <DialogContent style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar material..."
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
              {materiaisFiltrados.map(material => (
                <MaterialCatalogoCard
                  key={material.id}
                  material={material}
                  onEscolher={() => handleEscolherDoCatalogo(material)}
                />
              ))}
            </ItemsGrid>
            {materiaisFiltrados.length === 0 && (
              <StatusValueRow>
                {personagem.universo
                  ? 'Nenhum material encontrado.'
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

CriarMaterialDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default CriarMaterialDialog;
