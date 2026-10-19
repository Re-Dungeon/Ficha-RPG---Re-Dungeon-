import React, { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

import Layout from 'components/Layout/Layout';
import ProtectedRoute from 'components/ProtectedRoute/ProtectedRoute';
import Login from 'pages/Login/Login';

// ProtectedRoute já envolve o <Outlet/> num <Suspense>, então essas páginas
// (as únicas atrás do login) saem do bundle inicial sem precisar de fallback próprio.
const Personagens = lazy(() => import('pages/Personagens/Personagens'));
const NovoPersonagem = lazy(() => import('pages/Personagens/NovoPersonagem'));
const Ficha = lazy(() => import('pages/Personagens/Ficha/Ficha'));
const Campanhas = lazy(() => import('pages/Campanhas/Campanhas'));
const CampanhaChat = lazy(() => import('pages/Campanhas/CampanhaChat'));

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/login', element: <Login /> },
        {
          element: <ProtectedRoute />,
          children: [
            { path: '/personagens', element: <Personagens /> },
            { path: '/personagens/novo', element: <NovoPersonagem /> },
            { path: '/personagens/:id', element: <Ficha /> },
            { path: '/campanhas', element: <Campanhas /> },
            { path: '/campanhas/:id/chat', element: <CampanhaChat /> },
            { path: '/campanhas/:id/grid', element: <CampanhaChat visao="grid" /> },
          ],
        },
        { path: '/', element: <Navigate to="/personagens" replace /> },
        { path: '*', element: <Navigate to="/personagens" replace /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
);

export default router;
