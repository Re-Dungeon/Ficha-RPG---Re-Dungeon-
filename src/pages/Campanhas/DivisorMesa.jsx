import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { DivisorAlca } from './styles';

const PASSO = 16;

// Divisão arrastável entre o mapa e o chat da mesa. `valor` é o tamanho atual
// do painel do chat (largura na horizontal, altura empilhado) e `onMudar`
// recebe o novo tamanho pretendido — quem usa limita e guarda. O chat fica à
// direita (ou embaixo): arrastar para a esquerda (ou para cima) o aumenta.
const DivisorMesa = ({ orientacao, valor, min, max, onMudar, onSoltar, onResetar }) => {
  const [arrastando, setArrastando] = useState(false);
  const inicioRef = useRef(null);
  const horizontal = orientacao === 'horizontal';
  const posicao = event => (horizontal ? event.clientX : event.clientY);

  const handlePointerDown = event => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    inicioRef.current = { pos: posicao(event), valor };
    setArrastando(true);
  };

  const handlePointerMove = event => {
    if (!inicioRef.current) return;
    onMudar(inicioRef.current.valor - (posicao(event) - inicioRef.current.pos));
  };

  const encerrar = event => {
    if (!inicioRef.current) return;
    inicioRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setArrastando(false);
    onSoltar?.();
  };

  const handleKeyDown = event => {
    const passos = horizontal
      ? { ArrowLeft: PASSO, ArrowRight: -PASSO }
      : { ArrowUp: PASSO, ArrowDown: -PASSO };
    let novo = null;
    if (event.key in passos) novo = valor + passos[event.key];
    else if (event.key === 'Home') novo = min;
    else if (event.key === 'End') novo = max;
    else if (event.key === 'Enter') {
      event.preventDefault();
      onResetar();
      return;
    }
    if (novo === null) return;
    event.preventDefault();
    onMudar(novo);
    onSoltar?.();
  };

  return (
    <DivisorAlca
      role="separator"
      tabIndex={0}
      aria-label="Redimensionar chat"
      aria-orientation={horizontal ? 'vertical' : 'horizontal'}
      aria-valuenow={Math.round(valor)}
      aria-valuemin={Math.round(min)}
      aria-valuemax={Math.round(max)}
      title="Arraste para redimensionar · duplo clique volta ao padrão"
      $horizontal={horizontal}
      data-arrastando={arrastando ? 'true' : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={encerrar}
      onPointerCancel={encerrar}
      onDoubleClick={onResetar}
      onKeyDown={handleKeyDown}
    />
  );
};

DivisorMesa.propTypes = {
  // 'horizontal' = mapa e chat lado a lado (divisão em pé, muda a largura);
  // 'vertical' = chat abaixo do mapa (divisão deitada, muda a altura).
  orientacao: PropTypes.oneOf(['horizontal', 'vertical']).isRequired,
  valor: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  onMudar: PropTypes.func.isRequired,
  // Fim de um ajuste (soltou o arraste ou apertou uma tecla): hora de gravar.
  onSoltar: PropTypes.func,
  onResetar: PropTypes.func.isRequired,
};

export default DivisorMesa;
