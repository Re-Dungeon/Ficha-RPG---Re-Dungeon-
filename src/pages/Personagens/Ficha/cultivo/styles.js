import styled from 'styled-components';

// Layout de duas colunas: painel principal (Reino atual + progresso) e a trilha
// "Caminho do Cultivo" à direita. Empilha em telas estreitas.
export const CultivoLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 860px) {
    grid-template-columns: minmax(0, 1.6fr) minmax(240px, 1fr);
  }
`;

export const CultivoMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`;

export const CultivoAside = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`;

export const ReinoHero = styled.img`
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid var(--status-gold-border);
`;

export const ReinoTitulo = styled.h2`
  margin: 0;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 1.6rem;
  font-weight: 700;
  text-align: center;
  color: var(--status-gold-strong);
  text-shadow: 0 0 16px rgba(232, 203, 133, 0.35);
`;

export const EstrelasRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2px;
  color: var(--color-primary);
`;

export const GanharRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

export const ProximoReinoRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const CaminhoTitulo = styled.h3`
  margin: 0 0 4px;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 0.9rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--status-gold-strong);
`;

// Um item da trilha. `$status`: 'concluido' | 'atual' | 'bloqueado'.
export const CaminhoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid
    ${({ $status }) => ($status === 'atual' ? 'var(--border-hover)' : 'var(--border-primary)')};
  background: ${({ $status }) =>
    $status === 'atual' ? 'rgba(232, 203, 133, 0.08)' : 'var(--bg-card)'};
  opacity: ${({ $status }) => ($status === 'bloqueado' ? 0.55 : 1)};
`;

export const CaminhoMarcador = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  color: ${({ $status }) =>
    $status === 'atual'
      ? 'var(--color-primary)'
      : $status === 'concluido'
        ? 'var(--status-gold)'
        : 'var(--text-muted)'};
`;

export const CaminhoInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const CaminhoNome = styled.span`
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CaminhoStatusLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ $status }) =>
    $status === 'atual' ? 'var(--color-primary)' : 'var(--text-muted)'};
`;
