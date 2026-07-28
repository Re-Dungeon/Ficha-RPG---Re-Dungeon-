import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import * as yup from 'yup';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
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
import {
  DialogTwoColumns,
  FormSectionCard,
  HeaderDivider,
  ImagePreviewBox,
  NucleoImageWrapper,
  NucleoNome,
  ViewDialogHeader,
  ViewHeaderLeft,
  ViewHeaderIcon,
  ViewTitleMain,
  ViewTitleSub,
} from './styles';

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
      <DialogContent sx={{ padding: { xs: '16px 16px 20px', md: '20px 24px 24px' } }}>
        <DialogTwoColumns>
          <FormSectionCard>
            <NucleoImageWrapper>
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
            </NucleoImageWrapper>
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
          </FormSectionCard>

          <FormSectionCard>
            <NucleoNome style={{ fontSize: '1.3rem', marginBottom: 14 }}>{values.nome || 'Nome do Núcleo'}</NucleoNome>
            <HeaderDivider />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 20 }}>
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
                sx={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px' }}
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
                sx={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px' }}
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
                sx={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px' }}
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
                minRows={5}
                maxRows={10}
                sx={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '16px',
                  textarea: {
                    overflow: 'auto',
                  },
                }}
              />
            </div>
          </FormSectionCard>
        </DialogTwoColumns>
      </DialogContent>
      <DialogActions sx={{ gap: 2, padding: '16px 24px 20px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <Button onClick={onClose} sx={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', padding: '10px 18px', borderRadius: '999px', minWidth: 140, background: 'rgba(255,255,255,0.04)', transition: 'all 200ms ease', '&:hover': { background: 'rgba(255,255,255,0.08)', boxShadow: '0 10px 24px rgba(0,0,0,0.22)' } }}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{
            minWidth: 140,
            padding: '10px 18px',
            borderRadius: '999px',
            color: '#111',
            background: 'linear-gradient(90deg, rgba(232,203,133,1), rgba(255,223,119,0.96))',
            boxShadow: '0 16px 32px rgba(232,203,133,0.24)',
            transition: 'all 200ms ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 20px 36px rgba(232,203,133,0.28)',
            },
          }}
        >
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" sx={{ '& .MuiPaper-root': { borderRadius: '28px', overflow: 'hidden', background: 'rgba(10, 8, 20, 0.96)', border: '1px solid rgba(171, 140, 255, 0.18)', boxShadow: '0 40px 90px rgba(0,0,0,0.42)' } }}>
      <ViewDialogHeader>
        <ViewHeaderLeft>
          <ViewHeaderIcon>✏️</ViewHeaderIcon>
          <div>
            <ViewTitleMain>{nucleo ? 'Editar Núcleo' : 'Criar Novo Núcleo'}</ViewTitleMain>
            <ViewTitleSub>Atualize as informações do núcleo com estilo lendário.</ViewTitleSub>
          </div>
        </ViewHeaderLeft>
        <div />
      </ViewDialogHeader>
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
