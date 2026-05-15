import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type {
  ChamadoFiltro,
  ChamadoRequest,
  ChamadoResponse,
  ComentarioRequest,
  ComentarioResponse,
  DashboardResponse,
  HistoricoResponse,
  SpringPage,
  StatusChamado,
} from '@/types';

export const chamadosKeys = {
  all: ['chamados'] as const,
  lists: () => [...chamadosKeys.all, 'list'] as const,
  list: (filtro: ChamadoFiltro) => [...chamadosKeys.lists(), filtro] as const,
  details: () => [...chamadosKeys.all, 'detail'] as const,
  detail: (id: number) => [...chamadosKeys.details(), id] as const,
  historico: (id: number) => [...chamadosKeys.detail(id), 'historico'] as const,
  dashboard: () => [...chamadosKeys.all, 'dashboard'] as const,
};

function paramsDeFiltro(filtro: ChamadoFiltro): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (filtro.status) params.status = filtro.status;
  if (filtro.prioridade) params.prioridade = filtro.prioridade;
  if (filtro.categoria) params.categoria = filtro.categoria;
  if (filtro.tecnicoResponsavelId != null)
    params.tecnicoResponsavelId = filtro.tecnicoResponsavelId;
  if (filtro.busca) params.busca = filtro.busca;
  params.page = filtro.page ?? 0;
  params.size = filtro.size ?? 10;
  return params;
}

export function useChamados(filtro: ChamadoFiltro) {
  return useQuery({
    queryKey: chamadosKeys.list(filtro),
    queryFn: async () => {
      const { data } = await api.get<SpringPage<ChamadoResponse>>('/chamados', {
        params: paramsDeFiltro(filtro),
      });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useChamado(id: number | null) {
  return useQuery({
    queryKey: id != null ? chamadosKeys.detail(id) : ['chamados', 'detail', 'noop'],
    queryFn: async () => {
      const { data } = await api.get<ChamadoResponse>(`/chamados/${id}`);
      return data;
    },
    enabled: id != null,
  });
}

export function useHistoricoChamado(id: number | null) {
  return useQuery({
    queryKey: id != null ? chamadosKeys.historico(id) : ['chamados', 'historico', 'noop'],
    queryFn: async () => {
      const { data } = await api.get<HistoricoResponse[]>(`/chamados/${id}/historico`);
      return data;
    },
    enabled: id != null,
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: chamadosKeys.dashboard(),
    queryFn: async () => {
      const { data } = await api.get<DashboardResponse>('/chamados/dashboard');
      return data;
    },
  });
}

export function useCriarChamado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ChamadoRequest) => {
      const { data } = await api.post<ChamadoResponse>('/chamados', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chamadosKeys.lists() });
      qc.invalidateQueries({ queryKey: chamadosKeys.dashboard() });
    },
  });
}

export function useAtualizarStatus(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (status: StatusChamado) => {
      const { data } = await api.patch<ChamadoResponse>(`/chamados/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chamadosKeys.detail(id) });
      qc.invalidateQueries({ queryKey: chamadosKeys.historico(id) });
      qc.invalidateQueries({ queryKey: chamadosKeys.lists() });
      qc.invalidateQueries({ queryKey: chamadosKeys.dashboard() });
    },
  });
}

export function useAtribuirTecnico(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tecnicoId: number) => {
      const { data } = await api.patch<ChamadoResponse>(`/chamados/${id}/atribuir`, {
        tecnicoId,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chamadosKeys.detail(id) });
      qc.invalidateQueries({ queryKey: chamadosKeys.historico(id) });
      qc.invalidateQueries({ queryKey: chamadosKeys.lists() });
    },
  });
}

export function useAdicionarComentario(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ComentarioRequest) => {
      const { data } = await api.post<ComentarioResponse>(
        `/chamados/${id}/comentarios`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chamadosKeys.detail(id) });
      qc.invalidateQueries({ queryKey: chamadosKeys.historico(id) });
    },
  });
}
