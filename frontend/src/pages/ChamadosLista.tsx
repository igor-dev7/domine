import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
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
import { StatusBadge } from '@/components/StatusBadge';
import { PrioridadeBadge } from '@/components/PrioridadeBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useChamados } from '@/lib/chamados';
import { categoriaChamadoLabel, formatarDataHora } from '@/lib/format';
import type {
  CategoriaChamado,
  ChamadoFiltro,
  PrioridadeChamado,
  StatusChamado,
} from '@/types';

const ANY = '__ALL__';

const STATUS_OPCOES: { valor: StatusChamado; label: string }[] = [
  { valor: 'ABERTO', label: 'Aberto' },
  { valor: 'EM_ATENDIMENTO', label: 'Em atendimento' },
  { valor: 'AGUARDANDO_USUARIO', label: 'Aguardando usuário' },
  { valor: 'RESOLVIDO', label: 'Resolvido' },
  { valor: 'FECHADO', label: 'Fechado' },
];

const PRIORIDADE_OPCOES: { valor: PrioridadeChamado; label: string }[] = [
  { valor: 'CRITICA', label: 'Crítica' },
  { valor: 'ALTA', label: 'Alta' },
  { valor: 'MEDIA', label: 'Média' },
  { valor: 'BAIXA', label: 'Baixa' },
];

const CATEGORIA_OPCOES: { valor: CategoriaChamado; label: string }[] = [
  { valor: 'HARDWARE', label: 'Hardware' },
  { valor: 'SOFTWARE', label: 'Software' },
  { valor: 'REDE', label: 'Rede' },
  { valor: 'ACESSO', label: 'Acesso' },
  { valor: 'EMAIL', label: 'E-mail' },
  { valor: 'IMPRESSAO', label: 'Impressão' },
  { valor: 'OUTRO', label: 'Outro' },
];

export function ChamadosLista() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.perfil === 'ADMIN';
  const navigate = useNavigate();

  const [filtro, setFiltro] = useState<ChamadoFiltro>({ page: 0, size: 10 });
  const [busca, setBusca] = useState('');

  const { data, isLoading, isFetching } = useChamados(filtro);

  const totalPaginas = data?.totalPages ?? 0;
  const paginaAtual = (filtro.page ?? 0) + 1;
  const exibindo = data?.numberOfElements ?? 0;

  function atualizarFiltro(parcial: Partial<ChamadoFiltro>) {
    setFiltro((atual) => ({ ...atual, ...parcial, page: 0 }));
  }

  function aplicarBusca(e: React.FormEvent) {
    e.preventDefault();
    atualizarFiltro({ busca: busca.trim() || null });
  }

  const linhas = useMemo(() => data?.content ?? [], [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Chamados
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">
            {isAdmin ? 'Todos os chamados' : 'Meus chamados'}
          </h1>
          <p className="mt-1 text-sm text-body">
            {isAdmin
              ? 'Filtre por status, prioridade ou categoria. A busca atinge título e descrição.'
              : 'Você vê apenas os chamados que abriu.'}
          </p>
        </div>
        <Button asChild>
          <Link to="/chamados/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo chamado
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
                placeholder="Buscar por título ou descrição"
                className="pl-9"
              />
            </div>
            <FiltroSelect
              valor={filtro.status ?? null}
              onChange={(v) => atualizarFiltro({ status: v as StatusChamado | null })}
              placeholder="Status"
              opcoes={STATUS_OPCOES}
            />
            <FiltroSelect
              valor={filtro.prioridade ?? null}
              onChange={(v) => atualizarFiltro({ prioridade: v as PrioridadeChamado | null })}
              placeholder="Prioridade"
              opcoes={PRIORIDADE_OPCOES}
            />
            <FiltroSelect
              valor={filtro.categoria ?? null}
              onChange={(v) => atualizarFiltro({ categoria: v as CategoriaChamado | null })}
              placeholder="Categoria"
              opcoes={CATEGORIA_OPCOES}
            />
            <Button type="submit" variant="secondary">
              Aplicar busca
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonTabela colunas={isAdmin ? 7 : 6} linhas={6} />
          ) : linhas.length === 0 ? (
            <EmptyState
              titulo="Nenhum chamado encontrado."
              descricao="Ajuste os filtros ou abra um novo chamado."
              acao={
                <Button asChild variant="outline">
                  <Link to="/chamados/novo">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo chamado
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Categoria</TableHead>
                    {isAdmin && <TableHead>Solicitante</TableHead>}
                    <TableHead>Técnico</TableHead>
                    <TableHead>Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linhas.map((ch) => (
                    <TableRow
                      key={ch.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/chamados/${ch.id}`)}
                    >
                      <TableCell className="font-mono text-xs text-mute">#{ch.id}</TableCell>
                      <TableCell className="max-w-[320px]">
                        <p className="truncate font-medium text-ink">{ch.titulo}</p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ch.status} />
                      </TableCell>
                      <TableCell>
                        <PrioridadeBadge prioridade={ch.prioridade} />
                      </TableCell>
                      <TableCell className="text-sm text-body">
                        {categoriaChamadoLabel[ch.categoria]}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-sm text-body">{ch.solicitanteNome}</TableCell>
                      )}
                      <TableCell className="text-sm text-body">
                        {ch.tecnicoResponsavelNome ?? <span className="text-mute">—</span>}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-mute">
                        {formatarDataHora(ch.criadoEm)}
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
                Exibindo {exibindo} de {data.totalElements} chamados {isFetching && '· atualizando…'}
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
