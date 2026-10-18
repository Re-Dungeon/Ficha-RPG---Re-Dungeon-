import styled from 'styled-components';

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

export const ChatPageWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: calc(100vh - 64px);
  padding: 16px 24px 24px;
  box-sizing: border-box;

  @media (max-width: 600px) {
    padding: 8px;
  }
`;
