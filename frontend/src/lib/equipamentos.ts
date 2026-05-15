import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import type { EquipamentoResponse, SpringPage } from '@/types';

export const equipamentosKeys = {
  all: ['equipamentos'] as const,
  meus: () => [...equipamentosKeys.all, 'meus'] as const,
  lista: (size: number) => [...equipamentosKeys.all, 'lista', size] as const,
};

export function useMeusEquipamentos() {
  return useQuery({
    queryKey: equipamentosKeys.meus(),
    queryFn: async () => {
      const { data } = await api.get<EquipamentoResponse[]>('/equipamentos/meus');
      return data;
    },
  });
}

export function useEquipamentosLista(size = 100) {
  return useQuery({
    queryKey: equipamentosKeys.lista(size),
    queryFn: async () => {
      const { data } = await api.get<SpringPage<EquipamentoResponse>>('/equipamentos', {
        params: { size },
      });
      return data.content;
    },
  });
}
