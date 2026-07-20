import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

const DraftBanner = ({ onRestaurar, onDescartar }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap',
      padding: '10px 16px',
      marginBottom: 16,
      borderRadius: 8,
      border: '1px solid var(--color-accent)',
      background: 'rgba(34, 211, 238, 0.08)',
      color: 'var(--text-primary)',
    }}
  >
    <span>Você tem alterações não salvas nesta aba, de uma sessão anterior.</span>
    <div style={{ display: 'flex', gap: 8 }}>
      <Button size="small" variant="outlined" onClick={onDescartar}>
        Descartar
      </Button>
      <Button size="small" variant="contained" onClick={onRestaurar}>
        Restaurar
      </Button>
    </div>
  </div>
);

DraftBanner.propTypes = {
  onRestaurar: PropTypes.func.isRequired,
  onDescartar: PropTypes.func.isRequired,
};

export default DraftBanner;
