import useMediaQuery from '@mui/material/useMediaQuery';

// `true` abaixo de 600px (mesmo limite de MOBILE em common/styles/breakpoints).
// Use só para trocas estruturais (gaveta, alternar Mapa/Chat…) — ajuste
// visual vai em `@media` no styled-components ou em `sx` com `{ xs, sm }`.
const useIsMobile = () => useMediaQuery(theme => theme.breakpoints.down('sm'));

export default useIsMobile;
