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
  width: 380px;
  flex-shrink: 0;
  min-height: 0;

  @media (max-width: 900px) {
    width: 100%;
    height: 45%;
  }

  ${MOBILE} {
    flex: 1;
    height: auto;
  }
`;
