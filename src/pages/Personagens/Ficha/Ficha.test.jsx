import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';

import { getPersonagem } from 'service/storage';
import useIsMobile from 'hooks/useIsMobile';
import Ficha from './Ficha';

vi.mock('service/storage', () => ({
  getPersonagem: vi.fn(),
  removePersonagem: vi.fn(),
  updatePersonagem: vi.fn(),
}));
vi.mock('hooks/useIsMobile', () => ({ default: vi.fn() }));

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
vi.mock('./sidebar/ChatModal', () => stubModal('chat'));
vi.mock('./notes/NotesModal', () => stubModal('notas'));

const ComHeader = () => <Outlet context={{ setHeaderExtra: vi.fn() }} />;

const renderFicha = () =>
  render(
    <MemoryRouter initialEntries={['/personagens/p1']}>
      <Routes>
        <Route element={<ComHeader />}>
          <Route path="/personagens/:id" element={<Ficha />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('Ficha — navegação no celular x desktop', () => {
  beforeEach(() => {
    getPersonagem.mockResolvedValue({ id: 'p1', uid: 'u1', nome: 'Aria' });
  });

  it('desktop: sidebar fixa, sem botão de gaveta, abas com rótulo completo', async () => {
    useIsMobile.mockReturnValue(false);
    renderFicha();
    await screen.findByText('Aba atributos');

    expect(screen.queryByRole('button', { name: 'Abrir menu da ficha' })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Veias Astrais' })).toHaveTextContent('Veias Astrais');
    fireEvent.click(screen.getByRole('button', { name: 'Classe' }));
    expect(screen.getByText('Modal classe')).toBeInTheDocument();
  });

  it('celular: sidebar só na gaveta; escolher um item fecha a gaveta e abre o modal', async () => {
    useIsMobile.mockReturnValue(true);
    renderFicha();
    await screen.findByText('Aba atributos');

    expect(screen.queryByRole('button', { name: 'Classe' })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Veias Astrais' })).toHaveTextContent('Veias');

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu da ficha' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Classe' }));

    expect(screen.getByText('Modal classe')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Classe' })).not.toBeInTheDocument());
  });
});
