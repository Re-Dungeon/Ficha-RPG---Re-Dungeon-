import React, { useEffect, useState } from 'react';
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

import { campoCurtoSchema, descricaoSchema, nomeSchema, urlImagemSchema } from 'common/utils/yupSchemas';

import { MATERIAL_AUTORAL_INICIAL, RARIDADE_OPTIONS } from './constants';

export const materialEdicaoSchema = yup.object({
  nome: nomeSchema,
  tipo: campoCurtoSchema,
  raridade: yup.string().required(),
  pureza: yup.number().min(0, 'Não pode ser negativo').max(100, 'Máximo 100').nullable(),
  taxaDrop: yup.number().min(0, 'Não pode ser negativo').max(100, 'Máximo 100').nullable(),
  valorMercado: campoCurtoSchema,
  linkImagem: urlImagemSchema,
  quantidade: yup.number().min(1, 'Mínimo 1').required('Obrigatório'),
  descricao: descricaoSchema,
  propriedades: descricaoSchema,
});

export const MaterialFormBody = ({ formik, onClose }) => {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } = formik;

  return (
    <form onSubmit={handleSubmit} noValidate>
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
        <TextField
          name="linkImagem"
          label="URL da imagem (opcional)"
          value={values.linkImagem}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.linkImagem && Boolean(errors.linkImagem)}
          helperText={touched.linkImagem && errors.linkImagem}
          size="small"
          fullWidth
        />
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <TextField
            name="tipo"
            label="Tipo"
            value={values.tipo}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.tipo && Boolean(errors.tipo)}
            helperText={touched.tipo && errors.tipo}
            size="small"
            sx={{ flex: 1, minWidth: 140 }}
          />
          <TextField
            name="raridade"
            label="Raridade"
            select
            value={values.raridade}
            onChange={handleChange}
            size="small"
            sx={{ flex: 1, minWidth: 140 }}
          >
            {RARIDADE_OPTIONS.map(opcao => (
              <MenuItem key={opcao} value={opcao}>
                {opcao}
              </MenuItem>
            ))}
          </TextField>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <TextField
            name="pureza"
            label="Pureza (%)"
            type="number"
            value={values.pureza}
            onChange={handleChange}
            error={touched.pureza && Boolean(errors.pureza)}
            helperText={touched.pureza && errors.pureza}
            size="small"
            sx={{ flex: 1, minWidth: 120 }}
          />
          <TextField
            name="taxaDrop"
            label="Taxa de Drop (%)"
            type="number"
            value={values.taxaDrop}
            onChange={handleChange}
            error={touched.taxaDrop && Boolean(errors.taxaDrop)}
            helperText={touched.taxaDrop && errors.taxaDrop}
            size="small"
            sx={{ flex: 1, minWidth: 120 }}
          />
          <TextField
            name="valorMercado"
            label="Valor de Mercado (ex.: 85 Rockmas)"
            value={values.valorMercado}
            onChange={handleChange}
            error={touched.valorMercado && Boolean(errors.valorMercado)}
            helperText={touched.valorMercado && errors.valorMercado}
            size="small"
            sx={{ flex: 1, minWidth: 160 }}
          />
        </div>
        <TextField
          name="quantidade"
          label="Quantidade"
          type="number"
          value={values.quantidade}
          onChange={handleChange}
          error={touched.quantidade && Boolean(errors.quantidade)}
          helperText={touched.quantidade && errors.quantidade}
          size="small"
          sx={{ width: 160 }}
        />
        <TextField
          name="descricao"
          label="Descrição (opcional)"
          value={values.descricao}
          onChange={handleChange}
          size="small"
          fullWidth
          multiline
          minRows={3}
        />
        <TextField
          name="propriedades"
          label="Propriedades (opcional)"
          value={values.propriedades}
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
          Salvar
        </Button>
      </DialogActions>
    </form>
  );
};

MaterialFormBody.propTypes = {
  formik: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

const MaterialFormDialog = ({ open, onClose, material, onSubmit }) => {
  const [initialValues, setInitialValues] = useState(MATERIAL_AUTORAL_INICIAL);

  useEffect(() => {
    if (!open || !material) {
      return;
    }
    setInitialValues({ ...MATERIAL_AUTORAL_INICIAL, ...material });
  }, [open, material]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>✏️ Editar Material</DialogTitle>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={materialEdicaoSchema}
        onSubmit={async (values, { setSubmitting }) => {
          await onSubmit(values);
          setSubmitting(false);
          onClose();
        }}
      >
        {formik => <MaterialFormBody formik={formik} onClose={onClose} />}
      </Formik>
    </Dialog>
  );
};

MaterialFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  material: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};

MaterialFormDialog.defaultProps = {
  material: null,
};

export default MaterialFormDialog;
