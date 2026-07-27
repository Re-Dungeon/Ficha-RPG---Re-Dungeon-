import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from '@mui/material/Button';

const BannerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px 20px;
  margin-bottom: 20px;
  border-radius: 20px;
  border: 1px solid rgba(232, 203, 133, 0.18);
  background: linear-gradient(180deg, rgba(84, 73, 155, 0.18), rgba(24, 10, 40, 0.95));
  box-shadow: 0 18px 35px rgba(0, 0, 0, 0.18);
`;

const BannerText = styled.span`
  color: #f4f1ff;
  font-size: 0.95rem;
  line-height: 1.4;
  flex: 1;
  min-width: 240px;
`;

const BannerActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const BannerIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(232, 203, 133, 0.2);
  color: #fff;
  font-size: 1rem;
`;

const PrimaryButton = styled(Button)`
  && {
    background: linear-gradient(135deg, #e8cb85 0%, #f5df9a 100%);
    color: #1a0f35;
    border-radius: 14px;
    padding: 10px 18px;
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.18);
    transition: transform 180ms ease, box-shadow 180ms ease;
  }
  &&:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 26px rgba(0, 0, 0, 0.22);
  }
`;

const SecondaryButton = styled(Button)`
  && {
    color: #f4f1ff;
    border-color: rgba(255, 255, 255, 0.18);
    border-radius: 14px;
    padding: 10px 18px;
    transition: background 180ms ease, transform 180ms ease;
  }
  &&:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-1px);
  }
`;

const DraftBanner = ({ onRestaurar, onDescartar }) => (
  <BannerWrapper>
    <BannerIcon>⚠️</BannerIcon>
    <BannerText>
      Você tem alterações não salvas nesta aba, de uma sessão anterior.
    </BannerText>
    <BannerActions>
      <SecondaryButton size="small" variant="outlined" onClick={onDescartar}>
        Descartar
      </SecondaryButton>
      <PrimaryButton size="small" variant="contained" onClick={onRestaurar}>
        Restaurar
      </PrimaryButton>
    </BannerActions>
  </BannerWrapper>
);

DraftBanner.propTypes = {
  onRestaurar: PropTypes.func.isRequired,
  onDescartar: PropTypes.func.isRequired,
};

export default DraftBanner;
