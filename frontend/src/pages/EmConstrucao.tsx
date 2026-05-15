import type { LucideIcon } from 'lucide-react';
import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EmConstrucaoProps {
  titulo: string;
  descricao: string;
  icone?: LucideIcon;
}

export function EmConstrucao({ titulo, descricao, icone: Icone = Construction }: EmConstrucaoProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Em breve
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">{titulo}</h1>
        <p className="mt-2 max-w-2xl text-sm text-body">{descricao}</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-hairline bg-canvas-soft text-primary">
            <Icone className="h-6 w-6" />
          </div>
          <p className="text-base font-semibold text-ink">Módulo em construção</p>
          <p className="max-w-md text-sm text-body">
            Esta área está reservada para uma próxima sprint. Volte em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
