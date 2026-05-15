import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { PerfilUsuario, SpringPage, UsuarioResponse } from '@/types';

export interface UsuarioFiltro {
  page?: number;
  size?: number;
}

export interface UsuarioCreatePayload {
  nome: string;
  email: string;
  senha: string;
  telefone?: string | null;
  departamento?: string | null;
  perfil: PerfilUsuario;
}

export interface UsuarioUpdatePayload {
  nome: string;
  email: string;
  telefone?: string | null;
  departamento?: string | null;
  perfil?: PerfilUsuario | null;
  ativo?: boolean | null;
}

export const usuariosKeys = {
  all: ['usuarios'] as const,
  lista: (filtro: UsuarioFiltro) => [...usuariosKeys.all, 'lista', filtro] as const,
  detail: (id: number) => [...usuariosKeys.all, 'detail', id] as const,
};

export function useUsuarios(filtro: UsuarioFiltro = {}) {
  return useQuery({
    queryKey: usuariosKeys.lista(filtro),
    queryFn: async () => {
      const { data } = await api.get<SpringPage<UsuarioResponse>>('/usuarios', {
        params: { page: filtro.page ?? 0, size: filtro.size ?? 10 },
      });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useUsuariosLista(size = 100) {
  return useQuery({
    queryKey: usuariosKeys.lista({ size }),
    queryFn: async () => {
      const { data } = await api.get<SpringPage<UsuarioResponse>>('/usuarios', {
        params: { size },
      });
      return data.content;
    },
  });
}

export function useUsuario(id: number | null) {
  return useQuery({
    queryKey:
      id != null ? usuariosKeys.detail(id) : (['usuarios', 'detail', 'noop'] as const),
    queryFn: async () => {
      const { data } = await api.get<UsuarioResponse>(`/usuarios/${id}`);
      return data;
    },
    enabled: id != null,
  });
}

export function useAdmins() {
  const q = useUsuariosLista();
  return {
    ...q,
    data: q.data?.filter((u) => u.perfil === 'ADMIN' && u.ativo),
  };
}

function invalidar(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: usuariosKeys.all });
}

export function useCriarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UsuarioCreatePayload) => {
      const { data } = await api.post<UsuarioResponse>('/usuarios', payload);
      return data;
    },
    onSuccess: () => invalidar(qc),
  });
}

export function useAtualizarUsuario(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UsuarioUpdatePayload) => {
      const { data } = await api.put<UsuarioResponse>(`/usuarios/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      invalidar(qc);
      qc.invalidateQueries({ queryKey: usuariosKeys.detail(id) });
    },
  });
}

export function useDesativarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/usuarios/${id}`);
    },
    onSuccess: () => invalidar(qc),
  });
}
