import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { chamadosKeys } from './chamados';
import type {
  EquipamentoResponse,
  SpringPage,
  StatusEquipamento,
  TipoEquipamento,
} from '@/types';

export interface EquipamentoFiltro {
  tipo?: TipoEquipamento | null;
  status?: StatusEquipamento | null;
  busca?: string | null;
  page?: number;
  size?: number;
}

export interface EquipamentoPayload {
  patrimonio: string;
  tipo: TipoEquipamento;
  marca: string;
  modelo: string;
  numeroSerie?: string | null;
  localizacao?: string | null;
  status: StatusEquipamento;
  responsavelId?: number | null;
  dataAquisicao?: string | null;
  observacoes?: string | null;
}

export const equipamentosKeys = {
  all: ['equipamentos'] as const,
  meus: () => [...equipamentosKeys.all, 'meus'] as const,
  lista: (filtro: EquipamentoFiltro) => [...equipamentosKeys.all, 'lista', filtro] as const,
  detail: (id: number) => [...equipamentosKeys.all, 'detail', id] as const,
};

function paramsDeFiltro(filtro: EquipamentoFiltro): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (filtro.tipo) params.tipo = filtro.tipo;
  if (filtro.status) params.status = filtro.status;
  if (filtro.busca) params.busca = filtro.busca;
  params.page = filtro.page ?? 0;
  params.size = filtro.size ?? 10;
  return params;
}

export function useEquipamentos(filtro: EquipamentoFiltro) {
  return useQuery({
    queryKey: equipamentosKeys.lista(filtro),
    queryFn: async () => {
      const { data } = await api.get<SpringPage<EquipamentoResponse>>('/equipamentos', {
        params: paramsDeFiltro(filtro),
      });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useMeusEquipamentos() {
  return useQuery({
    queryKey: equipamentosKeys.meus(),
    queryFn: async () => {
      const { data } = await api.get<SpringPage<EquipamentoResponse>>('/equipamentos/meus', {
        params: { size: 100 },
      });
      return data.content;
    },
  });
}

export function useEquipamentosLista(size = 100) {
  const filtro: EquipamentoFiltro = { size };
  return useQuery({
    queryKey: equipamentosKeys.lista(filtro),
    queryFn: async () => {
      const { data } = await api.get<SpringPage<EquipamentoResponse>>('/equipamentos', {
        params: paramsDeFiltro(filtro),
      });
      return data.content;
    },
  });
}

export function useEquipamento(id: number | null) {
  return useQuery({
    queryKey:
      id != null ? equipamentosKeys.detail(id) : (['equipamentos', 'detail', 'noop'] as const),
    queryFn: async () => {
      const { data } = await api.get<EquipamentoResponse>(`/equipamentos/${id}`);
      return data;
    },
    enabled: id != null,
  });
}

function invalidarLeituras(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: equipamentosKeys.all });
  qc.invalidateQueries({ queryKey: chamadosKeys.lists() });
}

export function useCriarEquipamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: EquipamentoPayload) => {
      const { data } = await api.post<EquipamentoResponse>('/equipamentos', payload);
      return data;
    },
    onSuccess: () => invalidarLeituras(qc),
  });
}

export function useAtualizarEquipamento(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: EquipamentoPayload) => {
      const { data } = await api.put<EquipamentoResponse>(`/equipamentos/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      invalidarLeituras(qc);
      qc.invalidateQueries({ queryKey: equipamentosKeys.detail(id) });
    },
  });
}

export function useExcluirEquipamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/equipamentos/${id}`);
    },
    onSuccess: () => invalidarLeituras(qc),
  });
}
