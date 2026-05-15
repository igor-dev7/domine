import { Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonTabela } from '@/components/LoadingSkeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMeusEquipamentos } from '@/lib/equipamentos';
import { formatarData, statusEquipamentoLabel, tipoEquipamentoLabel } from '@/lib/format';
import type { StatusEquipamento } from '@/types';

const STATUS_CLASSES: Record<StatusEquipamento, string> = {
  EM_USO: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  ESTOQUE: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  MANUTENCAO: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  BAIXADO: 'border-hairline bg-canvas-soft text-mute',
};

export function MeusEquipamentos() {
  const { data, isLoading } = useMeusEquipamentos();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Equipamentos
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">
          Meus equipamentos
        </h1>
        <p className="mt-1 text-sm text-body">
          Itens atribuídos a você. Em caso de problema, abra um chamado relacionado.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-mute">
            Atribuídos a você
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonTabela colunas={5} linhas={4} />
          ) : !data || data.length === 0 ? (
            <EmptyState
              icon={<Monitor className="h-5 w-5" />}
              titulo="Você ainda não tem equipamentos atribuídos."
              descricao="Procure o ADMIN responsável para receber um equipamento."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patrimônio</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Marca / Modelo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aquisição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((eq) => (
                  <TableRow key={eq.id}>
                    <TableCell className="font-mono text-xs text-ink">{eq.patrimonio}</TableCell>
                    <TableCell className="text-sm text-body">
                      {tipoEquipamentoLabel[eq.tipo]}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-ink">{eq.marca}</p>
                      <p className="text-xs text-mute">{eq.modelo}</p>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-sm border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${STATUS_CLASSES[eq.status]}`}
                      >
                        {statusEquipamentoLabel[eq.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-mute">
                      {formatarData(eq.dataAquisicao)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
