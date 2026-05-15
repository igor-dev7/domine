import { Clock, Download, Smile, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useDashboard } from '@/lib/chamados';
import { categoriaChamadoLabel } from '@/lib/format';
import { cn } from '@/lib/utils';

const KPIS = [
  {
    label: 'Tempo médio de resolução',
    valor: '4h 32min',
    delta: '-12%',
    accent: 'text-emerald-300',
    icon: Clock,
    descricao: 'vs. mês anterior',
  },
  {
    label: 'Taxa de resolução',
    valor: '87%',
    delta: '+4 p.p.',
    accent: 'text-emerald-300',
    icon: Target,
    descricao: 'chamados resolvidos no mês',
  },
  {
    label: 'SLA cumprido',
    valor: '92%',
    delta: '+2 p.p.',
    accent: 'text-blue-300',
    icon: TrendingUp,
    descricao: 'dentro do prazo definido',
  },
  {
    label: 'Satisfação (CSAT)',
    valor: '4.6 / 5',
    delta: '+0.3',
    accent: 'text-amber-300',
    icon: Smile,
    descricao: '128 avaliações no mês',
  },
];

const VOLUME_POR_DIA = [
  { dia: 'Segunda', valor: 24 },
  { dia: 'Terça', valor: 18 },
  { dia: 'Quarta', valor: 32 },
  { dia: 'Quinta', valor: 27 },
  { dia: 'Sexta', valor: 21 },
  { dia: 'Sábado', valor: 6 },
  { dia: 'Domingo', valor: 3 },
];

const TOP_TECNICOS = [
  { nome: 'Admin Domine', resolvidos: 42, tempo: '3h 12min' },
  { nome: 'Ana Costa', resolvidos: 36, tempo: '4h 05min' },
  { nome: 'Bruno Lima', resolvidos: 28, tempo: '5h 18min' },
  { nome: 'Carla Mendes', resolvidos: 19, tempo: '4h 44min' },
];

export function Relatorios() {
  const { data: dashboard } = useDashboard();

  function exportarCsv() {
    toast.info('Exportação CSV em breve — dados serão gerados pelo backend.');
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Insights
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">Relatórios</h1>
          <p className="mt-2 max-w-2xl text-sm text-body">
            KPIs operacionais, volume por período e ranking de atendimento. Os números abaixo são
            uma combinação de dados reais e amostragem; a Sprint 7-B vai conectar ao backend.
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
          <Button onClick={exportarCsv} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-sm border border-hairline',
                  kpi.accent,
                )}
              >
                <kpi.icon className="h-4 w-4" />
              </div>
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-mute">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight text-ink-strong">{kpi.valor}</p>
              <p className="mt-1 flex items-baseline gap-2 text-xs text-mute">
                <span className={kpi.accent}>{kpi.delta}</span>
                <span>{kpi.descricao}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-mute">
              Volume por dia da semana
            </CardTitle>
            <p className="text-xs text-body">Chamados abertos por dia — média das últimas 4 semanas.</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {VOLUME_POR_DIA.map((dia) => {
                const max = Math.max(...VOLUME_POR_DIA.map((d) => d.valor));
                const pct = (dia.valor / max) * 100;
                return (
                  <li key={dia.dia} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink">{dia.dia}</span>
                      <span className="font-semibold text-body">{dia.valor}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-sm bg-canvas">
                      <div
                        className="h-full rounded-sm bg-primary/70 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-mute">
              Top categorias
            </CardTitle>
            <p className="text-xs text-body">
              Categorias mais incidentes — dado real do `/chamados/dashboard`.
            </p>
          </CardHeader>
          <CardContent>
            {dashboard && Object.keys(dashboard.porCategoria).length > 0 ? (
              <ul className="space-y-3">
                {Object.entries(dashboard.porCategoria)
                  .sort((a, b) => b[1] - a[1])
                  .map(([categoria, valor]) => {
                    const max = Math.max(...Object.values(dashboard.porCategoria));
                    const pct = (valor / max) * 100;
                    return (
                      <li key={categoria} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-ink">
                            {categoriaChamadoLabel[categoria as keyof typeof categoriaChamadoLabel] ??
                              categoria}
                          </span>
                          <span className="font-semibold text-body">{valor}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-sm bg-canvas">
                          <div
                            className="h-full rounded-sm bg-amber-500/70"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
              </ul>
            ) : (
              <p className="text-sm text-body">Sem dados ainda.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-mute">
            Top técnicos do mês
          </CardTitle>
          <p className="text-xs text-body">Ranking por volume e tempo médio de resolução.</p>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-hairline">
            {TOP_TECNICOS.map((tec, i) => (
              <li
                key={tec.nome}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {i + 1}º
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{tec.nome}</p>
                    <p className="text-xs text-mute">tempo médio: {tec.tempo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-ink-strong">{tec.resolvidos}</p>
                  <p className="text-xs text-mute">resolvidos</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
