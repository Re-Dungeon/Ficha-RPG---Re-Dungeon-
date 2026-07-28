import styled from 'styled-components';

import estrelaAtributosImg from './assets/estrela-atributos.png';
import gemaAtributoImg from './assets/gema-atributo.png';
import planetaRedungeonImg from './assets/planeta-redungeon.png';
import molduraRetratoImg from './assets/moldura-retrato.png';

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
  nivel:
    'linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0) 45%), linear-gradient(90deg, #92702c 0%, #e8cb85 55%, #fff3d1 100%)',
  cultivo:
    'linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0) 45%), linear-gradient(90deg, #b8860b 0%, #f0c14b 45%, #fff0b8 75%, #fffbe6 100%)',
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
  width: 75%;
  margin: 0 auto;
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

export const HeroRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 24px;
`;

export const EstrelaWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
  width: clamp(240px, 30vw, 600px);
  aspect-ratio: 1 / 1;
  background: url(${estrelaAtributosImg}) center / contain no-repeat;
`;

export const EstrelaCentro = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 5px;
`;

export const EstrelaCentroValor = styled.span`
  font-size: clamp(1.2rem, 3vw, 2rem);
  font-weight: 700;
  color: #fff;
  text-shadow: 0 0 12px rgba(239, 68, 68, 0.65);
`;

export const EstrelaCentroLabel = styled.span`
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: clamp(0.55rem, 1.3vw, 1rem);
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #fff;
  font-weight: 700;
`;

export const EstrelaGemaSlot = styled.div`
  position: absolute;
  width: 18%;
  aspect-ratio: 1 / 1;
  top: ${({ $top }) => $top}%;
  left: ${({ $left }) => $left}%;
  transform: translate(-50%, -50%);
`;

export const AtributoGemaButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 8%;
  background: url(${gemaAtributoImg}) center / contain no-repeat;
  transition: filter 0.15s ease;

  &:hover,
  &:focus-visible {
    filter: brightness(1.2);
  }
`;

export const AtributoGemaValor = styled.span`
  font-size: clamp(0.8rem, 1.6vw, 1.1rem);
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
`;

export const AtributoGemaLabel = styled.span`
  width: 100%;
  font-size: clamp(0.4rem, 0.75vw, 1rem);
  line-height: 1.1;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
  overflow-wrap: break-word;
  font-weight: 700;
`;

export const HeroCardWrapper = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: clamp(200px, 20vw, 350px);
`;

export const HeroNomeBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  width: 100%;
  background: linear-gradient(180deg, #1A1628cc 0%, #14111Fdd 100%);
  border: 1px solid rgba(255, 215, 120, 0.18);
  border-radius: 18px;
  padding: 18px 20px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03), 0 26px 46px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(10px);
`;

export const HeroNome = styled.h2`
  margin: 0;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: clamp(1.5rem, 2.4vw, 1.75rem);
  line-height: 1.05;
  font-weight: 700;
  color: #F4D58D;
  text-shadow: 0 2px 14px rgba(244, 213, 141, 0.2);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const HeroTitulo = styled.span`
  display: block;
  width: 100%;
  font-size: 0.88rem;
  font-style: italic;
  color: #C7CBD8;
  opacity: 0.92;
  letter-spacing: 0.02em;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
  padding-bottom: 12px;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 4px;
    transform: translateX(-50%);
    width: 60%;
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
  }
`;

export const HeroRace = styled.span`
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  max-width: 100%;
  font-size: 0.95rem;
  font-weight: 600;
  color: #F5E6B3;
  background: linear-gradient(180deg, rgba(30, 26, 42, 0.95), rgba(20, 16, 31, 0.98));
  border: 1px solid rgba(255, 215, 120, 0.18);
  border-radius: 16px;
  padding: 10px 14px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 220, 120, 0.35);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 10px 30px rgba(255, 215, 120, 0.08);
  }
`;

export const HeroRaceIcon = styled.span`
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  overflow: hidden;

  & > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const HeroRaceIconPlaceholder = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
`;

export const HeroTokenList = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin-top: 6px;
  overflow-x: auto;
`;

export const HeroToken = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 215, 120, 0.18);
  color: #F5E6B3;
  font-size: 0.75rem;
  font-weight: 600;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const HeroRetratoFrame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
`;

export const HeroRetratoImg = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${({ $isPlaceholder }) => ($isPlaceholder ? '62%' : '81%')};
  height: ${({ $isPlaceholder }) => ($isPlaceholder ? '62%' : '82%')};
  transform: translate(-50%, -50%);
  object-fit: cover;
  border-radius: 4px;
`;

export const HeroRetratoMoldura = styled.div`
  position: absolute;
  inset: 0;
  background: url(${molduraRetratoImg}) center / contain no-repeat;
  pointer-events: none;
`;

export { planetaRedungeonImg };

export const DialogHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 16px 16px 24px;
  border-bottom: 1px solid var(--status-gold-border);
`;

export const DialogHeaderTitle = styled.h3`
  margin: 0;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  color: var(--status-gold-strong);
  font-size: 1.15rem;
  font-weight: 700;
`;

export const DialogFecharButton = styled.button`
  all: unset;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid var(--color-accent);
  border-radius: 6px;
  color: var(--color-accent);

  &:hover {
    background: rgba(91, 124, 250, 0.14);
  }
`;

export const TabsBar = styled.div`
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--status-gold-border);
  margin: -32px -32px 0;
  padding: 0 16px;
`;

export const HeroAcoesRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

export const HeroAcaoBadge = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid var(--status-gold-border);
  transition:
    filter 0.15s ease,
    border-color 0.15s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &:hover,
  &:focus-visible {
    filter: brightness(1.15);
    border-color: var(--status-gold);
  }

  &:disabled {
    cursor: not-allowed;
    filter: brightness(0.7);
  }
`;
