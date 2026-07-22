import React, { Suspense } from 'react';
import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from 'context/AuthContext';

const PageLoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      height: '100%',
    }}
  >
    <CircularProgress sx={{ color: 'var(--color-primary)' }} />
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
