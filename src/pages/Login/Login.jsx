import React, { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik } from 'formik';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { useAuth } from 'context/AuthContext';

import {
  LoginAdornment,
  LoginCard,
  LoginDescription,
  LoginDivider,
  LoginError,
  LoginForm,
  LoginSubtitle,
  LoginTitle,
  LoginWrapper,
} from './styles';
import { firebaseAuthErrorMessage, loginInitialValues, loginSchema } from './utils';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(11, 17, 29, 0.8)',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    '& fieldset': {
      borderColor: 'rgba(130, 146, 255, 0.34)',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(155, 172, 255, 0.72)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(142, 167, 255, 0.98)',
      boxShadow: '0 0 0 3px rgba(110, 135, 255, 0.14)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(217, 227, 255, 0.7)',
    fontSize: '0.76rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    '&.Mui-focused': {
      color: '#dfe7ff',
    },
  },
  '& .MuiInputBase-input': {
    color: '#f3f6ff',
    paddingTop: '15px',
    paddingBottom: '15px',
    fontSize: '0.96rem',
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    marginTop: 6,
    fontSize: '0.74rem',
  },
};

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
        <LoginAdornment aria-hidden="true">◇</LoginAdornment>
        <LoginTitle>ReDungeon</LoginTitle>
        <LoginDivider />
        <LoginSubtitle>Entrar no Reino</LoginSubtitle>
        <LoginDescription>Acesse sua conta para continuar sua jornada.</LoginDescription>

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
                sx={fieldSx}
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
                sx={fieldSx}
              />
              {formError && <LoginError role="alert">{formError}</LoginError>}
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                fullWidth
                sx={{
                  mt: 2,
                  py: 1.3,
                  fontSize: '0.8rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  borderRadius: '12px',
                  background: 'linear-gradient(90deg, rgba(27, 44, 95, 0.96) 0%, rgba(78, 94, 220, 0.96) 100%)',
                  border: '1px solid rgba(150, 172, 255, 0.38)',
                  boxShadow: '0 12px 24px rgba(57, 72, 146, 0.28)',
                  color: '#f5f7ff',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'linear-gradient(90deg, rgba(38, 57, 110, 1) 0%, rgba(87, 101, 220, 1) 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 14px 26px rgba(72, 88, 173, 0.35)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&.Mui-disabled': {
                    opacity: 0.7,
                    color: 'rgba(255,255,255,0.8)',
                  },
                }}
              >
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
