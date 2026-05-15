import { cn } from '@/lib/utils';
import { statusChamadoLabel } from '@/lib/format';
import type { StatusChamado } from '@/types';

const ESTILOS: Record<StatusChamado, string> = {
  ABERTO: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  EM_ATENDIMENTO: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  AGUARDANDO_USUARIO: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
  RESOLVIDO: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  FECHADO: 'border-hairline bg-canvas-soft text-mute',
};

interface StatusBadgeProps {
  status: StatusChamado;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider',
        ESTILOS[status],
        className,
      )}
    >
      {statusChamadoLabel[status]}
    </span>
  );
}
