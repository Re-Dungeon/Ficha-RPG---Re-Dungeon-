import styled from 'styled-components';

import { MOBILE } from 'common/styles/breakpoints';

export const CampanhaCard = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  backdrop-filter: blur(12px);
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--border-hover);
  }
`;

export const CampanhaCardImagem = styled.img`
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
`;

export const CampanhaCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;

  h3 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.1rem;
  }
`;

export const CampanhaPersonagens = styled.span`
  color: var(--text-secondary);
  font-size: 0.85rem;
`;

// Altura fixa = janela − cabeçalho, para só a lista de mensagens (e o mapa)
// rolar. `flex: none` é obrigatório: o <main> do Layout é um flex em coluna
// de altura indefinida, e com `flex: 1` (base 0%) o navegador ignora o
// `height` e a página cresce junto com as mensagens. `dvh` acompanha a barra
// de endereço dos celulares (o `vh` fica de fallback).
export const ChatPageWrapper = styled.div`
  flex: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: calc(100vh - 64px);
  height: calc(100dvh - 64px);
  padding: 16px 24px 24px;
  box-sizing: border-box;

  @media (max-width: 600px) {
    padding: 8px;
  }

  /* Celular: o cabeçalho do Layout tem 56px. */
  ${MOBILE} {
    height: calc(100vh - 56px);
    height: calc(100dvh - 56px);
  }
`;

// Visão "grid": barra (Chat|Grid, "Falando como", mostrar chat) + mapa com o
// chat num painel lateral (abaixo do mapa em telas estreitas).
export const MesaBarra = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  ${MOBILE} {
    gap: 8px;
    margin-bottom: 8px;
  }
`;

export const MesaCorpo = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;

  /* Com a divisão arrastável, ela mesma ocupa o espaço do gap. */
  &[data-divisor='true'] {
    gap: 0;
  }

  @media (max-width: 900px) {
    flex-direction: column;
  }

  /* Celular: mapa OU chat (data-aba vem de CampanhaChat). */
  ${MOBILE} {
    &[data-aba='chat'] > :first-child,
    &[data-aba='mapa'] > :last-child {
      display: none;
    }
  }
`;

export const MesaChatPainel = styled.div`
  display: flex;
  flex-direction: column;
  width: min(420px, 38vw);
  flex-shrink: 0;
  min-height: 0;

  /* Tamanho escolhido na divisão (estilo inline): se a janela encolher, o
     mapa nunca some (360px + a divisão). */
  &[data-ajustado='true'] {
    min-width: 280px;
    max-width: calc(100% - 372px);
  }

  @media (max-width: 900px) {
    width: 100%;
    height: 45%;

    &[data-ajustado='true'] {
      min-width: 0;
      max-width: none;
      min-height: 200px;
      max-height: calc(100% - 252px);
    }
  }

  ${MOBILE} {
    flex: 1;
    height: auto;
  }
`;

// Divisão arrastável entre o mapa e o chat (DivisorMesa). Ocupa o gap de 12px;
// a "alça" é uma linha fina no centro que acende no hover/foco/arraste.
export const DivisorAlca = styled.div`
  position: relative;
  flex: none;
  align-self: stretch;
  touch-action: none;
  outline: none;
  ${({ $horizontal }) =>
    $horizontal ? 'width: 12px; cursor: col-resize;' : 'height: 12px; cursor: row-resize;'}

  &::after {
    content: '';
    position: absolute;
    border-radius: 2px;
    background: var(--border-primary);
    transition: background 0.15s ease;
    ${({ $horizontal }) =>
      $horizontal
        ? 'top: 0; bottom: 0; left: 50%; width: 2px; transform: translateX(-50%);'
        : 'left: 0; right: 0; top: 50%; height: 2px; transform: translateY(-50%);'}
  }

  &:hover::after,
  &:focus-visible::after,
  &[data-arrastando='true']::after {
    background: var(--border-hover);
  }
`;
