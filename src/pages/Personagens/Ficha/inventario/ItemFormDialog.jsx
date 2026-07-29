import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
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

const StyledDialog = styled(Dialog)`
  & .MuiPaper-root {
    background: linear-gradient(180deg, #17142a 0%, #211a38 100%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.55);
    border-radius: 22px;
    overflow: hidden;
  }
`;

const FormSection = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  backdrop-filter: blur(10px);
  padding: 20px 22px;
  display: grid;
  gap: 16px;
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--text-primary);
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--status-gold-strong);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.88rem;
`;

const SectionSubtitle = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
`;

const GridTwo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const GridThree = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  @media (max-width: 860px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    min-height: 48px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.03);
    align-items: flex-start;
  }
  & .MuiOutlinedInput-input {
    padding: 12px 14px;
  }
  & .MuiOutlinedInput-inputMultiline {
    padding: 14px 14px;
    line-height: 1.4;
    text-align: left;
    vertical-align: top;
  }
  & .MuiOutlinedInput-inputMultiline textarea {
    padding: 0;
    margin: 0;
    vertical-align: top;
  }
  & .MuiOutlinedInput-notchedOutline {
    border-color: rgba(255, 255, 255, 0.16);
  }
  &:hover .MuiOutlinedInput-notchedOutline {
    border-color: rgba(232, 203, 133, 0.35);
  }
  &.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: rgba(232, 203, 133, 0.9);
    box-shadow: 0 0 24px rgba(232, 203, 133, 0.16);
  }
`;

const FieldGroup = styled.div`
  display: grid;
  gap: 16px;
`;

const ActionsRow = styled(DialogActions)`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 18px 24px 24px;
`;

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
      <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, py: { xs: 2.5, sm: 3 } }}>
        <FormSection>
          <SectionHeader>
            <SectionTitle>✏️ Editar Item</SectionTitle>
            <SectionSubtitle>Reveja e atualize os atributos do item com a aparência de um relicário arcano.</SectionSubtitle>
          </SectionHeader>
          <GridTwo>
            <StyledTextField
              name="nome"
              label="📝 Nome"
              value={values.nome}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.nome && Boolean(errors.nome)}
              helperText={touched.nome && errors.nome}
              fullWidth
            />
            <StyledTextField
              name="linkImagem"
              label="🖼 URL da imagem (opcional)"
              value={values.linkImagem}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.linkImagem && Boolean(errors.linkImagem)}
              helperText={touched.linkImagem && errors.linkImagem}
              fullWidth
            />
          </GridTwo>
          <GridTwo>
            <StyledTextField
              name="tipo"
              label="🛡 Tipo"
              value={values.tipo}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.tipo && Boolean(errors.tipo)}
              helperText={touched.tipo && errors.tipo}
              fullWidth
            />
            <StyledTextField
              name="qualidade"
              label="💎 Qualidade"
              select
              value={values.qualidade}
              onChange={handleChange}
              fullWidth
            >
              {QUALIDADE_OPTIONS.map(opcao => (
                <MenuItem key={opcao} value={opcao}>
                  {opcao}
                </MenuItem>
              ))}
            </StyledTextField>
          </GridTwo>
        </FormSection>

        <FormSection>
          <SectionHeader>
            <SectionTitle>📊 Atributos</SectionTitle>
            <SectionSubtitle>Valores fundamentais do item organizados em uma malha clara.</SectionSubtitle>
          </SectionHeader>
          <GridThree>
            <StyledTextField
              name="nivelAtual"
              label="⭐ Nível Atual"
              type="number"
              value={values.nivelAtual}
              onChange={handleChange}
              error={touched.nivelAtual && Boolean(errors.nivelAtual)}
              helperText={touched.nivelAtual && errors.nivelAtual}
              fullWidth
            />
            <StyledTextField
              name="nivelMaximo"
              label="⭐ Nível Máximo (opcional)"
              type="number"
              value={values.nivelMaximo}
              onChange={handleChange}
              error={touched.nivelMaximo && Boolean(errors.nivelMaximo)}
              helperText={touched.nivelMaximo && errors.nivelMaximo}
              fullWidth
            />
            <StyledTextField
              name="dados"
              label="🎲 Roll (ex.: 2d4+3)"
              value={values.dados}
              onChange={handleChange}
              fullWidth
            />
            <StyledTextField
              name="pesoUnitario"
              label="⚖ Peso por unidade"
              type="number"
              value={values.pesoUnitario}
              onChange={handleChange}
              error={touched.pesoUnitario && Boolean(errors.pesoUnitario)}
              helperText={touched.pesoUnitario && errors.pesoUnitario}
              fullWidth
            />
            <StyledTextField
              name="bonusEspaco"
              label="🎒 Bônus de Espaço (armazenamento, opcional)"
              type="number"
              value={values.bonusEspaco}
              onChange={handleChange}
              error={touched.bonusEspaco && Boolean(errors.bonusEspaco)}
              helperText={touched.bonusEspaco && errors.bonusEspaco}
              fullWidth
            />
            <StyledTextField
              name="quantidade"
              label="📦 Quantidade"
              type="number"
              value={values.quantidade}
              onChange={handleChange}
              error={touched.quantidade && Boolean(errors.quantidade)}
              helperText={touched.quantidade && errors.quantidade}
              fullWidth
            />
          </GridThree>
        </FormSection>

        <FormSection>
          <SectionHeader>
            <SectionTitle>✨ Extras</SectionTitle>
            <SectionSubtitle>Detalhes que dão cor ao item e expandem sua narrativa.</SectionSubtitle>
          </SectionHeader>
          <FieldGroup>
            <StyledTextField
              name="extra"
              label="✨ Extra (opcional)"
              value={values.extra}
              onChange={handleChange}
              fullWidth
            />
            <StyledTextField
              name="descricao"
              label="📜 Descrição (opcional)"
              value={values.descricao}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={4}
              sx={{ '& .MuiOutlinedInput-root': { minHeight: 150, alignItems: 'flex-start', paddingTop: 0.5 } }}
            />
          </FieldGroup>
        </FormSection>

        <FormSection>
          <SectionHeader>
            <SectionTitle>⚔ Habilidades Especiais</SectionTitle>
            <SectionSubtitle>Cada habilidade ganha seu próprio relicário editável.</SectionSubtitle>
          </SectionHeader>
          <HabilidadesEspeciaisEditor
            habilidades={values.habilidadesEspeciais}
            onChange={novasHabilidades => setFieldValue('habilidadesEspeciais', novasHabilidades)}
          />
        </FormSection>
      </DialogContent>
      <ActionsRow>
        <Button variant="text" onClick={onClose} sx={{ flex: '1 1 140px', borderRadius: 14 }}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ flex: '1 1 160px', minWidth: 140 }}>
          Salvar
        </Button>
      </ActionsRow>
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
