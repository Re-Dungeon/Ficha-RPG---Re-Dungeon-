import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { getRegrasPorUniverso } from 'service/storage';
import { getNome } from 'common/utils/resolveNome';

import { SectionTitle, StatusValueRow } from '../styles';

const CodexTab = ({ personagem }) => {
  const [regras, setRegras] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!personagem.universo) {
      setRegras([]);
      setCarregando(false);
      return undefined;
    }
    let isMounted = true;
    setCarregando(true);
    getRegrasPorUniverso(personagem.universo).then(itens => {
      if (isMounted) {
        setRegras(itens);
        setCarregando(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [personagem.universo]);

  return (
    <div>
      <SectionTitle>Códex Mágico</SectionTitle>

      {!personagem.universo && (
        <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
          Selecione um Universo no menu lateral Info para ver as regras deste universo.
        </StatusValueRow>
      )}

      {personagem.universo && !carregando && regras.length === 0 && (
        <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
          Nenhuma regra cadastrada para este universo ainda.
        </StatusValueRow>
      )}

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {regras.map(regra => (
          <Accordion
            key={regra.id}
            sx={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              '&::before': { display: 'none' },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text-secondary)' }} />}>
              {getNome(regra)}
            </AccordionSummary>
            <AccordionDetails style={{ whiteSpace: 'pre-wrap' }}>
              <StatusValueRow style={{ display: 'block', color: 'var(--text-secondary)' }}>
                {regra.conteudo ?? regra.descricao ?? regra.texto ?? 'Sem conteúdo.'}
              </StatusValueRow>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    </div>
  );
};

CodexTab.propTypes = {
  personagem: PropTypes.object.isRequired,
};

export default CodexTab;
