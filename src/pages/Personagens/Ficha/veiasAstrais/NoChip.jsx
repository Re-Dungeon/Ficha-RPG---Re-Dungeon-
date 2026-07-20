import React from 'react';
import PropTypes from 'prop-types';

const NoChip = ({ no, desbloqueado, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      padding: '10px 14px',
      borderRadius: 10,
      minWidth: 90,
      border: `1px solid ${desbloqueado ? 'var(--color-accent)' : 'var(--border-primary)'}`,
      background: desbloqueado ? 'rgba(34, 211, 238, 0.08)' : 'var(--bg-card)',
      color: 'var(--text-primary)',
      cursor: 'pointer',
    }}
  >
    <span style={{ fontSize: 18 }}>{desbloqueado ? '⭐' : '🔒'}</span>
    <span style={{ fontSize: 12, textAlign: 'center' }}>{no.nome ?? `Nó ${no.id}`}</span>
    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{no.custo} PC</span>
  </button>
);

NoChip.propTypes = {
  no: PropTypes.object.isRequired,
  desbloqueado: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default NoChip;
