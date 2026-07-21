import styled from 'styled-components';

export const PageWrapper = styled.div`
  flex: 1;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`;

export const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.75rem;
  color: var(--text-primary);
`;

export const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-muted);
  text-align: center;
  padding: 48px 24px;
`;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
`;

export const PersonagemCard = styled.button`
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  padding: 0;
  overflow: hidden;
  text-align: left;
  color: var(--text-primary);
  cursor: pointer;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: var(--border-hover);
  }
`;

export const PersonagemCardImage = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-bottom: 1px solid var(--border-primary);
`;

export const PersonagemCardImagePlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  color: var(--text-muted);
  font-size: 0.85rem;
`;

export const PersonagemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 16px;
`;

export const PersonagemNome = styled.h3`
  margin: 0;
  font-size: 1.1rem;
`;

export const PersonagemDetail = styled.span`
  font-size: 0.85rem;
  color: var(--color-accent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PersonagemUniverso = styled.span`
  font-size: 0.8rem;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const FormWrapper = styled.div`
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
