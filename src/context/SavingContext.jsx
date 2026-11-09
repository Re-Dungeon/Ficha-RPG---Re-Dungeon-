/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import SavingOverlay from 'components/SavingOverlay/SavingOverlay';
import ErrorSnackbar from 'components/ErrorSnackbar/ErrorSnackbar';

const SavingContext = createContext(null);

// O overlay só aparece se a gravação demorar: as ações rápidas da ficha
// (condição, item, PP) gravam em ~100ms e um véu de tela cheia piscando a cada
// clique atrapalhava mais do que informava. Antes havia 1s mínimo de overlay,
// que também descartava cliques seguidos nesse tempo.
const ATRASO_OVERLAY_MS = 400;
const MENSAGEM_ERRO_PADRAO = 'Não foi possível salvar. Verifique sua conexão e tente novamente.';

export const SavingProvider = ({ children }) => {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const emAndamentoRef = useRef(false);

  const executar = useCallback(async fn => {
    // Guarda por ref (não por state) para bloquear cliques duplos mesmo antes do
    // primeiro re-render — um segundo clique no mesmo tick é ignorado.
    if (emAndamentoRef.current) {
      return undefined;
    }
    emAndamentoRef.current = true;
    const timer = setTimeout(() => setSalvando(true), ATRASO_OVERLAY_MS);
    try {
      const resultado = await fn();
      return resultado;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Falha ao salvar:', error);
      setErro(MENSAGEM_ERRO_PADRAO);
      throw error;
    } finally {
      clearTimeout(timer);
      emAndamentoRef.current = false;
      setSalvando(false);
    }
  }, []);

  return (
    <SavingContext.Provider value={{ salvando, executar }}>
      {children}
      <SavingOverlay open={salvando} />
      <ErrorSnackbar open={!!erro} mensagem={erro} onClose={() => setErro(null)} />
    </SavingContext.Provider>
  );
};

SavingProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useSaving = () => {
  const contexto = useContext(SavingContext);
  if (!contexto) {
    throw new Error('useSaving deve ser usado dentro de um SavingProvider');
  }
  return contexto;
};
