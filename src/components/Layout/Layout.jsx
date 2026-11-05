import React, { useCallback, useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
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

  const usuarioDisplayName = currentUser?.displayName?.trim() || '';
  const usuarioEmail = currentUser?.email || 'Jogador';
  const usuarioPrimaryText = usuarioDisplayName || usuarioEmail;
  const usuarioSecondaryText = usuarioDisplayName ? usuarioEmail : null;
  const usuarioEmailCompacto = usuarioEmail.includes('@') ? usuarioEmail.split('@')[0] : usuarioEmail;
  const usuarioBotaoText = usuarioDisplayName || usuarioEmailCompacto;

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
            background: 'linear-gradient(90deg, rgba(8, 7, 15, 0.98) 0%, rgba(18, 13, 30, 0.96) 40%, rgba(17, 14, 24, 0.98) 100%)',
            borderBottom: '1px solid rgba(232, 203, 133, 0.24)',
            boxShadow: '0 14px 28px rgba(6, 4, 11, 0.42)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <Toolbar
            sx={{
              minHeight: tabs ? '74px' : '76px',
              px: { xs: 2, sm: 2.5, md: 3 },
              py: 0,
              gap: { xs: 1, sm: 1.5, md: 2 },
              display: 'grid',
              gridTemplateColumns: tabs ? 'minmax(0, auto) minmax(0, 1fr) minmax(0, auto)' : 'minmax(0, auto) minmax(0, 1fr) minmax(0, auto)',
              alignItems: 'center',
              overflow: 'hidden',
              [MOBILE]: { minHeight: tabs ? '56px' : '62px', px: 1.5, gap: 1, gridTemplateColumns: tabs ? 'minmax(0, 1fr) auto' : 'minmax(0, auto) minmax(0, 1fr) auto' },
            }}
          >
            {headerExtra?.onVoltar || tabs ? (
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
                  {headerExtra?.nome ?? 'Re'}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 0,
                  maxWidth: '100%',
                  [MOBILE]: { gap: 0 },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    component="div"
                    sx={{
                      color: '#f4dca2',
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontSize: { xs: '1.15rem', sm: '1.45rem' },
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Re
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255,255,255,0.52)',
                      fontSize: '0.55rem',
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      display: 'block',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    GERENCIADOR DE PERSONAGENS
                  </Typography>
                </Box>
              </Box>
            )}

            {tabs && !isMobile && (
              <Box sx={{ flex: '1 1 auto', minWidth: 0, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                <Tabs
                  value={tabs.value}
                  onChange={tabs.onChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  textColor="inherit"
                  sx={{
                    minHeight: 0,
                    maxWidth: '100%',
                    '& .MuiTabs-indicator': {
                      height: 2,
                      borderRadius: 999,
                      background: 'linear-gradient(90deg, #e8cb85 0%, #b69a58 100%)',
                    },
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

            {!tabs && !headerExtra?.onVoltar && (
              <Box component="nav" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    padding: '6px 8px',
                    background: 'rgba(22, 18, 34, 0.8)',
                    border: '1px solid rgba(152, 130, 247, 0.32)',
                    borderRadius: '999px',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                    maxWidth: '100%',
                    [MOBILE]: { display: 'none' },
                  }}
                >
                  {navLinks.map(({ key, to, state, label }) => (
                    <Button
                      key={key}
                      component={NavLink}
                      to={to}
                      state={state}
                      size="small"
                      sx={{
                        color: 'rgba(240, 236, 255, 0.74)',
                        background: 'transparent',
                        border: '1px solid transparent',
                        borderRadius: '999px',
                        minWidth: 116,
                        px: 2,
                        py: 0.9,
                        fontSize: '0.7rem',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.04)',
                          color: '#f2ebff',
                        },
                        '&:focus-visible': {
                          outline: '2px solid rgba(232, 203, 133, 0.9)',
                          outlineOffset: '2px',
                        },
                        '&.active': {
                          color: '#f4dca2',
                          background: 'linear-gradient(180deg, rgba(71, 58, 109, 0.86), rgba(32, 24, 50, 0.96))',
                          borderColor: 'rgba(232, 203, 133, 0.5)',
                          boxShadow: 'inset 0 -2px 0 rgba(232, 203, 133, 0.9)',
                        },
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </Box>
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

                <Button
                  aria-label={usuarioPrimaryText}
                  aria-controls={menuContaAncora ? 'menu-conta' : undefined}
                  aria-expanded={Boolean(menuContaAncora)}
                  aria-haspopup="menu"
                  onClick={event => setMenuContaAncora(event.currentTarget)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: 0.8,
                    minWidth: 0,
                    width: 'auto',
                    maxWidth: { xs: '100%', sm: '220px', md: '240px' },
                    background: 'rgba(8, 15, 27, 0.96)',
                    border: '1px solid rgba(88, 127, 255, 0.5)',
                    borderRadius: '999px',
                    px: 0.8,
                    py: 0.45,
                    color: '#f3f6ff',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 22px rgba(4, 11, 20, 0.32)',
                    textTransform: 'none',
                    fontWeight: 700,
                    letterSpacing: '0.01em',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden',
                    '&:hover': {
                      background: 'rgba(13, 22, 35, 0.98)',
                      borderColor: 'rgba(98, 146, 255, 0.78)',
                      boxShadow: '0 0 0 1px rgba(67, 105, 255, 0.18), 0 12px 24px rgba(13, 31, 61, 0.42)',
                    },
                    '& .MuiButton-endIcon': { marginLeft: 0.15 },
                  }}
                  endIcon={<KeyboardArrowDownOutlinedIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.78)', ml: 0.05 }} />}
                >
                  <Avatar
                    src={currentUser.photoURL || undefined}
                    alt={usuarioPrimaryText}
                    sx={{
                      width: 28,
                      height: 28,
                      background: 'linear-gradient(135deg, rgba(232, 203, 133, 0.22), rgba(91, 124, 250, 0.18))',
                      border: '1px solid rgba(181, 201, 255, 0.35)',
                      color: '#f3d997',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      flexShrink: 0,
                    }}
                  >
                    {!currentUser.photoURL ? <AccountCircleOutlinedIcon fontSize="small" /> : null}
                  </Avatar>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#eef4ff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '145px',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {usuarioBotaoText}
                  </Typography>
                </Button>

                <Menu
                  id="menu-conta"
                  anchorEl={menuContaAncora}
                  open={Boolean(menuContaAncora)}
                  onClose={() => setMenuContaAncora(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1,
                        minWidth: { xs: 220, sm: 240 },
                        borderRadius: '16px',
                        border: '1px solid rgba(96, 127, 255, 0.32)',
                        background: 'rgba(11, 16, 27, 0.98)',
                        boxShadow: '0 18px 40px rgba(2, 8, 18, 0.74)',
                        overflow: 'hidden',
                      },
                    },
                  }}
                >
                  <MenuItem disabled sx={{ fontSize: '0.78rem', py: 1.2, '&.Mui-disabled': { opacity: 1, color: '#e9efff' } }}>
                    {usuarioSecondaryText ? `${usuarioPrimaryText} — ${usuarioSecondaryText}` : usuarioPrimaryText}
                  </MenuItem>
                  <MenuItem onClick={handleSairDoMenu}>Sair</MenuItem>
                </Menu>
              </Box>
            )}
          </Toolbar>

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
                slotProps={{
                  indicator: {
                    style: { height: 2, borderRadius: 999, background: 'linear-gradient(90deg, #e8cb85 0%, #b69a58 100%)' },
                  },
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
            [MOBILE]: { pt: tabs ? '109px' : '62px' },
          }}
        >
          <Outlet context={{ setHeaderExtra }} />
        </Box>
      </Box>
    </SelecaoContext.Provider>
  );
};

export default Layout;
