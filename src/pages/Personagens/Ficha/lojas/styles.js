import styled from 'styled-components';

export const SaldoBadge = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 8px;
  border: 1px solid var(--status-gold-border);
  background: rgba(232, 203, 133, 0.08);
  color: var(--status-gold-strong);
  font-weight: 700;
  font-size: 0.9rem;
  white-space: nowrap;

  svg {
    width: 18px;
    height: 18px;
    color: var(--status-gold);
  }
`;

export const CategoriaBloco = styled.div`
  & + & {
    margin-top: 32px;
  }
`;

export const CategoriaHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--status-gold-border);
`;

export const CategoriaIcone = styled.span`
  font-size: 1.2rem;
`;

export const CategoriaTitulo = styled.h3`
  margin: 0;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 1.1rem;
  color: ${({ $cor }) => $cor};
`;

export const CategoriaSubtitulo = styled.p`
  margin: 8px 0 16px;
  font-size: 0.82rem;
  font-style: italic;
  color: var(--status-gold);
`;

export const ItensGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

export const ItemCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  background: var(--bg-card);
  border: 1px solid var(--status-gold-border);
  border-radius: 10px;
`;

export const ItemHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`;

export const ItemNomeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const ItemIcone = styled.span`
  flex-shrink: 0;
  font-size: 1.1rem;
`;

export const ItemNome = styled.span`
  font-weight: 700;
  color: var(--status-gold-strong);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ItemPreco = styled.span`
  flex-shrink: 0;
  padding: 2px 10px;
  border-radius: 6px;
  border: 1px solid var(--status-gold-border);
  background: rgba(232, 203, 133, 0.1);
  color: var(--status-gold-strong);
  font-weight: 700;
  font-size: 0.8rem;
`;

export const ItemDescricao = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
`;

export const ItemEfeitoBox = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--field-bg);

  svg {
    width: 14px;
    height: 14px;
    color: var(--status-gold);
    flex-shrink: 0;
  }
`;

export const ItemEfeitoTexto = styled.span`
  font-size: 0.8rem;
  font-style: italic;
  color: var(--status-gold);
`;

export const ItemTagsRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

export const ItemTag = styled.span`
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--field-bg);
  border: 1px solid var(--border-primary);
  font-size: 0.68rem;
  color: var(--text-secondary);
`;

export const GuardadosGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const GuardadoItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 14px;
  background: var(--bg-card);
  border-left: 2px solid var(--color-accent);
  border-radius: 8px;
`;

// ── Menu principal da Loja Rokmas (Sistema de Itens) ────────────────────────

export const MenuSaldoDestaque = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px;
  background: rgba(232, 203, 133, 0.06);
  border: 1px solid var(--status-gold-border);
  border-radius: 12px;
`;

export const MenuSaldoLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);

  svg {
    color: var(--status-gold);
  }
`;

export const MenuSaldoValor = styled.span`
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--status-gold-strong);
  text-shadow: 0 0 16px rgba(232, 203, 133, 0.35);
`;

export const MenuButtonsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
`;

export const MenuActionButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: var(--bg-card);
  border: 1px solid var(--status-gold-border);
  border-radius: 10px;
  color: var(--text-primary);
  transition: all 0.2s ease;

  svg {
    font-size: 1.5rem;
    color: var(--status-gold);
    flex-shrink: 0;
  }

  &:hover {
    border-color: var(--status-gold);
    background: rgba(232, 203, 133, 0.08);
    transform: translateX(4px);
  }
`;

export const MenuActionLabel = styled.span`
  font-weight: 700;
  font-size: 0.95rem;
`;

// ── Comprar/Vender — filtros e card de item ──────────────────────────────────

export const FiltrosRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  align-items: center;
`;

export const ItemPosseBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid var(--status-gold-border);
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--status-gold-strong);
`;

export const ItemLojaRodape = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid var(--border-primary);
  padding-top: 10px;
  margin-top: auto;
`;

export const ItemLojaPrecoBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(232, 203, 133, 0.12);
  border: 1px solid var(--status-gold-border);
  color: var(--status-gold-strong);
`;

export const RodapeInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--status-gold-border);
  font-size: 0.8rem;
  color: var(--status-gold);
  text-align: center;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;
