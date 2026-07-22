import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';

import { OverlayBackdrop } from './styles';

const SavingOverlay = ({ open }) => {
  if (!open) {
    return null;
  }

  return (
    <OverlayBackdrop role="status" aria-label="Salvando">
      <CircularProgress size={56} sx={{ color: 'var(--color-primary)' }} />
    </OverlayBackdrop>
  );
};

SavingOverlay.propTypes = {
  open: PropTypes.bool.isRequired,
};

export default SavingOverlay;
