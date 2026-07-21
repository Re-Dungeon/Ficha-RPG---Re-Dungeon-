import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import * as yup from 'yup';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { getArtesPorUniverso, getFirestoreItem } from 'service/storage';
import { campoCurtoSchema, descricaoSchema, nomeSchema } from 'common/utils/yupSchemas';
import { getNome } from 'common/utils/resolveNome';

import { StatusValueRow } from '../styles';
import { ART_AUTORAL_INICIAL, DOMINIO_LABELS, TIPO_ACAO_OPTIONS, TIPO_ART_OPTIONS } from './constants';

const artAutoralSchema = yup.object({
  nome: nomeSchema,
  tipo: yup.string().required(),
  dominio: yup.number().min(1).max(5).required(),
  recarga: campoCurtoSchema,
  duracao: campoCurtoSchema,
  alcance: campoCurtoSchema,
  alvos: campoCurtoSchema,
  custo: campoCurtoSchema,
  dano: campoCurtoSchema,
  tipoAcao: yup.string().required(),
  descricao: descricaoSchema,
});

const CriarArtDialog = ({ open, onClose, personagem, onCreate }) => {
  const [origem, setOrigem] = useState('autoral');
  const [classesDetalhes, setClassesDetalhes] = useState([]);
  const [catalogoArtes, setCatalogoArtes] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }
    setOrigem('autoral');
    setBusca('');
  }, [open]);

  useEffect(() => {
    if (!open || origem !== 'classe') {
      return;
    }
    Promise.all((personagem.classes ?? []).map(id => getFirestoreItem('classes', id))).then(
      itens => setClassesDetalhes(itens.filter(Boolean)),
    );
  }, [open, origem, personagem.classes]);

  useEffect(() => {
    if (!open || origem !== 'catalogo' || !personagem.universo) {
      setCatalogoArtes([]);
      return;
    }
    getArtesPorUniverso(personagem.universo).then(setCatalogoArtes);
  }, [open, origem, personagem.universo]);

  const handleAutoralSubmit = useCallback(
    (values, { setSubmitting }) => {
      onCreate({ origem: 'autoral', ...values, ativa: true });
      setSubmitting(false);
      onClose();
    },
    [onCreate, onClose],
  );

  const handleEscolherHabilidadeClasse = useCallback(
    (classe, tipoLista, index, habilidade) => {
      onCreate({
        origem: 'classe',
        classeId: classe.id,
        habilidadeId: `${tipoLista}-${index}`,
        nome: habilidade.nome,
        descricao: habilidade.descricao ?? '',
        ativa: true,
      });
      onClose();
    },
    [onCreate, onClose],
  );

  const handeEscolherDoCatalogo = useCallback(
    item => {
      onCreate({ origem: 'catalogo', arteId: item.id, nome: getNome(item), ativa: true });
      onClose();
    },
    [onCreate, onClose],
  );

  const artesFiltradas = catalogoArtes.filter(item =>
    getNome(item).toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Criar Art</DialogTitle>

      <Tabs
        value={origem}
        onChange={(_event, novaOrigem) => setOrigem(novaOrigem)}
        variant="fullWidth"
        textColor="inherit"
        slotProps={{ indicator: { style: { backgroundColor: 'var(--color-accent)' } } }}
      >
        <Tab value="autoral" label="Autoral" />
        <Tab value="classe" label="Habilidade de Classe" />
        <Tab value="catalogo" label="Catálogo" />
      </Tabs>

      {origem === 'autoral' && (
        <Formik
          initialValues={ART_AUTORAL_INICIAL}
          validationSchema={artAutoralSchema}
          onSubmit={handleAutoralSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit: submit, isSubmitting }) => (
            <form onSubmit={submit} noValidate>
              <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <TextField
                  name="nome"
                  label="Nome"
                  value={values.nome}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.nome && Boolean(errors.nome)}
                  helperText={touched.nome && errors.nome}
                  size="small"
                  fullWidth
                />
                <div style={{ display: 'flex', gap: 16 }}>
                  <TextField
                    name="tipo"
                    label="Tipo"
                    select
                    value={values.tipo}
                    onChange={handleChange}
                    size="small"
                    fullWidth
                  >
                    {TIPO_ART_OPTIONS.map(opcao => (
                      <MenuItem key={opcao} value={opcao}>
                        {opcao}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    name="dominio"
                    label="Domínio"
                    select
                    value={values.dominio}
                    onChange={handleChange}
                    size="small"
                    fullWidth
                  >
                    {[1, 2, 3, 4, 5].map(nivel => (
                      <MenuItem key={nivel} value={nivel}>
                        {nivel} — {DOMINIO_LABELS[nivel]}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>
                <TextField
                  name="tipoAcao"
                  label="Tipo de Ação"
                  select
                  value={values.tipoAcao}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                >
                  {TIPO_ACAO_OPTIONS.map(opcao => (
                    <MenuItem key={opcao} value={opcao}>
                      {opcao}
                    </MenuItem>
                  ))}
                </TextField>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <TextField name="recarga" label="Recarga" value={values.recarga} onChange={handleChange} size="small" sx={{ flex: 1, minWidth: 120 }} />
                  <TextField name="duracao" label="Duração" value={values.duracao} onChange={handleChange} size="small" sx={{ flex: 1, minWidth: 120 }} />
                  <TextField name="alcance" label="Alcance" value={values.alcance} onChange={handleChange} size="small" sx={{ flex: 1, minWidth: 120 }} />
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <TextField name="alvos" label="Alvos" value={values.alvos} onChange={handleChange} size="small" sx={{ flex: 1, minWidth: 120 }} />
                  <TextField name="custo" label="Custo" value={values.custo} onChange={handleChange} size="small" sx={{ flex: 1, minWidth: 120 }} />
                  <TextField name="dano" label="Dano" value={values.dano} onChange={handleChange} size="small" sx={{ flex: 1, minWidth: 120 }} />
                </div>
                <TextField
                  name="descricao"
                  label="Descrição"
                  value={values.descricao}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  multiline
                  minRows={3}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  Criar
                </Button>
              </DialogActions>
            </form>
          )}
        </Formik>
      )}

      {origem === 'classe' && (
        <>
          <DialogContent>
            {(personagem.classes ?? []).length === 0 && (
              <StatusValueRow>
                Este personagem ainda não tem classes escolhidas (menu lateral Classe).
              </StatusValueRow>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {classesDetalhes.map(classe => (
                <div key={classe.id}>
                  <StatusValueRow style={{ display: 'block', fontWeight: 600 }}>{getNome(classe)}</StatusValueRow>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    {[...(classe.habilidadesBasicas ?? []), ...(classe.habilidadesAvancadas ?? [])].length === 0 && (
                      <StatusValueRow>Nenhuma habilidade cadastrada para esta classe.</StatusValueRow>
                    )}
                    {(classe.habilidadesBasicas ?? []).map((habilidade, index) => (
                      <div
                        key={`basica-${index}`}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 8 }}
                      >
                        <span>{habilidade.nome}</span>
                        <Button
                          size="small"
                          onClick={() => handleEscolherHabilidadeClasse(classe, 'basica', index, habilidade)}
                        >
                          Escolher
                        </Button>
                      </div>
                    ))}
                    {(classe.habilidadesAvancadas ?? []).map((habilidade, index) => (
                      <div
                        key={`avancada-${index}`}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 8 }}
                      >
                        <span>{habilidade.nome}</span>
                        <Button
                          size="small"
                          onClick={() => handleEscolherHabilidadeClasse(classe, 'avancada', index, habilidade)}
                        >
                          Escolher
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Fechar</Button>
          </DialogActions>
        </>
      )}

      {origem === 'catalogo' && (
        <>
          <DialogContent>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar Art..."
              value={busca}
              onChange={event => setBusca(event.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
              {artesFiltradas.map(item => (
                <div
                  key={item.id}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border-primary)', borderRadius: 8 }}
                >
                  <span>{getNome(item)}</span>
                  <Button size="small" onClick={() => handeEscolherDoCatalogo(item)}>
                    Escolher
                  </Button>
                </div>
              ))}
              {artesFiltradas.length === 0 && (
                <StatusValueRow>
                  {personagem.universo ? 'Nenhuma Art encontrada.' : 'Selecione um Universo no menu lateral Info primeiro.'}
                </StatusValueRow>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Fechar</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

CriarArtDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default CriarArtDialog;
