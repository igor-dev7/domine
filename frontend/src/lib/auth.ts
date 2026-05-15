import type { UsuarioMin } from '@/types';

const TOKEN_KEY = 'domine_token';
const USER_KEY = 'domine_usuario';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getUsuario(): UsuarioMin | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UsuarioMin) : null;
  },
  setUsuario(usuario: UsuarioMin) {
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
