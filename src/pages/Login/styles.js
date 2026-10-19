import styled from 'styled-components';

import { MOBILE } from 'common/styles/breakpoints';

export const LoginWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 56px 20px 64px;
  background-color: #050d19;
  background-image:
    linear-gradient(180deg, rgba(5, 12, 26, 0.58) 0%, rgba(3, 8, 18, 0.7) 100%),
    url('https://i.imgur.com/v1EdhCV.jpeg');
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
  background-attachment: scroll;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 50% 24%, rgba(105, 142, 255, 0.18), transparent 22%),
      radial-gradient(circle at 20% 18%, rgba(84, 119, 203, 0.12), transparent 26%),
      radial-gradient(circle at 80% 22%, rgba(67, 96, 205, 0.1), transparent 24%);
    pointer-events: none;
  }
`;

export const LoginCard = styled.div`
  position: relative;
  width: min(100%, 440px);
  background: linear-gradient(180deg, rgba(12, 18, 29, 0.78) 0%, rgba(8, 13, 22, 0.92) 100%);
  border: 1px solid rgba(150, 171, 255, 0.26);
  border-radius: 24px;
  box-shadow:
    0 24px 60px rgba(1, 4, 12, 0.82),
    0 0 0 1px rgba(148, 168, 255, 0.08),
    inset 0 1px 0 rgba(214, 223, 255, 0.14),
    inset 0 0 26px rgba(79, 104, 204, 0.08);
  padding: 28px 28px 26px;
  backdrop-filter: blur(10px);
  animation: loginCardIn 0.5s ease;

  ${MOBILE} {
    padding: 22px 18px 20px;
  }

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

