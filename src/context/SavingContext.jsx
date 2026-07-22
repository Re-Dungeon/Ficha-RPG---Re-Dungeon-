import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import SavingOverlay from 'components/SavingOverlay/SavingOverlay';
import ErrorSnackbar from 'components/ErrorSnackbar/ErrorSnackbar';

const SavingContext = createContext(null);

const DURACAO_MINIMA_MS = 2000;
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
    setSalvando(true);
    const inicio = Date.now();
    try {
      const resultado = await fn();
      return resultado;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Falha ao salvar:', error);
      setErro(MENSAGEM_ERRO_PADRAO);
      throw error;
    } finally {
      const decorrido = Date.now() - inicio;
      const espera = DURACAO_MINIMA_MS - decorrido;
      if (espera > 0) {
        await new Promise(resolve => setTimeout(resolve, espera));
      }
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
