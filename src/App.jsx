import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AuthProvider } from 'context/AuthContext';
import theme from 'common/styles/theme';
import router from 'routes/index.jsx';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
