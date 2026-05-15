export type PerfilUsuario = 'ADMIN' | 'COMUM';

export interface UsuarioMin {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioMin;
}

export interface ErroResponse {
  timestamp: string;
  status: number;
  erro: string;
  mensagens: string[];
}
