import React, { useCallback, useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
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
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from 'context/AuthContext';
import { MOBILE } from 'common/styles/breakpoints';
import useIsMobile from 'hooks/useIsMobile';
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
  // Celular: cabeçalho de 56px (título + ícones + menu da conta) e, na ficha,
  // as abas numa 2ª linha com o ☰ da gaveta (headerExtra.onAbrirMenu).
  const isMobile = useIsMobile();
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
  const tabs = headerExtra?.tabs;

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
            background: 'linear-gradient(90deg, rgba(8, 7, 15, 0.98) 0%, rgba(16, 12, 28, 0.98) 32%, rgba(21, 16, 25, 0.98) 100%)',
            borderBottom: '1px solid rgba(232, 203, 133, 0.2)',
            boxShadow: '0 10px 30px rgba(6, 4, 11, 0.45)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <Toolbar
            sx={{
              minHeight: '72px',
              px: { xs: 2, sm: 2.5, md: 3 },
              py: 0,
              gap: { xs: 1, sm: 1.5, md: 2 },
              display: 'grid',
              gridTemplateColumns: tabs ? 'minmax(0, auto) minmax(0, 1fr) minmax(0, auto)' : 'minmax(0, 1fr) auto',
              alignItems: 'center',
              overflow: 'hidden',
              [MOBILE]: { minHeight: '56px', px: 1.5, gap: 1, gridTemplateColumns: 'minmax(0, 1fr) auto' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                minWidth: 0,
                maxWidth: '100%',
              }}
            >
              {headerExtra?.onVoltar && (
                <IconButton
                  aria-label="Voltar"
                  onClick={headerExtra.onVoltar}
                  sx={{
                    color: '#f6e8c1',
                    border: '1px solid rgba(232, 203, 133, 0.22)',
                    background: 'rgba(232, 203, 133, 0.05)',
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    '&:hover': { background: 'rgba(232, 203, 133, 0.12)', borderColor: 'rgba(232, 203, 133, 0.45)' },
                  }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              )}

              <Typography
                variant="h6"
                sx={{
                  color: '#f3f1ee',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  fontFamily: 'Georgia, "Palatino Linotype", serif',
                  fontSize: { xs: '1.05rem', sm: '1.2rem', md: '1.4rem' },
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {headerExtra?.nome ?? 'ReDungeon'}
              </Typography>
            </Box>

            {tabs && !isMobile && (
              <Box sx={{ flex: '1 1 auto', minWidth: 0, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                <Tabs
                  value={tabs.value}
                  onChange={tabs.onChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  textColor="inherit"
                  TabIndicatorProps={{
                    style: { height: 2, borderRadius: 999, background: 'linear-gradient(90deg, #e8cb85 0%, #b69a58 100%)' },
                  }}
                  sx={{
                    minHeight: 0,
                    maxWidth: '100%',
                    '& .MuiTabs-flexContainer': {
                      gap: { xs: 0.4, md: 0.8 },
                      minHeight: 0,
                    },
                    '& .MuiTabs-scrollButtons': {
                      color: '#f0dca8',
                    },
                  }}
                >
                  {tabs.items.map(tab => (
                    <Tab
                      key={tab.value}
                      value={tab.value}
                      label={tab.label}
                      icon={tab.icon}
                      iconPosition="start"
                      disableRipple
                      sx={{
                        minHeight: 0,
                        px: { xs: 1.1, md: 1.5 },
                        py: 0.7,
                        fontSize: { xs: '0.62rem', md: '0.72rem' },
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.72)',
                        borderRadius: '10px',
                        minWidth: 'auto',
                        opacity: 1,
                        transition: 'all 0.2s ease',
                        '&.Mui-selected': {
                          color: '#f8d88a',
                          background: 'rgba(232, 203, 133, 0.08)',
                          boxShadow: 'inset 0 0 0 1px rgba(232, 203, 133, 0.2)',
                        },
                        '&:hover': {
                          background: 'rgba(255,255,255,0.02)',
                          color: '#f0e4bf',
                        },
                      }}
                    />
                  ))}
                </Tabs>
              </Box>
            )}

            {currentUser && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 1.5,
                  minWidth: 0,
                  maxWidth: '100%',
                  [MOBILE]: { gap: 0.25 },
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
                  sx={{ display: 'none', color: '#f0ddae', [MOBILE]: { display: 'inline-flex' } }}
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

                {!tabs && (
                  <Box component="nav" sx={{ display: 'flex', gap: 0.5, flexShrink: 0, [MOBILE]: { display: 'none' } }}>
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
                )}

                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.72)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    maxWidth: { xs: '110px', sm: tabs ? '180px' : '220px', md: tabs ? '220px' : '260px' },
                    [MOBILE]: { display: 'none' },
                  }}
                >
                  {currentUser.email || 'wdanyllo_comp@hotmail.com'}
                </Typography>

                <Button
                  size="small"
                  onClick={logout}
                  sx={{
                    color: tabs ? '#f0ddae' : '#d9d0ff',
                    border: tabs ? '1px solid rgba(232, 203, 133, 0.34)' : '1px solid rgba(151, 124, 255, 0.8)',
                    borderRadius: '10px',
                    px: tabs ? 1.25 : 1.5,
                    py: 0.6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    fontWeight: 700,
                    fontSize: '0.62rem',
                    background: tabs ? 'rgba(232, 203, 133, 0.03)' : 'transparent',
                    minWidth: 'auto',
                    lineHeight: 1.2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: tabs ? 'rgba(232, 203, 133, 0.08)' : 'rgba(90, 79, 144, 0.28)',
                      borderColor: tabs ? 'rgba(232, 203, 133, 0.65)' : 'rgba(179, 160, 255, 0.95)',
                      boxShadow: tabs ? 'inset 0 0 0 1px rgba(232, 203, 133, 0.1)' : 'inset 0 0 0 1px rgba(179, 160, 255, 0.18)',
                    },
                    [MOBILE]: { display: 'none' },
                  }}
                >
                  SAIR
                </Button>
              </Box>
            )}
          </Toolbar>

          {/* Celular: abas da ficha numa 2ª linha (ícone em cima, rótulo curto). */}
          {tabs && isMobile && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderTop: '1px solid rgba(232, 203, 133, 0.12)',
                px: 0.5,
              }}
            >
              {headerExtra.onAbrirMenu && (
                <IconButton
                  aria-label="Abrir menu da ficha"
                  onClick={headerExtra.onAbrirMenu}
                  sx={{ color: '#f0dca8', flexShrink: 0 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Tabs
                value={tabs.value}
                onChange={tabs.onChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                textColor="inherit"
                TabIndicatorProps={{
                  style: { height: 2, borderRadius: 999, background: 'linear-gradient(90deg, #e8cb85 0%, #b69a58 100%)' },
                }}
                sx={{ flex: 1, minWidth: 0, '& .MuiTabs-scrollButtons': { width: 24, color: '#f0dca8' } }}
              >
                {tabs.items.map(tab => (
                  <Tab
                    key={tab.value}
                    value={tab.value}
                    label={tab.labelCurto ?? tab.label}
                    aria-label={tab.label}
                    icon={tab.icon}
                    iconPosition="top"
                    disableRipple
                    sx={{
                      minWidth: 64,
                      minHeight: 52,
                      px: 1,
                      py: 0.5,
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: 'rgba(255,255,255,0.72)',
                      '&.Mui-selected': { color: '#f8d88a' },
                    }}
                  />
                ))}
              </Tabs>
            </Box>
          )}
        </AppBar>
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            pt: '72px',
            [MOBILE]: { pt: tabs ? '109px' : '56px' },
          }}
        >
          <Outlet context={{ setHeaderExtra }} />
        </Box>
      </Box>
    </SelecaoContext.Provider>
  );
};

export default Layout;
