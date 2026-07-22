import styled from 'styled-components';

export const NumberFieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const NumberFieldLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--status-gold);

  svg {
    width: 14px;
    height: 14px;
    opacity: 0.7;
  }
`;

export const NumberFieldBox = styled.input`
  width: 100%;
  box-sizing: border-box;
  background: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--text-primary);
  text-align: center;

  &:disabled {
    color: var(--text-muted);
  }

  &:focus {
    outline: none;
    border-color: var(--field-border-strong);
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    margin: 0;
  }
`;
