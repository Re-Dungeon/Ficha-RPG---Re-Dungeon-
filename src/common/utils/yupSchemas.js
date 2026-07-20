import * as yup from 'yup';

export const nomeSchema = yup
  .string()
  .trim()
  .min(2, 'Nome deve ter ao menos 2 caracteres')
  .max(60, 'Nome deve ter no máximo 60 caracteres')
  .required('Nome é obrigatório');

export const campoCurtoSchema = yup
  .string()
  .trim()
  .max(120, 'Deve ter no máximo 120 caracteres');

export const descricaoSchema = yup
  .string()
  .trim()
  .max(5000, 'Deve ter no máximo 5000 caracteres');

export const urlImagemSchema = yup
  .string()
  .trim()
  .url('Informe uma URL válida (ex.: https://...)');
