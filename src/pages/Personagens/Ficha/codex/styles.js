import styled from 'styled-components';

export const RegraTopo = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

export const RegraImagem = styled.img`
  width: 200px;
  height: 200px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid var(--border-primary);
`;

export const RegraResumo = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-primary);
`;

export const BadgesRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
`;

export const MetaCard = styled.div`
  background: var(--bg-card);
  border-left: 2px solid var(--color-accent);
  border-radius: 8px;
  padding: 8px 12px;
`;

export const MetaLabel = styled.span`
  display: block;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-muted);
`;

export const MetaValor = styled.span`
  display: block;
  margin-top: 2px;
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

export const RegraSecaoTitulo = styled.h4`
  margin: 0 0 4px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-accent);
`;

export const RegraTexto = styled.p`
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--text-secondary);
  white-space: pre-wrap;
`;

export const ExemploBox = styled.div`
  background: var(--bg-card);
  border-left: 2px solid var(--status-gold-border);
  border-radius: 8px;
  padding: 10px 14px;

  p {
    font-style: italic;
    color: var(--text-muted);
  }
`;

export const ResultadoRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
`;

export const ResultadoCard = styled.div`
  border-left: 2px solid
    ${({ $variante }) => ($variante === 'falha' ? '#f87171' : '#4ade80')};
  background: var(--bg-card);
  border-radius: 8px;
  padding: 10px 14px;

  h4 {
    color: ${({ $variante }) => ($variante === 'falha' ? '#f87171' : '#4ade80')};
  }
`;
