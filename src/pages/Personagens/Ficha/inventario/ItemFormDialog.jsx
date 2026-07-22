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

import { ITEM_AUTORAL_INICIAL, QUALIDADE_OPTIONS } from './constants';
import HabilidadesEspeciaisEditor from './HabilidadesEspeciaisEditor';

export const itemEdicaoSchema = yup.object({
  nome: nomeSchema,
  qualidade: yup.string().required(),
  tipo: campoCurtoSchema,
  dados: campoCurtoSchema,
  nivelAtual: yup.number().min(1, 'Mínimo 1').required('Obrigatório'),
  nivelMaximo: yup.number().min(1, 'Mínimo 1').nullable(),
  extra: campoCurtoSchema,
  pesoUnitario: yup.number().min(0, 'Não pode ser negativo').required('Obrigatório'),
  bonusEspaco: yup.number().min(0, 'Não pode ser negativo'),
  linkImagem: urlImagemSchema,
  quantidade: yup.number().min(1, 'Mínimo 1').required('Obrigatório'),
  descricao: descricaoSchema,
});

export const ItemFormBody = ({ formik, onClose }) => {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue } = formik;

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
            name="qualidade"
            label="Qualidade"
            select
            value={values.qualidade}
            onChange={handleChange}
            size="small"
            sx={{ flex: 1, minWidth: 140 }}
          >
            {QUALIDADE_OPTIONS.map(opcao => (
              <MenuItem key={opcao} value={opcao}>
                {opcao}
              </MenuItem>
            ))}
          </TextField>
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
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <TextField
            name="nivelAtual"
            label="Nível Atual"
            type="number"
            value={values.nivelAtual}
            onChange={handleChange}
            error={touched.nivelAtual && Boolean(errors.nivelAtual)}
            helperText={touched.nivelAtual && errors.nivelAtual}
            size="small"
            sx={{ flex: 1, minWidth: 120 }}
          />
          <TextField
            name="nivelMaximo"
            label="Nível Máximo (opcional)"
            type="number"
            value={values.nivelMaximo}
            onChange={handleChange}
            error={touched.nivelMaximo && Boolean(errors.nivelMaximo)}
            helperText={touched.nivelMaximo && errors.nivelMaximo}
            size="small"
            sx={{ flex: 1, minWidth: 120 }}
          />
          <TextField
            name="dados"
            label="Roll (ex.: 2d4+3)"
            value={values.dados}
            onChange={handleChange}
            size="small"
            sx={{ flex: 1, minWidth: 120 }}
          />
        </div>
        <TextField
          name="extra"
          label="Extra (opcional)"
          value={values.extra}
          onChange={handleChange}
          size="small"
          fullWidth
        />
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <TextField
            name="pesoUnitario"
            label="Peso por unidade"
            type="number"
            value={values.pesoUnitario}
            onChange={handleChange}
            error={touched.pesoUnitario && Boolean(errors.pesoUnitario)}
            helperText={touched.pesoUnitario && errors.pesoUnitario}
            size="small"
            sx={{ flex: 1, minWidth: 140 }}
          />
          <TextField
            name="bonusEspaco"
            label="Bônus de Espaço (armazenamento, opcional)"
            type="number"
            value={values.bonusEspaco}
            onChange={handleChange}
            error={touched.bonusEspaco && Boolean(errors.bonusEspaco)}
            helperText={touched.bonusEspaco && errors.bonusEspaco}
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
        <HabilidadesEspeciaisEditor
          habilidades={values.habilidadesEspeciais}
          onChange={novasHabilidades => setFieldValue('habilidadesEspeciais', novasHabilidades)}
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

ItemFormBody.propTypes = {
  formik: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

const ItemFormDialog = ({ open, onClose, item, onSubmit }) => {
  const [initialValues, setInitialValues] = useState(ITEM_AUTORAL_INICIAL);

  useEffect(() => {
    if (!open || !item) {
      return;
    }
    setInitialValues({ ...ITEM_AUTORAL_INICIAL, ...item });
  }, [open, item]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>✏️ Editar Item</DialogTitle>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={itemEdicaoSchema}
        onSubmit={async (values, { setSubmitting }) => {
          await onSubmit(values);
          setSubmitting(false);
          onClose();
        }}
      >
        {formik => <ItemFormBody formik={formik} onClose={onClose} />}
      </Formik>
    </Dialog>
  );
};

ItemFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};

ItemFormDialog.defaultProps = {
  item: null,
};

export default ItemFormDialog;
