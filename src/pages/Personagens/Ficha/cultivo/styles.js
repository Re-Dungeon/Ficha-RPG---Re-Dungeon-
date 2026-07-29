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
  gap: 18px;
  min-width: 0;
`;

export const ReinoHero = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  object-position: top center;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03), 0 18px 42px rgba(0, 0, 0, 0.22);
`;

export const ReinoTitulo = styled.h2`
  margin: 0;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  color: var(--status-gold-strong);
  text-shadow: 0 0 18px rgba(232, 203, 133, 0.35);
`;

export const ReinoBanner = styled.img`
  width: 100%;
  border-radius: 18px;
  object-fit: cover;
  margin-top: 18px;
  max-height: 220px;
`;

export const CultivoCard = styled.div`
  background-image: linear-gradient(rgba(16, 12, 24, 0.88), rgba(16, 12, 24, 0.88)), url('https://i.imgur.com/mb3T1zB.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 50px 70px rgba(0, 0, 0, 0.24);
`;

export const CultivoActionRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

export const CultivoStatusRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
`;

export const CaminhoCard = styled.div`
  background: radial-gradient(circle at top, rgba(91, 124, 250, 0.05), rgba(18, 15, 32, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  padding: 22px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02), 0 26px 60px rgba(0, 0, 0, 0.25);
  min-height: 100%;
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
  gap: 16px;
  padding: 18px 18px;
  border-radius: 20px;
  border: 1px solid
    ${({ $status }) => ($status === 'atual' ? 'rgba(232, 203, 133, 0.45)' : 'rgba(255, 255, 255, 0.08)')};
  background: ${({ $status }) =>
    $status === 'atual'
      ? 'rgba(232, 203, 133, 0.13)'
      : $status === 'concluido'
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgba(255, 255, 255, 0.02)'};
  opacity: ${({ $status }) => ($status === 'bloqueado' ? 0.8 : 1)};
  box-shadow: ${({ $status }) =>
    $status === 'atual'
      ? '0 18px 45px rgba(232, 203, 133, 0.12)'
      : '0 16px 30px rgba(0, 0, 0, 0.12)'};
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.08);
  }
`;

export const CaminhoMarcador = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: ${({ $status }) =>
    $status === 'atual'
      ? 'linear-gradient(135deg, rgba(232, 203, 133, 0.95), rgba(255, 255, 255, 0.18))'
      : $status === 'concluido'
        ? 'rgba(232, 203, 133, 0.14)'
        : 'rgba(255, 255, 255, 0.06)'};
  color: ${({ $status }) =>
    $status === 'atual'
      ? 'var(--text-primary)'
      : $status === 'concluido'
        ? 'var(--status-gold)'
        : 'var(--text-muted)'};
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

export const CaminhoMarcadorImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`;

export const CaminhoSeta = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 4px 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.15rem;
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
