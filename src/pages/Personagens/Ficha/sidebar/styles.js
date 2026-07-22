import styled from 'styled-components';

export const SidebarWrapper = styled.nav`
  flex-shrink: 0;
  width: ${props => (props.$expandida ? '220px' : '64px')};
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-primary);
  transition: width 0.2s ease;
  overflow: hidden;
`;

export const SidebarHeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 4px 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--status-gold-border);
  justify-content: ${props => (props.$expandida ? 'flex-start' : 'center')};
`;

export const SidebarHeaderIcone = styled.span`
  display: flex;
  color: var(--status-gold);
`;

export const SidebarHeaderTitulo = styled.span`
  flex: 1;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--status-gold-strong);
  white-space: nowrap;
`;

export const SidebarGrupo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  & + & {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--status-gold-border);
  }
`;

export const SidebarGrupoTitulo = styled.span`
  padding: 4px 12px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--status-gold);
  white-space: nowrap;
`;

export const SidebarItemButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-left: 2px solid transparent;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.9rem;
  font-family: inherit;
  white-space: nowrap;

  &:hover {
    background: rgba(232, 203, 133, 0.1);
    border-left-color: var(--status-gold);
    color: var(--text-primary);
  }
`;

export const SidebarItemLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;
