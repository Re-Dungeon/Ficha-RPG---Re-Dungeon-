import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string().trim().email('E-mail inválido').required('E-mail é obrigatório'),
  password: yup
    .string()
    .min(6, 'Senha deve ter ao menos 6 caracteres')
    .required('Senha é obrigatória'),
});

export const loginInitialValues = { email: '', password: '' };

export const firebaseAuthErrorMessage = error => {
  switch (error?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha incorretos.';
    default:
      return 'Não foi possível concluir a ação. Tente novamente.';
  }
};
