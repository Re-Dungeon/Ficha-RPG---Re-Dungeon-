import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ErrorOutlineIcon from '@mui/icons-material/Error';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Erro não tratado capturado pelo ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            flex: 1,
            padding: 4,
            textAlign: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: '12px',
            margin: 2,
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 40, color: 'var(--color-primary)' }} />
          <Typography variant="h6" sx={{ color: 'var(--text-primary)' }}>
            Algo deu errado
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', maxWidth: 420 }}>
            {this.props.mensagem ??
              'Ocorreu um erro inesperado nesta tela. Recarregue a página para tentar novamente.'}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Recarregar
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  mensagem: PropTypes.string,
};

ErrorBoundary.defaultProps = {
  mensagem: undefined,
};

export default ErrorBoundary;
