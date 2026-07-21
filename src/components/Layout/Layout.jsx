import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from 'context/AuthContext';

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const [headerExtra, setHeaderExtra] = useState(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <AppBar
        position="static"
        sx={{ background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-md)' }}
      >
        <Toolbar sx={{ gap: 2 }}>
          {headerExtra?.onVoltar && (
            <IconButton
              aria-label="Voltar"
              onClick={headerExtra.onVoltar}
              sx={{ color: 'var(--text-primary)' }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, color: 'var(--text-primary)' }}>
            {headerExtra?.nome ?? 'ReDungeon'}
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
        <Outlet context={{ setHeaderExtra }} />
      </Box>
    </Box>
  );
};

export default Layout;
