import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonTabela } from '@/components/LoadingSkeleton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  useEquipamentos,
  useExcluirEquipamento,
  type EquipamentoFiltro,
} from '@/lib/equipamentos';
import { statusEquipamentoLabel, tipoEquipamentoLabel } from '@/lib/format';
import type {
  EquipamentoResponse,
  StatusEquipamento,
  TipoEquipamento,
} from '@/types';

const ANY = '__ALL__';

const TIPO_OPCOES: { valor: TipoEquipamento; label: string }[] = [
  { valor: 'NOTEBOOK', label: 'Notebook' },
  { valor: 'DESKTOP', label: 'Desktop' },
  { valor: 'MONITOR', label: 'Monitor' },
  { valor: 'IMPRESSORA', label: 'Impressora' },
  { valor: 'CELULAR', label: 'Celular' },
  { valor: 'PERIFERICO', label: 'Periférico' },
  { valor: 'OUTRO', label: 'Outro' },
];

const STATUS_OPCOES: { valor: StatusEquipamento; label: string }[] = [
  { valor: 'EM_USO', label: 'Em uso' },
  { valor: 'ESTOQUE', label: 'Estoque' },
  { valor: 'MANUTENCAO', label: 'Manutenção' },
  { valor: 'BAIXADO', label: 'Baixado' },
];

const STATUS_CLASSES: Record<StatusEquipamento, string> = {
  EM_USO: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  ESTOQUE: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  MANUTENCAO: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  BAIXADO: 'border-hairline bg-canvas-soft text-mute',
};

export function EquipamentosLista() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<EquipamentoFiltro>({ page: 0, size: 10 });
  const [busca, setBusca] = useState('');
  const [paraExcluir, setParaExcluir] = useState<EquipamentoResponse | null>(null);

  const { data, isLoading, isFetching } = useEquipamentos(filtro);
  const excluir = useExcluirEquipamento();

  function aplicarFiltro(parcial: Partial<EquipamentoFiltro>) {
    setFiltro((atual) => ({ ...atual, ...parcial, page: 0 }));
  }

  function aplicarBusca(e: React.FormEvent) {
    e.preventDefault();
    aplicarFiltro({ busca: busca.trim() || null });
  }

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    try {
      await excluir.mutateAsync(paraExcluir.id);
      toast.success(`Equipamento ${paraExcluir.patrimonio} dado baixa.`);
      setParaExcluir(null);
    } catch (err) {
      const ax = err as AxiosError<{ mensagens?: string[] }>;
      toast.error(ax.response?.data?.mensagens?.[0] ?? 'Erro ao dar baixa.');
    }
  }

  const linhas = data?.content ?? [];
  const totalPaginas = data?.totalPages ?? 0;
  const paginaAtual = (filtro.page ?? 0) + 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Equipamentos
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">
            Inventário
          </h1>
          <p className="mt-1 text-sm text-body">
            Cadastre, atribua e dê baixa em equipamentos da empresa.
          </p>
        </div>
        <Button asChild>
          <Link to="/equipamentos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo equipamento
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-mute">
            Filtros
          </CardTitle>
          <form onSubmit={aplicarBusca} className="flex flex-wrap gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por patrimônio ou modelo"
                className="pl-9"
              />
            </div>
            <FiltroSelect
              valor={filtro.tipo ?? null}
              onChange={(v) => aplicarFiltro({ tipo: v as TipoEquipamento | null })}
              placeholder="Tipo"
              opcoes={TIPO_OPCOES}
            />
            <FiltroSelect
              valor={filtro.status ?? null}
              onChange={(v) => aplicarFiltro({ status: v as StatusEquipamento | null })}
              placeholder="Status"
              opcoes={STATUS_OPCOES}
            />
            <Button type="submit" variant="secondary">
              Aplicar busca
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonTabela colunas={7} linhas={6} />
          ) : linhas.length === 0 ? (
            <EmptyState
              titulo="Nenhum equipamento encontrado."
              descricao="Ajuste os filtros ou cadastre um novo equipamento."
              acao={
                <Button asChild variant="outline">
                  <Link to="/equipamentos/novo">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo equipamento
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patrimônio</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Marca / Modelo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead className="w-28 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linhas.map((eq) => (
                    <TableRow key={eq.id}>
                      <TableCell className="font-mono text-xs text-ink">
                        {eq.patrimonio}
                      </TableCell>
                      <TableCell className="text-sm text-body">
                        {tipoEquipamentoLabel[eq.tipo]}
                      </TableCell>
                      <TableCell className="max-w-[260px]">
                        <p className="truncate text-sm font-medium text-ink">{eq.marca}</p>
                        <p className="truncate text-xs text-mute">{eq.modelo}</p>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-sm border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${STATUS_CLASSES[eq.status]}`}
                        >
                          {statusEquipamentoLabel[eq.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-body">
                        {eq.responsavelNome ?? <span className="text-mute">—</span>}
                      </TableCell>
                      <TableCell className="text-sm text-body">
                        {eq.localizacao ?? <span className="text-mute">—</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigate(`/equipamentos/${eq.id}/editar`)}
                            aria-label="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setParaExcluir(eq)}
                            disabled={eq.status === 'BAIXADO'}
                            aria-label="Dar baixa"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {data && data.totalElements > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-3 text-xs text-mute">
              <span>
                Exibindo {data.numberOfElements} de {data.totalElements} equipamentos{' '}
                {isFetching && '· atualizando…'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.first}
                  onClick={() =>
                    setFiltro((f) => ({ ...f, page: Math.max(0, (f.page ?? 0) - 1) }))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="px-2 text-body">
                  Página {paginaAtual} de {Math.max(1, totalPaginas)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.last}
                  onClick={() => setFiltro((f) => ({ ...f, page: (f.page ?? 0) + 1 }))}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!paraExcluir}
        onOpenChange={(o) => !o && setParaExcluir(null)}
        titulo={`Dar baixa em ${paraExcluir?.patrimonio ?? ''}?`}
        descricao="O equipamento ficará com status BAIXADO e perderá o responsável atribuído. Você poderá vê-lo nas listagens filtradas por status."
        textoConfirmar="Dar baixa"
        destrutivo
        carregando={excluir.isPending}
        onConfirmar={confirmarExclusao}
      />
    </div>
  );
}

function FiltroSelect<T extends string>({
  valor,
  onChange,
  placeholder,
  opcoes,
}: {
  valor: T | null;
  onChange: (v: T | null) => void;
  placeholder: string;
  opcoes: { valor: T; label: string }[];
}) {
  return (
    <Select
      value={valor ?? ANY}
      onValueChange={(v) => onChange(v === ANY ? null : (v as T))}
    >
      <SelectTrigger className="min-w-[160px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY}>{placeholder}: todos</SelectItem>
        {opcoes.map((o) => (
          <SelectItem key={o.valor} value={o.valor}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
