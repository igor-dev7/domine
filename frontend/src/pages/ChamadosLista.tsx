import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  HardDrive,
  Lock,
  Mail,
  MoreVertical,
  Plus,
  Search,
  Shapes,
  Signal,
  Tag,
  User,
  Wifi,
  Wrench,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonLinhas } from '@/components/LoadingSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useNovoChamadoModal } from '@/contexts/NovoChamadoModalContext';
import { useAtualizarStatusDe, useChamados } from '@/lib/chamados';
import {
  categoriaChamadoLabel,
  formatarDataHora,
  iniciaisDe,
  prioridadeChamadoLabel,
  statusChamadoLabel,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import type {
  CategoriaChamado,
  ChamadoFiltro,
  ChamadoResponse,
  PrioridadeChamado,
  StatusChamado,
} from '@/types';

const ANY = '__ALL__';
const SIDEBAR_EASE = [0.16, 1, 0.3, 1] as const;
const DEBOUNCE_BUSCA_MS = 300;

const stagger = {
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
  },
  item: {
    hidden: { opacity: 0, y: 20, filter: 'blur(12px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.8, ease: SIDEBAR_EASE },
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 400, damping: 25, mass: 0.7 },
  },
};

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

const ICONE_CATEGORIA: Record<CategoriaChamado, React.ElementType> = {
  HARDWARE: HardDrive,
  SOFTWARE: Shapes,
  REDE: Wifi,
  ACESSO: Lock,
  EMAIL: Mail,
  IMPRESSAO: Wrench,
  OUTRO: Wrench,
};

interface CoresStatus {
  bg: string;
  text: string;
  dot: string;
}

const COR_STATUS: Record<StatusChamado, CoresStatus> = {
  ABERTO: { bg: 'bg-blue-500/10', text: 'text-blue-300', dot: 'bg-blue-400' },
  EM_ATENDIMENTO: { bg: 'bg-amber-500/10', text: 'text-amber-300', dot: 'bg-amber-400' },
  AGUARDANDO_USUARIO: { bg: 'bg-orange-500/10', text: 'text-orange-300', dot: 'bg-orange-400' },
  RESOLVIDO: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  FECHADO: { bg: 'bg-[#2a2a2a]', text: 'text-mute', dot: 'bg-mute' },
};

const COR_PRIORIDADE: Record<PrioridadeChamado, CoresStatus> = {
  CRITICA: { bg: 'bg-red-500/10', text: 'text-red-300', dot: 'bg-red-400' },
  ALTA: { bg: 'bg-orange-500/10', text: 'text-orange-300', dot: 'bg-orange-400' },
  MEDIA: { bg: 'bg-blue-500/10', text: 'text-blue-300', dot: 'bg-blue-400' },
  BAIXA: { bg: 'bg-[#2a2a2a]', text: 'text-mute', dot: 'bg-mute' },
};

// Responsivo: 5 colunas abaixo de xl (esconde Categoria e Criado em), 7 colunas em xl+.
const GRID_COLS_CLASS =
  'grid-cols-[200px_190px_140px_minmax(220px,1fr)_40px] ' +
  'xl:grid-cols-[220px_200px_140px_140px_minmax(240px,1fr)_150px_40px]';

export function ChamadosLista() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.perfil === 'ADMIN';
  const navigate = useNavigate();
  const { abrir: abrirNovoChamado } = useNovoChamadoModal();

  const [filtro, setFiltro] = useState<ChamadoFiltro>({ page: 0, size: 10 });
  const [busca, setBusca] = useState('');
  const atualizarStatus = useAtualizarStatusDe();

  const { data, isLoading, isFetching } = useChamados(filtro);

  const totalPaginas = data?.totalPages ?? 0;
  const paginaAtual = (filtro.page ?? 0) + 1;

  function atualizarFiltro(parcial: Partial<ChamadoFiltro>) {
    setFiltro((atual) => ({ ...atual, ...parcial, page: 0 }));
  }

  // Busca com debounce — sem botão "Aplicar".
  useEffect(() => {
    const buscaAtual = filtro.busca ?? '';
    if (busca.trim() === buscaAtual) return;
    const id = setTimeout(() => {
      atualizarFiltro({ busca: busca.trim() || null });
    }, DEBOUNCE_BUSCA_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

  const linhas = useMemo(() => data?.content ?? [], [data]);
  const temFiltroAtivo =
    !!filtro.busca || !!filtro.status || !!filtro.prioridade || !!filtro.categoria;

  function exportar(formato: 'csv' | 'json') {
    if (linhas.length === 0) return;
    const dados = linhas.map((c) => ({
      id: c.id,
      titulo: c.titulo,
      solicitante: c.solicitanteNome,
      tecnico: c.tecnicoResponsavelNome ?? '',
      status: statusChamadoLabel[c.status],
      prioridade: prioridadeChamadoLabel[c.prioridade],
      categoria: categoriaChamadoLabel[c.categoria],
      criadoEm: c.criadoEm,
    }));

    const baseNome = `chamados-${new Date().toISOString().split('T')[0]}`;
    let blob: Blob;
    let nome: string;

    if (formato === 'json') {
      blob = new Blob([JSON.stringify(dados, null, 2)], {
        type: 'application/json;charset=utf-8;',
      });
      nome = `${baseNome}.json`;
    } else {
      const headers = Object.keys(dados[0]);
      const csv = [
        headers.join(','),
        ...dados.map((d) =>
          headers
            .map((h) => `"${String(d[h as keyof typeof d]).replace(/"/g, '""')}"`)
            .join(','),
        ),
      ].join('\n');
      blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      nome = `${baseNome}.csv`;
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger.container}
      className="space-y-6"
    >
      <motion.div
        variants={stagger.item}
        className="flex flex-wrap items-start justify-between gap-4"
      >
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
        <Button className="rounded-2xl" onClick={abrirNovoChamado}>
          <Plus className="h-4 w-4" />
          Novo chamado
        </Button>
      </motion.div>

      <motion.div
        variants={stagger.item}
        className="flex flex-wrap items-center gap-2"
      >
        <div className="relative min-w-[220px] flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título ou descrição"
            className="h-10 pl-10 pr-10"
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca('')}
              aria-label="Limpar busca"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mute transition-colors hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <FiltroBotao
          icone={Signal}
          label="Status"
          valor={filtro.status ?? null}
          opcoes={STATUS_OPCOES}
          onChange={(v) => atualizarFiltro({ status: v as StatusChamado | null })}
        />
        <FiltroBotao
          icone={AlertCircle}
          label="Prioridade"
          valor={filtro.prioridade ?? null}
          opcoes={PRIORIDADE_OPCOES}
          onChange={(v) => atualizarFiltro({ prioridade: v as PrioridadeChamado | null })}
        />
        <FiltroBotao
          icone={Tag}
          label="Categoria"
          valor={filtro.categoria ?? null}
          opcoes={CATEGORIA_OPCOES}
          onChange={(v) => atualizarFiltro({ categoria: v as CategoriaChamado | null })}
        />

        {temFiltroAtivo && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-2xl"
            onClick={() => {
              setBusca('');
              setFiltro({ page: 0, size: 10 });
            }}
          >
            <X className="h-3.5 w-3.5" />
            Limpar
          </Button>
        )}
      </motion.div>

      <motion.div variants={stagger.item} className="relative">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-ink">
              {data ? `${data.totalElements} chamados` : 'Resultados'}
            </h3>
            <p className="mt-1 text-xs text-mute">
              {isFetching
                ? 'atualizando…'
                : `Página ${paginaAtual} de ${Math.max(1, totalPaginas)}`}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={linhas.length === 0}
                className="rounded-2xl bg-transparent"
              >
                <Download className="h-3.5 w-3.5" />
                Exportar
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => exportar('csv')}>CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportar('json')}>JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="overflow-hidden rounded-3xl bg-[#1a1a1a]">
          {isLoading ? (
            <div className="p-6">
              <SkeletonLinhas linhas={6} />
            </div>
          ) : linhas.length === 0 ? (
            <div className="p-6">
              <EmptyState
                titulo="Nenhum chamado encontrado."
                descricao="Ajuste os filtros ou abra um novo chamado."
                acao={
                  <Button variant="outline" onClick={abrirNovoChamado}>
                    <Plus className="h-4 w-4" />
                    Novo chamado
                  </Button>
                }
              />
            </div>
          ) : (
            <div>
              <div
                className={cn(
                  'grid items-center bg-[#131313] px-4 py-3 text-xs font-medium uppercase tracking-wider text-mute/70',
                  GRID_COLS_CLASS,
                )}
              >
                <ColunaHead icon={User}>Solicitante</ColunaHead>
                <ColunaHead icon={Signal}>Status</ColunaHead>
                <ColunaHead icon={AlertCircle}>Prioridade</ColunaHead>
                <ColunaHead icon={Tag} className="hidden xl:flex">
                  Categoria
                </ColunaHead>
                <ColunaHead icon={Mail}>Título</ColunaHead>
                <ColunaHead icon={Calendar} className="hidden xl:flex">
                  Criado em
                </ColunaHead>
                <div />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`p-${filtro.page}-${filtro.busca}-${filtro.status}-${filtro.prioridade}-${filtro.categoria}`}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
                  }}
                >
                  {linhas.map((ch) => (
                    <motion.div key={ch.id} variants={rowVariants}>
                      <ChamadoLinha
                        chamado={ch}
                        isAdmin={isAdmin}
                        onOpen={() => navigate(`/chamados/${ch.id}`)}
                        onChangeStatus={(novo) =>
                          atualizarStatus.mutate(
                            { id: ch.id, status: novo },
                            {
                              onSuccess: () =>
                                toast.success(
                                  `Chamado #${ch.id} marcado como ${statusChamadoLabel[novo].toLowerCase()}.`,
                                ),
                              onError: () =>
                                toast.error('Não foi possível alterar o status.'),
                            },
                          )
                        }
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {data && data.totalElements > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#2a2a2a] px-4 py-3 text-xs text-mute">
              <span>
                Página {paginaAtual} de {Math.max(1, totalPaginas)} ·{' '}
                {data.totalElements} chamados
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.first}
                  className="bg-transparent"
                  onClick={() =>
                    setFiltro((f) => ({ ...f, page: Math.max(0, (f.page ?? 0) - 1) }))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.last}
                  className="bg-transparent"
                  onClick={() => setFiltro((f) => ({ ...f, page: (f.page ?? 0) + 1 }))}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

    </motion.div>
  );
}

// ───────────────────── Header das colunas ─────────────────────

function ColunaHead({
  icon: Icon,
  children,
  className,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 border-r border-[#2a2a2a] px-3 last:border-r-0',
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 opacity-50" />
      <span className="truncate">{children}</span>
    </div>
  );
}

// ───────────────────── Linha de chamado ─────────────────────

function ChamadoLinha({
  chamado,
  isAdmin,
  onOpen,
  onChangeStatus,
}: {
  chamado: ChamadoResponse;
  isAdmin: boolean;
  onOpen: () => void;
  onChangeStatus: (status: StatusChamado) => void;
}) {
  const Icone = ICONE_CATEGORIA[chamado.categoria] ?? Shapes;
  const corPrio = COR_PRIORIDADE[chamado.prioridade];

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        'group grid w-full cursor-pointer items-center border-b border-[#2a2a2a] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent',
        GRID_COLS_CLASS,
      )}
    >
      {/* Solicitante (pill com iniciais + nome) */}
      <div className="flex min-w-0 items-center border-r border-[#2a2a2a] px-3">
        <div className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-2xl bg-[#2a2a2a] py-1 pl-1 pr-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-[10px] font-semibold text-primary">
            {iniciaisDe(chamado.solicitanteNome)}
          </span>
          <span className="truncate text-sm text-ink">{chamado.solicitanteNome}</span>
        </div>
      </div>

      {/* Status (editável pra admin) */}
      <div className="flex items-center border-r border-[#2a2a2a] px-3">
        <StatusCell
          status={chamado.status}
          podeEditar={isAdmin}
          onChange={onChangeStatus}
        />
      </div>

      {/* Prioridade */}
      <div className="flex items-center border-r border-[#2a2a2a] px-3">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium',
            corPrio.bg,
            corPrio.text,
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-2xl', corPrio.dot)} />
          {prioridadeChamadoLabel[chamado.prioridade]}
        </span>
      </div>

      {/* Categoria */}
      <div className="hidden items-center gap-2 border-r border-[#2a2a2a] px-3 text-sm text-body xl:flex">
        <Icone className="h-4 w-4 text-mute" />
        <span className="truncate">{categoriaChamadoLabel[chamado.categoria]}</span>
      </div>

      {/* Título */}
      <div className="flex min-w-0 items-center border-r border-[#2a2a2a] px-3">
        <span className="truncate text-sm text-body">
          <span className="text-mute/70">#{chamado.id}</span> · {chamado.titulo}
        </span>
      </div>

      {/* Criado em */}
      <div className="hidden items-center border-r border-[#2a2a2a] px-3 text-xs text-mute xl:flex">
        {formatarDataHora(chamado.criadoEm)}
      </div>

      {/* Ações */}
      <div className="flex items-center justify-center">
        <span
          aria-hidden
          className="text-mute opacity-0 transition-opacity group-hover:opacity-100"
        >
          <MoreVertical className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function StatusCell({
  status,
  podeEditar,
  onChange,
}: {
  status: StatusChamado;
  podeEditar: boolean;
  onChange: (s: StatusChamado) => void;
}) {
  const cor = COR_STATUS[status];

  const badge = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium',
        cor.bg,
        cor.text,
        podeEditar && 'cursor-pointer transition-colors hover:brightness-110',
      )}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-2xl', cor.dot)} />
      {statusChamadoLabel[status]}
      {podeEditar && <ChevronDown className="h-3 w-3 shrink-0 opacity-70" />}
    </span>
  );

  if (!podeEditar) {
    return badge;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <button type="button">{badge}</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-52"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuRadioGroup
          value={status}
          onValueChange={(v) => onChange(v as StatusChamado)}
        >
          {STATUS_OPCOES.map((o) => {
            const c = COR_STATUS[o.valor];
            return (
              <DropdownMenuRadioItem key={o.valor} value={o.valor}>
                <span className={cn('mr-2 h-1.5 w-1.5 rounded-2xl', c.dot)} />
                {o.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ───────────────────── Filtro Dropdown (compacto) ─────────────────────

function FiltroBotao<T extends string>({
  icone: Icone,
  label,
  valor,
  opcoes,
  onChange,
}: {
  icone: React.ElementType;
  label: string;
  valor: T | null;
  opcoes: { valor: T; label: string }[];
  onChange: (v: T | null) => void;
}) {
  const ativo = valor != null;
  const labelAtivo = ativo ? opcoes.find((o) => o.valor === valor)?.label : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-10 gap-2 rounded-2xl bg-transparent text-body',
            ativo && 'border-primary/40 bg-primary/10 text-ink',
          )}
        >
          <Icone className="h-3.5 w-3.5" />
          <span>{label}</span>
          {labelAtivo && (
            <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              {labelAtivo}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuRadioGroup
          value={valor ?? ANY}
          onValueChange={(v) => onChange(v === ANY ? null : (v as T))}
        >
          <DropdownMenuRadioItem value={ANY}>Todos</DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          {opcoes.map((o) => (
            <DropdownMenuRadioItem key={o.valor} value={o.valor}>
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
