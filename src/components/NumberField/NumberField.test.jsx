import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Formik } from 'formik';

import NumberField from './NumberField';

describe('NumberField', () => {
  it('permite digitar um valor negativo sem gravar NaN no Formik', async () => {
    let valoresSubmetidos = null;
    render(
      <Formik
        initialValues={{ valor: 0 }}
        onSubmit={valores => {
          valoresSubmetidos = valores;
        }}
      >
        {({ handleSubmit, values }) => (
          <form onSubmit={handleSubmit}>
            <NumberField name="valor" label="Valor" />
            <span data-testid="valor-atual">{String(values.valor)}</span>
            <button type="submit">Salvar</button>
          </form>
        )}
      </Formik>,
    );

    const input = screen.getByLabelText('Valor');

    // "-" sozinho é um estado intermediário válido de digitação — não deve virar NaN.
    fireEvent.change(input, { target: { value: '-' } });
    expect(screen.getByTestId('valor-atual')).toHaveTextContent('0');

    fireEvent.change(input, { target: { value: '-5' } });
    expect(screen.getByTestId('valor-atual')).toHaveTextContent('-5');

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));
    await waitFor(() => expect(valoresSubmetidos).toEqual({ valor: -5 }));
  });

  it('normaliza o campo pra 0 no blur se ficar vazio', async () => {
    render(
      <Formik initialValues={{ valor: 7 }} onSubmit={() => {}}>
        <NumberField name="valor" label="Valor" />
      </Formik>,
    );

    const input = screen.getByLabelText('Valor');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    await waitFor(() => expect(input).toHaveValue(0));
  });
});
