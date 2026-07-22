import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';

import { StatusValueRow } from '../styles';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StatusValueRow style={{ display: 'block', fontWeight: 600 }}>Habilidades Especiais (opcional)</StatusValueRow>
      {habilidades.length === 0 && <StatusValueRow>Nenhuma habilidade especial adicionada.</StatusValueRow>}
      {habilidades.map((habilidade, index) => (
        // índice como key: habilidades especiais não têm id próprio (mesma convenção
        // das habilidades básicas de raça, documentada em CLAUDE.md)
        <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <TextField
            label="Nome"
            size="small"
            value={habilidade.nome}
            onChange={event => handleAlterar(index, 'nome', event.target.value)}
            sx={{ flex: 1, minWidth: 100 }}
          />
          <TextField
            label="Descrição"
            size="small"
            value={habilidade.descricao}
            onChange={event => handleAlterar(index, 'descricao', event.target.value)}
            sx={{ flex: 2, minWidth: 160 }}
          />
          <IconButton size="small" onClick={() => handleRemover(index)} aria-label="Remover habilidade">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </div>
      ))}
      <Button size="small" variant="outlined" onClick={handleAdicionar} sx={{ alignSelf: 'flex-start' }}>
        + Adicionar Habilidade
      </Button>
    </div>
  );
};

HabilidadesEspeciaisEditor.propTypes = {
  habilidades: PropTypes.arrayOf(
    PropTypes.shape({ nome: PropTypes.string, descricao: PropTypes.string }),
  ).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default HabilidadesEspeciaisEditor;
