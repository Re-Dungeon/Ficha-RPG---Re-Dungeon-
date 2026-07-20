import styled from 'styled-components';

export const FichaWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
`;

export const FichaLayout = styled.div`
  flex: 1;
  display: flex;
  min-height: 100%;
`;

export const FichaMain = styled.div`
  flex: 1;
  min-width: 0;
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

export const AtributoCardWrapper = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const AtributoCardButton = styled.button`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  text-align: left;
  font-family: inherit;
  cursor: pointer;

  &:hover {
    border-color: var(--border-hover);
  }
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

const STATUS_GRADIENTES = {
  hp: 'linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0) 45%), linear-gradient(90deg, #b91c1c 0%, #ef4444 55%, #fca5a5 100%)',
  energia:
    'linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0) 45%), linear-gradient(90deg, #1d4ed8 0%, #3b82f6 55%, #bfdbfe 100%)',
  fadiga:
    'linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0) 45%), linear-gradient(90deg, #b45309 0%, #ea580c 55%, #7f1d1d 100%)',
};

export const StatusPainelWrapper = styled.div`
  position: relative;
  background: var(--status-panel-bg);
  border: 1px solid var(--status-gold-border);
  border-radius: 16px;
  padding: 28px 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: var(--shadow-md);
`;

export const StatusPainelEmblema = styled.div`
  position: absolute;
  top: 18px;
  right: 22px;
  color: var(--status-gold);
  opacity: 0.85;
  display: flex;

  svg {
    width: 26px;
    height: 26px;
  }
`;

export const StatusParRow = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
`;

export const StatusColunaButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 160px;
  flex: 1;
`;

export const StatusTitulo = styled.h3`
  margin: 0;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--status-gold-strong);
  text-shadow: 0 0 12px rgba(232, 203, 133, 0.35);
`;

export const StatusSubtitulo = styled.span`
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 0.8rem;
  letter-spacing: 1px;
  color: var(--text-secondary);
`;

export const StatusBarraTrack = styled.div`
  position: relative;
  width: 100%;
  height: ${({ $grande }) => ($grande ? '34px' : '26px')};
  border-radius: 999px;
  border: 1px solid var(--status-gold-border);
  background: var(--status-track-bg);
  overflow: hidden;
`;

export const StatusBarraFill = styled.div`
  position: absolute;
  inset: 0;
  width: ${({ $percentual }) => $percentual}%;
  background: ${({ $variante }) => STATUS_GRADIENTES[$variante] ?? STATUS_GRADIENTES.hp};
  transition: width 0.3s ease;
`;

export const StatusBarraLabel = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
`;
