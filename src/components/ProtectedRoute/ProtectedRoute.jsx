import React, { Suspense } from 'react';
import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from 'context/AuthContext';

const girar = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const pulsar = keyframes`
  0%,
  100% {
    opacity: 0.45;
  }
  50% {
    opacity: 0.9;
  }
`;

const Tela = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 18px;
  flex: 1;
  height: 100%;
  min-height: 100vh;
  background: radial-gradient(circle at center, rgba(15, 24, 39, 0.96) 0%, rgba(8, 15, 27, 0.99) 48%, rgba(4, 9, 16, 1) 100%);
`;

const Anel = styled.svg`
  display: block;
  width: 64px;
  height: 64px;
  color: var(--color-primary, #e8cb85);
  animation: ${girar} 1.1s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Marca = styled.span`
  font-size: 0.8rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--color-primary, #e8cb85);
  animation: ${pulsar} 2.2s ease-in-out infinite;
  user-select: none;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.7;
  }
`;

const PageLoadingFallback = () => (
  <Tela role="status" aria-live="polite" aria-label="Carregando aplicação">
    <Anel viewBox="0 0 50 50" aria-hidden="true" focusable="false">
      <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="3" />
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="32 94"
      />
    </Anel>
    <Marca aria-hidden="true">Re:Dungeon</Marca>
  </Tela>
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
