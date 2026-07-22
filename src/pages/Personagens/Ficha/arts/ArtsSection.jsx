import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { TIPO_ART_OPTIONS } from './constants';
import ArtCard from './ArtCard';
import { ArtsGrid, EmptyState, SectionActions, SectionBlock, SectionHeaderRow, SectionHeaderTitle } from './styles';
import { StatusValueRow } from '../styles';

const ArtsSection = ({
  arts,
  nucleos,
  condicoes,
  onCriar,
  onVer,
  onEditar,
  onRemover,
  onToggleAtiva,
  onReorganizar,
}) => {
  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState('');

  const nucleosPorId = useMemo(() => new Map(nucleos.map(nucleo => [nucleo.id, nucleo])), [nucleos]);

  const artsFiltradas = arts.filter(
    art => art.nome.toLowerCase().includes(texto.toLowerCase()) && (!tipo || art.tipo === tipo),
  );

  const semNucleos = nucleos.length === 0;

  return (
    <SectionBlock>
      <SectionHeaderRow>
        <SectionHeaderTitle>✨ Arts (Habilidades)</SectionHeaderTitle>
        <SectionActions>
          <TextField
            size="small"
            placeholder="Filtrar habilidades..."
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
            disabled={semNucleos}
            title={semNucleos ? 'Crie um Núcleo primeiro!' : undefined}
          >
            + Criar Art
          </Button>
        </SectionActions>
      </SectionHeaderRow>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
        <Button size="small" variant="outlined" onClick={onReorganizar}>
          🔓 Reorganizar automaticamente
        </Button>
        <StatusValueRow>
          Quando os atributos mudam, o limite pode mudar — use o botão acima pra bloquear as Arts
          mais recentes ou desbloquear as mais antigas conforme o novo limite.
        </StatusValueRow>
      </div>

      <ArtsGrid>
        {artsFiltradas.length === 0 && (
          <EmptyState style={{ gridColumn: '1 / -1' }}>
            Nenhuma arte criada. Crie uma a partir de um núcleo!
          </EmptyState>
        )}
        {artsFiltradas.map(art => (
          <ArtCard
            key={art.id}
            art={art}
            nucleo={nucleosPorId.get(art.nucleoId)}
            condicoes={condicoes}
            onVer={() => onVer(art)}
            onEditar={() => onEditar(art)}
            onRemover={() => onRemover(art)}
            onToggleAtiva={() => onToggleAtiva(art)}
          />
        ))}
      </ArtsGrid>
    </SectionBlock>
  );
};

ArtsSection.propTypes = {
  arts: PropTypes.array.isRequired,
  nucleos: PropTypes.array.isRequired,
  condicoes: PropTypes.array.isRequired,
  onCriar: PropTypes.func.isRequired,
  onVer: PropTypes.func.isRequired,
  onEditar: PropTypes.func.isRequired,
  onRemover: PropTypes.func.isRequired,
  onToggleAtiva: PropTypes.func.isRequired,
  onReorganizar: PropTypes.func.isRequired,
};

export default ArtsSection;
