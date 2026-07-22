import React, { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik } from 'formik';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { useAuth } from 'context/AuthContext';

import {
  LoginCard,
  LoginError,
  LoginForm,
  LoginSubtitle,
  LoginTitle,
  LoginWrapper,
} from './styles';
import { firebaseAuthErrorMessage, loginInitialValues, loginSchema } from './utils';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState('');

  const redirectAfterAuth = useCallback(() => {
    const from = location.state?.from?.pathname ?? '/personagens';
    navigate(from, { replace: true });
  }, [location.state, navigate]);

  const handleSubmit = useCallback(
    async ({ email, password }, { setSubmitting }) => {
      setFormError('');
      try {
        await login(email, password);
        redirectAfterAuth();
      } catch (error) {
        setFormError(firebaseAuthErrorMessage(error));
      } finally {
        setSubmitting(false);
      }
    },
    [login, redirectAfterAuth],
  );

  return (
    <LoginWrapper>
      <LoginCard>
        <LoginTitle>ReDungeon</LoginTitle>
        <LoginSubtitle>Entre para ver seus personagens</LoginSubtitle>

        <Formik
          initialValues={loginInitialValues}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit: submit, isSubmitting }) => (
            <LoginForm onSubmit={submit} noValidate>
              <TextField
                name="email"
                type="email"
                label="E-mail"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                fullWidth
                size="small"
              />
              <TextField
                name="password"
                type="password"
                label="Senha"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                fullWidth
                size="small"
              />
              {formError && <LoginError>{formError}</LoginError>}
              <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth>
                Entrar
              </Button>
            </LoginForm>
          )}
        </Formik>
      </LoginCard>
    </LoginWrapper>
  );
};

export default Login;
