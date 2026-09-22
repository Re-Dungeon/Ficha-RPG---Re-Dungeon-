import styled from 'styled-components';

export const LoginWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56px 20px 64px;
  background:
    radial-gradient(circle at 50% 28%, rgba(124, 143, 255, 0.2), transparent 25%),
    radial-gradient(circle at 15% 18%, rgba(111, 86, 255, 0.12), transparent 28%),
    radial-gradient(circle at 85% 20%, rgba(98, 118, 255, 0.1), transparent 28%),
    linear-gradient(180deg, #060b15 0%, #0b101d 38%, #090d17 100%);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.012) 1px, transparent 1px);
    background-size: 24px 24px;
    mask-image: radial-gradient(circle at center, black 36%, transparent 90%);
    opacity: 0.5;
  }
`;

export const LoginCard = styled.div`
  position: relative;
  width: min(100%, 440px);
  background: linear-gradient(180deg, rgba(15, 19, 31, 0.94) 0%, rgba(12, 14, 24, 0.96) 100%);
  border: 1px solid rgba(144, 164, 255, 0.28);
  border-radius: 24px;
  box-shadow:
    0 24px 60px rgba(1, 4, 12, 0.8),
    0 0 0 1px rgba(139, 155, 255, 0.12),
    inset 0 1px 0 rgba(201, 214, 255, 0.15),
    inset 0 0 24px rgba(99, 121, 255, 0.08);
  padding: 28px 28px 26px;
  backdrop-filter: blur(12px);
  animation: loginCardIn 0.5s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 12px;
    border: 1px solid rgba(170, 188, 255, 0.12);
    border-radius: 18px;
    pointer-events: none;
  }

  @keyframes loginCardIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const LoginAdornment = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 0 auto 18px;
  border-radius: 999px;
  background: rgba(136, 150, 255, 0.08);
  border: 1px solid rgba(148, 164, 255, 0.34);
  box-shadow: 0 0 18px rgba(134, 159, 255, 0.12);
  color: #dfe7ff;
  font-size: 0.9rem;
  line-height: 1;
`;

export const LoginTitle = styled.h1`
  margin: 0;
  text-align: center;
  font-size: clamp(1.7rem, 2vw, 2.05rem);
  letter-spacing: 0.12em;
  font-weight: 700;
  font-family: 'Georgia', 'Times New Roman', serif;
  color: #edf1ff;
  text-transform: uppercase;
`;

export const LoginDivider = styled.div`
  width: 120px;
  height: 1px;
  margin: 10px auto 0;
  background: linear-gradient(90deg, transparent, rgba(168, 183, 255, 0.9), transparent);
`;

export const LoginSubtitle = styled.h2`
  margin: 22px 0 8px;
  font-size: clamp(1.5rem, 2vw, 1.9rem);
  line-height: 1.15;
  text-align: left;
  color: #eef3ff;
  font-weight: 700;
  font-family: 'Segoe UI', sans-serif;
`;

export const LoginDescription = styled.p`
  margin: 0 0 22px;
  color: rgba(230, 235, 255, 0.7);
  font-size: 0.94rem;
  line-height: 1.5;
  text-align: left;
`;

export const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const LoginError = styled.p`
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 120, 120, 0.2);
  background: rgba(110, 20, 25, 0.18);
  color: #f6a7a7;
  font-size: 0.82rem;
  line-height: 1.4;
`;

