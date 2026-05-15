import { createContext, useContext, useState, type ReactNode } from 'react';
import { authStorage } from '@/lib/auth';
import type { UsuarioMin } from '@/types';

interface AuthContextValue {
  usuario: UsuarioMin | null;
  isAuthenticated: boolean;
  login: (token: string, usuario: UsuarioMin) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioMin | null>(() => authStorage.getUsuario());

  function login(token: string, novoUsuario: UsuarioMin) {
    authStorage.setToken(token);
    authStorage.setUsuario(novoUsuario);
    setUsuario(novoUsuario);
  }

  function logout() {
    authStorage.clear();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isAuthenticated: !!usuario,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
