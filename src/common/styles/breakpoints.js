// Celular = abaixo do breakpoint `sm` do MUI (600px). Todo ajuste de layout
// para celular fica atrás desta media query: a 600px ou mais (tablet,
// notebook, desktop — mesmo com a janela estreita) nada muda.
// Mesmo valor de `theme.breakpoints.down('sm')` (ver hooks/useIsMobile.js).
export const MOBILE = '@media (max-width: 599.95px)';

// Para espalhar no `sx` do paper de diálogos que fixam width/altura/raio
// inline (o `sx` vence o override de tela cheia do theme.js).
export const PAPER_TELA_CHEIA = {
  [MOBILE]: {
    m: 0,
    width: '100%',
    maxWidth: '100%',
    height: '100%',
    maxHeight: '100%',
    borderRadius: 0,
  },
};
