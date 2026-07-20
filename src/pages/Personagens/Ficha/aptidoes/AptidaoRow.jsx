import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

import { AtributoCardWrapper, CardTitle, StatusValueRow } from '../styles';

const AptidaoRow = ({ nome, nivel, nivelMaximo, vantagens, onUpgrade, onReset, onRemover }) => {
  const vantagensDesbloqueadas = vantagens
    .filter(vantagem => vantagem.nivel <= nivel)
    .sort((a, b) => a.nivel - b.nivel);

  return (
    <AtributoCardWrapper style={{ alignItems: 'flex-start' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <CardTitle>
          {nome} — Nível {nivel} / {nivelMaximo}
        </CardTitle>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="small" variant="outlined" disabled={nivel >= nivelMaximo} onClick={onUpgrade}>
            ⬆️ Upgrade
          </Button>
          <Button size="small" variant="outlined" disabled={nivel === 0} onClick={onReset}>
            🔄 Reset
          </Button>
          <Button size="small" variant="outlined" color="error" onClick={onRemover}>
            ❌ Remover
          </Button>
        </div>
      </div>
      {vantagensDesbloqueadas.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {vantagensDesbloqueadas.map(vantagem => (
            <StatusValueRow key={vantagem.nivel} style={{ display: 'block' }}>
              Nível {vantagem.nivel}: {vantagem.texto}
            </StatusValueRow>
          ))}
        </div>
      )}
    </AtributoCardWrapper>
  );
};

AptidaoRow.propTypes = {
  nome: PropTypes.string.isRequired,
  nivel: PropTypes.number.isRequired,
  nivelMaximo: PropTypes.number.isRequired,
  vantagens: PropTypes.array.isRequired,
  onUpgrade: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onRemover: PropTypes.func.isRequired,
};

export default AptidaoRow;
