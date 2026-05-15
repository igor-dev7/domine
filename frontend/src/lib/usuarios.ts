import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import type { SpringPage, UsuarioResponse } from '@/types';

export const usuariosKeys = {
  all: ['usuarios'] as const,
  lista: (size: number) => [...usuariosKeys.all, 'lista', size] as const,
};

export function useUsuariosLista(size = 100) {
  return useQuery({
    queryKey: usuariosKeys.lista(size),
    queryFn: async () => {
      const { data } = await api.get<SpringPage<UsuarioResponse>>('/usuarios', {
        params: { size },
      });
      return data.content;
    },
  });
}

export function useAdmins() {
  const q = useUsuariosLista();
  return {
    ...q,
    data: q.data?.filter((u) => u.perfil === 'ADMIN' && u.ativo),
  };
}
