import { useMemo, useState, type ElementType } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useNovoChamadoModal } from '@/contexts/NovoChamadoModalContext';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  HardDrive,
  Layers,
  Lock,
  Mail,
  Monitor,
  Plus,
  Printer,
  Shapes,
  Smartphone,
  Ticket,
  Wifi,
  Wrench,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChamadoDetalheModal } from '@/components/ChamadoDetalheModal';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonLinhas } from '@/components/LoadingSkeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { PrioridadeBadge } from '@/components/PrioridadeBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useChamados, useDashboard } from '@/lib/chamados';
import { useEquipamentosLista } from '@/lib/equipamentos';
import { fotoDoEquipamento } from '@/lib/fotoEquipamento';
import {
  categoriaChamadoLabel,
  formatarDataHora,
  iniciaisDe,
  tipoEquipamentoLabel,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import type {
  CategoriaChamado,
  ChamadoResponse,
  StatusChamado,
  TipoEquipamento,
} from '@/types';

export function Dashboard() {
  const { usuario } = useAuth();
  if (!usuario) return null;

  return usuario.perfil === 'ADMIN' ? (
    <DashboardAdmin />
  ) : (
    <DashboardComum nome={usuario.nome} />
  );
}

// ─────────────────────── Stagger compartilhado ───────────────────────

// Mesma vibe da entrada da sidebar: blur + translate Y + ease-out longo
// (keyframe `element-in` em index.css).
const SIDEBAR_EASE = [0.16, 1, 0.3, 1] as const;

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

// ─────────────────────────────── ADMIN ───────────────────────────────

function DashboardAdmin() {
  const { data: dashboard, isLoading } = useDashboard();
  const { data: lista } = useChamados({ size: 6 });
  const [chamadoAberto, setChamadoAberto] = useState<ChamadoResponse | null>(null);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger.container}
      className="space-y-8"
    >
      <motion.div variants={stagger.item}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Visão geral
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">
          Dashboard administrativo
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-body">
          Agregações em tempo real do volume de chamados, prioridades e categorias mais incidentes.
        </p>
      </motion.div>

      <motion.div
        variants={stagger.innerContainer}
        className="grid gap-4 md:grid-cols-3"
      >
        <KpiCard
          icone={<AlertCircle className="h-5 w-5" />}
          titulo="Chamados abertos"
          valor={dashboard?.totalAbertos}
          carregando={isLoading}
          hint="aguardando triagem"
        />
        <KpiCard
          icone={<Clock className="h-5 w-5" />}
          titulo="Em atendimento"
          valor={dashboard?.totalEmAtendimento}
          carregando={isLoading}
          hint="com técnico responsável"
        />
        <KpiCard
          icone={<CheckCircle2 className="h-5 w-5" />}
          titulo="Resolvidos no mês"
          valor={dashboard?.totalResolvidosMes}
          carregando={isLoading}
          hint="encerrados nos últimos 30 dias"
        />
      </motion.div>

      <motion.div
        variants={stagger.innerContainer}
        className="grid gap-4 lg:grid-cols-2"
      >
        <TopCategorias
          dados={dashboard?.porCategoria}
          carregando={isLoading}
        />
        <TopEquipamentos />
      </motion.div>

      <ChamadosTabela
        titulo="Últimos chamados"
        descricao="Os 6 chamados mais recentes da plataforma."
        chamados={lista?.content ?? []}
        mostrarSolicitante
        onSelect={setChamadoAberto}
      />

      <ChamadoDetalheModal
        chamado={chamadoAberto}
        onClose={() => setChamadoAberto(null)}
      />
    </motion.div>
  );
}

// ─────────────────────────────── COMUM ───────────────────────────────

function DashboardComum({ nome }: { nome: string }) {
  const { data: lista, isLoading } = useChamados({ size: 100 });
  const [chamadoAberto, setChamadoAberto] = useState<ChamadoResponse | null>(null);
  const { abrir: abrirNovoChamado } = useNovoChamadoModal();

  const contagem = useMemo(() => {
    const c: Record<StatusChamado, number> = {
      ABERTO: 0,
      EM_ATENDIMENTO: 0,
      AGUARDANDO_USUARIO: 0,
      RESOLVIDO: 0,
      FECHADO: 0,
    };
    lista?.content.forEach((ch) => {
      c[ch.status] += 1;
    });
    return c;
  }, [lista]);

  const recentes = useMemo(() => {
    return [...(lista?.content ?? [])]
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
      .slice(0, 6);
  }, [lista]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger.container}
      className="space-y-8"
    >
      <motion.div
        variants={stagger.item}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">
            Olá, {nome.split(' ')[0]}.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-body">
            Acompanhe seus chamados e abra um novo quando precisar de suporte.
          </p>
        </div>
        <Button className="rounded-2xl" onClick={() => abrirNovoChamado()}>
          <Plus className="h-4 w-4" />
          Abrir novo chamado
        </Button>
      </motion.div>

      <motion.div
        variants={stagger.innerContainer}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard icone={<AlertCircle className="h-5 w-5" />} titulo="Abertos" valor={contagem.ABERTO} carregando={isLoading} />
        <KpiCard icone={<Clock className="h-5 w-5" />} titulo="Em atendimento" valor={contagem.EM_ATENDIMENTO} carregando={isLoading} />
        <KpiCard icone={<Ticket className="h-5 w-5" />} titulo="Aguardando você" valor={contagem.AGUARDANDO_USUARIO} carregando={isLoading} />
        <KpiCard icone={<CheckCircle2 className="h-5 w-5" />} titulo="Resolvidos" valor={contagem.RESOLVIDO} carregando={isLoading} />
      </motion.div>

      <ChamadosTabela
        titulo="Seus chamados recentes"
        descricao="Os 6 chamados que você abriu mais recentemente."
        chamados={recentes}
        onSelect={setChamadoAberto}
      />

      <ChamadoDetalheModal
        chamado={chamadoAberto}
        onClose={() => setChamadoAberto(null)}
      />
    </motion.div>
  );
}

// ───────────────────────────── KPI Card ─────────────────────────────

function KpiCard({
  icone,
  titulo,
  valor,
  carregando,
  hint,
}: {
  icone: React.ReactNode;
  titulo: string;
  valor: number | undefined;
  carregando?: boolean;
  hint?: string;
}) {
  return (
    <motion.div
      variants={stagger.item}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-[#1a1a1a] to-[#1a1a1a] p-6"
    >
      <span className="absolute inset-y-5 left-0 w-0.5 rounded-full bg-primary" aria-hidden />
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          {icone}
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mute">
          {titulo}
        </p>
      </div>
      <div className="mt-5">
        {carregando ? (
          <SkeletonLinhas linhas={1} />
        ) : (
          <p className="text-4xl font-bold tracking-tight text-ink-strong tabular-nums">
            {valor ?? 0}
          </p>
        )}
        {hint && <p className="mt-1 text-xs text-mute">{hint}</p>}
      </div>
    </motion.div>
  );
}

// ─────────────────────── Top Ranking (genérico) ───────────────────────

interface TopItem {
  chave: string;
  label: string;
  sublabel?: string;
  qtd: number;
  leading: React.ReactNode;
  // Avatar pequeno (24-32px) usado na pilha do card expansível.
  mini?: React.ReactNode;
}

interface ExpansivelProps {
  expansivel: true;
  iconeAgrupador: ElementType;
  labelAgrupador: string;
  unidadeAgrupadorSingular: string;
  unidadeAgrupadorPlural: string;
}

interface NaoExpansivelProps {
  expansivel?: false;
}

type TopRankingProps = {
  titulo: string;
  subtitulo: string;
  todas: TopItem[];
  unidadeSingular: string;
  unidadePlural: string;
  carregando?: boolean;
} & (ExpansivelProps | NaoExpansivelProps);

function TopRanking(props: TopRankingProps) {
  const { titulo, subtitulo, todas, unidadeSingular, unidadePlural, carregando } = props;
  const expansivel = props.expansivel === true;
  const [isExpanded, setIsExpanded] = useState(false);

  const max = todas.reduce((acc, i) => Math.max(acc, i.qtd), 0);
  const visiveis = expansivel ? todas.slice(0, 4) : todas;
  const restantes = expansivel ? todas.length - visiveis.length : 0;

  return (
    <motion.div
      variants={stagger.item}
      className={cn(
        'relative flex flex-col overflow-hidden rounded-3xl bg-[#1a1a1a] p-6',
        expansivel && 'min-h-[440px]',
      )}
    >
      <div>
        <h3 className="text-base font-semibold text-ink">{titulo}</h3>
        <p className="mt-1 text-xs text-mute">{subtitulo}</p>
      </div>

      {carregando ? (
        <div className="mt-6">
          <SkeletonLinhas linhas={5} />
        </div>
      ) : todas.length === 0 ? (
        <p className="mt-6 text-sm text-mute">Sem dados.</p>
      ) : (
        <motion.ul
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className={cn(
            'mt-4 space-y-1',
            expansivel && 'pb-24',
            '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-mute/30 [&::-webkit-scrollbar-track]:bg-transparent',
          )}
        >
          {visiveis.map((item) => (
            <RankingItem
              key={item.chave}
              item={item}
              max={max}
              unidadeSingular={unidadeSingular}
              unidadePlural={unidadePlural}
            />
          ))}
        </motion.ul>
      )}

      {expansivel && todas.length > 0 && (
        <CardAgrupador
          {...(props as ExpansivelProps)}
          todas={todas}
          max={max}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          unidadeSingular={unidadeSingular}
          unidadePlural={unidadePlural}
          restantes={restantes}
        />
      )}
    </motion.div>
  );
}

function CardAgrupador({
  iconeAgrupador,
  labelAgrupador,
  unidadeAgrupadorSingular,
  unidadeAgrupadorPlural,
  todas,
  max,
  isExpanded,
  setIsExpanded,
  unidadeSingular,
  unidadePlural,
  restantes,
}: ExpansivelProps & {
  todas: TopItem[];
  max: number;
  isExpanded: boolean;
  setIsExpanded: (fn: (v: boolean) => boolean) => void;
  unidadeSingular: string;
  unidadePlural: string;
  restantes: number;
}) {
  const IconeAgrupador = iconeAgrupador;
  return (
    <motion.div
      layout
      initial={false}
      animate={{
        height: isExpanded ? 'calc(100% - 20px)' : '68px',
        width: isExpanded ? 'calc(100% - 20px)' : 'calc(100% - 40px)',
        bottom: isExpanded ? '10px' : '20px',
        left: isExpanded ? '10px' : '20px',
        borderRadius: isExpanded ? 20 : 24,
      }}
      transition={{ type: 'spring', stiffness: 240, damping: 30, mass: 0.8 }}
      className="absolute z-10 flex flex-col overflow-hidden border border-[#2a2a2a] bg-[#131313] shadow-2xl shadow-black/40"
    >
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className={cn(
          'group/bar flex h-[68px] shrink-0 items-center justify-between px-3 text-left transition-colors',
          isExpanded ? 'border-b border-[#2a2a2a]' : 'hover:bg-[#1a1a1a]',
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform group-hover/bar:scale-105">
            <IconeAgrupador className="h-5 w-5" />
          </div>
          <motion.div layout="position">
            <h4 className="text-sm font-semibold text-ink">{labelAgrupador}</h4>
            <p className="text-xs text-mute">
              {todas.length}{' '}
              {todas.length === 1 ? unidadeAgrupadorSingular : unidadeAgrupadorPlural}
            </p>
          </motion.div>
        </div>

        <div className="flex items-center gap-3">
          {!isExpanded && (
            <div className="flex -space-x-2">
              {todas.slice(0, 3).map((c) => (
                <span
                  key={c.chave}
                  className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#1a1a1a] ring-2 ring-[#131313]"
                >
                  {c.mini ?? c.leading}
                </span>
              ))}
              {restantes > 0 && (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2a2a2a] text-xs font-semibold text-mute ring-2 ring-[#131313]">
                  +{restantes}
                </span>
              )}
            </div>
          )}

          {isExpanded && (
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2a2a2a] text-mute transition-transform group-hover/bar:scale-105"
            >
              <X className="h-4 w-4" />
            </span>
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
              hidden: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
            }}
            className="flex-1 space-y-1 overflow-y-auto px-3 py-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-mute/30 [&::-webkit-scrollbar-track]:bg-transparent"
          >
            {todas.map((item) => (
              <RankingItem
                key={`exp-${item.chave}`}
                item={item}
                max={max}
                unidadeSingular={unidadeSingular}
                unidadePlural={unidadePlural}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RankingItem({
  item,
  max,
  unidadeSingular,
  unidadePlural,
}: {
  item: TopItem;
  max: number;
  unidadeSingular: string;
  unidadePlural: string;
}) {
  const pct = max > 0 ? (item.qtd / max) * 100 : 0;
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: 8, y: 8 },
        visible: { opacity: 1, x: 0, y: 0 },
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="flex items-center gap-4 rounded-2xl px-3 py-2.5 transition-colors hover:bg-[#131313]"
    >
      {item.leading}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-semibold text-ink">{item.label}</p>
          <p className="text-xs tabular-nums text-mute">
            {item.qtd} {item.qtd === 1 ? unidadeSingular : unidadePlural}
          </p>
        </div>
        {item.sublabel && (
          <p className="truncate text-xs text-mute">{item.sublabel}</p>
        )}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#2a2a2a]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-soft"
          />
        </div>
      </div>
    </motion.div>
  );
}

function LeadingIcone({ Icone }: { Icone: ElementType }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
      <Icone className="h-5 w-5" />
    </div>
  );
}

// ─────────────────────── Top Categorias (chamados) ───────────────────────

const ICONE_CATEGORIA: Record<CategoriaChamado, ElementType> = {
  HARDWARE: HardDrive,
  SOFTWARE: Shapes,
  REDE: Wifi,
  ACESSO: Lock,
  EMAIL: Mail,
  IMPRESSAO: Printer,
  OUTRO: Wrench,
};

function TopCategorias({
  dados,
  carregando,
}: {
  dados: Record<string, number> | undefined;
  carregando?: boolean;
}) {
  const todas = useMemo<TopItem[]>(() => {
    if (!dados) return [];
    return Object.entries(dados)
      .map(([categoria, qtd]) => {
        const c = categoria as CategoriaChamado;
        const Icone = ICONE_CATEGORIA[c] ?? Shapes;
        return {
          chave: c,
          label: categoriaChamadoLabel[c] ?? categoria,
          qtd,
          leading: <LeadingIcone Icone={Icone} />,
        };
      })
      .filter((i) => i.qtd > 0)
      .sort((a, b) => b.qtd - a.qtd);
  }, [dados]);

  return (
    <TopRanking
      titulo="Top categorias"
      subtitulo="Volume de chamados por categoria."
      todas={todas}
      unidadeSingular="chamado"
      unidadePlural="chamados"
      carregando={carregando}
    />
  );
}

// ─────────────────────── Top Equipamentos (por modelo, com fotos) ───────────────────────

const ICONE_TIPO_EQUIPAMENTO: Record<TipoEquipamento, ElementType> = {
  NOTEBOOK: HardDrive,
  DESKTOP: HardDrive,
  MONITOR: Monitor,
  IMPRESSORA: Printer,
  CELULAR: Smartphone,
  PERIFERICO: Wrench,
  OUTRO: Shapes,
};

function LeadingFoto({
  eq,
  size = 44,
}: {
  eq: { tipo: TipoEquipamento; marca: string; modelo: string };
  size?: number;
}) {
  const [erro, setErro] = useState(false);
  const url = fotoDoEquipamento(eq);
  const Icone = ICONE_TIPO_EQUIPAMENTO[eq.tipo] ?? Shapes;
  return (
    <div
      className="flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      {url && !erro ? (
        <img
          src={url}
          alt={`${eq.marca} ${eq.modelo}`}
          loading="lazy"
          onError={() => setErro(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <Icone className="text-mute" strokeWidth={1.5} style={{ width: size * 0.55, height: size * 0.55 }} />
      )}
    </div>
  );
}

function TopEquipamentos() {
  const { data: equipamentos, isLoading } = useEquipamentosLista(500);

  const todas = useMemo<TopItem[]>(() => {
    if (!equipamentos) return [];
    const counts = new Map<
      string,
      { tipo: TipoEquipamento; marca: string; modelo: string; qtd: number }
    >();
    for (const eq of equipamentos) {
      const chave = `${eq.tipo}|${eq.marca}|${eq.modelo}`;
      const atual = counts.get(chave);
      if (atual) {
        atual.qtd += 1;
      } else {
        counts.set(chave, { tipo: eq.tipo, marca: eq.marca, modelo: eq.modelo, qtd: 1 });
      }
    }
    return Array.from(counts.entries())
      .map(([chave, v]) => ({
        chave,
        label: `${v.marca} ${v.modelo}`,
        sublabel: tipoEquipamentoLabel[v.tipo] ?? v.tipo,
        qtd: v.qtd,
        leading: <LeadingFoto eq={v} />,
        mini: <LeadingFoto eq={v} size={28} />,
      }))
      .sort((a, b) => b.qtd - a.qtd);
  }, [equipamentos]);

  return (
    <TopRanking
      titulo="Top equipamentos"
      subtitulo="Modelos com maior volume no inventário."
      todas={todas}
      unidadeSingular="unidade"
      unidadePlural="unidades"
      carregando={isLoading}
      expansivel
      iconeAgrupador={Layers}
      labelAgrupador="Todos os modelos"
      unidadeAgrupadorSingular="modelo no inventário"
      unidadeAgrupadorPlural="modelos no inventário"
    />
  );
}

// ─────────────────── Tabela de chamados (estilo contacts) ───────────────────

function ChamadosTabela({
  titulo,
  descricao,
  chamados,
  mostrarSolicitante,
  onSelect,
}: {
  titulo: string;
  descricao: string;
  chamados: ChamadoResponse[];
  mostrarSolicitante?: boolean;
  onSelect: (c: ChamadoResponse) => void;
}) {
  return (
    <motion.div variants={stagger.item} className="rounded-3xl bg-[#1a1a1a] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">{titulo}</h3>
          <p className="mt-1 text-xs text-mute">{descricao}</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-mute hover:text-ink">
          <Link to="/chamados">
            Ver todos
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {chamados.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            titulo="Nenhum chamado por aqui."
            descricao="Os chamados criados aparecerão neste painel."
          />
        </div>
      ) : (
        <motion.ul
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          className="mt-4 divide-y divide-[#2a2a2a]"
        >
          {chamados.map((ch) => (
            <ChamadoLinha
              key={ch.id}
              chamado={ch}
              mostrarSolicitante={mostrarSolicitante}
              onClick={() => onSelect(ch)}
            />
          ))}
        </motion.ul>
      )}
    </motion.div>
  );
}

function ChamadoLinha({
  chamado,
  mostrarSolicitante,
  onClick,
}: {
  chamado: ChamadoResponse;
  mostrarSolicitante?: boolean;
  onClick: () => void;
}) {
  const nome = chamado.solicitanteNome;
  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 6 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.25 }}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'group flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition-colors',
          'hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent',
        )}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
          {iniciaisDe(nome)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            {mostrarSolicitante ? nome : `#${chamado.id}`}
            <span className="text-xs font-normal text-mute">
              · {formatarDataHora(chamado.criadoEm)}
            </span>
          </p>
          <p className="mt-0.5 truncate text-xs text-mute">
            {mostrarSolicitante && <span className="text-mute/80">#{chamado.id} · </span>}
            {chamado.titulo}
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <PrioridadeBadge prioridade={chamado.prioridade} />
          <StatusBadge status={chamado.status} />
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-mute opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    </motion.li>
  );
}

export { Dashboard as default };
