import styled from 'styled-components';

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 28px;
  border-bottom: 1px solid rgba(216, 180, 106, 0.12);
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--text-primary);
`;

export const Grid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  padding: 20px 28px;
`;

export const ControlsRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px 28px;
`;

export const SearchInput = styled.input`
  flex: 1;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.04);
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--text-primary);
`;

export const EmptyState = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  padding:40px 20px;
  color:var(--text-muted);
`;

export const ScrollArea = styled.div`
  max-height: calc(80vh - 180px);
  overflow: auto;

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(200,160,80,0.18), rgba(200,160,80,0.28));
    border-radius: 10px;
  }
`;

export const PaginationRow = styled.div`
  display:flex;
  justify-content:center;
  gap:8px;
  padding:12px 20px 28px;
  align-items:center;
`;
