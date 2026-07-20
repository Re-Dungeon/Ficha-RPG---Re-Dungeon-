import styled from 'styled-components';

export const FichaWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
`;

export const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.75rem;
  color: var(--text-primary);
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`;

export const HeaderTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const PowerCombatBadge = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-accent);
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 999px;
  padding: 4px 12px;
`;

export const AttributesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
`;

export const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
`;

export const AtributoCardWrapper = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-primary);
`;

export const CardTotal = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
`;

export const StatusValueRow = styled.span`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

export const FieldsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  gap: 8px;
`;
