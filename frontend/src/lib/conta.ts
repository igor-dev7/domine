import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './api';

export interface CandidatoPromocao {
  id: number;
  nome: string;
  email: string;
}

export interface PreExclusaoResponse {
  precisaPromoverAdmin: boolean;
  candidatos: CandidatoPromocao[];
}

export interface ExcluirContaPayload {
  confirmacaoEmail: string;
  promoverUsuarioId?: number | null;
}

export function usePreExclusao(enabled = true) {
  return useQuery({
    queryKey: ['conta', 'pre-exclusao'],
    queryFn: async () => {
      const { data } = await api.get<PreExclusaoResponse>('/me/pre-exclusao');
      return data;
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useExcluirConta() {
  return useMutation({
    mutationFn: async (payload: ExcluirContaPayload) => {
      await api.delete('/me', { data: payload });
    },
  });
}

export async function exportarMeusDados() {
  // Pega o JSON e força download como arquivo no browser.
  const { data, headers } = await api.get('/me/export', { responseType: 'blob' });
  const blob = data as Blob;
  const disposition = (headers['content-disposition'] as string | undefined) ?? '';
  const match = /filename="?([^"]+)"?/.exec(disposition);
  const nome = match?.[1] ?? `domine-meus-dados-${Date.now()}.json`;

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
