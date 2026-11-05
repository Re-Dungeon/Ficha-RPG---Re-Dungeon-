import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { onAuthStateChangedMock } = vi.hoisted(() => ({
  onAuthStateChangedMock: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: onAuthStateChangedMock,
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}));

import { AuthProvider, useAuth } from './AuthContext';

vi.mock('service/firebase', () => ({
  auth: {},
}));

const AuthStatus = () => {
  const { currentUser, loading } = useAuth();

  return <div>{loading ? 'loading' : currentUser ? `user:${currentUser.email}` : 'logged-out'}</div>;
};

describe('AuthProvider', () => {
  beforeEach(() => {
    onAuthStateChangedMock.mockReturnValue(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('não agenda um timeout artificial de 5 segundos ao carregar a autenticação', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>,
    );

    expect(setTimeoutSpy).not.toHaveBeenCalledWith(expect.any(Function), 5000);
    setTimeoutSpy.mockRestore();
  });

  it('não entra em loading quando o Firebase já tem a sessão persistida', () => {
    const authMock = { currentUser: { uid: 'u1', email: 'jogador@re.com' } };
    vi.doMock('service/firebase', () => ({ auth: authMock }));

    onAuthStateChangedMock.mockImplementation((_auth, callback) => {
      callback(authMock.currentUser);
      return () => {};
    });

    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>,
    );

    expect(screen.getByText('user:jogador@re.com')).toBeInTheDocument();
  });
});
