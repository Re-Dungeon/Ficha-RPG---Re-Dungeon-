import styled from 'styled-components';

export const PageWrapper = styled.div`
  flex: 1;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background-image: url('https://i.imgur.com/REkKA1N.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`;

export const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.95rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-primary);
  text-shadow: 0 0 12px rgba(232, 203, 133, 0.25), 0 0 24px rgba(91, 124, 250, 0.18);
`;

export const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-muted);
  text-align: center;
  padding: 48px 24px;
`;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 22px;
`;

export const PersonagemCard = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  overflow: hidden;
  text-align: left;
  color: var(--text-primary);
  cursor: pointer;
  border: 1px solid
    ${props => (props.$isSelected ? 'rgba(140, 170, 255, 0.9)' : 'rgba(153, 170, 255, 0.24)')};
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(8, 10, 20, 0.84));
  box-shadow: ${props =>
    props.$isSelected
      ? '0 0 0 1px rgba(140, 170, 255, 0.24), 0 0 35px rgba(115, 140, 255, 0.3), 0 18px 50px rgba(0, 0, 0, 0.45)'
      : '0 18px 40px rgba(0, 0, 0, 0.3)'};
  backdrop-filter: blur(18px);
  transform: ${props => (props.$isSelected ? 'translateY(-4px) scale(1.03)' : 'translateY(0) scale(1)')};
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background: linear-gradient(135deg, rgba(117, 142, 255, 0.16), transparent 55%, rgba(184, 133, 255, 0.14));
    opacity: ${props => (props.$isSelected ? 1 : 0.85)};
  }

  &::after {
    content: '';
    position: absolute;
    inset: 10px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    pointer-events: none;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  }

  &:hover {
    transform: translateY(-3px) scale(1.01);
    border-color: rgba(160, 180, 255, 0.75);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4), 0 0 24px rgba(108, 130, 255, 0.18);
  }

  &:focus-visible {
    outline: none;
    border-color: rgba(183, 198, 255, 0.95);
    box-shadow: 0 0 0 2px rgba(183, 198, 255, 0.12), 0 18px 42px rgba(0, 0, 0, 0.4);
  }
`;

export const PersonagemMedia = styled.div`
  position: relative;
  height: 78%;
  min-height: 260px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(5,8,16,0.92));
`;

export const PersonagemCardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.25s ease;

  ${PersonagemCard}:hover & {
    transform: scale(1.04);
  }
`;

export const PersonagemCardImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(10, 12, 24, 0.92));
  color: var(--text-muted);
  font-size: 0.9rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 20px;

  img {
    width: 88%;
    height: 88%;
    object-fit: cover;
    border-radius: 16px;
    opacity: 0.95;
  }
`;

export const PersonagemMediaOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(7, 10, 21, 0.05) 0%, rgba(7, 10, 21, 0.2) 45%, rgba(7, 10, 21, 0.84) 100%);
  pointer-events: none;
`;

export const PersonagemInfo = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: 18px 18px 20px;
  background: linear-gradient(180deg, rgba(7, 10, 21, 0.05) 0%, rgba(7, 10, 21, 0.9) 100%);
`;

export const PersonagemNome = styled.h3`
  margin: 0;
  font-size: 1.16rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.04em;
  color: ${props => (props.$isSelected ? '#f7e7b9' : 'var(--text-primary)')};
  text-shadow: ${props =>
    props.$isSelected
      ? '0 0 8px rgba(232, 203, 133, 0.35), 0 0 16px rgba(91, 124, 250, 0.25)'
      : 'none'};

  &::after {
    content: '';
    display: block;
    width: 52px;
    height: 1px;
    margin-top: 6px;
    background: linear-gradient(90deg, rgba(232, 203, 133, 0.9), rgba(91, 124, 250, 0.25));
    box-shadow: 0 0 8px rgba(156, 170, 255, 0.18);
  }
`;

export const PersonagemMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const PersonagemTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 7px;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid
    ${props =>
      props.$variant === 'class'
        ? 'rgba(124, 151, 255, 0.36)'
        : props.$variant === 'race'
          ? 'rgba(232, 203, 133, 0.3)'
          : 'rgba(184, 132, 255, 0.34)'};
  color: ${props =>
    props.$variant === 'class'
      ? '#b9c9ff'
      : props.$variant === 'race'
        ? '#f5d7a0'
        : '#d8b9ff'};
  background: ${props =>
    props.$variant === 'class'
      ? 'rgba(91, 124, 250, 0.12)'
      : props.$variant === 'race'
        ? 'rgba(232, 203, 133, 0.1)'
        : 'rgba(129, 82, 255, 0.12)'};
  backdrop-filter: blur(8px);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
`;

export const FormWrapper = styled.div`
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
