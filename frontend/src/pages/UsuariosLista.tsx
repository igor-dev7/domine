import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Shield,
  Signal,
  User,
  UserX,
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
import { useAuth } from '@/contexts/AuthContext';
import { useNovoUsuarioModal } from '@/contexts/NovoUsuarioModalContext';
import {
  useDesativarUsuario,
  useUsuarios,
  type UsuarioFiltro,
} from '@/lib/usuarios';
import { iniciaisDe } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PerfilUsuario, UsuarioResponse } from '@/types';

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

const PERFIL_OPCOES: { valor: PerfilUsuario; label: string }[] = [
  { valor: 'ADMIN', label: 'Administrador' },
  { valor: 'COMUM', label: 'Comum' },
];

const SITUACAO_OPCOES: { valor: 'ATIVO' | 'INATIVO'; label: string }[] = [
  { valor: 'ATIVO', label: 'Ativo' },
  { valor: 'INATIVO', label: 'Inativo' },
];

// 5 colunas em telas pequenas; 6 em xl (adiciona Departamento).
const GRID_COLS =
  'grid-cols-[68px_minmax(240px,1fr)_160px_140px_40px] ' +
  'xl:grid-cols-[68px_minmax(240px,1fr)_minmax(220px,1.2fr)_180px_160px_40px]';

export function UsuariosLista() {
  const navigate = useNavigate();
  const { usuario: logado } = useAuth();
  const { abrir: abrirNovo } = useNovoUsuarioModal();

  const [filtro, setFiltro] = useState<UsuarioFiltro>({ page: 0, size: 10 });
  const [busca, setBusca] = useState('');
  const [paraDesativar, setParaDesativar] = useState<UsuarioResponse | null>(null);

  const { data, isLoading, isFetching } = useUsuarios(filtro);
  const desativar = useDesativarUsuario();

  function aplicarFiltro(parcial: Partial<UsuarioFiltro>) {
    setFiltro((atual) => ({ ...atual, ...parcial, page: 0 }));
  }

  useEffect(() => {
    const buscaAtual = filtro.nome ?? '';
    if (busca.trim() === buscaAtual) return;
    const id = setTimeout(() => {
      aplicarFiltro({ nome: busca.trim() || null });
    }, DEBOUNCE_BUSCA_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

  async function confirmarDesativacao() {
    if (!paraDesativar) return;
    try {
      await desativar.mutateAsync(paraDesativar.id);
      toast.success(`${paraDesativar.nome} desativado.`);
      setParaDesativar(null);
    } catch (err) {
      const ax = err as AxiosError<{ mensagens?: string[] }>;
      toast.error(ax.response?.data?.mensagens?.[0] ?? 'Erro ao desativar usuário.');
    }
  }

  const linhas = useMemo(() => data?.content ?? [], [data]);
  const totalPaginas = data?.totalPages ?? 0;
  const paginaAtual = (filtro.page ?? 0) + 1;
  const temFiltroAtivo = !!filtro.nome || !!filtro.perfil || filtro.ativo != null;

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
            Usuários
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">
            Gestão de usuários
          </h1>
          <p className="mt-1 text-sm text-body">
            Cadastre administradores e usuários comuns. A desativação preserva o histórico.
          </p>
        </div>
        <Button className="rounded-2xl" onClick={abrirNovo}>
          <Plus className="h-4 w-4" />
          Novo usuário
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
            placeholder="Buscar por nome ou e-mail"
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
          icone={Shield}
          label="Perfil"
          valor={filtro.perfil ?? null}
          opcoes={PERFIL_OPCOES}
          onChange={(v) => aplicarFiltro({ perfil: v as PerfilUsuario | null })}
        />
        <FiltroBotao
          icone={Signal}
          label="Situação"
          valor={filtro.ativo == null ? null : filtro.ativo ? 'ATIVO' : 'INATIVO'}
          opcoes={SITUACAO_OPCOES}
          onChange={(v) =>
            aplicarFiltro({ ativo: v === 'ATIVO' ? true : v === 'INATIVO' ? false : null })
          }
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
              {data ? `${data.totalElements} usuários` : 'Resultados'}
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
                titulo="Nenhum usuário encontrado."
                descricao="Ajuste os filtros ou cadastre um novo usuário."
                acao={
                  <Button variant="outline" onClick={abrirNovo}>
                    <Plus className="h-4 w-4" />
                    Novo usuário
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
                <ColunaHead icon={User}>Nome / E-mail</ColunaHead>
                <ColunaHead icon={Mail} className="hidden xl:flex">
                  Departamento
                </ColunaHead>
                <ColunaHead icon={Shield}>Perfil</ColunaHead>
                <ColunaHead icon={Signal}>Situação</ColunaHead>
                <div />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${filtro.page}-${filtro.nome}-${filtro.perfil}-${filtro.ativo}`}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
                  }}
                >
                  {linhas.map((u) => (
                    <motion.div key={u.id} variants={rowVariants}>
                      <LinhaUsuario
                        u={u}
                        ehVoce={u.id === logado?.id}
                        onEditar={() => navigate(`/usuarios/${u.id}/editar`)}
                        onDesativar={() => setParaDesativar(u)}
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
                Página {paginaAtual} de {Math.max(1, totalPaginas)} · {data.totalElements} usuários
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
        open={!!paraDesativar}
        onOpenChange={(o) => !o && setParaDesativar(null)}
        titulo={`Desativar ${paraDesativar?.nome ?? ''}?`}
        descricao="Usuários desativados perdem acesso ao login, mas o histórico de chamados e equipamentos é preservado."
        textoConfirmar="Desativar"
        destrutivo
        carregando={desativar.isPending}
        onConfirmar={confirmarDesativacao}
      />
    </motion.div>
  );
}

function AvatarUsuario({ nome, perfil }: { nome: string; perfil: PerfilUsuario }) {
  return (
    <div
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
        perfil === 'ADMIN'
          ? 'bg-primary/20 text-primary ring-2 ring-primary/30'
          : 'bg-primary/15 text-primary',
      )}
      aria-label={nome}
    >
      {iniciaisDe(nome)}
    </div>
  );
}

function LinhaUsuario({
  u,
  ehVoce,
  onEditar,
  onDesativar,
}: {
  u: UsuarioResponse;
  ehVoce: boolean;
  onEditar: () => void;
  onDesativar: () => void;
}) {
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={onEditar}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEditar();
        }
      }}
      className={cn(
        'group grid w-full cursor-pointer items-center border-b border-[#2a2a2a] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent',
        !u.ativo && 'opacity-60',
        GRID_COLS,
      )}
    >
      <div className="flex items-center justify-center border-r border-[#2a2a2a] px-2">
        <AvatarUsuario nome={u.nome} perfil={u.perfil} />
      </div>

      <div className="min-w-0 border-r border-[#2a2a2a] px-3">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-ink">{u.nome}</p>
          {ehVoce && (
            <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Você
            </span>
          )}
        </div>
        <p className="truncate text-xs text-mute">{u.email}</p>
      </div>

      <div className="hidden items-center gap-2 border-r border-[#2a2a2a] px-3 text-sm text-body xl:flex">
        {u.departamento ? (
          <>
            <Building2 className="h-3.5 w-3.5 text-mute" />
            <span className="truncate">{u.departamento}</span>
          </>
        ) : (
          <span className="text-mute">—</span>
        )}
      </div>

      <div className="flex items-center border-r border-[#2a2a2a] px-3">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wider',
            u.perfil === 'ADMIN' ? 'bg-primary/15 text-primary' : 'bg-[#2a2a2a] text-body',
          )}
        >
          {u.perfil === 'ADMIN' && <Shield className="h-3 w-3" />}
          {u.perfil === 'ADMIN' ? 'Admin' : 'Comum'}
        </span>
      </div>

      <div className="flex items-center border-r border-[#2a2a2a] px-3">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium',
            u.ativo ? 'bg-emerald-500/10 text-emerald-300' : 'bg-[#2a2a2a] text-mute',
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 shrink-0 rounded-full',
              u.ativo ? 'bg-emerald-400' : 'bg-mute',
            )}
          />
          {u.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

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
            <DropdownMenuItem onClick={onEditar}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDesativar}
              disabled={!u.ativo || ehVoce}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <UserX className="h-3.5 w-3.5" />
              Desativar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

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
