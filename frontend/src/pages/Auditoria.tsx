import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  UserCog,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/EmptyState';
import { formatarDataHora, iniciaisDe } from '@/lib/format';
import { cn } from '@/lib/utils';

const SIDEBAR_EASE = [0.16, 1, 0.3, 1] as const;
const ANY = '__ALL__';
const DEBOUNCE_BUSCA_MS = 300;
const PAGE_SIZE = 8;

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
  innerContainer: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  },
};

const eventVariants = {
  hidden: { opacity: 0, x: 12, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 400, damping: 28 },
  },
};

// ─────────────────────────── Tipos ───────────────────────────

type TipoEvento =
  | 'login'
  | 'logout'
  | 'criou'
  | 'editou'
  | 'excluiu'
  | 'permissao'
  | 'seguranca';

interface EventoAuditoria {
  id: number;
  tipo: TipoEvento;
  recurso: string;
  usuario: string;
  descricao: string;
  ip: string;
  criadoEm: string;
}

interface MetaTipo {
  label: string;
  icon: React.ElementType;
  /** Classes para a badge (fundo + texto) */
  cor: string;
  /** Cor sólida do dot da timeline */
  dot: string;
}

const META: Record<TipoEvento, MetaTipo> = {
  login: {
    label: 'Login',
    icon: LogIn,
    cor: 'bg-emerald-500/15 text-emerald-300',
    dot: 'bg-emerald-400',
  },
  logout: {
    label: 'Logout',
    icon: LogOut,
    cor: 'bg-[#2a2a2a] text-mute',
    dot: 'bg-mute',
  },
  criou: {
    label: 'Criação',
    icon: Plus,
    cor: 'bg-blue-500/15 text-blue-300',
    dot: 'bg-blue-400',
  },
  editou: {
    label: 'Edição',
    icon: Pencil,
    cor: 'bg-amber-500/15 text-amber-300',
    dot: 'bg-amber-400',
  },
  excluiu: {
    label: 'Exclusão',
    icon: Trash2,
    cor: 'bg-destructive/20 text-red-300',
    dot: 'bg-red-400',
  },
  permissao: {
    label: 'Permissão',
    icon: UserCog,
    cor: 'bg-orange-500/15 text-orange-300',
    dot: 'bg-orange-400',
  },
  seguranca: {
    label: 'Segurança',
    icon: ShieldAlert,
    cor: 'bg-destructive/25 text-red-300',
    dot: 'bg-red-400',
  },
};

// ─────────────────────────── Mock ───────────────────────────

const EVENTOS: EventoAuditoria[] = [
  {
    id: 1,
    tipo: 'login',
    recurso: 'Autenticação',
    usuario: 'admin@domine.com.br',
    descricao: 'Login bem-sucedido',
    ip: '192.168.0.12',
    criadoEm: '2026-05-16T19:24:11',
  },
  {
    id: 2,
    tipo: 'criou',
    recurso: 'Chamado #42',
    usuario: 'marina@domine.com.br',
    descricao: 'Novo chamado "Notebook não conecta no Wi-Fi"',
    ip: '192.168.0.45',
    criadoEm: '2026-05-16T18:51:02',
  },
  {
    id: 3,
    tipo: 'editou',
    recurso: 'Chamado #42',
    usuario: 'admin@domine.com.br',
    descricao: 'Status alterado de ABERTO para EM_ATENDIMENTO',
    ip: '192.168.0.12',
    criadoEm: '2026-05-16T18:55:34',
  },
  {
    id: 4,
    tipo: 'permissao',
    recurso: 'Usuário #5',
    usuario: 'admin@domine.com.br',
    descricao: 'Perfil de "carlos" elevado de COMUM para ADMIN',
    ip: '192.168.0.12',
    criadoEm: '2026-05-16T17:12:09',
  },
  {
    id: 5,
    tipo: 'criou',
    recurso: 'Equipamento PAT-0089',
    usuario: 'admin@domine.com.br',
    descricao: 'Novo notebook cadastrado e atribuído a "joao"',
    ip: '192.168.0.12',
    criadoEm: '2026-05-16T16:30:55',
  },
  {
    id: 6,
    tipo: 'seguranca',
    recurso: 'Autenticação',
    usuario: 'desconhecido',
    descricao: '5 tentativas de login falhadas para "admin@domine.com.br"',
    ip: '203.0.113.42',
    criadoEm: '2026-05-16T15:48:22',
  },
  {
    id: 7,
    tipo: 'excluiu',
    recurso: 'Usuário #11',
    usuario: 'admin@domine.com.br',
    descricao: 'Desativação de "estagiario.contrato@domine.com.br"',
    ip: '192.168.0.12',
    criadoEm: '2026-05-16T14:02:18',
  },
  {
    id: 8,
    tipo: 'editou',
    recurso: 'Chamado #38',
    usuario: 'admin@domine.com.br',
    descricao: 'Técnico responsável definido como "Admin Domine"',
    ip: '192.168.0.12',
    criadoEm: '2026-05-15T11:14:50',
  },
  {
    id: 9,
    tipo: 'login',
    recurso: 'Autenticação',
    usuario: 'marina@domine.com.br',
    descricao: 'Login bem-sucedido',
    ip: '192.168.0.45',
    criadoEm: '2026-05-15T08:45:03',
  },
  {
    id: 10,
    tipo: 'logout',
    recurso: 'Autenticação',
    usuario: 'admin@domine.com.br',
    descricao: 'Sessão encerrada após 4h sem atividade',
    ip: '192.168.0.12',
    criadoEm: '2026-05-14T22:01:30',
  },
  {
    id: 11,
    tipo: 'editou',
    recurso: 'Equipamento PAT-0017',
    usuario: 'admin@domine.com.br',
    descricao: 'Responsável alterado de Marina Silva para Carlos Souza',
    ip: '192.168.0.12',
    criadoEm: '2026-05-14T15:22:11',
  },
  {
    id: 12,
    tipo: 'criou',
    recurso: 'Usuário #12',
    usuario: 'admin@domine.com.br',
    descricao: 'Conta criada para "lucas.estagio@domine.com.br" como COMUM',
    ip: '192.168.0.12',
    criadoEm: '2026-05-14T10:08:42',
  },
];

const TIPO_OPCOES: { valor: TipoEvento; label: string }[] = (
  Object.entries(META) as [TipoEvento, MetaTipo][]
).map(([valor, m]) => ({ valor, label: m.label }));

// ─────────────────────────── Página ───────────────────────────

export function Auditoria() {
  const [tipo, setTipo] = useState<TipoEvento | null>(null);
  const [busca, setBusca] = useState('');
  const [buscaDebounced, setBuscaDebounced] = useState('');
  const [pagina, setPagina] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setBuscaDebounced(busca.trim()), DEBOUNCE_BUSCA_MS);
    return () => clearTimeout(id);
  }, [busca]);

  useEffect(() => {
    setPagina(0);
  }, [tipo, buscaDebounced]);

  const filtrados = useMemo(() => {
    const buscaLower = buscaDebounced.toLowerCase();
    return EVENTOS.filter((e) => {
      const passaTipo = tipo == null || e.tipo === tipo;
      const passaBusca =
        !buscaLower ||
        e.recurso.toLowerCase().includes(buscaLower) ||
        e.usuario.toLowerCase().includes(buscaLower) ||
        e.descricao.toLowerCase().includes(buscaLower) ||
        e.ip.includes(buscaLower);
      return passaTipo && passaBusca;
    });
  }, [tipo, buscaDebounced]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const linhas = filtrados.slice(pagina * PAGE_SIZE, (pagina + 1) * PAGE_SIZE);
  const temFiltroAtivo = !!buscaDebounced || tipo != null;

  // ── KPIs ──
  const total = EVENTOS.length;
  const hoje = new Date().toISOString().slice(0, 10);
  const eventosHoje = EVENTOS.filter((e) => e.criadoEm.startsWith(hoje)).length;
  const alertasSeguranca = EVENTOS.filter((e) => e.tipo === 'seguranca').length;
  const acoesAdmin = EVENTOS.filter((e) =>
    ['criou', 'editou', 'excluiu', 'permissao'].includes(e.tipo),
  ).length;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger.container}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={stagger.item}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Insights
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">Auditoria</h1>
        <p className="mt-2 max-w-3xl text-sm text-body">
          Trilha consolidada de eventos do sistema — login, alterações, criações, exclusões e
          alertas de segurança. Útil pra conformidade, troubleshooting e investigação de
          incidentes.
        </p>
      </motion.div>

      {/* KPIs */}
      <motion.div
        variants={stagger.innerContainer}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard
          icon={Activity}
          label="Eventos no período"
          valor={total}
          hint="totais auditados"
        />
        <KpiCard
          icon={LogIn}
          label="Eventos hoje"
          valor={eventosHoje}
          hint={`em ${formatarHoje()}`}
        />
        <KpiCard
          icon={Shield}
          label="Ações administrativas"
          valor={acoesAdmin}
          hint="criar / editar / excluir / permissão"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Alertas de segurança"
          valor={alertasSeguranca}
          hint={alertasSeguranca > 0 ? 'requer atenção' : 'tudo limpo'}
          alerta={alertasSeguranca > 0}
        />
      </motion.div>

      {/* Toolbar inline */}
      <motion.div variants={stagger.item} className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por recurso, usuário, descrição ou IP"
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
          icone={Activity}
          label="Tipo"
          valor={tipo}
          opcoes={TIPO_OPCOES}
          onChange={(v) => setTipo(v)}
        />

        {temFiltroAtivo && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-2xl"
            onClick={() => {
              setBusca('');
              setTipo(null);
            }}
          >
            <X className="h-3.5 w-3.5" />
            Limpar
          </Button>
        )}
      </motion.div>

      {/* Timeline */}
      <motion.div variants={stagger.item} className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-ink">
              {filtrados.length} {filtrados.length === 1 ? 'evento' : 'eventos'}
            </h3>
            <p className="mt-1 text-xs text-mute">
              Página {pagina + 1} de {totalPaginas}
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-[#1a1a1a] p-6">
          {linhas.length === 0 ? (
            <EmptyState
              titulo="Nenhum evento encontrado."
              descricao="Ajuste os filtros ou amplie o período."
            />
          ) : (
            <AnimatePresence mode="wait">
              <motion.ol
                key={`${pagina}-${tipo}-${buscaDebounced}`}
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                className="relative space-y-3 pl-7 before:absolute before:bottom-3 before:left-[13px] before:top-3 before:w-px before:bg-[#2a2a2a]"
              >
                {linhas.map((ev) => (
                  <motion.li key={ev.id} variants={eventVariants}>
                    <EventoCard ev={ev} />
                  </motion.li>
                ))}
              </motion.ol>
            </AnimatePresence>
          )}

          {filtrados.length > PAGE_SIZE && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#2a2a2a] pt-4 text-xs text-mute">
              <span>
                Mostrando {pagina * PAGE_SIZE + 1}–
                {Math.min((pagina + 1) * PAGE_SIZE, filtrados.length)} de {filtrados.length}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-2xl bg-transparent"
                  disabled={pagina === 0}
                  onClick={() => setPagina((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-2xl bg-transparent"
                  disabled={pagina >= totalPaginas - 1}
                  onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
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

// ─────────────────────────── KPI ───────────────────────────

function KpiCard({
  icon: Icon,
  label,
  valor,
  hint,
  alerta,
}: {
  icon: React.ElementType;
  label: string;
  valor: number;
  hint: string;
  alerta?: boolean;
}) {
  return (
    <motion.div
      variants={stagger.item}
      className={cn(
        'relative overflow-hidden rounded-3xl p-5',
        alerta
          ? 'bg-gradient-to-br from-destructive/15 via-[#1a1a1a] to-[#1a1a1a]'
          : 'bg-gradient-to-br from-primary/10 via-[#1a1a1a] to-[#1a1a1a]',
      )}
    >
      <span
        className={cn(
          'absolute inset-y-5 left-0 w-0.5 rounded-full',
          alerta ? 'bg-red-400' : 'bg-primary',
        )}
        aria-hidden
      />
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl',
            alerta ? 'bg-destructive/15 text-red-300' : 'bg-primary/15 text-primary',
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mute">{label}</p>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-ink-strong tabular-nums">
        {valor}
      </p>
      <p className="mt-1 text-xs text-mute">{hint}</p>
    </motion.div>
  );
}

// ─────────────────────────── Card de evento ───────────────────────────

function EventoCard({ ev }: { ev: EventoAuditoria }) {
  const meta = META[ev.tipo];
  const Icon = meta.icon;

  return (
    <div className="group relative">
      {/* Dot da timeline */}
      <span
        className={cn(
          'absolute -left-[26px] top-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-[#1a1a1a]',
          meta.cor,
        )}
      >
        <Icon className="h-3 w-3" />
      </span>

      {/* Card */}
      <div className="rounded-2xl bg-[#131313] px-4 py-3 transition-colors group-hover:bg-gradient-to-r group-hover:from-primary/10 group-hover:to-transparent">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {iniciaisDe(nomeDoEmail(ev.usuario))}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                  meta.cor,
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
                {meta.label}
              </span>
              <span className="text-xs text-mute">{ev.recurso}</span>
            </div>
            <p className="mt-1.5 text-sm text-ink">{ev.descricao}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-mute">
              <span>{ev.usuario}</span>
              <span>·</span>
              <span className="font-mono">{ev.ip}</span>
              <span>·</span>
              <span>{formatarDataHora(ev.criadoEm)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Filtro Dropdown ───────────────────────────

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

// ─────────────────────────── Helpers ───────────────────────────

function nomeDoEmail(email: string): string {
  if (!email.includes('@')) return email;
  const [local] = email.split('@');
  return local
    .split(/[.\-_]/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() + p.slice(1))
    .join(' ');
}

function formatarHoje(): string {
  return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
