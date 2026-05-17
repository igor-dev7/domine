import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type {
  ArtigoRequest,
  ArtigoResponse,
  CategoriaArtigo,
  CategoriaChamado,
  SpringPage,
} from '@/types';

export interface ArtigoFiltro {
  categoria?: CategoriaArtigo | null;
  busca?: string | null;
  page?: number;
  size?: number;
}

export const artigosKeys = {
  all: ['artigos'] as const,
  lista: (filtro: ArtigoFiltro) => [...artigosKeys.all, 'lista', filtro] as const,
  detail: (id: number) => [...artigosKeys.all, 'detail', id] as const,
};

function paramsDeFiltro(filtro: ArtigoFiltro): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (filtro.categoria) params.categoria = filtro.categoria;
  if (filtro.busca) params.busca = filtro.busca;
  params.page = filtro.page ?? 0;
  params.size = filtro.size ?? 100;
  return params;
}

export function useArtigos(filtro: ArtigoFiltro = {}) {
  return useQuery({
    queryKey: artigosKeys.lista(filtro),
    queryFn: async () => {
      const { data } = await api.get<SpringPage<ArtigoResponse>>('/artigos', {
        params: paramsDeFiltro(filtro),
      });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useArtigo(id: number | null, registrarVisualizacao = false) {
  return useQuery({
    queryKey: id != null ? artigosKeys.detail(id) : (['artigos', 'detail', 'noop'] as const),
    queryFn: async () => {
      const { data } = await api.get<ArtigoResponse>(`/artigos/${id}`, {
        params: { registrarVisualizacao },
      });
      return data;
    },
    enabled: id != null,
  });
}

function invalidarLeituras(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: artigosKeys.all });
}

export function useCriarArtigo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ArtigoRequest) => {
      const { data } = await api.post<ArtigoResponse>('/artigos', payload);
      return data;
    },
    onSuccess: () => invalidarLeituras(qc),
  });
}

export function useAtualizarArtigo(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ArtigoRequest) => {
      const { data } = await api.put<ArtigoResponse>(`/artigos/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      invalidarLeituras(qc);
      qc.invalidateQueries({ queryKey: artigosKeys.detail(id) });
    },
  });
}

export function useExcluirArtigo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/artigos/${id}`);
    },
    onSuccess: () => invalidarLeituras(qc),
  });
}

export function useMarcarUtilArtigo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<ArtigoResponse>(`/artigos/${id}/uteis`);
      return data;
    },
    onSuccess: (_data, id) => {
      invalidarLeituras(qc);
      qc.invalidateQueries({ queryKey: artigosKeys.detail(id) });
    },
  });
}

// ─────────────────────── Sugestões pra chamados (FTS server-side) ───────────────────────

/**
 * Mapeia a categoria do chamado pra categoria do artigo correspondente.
 * Usado pra dar boost no ranking quando o domínio bate (HARDWARE/IMPRESSAO
 * ambos colapsam pra HARDWARE no domínio de artigo, etc.).
 */
export const MAP_CATEGORIA_CHAMADO_ARTIGO: Record<CategoriaChamado, CategoriaArtigo> = {
  HARDWARE: 'HARDWARE',
  SOFTWARE: 'SOFTWARE',
  REDE: 'REDE',
  ACESSO: 'ACESSO',
  EMAIL: 'SOFTWARE',
  IMPRESSAO: 'HARDWARE',
  OUTRO: 'OUTROS',
};

export function useSugestoesArtigos(
  busca: string,
  categoria: CategoriaArtigo | null,
  limite = 3,
) {
  const buscaSan = busca.trim();
  return useQuery({
    queryKey: [...artigosKeys.all, 'sugestoes', buscaSan, categoria, limite] as const,
    queryFn: async () => {
      const params: Record<string, string | number> = { limite };
      if (buscaSan) params.busca = buscaSan;
      if (categoria) params.categoria = categoria;
      const { data } = await api.get<ArtigoResponse[]>('/artigos/sugestoes', { params });
      return data;
    },
    enabled: buscaSan.length > 0 || categoria != null,
    placeholderData: (prev) => prev,
  });
}
