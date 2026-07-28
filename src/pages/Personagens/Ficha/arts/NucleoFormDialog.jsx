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

import {
  campoCurtoSchema,
  descricaoSchema,
  nomeSchema,
  urlImagemSchema,
} from 'common/utils/yupSchemas';

import { NUCLEO_INICIAL, TIPO_ART_OPTIONS } from './constants';
import { DialogTwoColumns, ImagePreviewBox } from './styles';

const nucleoSchema = yup.object({
  nome: nomeSchema,
  tipo: yup.string().required('Selecione um tipo'),
  bonus: campoCurtoSchema,
  descricao: descricaoSchema,
  imagem: urlImagemSchema,
});

const NucleoFormBody = ({ formik, onClose }) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
  } = formik;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <DialogContent>
        <DialogTwoColumns>
          <div>
            <ImagePreviewBox>
              {values.imagem ? (
                <img
                  src={values.imagem}
                  alt="Preview"
                  onError={event => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                '🎨'
              )}
            </ImagePreviewBox>
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
              sx={{ marginTop: 2 }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              name="tipo"
              label="Tipo"
              select
              value={values.tipo}
              onChange={handleChange}
              error={touched.tipo && Boolean(errors.tipo)}
              helperText={touched.tipo && errors.tipo}
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
              name="bonus"
              label="Bônus (opcional)"
              placeholder="Ex: +2 Força"
              value={values.bonus}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.bonus && Boolean(errors.bonus)}
              helperText={touched.bonus && errors.bonus}
              size="small"
              fullWidth
            />
            <TextField
              name="descricao"
              label="✨ Essência"
              placeholder="Texto descritivo do núcleo, explicando sua natureza, origem ou conceito narrativo..."
              value={values.descricao}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.descricao && Boolean(errors.descricao)}
              helperText={touched.descricao && errors.descricao}
              size="small"
              fullWidth
              multiline
              minRows={4}
            />
          </div>
        </DialogTwoColumns>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          Confirmar
        </Button>
      </DialogActions>
    </form>
  );
};

NucleoFormBody.propTypes = {
  formik: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

const NucleoFormDialog = ({ open, onClose, nucleo, onSubmit }) => {
  const [initialValues, setInitialValues] = useState(NUCLEO_INICIAL);

  useEffect(() => {
    if (!open) {
      return;
    }
    setInitialValues(nucleo ? { ...NUCLEO_INICIAL, ...nucleo } : NUCLEO_INICIAL);
  }, [open, nucleo]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{nucleo ? '✏️ Editar Núcleo' : '✨ Criar Novo Núcleo'}</DialogTitle>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={nucleoSchema}
        onSubmit={async (values, { setSubmitting }) => {
          await onSubmit(values);
          setSubmitting(false);
          onClose();
        }}
      >
        {formik => <NucleoFormBody formik={formik} onClose={onClose} />}
      </Formik>
    </Dialog>
  );
};

NucleoFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  nucleo: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};

NucleoFormDialog.defaultProps = {
  nucleo: null,
};

export default NucleoFormDialog;
