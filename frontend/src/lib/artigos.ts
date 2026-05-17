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

// ─────────────────────── Ranking pra sugestão em chamados ───────────────────────

// Mapeia a categoria do chamado pra categoria do artigo.
const MAP_CATEGORIA: Record<CategoriaChamado, CategoriaArtigo> = {
  HARDWARE: 'HARDWARE',
  SOFTWARE: 'SOFTWARE',
  REDE: 'REDE',
  ACESSO: 'ACESSO',
  EMAIL: 'SOFTWARE',
  IMPRESSAO: 'HARDWARE',
  OUTRO: 'OUTROS',
};

const STOP_WORDS = new Set([
  'a', 'as', 'o', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'da', 'do', 'das', 'dos',
  'em', 'no', 'na', 'nos', 'nas', 'pra', 'para', 'por', 'com', 'sem', 'sob', 'sobre',
  'que', 'e', 'ou', 'mas', 'se', 'meu', 'minha', 'seu', 'sua', 'meus', 'minhas',
  'ao', 'aos', 'à', 'foi', 'esta', 'estao', 'tem', 'ter', 'pode', 'qual', 'quais',
  'nao', 'ja', 'so', 'mais',
]);

function tokens(texto: string): string[] {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

/**
 * Ranqueia artigos relevantes para um chamado.
 * Categoria correspondente vale +5, cada termo do título/descrição
 * que aparece no título/resumo do artigo vale +1.
 */
export function ranquearArtigos(
  chamado: { categoria: CategoriaChamado; titulo: string; descricao?: string | null },
  artigos: ArtigoResponse[],
  limite = 3,
): ArtigoResponse[] {
  const catAlvo = MAP_CATEGORIA[chamado.categoria];
  const termos = new Set([
    ...tokens(chamado.titulo ?? ''),
    ...tokens(chamado.descricao ?? ''),
  ]);

  return artigos
    .map((a) => {
      let score = 0;
      if (a.categoria === catAlvo) score += 5;
      const corpus = (a.titulo + ' ' + a.resumo)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');
      termos.forEach((t) => {
        if (corpus.includes(t)) score += 1;
      });
      return { artigo: a, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limite)
    .map((x) => x.artigo);
}
