import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';

import { StatusValueRow } from '../styles';

const HabilidadesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const HabilidadeCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const HabilidadeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`;

const HabilidadeTitle = styled.div`
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--status-gold-strong);
`;

const FieldBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldLabel = styled.label`
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
`;

const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.03);
    min-height: 48px;
  }

  & .MuiOutlinedInput-input {
    padding: 12px 14px;
  }

  & .MuiOutlinedInput-root.MuiOutlinedInput-multiline {
    align-items: flex-start;
  }

  & .MuiOutlinedInput-inputMultiline,
  & .MuiInputBase-inputMultiline {
    padding: 16px;
    line-height: 1.5;
    min-height: 120px;
    max-height: 220px;
    resize: vertical;
    overflow: auto;
    text-align: left;
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

const RemoveButton = styled(IconButton)`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  &:hover {
    background: rgba(255, 107, 107, 0.18);
    color: #ff6b6b;
  }
`;

const AddButton = styled(Button)`
  align-self: flex-start;
  width: 200px;
  border-radius: 14px;
  padding: 10px 18px;
  background: linear-gradient(90deg, rgba(91, 124, 250, 0.96), rgba(232, 203, 133, 0.92));
  color: #1c1830;
  font-weight: 700;
  &:hover {
    filter: brightness(1.05);
    background: linear-gradient(90deg, rgba(91, 124, 250, 1), rgba(232, 203, 133, 1));
  }
`;

// Lista dinâmica de {nome, descricao} — não existe precedente de campo de
// array editável no resto do código (Autocomplete de condições é uma
// referência a outra coleção, não texto livre estruturado), então este é um
// componente novo, usado tanto pelo `ItemFormDialog` (editar) quanto pela aba
// Autoral do `CriarItemDialog` (criar).
const HabilidadesEspeciaisEditor = ({ habilidades, onChange }) => {
  const handleAdicionar = () => {
    onChange([...habilidades, { nome: '', descricao: '' }]);
  };

  const handleAlterar = (index, campo, valor) => {
    onChange(habilidades.map((habilidade, i) => (i === index ? { ...habilidade, [campo]: valor } : habilidade)));
  };

  const handleRemover = index => {
    onChange(habilidades.filter((_habilidade, i) => i !== index));
  };

  return (
    <HabilidadesWrapper>
      {habilidades.length === 0 && <StatusValueRow>Nenhuma habilidade especial adicionada.</StatusValueRow>}
      {habilidades.map((habilidade, index) => (
        // índice como key: habilidades especiais não têm id próprio (mesma convenção
        // das habilidades básicas de raça, documentada em CLAUDE.md)
        <HabilidadeCard key={index}>
          <HabilidadeHeader>
            <HabilidadeTitle>⚔ Habilidade {index + 1}</HabilidadeTitle>
            <RemoveButton size="small" onClick={() => handleRemover(index)} aria-label="Remover habilidade">
              <DeleteIcon fontSize="small" />
            </RemoveButton>
          </HabilidadeHeader>
          <FieldBlock>
            <FieldLabel htmlFor={`habilidade-nome-${index}`}>Nome</FieldLabel>
            <StyledTextField
              id={`habilidade-nome-${index}`}
              name="nome"
              size="small"
              value={habilidade.nome}
              onChange={event => handleAlterar(index, 'nome', event.target.value)}
              fullWidth
            />
          </FieldBlock>
          <FieldBlock>
            <FieldLabel htmlFor={`habilidade-descricao-${index}`}>Descrição</FieldLabel>
            <StyledTextField
              id={`habilidade-descricao-${index}`}
              name="descricao"
              size="small"
              value={habilidade.descricao}
              onChange={event => handleAlterar(index, 'descricao', event.target.value)}
              fullWidth
              multiline
              minRows={6}
            />
          </FieldBlock>
        </HabilidadeCard>
      ))}
      <AddButton size="small" variant="contained" onClick={handleAdicionar}>
        + Adicionar Habilidade
      </AddButton>
    </HabilidadesWrapper>
  );
};

HabilidadesEspeciaisEditor.propTypes = {
  habilidades: PropTypes.arrayOf(
    PropTypes.shape({ nome: PropTypes.string, descricao: PropTypes.string }),
  ).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default HabilidadesEspeciaisEditor;
