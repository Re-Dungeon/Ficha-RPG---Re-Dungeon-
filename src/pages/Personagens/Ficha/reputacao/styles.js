import styled from 'styled-components';

// ── Grade de origens ────────────────────────────────────────────────────

export const OrigemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-top: 8px;
`;

export const OrigemCardButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 14px;
  overflow: hidden;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;

  &:hover {
    border-color: var(--border-hover);
    transform: translateY(-2px);
  }
`;

export const OrigemImagem = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const OrigemInfo = styled.div`
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const OrigemNomeTitulo = styled.h3`
  margin: 0;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 1rem;
  color: var(--status-gold-strong);
`;

export const OrigemReputacaoResumo = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const ReputacaoBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 3px 10px;
  color: ${({ $variante }) => ($variante === 'terror' ? '#f87171' : 'var(--status-gold-strong)')};
  background: ${({ $variante }) =>
    $variante === 'terror' ? 'rgba(248, 113, 113, 0.12)' : 'rgba(232, 203, 133, 0.12)'};
  border: 1px solid
    ${({ $variante }) => ($variante === 'terror' ? 'rgba(248, 113, 113, 0.35)' : 'rgba(232, 203, 133, 0.35)')};

  svg {
    width: 14px;
    height: 14px;
  }
`;

// ── Detalhe de uma origem (edição de Fama/Terror) ───────────────────────

export const ReputacaoDetalheTopo = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;
  flex-wrap: wrap;
`;

export const ReputacaoDetalheImagem = styled.img`
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  flex-shrink: 0;
`;

export const ReputacaoDescricaoBox = styled.p`
  flex: 1;
  min-width: 220px;
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--text-secondary);
  white-space: pre-wrap;
`;

export const ReputacaoEixosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

export const ReputacaoEixoCard = styled.div`
  background: var(--bg-card);
  border: 1px solid
    ${({ $variante }) => ($variante === 'terror' ? 'rgba(248, 113, 113, 0.3)' : 'rgba(232, 203, 133, 0.3)')};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ReputacaoEixoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-weight: 700;
  font-size: 1rem;
  color: ${({ $variante }) => ($variante === 'terror' ? '#f87171' : 'var(--status-gold-strong)')};

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const ReputacaoEfeitosLista = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const ReputacaoEfeitoItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.82rem;
  line-height: 1.4;
  color: ${({ $desbloqueado }) => ($desbloqueado ? 'var(--text-primary)' : 'var(--text-muted)')};

  svg {
    flex-shrink: 0;
    margin-top: 2px;
    width: 15px;
    height: 15px;
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
  font-size: 0.8rem;
  font-style: italic;
  color: var(--text-muted);
`;
