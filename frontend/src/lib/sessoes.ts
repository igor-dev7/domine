import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

export interface SessaoResponse {
  id: number;
  userAgent: string | null;
  ipOrigem: string | null;
  criadoEm: string;
  ultimoAcessoEm: string | null;
  atual: boolean;
}

export const sessoesKeys = {
  all: ['sessoes'] as const,
  lista: () => [...sessoesKeys.all, 'lista'] as const,
};

export function useSessoes() {
  return useQuery({
    queryKey: sessoesKeys.lista(),
    queryFn: async () => {
      const { data } = await api.get<SessaoResponse[]>('/me/sessoes');
      return data;
    },
  });
}

export function useEncerrarSessao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/me/sessoes/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessoesKeys.all });
    },
  });
}

interface DispositivoInfo {
  rotulo: string;
  tipo: 'mobile' | 'desktop';
}

// Faz parse leve do User-Agent pra mostrar algo legível ao usuário.
export function descreverDispositivo(userAgent: string | null | undefined): DispositivoInfo {
  if (!userAgent) return { rotulo: 'Dispositivo desconhecido', tipo: 'desktop' };
  const ua = userAgent;

  const mobile =
    /iPhone|iPad|iPod|Android|Mobile|Windows Phone|Opera Mini/i.test(ua);

  let plataforma = 'Dispositivo';
  if (/iPhone/i.test(ua)) plataforma = 'iPhone';
  else if (/iPad/i.test(ua)) plataforma = 'iPad';
  else if (/Android/i.test(ua)) plataforma = 'Android';
  else if (/Macintosh|Mac OS X/i.test(ua)) plataforma = 'macOS';
  else if (/Windows/i.test(ua)) plataforma = 'Windows';
  else if (/Linux/i.test(ua)) plataforma = 'Linux';

  let navegador = '';
  if (/Edg\//i.test(ua)) navegador = 'Edge';
  else if (/OPR\//i.test(ua)) navegador = 'Opera';
  else if (/Firefox\//i.test(ua)) navegador = 'Firefox';
  else if (/Chrome\//i.test(ua)) navegador = 'Chrome';
  else if (/Safari\//i.test(ua)) navegador = 'Safari';
  else if (/curl\//i.test(ua)) navegador = 'curl';

  const rotulo = navegador ? `${plataforma} · ${navegador}` : plataforma;
  return { rotulo, tipo: mobile ? 'mobile' : 'desktop' };
}
