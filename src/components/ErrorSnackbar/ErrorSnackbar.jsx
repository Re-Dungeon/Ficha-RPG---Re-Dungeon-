import React from 'react';
import PropTypes from 'prop-types';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const ErrorSnackbar = ({ open, mensagem, onClose }) => (
  <Snackbar
    open={open}
    autoHideDuration={6000}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
