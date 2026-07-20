import React from 'react';
import PropTypes from 'prop-types';

import LojaTrapacaSection from '../lojas/LojaTrapacaSection';
import LojaRokmasSection from '../lojas/LojaRokmasSection';

const LojasTab = ({ personagem, onSave }) => (
  <div>
    <LojaTrapacaSection personagem={personagem} onSave={onSave} />
    <div style={{ height: 1, background: 'var(--border-primary)', margin: '32px 0' }} />
    <LojaRokmasSection personagem={personagem} onSave={onSave} />
  </div>
);

LojasTab.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default LojasTab;
