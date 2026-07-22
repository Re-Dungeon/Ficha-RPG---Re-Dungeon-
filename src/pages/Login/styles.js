import styled from 'styled-components';

export const LoginWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

export const LoginCard = styled.div`
  width: 100%;
  max-width: 380px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  padding: 32px;
  backdrop-filter: blur(12px);
`;

export const LoginTitle = styled.h1`
  margin: 0 0 4px;
  font-size: 1.5rem;
  color: var(--text-primary);
`;

export const LoginSubtitle = styled.p`
  margin: 0 0 24px;
  font-size: 0.9rem;
  color: var(--text-muted);
`;

export const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const LoginError = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #f87171;
`;

