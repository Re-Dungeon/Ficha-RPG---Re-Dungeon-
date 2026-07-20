import React from 'react';
import PropTypes from 'prop-types';

import { getNome } from 'common/utils/resolveNome';

import NoChip from './NoChip';
import { AtributoCardWrapper, CardTitle, StatusValueRow } from '../styles';

const ConstelacaoCard = ({ constelacao, divindadeNome, idsDesbloqueados, onSelecionarNo }) => {
  const nos = constelacao.nos ?? [];
  const camadas = [...new Set(nos.map(no => no.camada ?? 1))].sort((a, b) => a - b);
  const totalDesbloqueados = nos.filter(no => idsDesbloqueados.includes(no.id)).length;
  const maximizada = nos.length > 0 && totalDesbloqueados === nos.length;

  return (
    <AtributoCardWrapper style={{ alignItems: 'flex-start', width: '100%' }}>
      <CardTitle>
        {maximizada ? '👑 ' : ''}
        {getNome(constelacao)}
        {divindadeNome ? ` — ${divindadeNome}` : ''}
      </CardTitle>
      <StatusValueRow>
        {totalDesbloqueados} / {nos.length} nós desbloqueados
      </StatusValueRow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8, width: '100%' }}>
        {camadas.map(camada => (
          <div key={camada}>
            <StatusValueRow style={{ display: 'block', marginBottom: 4 }}>Camada {camada}</StatusValueRow>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {nos
                .filter(no => (no.camada ?? 1) === camada)
                .map(no => (
                  <NoChip
                    key={no.id}
                    no={no}
                    desbloqueado={idsDesbloqueados.includes(no.id)}
                    onClick={() => onSelecionarNo(constelacao, no)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </AtributoCardWrapper>
  );
};

ConstelacaoCard.propTypes = {
  constelacao: PropTypes.object.isRequired,
  divindadeNome: PropTypes.string,
  idsDesbloqueados: PropTypes.array.isRequired,
  onSelecionarNo: PropTypes.func.isRequired,
};

ConstelacaoCard.defaultProps = {
  divindadeNome: null,
};

export default ConstelacaoCard;
