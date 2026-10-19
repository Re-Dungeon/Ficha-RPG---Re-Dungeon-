import useMediaQuery from '@mui/material/useMediaQuery';

import { MOBILE_QUERY } from 'common/styles/breakpoints';

// `true` abaixo de 600px (mesmo limite de MOBILE em common/styles/breakpoints).
// Use só para trocas estruturais (gaveta, alternar Mapa/Chat…) — ajuste
// visual vai em `${MOBILE}` no styled-components ou na chave `[MOBILE]` do `sx`.
const useIsMobile = () => useMediaQuery(MOBILE_QUERY);

export default useIsMobile;
