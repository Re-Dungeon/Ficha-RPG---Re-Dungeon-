import styled from 'styled-components';

export const ArtsHeader = styled.h2`
  margin: 0;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--status-gold-strong);
  text-shadow: 0 0 12px rgba(232, 203, 133, 0.35);
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin: 20px 0;
`;

export const StatCard = styled.div`
  background: rgba(0, 0, 0, 0.25);
  border-left: 3px solid var(--status-gold);
  border-radius: 8px;
  padding: 14px 16px;
  text-align: center;
`;

export const StatLabel = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  margin-bottom: 6px;
`;

export const StatValue = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--status-gold-strong);
  text-shadow: 0 0 12px rgba(232, 203, 133, 0.3);

  &[data-warning='true'] {
    color: #ef4444;
    text-shadow: none;
  }
`;

export const SectionBlock = styled.section`
  margin-top: 32px;
`;

export const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const SectionHeaderTitle = styled.h3`
  margin: 0;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 1.1rem;
  color: var(--status-gold-strong);
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SectionActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

export const StackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

export const ArtsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const EmptyState = styled.p`
  color: var(--text-muted);
  font-style: italic;
  padding: 16px 0;
  margin: 0;
`;

// ── Núcleo card ──────────────────────────────────────────────────────────

export const NucleoCardWrapper = styled.div`
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--status-gold-border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const NucleoArtsBadge = styled.span`
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--color-accent);
  color: #fff;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
`;

export const NucleoTopRow = styled.div`
  display: flex;
  gap: 12px;
`;

export const ImageThumb = styled.div`
  width: ${({ $size }) => $size ?? 72}px;
  height: ${({ $size }) => $size ?? 72}px;
  min-width: ${({ $size }) => $size ?? 72}px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--status-gold-border);
  overflow: hidden;
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

export const NucleoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const NucleoNome = styled.h4`
  margin: 0;
  font-size: 1rem;
  color: var(--text-primary);
`;

export const NucleoMeta = styled.p`
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: var(--text-secondary);

  strong {
    color: var(--text-primary);
  }
`;

export const Divider = styled.div`
  height: 1px;
  background: var(--status-gold-border);
`;

export const EssenciaTitle = styled.h5`
  margin: 0 0 6px;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--status-gold-strong);
`;

export const EssenciaTexto = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
`;

export const CardFooterActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

// ── Badges (tipo / ação / domínio) ──────────────────────────────────────

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.78rem;
  font-weight: 700;
  background: ${({ $cor }) => ($cor ? `${$cor}26` : 'rgba(255,255,255,0.08)')};
  color: ${({ $cor }) => $cor ?? 'var(--text-secondary)'};
`;

export const BadgeRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
`;

// ── Art card (horizontal) ────────────────────────────────────────────────

export const ArtCardWrapper = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  overflow: hidden;

  &[data-bloqueada='true'] {
    opacity: 0.55;
  }
`;

export const ArtCardHeader = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid var(--border-primary);
`;

export const ArtCardHeaderInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
`;

export const ArtNome = styled.h4`
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
`;

export const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--border-primary);
  border-top: 1px solid var(--border-primary);
  border-bottom: 1px solid var(--border-primary);

  @media (max-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const StatGridCell = styled.div`
  background: var(--bg-secondary);
  padding: 10px 4px;
  text-align: center;
  min-width: 0;
`;

export const StatGridLabel = styled.div`
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 4px;
  overflow-wrap: break-word;
`;

export const StatGridValue = styled.div`
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-primary);
  overflow-wrap: break-word;
`;

export const ArtDescricao = styled.p`
  margin: 0;
  padding: 12px 16px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const ArtCardFooter = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px 16px;
`;

// ── Diálogos ───────────────────────────────────────────────────────────

export const DialogTwoColumns = styled.div`
  display: grid;
  grid-template-columns: minmax(180px, 260px) 1fr;
  gap: 24px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const ImagePreviewBox = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px dashed var(--status-gold-border);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 2rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
