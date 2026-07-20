import React from 'react';
import { Outlet } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useAuth } from 'context/AuthContext';

const Layout = () => {
  const { currentUser, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <AppBar
        position="static"
        sx={{ background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-md)' }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, color: 'var(--text-primary)' }}>
            ReDungeon
          </Typography>
          {currentUser && (
            <>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                {currentUser.email}
              </Typography>
              <Button
                size="small"
                onClick={logout}
                sx={{ color: 'var(--color-accent)' }}
              >
                Sair
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
