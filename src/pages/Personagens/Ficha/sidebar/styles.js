import styled from 'styled-components';

export const SidebarWrapper = styled.nav`
  flex-shrink: 0;
  width: ${props => (props.$expandida ? '220px' : '64px')};
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 8px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-primary);
  transition: width 0.2s ease;
  overflow: hidden;
`;

export const SidebarToggleRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
`;

export const SidebarItemButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.9rem;
  font-family: inherit;
  white-space: nowrap;

  &:hover {
    background: var(--bg-card);
    color: var(--text-primary);
  }
`;

export const SidebarItemLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;
