import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Clock,
  Download,
  Medal,
  Smile,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboard } from '@/lib/chamados';
import {
  categoriaChamadoLabel,
  iniciaisDe,
  prioridadeChamadoLabel,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import type { CategoriaChamado, PrioridadeChamado } from '@/types';

// ─────────────────────── Animações ───────────────────────

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

// ─────────────────────── Mocks ───────────────────────

interface Kpi {
  label: string;
  valor: string;
  delta: string;
  deltaPositivo: boolean;
  hint: string;
  icon: React.ElementType;
  serie: number[];
}

const KPIS: Kpi[] = [
  {
    label: 'Tempo médio',
    valor: '4h 32min',
    delta: '−12%',
    deltaPositivo: true,
    hint: 'resolução · vs. mês anterior',
    icon: Clock,
    serie: [320, 305, 298, 312, 295, 285, 272],
  },
  {
    label: 'Taxa de resolução',
    valor: '87%',
    delta: '+4 p.p.',
    deltaPositivo: true,
    hint: 'chamados resolvidos no mês',
    icon: Target,
    serie: [78, 80, 82, 81, 83, 85, 87],
  },
  {
    label: 'SLA cumprido',
    valor: '92%',
    delta: '+2 p.p.',
    deltaPositivo: true,
    hint: 'dentro do prazo definido',
    icon: TrendingUp,
    serie: [88, 87, 89, 90, 91, 91, 92],
  },
  {
    label: 'Satisfação (CSAT)',
    valor: '4.6 / 5',
    delta: '+0.3',
    deltaPositivo: true,
    hint: '128 avaliações no mês',
    icon: Smile,
    serie: [4.2, 4.3, 4.3, 4.4, 4.5, 4.5, 4.6],
  },
];

const VOLUME_POR_DIA = [
  { dia: 'Seg', valor: 24 },
  { dia: 'Ter', valor: 18 },
  { dia: 'Qua', valor: 32 },
  { dia: 'Qui', valor: 27 },
  { dia: 'Sex', valor: 21 },
  { dia: 'Sáb', valor: 6 },
  { dia: 'Dom', valor: 3 },
];

const TENDENCIA_30D = [
  3, 5, 7, 4, 6, 8, 5, 7, 9, 11, 8, 10, 13, 9, 11, 14, 12, 10, 13, 15, 12, 14, 16, 13, 15, 17,
  14, 16, 18, 15,
].map((valor, i) => ({ dia: i + 1, valor }));

const DISTRIBUICAO_PRIORIDADE: { prioridade: PrioridadeChamado; valor: number; cor: string }[] =
  [
    { prioridade: 'CRITICA', valor: 12, cor: '#f87171' },
    { prioridade: 'ALTA', valor: 28, cor: '#fb923c' },
    { prioridade: 'MEDIA', valor: 46, cor: '#60a5fa' },
    { prioridade: 'BAIXA', valor: 18, cor: '#3b82f6' },
  ];

const TOP_TECNICOS = [
  { nome: 'Admin Domine', resolvidos: 42, tempo: '3h 12min', sla: 95 },
  { nome: 'Ana Costa', resolvidos: 36, tempo: '4h 05min', sla: 91 },
  { nome: 'Bruno Lima', resolvidos: 28, tempo: '5h 18min', sla: 88 },
  { nome: 'Carla Mendes', resolvidos: 19, tempo: '4h 44min', sla: 90 },
];

// ─────────────────────── Página ───────────────────────

export function Relatorios() {
  const { data: dashboard } = useDashboard();

  const topCategorias = useMemo(() => {
    if (!dashboard) return [];
    return Object.entries(dashboard.porCategoria)
      .map(([cat, valor]) => ({
        categoria: cat as CategoriaChamado,
        label: categoriaChamadoLabel[cat as CategoriaChamado] ?? cat,
        valor,
      }))
      .filter((c) => c.valor > 0)
      .sort((a, b) => b.valor - a.valor);
  }, [dashboard]);

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
            Insights
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">Relatórios</h1>
          <p className="mt-2 max-w-2xl text-sm text-body">
            KPIs operacionais, volume por período e ranking de atendimento. Os números abaixo
            combinam dados reais com amostragem de demonstração.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="ano">Este ano</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="rounded-2xl bg-transparent"
            onClick={() => toast.info('Exportação CSV em breve — dados pelo backend.')}
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div
        variants={stagger.innerContainer}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {KPIS.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </motion.div>

      {/* Tendência + distribuição prioridade */}
      <motion.div variants={stagger.innerContainer} className="grid gap-4 lg:grid-cols-3">
        <TendenciaDiaria />
        <PrioridadePie />
      </motion.div>

      {/* Volume semanal + Top categorias */}
      <motion.div variants={stagger.innerContainer} className="grid gap-4 lg:grid-cols-2">
        <VolumeSemanal />
        <TopCategorias categorias={topCategorias} />
      </motion.div>

      {/* Ranking de técnicos */}
      <TopTecnicos />
    </motion.div>
  );
}

// ─────────────────────── KPI com sparkline ───────────────────────

function KpiCard({ kpi }: { kpi: Kpi }) {
  const dados = kpi.serie.map((v, i) => ({ i, v }));
  const Icon = kpi.icon;

  return (
    <motion.div
      variants={stagger.item}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-[#1a1a1a] to-[#1a1a1a] p-5"
    >
      <span className="absolute inset-y-5 left-0 w-0.5 rounded-full bg-primary" aria-hidden />
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mute">
          {kpi.label}
        </p>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-3xl font-bold tracking-tight text-ink-strong tabular-nums">
            {kpi.valor}
          </p>
          <p className="mt-1 flex items-baseline gap-1.5 text-xs text-mute">
            <span
              className={cn(
                'font-semibold',
                kpi.deltaPositivo ? 'text-emerald-300' : 'text-red-300',
              )}
            >
              {kpi.delta}
            </span>
            <span className="truncate">{kpi.hint}</span>
          </p>
        </div>

        {/* Sparkline */}
        <div className="h-12 w-20 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dados} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`spark-${kpi.label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#60a5fa"
                strokeWidth={2}
                fill={`url(#spark-${kpi.label})`}
                isAnimationActive
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────── Tendência 30d ───────────────────────

function TendenciaDiaria() {
  return (
    <motion.div variants={stagger.item} className="rounded-3xl bg-[#1a1a1a] p-6 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-ink">Tendência diária</h3>
          <p className="mt-1 text-xs text-mute">
            Chamados abertos nos últimos 30 dias.
          </p>
        </div>
      </div>

      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={TENDENCIA_30D} margin={{ top: 10, right: 12, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="tendencia-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="dia"
              tick={{ fill: '#666', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fill: '#666', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ stroke: '#3a3a3a', strokeWidth: 1 }}
              contentStyle={{
                background: '#2a2a2a',
                border: 'none',
                borderRadius: 12,
                fontSize: 12,
                padding: '8px 12px',
              }}
              labelStyle={{ color: '#999', fontSize: 11 }}
              itemStyle={{ color: '#e5e5e5' }}
              labelFormatter={(d) => `Dia ${d}`}
              formatter={(v) => [`${v} chamados`, '']}
            />
            <Area
              type="monotone"
              dataKey="valor"
              stroke="#60a5fa"
              strokeWidth={2.5}
              fill="url(#tendencia-fill)"
              isAnimationActive
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// ─────────────────────── Donut prioridade ───────────────────────

function PrioridadePie() {
  const total = DISTRIBUICAO_PRIORIDADE.reduce((acc, d) => acc + d.valor, 0);

  return (
    <motion.div variants={stagger.item} className="rounded-3xl bg-[#1a1a1a] p-6">
      <h3 className="text-base font-semibold text-ink">Por prioridade</h3>
      <p className="mt-1 text-xs text-mute">Distribuição no período.</p>

      <div className="mt-4 relative h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={DISTRIBUICAO_PRIORIDADE}
              dataKey="valor"
              nameKey="prioridade"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              strokeWidth={0}
              animationDuration={900}
              animationBegin={150}
            >
              {DISTRIBUICAO_PRIORIDADE.map((d) => (
                <Cell key={d.prioridade} fill={d.cor} />
              ))}
            </Pie>
            <Tooltip
              cursor={false}
              contentStyle={{
                background: '#2a2a2a',
                border: 'none',
                borderRadius: 12,
                fontSize: 12,
              }}
              itemStyle={{ color: '#e5e5e5' }}
              formatter={(v) => [`${v} chamados`, '']}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-ink-strong tabular-nums">{total}</p>
          <p className="text-[10px] uppercase tracking-wider text-mute">total</p>
        </div>
      </div>

      <ul className="mt-2 space-y-1.5">
        {DISTRIBUICAO_PRIORIDADE.map((d) => {
          const pct = Math.round((d.valor / total) * 100);
          return (
            <li key={d.prioridade} className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full" style={{ background: d.cor }} />
              <span className="flex-1 text-body">{prioridadeChamadoLabel[d.prioridade]}</span>
              <span className="tabular-nums text-mute">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}

// ─────────────────────── Volume semanal (bar vertical) ───────────────────────

function VolumeSemanal() {
  return (
    <motion.div variants={stagger.item} className="rounded-3xl bg-[#1a1a1a] p-6">
      <h3 className="text-base font-semibold text-ink">Volume por dia da semana</h3>
      <p className="mt-1 text-xs text-mute">Média das últimas 4 semanas.</p>

      <div className="mt-4 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={VOLUME_POR_DIA} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="bar-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="dia"
              tick={{ fill: '#888', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#666', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ fill: 'rgba(59,130,246,0.08)' }}
              contentStyle={{
                background: '#2a2a2a',
                border: 'none',
                borderRadius: 12,
                fontSize: 12,
              }}
              itemStyle={{ color: '#e5e5e5' }}
              formatter={(v) => [`${v} chamados`, '']}
            />
            <Bar
              dataKey="valor"
              fill="url(#bar-fill)"
              radius={[8, 8, 0, 0]}
              isAnimationActive
              animationDuration={900}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// ─────────────────────── Top categorias ───────────────────────

function TopCategorias({
  categorias,
}: {
  categorias: { categoria: CategoriaChamado; label: string; valor: number }[];
}) {
  const max = categorias.reduce((acc, c) => Math.max(acc, c.valor), 0);

  return (
    <motion.div variants={stagger.item} className="rounded-3xl bg-[#1a1a1a] p-6">
      <h3 className="text-base font-semibold text-ink">Top categorias</h3>
      <p className="mt-1 text-xs text-mute">Categorias mais incidentes.</p>

      {categorias.length === 0 ? (
        <p className="mt-6 text-sm text-mute">Sem dados ainda.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {categorias.map((c, i) => {
            const pct = max > 0 ? (c.valor / max) * 100 : 0;
            return (
              <li key={c.categoria} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink">{c.label}</span>
                  <span className="tabular-nums text-mute">{c.valor}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#2a2a2a]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.07,
                      ease: SIDEBAR_EASE,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-soft"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}

// ─────────────────────── Top técnicos ───────────────────────

function TopTecnicos() {
  const maxResolvidos = TOP_TECNICOS.reduce((acc, t) => Math.max(acc, t.resolvidos), 0);

  return (
    <motion.div variants={stagger.item} className="rounded-3xl bg-[#1a1a1a] p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-ink">Top técnicos do mês</h3>
          <p className="mt-1 text-xs text-mute">
            Ranking por volume, tempo médio e SLA cumprido.
          </p>
        </div>
      </div>

      <motion.ul
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="mt-4 grid gap-3 md:grid-cols-2"
      >
        {TOP_TECNICOS.map((tec, i) => {
          const pct = maxResolvidos > 0 ? (tec.resolvidos / maxResolvidos) * 100 : 0;
          const ehTop = i === 0;
          return (
            <motion.li
              key={tec.nome}
              variants={{
                hidden: { opacity: 0, x: 12, filter: 'blur(6px)' },
                visible: {
                  opacity: 1,
                  x: 0,
                  filter: 'blur(0px)',
                  transition: { duration: 0.6, ease: SIDEBAR_EASE },
                },
              }}
              className="rounded-2xl bg-[#131313] p-4"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {iniciaisDe(tec.nome)}
                  </span>
                  {ehTop && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-[#1a1a1a]">
                      <Medal className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-ink">{tec.nome}</p>
                    <span className="rounded-md bg-[#2a2a2a] px-1.5 text-[10px] font-semibold text-mute">
                      #{i + 1}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-mute">média {tec.tempo}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-ink-strong tabular-nums">
                    {tec.resolvidos}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-mute">resolvidos</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#2a2a2a]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.15 + i * 0.06, ease: SIDEBAR_EASE }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-soft"
                  />
                </div>
                <span className="shrink-0 text-[10px] font-medium text-emerald-300">
                  SLA {tec.sla}%
                </span>
              </div>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.div>
  );
}
