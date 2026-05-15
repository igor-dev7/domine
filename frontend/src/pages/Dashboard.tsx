import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, Plus, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonLinhas } from '@/components/LoadingSkeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { PrioridadeBadge } from '@/components/PrioridadeBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useChamados, useDashboard } from '@/lib/chamados';
import { categoriaChamadoLabel, formatarDataHora, prioridadeChamadoLabel } from '@/lib/format';
import type { ChamadoResponse, StatusChamado } from '@/types';

export function Dashboard() {
  const { usuario } = useAuth();
  if (!usuario) return null;

  return usuario.perfil === 'ADMIN' ? (
    <DashboardAdmin />
  ) : (
    <DashboardComum nome={usuario.nome} />
  );
}

function DashboardAdmin() {
  const { data: dashboard, isLoading } = useDashboard();
  const { data: lista } = useChamados({ size: 5 });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Visão geral
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">
          Dashboard administrativo
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-body">
          Agregações em tempo real do volume de chamados, prioridades e categorias mais incidentes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          icone={<AlertCircle className="h-4 w-4" />}
          titulo="Chamados abertos"
          valor={dashboard?.totalAbertos}
          carregando={isLoading}
          accent="text-blue-300"
        />
        <KpiCard
          icone={<Clock className="h-4 w-4" />}
          titulo="Em atendimento"
          valor={dashboard?.totalEmAtendimento}
          carregando={isLoading}
          accent="text-amber-300"
        />
        <KpiCard
          icone={<CheckCircle2 className="h-4 w-4" />}
          titulo="Resolvidos no mês"
          valor={dashboard?.totalResolvidosMes}
          carregando={isLoading}
          accent="text-emerald-300"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BarrasCard
          titulo="Por prioridade"
          dados={dashboard?.porPrioridade}
          carregando={isLoading}
          ordem={['CRITICA', 'ALTA', 'MEDIA', 'BAIXA']}
          mapearLabel={(k) =>
            prioridadeChamadoLabel[k as keyof typeof prioridadeChamadoLabel] ?? k
          }
        />
        <BarrasCard
          titulo="Por categoria"
          dados={dashboard?.porCategoria}
          carregando={isLoading}
          mapearLabel={(k) => categoriaChamadoLabel[k as keyof typeof categoriaChamadoLabel] ?? k}
        />
      </div>

      <ChamadosRecentes
        titulo="Últimos chamados"
        descricao="Os 5 chamados mais recentes da plataforma."
        chamados={lista?.content ?? []}
        mostrarSolicitante
      />
    </div>
  );
}

function DashboardComum({ nome }: { nome: string }) {
  const { data: lista, isLoading } = useChamados({ size: 100 });

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
      .slice(0, 5);
  }, [lista]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
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
        <Button asChild>
          <Link to="/chamados/novo">
            <Plus className="mr-2 h-4 w-4" />
            Abrir novo chamado
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icone={<AlertCircle className="h-4 w-4" />}
          titulo="Abertos"
          valor={contagem.ABERTO}
          carregando={isLoading}
          accent="text-blue-300"
        />
        <KpiCard
          icone={<Clock className="h-4 w-4" />}
          titulo="Em atendimento"
          valor={contagem.EM_ATENDIMENTO}
          carregando={isLoading}
          accent="text-amber-300"
        />
        <KpiCard
          icone={<Ticket className="h-4 w-4" />}
          titulo="Aguardando você"
          valor={contagem.AGUARDANDO_USUARIO}
          carregando={isLoading}
          accent="text-orange-300"
        />
        <KpiCard
          icone={<CheckCircle2 className="h-4 w-4" />}
          titulo="Resolvidos"
          valor={contagem.RESOLVIDO}
          carregando={isLoading}
          accent="text-emerald-300"
        />
      </div>

      <ChamadosRecentes
        titulo="Seus chamados recentes"
        descricao="Os 5 chamados que você abriu mais recentemente."
        chamados={recentes}
      />
    </div>
  );
}

function KpiCard({
  icone,
  titulo,
  valor,
  carregando,
  accent,
}: {
  icone: React.ReactNode;
  titulo: string;
  valor: number | undefined;
  carregando?: boolean;
  accent?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-sm border border-hairline ${accent ?? 'text-primary'}`}>
          {icone}
        </div>
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-mute">
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {carregando ? (
          <SkeletonLinhas linhas={1} />
        ) : (
          <p className="text-3xl font-bold tracking-tight text-ink-strong">{valor ?? 0}</p>
        )}
      </CardContent>
    </Card>
  );
}

function BarrasCard({
  titulo,
  dados,
  carregando,
  ordem,
  mapearLabel,
}: {
  titulo: string;
  dados: Record<string, number> | undefined;
  carregando?: boolean;
  ordem?: string[];
  mapearLabel: (chave: string) => string;
}) {
  const entradas = useMemo(() => {
    if (!dados) return [];
    const lista = Object.entries(dados);
    if (ordem) {
      lista.sort((a, b) => ordem.indexOf(a[0]) - ordem.indexOf(b[0]));
    } else {
      lista.sort((a, b) => b[1] - a[1]);
    }
    return lista;
  }, [dados, ordem]);

  const max = entradas.reduce((acc, [, v]) => Math.max(acc, v), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-mute">
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {carregando ? (
          <SkeletonLinhas linhas={4} />
        ) : entradas.length === 0 ? (
          <p className="text-sm text-body">Sem dados.</p>
        ) : (
          <ul className="space-y-3">
            {entradas.map(([chave, valor]) => {
              const pct = max > 0 ? (valor / max) * 100 : 0;
              return (
                <li key={chave} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-ink">{mapearLabel(chave)}</span>
                    <span className="font-semibold text-body">{valor}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-sm bg-canvas">
                    <div
                      className="h-full rounded-sm bg-primary/70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ChamadosRecentes({
  titulo,
  descricao,
  chamados,
  mostrarSolicitante,
}: {
  titulo: string;
  descricao: string;
  chamados: ChamadoResponse[];
  mostrarSolicitante?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-mute">
          {titulo}
        </CardTitle>
        <p className="text-xs text-body">{descricao}</p>
      </CardHeader>
      <CardContent>
        {chamados.length === 0 ? (
          <EmptyState
            titulo="Nenhum chamado por aqui."
            descricao="Os chamados criados aparecerão neste painel."
          />
        ) : (
          <ul className="divide-y divide-hairline">
            {chamados.map((ch) => (
              <li key={ch.id}>
                <Link
                  to={`/chamados/${ch.id}`}
                  className="flex items-start justify-between gap-4 py-3 transition-colors hover:bg-canvas-soft"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <span className="text-mute">#{ch.id}</span>
                      <span className="truncate">{ch.titulo}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-mute">
                      {mostrarSolicitante && <>por {ch.solicitanteNome} · </>}
                      {formatarDataHora(ch.criadoEm)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <PrioridadeBadge prioridade={ch.prioridade} />
                    <StatusBadge status={ch.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
