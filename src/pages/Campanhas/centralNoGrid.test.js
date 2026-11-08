import { describe, expect, it } from 'vitest';

import { autorDaFicha, personagemDaCentral } from './centralNoGrid';

const tokens = [
  { id: 't-ogro', tipo: 'npc', refId: 'npc1' },
  { id: 't-a', tipo: 'jogador', refId: 'pjA' },
  { id: 't-b', tipo: 'jogador', refId: 'pjB' },
  { id: 't-outro', tipo: 'jogador', refId: 'pjOutro' },
];
const combate = {
  ordem: [
    { tokenId: 't-ogro' },
    { tokenId: 't-outro' },
    { tokenId: 't-b' },
    { tokenId: 't-a' },
  ],
};
const fichas = { pjA: { id: 'pjA' }, pjB: { id: 'pjB' }, pjOutro: { id: 'pjOutro' } };
const base = { combate, tokens, fichas, meusPersonagensIds: ['pjA', 'pjB'] };

describe('personagemDaCentral', () => {
  it('sem combate ou sem token meu, nenhum', () => {
    expect(personagemDaCentral({ ...base, combate: null })).toBeNull();
    expect(personagemDaCentral({ ...base, meusPersonagensIds: ['x'] })).toBeNull();
  });

  it('prefere o da vez, depois o do "Falando como", depois o primeiro na iniciativa', () => {
    expect(
      personagemDaCentral({ ...base, tokenDaVezId: 't-a', falandoComo: 'pjB' }),
    ).toBe('pjA');
    expect(
      personagemDaCentral({ ...base, tokenDaVezId: 't-outro', falandoComo: 'pjA' }),
    ).toBe('pjA');
    expect(personagemDaCentral({ ...base, tokenDaVezId: 't-ogro' })).toBe('pjB');
  });

  it('ignora personagem sem ficha carregada', () => {
    expect(personagemDaCentral({ ...base, fichas: { pjA: { id: 'pjA' } } })).toBe('pjA');
  });
});

describe('autorDaFicha', () => {
  it('assina como o personagem', () => {
    expect(
      autorDaFicha('u1', { id: 'pjA', nome: 'Aldric', linkImagem: 'https://x/a.png' }),
    ).toEqual({
      uid: 'u1',
      personagemId: 'pjA',
      autorNome: 'Aldric',
      autorAvatar: 'https://x/a.png',
      isMestre: false,
    });
  });
});
