import styled from 'styled-components';

// ── Grade de origens ────────────────────────────────────────────────────

export const OrigemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 18px;
  margin-top: 18px;
`;

export const OrigemCardButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 320px;
  background: linear-gradient(180deg, rgba(24, 17, 44, 0.95), rgba(15, 10, 30, 0.98));
  border: 1px solid rgba(212, 175, 103, 0.18);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03), 0 18px 36px rgba(0, 0, 0, 0.26);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(212, 175, 103, 0.28);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05), 0 24px 50px rgba(0, 0, 0, 0.33);
  }
`;

export const OrigemImagem = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  min-height: 220px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(0, 0, 0, 0.28));
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    transition: transform 0.25s ease;
  }

  ${OrigemCardButton}:hover & img {
    transform: scale(1.02);
  }
`;

export const OrigemInfo = styled.div`
  padding: 20px 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const OrigemNomeTitulo = styled.h3`
  margin: 0;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 1.2rem;
  line-height: 1.2;
  letter-spacing: 0.04em;
  color: var(--status-gold-strong);
`;

export const OrigemReputacaoResumo = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

export const ReputacaoBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-radius: 999px;
  padding: 6px 12px;
  color: ${({ $variante }) => ($variante === 'terror' ? '#f87171' : '#D4AF37')};
  background: ${({ $variante }) =>
    $variante === 'terror' ? 'rgba(248, 113, 113, 0.12)' : 'rgba(212, 175, 103, 0.12)'};
  border: 1px solid
    ${({ $variante }) => ($variante === 'terror' ? 'rgba(248, 113, 113, 0.35)' : 'rgba(212, 175, 103, 0.28)')};

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const ReputacaoHeaderTitle = styled.h2`
  margin: 0;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 2.5vw, 2.6rem);
  letter-spacing: 0.05em;
  color: var(--status-gold-strong);
  position: relative;
  padding-bottom: 14px;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 90px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(212, 175, 103, 1), rgba(212, 175, 103, 0.1));
  }
`;

export const ReputacaoHeaderActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

export const ReputacaoDetalheTopo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 22px;
`;

export const ReputacaoDetalheImagem = styled.img`
  width: 100%;
  max-width: 420px;
  height: auto;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  object-position: top center;
  border-radius: 18px;
  border: 1px solid rgba(212, 175, 103, 0.25);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
  align-self: center;
`;

export const ReputacaoDescricaoBox = styled.p`
  margin: 0;
  padding: 14px 16px 14px 14px;
  border-left: 3px solid rgba(212, 175, 103, 0.9);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--text-secondary);
  max-height: ${({ $expandida }) => ($expandida ? 'none' : 'calc(1.55rem * 8 + 24px)')};
  display: -webkit-box;
  -webkit-box-orient: vertical;
  ${({ $expandida }) => ($expandida ? '' : '-webkit-line-clamp: 8;')}
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  white-space: normal;
`;

export const ReputacaoEixosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 22px;
  margin-top: 24px;
`;

export const ReputacaoEixoCard = styled.div`
  background: linear-gradient(180deg, rgba(22, 16, 43, 0.92), rgba(18, 12, 35, 0.98));
  border: 1px solid
    ${({ $variante }) => ($variante === 'terror' ? 'rgba(248, 113, 113, 0.22)' : 'rgba(212, 175, 103, 0.22)')};
  border-radius: 18px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02), 0 18px 40px rgba(0, 0, 0, 0.28);
`;

export const ReputacaoEixoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-weight: 700;
  font-size: 1.05rem;
  color: ${({ $variante }) => ($variante === 'terror' ? '#f87171' : '#D4AF37')};

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const ReputacaoEfeitosLista = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ReputacaoEfeitoItem = styled.li`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: start;
  padding: 14px 16px;
  border-radius: 14px;
  background: ${({ $desbloqueado }) => ($desbloqueado ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.02)')};
  border-left: 4px solid
    ${({ $desbloqueado }) => ($desbloqueado ? 'rgba(212, 175, 103, 0.95)' : 'rgba(255, 255, 255, 0.08)')};
  color: ${({ $desbloqueado }) => ($desbloqueado ? 'var(--text-primary)' : 'var(--text-muted)')};

  svg {
    flex-shrink: 0;
    margin-top: 4px;
    width: 18px;
    height: 18px;
    color: ${({ $desbloqueado }) => ($desbloqueado ? '#4ade80' : 'var(--text-muted)')};
  }
`;

export const ReputacaoEfeitoQuantidade = styled.span`
  font-weight: 700;
  color: inherit;
  white-space: nowrap;
`;

export const ReputacaoEfeitosVazio = styled.p`
  margin: 0;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
  font-style: italic;
`;
