import { describe, expect, it } from 'vitest';

import { CHAT_TEXTO_MAX } from 'common/utils/chat';
import { rotulosDosStatus, textoAvisoAcao } from './avisoChat';

describe('textoAvisoAcao', () => {
  it('monta nome, detalhe e PP restante', () => {
    expect(
      textoAvisoAcao({ nome: 'Atacar', detalhe: '-2 PP', ppAtual: 3, ppMaximo: 8 }),
    ).toBe('⚡ Atacar — -2 PP (PP 3/8)');
  });

  it('sem PP atual omite o sufixo; sem detalhe omite o travessão', () => {
    expect(
      textoAvisoAcao({
        nome: 'Descansar',
        detalhe: 'PP 2→8',
        ppAtual: null,
        ppMaximo: 8,
      }),
    ).toBe('⚡ Descansar — PP 2→8');
    expect(
      textoAvisoAcao({ nome: 'Ação Extra', detalhe: '', ppAtual: 0, ppMaximo: 4 }),
    ).toBe('⚡ Ação Extra (PP 0/4)');
  });

  it('nome vazio vira "Ação" e o texto respeita o limite do chat', () => {
    expect(textoAvisoAcao({ nome: '  ', detalhe: 'x' })).toBe('⚡ Ação — x');
    const longo = textoAvisoAcao({ nome: 'A', detalhe: 'b'.repeat(CHAT_TEXTO_MAX * 2) });
    expect(longo).toHaveLength(CHAT_TEXTO_MAX);
    expect(longo.endsWith('…')).toBe(true);
  });
});

describe('rotulosDosStatus', () => {
  it('traduz os ids conhecidos e ignora vazios', () => {
    expect(rotulosDosStatus(['saude', '', 'energia', 'outro'])).toBe(
      'Saúde, Energia, outro',
    );
    expect(rotulosDosStatus(null)).toBe('');
  });
});
