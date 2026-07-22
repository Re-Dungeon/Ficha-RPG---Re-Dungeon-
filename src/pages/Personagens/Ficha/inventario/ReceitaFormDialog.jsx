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

import { RARIDADE_OPTIONS, RECEITA_AUTORAL_INICIAL } from './constants';

export const receitaEdicaoSchema = yup.object({
  nome: nomeSchema,
  categoria: campoCurtoSchema,
  raridade: yup.string().required(),
  valorCompra: campoCurtoSchema,
  valorVenda: campoCurtoSchema,
  linkImagem: urlImagemSchema,
  quantidade: yup.number().min(1, 'Mínimo 1').required('Obrigatório'),
  descricao: descricaoSchema,
});

export const ReceitaFormBody = ({ formik, onClose }) => {
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
            name="categoria"
            label="Categoria"
            value={values.categoria}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.categoria && Boolean(errors.categoria)}
            helperText={touched.categoria && errors.categoria}
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
            name="valorCompra"
            label="Valor de Compra"
            value={values.valorCompra}
            onChange={handleChange}
            error={touched.valorCompra && Boolean(errors.valorCompra)}
            helperText={touched.valorCompra && errors.valorCompra}
            size="small"
            sx={{ flex: 1, minWidth: 140 }}
          />
          <TextField
            name="valorVenda"
            label="Valor de Venda"
            value={values.valorVenda}
            onChange={handleChange}
            error={touched.valorVenda && Boolean(errors.valorVenda)}
            helperText={touched.valorVenda && errors.valorVenda}
            size="small"
            sx={{ flex: 1, minWidth: 140 }}
          />
          <TextField
            name="quantidade"
            label="Quantidade"
            type="number"
            value={values.quantidade}
            onChange={handleChange}
            error={touched.quantidade && Boolean(errors.quantidade)}
            helperText={touched.quantidade && errors.quantidade}
            size="small"
            sx={{ flex: 1, minWidth: 120 }}
          />
        </div>
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

ReceitaFormBody.propTypes = {
  formik: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

const ReceitaFormDialog = ({ open, onClose, receita, onSubmit }) => {
  const [initialValues, setInitialValues] = useState(RECEITA_AUTORAL_INICIAL);

  useEffect(() => {
    if (!open || !receita) {
      return;
    }
    setInitialValues({ ...RECEITA_AUTORAL_INICIAL, ...receita });
  }, [open, receita]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>✏️ Editar Receita</DialogTitle>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={receitaEdicaoSchema}
        onSubmit={async (values, { setSubmitting }) => {
          await onSubmit(values);
          setSubmitting(false);
          onClose();
        }}
      >
        {formik => <ReceitaFormBody formik={formik} onClose={onClose} />}
      </Formik>
    </Dialog>
  );
};

ReceitaFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  receita: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};

ReceitaFormDialog.defaultProps = {
  receita: null,
};

export default ReceitaFormDialog;
