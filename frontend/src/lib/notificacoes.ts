import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

export type TipoNotificacao =
  | 'NOVO_CHAMADO'
  | 'ATRIBUICAO'
  | 'COMENTARIO'
  | 'RESOLVIDO'
  | 'SLA';

export interface NotificacaoResponse {
  id: number;
  tipo: TipoNotificacao;
  titulo: string;
  descricao: string | null;
  chamadoId: number | null;
  lida: boolean;
  criadoEm: string;
}

export interface CaixaNotificacoes {
  itens: NotificacaoResponse[];
  naoLidas: number;
}

export interface PreferenciaNotificacao {
  tipo: TipoNotificacao;
  ativo: boolean;
  disponivel: boolean;
}

export const notificacoesKeys = {
  all: ['notificacoes'] as const,
  caixa: () => [...notificacoesKeys.all, 'caixa'] as const,
  preferencias: () => [...notificacoesKeys.all, 'preferencias'] as const,
};

export function useNotificacoes() {
  return useQuery({
    queryKey: notificacoesKeys.caixa(),
    queryFn: async () => {
      const { data } = await api.get<CaixaNotificacoes>('/me/notificacoes');
      return data;
    },
    // Polling leve pra trazer notificações disparadas no backend sem websocket.
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useMarcarLida() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/me/notificacoes/${id}/lida`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: notificacoesKeys.caixa() }),
  });
}

export function useMarcarTodasLidas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/me/notificacoes/lidas');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: notificacoesKeys.caixa() }),
  });
}

export function usePreferenciasNotificacao() {
  return useQuery({
    queryKey: notificacoesKeys.preferencias(),
    queryFn: async () => {
      const { data } = await api.get<PreferenciaNotificacao[]>(
        '/me/preferencias/notificacoes',
      );
      return data;
    },
  });
}

export function useAtualizarPreferencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { tipo: TipoNotificacao; ativo: boolean }) => {
      await api.put('/me/preferencias/notificacoes', payload);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: notificacoesKeys.preferencias() }),
  });
}

interface TipoMeta {
  label: string;
  descricao: string;
}

// Rótulos exibidos nas preferências.
export const TIPO_META: Record<TipoNotificacao, TipoMeta> = {
  NOVO_CHAMADO: {
    label: 'Novos chamados',
    descricao: 'Quando um chamado é aberto (apenas para admins).',
  },
  ATRIBUICAO: {
    label: 'Atribuição',
    descricao: 'Quando um chamado é atribuído a você.',
  },
  COMENTARIO: {
    label: 'Comentários',
    descricao: 'Quando há novos comentários em chamados que você participa.',
  },
  RESOLVIDO: {
    label: 'Resolvidos',
    descricao: 'Quando um chamado seu é marcado como resolvido.',
  },
  SLA: {
    label: 'Violação de SLA',
    descricao: 'Quando o prazo de um chamado vence.',
  },
};
