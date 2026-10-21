import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { SavingProvider } from 'context/SavingContext';
import {
  addComboAtaque,
  addComboDefesa,
  consumirRecursosPersonagem,
  getArts,
  getCombosAtaque,
  getCombosDefesa,
  getItensInventario,
  removeComboAtaque,
  removeComboDefesa,
  removeItemInventario,
  updateComboAtaque,
  updateComboDefesa,
  updateItemInventario,
} from 'service/storage';

import AtributosTab from './AtributosTab';
import { calcularCustoPpAcao, getTokensAcao } from '../prontidao/config';

// CalculadoraAtaqueModal usa useAuth — sem este mock o AuthContext importa
// service/firebase de verdade, que quebra no CI (sem .env → auth/invalid-api-key).
// currentUser null mantém a chave do aviso como `...aviso.anon` (ver beforeEach).
vi.mock('context/AuthContext', () => ({ useAuth: () => ({ currentUser: null }) }));

vi.mock('service/storage', () => ({
  getFirestoreItem: vi.fn().mockResolvedValue(null),
  getArts: vi.fn().mockResolvedValue([]),
  getItensInventario: vi.fn().mockResolvedValue([]),
  updateItemInventario: vi.fn().mockResolvedValue(null),
  removeItemInventario: vi.fn().mockResolvedValue(null),
  getCombosAtaque: vi.fn().mockResolvedValue([]),
  getCombosDefesa: vi.fn().mockResolvedValue([]),
  addComboAtaque: vi.fn().mockResolvedValue(null),
  addComboDefesa: vi.fn().mockResolvedValue(null),
  updateComboAtaque: vi.fn().mockResolvedValue(null),
  updateComboDefesa: vi.fn().mockResolvedValue(null),
  removeComboAtaque: vi.fn().mockResolvedValue(null),
  removeComboDefesa: vi.fn().mockResolvedValue(null),
  duplicateComboAtaque: vi.fn().mockResolvedValue(null),
  duplicateComboDefesa: vi.fn().mockResolvedValue(null),
  consumirEnergiaPersonagem: vi.fn().mockResolvedValue({ atual: 0, gasto: 0, maximo: 0 }),
  consumirRecursosPersonagem: vi.fn().mockResolvedValue({
    energia: { atual: 0, maximo: 0 },
    fadiga: { atual: 0, maximo: 0 },
    gastoEnergia: 0,
    gastoFadiga: 0,
  }),
}));

const renderComProvider = ui => render(<SavingProvider>{ui}</SavingProvider>);

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem('re.calculadora_ataque.aviso.anon', 'true');

  vi.resetAllMocks();
  vi.mocked(getCombosAtaque).mockResolvedValue([]);
  vi.mocked(getCombosDefesa).mockResolvedValue([]);
  vi.mocked(getItensInventario).mockResolvedValue([]);
  vi.mocked(updateItemInventario).mockResolvedValue(null);
  vi.mocked(removeItemInventario).mockResolvedValue(null);
  vi.mocked(addComboAtaque).mockResolvedValue(null);
  vi.mocked(addComboDefesa).mockResolvedValue(null);
  vi.mocked(updateComboAtaque).mockResolvedValue(null);
  vi.mocked(updateComboDefesa).mockResolvedValue(null);
  vi.mocked(removeComboAtaque).mockResolvedValue(null);
  vi.mocked(removeComboDefesa).mockResolvedValue(null);
  vi.mocked(consumirRecursosPersonagem).mockResolvedValue({
    energia: { atual: 0, maximo: 0 },
    fadiga: { atual: 0, maximo: 0 },
    gastoEnergia: 0,
    gastoFadiga: 0,
  });
});

const personagem = {
  id: 'p1',
  nome: 'Teste',
  atributosBase: { forca: 0, vitalidade: 0, agilidade: 0, inteligencia: 0, percepcao: 0, sorte: 0 },
  atributosExtra: {},
  atributosBonus: {},
  secundariosBase: {},
  secundariosExtra: {},
  secundariosBonus: {},
  status: {},
};

describe('AtributosTab — fluxo de edição', () => {
  it('abre a modal do atributo, recalcula o Total ao editar a Base e salva o valor correto', async () => {
    const onSave = vi.fn().mockResolvedValue();
    renderComProvider(<AtributosTab personagem={personagem} onSave={onSave} onExcluir={vi.fn()} />);

    const gemaForca = screen.getByRole('button', { name: /força/i });
    fireEvent.click(gemaForca);

    const dialog = await screen.findByRole('dialog', { name: /configurar força/i });
    fireEvent.change(within(dialog).getByLabelText('Base'), { target: { value: '50' } });

    // Dialog aberto deixa o resto da página aria-hidden, então reconsulta por role
    // não encontraria a gema — reusa a referência já capturada e olha só o texto.
    await waitFor(() => expect(within(gemaForca).getByText('50')).toBeInTheDocument());

    fireEvent.click(within(dialog).getByRole('button', { name: /salvar/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /^salvar$/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0].atributosBase.forca).toBe(50);
  });

  it('descarta as edições da modal ao clicar em Cancelar', async () => {
    const onSave = vi.fn().mockResolvedValue();
    renderComProvider(<AtributosTab personagem={personagem} onSave={onSave} onExcluir={vi.fn()} />);

    const gemaForca = screen.getByRole('button', { name: /força/i });
    fireEvent.click(gemaForca);
    const dialog = await screen.findByRole('dialog', { name: /configurar força/i });
    fireEvent.change(within(dialog).getByLabelText('Base'), { target: { value: '50' } });
    await waitFor(() => expect(within(gemaForca).getByText('50')).toBeInTheDocument());

    fireEvent.click(within(dialog).getByRole('button', { name: /cancelar/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    fireEvent.click(gemaForca);
    const dialogReaberto = await screen.findByRole('dialog', { name: /configurar força/i });
    expect(within(dialogReaberto).getByLabelText('Base')).toHaveValue(0);
  });

  it('mantém o valor bruto do bônus no campo editável mesmo quando há bônus de cultivo', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComBonus = {
      ...personagem,
      secundariosBonus: {
        prontidao: 3,
      },
      cultivoBonus: {
        secundarios: {
          prontidao: 4,
        },
      },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComBonus} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /prontidão/i }));
    const dialog = await screen.findByRole('dialog', { name: /configurar prontidão/i });

    expect(within(dialog).getByLabelText('Bônus')).toHaveValue(3);
  });

  it('aplica o balanceamento adaptativo de prontidão conforme a tabela oficial', () => {
    const referenciaPorPp = [
      { pp: 10, mover: 2, levantar: 2, atacar: 3, 'ataque-duplo': 5, 'auxiliar-aliado': 3, 'acao-extra': 8, salvaguarda: 3 },
      { pp: 23, mover: 4, levantar: 4, atacar: 7, 'ataque-duplo': 11, 'auxiliar-aliado': 6, 'acao-extra': 16, salvaguarda: 6 },
      { pp: 50, mover: 8, levantar: 8, atacar: 13, 'ataque-duplo': 22, 'auxiliar-aliado': 11, 'acao-extra': 31, salvaguarda: 12 },
      { pp: 100, mover: 14, levantar: 14, atacar: 26, 'ataque-duplo': 42, 'auxiliar-aliado': 20, 'acao-extra': 57, salvaguarda: 22 },
      { pp: 315, mover: 36, levantar: 35, atacar: 75, 'ataque-duplo': 120, 'auxiliar-aliado': 51, 'acao-extra': 150, salvaguarda: 60 },
      { pp: 1000, mover: 123, levantar: 121, atacar: 243, 'ataque-duplo': 381, 'auxiliar-aliado': 178, 'acao-extra': 465, salvaguarda: 198 },
      { pp: 5000, mover: 677, levantar: 680, atacar: 1250, 'ataque-duplo': 1900, 'auxiliar-aliado': 1017, 'acao-extra': 2250, salvaguarda: 1050 },
    ];

    for (const linha of referenciaPorPp) {
      expect(calcularCustoPpAcao(linha.pp, 'mover')).toBe(linha.mover);
      expect(calcularCustoPpAcao(linha.pp, 'levantar')).toBe(linha.levantar);
      expect(calcularCustoPpAcao(linha.pp, 'atacar')).toBe(linha.atacar);
      expect(calcularCustoPpAcao(linha.pp, 'ataque-duplo')).toBe(linha['ataque-duplo']);
      expect(calcularCustoPpAcao(linha.pp, 'auxiliar-aliado')).toBe(linha['auxiliar-aliado']);
      expect(calcularCustoPpAcao(linha.pp, 'acao-extra')).toBe(linha['acao-extra']);
      expect(calcularCustoPpAcao(linha.pp, 'salvaguarda')).toBe(linha.salvaguarda);
    }

    expect(calcularCustoPpAcao(23, 'mover')).toBe(4);
    expect(calcularCustoPpAcao(23, 'levantar')).toBe(4);
    expect(calcularCustoPpAcao(315, 'descansar')).toBe(0);
    expect(calcularCustoPpAcao(315, 'recuperar-se')).toBe(0);
    expect(calcularCustoPpAcao(5, 'atacar')).toBe(2);
  });

  it('abre o menu contextual do Ataque e a calculadora com o valor real da ficha', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComAtaque = {
      ...personagem,
      secundariosBase: { ...personagem.secundariosBase, ataque: 50 },
      secundariosExtra: {},
      secundariosBonus: {},
      status: { energia: { base: 0, extra: 0, bonus: 0, atual: 80 } },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComAtaque} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /ataque/i }));
    expect(screen.getAllByRole('menuitem')).toHaveLength(1);
    expect(screen.queryByRole('menuitem', { name: /mecânicas/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: /calculadora de ataque/i }));

    const dialog = await screen.findByRole('dialog', { name: /calculadora de ataque/i });
    expect(dialog.textContent).toMatch(/Ataque da ficha\s*50/i);
  });

  it('abre o menu contextual da Defesa e a calculadora com o valor real da ficha', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComDefesa = {
      ...personagem,
      secundariosBase: { ...personagem.secundariosBase, defesa: 42 },
      secundariosExtra: {},
      secundariosBonus: {},
      status: { energia: { base: 0, extra: 0, bonus: 0, atual: 100 } },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComDefesa} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /defesa/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /calculadora de defesa/i }));

    const dialog = await screen.findByRole('dialog', { name: /calculadora de defesa/i });
    expect(dialog.textContent).toMatch(/Defesa da ficha\s*42/i);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: /tipo de proteção/i }));
    expect(await screen.findByRole('option', { name: /defesa física/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /defesa mágica/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /defesa energética/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /defesa espiritual/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /defesa especial/i })).toBeInTheDocument();
  });

  it('salva combinação defensiva usando DEF como valor-base e não ATA', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComDefesa = {
      ...personagem,
      secundariosBase: { ...personagem.secundariosBase, ataque: 109, defesa: 7 },
      status: { energia: { base: 0, extra: 0, bonus: 0, atual: 100 } },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComDefesa} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /defesa/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /calculadora de defesa/i }));

    const dialog = await screen.findByRole('dialog', { name: /calculadora de defesa/i });
    fireEvent.change(within(dialog).getByLabelText(/nome da combinação/i), { target: { value: 'Escudo' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(addComboDefesa).toHaveBeenCalled());
    const payload = vi.mocked(addComboDefesa).mock.calls[0][1];
    expect(payload).toMatchObject({ nome: 'Escudo', valorBaseFicha: 7, defesaDaFicha: 7, potencialBase: 7 });
  });

  it('soma o custo da arte ao custo de potencialização na Defesa e consome exatamente o total', async () => {
    vi.mocked(getArts).mockResolvedValue([
      { id: 'art-defesa-1', nome: 'Escudo da Idade', custo: '2 PS' },
    ]);
    vi.mocked(getCombosDefesa).mockResolvedValue([
      {
        id: 'combo-def-1',
        nome: 'Escudo da Idade',
        tipoDano: 'Contundente',
        artId: 'art-defesa-1',
        potencializacao: 20,
        costResourceType: 'saude',
        custoSaude: 14,
        updatedAt: { seconds: 1700000000 },
      },
    ]);
    vi.mocked(consumirRecursosPersonagem).mockResolvedValue({
      energia: { atual: 0, maximo: 0 },
      fadiga: { atual: 0, maximo: 0 },
      saude: { atual: 46, maximo: 60 },
      gastoEnergia: 0,
      gastoFadiga: 0,
      gastoSaude: 14,
    });

    const onSave = vi.fn().mockResolvedValue();
    const personagemComDefesa = {
      ...personagem,
      id: 'p1',
      secundariosBase: { ...personagem.secundariosBase, defesa: 20 },
      status: {
        energia: { base: 0, extra: 0, bonus: 0, atual: 50, maximo: 50 },
        fadiga: { base: 0, extra: 0, bonus: 0, atual: 20, maximo: 20 },
        saude: { base: 0, extra: 0, bonus: 0, atual: 60, maximo: 60 },
      },
      statusMaximos: {
        energia: 50,
        fadiga: 20,
        saude: 60,
      },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComDefesa} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /defesa/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /calculadora de defesa/i }));

    const dialog = await screen.findByRole('dialog', { name: /calculadora de defesa/i });
    fireEvent.click(within(dialog).getByRole('button', { name: /^usar$/i }));

    const confirmDialog = await screen.findByRole('dialog', { name: /utilizar combinação/i });
    expect(confirmDialog).toHaveTextContent(/Custo\s*14/i);
    expect(confirmDialog).toHaveTextContent(/Saúde após utilização:\s*46\s*\/\s*60/i);

    fireEvent.click(within(confirmDialog).getByRole('button', { name: /confirmar uso/i }));

    await waitFor(() => expect(consumirRecursosPersonagem).toHaveBeenCalledWith('p1', { energia: 0, fadiga: 0, saude: 14 }));
  });

  it('abre o menu contextual da Prontidão com a Central de Ações e o modal de mecânicas', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariosBase: { ...personagem.secundariosBase, prontidao: 20 },
      secundariostotais: { prontidao: 20 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));

    expect(await screen.findByRole('menuitem', { name: /central de ações/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /mecânicas de prontidão/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));
    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    expect(modal).toHaveTextContent('20 / 20 PP');
  });

  it('abre o painel de detalhes da ação na central de ações', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariostotais: { prontidao: 20 },
      estadoCombate: { ppAtual: 20, turno: 1, historicoAcoes: [] },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 20 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    fireEvent.click(within(modal).getByRole('button', { name: /ver detalhes: atacar/i }));

    const painel = await screen.findByRole('dialog', { name: /detalhes da ação atacar/i });
    expect(painel).toHaveTextContent(/nome da ação/i);
    expect(painel).toHaveTextContent(/categoria/i);
    expect(painel).toHaveTextContent(/custo percentual de pp/i);
  });

  it('mostra tokens de comportamento na central de ações', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariostotais: { prontidao: 20 },
      estadoCombate: { ppAtual: 20, turno: 1, historicoAcoes: [] },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 20 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    expect(within(modal).getAllByText(/única/i).length).toBeGreaterThan(0);
    expect(within(modal).getAllByText(/reativa/i).length).toBeGreaterThan(0);
  });

  it('desconta PP corretamente ao executar Ataque na central de ações', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariostotais: { prontidao: 315 },
      estadoCombate: { ppAtual: 315, turno: 1, historicoAcoes: [] },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    fireEvent.click(within(modal).getByRole('button', { name: /executar ação: atacar/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    const payload = onSave.mock.calls[0][0];
    expect(payload.estadoCombate.ppAtual).toBe(240);
    expect(payload.estadoCombate.historicoAcoes).toHaveLength(1);
    expect(payload.estadoCombate.historicoAcoes[0].custo).toBe('-75 PP');
    expect(payload.estadoCombate.historicoAcoes[0].turno).toBe('Turno 1');
  });

  it('normaliza rótulos de turno para evitar duplicação do prefixo', () => {
    const { normalizarTurnoTexto } = require('../prontidao/config');

    expect(normalizarTurnoTexto('Turno 1')).toBe('Turno 1');
    expect(normalizarTurnoTexto('Turno 2')).toBe('Turno 2');
    expect(normalizarTurnoTexto(3)).toBe('Turno 3');
    expect(normalizarTurnoTexto('turno 4')).toBe('Turno 4');
  });

  it('marca Ataque Duplo e Usar Habilidade / Arte como ações únicas e bloqueia uso duplicado no mesmo turno', async () => {
    expect(getTokensAcao({ id: 'ataque-duplo' }).map(token => token.id)).toContain('unica');
    expect(getTokensAcao({ id: 'usar-habilidade' }).map(token => token.id)).toContain('unica');

    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariostotais: { prontidao: 315 },
      estadoCombate: { ppAtual: 315, turno: 1, historicoAcoes: [] },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    fireEvent.click(within(modal).getByRole('button', { name: /executar ação: ataque duplo/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    fireEvent.click(within(modal).getByRole('button', { name: /executar ação: ataque duplo/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('bloqueia a execução de Ataque mais de uma vez no mesmo turno', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariostotais: { prontidao: 315 },
      estadoCombate: { ppAtual: 315, turno: 1, historicoAcoes: [] },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    const atacarButton = within(modal).getByRole('button', { name: /executar ação: atacar/i });

    fireEvent.click(atacarButton);
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));

    fireEvent.click(within(modal).getByRole('button', { name: /executar ação: atacar/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(within(modal).getByRole('button', { name: /executar ação: atacar/i })).toHaveTextContent(/executada/i);
    expect(within(modal).queryByText(/já executada/i)).not.toBeInTheDocument();
  });

  it('aplica custos percentuais da prontidão máxima em 315 PP para Ataque, Ataque Duplo e Contra-ataque', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariostotais: { prontidao: 315 },
      estadoCombate: { ppAtual: 315, turno: 1, historicoAcoes: [] },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    expect(modal).toHaveTextContent('Custo: 75 PP');
    expect(modal).toHaveTextContent('Custo: 120 PP');
    expect(modal).toHaveTextContent('Custo: 90 PP');

    fireEvent.click(within(modal).getByRole('button', { name: /executar ação: atacar/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const payload = onSave.mock.calls[0][0];
    expect(payload.estadoCombate.ppAtual).toBe(240);
    expect(payload.estadoCombate.historicoAcoes[0].custo).toBe('-75 PP');
  });

  it('filtra ações por nome, categoria e ignora maiúsculas e acentos na busca da central de ações', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariostotais: { prontidao: 315 },
      estadoCombate: { ppAtual: 315, turno: 1, historicoAcoes: [] },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    const searchInput = within(modal).getByRole('textbox', { name: /pesquisar ações de combate/i });

    fireEvent.change(searchInput, { target: { value: 'MOVIMENTACAO' } });
    expect(within(modal).getByRole('button', { name: /executar ação: movimentar-se/i })).toBeInTheDocument();
    expect(within(modal).queryByRole('button', { name: /executar ação: atacar/i })).not.toBeInTheDocument();

    fireEvent.click(within(modal).getByRole('tab', { name: /recuperação/i }));
    fireEvent.change(searchInput, { target: { value: 'RECUPERA' } });
    expect(within(modal).getByRole('button', { name: /executar ação: recuperar-se/i })).toBeInTheDocument();
    expect(within(modal).queryByRole('button', { name: /executar ação: atacar/i })).not.toBeInTheDocument();
  });

  it('aplica custo automático de auxiliar aliado e abre fluxo de confirmação sem perguntar PP manual', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariostotais: { prontidao: 315 },
      estadoCombate: { ppAtual: 315, turno: 1, historicoAcoes: [] },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    const botaoAuxiliarAliado = within(modal).getByRole('button', { name: /executar ação: auxiliar aliado/i });
    expect(modal).toHaveTextContent('Custo: 51 PP');
    expect(botaoAuxiliarAliado).not.toHaveTextContent(/custo pendente/i);
    fireEvent.click(botaoAuxiliarAliado);

    const confirmacao = await screen.findByRole('dialog', { name: /auxiliar aliado/i });
    fireEvent.change(within(confirmacao).getByLabelText(/aliado a ser auxiliado/i), { target: { value: 'Kaien' } });
    fireEvent.change(within(confirmacao).getByLabelText(/descrição do auxílio/i), { target: { value: 'Distrair o inimigo para abrir caminho.' } });
    fireEvent.click(within(confirmacao).getByRole('button', { name: /confirmar auxílio/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const payload = onSave.mock.calls[0][0];
    expect(payload.estadoCombate.ppAtual).toBe(264);
    expect(payload.estadoCombate.historicoAcoes[0].nome).toBe('Auxiliar Aliado');
    expect(within(confirmacao).queryByText(/quanto pp/i)).not.toBeInTheDocument();
  });

  it('mostra estado vazio e limpa a pesquisa sem fechar a central de ações', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariostotais: { prontidao: 315 },
      estadoCombate: { ppAtual: 315, turno: 1, historicoAcoes: [] },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    const searchInput = within(modal).getByRole('textbox', { name: /pesquisar ações de combate/i });

    fireEvent.change(searchInput, { target: { value: 'nada-encontrado' } });
    expect(within(modal).getByText(/nenhuma ação encontrada/i)).toBeInTheDocument();
    expect(within(modal).getByRole('button', { name: /limpar pesquisa/i })).toBeInTheDocument();

    fireEvent.click(within(modal).getByRole('button', { name: /limpar pesquisa/i }));
    expect(searchInput).toHaveValue('');
    expect(within(modal).getByRole('button', { name: /executar ação: atacar/i })).toBeInTheDocument();
  });

  it('exibe a categoria Recuperação com as ações de recuperação na central de ações', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariostotais: { prontidao: 315 },
      estadoCombate: { ppAtual: 65, turno: 3, historicoAcoes: [] },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    expect(within(modal).getByRole('tab', { name: /recuperação/i })).toBeInTheDocument();

    fireEvent.click(within(modal).getByRole('tab', { name: /recuperação/i }));
    expect(within(modal).getAllByText(/recuperar-se/i).length).toBeGreaterThan(0);
    expect(within(modal).getAllByText(/descansar/i).length).toBeGreaterThan(0);
  });

  it('organiza ações novas nas categorias corretas e bloqueia custo pendente da central de ações', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariostotais: { prontidao: 315 },
      estadoCombate: { ppAtual: 315, turno: 1, historicoAcoes: [] },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    fireEvent.click(within(modal).getByRole('tab', { name: /utilitárias/i }));
    expect(within(modal).getByRole('button', { name: /executar ação: usar habilidade \/ arte/i })).toBeInTheDocument();
    expect(within(modal).getByRole('button', { name: /executar ação: agarrar \/ empurrar/i })).toBeInTheDocument();
    expect(within(modal).getByRole('button', { name: /executar ação: usar item/i })).toBeDisabled();
    expect(within(modal).getByRole('button', { name: /executar ação: auxiliar aliado/i })).toBeEnabled();
  });

  it('filtra itens não consumíveis do popup de usar item e mantém consumíveis válidos', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const itensInventarioMix = [
      { id: 'espadao', nome: 'Espadão', tipo: 'Arma', quantidade: 1, descricao: 'Lâmina pesada.', habilidadesEspeciais: [] },
      { id: 'armadura', nome: 'Armadura de Ferro', tipo: 'Armadura', quantidade: 1, descricao: 'Proteção.', habilidadesEspeciais: [] },
      { id: 'bandagem', nome: 'Bandagem de Cura', tipo: 'Suprimento', quantidade: 2, descricao: 'Restaura saúde e cura ferimentos.', habilidadesEspeciais: [] },
      { id: 'consumivel-plural', nome: 'Infusão de Fogo', tipo: 'Consumíveis', quantidade: 1, descricao: 'Recupera energia e ignição.', habilidadesEspeciais: [] },
      { id: 'pocao', nome: 'Poção de Cura', tipo: 'Poção', quantidade: 2, descricao: 'Restaura saúde.', habilidadesEspeciais: [] },
      { id: 'zero', nome: 'Elixir Vazio', tipo: 'Consumível', quantidade: 0, descricao: 'Não disponível.', habilidadesEspeciais: [] },
    ];
    vi.mocked(getItensInventario).mockResolvedValue(itensInventarioMix);
    const personagemComProntidao = {
      ...personagem,
      id: 'p1',
      secundariostotais: { prontidao: 315 },
      estadoCombate: { ppAtual: 315, turno: 1, historicoAcoes: [] },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    fireEvent.click(within(modal).getByRole('tab', { name: /utilitárias/i }));
    fireEvent.click(within(modal).getByRole('button', { name: /executar ação: usar item/i }));

    const dialogItem = await screen.findByRole('dialog', { name: /usar item/i });
    expect(within(dialogItem).getByRole('button', { name: /selecionar: poção de cura/i })).toBeInTheDocument();
    expect(within(dialogItem).getByRole('button', { name: /selecionar: infusão de fogo/i })).toBeInTheDocument();
    expect(within(dialogItem).queryByRole('button', { name: /selecionar: espadão/i })).not.toBeInTheDocument();
    expect(within(dialogItem).queryByRole('button', { name: /selecionar: armadura de ferro/i })).not.toBeInTheDocument();
    expect(within(dialogItem).queryByRole('button', { name: /selecionar: bandagem de cura/i })).not.toBeInTheDocument();
    expect(within(dialogItem).queryByRole('button', { name: /selecionar: elixir vazio/i })).not.toBeInTheDocument();
    expect(within(dialogItem).getByText(/itens disponíveis/i)).toBeInTheDocument();
  });

  it('apresenta o card de item com imagem, raridade e efeito em dados antes do uso', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const itemPoção = {
      id: 'item-dado',
      nome: 'Poção de Fadiga',
      tipo: 'Poção',
      qualidade: 'Raro',
      linkImagem: 'https://example.com/pocao.png',
      quantidade: 2,
      extra: '2d6+3',
      descricao: 'Recupera parte da fadiga.',
      habilidadesEspeciais: [],
    };
    vi.mocked(getItensInventario).mockResolvedValue([itemPoção]);
    const personagemComProntidao = {
      ...personagem,
      id: 'p1',
      status: {
        ...personagem.status,
        fadiga: { atual: 20, maximo: 40 },
      },
      statusMaximos: { energia: 50, fadiga: 40, hp: 100, saude: 100 },
      secundariostotais: { prontidao: 315 },
      estadoCombate: { ppAtual: 315, turno: 1, historicoAcoes: [] },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    fireEvent.click(within(modal).getByRole('tab', { name: /utilitárias/i }));
    fireEvent.click(within(modal).getByRole('button', { name: /executar ação: usar item/i }));

    const dialogItem = await screen.findByRole('dialog', { name: /usar item/i });
    expect(within(dialogItem).getByRole('img', { name: /poção de fadiga/i })).toBeInTheDocument();
    expect(within(dialogItem).getByText(/raro/i)).toBeInTheDocument();
    expect(within(dialogItem).getByText(/2d6 \+ 3/i)).toBeInTheDocument();

    fireEvent.click(within(dialogItem).getByRole('button', { name: /selecionar: poção de fadiga/i }));

    expect(within(dialogItem).getByRole('button', { name: /^fadiga$/i })).toBeInTheDocument();
  });

  it('abre a etapa de aplicação com seleção múltipla e consome apenas uma unidade ao confirmar', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const itemPoção = {
      id: 'item-multi',
      nome: 'Poção Mista',
      tipo: 'Poção',
      qualidade: 'Comum',
      linkImagem: '',
      quantidade: 3,
      extra: '25',
      descricao: 'Recupera 25 pontos para vários status.',
      habilidadesEspeciais: [],
    };
    vi.mocked(getItensInventario).mockResolvedValue([itemPoção]);
    const personagemComProntidao = {
      ...personagem,
      id: 'p1',
      status: {
        ...personagem.status,
        hp: { atual: 65, maximo: 100 },
        energia: { atual: 40, maximo: 100 },
        fadiga: { atual: 70, maximo: 100 },
      },
      statusMaximos: { energia: 100, fadiga: 100, hp: 100, saude: 100 },
      secundariostotais: { prontidao: 315 },
      estadoCombate: { ppAtual: 315, turno: 1, historicoAcoes: [] },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    fireEvent.click(within(modal).getByRole('tab', { name: /utilitárias/i }));
    fireEvent.click(within(modal).getByRole('button', { name: /executar ação: usar item/i }));

    const dialogItem = await screen.findByRole('dialog', { name: /usar item/i });
    fireEvent.click(within(dialogItem).getByRole('button', { name: /selecionar: poção mista/i }));

    expect(within(dialogItem).getByText(/utilizar item/i)).toBeInTheDocument();
    fireEvent.click(within(dialogItem).getByRole('checkbox', { name: /saúde/i }));
    fireEvent.click(within(dialogItem).getByRole('checkbox', { name: /energia/i }));
    fireEvent.click(within(dialogItem).getByRole('checkbox', { name: /fadiga/i }));
    fireEvent.click(within(dialogItem).getByRole('button', { name: /confirmar utilização/i }));

    await waitFor(() => expect(updateItemInventario).toHaveBeenCalledWith('p1', 'item-multi', { quantidade: 2 }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));

    const payload = onSave.mock.calls[0][0];
    expect(payload.status.hp.atual).toBe(90);
    expect(payload.status.energia.atual).toBe(65);
    expect(payload.status.fadiga.atual).toBe(95);
    expect(payload.estadoCombate.historicoAcoes[0].nome).toContain('Poção Mista');
  });

  it('permite usar um item real do inventário a partir da central de ações', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const itemPoção = {
      id: 'item-1',
      nome: 'Poção de Cura',
      tipo: 'Poção',
      quantidade: 1,
      descricao: 'Restaura 1 ponto de saúde.',
      habilidadesEspeciais: [],
    };
    vi.mocked(getItensInventario).mockResolvedValue([itemPoção]);
    const personagemComProntidao = {
      ...personagem,
      id: 'p1',
      secundariostotais: { prontidao: 315 },
      estadoCombate: { ppAtual: 315, turno: 1, historicoAcoes: [] },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    fireEvent.click(within(modal).getByRole('tab', { name: /utilitárias/i }));

    const botaoUsarItem = within(modal).getByRole('button', { name: /executar ação: usar item/i });
    expect(botaoUsarItem).toBeEnabled();

    fireEvent.click(botaoUsarItem);

    const dialogItem = await screen.findByRole('dialog', { name: /usar item/i });
    fireEvent.click(within(dialogItem).getByRole('button', { name: /usar: poção de cura/i }));

    await waitFor(() => expect(removeItemInventario).toHaveBeenCalledWith('p1', 'item-1'));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));

    const payload = onSave.mock.calls[0][0];
    expect(payload.estadoCombate.historicoAcoes[0].nome).toBe('Poção de Cura');
  });

  it('permite selecionar o status de um item fixo antes de confirmar a recuperação', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const itemPoção = {
      id: 'item-fixo',
      nome: 'Poção de Cura',
      tipo: 'Poção',
      qualidade: 'Comum',
      linkImagem: '',
      quantidade: 2,
      extra: '25',
      descricao: 'Recupera 25 de saúde.',
      habilidadesEspeciais: [],
    };
    vi.mocked(getItensInventario).mockResolvedValue([itemPoção]);
    const personagemComProntidao = {
      ...personagem,
      id: 'p1',
      status: {
        ...personagem.status,
        hp: { atual: 40, maximo: 100 },
        energia: { atual: 25, maximo: 60 },
        fadiga: { atual: 15, maximo: 30 },
      },
      statusMaximos: { energia: 60, fadiga: 30, hp: 100, saude: 100 },
      secundariostotais: { prontidao: 315 },
      estadoCombate: { ppAtual: 315, turno: 1, historicoAcoes: [] },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    fireEvent.click(within(modal).getByRole('tab', { name: /utilitárias/i }));
    fireEvent.click(within(modal).getByRole('button', { name: /executar ação: usar item/i }));

    const dialogItem = await screen.findByRole('dialog', { name: /usar item/i });
    fireEvent.click(within(dialogItem).getByRole('button', { name: /selecionar: poção de cura/i }));
    fireEvent.click(within(dialogItem).getByRole('button', { name: /^saúde$/i }));
    fireEvent.click(within(dialogItem).getByRole('button', { name: /confirmar utilização/i }));

    await waitFor(() => expect(updateItemInventario).toHaveBeenCalledWith('p1', 'item-fixo', { quantidade: 1 }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const payload = onSave.mock.calls[0][0];
    expect(payload.status.hp.atual).toBe(65);
    expect(payload.status.hp.maximo).toBe(100);
  });

  it('permite usar um item com efeito em dados, escolher a recuperação e aplicar a fadiga corretamente', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    const itemPoção = {
      id: 'item-fadiga',
      nome: 'Poção de Fadiga',
      tipo: 'Poção',
      qualidade: 'Raro',
      linkImagem: '',
      quantidade: 3,
      extra: '2d6+3',
      descricao: 'Recupera parte da fadiga.',
      habilidadesEspeciais: [],
    };
    vi.mocked(getItensInventario).mockResolvedValue([itemPoção]);
    const personagemComProntidao = {
      ...personagem,
      id: 'p1',
      status: {
        ...personagem.status,
        fadiga: { atual: 20, maximo: 40 },
        energia: { atual: 30, maximo: 50 },
        hp: { atual: 50, maximo: 100 },
      },
      statusMaximos: { energia: 50, fadiga: 40, hp: 100, saude: 100 },
      secundariostotais: { prontidao: 315 },
      estadoCombate: { ppAtual: 315, turno: 1, historicoAcoes: [] },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    fireEvent.click(within(modal).getByRole('tab', { name: /utilitárias/i }));
    fireEvent.click(within(modal).getByRole('button', { name: /executar ação: usar item/i }));

    const dialogItem = await screen.findByRole('dialog', { name: /usar item/i });
    fireEvent.click(within(dialogItem).getByRole('button', { name: /selecionar: poção de fadiga/i }));
    fireEvent.click(within(dialogItem).getByRole('button', { name: /^fadiga$/i }));
    fireEvent.click(within(dialogItem).getByRole('button', { name: /confirmar uso/i }));

    await waitFor(() => expect(updateItemInventario).toHaveBeenCalledWith('p1', 'item-fadiga', { quantidade: 2 }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const payload = onSave.mock.calls[0][0];
    expect(payload.status.fadiga.atual).toBe(25);
    expect(payload.status.fadiga.maximo).toBe(40);
    expect(payload.estadoCombate.historicoAcoes[0].nome).toContain('Poção de Fadiga');

    randomSpy.mockRestore();
  });

  it('recupera 20% dos PP máximos e bloqueia reutilização no mesmo turno', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariostotais: { prontidao: 315 },
      estadoCombate: {
        ppAtual: 65,
        turno: 3,
        historicoAcoes: [],
        recuperacaoUtilizada: false,
        descansando: false,
      },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    fireEvent.click(within(modal).getByRole('tab', { name: /recuperação/i }));
    fireEvent.click(within(modal).getByRole('button', { name: /executar ação: recuperar-se/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const payload = onSave.mock.calls[0][0];
    expect(payload.estadoCombate.ppAtual).toBe(128);
    expect(payload.estadoCombate.recuperacaoUtilizada).toBe(true);
    expect(payload.estadoCombate.historicoAcoes[0].nome).toBe('Recuperar-se');

    fireEvent.click(within(modal).getByRole('button', { name: /executar ação: recuperar-se/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('ativa a ação extra com custo progressivo da prontidão e cria benefício pendente no turno', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariostotais: { prontidao: 315 },
      estadoCombate: { ppAtual: 315, turno: 1, historicoAcoes: [] },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    fireEvent.click(within(modal).getByRole('button', { name: /executar ação: ação extra/i }));

    const confirmacao = await screen.findByRole('dialog', { name: /confirmar ação extra/i });
    fireEvent.click(within(confirmacao).getByRole('button', { name: /confirmar ação extra/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const payload = onSave.mock.calls[0][0];
    expect(payload.estadoCombate.ppAtual).toBe(165);
    expect(payload.estadoCombate.acaoExtra.status).toBe('pendente');
    expect(payload.estadoCombate.acaoExtra.custoPago).toBe(150);
    expect(payload.estadoCombate.acaoExtra.limiteCusto).toBe(150);
    expect(payload.estadoCombate.acaoExtra.usosRestantes).toBe(1);
    expect(screen.getByText(/ação extra ativa/i)).toBeInTheDocument();
  });

  it('bloqueia uma segunda ativação de ação extra no mesmo turno', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariostotais: { prontidao: 315 },
      estadoCombate: {
        ppAtual: 124,
        turno: 1,
        historicoAcoes: [],
        acaoExtra: { status: 'pendente', turno: 1, custoPago: 150, limiteCusto: 150, usosRestantes: 1 },
      },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    const botaoAcaoExtra = within(modal).getByRole('button', { name: /executar ação: ação extra/i });
    expect(botaoAcaoExtra).toBeDisabled();
  });

  it('cancela a seleção da ação extra e devolve os PP pagos', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariostotais: { prontidao: 315 },
      estadoCombate: {
        ppAtual: 124,
        turno: 1,
        historicoAcoes: [
          { id: 'acao-extra-1', nome: 'Ação Extra', custo: '-150 PP', turno: 'Turno 1', restante: 124 },
        ],
        acaoExtra: { status: 'pendente', turno: 1, custoPago: 150, limiteCusto: 150, usosRestantes: 1 },
      },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    fireEvent.click(within(modal).getByRole('button', { name: /cancelar seleção/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const payload = onSave.mock.calls[0][0];
    expect(payload.estadoCombate.ppAtual).toBe(274);
    expect(payload.estadoCombate.acaoExtra).toBeNull();
    expect(within(modal).queryByText(/ação extra ativa/i)).not.toBeInTheDocument();
  });

  it('mantém ações com custo zero fora do benefício da ação extra e preserva o texto original do botão', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariostotais: { prontidao: 20 },
      estadoCombate: {
        ppAtual: 20,
        turno: 1,
        historicoAcoes: [],
        acaoExtra: { status: 'pendente', turno: 1, custoPago: 12, limiteCusto: 12, usosRestantes: 1 },
      },
      secundariosBase: { ...personagem.secundariosBase, prontidao: 20 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    const botaoRecuperar = within(modal).getByRole('button', { name: /executar ação: recuperar-se/i });
    const cardRecuperar = botaoRecuperar.closest('.MuiStack-root')?.parentElement;

    expect(botaoRecuperar).toHaveTextContent('Recuperar PP');
    expect(within(cardRecuperar).queryByText(/grátis/i)).not.toBeInTheDocument();
    expect(within(cardRecuperar).queryByText(/custo com ação extra: 0 pp/i)).not.toBeInTheDocument();
  });

  it('seleciona o descanso curto, mostra a prévia de recuperação e persiste Saúde, Energia, Fadiga e PP', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
      status: {
        hp: { atual: 30, maximo: 100 },
        energia: { atual: 20, maximo: 100 },
        fadiga: { atual: 70, maximo: 100 },
      },
      statusMaximos: {
        hp: 100,
        energia: 100,
        fadiga: 100,
      },
      estadoCombate: {
        ppAtual: 65,
        turno: 3,
        historicoAcoes: [],
        recuperacaoUtilizada: false,
        descansando: false,
      },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    fireEvent.click(within(modal).getByRole('tab', { name: /recuperação/i }));
    fireEvent.click(within(modal).getByRole('button', { name: /executar ação: descansar/i }));

    const escolhaDialog = await screen.findByRole('dialog', { name: /escolher descanso/i });
    expect(escolhaDialog).toHaveTextContent(/descanso curto/i);
    expect(escolhaDialog).toHaveTextContent(/descanso longo/i);

    fireEvent.click(within(escolhaDialog).getByRole('button', { name: /descanso curto/i }));
    expect(escolhaDialog).toHaveTextContent(/saúde:\s*30\s*→\s*70/i);
    expect(escolhaDialog).toHaveTextContent(/energia:\s*20\s*→\s*60/i);
    expect(escolhaDialog).toHaveTextContent(/fadiga:\s*70\s*→\s*100/i);

    fireEvent.click(within(escolhaDialog).getByRole('button', { name: /confirmar descanso/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const payload = onSave.mock.calls[0][0];
    expect(payload.estadoCombate.ppAtual).toBe(315);
    expect(payload.estadoCombate.descansando).toBe(true);
    expect(payload.estadoCombate.historicoAcoes[0].nome).toBe('Descansar');
    expect(payload.status.hp.atual).toBe(70);
    expect(payload.status.energia.atual).toBe(60);
    expect(payload.status.fadiga.atual).toBe(100);
    expect(payload.statusMaximos.hp).toBe(100);
  });

  it('seleciona o descanso longo e restaura a Fadiga até o máximo sem exceder o limite', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComProntidao = {
      ...personagem,
      secundariosBase: { ...personagem.secundariosBase, prontidao: 315 },
      status: {
        hp: { atual: 30, maximo: 100 },
        energia: { atual: 20, maximo: 100 },
        fadiga: { atual: 30, maximo: 100 },
      },
      statusMaximos: {
        hp: 100,
        energia: 100,
        fadiga: 100,
      },
      estadoCombate: {
        ppAtual: 65,
        turno: 3,
        historicoAcoes: [],
        recuperacaoUtilizada: false,
        descansando: false,
      },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComProntidao} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /prontidão/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /central de ações/i }));

    const modal = await screen.findByRole('dialog', { name: /central de ações/i });
    fireEvent.click(within(modal).getByRole('tab', { name: /recuperação/i }));
    fireEvent.click(within(modal).getByRole('button', { name: /executar ação: descansar/i }));

    const escolhaDialog = await screen.findByRole('dialog', { name: /escolher descanso/i });
    fireEvent.click(within(escolhaDialog).getByRole('button', { name: /descanso longo/i }));

    expect(escolhaDialog).toHaveTextContent(/fadiga:\s*30\s*→\s*100/i);

    fireEvent.click(within(escolhaDialog).getByRole('button', { name: /confirmar descanso/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const payload = onSave.mock.calls[0][0];
    expect(payload.status.fadiga.atual).toBe(100);
  });


  it('solicita confirmação antes de excluir uma combinação salva', async () => {
    vi.mocked(getCombosAtaque)
      .mockResolvedValueOnce([
        {
          id: 'combo-1',
          nome: 'Explosão',
          tipoDano: 'Contundente',
          potencialBase: 18,
          updatedAt: { seconds: 1700000000 },
        },
      ])
      .mockResolvedValueOnce([]);
    vi.mocked(removeComboAtaque).mockResolvedValue(undefined);

    const onSave = vi.fn().mockResolvedValue();
    renderComProvider(<AtributosTab personagem={personagem} onSave={onSave} onExcluir={vi.fn()} />);

    fireEvent.contextMenu(screen.getByRole('button', { name: /ataque/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /calculadora de ataque/i }));

    const dialog = await screen.findByRole('dialog', { name: /calculadora de ataque/i });
    fireEvent.click(within(dialog).getByRole('button', { name: /excluir/i }));

    expect(await screen.findByRole('dialog', { name: /confirmar exclusão/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => expect(removeComboAtaque).toHaveBeenCalledWith('p1', 'combo-1'));
    await waitFor(() => expect(screen.queryByText('Explosão')).not.toBeInTheDocument());
  });

  it('desvincula a combinação selecionada ao clicar em nova combinação e salva como criação nova', async () => {
    vi.mocked(getCombosAtaque)
      .mockResolvedValueOnce([
        {
          id: 'combo-1',
          nome: 'Soco do Jose',
          tipoDano: 'Contundente',
          artId: '',
          itemInventarioId: '',
          bonusExtra: 4,
          potencializacao: 15,
          costResourceType: 'energia',
          updatedAt: { seconds: 1700000000 },
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'combo-1',
          nome: 'Soco do Jose',
          tipoDano: 'Contundente',
          artId: '',
          itemInventarioId: '',
          bonusExtra: 4,
          potencializacao: 15,
          costResourceType: 'energia',
          updatedAt: { seconds: 1700000000 },
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'combo-1',
          nome: 'Soco do Jose',
          tipoDano: 'Contundente',
          artId: '',
          itemInventarioId: '',
          bonusExtra: 4,
          potencializacao: 15,
          costResourceType: 'energia',
          updatedAt: { seconds: 1700000000 },
        },
      ]);

    vi.mocked(addComboAtaque).mockResolvedValue('combo-2');

    renderComProvider(
      <AtributosTab personagem={personagem} onSave={vi.fn().mockResolvedValue()} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /ataque/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /calculadora de ataque/i }));

    const dialog = await screen.findByRole('dialog', { name: /calculadora de ataque/i });
    fireEvent.click(within(dialog).getByRole('button', { name: /^selecionar$/i }));

    const nomeField = within(dialog).getByLabelText(/nome da combinação/i);
    expect(nomeField).toHaveValue('Soco do Jose');

    fireEvent.change(nomeField, { target: { value: 'Soco do Jose editado' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /nova combinação/i }));

    const confirmDialog = await screen.findByRole('dialog', { name: /nova combinação/i });
    expect(confirmDialog).toBeInTheDocument();
    fireEvent.click(within(confirmDialog).getByRole('button', { name: /^criar nova$/i }));

    const modalAtaque = await screen.findByRole('dialog', { name: /calculadora de ataque/i });
    await waitFor(() => expect(within(modalAtaque).getByLabelText(/nome da combinação/i)).toHaveValue(''));
    expect(within(modalAtaque).getAllByText(/nova combinação/i).length).toBeGreaterThan(0);
    expect(within(modalAtaque).queryByText(/editando:/i)).not.toBeInTheDocument();

    fireEvent.change(within(modalAtaque).getByLabelText(/nome da combinação/i), { target: { value: 'Golpe novo' } });
    fireEvent.click(within(modalAtaque).getByRole('button', { name: /^salvar$/i }));

    await waitFor(() => expect(addComboAtaque).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({
        nome: 'Golpe novo',
        costResourceType: 'energia',
      }),
    ));
    expect(updateComboAtaque).not.toHaveBeenCalled();
  });


  it('salva combinação com Fadiga e persiste o recurso selecionado', async () => {
    vi.mocked(getCombosAtaque).mockResolvedValue([]);
    vi.mocked(addComboAtaque).mockResolvedValue('combo-fadiga');

    const personagemComRecursos = {
      ...personagem,
      status: {
        energia: { base: 0, extra: 0, bonus: 0, atual: 56, maximo: 100 },
        fadiga: { base: 0, extra: 0, bonus: 0, atual: 150, maximo: 150 },
      },
      statusMaximos: {
        energia: 100,
        fadiga: 150,
      },
    };

    const onSave = vi.fn().mockResolvedValue();
    renderComProvider(<AtributosTab personagem={personagemComRecursos} onSave={onSave} onExcluir={vi.fn()} />);

    fireEvent.contextMenu(screen.getByRole('button', { name: /ataque/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /calculadora de ataque/i }));

    const dialog = await screen.findByRole('dialog', { name: /calculadora de ataque/i });
    fireEvent.change(within(dialog).getByLabelText(/nome da combinação/i), { target: { value: 'Corte Carmesim' } });
    fireEvent.change(within(dialog).getByRole('slider', { name: /potencialização de energia/i }), { target: { value: 19 } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Fadiga Atual\/Máxima.*Fadiga suficiente/i }));
    fireEvent.click(within(dialog).getByRole('button', { name: /^salvar$/i }));

    await waitFor(() => expect(addComboAtaque).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({
        nome: 'Corte Carmesim',
        custoFadiga: 29,
        costResourceType: 'fadiga',
        potencializacao: 19,
      }),
    ));
  });

  it('cria uma nova combinação quando o nome igual existe em outro registro com ID diferente', async () => {
    vi.mocked(getCombosAtaque).mockResolvedValue([
      {
        id: 'combo-1',
        nome: 'SOCO DO JOSE',
        tipoDano: 'Contundente',
        potencializacao: 10,
        custoFadiga: 0,
        costResourceType: 'energia',
        updatedAt: { seconds: 1700000000 },
      },
    ]);
    vi.mocked(addComboAtaque).mockResolvedValue('combo-2');

    const personagemComRecursos = {
      ...personagem,
      status: {
        energia: { base: 0, extra: 0, bonus: 0, atual: 56, maximo: 100 },
        fadiga: { base: 0, extra: 0, bonus: 0, atual: 150, maximo: 150 },
      },
      statusMaximos: {
        energia: 100,
        fadiga: 150,
      },
    };

    const onSave = vi.fn().mockResolvedValue();
    renderComProvider(<AtributosTab personagem={personagemComRecursos} onSave={onSave} onExcluir={vi.fn()} />);

    fireEvent.contextMenu(screen.getByRole('button', { name: /ataque/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /calculadora de ataque/i }));

    const dialog = await screen.findByRole('dialog', { name: /calculadora de ataque/i });
    fireEvent.change(within(dialog).getByLabelText(/nome da combinação/i), { target: { value: ' soco do jose ' } });
    fireEvent.change(within(dialog).getByRole('slider', { name: /potencialização de energia/i }), { target: { value: 19 } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Fadiga Atual\/Máxima.*Fadiga suficiente/i }));
    fireEvent.click(within(dialog).getByRole('button', { name: /^salvar$/i }));

    await waitFor(() => expect(addComboAtaque).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({
        nome: 'soco do jose',
        costResourceType: 'fadiga',
        custoFadiga: 29,
        potencializacao: 19,
      }),
    ));
    expect(updateComboAtaque).not.toHaveBeenCalled();
  });

  it('calcula o custo da potencialização pelo recurso selecionado', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComRecursos = {
      ...personagem,
      secundariosBase: { ...personagem.secundariosBase, ataque: 30 },
      status: {
        energia: { base: 0, extra: 0, bonus: 0, atual: 56, maximo: 100 },
        fadiga: { base: 0, extra: 0, bonus: 0, atual: 150, maximo: 150 },
      },
      statusMaximos: {
        energia: 100,
        fadiga: 150,
      },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComRecursos} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /ataque/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /calculadora de ataque/i }));

    const dialog = await screen.findByRole('dialog', { name: /calculadora de ataque/i });
    const slider = within(dialog).getByRole('slider', { name: /potencialização de energia/i });

    fireEvent.change(slider, { target: { value: 19 } });
    fireEvent.click(within(dialog).getByRole('button', { name: /fadiga/i }));

    await waitFor(() => expect(dialog.textContent).toMatch(/Fadiga/i));
    expect(dialog.textContent).toMatch(/29 pts/i);
    expect(dialog.textContent).not.toMatch(/Energia.*19 pts/i);
  });

  it('move o custo da arte para o recurso clicado sem deixar o custo preso na energia', async () => {
    vi.mocked(getArts).mockResolvedValue([
      { id: 'a1', nome: 'Lâmina de Fogo', custo: '15' },
    ]);

    const onSave = vi.fn().mockResolvedValue();
    renderComProvider(
      <AtributosTab personagem={personagem} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /ataque/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /calculadora de ataque/i }));

    const dialog = await screen.findByRole('dialog', { name: /calculadora de ataque/i });
    fireEvent.mouseDown(within(dialog).getByRole('combobox', { name: /arte\/habilidade/i }));
    fireEvent.click(screen.getByRole('option', { name: /lâmina de fogo/i }));
    const energiaCard = within(dialog).getByRole('button', { name: /energia/i });
    const saudeCard = within(dialog).getByRole('button', { name: /saúde/i });
    const fadigaCard = within(dialog).getByRole('button', { name: /fadiga/i });

    expect(energiaCard).toHaveTextContent('POT. 0 + ARTE 15 = 15');
    fireEvent.click(saudeCard);
    expect(saudeCard).toHaveTextContent('POT. 0 + ARTE 15 = 15');
    expect(energiaCard).toHaveTextContent('POT. 0 + ARTE 0 = 0');
    fireEvent.click(fadigaCard);
    expect(fadigaCard).toHaveTextContent('POT. 0 + ARTE 15 = 15');
    expect(saudeCard).toHaveTextContent('POT. 0 + ARTE 0 = 0');
    expect(energiaCard).toHaveTextContent('POT. 0 + ARTE 0 = 0');
    fireEvent.click(energiaCard);
    expect(energiaCard).toHaveTextContent('POT. 0 + ARTE 15 = 15');
    expect(fadigaCard).toHaveTextContent('POT. 0 + ARTE 0 = 0');
  });

  it('move o custo da arte para o recurso clicado na defesa sem deixar o custo preso no card anterior', async () => {
    vi.mocked(getArts).mockResolvedValue([
      { id: 'a1', nome: 'Escudo Solar', custo: '15' },
    ]);

    const onSave = vi.fn().mockResolvedValue();
    renderComProvider(
      <AtributosTab personagem={personagem} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /defesa/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /calculadora de defesa/i }));

    const dialog = await screen.findByRole('dialog', { name: /calculadora de defesa/i });
    fireEvent.mouseDown(within(dialog).getByRole('combobox', { name: /arte\/habilidade/i }));
    fireEvent.click(screen.getByRole('option', { name: /escudo solar/i }));
    const energiaCard = within(dialog).getByRole('button', { name: /energia/i });
    const saudeCard = within(dialog).getByRole('button', { name: /saúde/i });
    const fadigaCard = within(dialog).getByRole('button', { name: /fadiga/i });

    expect(energiaCard).toHaveTextContent('POT. 0 + ARTE 15 = 15');
    fireEvent.click(saudeCard);
    expect(saudeCard).toHaveTextContent('POT. 0 + ARTE 15 = 15');
    expect(energiaCard).toHaveTextContent('POT. 0 + ARTE 0 = 0');
    fireEvent.click(fadigaCard);
    expect(fadigaCard).toHaveTextContent('POT. 0 + ARTE 15 = 15');
    expect(saudeCard).toHaveTextContent('POT. 0 + ARTE 0 = 0');
    expect(energiaCard).toHaveTextContent('POT. 0 + ARTE 0 = 0');
    fireEvent.click(energiaCard);
    expect(energiaCard).toHaveTextContent('POT. 0 + ARTE 15 = 15');
    expect(fadigaCard).toHaveTextContent('POT. 0 + ARTE 0 = 0');
  });

  it('soma o custo da arte ao custo de potencialização ao consumir a combinação', async () => {
    vi.mocked(getArts).mockResolvedValue([
      { id: 'a1', nome: 'Lâmina de Fogo', custo: '2 PE' },
    ]);
    vi.mocked(getCombosAtaque).mockResolvedValueOnce([
      {
        id: 'combo-art-1',
        nome: 'Golpe com Arte',
        tipoDano: 'Contundente',
        artId: 'a1',
        potencializacao: 20,
        costResourceType: 'energia',
        updatedAt: { seconds: 1700000000 },
      },
    ]);
    vi.mocked(consumirRecursosPersonagem).mockResolvedValue({
      energia: { atual: 78, maximo: 100 },
      fadiga: { atual: 30, maximo: 40 },
      gastoEnergia: 22,
      gastoFadiga: 0,
    });

    const onSave = vi.fn().mockResolvedValue();
    const personagemComEnergia = {
      ...personagem,
      id: 'p1',
      status: {
        energia: { atual: 100, base: 0, extra: 0, bonus: 0, maximo: 100 },
        fadiga: { atual: 30, base: 0, extra: 0, bonus: 0, maximo: 40 },
      },
      statusMaximos: { energia: 100, fadiga: 40 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComEnergia} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /ataque/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /calculadora de ataque/i }));

    const dialog = await screen.findByRole('dialog', { name: /calculadora de ataque/i });
    fireEvent.click(within(dialog).getByRole('button', { name: /^usar$/i }));

    const confirmDialog = await screen.findByRole('dialog', { name: /utilizar combinação/i });
    expect(confirmDialog).toHaveTextContent(/Custo\s*22/i);
    expect(confirmDialog).toHaveTextContent(/Energia após utilização:\s*78\s*\/\s*100/i);

    fireEvent.click(within(confirmDialog).getByRole('button', { name: /confirmar uso/i }));

    await waitFor(() => expect(consumirRecursosPersonagem).toHaveBeenCalledWith('p1', { energia: 22, fadiga: 0 }));
  });

  it('mostra somente Roll, Dano Fixo e Rolling na prévia dos dados', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComAtaque = {
      ...personagem,
      secundariosBase: { ...personagem.secundariosBase, ataque: 50 },
      status: { energia: { base: 0, extra: 0, bonus: 0, atual: 80 } },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComAtaque} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /ataque/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /calculadora de ataque/i }));

    const dialog = await screen.findByRole('dialog', { name: /calculadora de ataque/i });
    expect(within(dialog).getByText('Roll')).toBeInTheDocument();
    expect(within(dialog).getByText('Dano Fixo')).toBeInTheDocument();
    expect(within(dialog).getByText('Rolling')).toBeInTheDocument();
    expect(dialog.textContent).not.toMatch(/Resultado da rolagem|Potencial máximo/i);
    expect(dialog.textContent).toMatch(/\d+d8|\d+d6|\d+d20|\d+d4/i);
  });

  it('mostra o aumento de potencial e o custo de energia na prévia dos dados', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComEnergia = {
      ...personagem,
      secundariosBase: { ...personagem.secundariosBase, ataque: 30 },
      status: { energia: { base: 0, extra: 0, bonus: 0, atual: 44 } },
      statusMaximos: { energia: 44 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComEnergia} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /ataque/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /calculadora de ataque/i }));

    const dialog = await screen.findByRole('dialog', { name: /calculadora de ataque/i });
    const slider = within(dialog).getByRole('slider', { name: /potencialização de energia/i });
    for (let index = 0; index < 30; index += 1) {
      fireEvent.keyDown(slider, { key: 'ArrowRight', code: 'ArrowRight' });
    }

    expect(within(dialog).getAllByText('Aumento de Potencial').length).toBeGreaterThan(0);
    expect(within(dialog).getAllByText('+9 (30%)').length).toBeGreaterThan(0);
    expect(dialog.textContent).toMatch(/Atual\/Máxima\s*44\s*\/\s*44/i);
    expect(dialog.textContent).toMatch(/Custo\s*14\s*pts/i);
    expect(dialog.textContent).toMatch(/Após uso\s*30\s*\/\s*44/i);
    expect(within(dialog).getAllByText('Potencial-base').length).toBeGreaterThan(0);
  });

  it('mostra painel de energia real com saldo e alerta de insuficiência', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComEnergia = {
      ...personagem,
      secundariosBase: { ...personagem.secundariosBase, ataque: 30 },
      status: { energia: { base: 0, extra: 0, bonus: 0, atual: 32 } },
      statusMaximos: { energia: 44 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComEnergia} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /ataque/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /calculadora de ataque/i }));

    const dialog = await screen.findByRole('dialog', { name: /calculadora de ataque/i });
    const slider = within(dialog).getByRole('slider', { name: /potencialização de energia/i });
    for (let index = 0; index < 20; index += 1) {
      fireEvent.keyDown(slider, { key: 'ArrowRight', code: 'ArrowRight' });
    }

    expect(dialog.textContent).toMatch(/Atual\/Máxima\s*32\s*\/\s*44/i);
    expect(dialog.textContent).toMatch(/Custo\s*9\s*pts/i);
    expect(dialog.textContent).toMatch(/Após uso\s*23\s*\/\s*44/i);
    expect(within(dialog).getByText(/Energia suficiente/i)).toBeInTheDocument();

    fireEvent.keyDown(slider, { key: 'Home', code: 'Home' });
    for (let index = 0; index < 30; index += 1) {
      fireEvent.keyDown(slider, { key: 'ArrowRight', code: 'ArrowRight' });
    }

    const personagemInsuficiente = {
      ...personagem,
      status: { energia: { base: 0, extra: 0, bonus: 0, atual: 10 } },
      statusMaximos: { energia: 44 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemInsuficiente} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /ataque/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /calculadora de ataque/i }));

    const dialogInsuficiente = await screen.findByRole('dialog', { name: /calculadora de ataque/i });
    const sliderInsuficiente = within(dialogInsuficiente).getByRole('slider', { name: /potencialização de energia/i });
    for (let index = 0; index < 30; index += 1) {
      fireEvent.keyDown(sliderInsuficiente, { key: 'ArrowRight', code: 'ArrowRight' });
    }

    expect(within(dialogInsuficiente).getByText(/Energia insuficiente/i)).toBeInTheDocument();
    expect(within(dialogInsuficiente).getByText(/faltam 4 pontos/i)).toBeInTheDocument();
  });

  it('mantém o cálculo automático sem o botão Calcular/Rolar e sem consumir energia', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComEnergia = {
      ...personagem,
      id: 'p1',
      secundariosBase: { ...personagem.secundariosBase, ataque: 30 },
      status: { energia: { base: 0, extra: 0, bonus: 0, atual: 44 } },
      statusMaximos: { energia: 44 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComEnergia} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /ataque/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /calculadora de ataque/i }));

    const dialog = await screen.findByRole('dialog', { name: /calculadora de ataque/i });
    expect(within(dialog).queryByRole('button', { name: /calcular\/rolar/i })).not.toBeInTheDocument();

    const slider = within(dialog).getByRole('slider', { name: /potencialização de energia/i });
    for (let index = 0; index < 30; index += 1) {
      fireEvent.keyDown(slider, { key: 'ArrowRight', code: 'ArrowRight' });
    }

    await waitFor(() => expect(dialog.textContent).toMatch(/Custo\s*14\s*pts/i));
    expect(within(dialog).getAllByText('Potencial-base').length).toBeGreaterThan(0);
    expect(within(dialog).queryByText(/Rolagem concluída:/i)).not.toBeInTheDocument();
  });

  it('usa a combinação salva com confirmação e desconta energia e fadiga do personagem', async () => {
    vi.mocked(getCombosAtaque).mockResolvedValueOnce([
      {
        id: 'combo-1',
        nome: 'Soco do Jose',
        tipoDano: 'Contundente',
        perfilDano: '4d6+4',
        potencialFinal: 26,
        potencializacao: 22,
        custoFadiga: 5,
        updatedAt: { seconds: 1700000000 },
      },
    ]);
    vi.mocked(consumirRecursosPersonagem).mockResolvedValue({
      energia: { atual: 78, maximo: 100 },
      fadiga: { atual: 25, maximo: 40 },
      gastoEnergia: 22,
      gastoFadiga: 5,
    });

    const onSave = vi.fn().mockResolvedValue();
    const personagemComEnergia = {
      ...personagem,
      id: 'p1',
      status: {
        energia: { atual: 100, base: 0, extra: 0, bonus: 0, maximo: 100 },
        fadiga: { atual: 30, base: 0, extra: 0, bonus: 0, maximo: 40 },
      },
      statusMaximos: { energia: 100, fadiga: 40 },
    };

    renderComProvider(
      <AtributosTab personagem={personagemComEnergia} onSave={onSave} onExcluir={vi.fn()} />,
    );

    fireEvent.contextMenu(screen.getByRole('button', { name: /ataque/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /calculadora de ataque/i }));

    const dialog = await screen.findByRole('dialog', { name: /calculadora de ataque/i });
    fireEvent.click(within(dialog).getByRole('button', { name: /^usar$/i }));

    const confirmDialog = await screen.findByRole('dialog', { name: /utilizar combinação/i });
    expect(within(confirmDialog).getByText(/Soco do Jose/i)).toBeInTheDocument();
    expect(confirmDialog).toHaveTextContent(/Energia após utilização:/i);
    expect(confirmDialog).toHaveTextContent(/Fadiga após utilização:/i);
    expect(confirmDialog).toHaveTextContent(/100\s*\/\s*100/i);
    expect(confirmDialog).toHaveTextContent(/21\s*\/\s*40/i);

    fireEvent.click(within(confirmDialog).getByRole('button', { name: /confirmar uso/i }));

    await waitFor(() => expect(consumirRecursosPersonagem).toHaveBeenCalledWith('p1', { energia: 0, fadiga: 9 }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      status: expect.objectContaining({
        energia: expect.objectContaining({ atual: 100 }),
        fadiga: expect.objectContaining({ atual: 25 }),
      }),
    })));
  });

  it('mostra uma mensagem de erro e reabilita o botão Salvar quando onSave falha', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('offline'));
    renderComProvider(<AtributosTab personagem={personagem} onSave={onSave} onExcluir={vi.fn()} />);

    const botaoSalvar = screen.getByRole('button', { name: /^salvar$/i });
    fireEvent.click(botaoSalvar);

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    await screen.findByText(/não foi possível salvar/i);
    // SavingContext.executar impõe uma duração mínima de overlay (2s) mesmo em erro.
    await waitFor(() => expect(botaoSalvar).not.toBeDisabled(), { timeout: 3000 });
  });
});
