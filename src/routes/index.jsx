import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

import Layout from 'components/Layout/Layout';
import ProtectedRoute from 'components/ProtectedRoute/ProtectedRoute';
import Login from 'pages/Login/Login';
import Personagens from 'pages/Personagens/Personagens';
import NovoPersonagem from 'pages/Personagens/NovoPersonagem';
import Ficha from 'pages/Personagens/Ficha/Ficha';

const router = createBrowserRouter([
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
        ],
      },
      { path: '/', element: <Navigate to="/personagens" replace /> },
      { path: '*', element: <Navigate to="/personagens" replace /> },
    ],
  },
]);

export default router;
