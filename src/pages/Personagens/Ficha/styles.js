import styled, { keyframes } from 'styled-components';

import { MOBILE } from 'common/styles/breakpoints';

// Imagens da ficha em WebP, já no tamanho de uso (~2x o exibido); antes eram
// PNGs de 1 a 2 MB no imgur. O fundo e os selos Salvar/Excluir também são WebP.
import planetaRedungeonImg from './assets/planeta-redungeon.webp';
import molduraRetratoImg from './assets/moldura-retrato.webp';
import estrelaAtributosPrincipalImg from './assets/estrela-atributos.webp';
import gemaAtributoImg from './assets/gema-atributo.webp';

const FUNDO_FICHA_IMG = 'https://i.imgur.com/Fs3D2wd.png';

export const FichaWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
`;

export const FichaLayout = styled.div`
  flex: 1 1 auto;
  display: flex;
  min-height: 0;
  height: calc(100vh - 64px);
  height: calc(100dvh - 64px);
  overflow: hidden;

  ${MOBILE} {
    height: calc(100vh - 56px);
    height: calc(100dvh - 56px);
  }
`;

export const FichaMain = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 24px 32px;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  background-color: #090b14;
  background-image:
    linear-gradient(rgba(7, 5, 14, 0.78), rgba(7, 5, 14, 0.86)),
    url(${FUNDO_FICHA_IMG});
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;

  ${MOBILE} {
    gap: 16px;
    padding: 12px 12px 24px;
  }
`;

export const FichaChatPainel = styled.aside`
  display: flex;
  flex: 0 0 min(420px, 34vw);
  width: min(420px, 34vw);
  min-height: 0;
  height: 100%;
  overflow: hidden;
  background: rgba(10, 9, 19, 0.82);
  border-left: 1px solid var(--border-primary);
  backdrop-filter: blur(12px);
  box-sizing: border-box;

  ${MOBILE} {
    flex-basis: 100%;
    width: 100%;
    height: auto;
    border-left: none;
    border-top: 1px solid var(--border-primary);
  }
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
  background: linear-gradient(180deg, rgba(18, 16, 29, 0.98), rgba(12, 10, 20, 0.96));
  border: 1px solid rgba(190, 158, 95, 0.22);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
`;

export const AtributoCardButton = styled.button`
  background: linear-gradient(180deg, rgba(18, 16, 29, 0.98), rgba(12, 10, 20, 0.96));
  border: 1px solid rgba(190, 158, 95, 0.22);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);

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

  ${MOBILE} {
    width: 100%;
    padding: 20px 14px 18px;
    box-sizing: border-box;
  }
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

  /* Celular: herói no topo, as duas estrelas empilhadas em largura cheia. */
  ${MOBILE} {
    flex-direction: column;
    gap: 16px;
  }
`;

export const EstrelaWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
  width: clamp(240px, 30vw, 600px);
  aspect-ratio: 1 / 1;
  background: url(${estrelaAtributosPrincipalImg}) center / contain no-repeat;

  ${MOBILE} {
    width: min(100%, 340px);
  }
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
  font-size: clamp(1.5rem, 3.4vw, 2.6rem);
  font-weight: 800;
  line-height: 1;
  color: #fffdf8;
  text-shadow:
    0 2px 0 rgba(0, 0, 0, 0.82),
    0 0 12px rgba(255, 255, 255, 0.2),
    0 0 18px rgba(239, 68, 68, 0.45);

  ${MOBILE} {
    font-size: 1.9rem;
  }
`;

export const EstrelaCentroLabel = styled.span`
  display: block;
  white-space: nowrap;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: clamp(0.5rem, 1.15vw, 0.9rem);
  letter-spacing: 2.0px;
  text-transform: uppercase;
  color: #f7efe0;
  font-weight: 700;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.82), 0 0 10px rgba(0, 0, 0, 0.35);

  ${MOBILE} {
    font-size: 0.62rem;
    letter-spacing: 1.5px;
  }
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

const cyanArcanePulse = keyframes`
  0%,
  100% {
    -webkit-text-stroke: 1px rgba(46, 220, 255, 0.7);
    -webkit-text-fill-color: currentColor;
    text-shadow:
      0 1px 0 rgba(0, 0, 0, 0.9),
      0 0 3px rgba(46, 220, 255, 0.32),
      0 0 8px rgba(46, 220, 255, 0.18),
      0 0 12px rgba(46, 220, 255, 0.12);
    filter: drop-shadow(0 0 0 rgba(46, 220, 255, 0));
  }
  50% {
    -webkit-text-stroke: 1.2px rgba(24, 189, 255, 0.9);
    -webkit-text-fill-color: currentColor;
    text-shadow:
      0 1px 0 rgba(0, 0, 0, 0.95),
      0 0 5px rgba(46, 220, 255, 0.55),
      0 0 9px rgba(46, 220, 255, 0.34),
      0 0 15px rgba(46, 220, 255, 0.18);
    filter: drop-shadow(0 0 5px rgba(46, 220, 255, 0.25));
  }
`;

const cyanArcanePulseLabel = keyframes`
  0%,
  100% {
    -webkit-text-stroke: 0.7px rgba(46, 220, 255, 0.65);
    -webkit-text-fill-color: currentColor;
    text-shadow:
      0 2px 0 rgba(0, 0, 0, 0.75),
      0 0 3px rgba(46, 220, 255, 0.2),
      0 0 8px rgba(46, 220, 255, 0.1);
    filter: drop-shadow(0 0 0 rgba(46, 220, 255, 0));
  }
  50% {
    -webkit-text-stroke: 0.9px rgba(24, 189, 255, 0.82);
    -webkit-text-fill-color: currentColor;
    text-shadow:
      0 2px 0 rgba(0, 0, 0, 0.8),
      0 0 4px rgba(46, 220, 255, 0.35),
      0 0 10px rgba(46, 220, 255, 0.18);
    filter: drop-shadow(0 0 4px rgba(46, 220, 255, 0.18));
  }
`;

export const AtributoGemaValor = styled.span`
  font-size: clamp(0.95rem, 1.9vw, 1.3rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.04em;
  color: #fffdf8;
  -webkit-text-stroke: 1px rgba(255, 56, 56, 0.94);
  -webkit-text-fill-color: currentColor;
  paint-order: stroke fill;
  text-shadow:
    0 1px 0 rgba(0, 0, 0, 0.9),
    0 0 5px rgba(255, 80, 80, 0.4),
    0 0 12px rgba(255, 80, 80, 0.24);
  animation: ${cyanArcanePulse} 1.8s ease-in-out infinite;
  transition: filter 0.2s ease, transform 0.2s ease, text-shadow 0.2s ease;

  &:hover,
  &:focus-visible {
    filter: brightness(1.08);
    transform: translateY(-1px);
    text-shadow:
      0 1px 0 rgba(0, 0, 0, 0.95),
      0 0 8px rgba(255, 80, 80, 0.9),
      0 0 16px rgba(255, 80, 80, 0.65),
      0 0 22px rgba(255, 80, 80, 0.4);
  }

  ${MOBILE} {
    font-size: 1.05rem;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const AtributoGemaLabel = styled.span`
  width: 100%;
  font-size: clamp(0.48rem, 0.82vw, 1.05rem);
  line-height: 1.15;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  color: #f3ebd7;
  -webkit-text-stroke: 0.8px rgba(255, 56, 56, 0.9);
  -webkit-text-fill-color: currentColor;
  paint-order: stroke fill;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.75), 0 0 8px rgba(0, 0, 0, 0.35);
  overflow-wrap: break-word;
  font-weight: 700;
  animation: ${cyanArcanePulseLabel} 1.8s ease-in-out infinite;
  transition: filter 0.2s ease, text-shadow 0.2s ease;

  &:hover,
  &:focus-visible {
    filter: drop-shadow(0 0 6px rgba(255, 70, 70, 0.3));
    text-shadow:
      0 2px 0 rgba(0, 0, 0, 0.8),
      0 0 8px rgba(0, 0, 0, 0.45),
      0 0 18px rgba(255, 86, 86, 0.28);
  }

  ${MOBILE} {
    font-size: 0.64rem;
    letter-spacing: 0.45px;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const HeroCardWrapper = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: clamp(200px, 20vw, 350px);

  ${MOBILE} {
    order: -1;
    width: min(100%, 300px);
  }
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
  transform: scale(1.05);
  transform-origin: center center;
`;

export const HeroRetratoImg = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${({ $isPlaceholder }) => ($isPlaceholder ? '66%' : '85%')};
  height: ${({ $isPlaceholder }) => ($isPlaceholder ? '66%' : '86%')};
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

  /* Celular: título + fechar na 1ª linha; busca/filtros embaixo, largura cheia. */
  ${MOBILE} {
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px 12px 12px 16px;

    & > h3 {
      flex: 1;
      min-width: 0;
    }

    & > .MuiFormControl-root {
      order: 2;
      flex: 1 1 100%;
      max-width: none;
      min-width: 0;
    }

    & > button:last-child {
      order: 1;
    }
  }
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
  gap: 10px;
  margin-top: -6px;
  margin-bottom: -6px;
  animation: heroActionsIn 260ms ease-out both;

  @keyframes heroActionsIn {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

export const HeroAcaoBadge = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: clamp(112px, 9.8vw, 148px);
  height: clamp(112px, 9.8vw, 148px);
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  overflow: visible;
  transition:
    transform 0.18s ease,
    filter 0.18s ease,
    box-shadow 0.18s ease;
  will-change: transform;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    user-select: none;
    pointer-events: none;
  }

  &:active {
    transform: scale(0.97);
  }

  &:focus-visible {
    outline: none;
    filter: drop-shadow(0 0 10px rgba(232, 203, 133, 0.55));
  }

  @media (hover: hover) {
    &:hover {
      transform: scale(1.04);
      filter: brightness(1.08) saturate(1.06);
    }
  }

  &:disabled {
    cursor: not-allowed;
    filter: brightness(0.74) saturate(0.8);
    transform: none;
  }

  ${MOBILE} {
    width: clamp(98px, 25vw, 132px);
    height: clamp(98px, 25vw, 132px);
  }
`;

// Botões −5/−1/+1/+5 do diálogo de Saúde/Energia/Fadiga (gravam na hora).
export const AjusteRapidoRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 12px;
`;
