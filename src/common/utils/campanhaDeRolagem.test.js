import { describe, expect, it } from 'vitest';

import { campanhaDeRolagem } from './campanhaDeRolagem';

const jogavel = campanhas => ({ id: 'p1', campanhas });

describe('campanhaDeRolagem', () => {
  it('usa a preferida quando ela é do personagem', () => {
    expect(campanhaDeRolagem(jogavel(['c1', 'c2']), 'c2')).toBe('c2');
    expect(campanhaDeRolagem(jogavel(['c1']), 'c1')).toBe('c1');
  });

  it('ignora uma preferida que não é do personagem', () => {
    expect(campanhaDeRolagem(jogavel(['c1']), 'outra')).toBe('c1');
    expect(campanhaDeRolagem(jogavel(['c1', 'c2']), 'outra')).toBeNull();
  });

  it('usa a única campanha quando não há preferida', () => {
    expect(campanhaDeRolagem(jogavel(['c1']))).toBe('c1');
    expect(campanhaDeRolagem(jogavel(['c1']), null)).toBe('c1');
  });

  it('devolve null (perguntar) com 2 ou mais campanhas e sem preferida', () => {
    expect(campanhaDeRolagem(jogavel(['c1', 'c2']), null)).toBeNull();
  });

  it('devolve null sem campanha ou sem personagem', () => {
    expect(campanhaDeRolagem(jogavel([]), 'c1')).toBeNull();
    expect(campanhaDeRolagem(null, 'c1')).toBeNull();
  });
});
