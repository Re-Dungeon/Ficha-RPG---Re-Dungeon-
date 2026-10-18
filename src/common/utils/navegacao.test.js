import { describe, expect, it } from 'vitest';

import {
  SELECAO_VAZIA,
  destinoCampanhas,
  destinoFichas,
  mesmoPersonagemSelecionado,
  resumoPersonagem,
} from './navegacao';

const wesley = { id: 'wesley', tipo: 'Personagem Jogável', campanhas: ['c1', 'c2'] };

describe('destinoFichas', () => {
  it('volta para a ficha selecionada', () => {
    expect(destinoFichas({ personagem: wesley, campanhaId: 'c2' })).toBe('/personagens/wesley');
  });

  it('sem seleção, abre a lista', () => {
    expect(destinoFichas(SELECAO_VAZIA)).toBe('/personagens');
  });
});

describe('destinoCampanhas', () => {
  it('abre o chat da primeira campanha do personagem, falando como ele', () => {
    expect(destinoCampanhas({ personagem: wesley, campanhaId: null })).toEqual({
      to: '/campanhas/c1/chat',
      state: { personagemId: 'wesley' },
    });
  });

  it('prefere o último chat aberto se o personagem está nele', () => {
    expect(destinoCampanhas({ personagem: wesley, campanhaId: 'c2' }).to).toBe('/campanhas/c2/chat');
  });

  it('ignora o último chat se o personagem não está nele', () => {
    expect(destinoCampanhas({ personagem: wesley, campanhaId: 'c9' }).to).toBe('/campanhas/c1/chat');
  });

  it('personagem sem campanha (ou NPC) cai no último chat aberto ou na lista', () => {
    const npc = { id: 'npc', tipo: 'NPC', campanhas: ['c1'] };
    expect(destinoCampanhas({ personagem: npc, campanhaId: 'c3' })).toEqual({
      to: '/campanhas/c3/chat',
      state: null,
    });
    expect(destinoCampanhas({ personagem: { id: 'x', campanhas: [] }, campanhaId: null })).toEqual({
      to: '/campanhas',
      state: null,
    });
  });

  it('sem seleção, abre a lista', () => {
    expect(destinoCampanhas(SELECAO_VAZIA)).toEqual({ to: '/campanhas', state: null });
  });
});

describe('mesmoPersonagemSelecionado / resumoPersonagem', () => {
  it('compara só os campos que afetam a navegação', () => {
    const resumo = resumoPersonagem({ ...wesley, nome: 'Wesley Chase', atributosBase: {} });
    expect(resumo).toEqual({
      id: 'wesley',
      tipo: 'Personagem Jogável',
      companheiroDe: undefined,
      campanhas: ['c1', 'c2'],
    });
    expect(mesmoPersonagemSelecionado(resumo, resumoPersonagem(wesley))).toBe(true);
    expect(mesmoPersonagemSelecionado(resumo, { ...resumo, campanhas: ['c1'] })).toBe(false);
    expect(mesmoPersonagemSelecionado(resumo, null)).toBe(false);
    expect(mesmoPersonagemSelecionado(null, null)).toBe(true);
  });
});
