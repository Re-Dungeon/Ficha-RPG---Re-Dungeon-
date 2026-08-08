import styled from 'styled-components';

export const ArtsHeader = styled.h2`
  margin: 0;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 1.8rem;
  line-height: 1.1;
  font-weight: 800;
  color: var(--status-gold-strong);
  text-shadow: 0 0 14px rgba(232, 203, 133, 0.38);
  letter-spacing: 0.02em;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 18px;
  margin: 24px 0 18px;
`;

export const StatCard = styled.div`
  background: rgba(0, 0, 0, 0.24);
  border-left: 2px solid var(--status-gold);
  border-radius: 14px;
  padding: 14px 16px;
  text-align: center;
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(91, 124, 250, 0.12);
  }
`;

export const StatLabel = styled.div`
  font-size: 0.72rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
  margin-bottom: 4px;
`;

export const StatValue = styled.div`
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--status-gold-strong);
  text-shadow: 0 0 8px rgba(232, 203, 133, 0.22);

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
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 18px;
  margin-top: 16px;

  @media (max-width: 1800px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

export const StackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

export const ArtsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const CatalogArtsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;

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
  width: 100%;
  background: linear-gradient(180deg, rgba(12, 10, 24, 0.96), rgba(18, 12, 34, 0.94));
  border: 1px solid rgba(171, 140, 255, 0.24);
  border-radius: 18px;
  padding: 28px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(14px);
  transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease, background 200ms ease;

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(171, 140, 255, 0.38);
    box-shadow: 0 26px 64px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }
`;

export const NucleoArtsBadge = styled.span`
  position: absolute;
  top: 18px;
  right: 18px;
  background: linear-gradient(135deg, rgba(91, 124, 250, 0.95), rgba(171, 140, 255, 0.95));
  color: #fff;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 12px 24px rgba(91, 124, 250, 0.16);
  white-space: nowrap;
`;

export const NucleoTopRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding-right: 80px;
`;

export const ImageThumb = styled.div`
  width: ${({ $size }) => $size ?? 72}px;
  height: ${({ $size }) => $size ?? 72}px;
  min-width: ${({ $size }) => $size ?? 72}px;
  border-radius: 18px;
  padding: 6px;
  background: radial-gradient(circle at top left, rgba(171, 140, 255, 0.18), rgba(29, 21, 57, 0.92));
  border: 1px solid rgba(171, 140, 255, 0.28);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 14px 28px rgba(0, 0, 0, 0.28);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 14px;
    display: block;
  }
`;

export const NucleoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`;

export const NucleoNome = styled.h4`
  margin: 0;
  font-size: 1.12rem;
  line-height: 1.2;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 0.01em;
  text-shadow: 0 0 10px rgba(171, 140, 255, 0.12);
  max-height: 3rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const NucleoMeta = styled.p`
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--text-secondary);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  strong {
    color: var(--text-primary);
    font-weight: 700;
  }
`;

export const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 0;
`;

export const EssenciaTitle = styled.h5`
  margin: 0 0 14px;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--status-gold-strong);
  letter-spacing: 0.16em;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

export const EssenciaTexto = styled.p`
  margin: 0;
  padding: 18px 20px;
  max-height: calc(1.85em * 10 + 36px);
  font-size: 0.95rem;
  color: #E8E6F5;
  line-height: 1.85;
  background: rgba(10, 9, 20, 0.76);
  border: 1px solid rgba(232, 203, 133, 0.16);
  border-left: 4px solid rgba(232, 203, 133, 0.9);
  border-radius: 18px;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.04);
  position: relative;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(171, 140, 255, 0.4);
    border-radius: 999px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

export const HeaderDivider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, rgba(232, 203, 133, 0.35), rgba(255, 255, 255, 0.05), rgba(232, 203, 133, 0.15));
  margin: 10px 0 0;
  border-radius: 999px;
`;

export const NucleoImageWrapper = styled.div`
  border-radius: 24px;
  padding: 10px;
  height: 100%;
  min-height: 320px;
  display: flex;
  background: radial-gradient(circle at top left, rgba(91, 124, 250, 0.12), rgba(16, 11, 32, 0.9));
  border: 1px solid rgba(232, 203, 133, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 22px 54px rgba(0, 0, 0, 0.28);
  transition: transform 220ms ease, box-shadow 220ms ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 26px 60px rgba(0, 0, 0, 0.32);
  }
`;

export const FormSectionCard = styled.div`
  background: rgba(11, 9, 20, 0.92);
  border: 1px solid rgba(171, 140, 255, 0.14);
  border-radius: 22px;
  padding: 20px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 12px 30px rgba(0, 0, 0, 0.18);
`;

export const NucleoInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const NucleoStatCard = styled.div`
  background: rgba(26, 18, 43, 0.82);
  border: 1px solid rgba(232, 203, 133, 0.16);
  border-radius: 18px;
  padding: 16px 18px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 18px 48px rgba(0, 0, 0, 0.18);
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 24px 56px rgba(0, 0, 0, 0.24);
  }
`;

export const NucleoStatLabel = styled.div`
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export const NucleoStatValue = styled.div`
  margin-top: 8px;
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 700;
  line-height: 1.3;
`;

export const NucleoEssenceCard = styled.div`
  background: rgba(10, 11, 24, 0.88);
  border: 1px solid rgba(171, 140, 255, 0.16);
  border-radius: 24px;
  padding: 22px;
  margin-top: 24px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 18px 50px rgba(0, 0, 0, 0.22);
`;

export const CardFooterActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;

  button {
    border-radius: 999px;
    padding: 10px 14px;
    min-width: 100px;
    transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease, border-color 180ms ease;
  }

  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(91, 124, 250, 0.14);
  }
`;

// ── Badges (tipo / ação / domínio) ──────────────────────────────────────

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  background: ${({ $cor }) => ($cor ? `${$cor}22` : 'rgba(255,255,255,0.08)')};
  color: ${({ $cor }) => $cor ?? 'var(--text-secondary)'};
  border: 1px solid ${({ $cor }) => ($cor ? `${$cor}40` : 'rgba(255,255,255,0.12)')};
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.16);
  }
`;

export const BadgeRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 2px;
  position: relative;
  top: -6px;
`;

// ── Art card (horizontal) ────────────────────────────────────────────────

export const ArtCardWrapper = styled.div`
  position: relative;
  background: linear-gradient(145deg, rgba(16,13,28,0.96), rgba(8,9,18,0.9));
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04);
  backdrop-filter: blur(12px);
  transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
  display: flex;
  flex-direction: column;
  height: 432px;
  min-height: 432px;
  max-height: 432px;
  box-sizing: border-box;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, rgba(91,124,250,0.08), transparent 42%, rgba(232,203,133,0.06));
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(232,203,133,0.3);
    box-shadow: 0 22px 48px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.05);
  }

  &[data-bloqueada='true'] {
    opacity: 0.55;
  }
`;

export const ArtCardHeader = styled.div`
  position: relative;
  display: flex;
  gap: 16px;
  padding: 20px 20px 22px;
  align-items: flex-start;
  background: linear-gradient(180deg, rgba(255,255,255,0.03), transparent);
  min-height: 142px;
  box-sizing: border-box;
  z-index: 2;
`;

export const ArtCardHeaderInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 8px;
  min-height: 120px;
  box-sizing: border-box;
`;

export const ArtCardBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  padding: 0 16px;
  margin-top: 8px;
`;

export const ArtTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
`;

export const ArtImageThumb = styled.div`
  width: 120px;
  height: 120px;
  min-width: 120px;
  border-radius: 14px;
  padding: 4px;
  background: linear-gradient(135deg, rgba(232,203,133,0.2), rgba(91,124,250,0.14));
  border: 1px solid rgba(232,203,133,0.28);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 24px rgba(0,0,0,0.24);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 6px;
    border: 1px solid rgba(232,203,133,0.18);
    border-radius: 10px;
    pointer-events: none;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
    display: block;
    position: relative;
    z-index: 3;
  }
`;


export const ArtMetaText = styled.div`
  font-size: 0.84rem;
  color: var(--text-secondary);
  margin-top: 2px;

  strong {
    color: var(--text-primary);
  }
`;

export const ArtNome = styled.h4`
  margin: 0;
  font-size: 1.08rem;
  line-height: 1.2;
  letter-spacing: 0.01em;
  color: var(--text-primary);
  font-weight: 700;
  text-shadow: 0 0 10px rgba(232,203,133,0.12);
  max-height: 2.4rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
  padding: 5px 8px;
  min-height: 64px;
  height: 64px;
  margin-top: 12px;
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.08));
  border-top: 1px solid rgba(255,255,255,0.06);
  border-bottom: 0px solid rgba(255,255,255,0.06);

  @media (max-width: 640px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

export const StatGridCell = styled.div`
  background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.16));
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 10px;
  padding: 10px 6px;
  text-align: center;
  min-width: 0;
  height: 56px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  transition: border-color 180ms ease, transform 180ms ease, background 180ms ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(232,203,133,0.24);
    background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.18));
  }
`;

export const StatGridLabel = styled.div`
  font-size: 0.50rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StatGridValue = styled.div`
  font-size: 0.86rem;
  font-weight: 800;
  color: var(--status-gold-strong);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ArtDescricao = styled.p`
  margin: 0;
  padding: 16px;
  font-size: 0.92rem;
  color: var(--text-secondary);
  line-height: 1.6;
  box-sizing: border-box;
  flex: 1 1 auto;
  min-height: 0;
  max-height: calc(0.92rem * 1.6 * 5 + 32px);
  background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0,0,0,0.06));
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
  display: block;
  overflow-x: hidden;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
`;

export const ArtCardFooter = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 12px 16px 16px;
  justify-content: flex-start;
  align-items: center;
  margin-top: auto;
  flex-shrink: 0;
`;

// ── Diálogos ───────────────────────────────────────────────────────────

export const DialogTwoColumns = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 300px) 1fr;
  gap: 18px;
  align-items: stretch;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const ImagePreviewBox = styled.div`
  width: 100%;
  height: 100%;
  min-height: 280px;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(10,8,18,0.55), rgba(18,14,30,0.5));
  border: 1px solid rgba(232,195,106,0.1);
  box-shadow: 0 8px 24px rgba(16,12,32,0.4), inset 0 1px 0 rgba(255,255,255,0.02);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 1.6rem;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 12px 12px;
    opacity: 0.05;
    pointer-events: none;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const ViewDialogHeader = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 12px; background: linear-gradient(180deg, rgba(20,16,30,0.6), rgba(12,10,20,0.4)); border-bottom:1px solid var(--border-primary); border-radius: 8px 8px 0 0;
`;

export const ViewHeaderLeft = styled.div`
  display:flex; align-items:center; gap:12px;
`;

export const ViewHeaderIcon = styled.div`
  width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; background: linear-gradient(135deg, rgba(108,99,255,0.12), rgba(232,195,106,0.06)); color:var(--color-accent); box-shadow: 0 5px 16px rgba(16,12,32,0.4);
`;

export const ViewTitleMain = styled.h2`
  margin:0; font-size:0.98rem; color:var(--text-primary); font-weight:700;
`;

export const ViewTitleSub = styled.div`
  font-size:0.72rem; color:var(--text-secondary);
`;

export const ViewStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const DescriptionCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  padding: 8px;
  margin-top: 10px;
  max-height: 220px;
  overflow: auto;
  color: var(--text-secondary);
  line-height: 1.45;
`;
