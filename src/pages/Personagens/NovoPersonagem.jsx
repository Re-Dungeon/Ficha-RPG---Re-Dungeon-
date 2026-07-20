import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as yup from 'yup';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';

import { useAuth } from 'context/AuthContext';
import { addPersonagem, getUniverso } from 'service/storage';
import { nomeSchema } from 'common/utils/yupSchemas';

import { FormWrapper, PageTitle, PageWrapper } from './styles';

const novoPersonagemSchema = yup.object({
  nome: nomeSchema,
  universo: yup.string().required('Universo é obrigatório'),
});

const NovoPersonagem = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [universos, setUniversos] = useState([]);

  useEffect(() => {
    getUniverso().then(setUniversos);
  }, []);

  const handleSubmit = useCallback(
    async ({ nome, universo }, { setSubmitting }) => {
      const id = await addPersonagem({ uid: currentUser.uid, nome, universo });
      setSubmitting(false);
      navigate(`/personagens/${id}`);
    },
    [currentUser.uid, navigate],
  );

  return (
    <PageWrapper>
      <PageTitle>Novo Personagem</PageTitle>

      <Formik
        initialValues={{ nome: '', universo: '' }}
        validationSchema={novoPersonagemSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit: submit, isSubmitting }) => (
          <FormWrapper as="form" onSubmit={submit} noValidate>
            <TextField
              name="nome"
              label="Nome do personagem"
              value={values.nome}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.nome && Boolean(errors.nome)}
              helperText={touched.nome && errors.nome}
              fullWidth
              size="small"
            />
            <FormControl
              size="small"
              fullWidth
              error={touched.universo && Boolean(errors.universo)}
            >
              <InputLabel id="novo-personagem-universo-label">Universo</InputLabel>
              <Select
                labelId="novo-personagem-universo-label"
                name="universo"
                label="Universo"
                value={values.universo}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                {universos.map(item => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.Nome}
                  </MenuItem>
                ))}
              </Select>
              {touched.universo && errors.universo && (
                <FormHelperText>{errors.universo}</FormHelperText>
              )}
            </FormControl>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Salvar
            </Button>
          </FormWrapper>
        )}
      </Formik>
    </PageWrapper>
  );
};

export default NovoPersonagem;
