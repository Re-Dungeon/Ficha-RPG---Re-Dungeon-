import styled from 'styled-components';

// ── Lista de condições ativas ───────────────────────────────────────────────

export const CondicoesLista = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const CondicaoCardWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-left: 3px solid var(--color-accent);
  border-radius: 12px;
  padding: 14px 16px;
`;

export const CondicaoIcone = styled.div`
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid var(--status-gold-border);
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const CondicaoInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const CondicaoNome = styled.span`
  font-weight: 700;
  color: var(--status-gold-strong);
  font-size: 0.95rem;
`;

export const CondicaoDescricaoResumo = styled.p`
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-secondary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const CondicaoDuracaoBadge = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 2px;
  border: 1px solid var(--status-gold-border);
  background: rgba(232, 203, 133, 0.08);
  border-radius: 999px;
  padding: 2px 4px 2px 10px;
  color: var(--status-gold-strong);
  font-size: 0.75rem;
  font-weight: 700;

  input {
    all: unset;
    box-sizing: border-box;
    width: 32px;
    text-align: right;
    color: inherit;
    font: inherit;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
`;

export const CondicaoAcoesRow = styled.div`
  flex-shrink: 0;
  display: flex;
  gap: 6px;
`;

const ACAO_CORES = {
  ver: { border: 'var(--color-accent)', color: 'var(--color-accent)' },
  remover: { border: '#f87171', color: '#f87171' },
};

export const CondicaoAcaoBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid ${({ $variante }) => ACAO_CORES[$variante]?.border ?? 'var(--border-primary)'};
  color: ${({ $variante }) => ACAO_CORES[$variante]?.color ?? 'var(--text-secondary)'};
  background: rgba(255, 255, 255, 0.03);

  &:hover {
    filter: brightness(1.25);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// ── Códex de Condições (catálogo) ───────────────────────────────────────────

export const CatalogoCondicoesLista = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 4px;
`;

export const CatalogoCondicaoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  padding: 10px 14px;
`;

export const CatalogoCondicaoIcone = styled.div`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const CatalogoCondicaoInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const CatalogoCondicaoNome = styled.span`
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.9rem;
`;

export const CatalogoCondicaoDescricao = styled.span`
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

export const CatalogoAdicionarBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
  background: rgba(91, 124, 250, 0.1);

  &:hover {
    background: rgba(91, 124, 250, 0.2);
  }
`;

// ── Diálogo de detalhe (visualização de uma condição ativa) ────────────────

export const DetalheCondicaoTopo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  margin-top: 8px;
`;

export const DetalheCondicaoIcone = styled.div`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--status-gold-border);
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const DetalheCondicaoNome = styled.h2`
  margin: 0;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 1.4rem;
  color: var(--status-gold-strong);
`;

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 20px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const InfoCelula = styled.div`
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--status-gold-border);
  border-radius: 8px;
  padding: 10px 12px;
`;

export const InfoLabel = styled.div`
  font-size: 0.68rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  margin-bottom: 4px;
`;

export const InfoValor = styled.div`
  font-size: 0.9rem;
  color: var(--status-gold-strong);
  font-weight: 700;
  overflow-wrap: break-word;
`;

export const SecaoCondicaoTitulo = styled.h5`
  margin: 20px 0 8px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--status-gold-strong);
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const SecaoCondicaoBox = styled.div`
  border: 1px solid var(--status-gold-border);
  border-radius: 8px;
  padding: 12px 14px;
  color: var(--text-secondary);
  font-size: 0.88rem;
  line-height: 1.5;
`;

export const SecaoCondicaoLista = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const SecaoCondicaoItem = styled.li`
  display: flex;
  gap: 8px;

  &::before {
    content: '→';
    flex-shrink: 0;
    color: var(--color-accent);
  }
`;

export const RodapeCondicaoData = styled.p`
  margin: 20px 0 0;
  padding-top: 12px;
  border-top: 1px solid var(--border-primary);
  text-align: center;
  font-size: 0.75rem;
  font-style: italic;
  color: var(--text-muted);
`;
