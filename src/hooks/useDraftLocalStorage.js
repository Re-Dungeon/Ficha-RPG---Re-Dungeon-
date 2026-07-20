import { useCallback, useRef } from 'react';

const DEBOUNCE_MS = 400;

// Espelha valores de formulário em localStorage enquanto não são salvos no
// Firestore (MIGRACAO-REACT-FIREBASE.md §7.3) — protege contra perda de
// edição ao fechar/recarregar a aba sem salvar. `chave` deve identificar o
// personagem + a aba (ex.: `rascunho_personagem_<id>_atributos`).
export const useDraftLocalStorage = chave => {
  const timeoutRef = useRef(null);

  const lerRascunho = useCallback(() => {
    try {
      const bruto = window.localStorage.getItem(chave);
      return bruto ? JSON.parse(bruto) : null;
    } catch {
      return null;
    }
  }, [chave]);

  const salvarRascunho = useCallback(
    valores => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        try {
          window.localStorage.setItem(chave, JSON.stringify({ valores, salvoEm: Date.now() }));
        } catch {
          // localStorage indisponível (modo privado, quota cheia etc.) — ignora silenciosamente.
        }
      }, DEBOUNCE_MS);
    },
    [chave],
  );

  const limparRascunho = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    window.localStorage.removeItem(chave);
  }, [chave]);

  return { lerRascunho, salvarRascunho, limparRascunho };
};
