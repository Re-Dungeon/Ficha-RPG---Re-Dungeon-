import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { TIPO_ART_OPTIONS } from './constants';
import NucleoCard from './NucleoCard';
import { CardsGrid, EmptyState, SectionActions, SectionBlock, SectionHeaderRow, SectionHeaderTitle } from './styles';

const NucleosSection = ({ nucleos, arts, onCriar, onVer, onEditar, onRemover }) => {
  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState('');

  const nucleosFiltrados = nucleos.filter(
    nucleo => nucleo.nome.toLowerCase().includes(texto.toLowerCase()) && (!tipo || nucleo.tipo === tipo),
  );

  return (
    <SectionBlock>
      <SectionHeaderRow>
        <SectionHeaderTitle>🎯 Núcleos</SectionHeaderTitle>
        <SectionActions>
          <TextField
            size="small"
            placeholder="Filtrar núcleos..."
            value={texto}
            onChange={event => setTexto(event.target.value)}
          />
          <TextField size="small" select value={tipo} onChange={event => setTipo(event.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value="">Todos os tipos</MenuItem>
            {TIPO_ART_OPTIONS.map(opcao => (
              <MenuItem key={opcao} value={opcao}>
                {opcao}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" size="small" onClick={onCriar}>
            + Criar Núcleo
          </Button>
        </SectionActions>
      </SectionHeaderRow>

      <CardsGrid>
        {nucleosFiltrados.length === 0 && (
          <EmptyState>Nenhum núcleo criado. Crie um para começar!</EmptyState>
        )}
        {nucleosFiltrados.map(nucleo => (
          <NucleoCard
            key={nucleo.id}
            nucleo={nucleo}
            artsCount={arts.filter(art => art.nucleoId === nucleo.id).length}
            onVer={() => onVer(nucleo)}
            onEditar={() => onEditar(nucleo)}
            onRemover={() => onRemover(nucleo)}
          />
        ))}
      </CardsGrid>
    </SectionBlock>
  );
};

NucleosSection.propTypes = {
  nucleos: PropTypes.array.isRequired,
  arts: PropTypes.array.isRequired,
  onCriar: PropTypes.func.isRequired,
  onVer: PropTypes.func.isRequired,
  onEditar: PropTypes.func.isRequired,
  onRemover: PropTypes.func.isRequired,
};

export default NucleosSection;
