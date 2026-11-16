import { beforeEach, describe, expect, it, vi } from 'vitest';

import { removerChatMembroDoPersonagem, setChatMembro } from 'service/storage';

import { sincronizarMembrosDoChat } from './sincronizarMembrosDoChat';
import { limparRegistroMembroDoChat, registrarMembroDoChat } from './useMembroDoChat';

vi.mock('service/storage', () => ({
  removerChatMembroDoPersonagem: vi.fn(),
  setChatMembro: vi.fn(),
}));

describe('sincronizarMembrosDoChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limparRegistroMembroDoChat();
    removerChatMembroDoPersonagem.mockResolvedValue(true);
    setChatMembro.mockResolvedValue();
  });

  it('apaga o ponteiro só das campanhas desmarcadas', async () => {
    const falhas = await sincronizarMembrosDoChat({
      uid: 'u1',
      personagemId: 'p1',
      antes: ['c1', 'c2'],
      depois: ['c2', 'c3'],
    });
    expect(falhas).toEqual([]);
    expect(removerChatMembroDoPersonagem).toHaveBeenCalledTimes(1);
    expect(removerChatMembroDoPersonagem).toHaveBeenCalledWith('c1', 'u1', 'p1');
  });

  it('sem mudança de campanhas não escreve nada', async () => {
    await sincronizarMembrosDoChat({ uid: 'u1', personagemId: 'p1', antes: ['c1'], depois: ['c1'] });
    expect(removerChatMembroDoPersonagem).not.toHaveBeenCalled();
  });

  it('campanha marcada de novo: a próxima abertura do chat regrava o ponteiro', async () => {
    await registrarMembroDoChat('c1', 'u1', 'p1');
    await sincronizarMembrosDoChat({ uid: 'u1', personagemId: 'p1', antes: ['c1'], depois: [] });
    await sincronizarMembrosDoChat({ uid: 'u1', personagemId: 'p1', antes: [], depois: ['c1'] });
    await registrarMembroDoChat('c1', 'u1', 'p1');
    expect(setChatMembro).toHaveBeenCalledTimes(2);
  });

  it('falha ao apagar é devolvida, sem lançar', async () => {
    const erro = new Error('offline');
    removerChatMembroDoPersonagem.mockRejectedValueOnce(erro);
    const falhas = await sincronizarMembrosDoChat({ uid: 'u1', personagemId: 'p1', antes: ['c1'], depois: [] });
    expect(falhas).toEqual([erro]);
  });

  it('sem uid ou personagem não faz nada', async () => {
    expect(await sincronizarMembrosDoChat({ personagemId: 'p1', antes: ['c1'] })).toEqual([]);
    expect(removerChatMembroDoPersonagem).not.toHaveBeenCalled();
  });
});
