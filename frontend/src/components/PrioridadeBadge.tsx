import { cn } from '@/lib/utils';
import { prioridadeChamadoLabel } from '@/lib/format';
import type { PrioridadeChamado } from '@/types';

const ESTILOS: Record<PrioridadeChamado, string> = {
  BAIXA: 'border-hairline bg-canvas-soft text-mute',
  MEDIA: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  ALTA: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
  CRITICA: 'border-destructive/50 bg-destructive/15 text-red-300',
};

interface PrioridadeBadgeProps {
  prioridade: PrioridadeChamado;
  className?: string;
}

export function PrioridadeBadge({ prioridade, className }: PrioridadeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider',
        ESTILOS[prioridade],
        className,
      )}
    >
      {prioridadeChamadoLabel[prioridade]}
    </span>
  );
}
