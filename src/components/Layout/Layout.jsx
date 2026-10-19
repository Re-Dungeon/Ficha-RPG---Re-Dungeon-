import React, { useCallback, useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { useAuth } from 'context/AuthContext';
import { MOBILE } from 'common/styles/breakpoints';
import { SelecaoContext } from 'context/selecaoContext';
import {
  SELECAO_VAZIA,
  destinoCampanhas,
  destinoFichas,
  mesmoPersonagemSelecionado,
  resumoPersonagem,
} from 'common/utils/navegacao';

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const [headerExtra, setHeaderExtra] = useState(null);
  const [selecao, setSelecao] = useState(SELECAO_VAZIA);
  // Menu da conta (e-mail + Sair) — só aparece no celular.
  const [menuContaAncora, setMenuContaAncora] = useState(null);

  const selecionarPersonagem = useCallback(personagem => {
    const resumo = resumoPersonagem(personagem);
    setSelecao(atual =>
      mesmoPersonagemSelecionado(atual.personagem, resumo) ? atual : { ...atual, personagem: resumo },
    );
  }, []);

  const selecionarCampanha = useCallback((campanhaId, visaoCampanha = 'chat') => {
    setSelecao(atual =>
      atual.campanhaId === campanhaId && atual.visaoCampanha === visaoCampanha
        ? atual
        : { ...atual, campanhaId, visaoCampanha },
    );
  }, []);

  const limparPersonagem = useCallback(() => {
    setSelecao(atual => (atual.personagem === null ? atual : { ...atual, personagem: null }));
  }, []);

  const limparCampanha = useCallback(() => {
    setSelecao(atual => (atual.campanhaId === null ? atual : { ...atual, campanhaId: null }));
  }, []);

  const selecaoValue = useMemo(
    () => ({ selecao, selecionarPersonagem, selecionarCampanha, limparPersonagem, limparCampanha }),
    [selecao, selecionarPersonagem, selecionarCampanha, limparPersonagem, limparCampanha],
  );

  const destinoCampanha = destinoCampanhas(selecao);
  const navLinks = [
    { key: 'fichas', to: destinoFichas(selecao), state: null, label: 'Fichas', Icon: AssignmentIndOutlinedIcon },
    {
      key: 'campanhas',
      to: destinoCampanha.to,
      state: destinoCampanha.state,
      label: 'Campanhas',
      Icon: GroupsOutlinedIcon,
    },
  ];

  const handleSairDoMenu = () => {
    setMenuContaAncora(null);
    logout();
  };

  return (
    <SelecaoContext.Provider value={selecaoValue}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        <AppBar
          position="fixed"
          sx={{
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            background: 'linear-gradient(90deg, rgba(5, 9, 18, 0.96) 0%, rgba(12, 13, 33, 0.96) 38%, rgba(26, 12, 38, 0.96) 100%)',
            borderBottom: '1px solid rgba(143, 109, 255, 0.28)',
            boxShadow: 'none',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <Toolbar
            sx={{
              minHeight: '64px',
              px: { xs: 2, sm: 3, md: 4 },
              py: 0,
              gap: 2,
              justifyContent: 'space-between',
              [MOBILE]: { px: 1.5, gap: 1 },
            }}
          >
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1, [MOBILE]: { gap: 1 } }}
            >
              {headerExtra?.onVoltar && (
                <IconButton
                  aria-label="Voltar"
                  onClick={headerExtra.onVoltar}
                  sx={{
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.02)',
                    '&:hover': { background: 'rgba(255,255,255,0.05)' },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              )}

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  minWidth: 0,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    bottom: '-8px',
                    width: '42px',
                    height: '2px',
                    borderRadius: '999px',
                    background: 'linear-gradient(90deg, rgba(170, 138, 255, 0.9), rgba(170, 138, 255, 0.15))',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: '#f3f1ee',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    fontFamily: 'Georgia, "Palatino Linotype", serif',
                    fontSize: { xs: '1.3rem', sm: '1.5rem' },
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    // Nome longo de personagem/campanha vira reticências.
                    [MOBILE]: { overflow: 'hidden', textOverflow: 'ellipsis', py: 0.5 },
                  }}
                >
                  {headerExtra?.nome ?? 'ReDungeon'}
                </Typography>
              </Box>
            </Box>

            {currentUser && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  ml: 'auto',
                  [MOBILE]: { gap: 0.25, flexShrink: 0 },
                }}
              >
                {/* Celular: navegação só com ícone + menu da conta (e-mail/Sair). */}
                <Box component="nav" sx={{ display: 'none', [MOBILE]: { display: 'flex' } }}>
                  {navLinks.map(({ key, to, state, label, Icon }) => (
                    <IconButton
                      key={key}
                      component={NavLink}
                      to={to}
                      state={state}
                      aria-label={label}
                      sx={{ color: 'rgba(255,255,255,0.7)', '&.active': { color: 'var(--color-primary)' } }}
                    >
                      <Icon />
                    </IconButton>
                  ))}
                </Box>
                <IconButton
                  aria-label="Conta"
                  aria-haspopup="menu"
                  onClick={event => setMenuContaAncora(event.currentTarget)}
                  sx={{ display: 'none', color: '#d9d0ff', [MOBILE]: { display: 'inline-flex' } }}
                >
                  <AccountCircleOutlinedIcon />
                </IconButton>
                <Menu
                  anchorEl={menuContaAncora}
                  open={Boolean(menuContaAncora)}
                  onClose={() => setMenuContaAncora(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem disabled sx={{ fontSize: '0.8rem', '&.Mui-disabled': { opacity: 1 } }}>
                    {currentUser.email}
                  </MenuItem>
                  <MenuItem onClick={handleSairDoMenu}>Sair</MenuItem>
                </Menu>

                <Box component="nav" sx={{ display: 'flex', gap: 0.5, [MOBILE]: { display: 'none' } }}>
                  {navLinks.map(({ key, to, state, label }) => (
                    <Button
                      key={key}
                      component={NavLink}
                      to={to}
                      state={state}
                      size="small"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.72rem',
                        letterSpacing: '0.08em',
                        fontWeight: 700,
                        minWidth: 'auto',
                        '&.active': { color: 'var(--color-primary)' },
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.76rem',
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    maxWidth: { xs: '110px', sm: '220px' },
                    [MOBILE]: { display: 'none' },
                  }}
                >
                  {currentUser.email || 'wdanyllo_comp@hotmail.com'}
                </Typography>

                <Button
                  size="small"
                  onClick={logout}
                  sx={{
                    color: '#d9d0ff',
                    border: '1px solid rgba(151, 124, 255, 0.8)',
                    borderRadius: '10px',
                    px: 1.5,
                    py: 0.65,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    fontWeight: 700,
                    fontSize: '0.66rem',
                    background: 'transparent',
                    minWidth: 'auto',
                    lineHeight: 1.2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(90, 79, 144, 0.28)',
                      borderColor: 'rgba(179, 160, 255, 0.95)',
                      boxShadow: 'inset 0 0 0 1px rgba(179, 160, 255, 0.18)',
                    },
                    [MOBILE]: { display: 'none' },
                  }}
                >
                  SAIR
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: '64px' }}>
          <Outlet context={{ setHeaderExtra }} />
        </Box>
      </Box>
    </SelecaoContext.Provider>
  );
};

export default Layout;
