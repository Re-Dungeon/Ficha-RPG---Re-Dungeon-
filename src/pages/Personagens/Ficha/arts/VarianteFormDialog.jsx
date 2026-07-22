import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import * as yup from 'yup';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

import { campoCurtoSchema, descricaoSchema, nomeSchema, urlImagemSchema } from 'common/utils/yupSchemas';
import { dominioVarianteValido } from 'common/utils/formulas';
import { getNome } from 'common/utils/resolveNome';

import { DOMINIO_LABELS, TIPO_ACAO_OPTIONS, TIPO_ART_OPTIONS, VARIANTE_INICIAL } from './constants';
import { StatusValueRow } from '../styles';

const varianteSchema = yup.object({
  nome: nomeSchema,
  artId: yup.string().required('Selecione a Art base'),
  tipo: yup.string().required(),
  tipoAcao: yup.string().required(),
  dominio: yup.number().min(1).max(5).required(),
  recarga: campoCurtoSchema,
  duracao: campoCurtoSchema,
  alcance: campoCurtoSchema,
  alvos: campoCurtoSchema,
  custo: campoCurtoSchema,
  dados: campoCurtoSchema,
  imagem: urlImagemSchema,
  circuloMagico: campoCurtoSchema,
  cantico: descricaoSchema,
  descricao: descricaoSchema,
});

const VarianteFormBody = ({ formik, arts, condicoes, onClose }) => {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue } = formik;

  const artBase = arts.find(art => art.id === values.artId);
  const dominioBase = artBase?.dominio ?? 1;
  const dominioOptions = useMemo(
    () => [1, 2, 3, 4, 5].filter(nivel => dominioVarianteValido(nivel, dominioBase)),
    [dominioBase],
  );

  useEffect(() => {
    if (dominioOptions.length > 0 && !dominioOptions.includes(values.dominio)) {
      setFieldValue('dominio', dominioOptions[0]);
    }
  }, [dominioOptions, values.dominio, setFieldValue]);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TextField
          name="artId"
          label="Art base"
          select
          value={values.artId}
          onChange={handleChange}
          error={touched.artId && Boolean(errors.artId)}
          helperText={touched.artId && errors.artId}
          size="small"
          fullWidth
        >
          {arts.map(art => (
            <MenuItem key={art.id} value={art.id}>
              {art.nome}
            </MenuItem>
          ))}
        </TextField>

        {values.artId && dominioOptions.length === 0 && (
          <StatusValueRow style={{ display: 'block', color: '#ef4444' }}>
            ⚠️ Essa Art tem domínio {dominioBase} — não há domínio menor disponível pra uma variante.
          </StatusValueRow>
        )}

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
        <TextField
          name="imagem"
          label="URL da imagem (opcional)"
          value={values.imagem}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.imagem && Boolean(errors.imagem)}
          helperText={touched.imagem && errors.imagem}
          size="small"
          fullWidth
        />
        <div style={{ display: 'flex', gap: 16 }}>
          <TextField name="tipo" label="Tipo" select value={values.tipo} onChange={handleChange} size="small" fullWidth>
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
            disabled={dominioOptions.length === 0}
          >
            {dominioOptions.map(nivel => (
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
          <TextField name="dados" label="Dados" value={values.dados} onChange={handleChange} size="small" sx={{ flex: 1, minWidth: 120 }} />
        </div>
        <TextField
          name="circuloMagico"
          label="Círculo Mágico (opcional)"
          value={values.circuloMagico}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.circuloMagico && Boolean(errors.circuloMagico)}
          helperText={touched.circuloMagico && errors.circuloMagico}
          size="small"
          fullWidth
        />
        <Autocomplete
          multiple
          size="small"
          options={condicoes}
          value={condicoes.filter(condicao => (values.condicoesAplicadas ?? []).includes(condicao.id))}
          getOptionLabel={getNome}
          isOptionEqualToValue={(opcao, valor) => opcao.id === valor.id}
          onChange={(_event, novoValor) =>
            setFieldValue('condicoesAplicadas', novoValor.map(condicao => condicao.id))
          }
          renderInput={params => <TextField {...params} label="Condições Aplicadas (opcional)" />}
        />
        <TextField
          name="cantico"
          label="Cântico (opcional)"
          value={values.cantico}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.cantico && Boolean(errors.cantico)}
          helperText={touched.cantico && errors.cantico}
          size="small"
          fullWidth
          multiline
          minRows={2}
        />
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
        <Button type="submit" variant="contained" disabled={isSubmitting || dominioOptions.length === 0}>
          Confirmar
        </Button>
      </DialogActions>
    </form>
  );
};

VarianteFormBody.propTypes = {
  formik: PropTypes.object.isRequired,
  arts: PropTypes.array.isRequired,
  condicoes: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
};

const VarianteFormDialog = ({ open, onClose, variante, arts, condicoes, onSubmit }) => {
  const [initialValues, setInitialValues] = useState(VARIANTE_INICIAL);

  useEffect(() => {
    if (!open) {
      return;
    }
    setInitialValues(variante ? { ...VARIANTE_INICIAL, ...variante } : { ...VARIANTE_INICIAL, artId: arts[0]?.id ?? '' });
  }, [open, variante, arts]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{variante ? '✏️ Editar Variante' : '✨ Criar Nova Variante'}</DialogTitle>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={varianteSchema}
        onSubmit={async (values, { setSubmitting }) => {
          await onSubmit(values);
          setSubmitting(false);
          onClose();
        }}
      >
        {formik => <VarianteFormBody formik={formik} arts={arts} condicoes={condicoes} onClose={onClose} />}
      </Formik>
    </Dialog>
  );
};

VarianteFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  variante: PropTypes.object,
  arts: PropTypes.array.isRequired,
  condicoes: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

VarianteFormDialog.defaultProps = {
  variante: null,
};

export default VarianteFormDialog;
