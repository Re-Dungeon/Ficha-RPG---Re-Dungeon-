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
  width: clamp(200px, 20vw, 260px);
`;

export const HeroNomeBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  width: 100%;
  background: var(--status-panel-bg);
  border: 1px solid var(--status-gold-border);
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: var(--shadow-md);
`;

export const HeroNome = styled.h2`
  margin: 0;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 1.2rem;
  color: var(--status-gold-strong);
  text-shadow: 0 0 12px rgba(232, 203, 133, 0.35);
`;

export const HeroTitulo = styled.span`
  font-size: 0.85rem;
  font-style: italic;
  color: var(--text-secondary);
`;

export const HeroRace = styled.span`
  font-size: 0.85rem;
  font-style: italic;
  color: var(--color-accent);
`;

export const HeroClasseRaca = styled.span`
  margin-top: 6px;
  font-size: 0.8rem;
  color: var(--color-accent);
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 999px;
  padding: 4px 12px;
`;

export const HeroRetratoFrame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
`;

export const HeroRetratoImg = styled.img`
  position: absolute;
  inset: 9% 10%;
  width: 81%;
  height: 82%;
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
