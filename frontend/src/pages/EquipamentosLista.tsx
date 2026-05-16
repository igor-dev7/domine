import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Printer,
  Search,
  Shapes,
  Signal,
  Smartphone,
  Tag,
  Trash2,
  User,
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
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useNovoEquipamentoModal } from '@/contexts/NovoEquipamentoModalContext';
import { useEquipamentoSheet } from '@/contexts/EquipamentoSheetContext';
import {
  useAtualizarResponsavelEquipamento,
  useAtualizarStatusEquipamento,
  useEquipamentos,
  useExcluirEquipamento,
  type EquipamentoFiltro,
} from '@/lib/equipamentos';
import { useUsuariosLista } from '@/lib/usuarios';
import { fotoDoEquipamento } from '@/lib/fotoEquipamento';
import {
  iniciaisDe,
  statusEquipamentoLabel,
  tipoEquipamentoLabel,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import type {
  EquipamentoResponse,
  StatusEquipamento,
  TipoEquipamento,
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

interface CoresStatus {
  bg: string;
  text: string;
  dot: string;
}

const COR_STATUS: Record<StatusEquipamento, CoresStatus> = {
  EM_USO: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  ESTOQUE: { bg: 'bg-blue-500/10', text: 'text-blue-300', dot: 'bg-blue-400' },
  MANUTENCAO: { bg: 'bg-amber-500/10', text: 'text-amber-300', dot: 'bg-amber-400' },
  BAIXADO: { bg: 'bg-[#2a2a2a]', text: 'text-mute', dot: 'bg-mute' },
};

const ICONE_TIPO: Record<TipoEquipamento, React.ElementType> = {
  NOTEBOOK: HardDrive,
  DESKTOP: HardDrive,
  MONITOR: HardDrive,
  IMPRESSORA: Printer,
  CELULAR: Smartphone,
  PERIFERICO: Wrench,
  OUTRO: Shapes,
};

// 7 colunas: Foto | Patrimônio | Tipo | Marca/Modelo | Status | Responsável | Localização | ⋮
const GRID_COLS =
  'grid-cols-[68px_150px_140px_minmax(200px,1fr)_180px_40px] ' +
  'xl:grid-cols-[68px_150px_140px_minmax(220px,1fr)_180px_180px_180px_40px]';

export function EquipamentosLista() {
  const { abrir: abrirNovoEquipamento } = useNovoEquipamentoModal();
  const { abrir: abrirSheet } = useEquipamentoSheet();

  const [filtro, setFiltro] = useState<EquipamentoFiltro>({ page: 0, size: 10 });
  const [busca, setBusca] = useState('');
  const [paraExcluir, setParaExcluir] = useState<EquipamentoResponse | null>(null);

  const { data, isLoading, isFetching } = useEquipamentos(filtro);
  const { data: usuarios } = useUsuariosLista();
  const excluir = useExcluirEquipamento();
  const atualizarStatus = useAtualizarStatusEquipamento();
  const atualizarResponsavel = useAtualizarResponsavelEquipamento();

  function aplicarFiltro(parcial: Partial<EquipamentoFiltro>) {
    setFiltro((atual) => ({ ...atual, ...parcial, page: 0 }));
  }

  // Busca com debounce.
  useEffect(() => {
    const buscaAtual = filtro.busca ?? '';
    if (busca.trim() === buscaAtual) return;
    const id = setTimeout(() => {
      aplicarFiltro({ busca: busca.trim() || null });
    }, DEBOUNCE_BUSCA_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

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

  const linhas = useMemo(() => data?.content ?? [], [data]);
  const totalPaginas = data?.totalPages ?? 0;
  const paginaAtual = (filtro.page ?? 0) + 1;
  const temFiltroAtivo = !!filtro.busca || !!filtro.tipo || !!filtro.status;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger.container}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={stagger.item}
        className="flex flex-wrap items-start justify-between gap-4"
      >
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
        <Button className="rounded-2xl" onClick={abrirNovoEquipamento}>
          <Plus className="h-4 w-4" />
          Novo equipamento
        </Button>
      </motion.div>

      {/* Toolbar inline */}
      <motion.div
        variants={stagger.item}
        className="flex flex-wrap items-center gap-2"
      >
        <div className="relative min-w-[220px] flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por patrimônio, marca ou modelo"
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
          icone={Tag}
          label="Tipo"
          valor={filtro.tipo ?? null}
          opcoes={TIPO_OPCOES}
          onChange={(v) => aplicarFiltro({ tipo: v as TipoEquipamento | null })}
        />
        <FiltroBotao
          icone={Signal}
          label="Status"
          valor={filtro.status ?? null}
          opcoes={STATUS_OPCOES}
          onChange={(v) => aplicarFiltro({ status: v as StatusEquipamento | null })}
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

      {/* Tabela */}
      <motion.div variants={stagger.item} className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-ink">
              {data ? `${data.totalElements} equipamentos` : 'Resultados'}
            </h3>
            <p className="mt-1 text-xs text-mute">
              {isFetching
                ? 'atualizando…'
                : `Página ${paginaAtual} de ${Math.max(1, totalPaginas)}`}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-[#1a1a1a]">
          {isLoading ? (
            <div className="p-6">
              <SkeletonLinhas linhas={6} />
            </div>
          ) : linhas.length === 0 ? (
            <div className="p-6">
              <EmptyState
                titulo="Nenhum equipamento encontrado."
                descricao="Ajuste os filtros ou cadastre um novo equipamento."
                acao={
                  <Button variant="outline" onClick={abrirNovoEquipamento}>
                    <Plus className="h-4 w-4" />
                    Novo equipamento
                  </Button>
                }
              />
            </div>
          ) : (
            <div>
              <div
                className={cn(
                  'grid items-center bg-[#131313] px-4 py-3 text-xs font-medium uppercase tracking-wider text-mute/70',
                  GRID_COLS,
                )}
              >
                <div className="border-r border-[#2a2a2a] px-3" />
                <ColunaHead icon={Tag}>Patrimônio</ColunaHead>
                <ColunaHead icon={HardDrive}>Tipo</ColunaHead>
                <ColunaHead icon={Shapes}>Marca / Modelo</ColunaHead>
                <ColunaHead icon={Signal}>Status</ColunaHead>
                <ColunaHead icon={User} className="hidden xl:flex">
                  Responsável
                </ColunaHead>
                <ColunaHead icon={MapPin} className="hidden xl:flex">
                  Localização
                </ColunaHead>
                <div />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${filtro.page}-${filtro.busca}-${filtro.tipo}-${filtro.status}`}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
                  }}
                >
                  {linhas.map((eq) => (
                    <motion.div key={eq.id} variants={rowVariants}>
                      <LinhaEquipamento
                        eq={eq}
                        usuariosAtivos={usuarios?.filter((u) => u.ativo) ?? []}
                        onAbrir={() => abrirSheet(eq.id)}
                        onDarBaixa={() => setParaExcluir(eq)}
                        onTrocarStatus={(s) =>
                          atualizarStatus.mutate(
                            { id: eq.id, status: s },
                            {
                              onSuccess: () =>
                                toast.success(
                                  `${eq.patrimonio}: ${statusEquipamentoLabel[s].toLowerCase()}.`,
                                ),
                              onError: () => toast.error('Não foi possível alterar o status.'),
                            },
                          )
                        }
                        onTrocarResponsavel={(rid) =>
                          atualizarResponsavel.mutate(
                            { id: eq.id, responsavelId: rid },
                            {
                              onSuccess: () =>
                                toast.success(
                                  rid == null
                                    ? `${eq.patrimonio}: responsável removido.`
                                    : `${eq.patrimonio}: responsável atualizado.`,
                                ),
                              onError: () => toast.error('Não foi possível trocar o responsável.'),
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
                Página {paginaAtual} de {Math.max(1, totalPaginas)} · {data.totalElements}{' '}
                equipamentos
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.first}
                  className="rounded-2xl bg-transparent"
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
                  className="rounded-2xl bg-transparent"
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

      <ConfirmDialog
        open={!!paraExcluir}
        onOpenChange={(o) => !o && setParaExcluir(null)}
        titulo={`Dar baixa em ${paraExcluir?.patrimonio ?? ''}?`}
        descricao="O equipamento ficará com status BAIXADO e perderá o responsável atribuído."
        textoConfirmar="Dar baixa"
        destrutivo
        carregando={excluir.isPending}
        onConfirmar={confirmarExclusao}
      />
    </motion.div>
  );
}

// ─────────────────────── Foto thumb ───────────────────────

function FotoEquipamento({ eq }: { eq: EquipamentoResponse }) {
  const [erro, setErro] = useState(false);
  const url = fotoDoEquipamento({ tipo: eq.tipo, marca: eq.marca, modelo: eq.modelo });
  const Icone = ICONE_TIPO[eq.tipo] ?? HardDrive;

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center">
      {url && !erro ? (
        <img
          src={url}
          alt={`${eq.marca} ${eq.modelo}`}
          loading="lazy"
          onError={() => setErro(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <Icone className="h-6 w-6 text-mute" strokeWidth={1.5} />
      )}
    </div>
  );
}

// ─────────────────────── Linha ───────────────────────

function LinhaEquipamento({
  eq,
  usuariosAtivos,
  onAbrir,
  onDarBaixa,
  onTrocarStatus,
  onTrocarResponsavel,
}: {
  eq: EquipamentoResponse;
  usuariosAtivos: { id: number; nome: string }[];
  onAbrir: () => void;
  onDarBaixa: () => void;
  onTrocarStatus: (s: StatusEquipamento) => void;
  onTrocarResponsavel: (id: number | null) => void;
}) {
  const IconeTipo = ICONE_TIPO[eq.tipo] ?? HardDrive;
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={onAbrir}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onAbrir();
        }
      }}
      className={cn(
        'group grid w-full cursor-pointer items-center border-b border-[#2a2a2a] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent',
        GRID_COLS,
      )}
    >
      {/* Foto */}
      <div className="flex items-center border-r border-[#2a2a2a] px-2">
        <FotoEquipamento eq={eq} />
      </div>

      {/* Patrimônio */}
      <div className="flex items-center border-r border-[#2a2a2a] px-3 font-mono text-xs text-ink">
        {eq.patrimonio}
      </div>

      {/* Tipo */}
      <div className="flex items-center gap-2 border-r border-[#2a2a2a] px-3 text-sm text-body">
        <IconeTipo className="h-4 w-4 text-mute" />
        <span className="truncate">{tipoEquipamentoLabel[eq.tipo]}</span>
      </div>

      {/* Marca / Modelo */}
      <div className="min-w-0 border-r border-[#2a2a2a] px-3">
        <p className="truncate text-sm font-medium text-ink">{eq.marca}</p>
        <p className="truncate text-xs text-mute">{eq.modelo}</p>
      </div>

      {/* Status (editável inline) */}
      <div className="flex items-center border-r border-[#2a2a2a] px-3">
        <StatusCellEditavel status={eq.status} onChange={onTrocarStatus} />
      </div>

      {/* Responsável (xl+, editável inline) */}
      <div className="hidden items-center border-r border-[#2a2a2a] px-3 text-sm text-body xl:flex">
        <ResponsavelCellEditavel
          nome={eq.responsavelNome ?? null}
          usuarios={usuariosAtivos}
          onChange={onTrocarResponsavel}
        />
      </div>

      {/* Localização (xl+) */}
      <div className="hidden items-center border-r border-[#2a2a2a] px-3 text-sm text-body xl:flex">
        {eq.localizacao ?? <span className="text-mute">—</span>}
      </div>

      {/* Ações */}
      <div className="flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label="Ações"
              className="text-mute opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(e) => e.stopPropagation()}
            className="w-44"
          >
            <DropdownMenuItem onClick={onAbrir}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDarBaixa}
              disabled={eq.status === 'BAIXADO'}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Dar baixa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function StatusCellEditavel({
  status,
  onChange,
}: {
  status: StatusEquipamento;
  onChange: (s: StatusEquipamento) => void;
}) {
  const cor = COR_STATUS[status];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button type="button">
          <span
            className={cn(
              'inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium transition-colors hover:brightness-110',
              cor.bg,
              cor.text,
            )}
          >
            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', cor.dot)} />
            {statusEquipamentoLabel[status]}
            <ChevronDown className="h-3 w-3 shrink-0 opacity-70" />
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-48"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuRadioGroup
          value={status}
          onValueChange={(v) => onChange(v as StatusEquipamento)}
        >
          {STATUS_OPCOES.map((o) => {
            const c = COR_STATUS[o.valor];
            return (
              <DropdownMenuRadioItem key={o.valor} value={o.valor}>
                <span className={cn('mr-2 h-1.5 w-1.5 rounded-full', c.dot)} />
                {o.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ResponsavelCellEditavel({
  nome,
  usuarios,
  onChange,
}: {
  nome: string | null;
  usuarios: { id: number; nome: string }[];
  onChange: (id: number | null) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="group/r flex min-w-0 cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-sm text-body transition-colors hover:bg-[#2a2a2a]"
        >
          {nome ? (
            <>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                {iniciaisDe(nome)}
              </span>
              <span className="truncate">{nome}</span>
            </>
          ) : (
            <span className="text-mute">Sem responsável</span>
          )}
          <ChevronDown className="h-3 w-3 shrink-0 text-mute opacity-0 transition-opacity group-hover/r:opacity-100" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-60"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem onClick={() => onChange(null)}>
          <span className="text-mute">Sem responsável</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {usuarios.map((u) => (
          <DropdownMenuItem key={u.id} onClick={() => onChange(u.id)}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
              {iniciaisDe(u.nome)}
            </span>
            {u.nome}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─────────────────────── Helpers ───────────────────────

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
