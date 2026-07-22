import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { TIPO_ART_OPTIONS } from './constants';
import { ArtsGrid, EmptyState, SectionActions, SectionBlock, SectionHeaderRow, SectionHeaderTitle } from './styles';
import VarianteCard from './VarianteCard';

const VariantesSection = ({ variantes, arts, nucleos, condicoes, onCriar, onVer, onEditar, onRemover }) => {
  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState('');

  const artesPorId = useMemo(() => new Map(arts.map(art => [art.id, art])), [arts]);
  const nucleosPorId = useMemo(() => new Map(nucleos.map(nucleo => [nucleo.id, nucleo])), [nucleos]);

  const variantesFiltradas = variantes.filter(
    variante =>
      variante.nome.toLowerCase().includes(texto.toLowerCase()) && (!tipo || variante.tipo === tipo),
  );

  const semArts = arts.length === 0;

  return (
    <SectionBlock>
      <SectionHeaderRow>
        <SectionHeaderTitle>🌟 Variantes</SectionHeaderTitle>
        <SectionActions>
          <TextField
            size="small"
            placeholder="Filtrar variantes..."
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
          <Button
            variant="contained"
            size="small"
            onClick={onCriar}
            disabled={semArts}
            title={semArts ? 'Crie uma Art primeiro!' : undefined}
          >
            ✨ Criar Nova Variante
          </Button>
        </SectionActions>
      </SectionHeaderRow>

      <ArtsGrid>
        {variantesFiltradas.length === 0 && (
          <EmptyState style={{ gridColumn: '1 / -1' }}>
            Nenhuma variante criada. Crie uma variação em uma arte!
          </EmptyState>
        )}
        {variantesFiltradas.map(variante => (
          <VarianteCard
            key={variante.id}
            variante={variante}
            art={artesPorId.get(variante.artId)}
            nucleo={nucleosPorId.get(artesPorId.get(variante.artId)?.nucleoId)}
            condicoes={condicoes}
            onVer={() => onVer(variante)}
            onEditar={() => onEditar(variante)}
            onRemover={() => onRemover(variante)}
          />
        ))}
      </ArtsGrid>
    </SectionBlock>
  );
};

VariantesSection.propTypes = {
  variantes: PropTypes.array.isRequired,
  arts: PropTypes.array.isRequired,
  nucleos: PropTypes.array.isRequired,
  condicoes: PropTypes.array.isRequired,
  onCriar: PropTypes.func.isRequired,
  onVer: PropTypes.func.isRequired,
  onEditar: PropTypes.func.isRequired,
  onRemover: PropTypes.func.isRequired,
};

export default VariantesSection;
