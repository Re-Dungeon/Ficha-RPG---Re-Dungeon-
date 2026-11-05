import React, { Suspense } from 'react';
import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import Box from '@mui/material/Box';
import { useAuth } from 'context/AuthContext';

const GIF_LOADING_URL = 'https://i.imgur.com/fBSP9Dd.gif';

const PageLoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      height: '100%',
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, rgba(15, 24, 39, 0.96) 0%, rgba(8, 15, 27, 0.99) 48%, rgba(4, 9, 16, 1) 100%)',
    }}
  >
    <Box
      component="img"
      src={GIF_LOADING_URL}
      alt="Carregando aplicação"
      aria-label="Carregando aplicação"
      draggable={false}
      sx={{
        display: 'block',
        width: 'auto',
        maxWidth: 'min(28vw, 220px)',
        height: 'auto',
        maxHeight: 'min(28vw, 220px)',
        objectFit: 'contain',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    />
  </Box>
);

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const outletContext = useOutletContext();

  if (loading) {
    return <PageLoadingFallback />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Outlet context={outletContext} />
    </Suspense>
  );
};

export default ProtectedRoute;
