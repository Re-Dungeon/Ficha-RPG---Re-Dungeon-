import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { getPersonagem } from 'service/storage';
import { useAuth } from 'context/AuthContext';
import useIsMobile from 'hooks/useIsMobile';
import Layout from 'components/Layout/Layout';
import Ficha from './Ficha';
import { ChatModalConteudo } from './sidebar/ChatModal';

vi.mock('context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('service/storage', () => ({
  getPersonagem: vi.fn(),
  removePersonagem: vi.fn(),
  updatePersonagem: vi.fn(),
  getRmCampanha: vi.fn(),
}));
vi.mock('hooks/useIsMobile', () => ({ default: vi.fn() }));
vi.mock('hooks/useChatCampanha', () => ({
  default: vi.fn(() => ({
    mensagens: [],
    carregando: false,
    erro: null,
    limparErro: vi.fn(),
    enviarTexto: vi.fn(),
    enviarImagem: vi.fn(),
    rolar: vi.fn(),
    apagar: vi.fn(),
    macros: {
      lista: [],
      carregando: false,
      podeGerenciar: false,
      rodando: null,
      salvar: vi.fn(),
      apagar: vi.fn(),
      mover: vi.fn(),
      testar: vi.fn(),
      executar: vi.fn(),
    },
    audio: null,
  })),
}));
vi.mock('hooks/useOpcoesDeRolagem', () => ({
  default: vi.fn(() => ({ grupos: [] })),
}));

// Abas e modais viram stubs: o teste é só do shell (sidebar/gaveta + abas).
const { stubAba, stubModal } = vi.hoisted(() => ({
  stubAba: nome => ({ default: () => <div>Aba {nome}</div> }),
  stubModal: nome => ({ default: ({ open }) => (open ? <div>Modal {nome}</div> : null) }),
}));
vi.mock('./tabs/AtributosTab', () => stubAba('atributos'));
vi.mock('./tabs/AptidoesTab', () => stubAba('aptidoes'));
vi.mock('./tabs/ArtsTab', () => stubAba('arts'));
vi.mock('./tabs/InventarioTab', () => stubAba('inventario'));
vi.mock('./tabs/TreinamentoTab', () => stubAba('treinamento'));
vi.mock('./tabs/VeiasAstraisTab', () => stubAba('veias'));
vi.mock('./tabs/CompanheiroTab', () => stubAba('companheiro'));
vi.mock('./sidebar/InfoModal', () => stubModal('info'));
vi.mock('./sidebar/AptidaoConsultaModal', () => stubModal('aptidao'));
vi.mock('./sidebar/RacaModal', () => stubModal('raca'));
vi.mock('./sidebar/ClasseModal', () => stubModal('classe'));
vi.mock('./sidebar/ReputacaoModal', () => stubModal('reputacao'));
vi.mock('./sidebar/NivelModal', () => stubModal('nivel'));
vi.mock('./sidebar/CultivoModal', () => stubModal('cultivo'));
vi.mock('./sidebar/SorteModal', () => stubModal('sorte'));
vi.mock('./sidebar/LojaModal', () => stubModal('loja'));
vi.mock('./sidebar/CondicoesModal', () => stubModal('condicoes'));
vi.mock('./sidebar/CodexModal', () => stubModal('codex'));
vi.mock('./sidebar/ChatModal', async () => {
  const actual = await vi.importActual('./sidebar/ChatModal');
  return {
    ...actual,
    default: ({ open }) => (open ? <div>Modal chat</div> : null),
  };
});
vi.mock('./notes/NotesModal', () => stubModal('notas'));

// Com o Layout de verdade: as abas da ficha (e o ☰ da gaveta, no celular)
// ficam no cabeçalho, via headerExtra.
const renderFicha = () =>
  render(
    <MemoryRouter initialEntries={['/personagens/p1']}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/personagens/:id" element={<Ficha />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('Ficha — navegação no celular x desktop', () => {
  beforeEach(() => {
    getPersonagem.mockResolvedValue({ id: 'p1', uid: 'u1', nome: 'Aria' });
    useAuth.mockReturnValue({ currentUser: { uid: 'u1', email: 'a@b.c' }, logout: vi.fn() });
  });

  it('desktop: sidebar fixa, sem botão de gaveta, abas com rótulo completo', async () => {
    useIsMobile.mockReturnValue(false);
    renderFicha();
    await screen.findByText('Aba atributos');

    expect(screen.queryByRole('button', { name: 'Abrir menu da ficha' })).not.toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'Veias Astrais' })).toHaveTextContent('Veias Astrais');
    fireEvent.click(screen.getByRole('button', { name: 'Classe' }));
    expect(screen.getByText('Modal classe')).toBeInTheDocument();
  });

  it('celular: sidebar só na gaveta; escolher um item fecha a gaveta e abre o modal', async () => {
    useIsMobile.mockReturnValue(true);
    renderFicha();
    await screen.findByText('Aba atributos');

    expect(screen.queryByRole('button', { name: 'Classe' })).not.toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'Veias Astrais' })).toHaveTextContent(/^Veias$/);

    fireEvent.click(await screen.findByRole('button', { name: 'Abrir menu da ficha' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Classe' }));

    expect(screen.getByText('Modal classe')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Classe' })).not.toBeInTheDocument());
  });

  it('chat em painel mobile renderiza sem lançar erro de Box ausente', async () => {
    useIsMobile.mockReturnValue(true);
    const campanha = { id: 'campanha-1', nome: 'Campanha Teste', mestreId: 'mestre-1' };
    const { getRmCampanha } = await import('service/storage');
    getRmCampanha.mockResolvedValue(campanha);

    render(
      <MemoryRouter initialEntries={['/personagens/p1']}>
        <ChatModalConteudo
          personagem={{ id: 'p1', uid: 'u1', nome: 'Aria', campanhas: ['campanha-1'] }}
          modo="painel"
          onClose={vi.fn()}
          campanhaIdInicial="campanha-1"
        />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Campanha')).toBeInTheDocument();
    expect(screen.getByText('Campanha Teste')).toBeInTheDocument();
  });
});
