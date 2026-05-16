import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { PrioridadeBadge } from '@/components/PrioridadeBadge';
import {
  categoriaChamadoLabel,
  formatarDataHora,
  iniciaisDe,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ChamadoResponse } from '@/types';

export function ChamadoDetalheModal({
  chamado,
  onClose,
}: {
  chamado: ChamadoResponse | null;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const aberto = chamado != null;

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/70 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-[#1a1a1a] p-6 shadow-2xl shadow-black/60">
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>Detalhes do chamado</DialogPrimitive.Title>
            <DialogPrimitive.Description>
              Visão rápida do chamado selecionado.
            </DialogPrimitive.Description>
          </VisuallyHidden.Root>

          {chamado && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs text-mute">
                  <span>#{chamado.id}</span>
                  <span>·</span>
                  <span>{formatarDataHora(chamado.criadoEm)}</span>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-ink-strong">
                  {chamado.titulo}
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={chamado.status} />
                  <PrioridadeBadge prioridade={chamado.prioridade} />
                  <span className="rounded-sm border border-hairline bg-canvas-soft/40 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-mute">
                    {categoriaChamadoLabel[chamado.categoria]}
                  </span>
                </div>
              </div>

              <p className="rounded-2xl bg-[#131313] px-4 py-3 text-sm leading-relaxed text-body">
                {chamado.descricao}
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoBloco rotulo="Solicitante" nome={chamado.solicitanteNome} />
                <InfoBloco
                  rotulo="Técnico responsável"
                  nome={chamado.tecnicoResponsavelNome ?? '— Sem técnico atribuído'}
                  apagado={!chamado.tecnicoResponsavelNome}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose}>
                  Fechar
                </Button>
                <Button onClick={() => navigate(`/chamados/${chamado.id}`)}>
                  Ver chamado completo
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

function InfoBloco({
  rotulo,
  nome,
  apagado,
}: {
  rotulo: string;
  nome: string;
  apagado?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-[#131313] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-mute">
        {rotulo}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {!apagado && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {iniciaisDe(nome)}
          </span>
        )}
        <p className={cn('text-sm font-medium', apagado ? 'text-mute' : 'text-ink')}>
          {nome}
        </p>
      </div>
    </div>
  );
}
