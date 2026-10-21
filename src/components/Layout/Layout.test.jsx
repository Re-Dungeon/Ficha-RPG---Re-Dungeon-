import React, { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation, useParams } from 'react-router-dom';

import { useAuth } from 'context/AuthContext';
import { useSelecao } from 'context/selecaoContext';
import Login from 'pages/Login/Login';
import Layout from './Layout';

vi.mock('context/AuthContext', () => ({ useAuth: vi.fn() }));

const PERSONAGENS = {
  wesley: { id: 'wesley', nome: 'Wesley Chase', campanhas: ['torre'] },
  solo: { id: 'solo', nome: 'Solitário', campanhas: [] },
};

// Páginas falsas que registram a seleção como as reais (Ficha/CampanhaChat/listas).
const FichaFake = () => {
  const { id } = useParams();
  const { selecionarPersonagem } = useSelecao();
  useEffect(() => selecionarPersonagem(PERSONAGENS[id]), [id, selecionarPersonagem]);
  return <div>Ficha de {PERSONAGENS[id].nome}</div>;
};

const ChatFake = () => {
  const { id } = useParams();
  const { selecionarCampanha } = useSelecao();
  const { state } = useLocation();
  useEffect(() => selecionarCampanha(id), [id, selecionarCampanha]);
  return (
    <div>
      Chat {id} como {state?.personagemId ?? '—'}
    </div>
  );
};

const ListaFichasFake = () => {
  const { limparPersonagem } = useSelecao();
  useEffect(() => limparPersonagem(), [limparPersonagem]);
  return <div>Lista de fichas</div>;
};

const ListaCampanhasFake = () => {
  const { limparCampanha } = useSelecao();
  useEffect(() => limparCampanha(), [limparCampanha]);
  return <div>Lista de campanhas</div>;
};

const renderApp = rotaInicial =>
  render(
    <MemoryRouter initialEntries={[rotaInicial]}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/personagens" element={<ListaFichasFake />} />
          <Route path="/personagens/:id" element={<FichaFake />} />
          <Route path="/campanhas" element={<ListaCampanhasFake />} />
          <Route path="/campanhas/:id/chat" element={<ChatFake />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

const clicarNav = nome => fireEvent.click(screen.getByRole('link', { name: nome }));

describe('Layout — alternar entre Fichas e Campanhas', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ currentUser: { uid: 'u1', email: 'a@b.c' }, logout: vi.fn() });
  });

  it('da ficha abre o chat da campanha do personagem e volta para a mesma ficha', async () => {
    renderApp('/personagens/wesley');
    await screen.findByText('Ficha de Wesley Chase');

    clicarNav('Campanhas');
    expect(await screen.findByText('Chat torre como wesley')).toBeInTheDocument();

    clicarNav('Fichas');
    expect(await screen.findByText('Ficha de Wesley Chase')).toBeInTheDocument();

    clicarNav('Campanhas');
    expect(await screen.findByText('Chat torre como wesley')).toBeInTheDocument();
  });

  it('ficha sem campanha: Campanhas abre a lista e Fichas ainda volta para a ficha', async () => {
    renderApp('/personagens/solo');
    await screen.findByText('Ficha de Solitário');

    clicarNav('Campanhas');
    expect(await screen.findByText('Lista de campanhas')).toBeInTheDocument();

    clicarNav('Fichas');
    expect(await screen.findByText('Ficha de Solitário')).toBeInTheDocument();
  });

  it('celular: o menu da conta mostra o e-mail e sai (só visível abaixo de 600px)', async () => {
    const logout = vi.fn();
    useAuth.mockReturnValue({ currentUser: { uid: 'u1', email: 'a@b.c' }, logout });
    renderApp('/personagens');
    await screen.findByText('Lista de fichas');

    // jsdom não aplica a media query: o botão existe, mas oculto no desktop.
    fireEvent.click(screen.getByLabelText('Conta'));
    expect(await screen.findByRole('menuitem', { name: 'a@b.c' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Sair' }));
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('exibe a identidade Re e os dados da conta autenticada no topo', async () => {
    useAuth.mockReturnValue({
      currentUser: { uid: 'u1', email: 'aline.borges@re.com', displayName: 'Aline Borges', photoURL: 'https://re.test/avatar.png' },
      logout: vi.fn(),
    });

    renderApp('/personagens');
    await screen.findByText('Lista de fichas');

    expect(screen.getByText('Re')).toBeInTheDocument();
    expect(screen.getByText('GERENCIADOR DE PERSONAGENS')).toBeInTheDocument();
    expect(screen.getByText('Aline Borges')).toBeInTheDocument();
    expect(screen.getByText('aline.borges@re.com')).toBeInTheDocument();
  });

  it('não renderiza o header na rota pública de login', () => {
    useAuth.mockReturnValue({ currentUser: null, logout: vi.fn() });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText('GERENCIADOR DE PERSONAGENS')).not.toBeInTheDocument();
    expect(screen.queryByText('Fichas')).not.toBeInTheDocument();
    expect(screen.queryByText('Campanhas')).not.toBeInTheDocument();
    expect(screen.getByText('Entrar no Reino')).toBeInTheDocument();
  });

  it('a partir da lista, os links levam às listas', async () => {
    renderApp('/personagens');
    await screen.findByText('Lista de fichas');

    clicarNav('Campanhas');
    expect(await screen.findByText('Lista de campanhas')).toBeInTheDocument();

    clicarNav('Fichas');
    expect(await screen.findByText('Lista de fichas')).toBeInTheDocument();
  });
});
