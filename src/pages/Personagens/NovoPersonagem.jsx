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
import { getNome } from 'common/utils/resolveNome';
import { useCampanhasPorUniverso } from 'hooks/useCampanhasPorUniverso';
import ErrorSnackbar from 'components/ErrorSnackbar/ErrorSnackbar';
import { TIPOS_PERSONAGEM } from './Ficha/constants';

import { FormWrapper, PageTitle, PageWrapper } from './styles';

const novoPersonagemSchema = yup.object({
  nome: nomeSchema,
  universo: yup.string().required('Universo é obrigatório'),
  tipo: yup.string().required('Tipo é obrigatório'),
  campanha: yup.string(),
});

const NovoPersonagem = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [universos, setUniversos] = useState([]);
  const [universoSelecionado, setUniversoSelecionado] = useState('');
  const campanhas = useCampanhasPorUniverso(universoSelecionado);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    getUniverso().then(setUniversos);
  }, []);

  const handleSubmit = useCallback(
    async ({ nome, universo, tipo, campanha }, { setSubmitting }) => {
      try {
        const id = await addPersonagem({ uid: currentUser.uid, nome, universo, tipo, campanha });
        navigate(`/personagens/${id}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Falha ao criar personagem:', error);
        setErro(
          'Não foi possível criar o personagem. Verifique sua conexão e tente novamente.',
        );
        setSubmitting(false);
      }
    },
    [currentUser.uid, navigate],
  );

  return (
    <PageWrapper>
      <PageTitle>Nova Ficha</PageTitle>

      <Formik
        initialValues={{ nome: '', universo: '', tipo: TIPOS_PERSONAGEM[0], campanha: '' }}
        validationSchema={novoPersonagemSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit: submit,
          isSubmitting,
          setFieldValue,
        }) => (
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
                onChange={e => {
                  handleChange(e);
                  setUniversoSelecionado(e.target.value);
                  setFieldValue('campanha', '');
                }}
                onBlur={handleBlur}
              >
                {universos.map(item => (
                  <MenuItem key={item.id} value={item.id}>
                    {getNome(item)}
                  </MenuItem>
                ))}
              </Select>
              {touched.universo && errors.universo && (
                <FormHelperText>{errors.universo}</FormHelperText>
              )}
            </FormControl>
            <FormControl
              size="small"
              fullWidth
              error={touched.tipo && Boolean(errors.tipo)}
            >
              <InputLabel id="novo-personagem-tipo-label">Tipo</InputLabel>
              <Select
                labelId="novo-personagem-tipo-label"
                name="tipo"
                label="Tipo"
                value={values.tipo}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                {TIPOS_PERSONAGEM.map(opcao => (
                  <MenuItem key={opcao} value={opcao}>
                    {opcao}
                  </MenuItem>
                ))}
              </Select>
              {touched.tipo && errors.tipo && (
                <FormHelperText>{errors.tipo}</FormHelperText>
              )}
            </FormControl>
            <FormControl size="small" fullWidth disabled={!values.universo}>
              <InputLabel id="novo-personagem-campanha-label">Campanha</InputLabel>
              <Select
                labelId="novo-personagem-campanha-label"
                name="campanha"
                label="Campanha"
                value={values.campanha}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <MenuItem value="">
                  <em>Nenhuma</em>
                </MenuItem>
                {campanhas.map(item => (
                  <MenuItem key={item.id} value={item.id}>
                    {getNome(item)}
                  </MenuItem>
                ))}
              </Select>
              {!values.universo && (
                <FormHelperText>Escolha um universo para ver as campanhas disponíveis</FormHelperText>
              )}
            </FormControl>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Salvar
            </Button>
          </FormWrapper>
        )}
      </Formik>

      <ErrorSnackbar open={!!erro} mensagem={erro} onClose={() => setErro(null)} />
    </PageWrapper>
  );
};

export default NovoPersonagem;
