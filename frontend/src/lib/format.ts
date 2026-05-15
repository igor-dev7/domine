import type {
  CategoriaChamado,
  PrioridadeChamado,
  StatusChamado,
  StatusEquipamento,
  TipoEquipamento,
  TipoEventoHistorico,
} from '@/types';

export const statusChamadoLabel: Record<StatusChamado, string> = {
  ABERTO: 'Aberto',
  EM_ATENDIMENTO: 'Em atendimento',
  AGUARDANDO_USUARIO: 'Aguardando usuário',
  RESOLVIDO: 'Resolvido',
  FECHADO: 'Fechado',
};

export const prioridadeChamadoLabel: Record<PrioridadeChamado, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
};

export const categoriaChamadoLabel: Record<CategoriaChamado, string> = {
  HARDWARE: 'Hardware',
  SOFTWARE: 'Software',
  REDE: 'Rede',
  ACESSO: 'Acesso',
  EMAIL: 'E-mail',
  IMPRESSAO: 'Impressão',
  OUTRO: 'Outro',
};

export const tipoEquipamentoLabel: Record<TipoEquipamento, string> = {
  NOTEBOOK: 'Notebook',
  DESKTOP: 'Desktop',
  MONITOR: 'Monitor',
  IMPRESSORA: 'Impressora',
  CELULAR: 'Celular',
  PERIFERICO: 'Periférico',
  OUTRO: 'Outro',
};

export const statusEquipamentoLabel: Record<StatusEquipamento, string> = {
  EM_USO: 'Em uso',
  ESTOQUE: 'Estoque',
  MANUTENCAO: 'Manutenção',
  BAIXADO: 'Baixado',
};

export const tipoEventoLabel: Record<TipoEventoHistorico, string> = {
  CRIADO: 'Chamado criado',
  STATUS_ALTERADO: 'Status alterado',
  TECNICO_ATRIBUIDO: 'Técnico atribuído',
  PRIORIDADE_ALTERADA: 'Prioridade alterada',
  COMENTARIO_ADICIONADO: 'Comentário adicionado',
};

const dataHoraFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const dataFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function formatarDataHora(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : dataHoraFmt.format(d);
}

export function formatarData(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : dataFmt.format(d);
}

export function iniciaisDe(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}
