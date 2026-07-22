import styled from 'styled-components';

export const CompanheiroGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

export const CompanheiroCardButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  overflow: hidden;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;

  &:hover {
    border-color: var(--border-hover);
    transform: translateY(-2px);
  }
`;

export const CompanheiroImagem = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 0.8rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const CompanheiroNome = styled.span`
  padding: 10px 12px 12px;
  font-size: 0.9rem;
  color: var(--text-primary);
  text-align: center;
`;

export const CompanheiroBadge = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--color-accent);
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(34, 211, 238, 0.3);
  padding: 2px 8px;
  margin-top: 10px;
  border-radius: 999px;
`;

export const OpcoesCriarRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;

  button {
    flex: 1;
  }
`;
