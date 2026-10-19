import React from 'react';
import PropTypes from 'prop-types';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const ErrorSnackbar = ({ open, mensagem, onClose }) => (
  <Snackbar
    open={open}
    autoHideDuration={6000}
    onClose={onClose}
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    sx={{
      top: 16,
      right: 16,
      left: 'auto',
      bottom: 'auto',
      '& .MuiSnackbarContent-root': {
        minWidth: 'min(420px, calc(100vw - 32px))',
      },
    }}
  >
    <Alert onClose={onClose} severity="error" variant="filled" sx={{ width: '100%' }}>
      {mensagem}
    </Alert>
  </Snackbar>
);

ErrorSnackbar.propTypes = {
  open: PropTypes.bool.isRequired,
  mensagem: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

ErrorSnackbar.defaultProps = {
  mensagem: '',
};

export default ErrorSnackbar;
