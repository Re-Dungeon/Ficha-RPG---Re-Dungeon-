import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PersonagemHeroCard from './PersonagemHeroCard';

describe('PersonagemHeroCard', () => {
  it('renderiza os botões com imagens personalizadas e labels acessíveis de ação', () => {
    render(
      <PersonagemHeroCard
        personagem={{ id: 'p1', nome: 'Aria', linkImagem: '' }}
        racaNome="Humano"
        classesNomes={['Guerreiro']}
        onExcluir={vi.fn()}
      />,
    );

    const salvarBtn = screen.getByRole('button', { name: /salvar personagem/i });
    const removerBtn = screen.getByRole('button', { name: /remover personagem/i });

    expect(salvarBtn).toHaveAttribute('type', 'submit');
    expect(salvarBtn.querySelector('img')).toHaveAttribute('src', expect.stringContaining('badge-salvar'));
    expect(removerBtn.querySelector('img')).toHaveAttribute('src', expect.stringContaining('badge-excluir'));
  });
});
