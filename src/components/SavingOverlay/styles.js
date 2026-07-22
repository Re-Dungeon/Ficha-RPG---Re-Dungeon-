import styled from 'styled-components';

export const OverlayBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 15, 20, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
`;
