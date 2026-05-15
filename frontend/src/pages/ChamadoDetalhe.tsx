import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft,
  History,
  MessageSquare,
  Monitor,
  Send,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonLinhas } from '@/components/LoadingSkeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { PrioridadeBadge } from '@/components/PrioridadeBadge';
import { useAuth } from '@/contexts/AuthContext';
import {
  useAdicionarComentario,
  useAtribuirTecnico,
  useAtualizarStatus,
  useChamado,
  useHistoricoChamado,
} from '@/lib/chamados';
import { useAdmins } from '@/lib/usuarios';
import {
  categoriaChamadoLabel,
  formatarDataHora,
  iniciaisDe,
  statusChamadoLabel,
  tipoEventoLabel,
} from '@/lib/format';
import type { ComentarioResponse, ErroResponse, HistoricoResponse, StatusChamado } from '@/types';

const STATUS_OPCOES: StatusChamado[] = [
  'ABERTO',
  'EM_ATENDIMENTO',
  'AGUARDANDO_USUARIO',
  'RESOLVIDO',
  'FECHADO',
];

type EventoTimeline =
  | { tipo: 'comentario'; criadoEm: string; dado: ComentarioResponse }
  | { tipo: 'historico'; criadoEm: string; dado: HistoricoResponse };

export function ChamadoDetalhe() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const id = params.id ? Number(params.id) : null;
  const isAdmin = usuario?.perfil === 'ADMIN';

  const { data: chamado, isLoading, isError, error } = useChamado(id);
  const { data: historico } = useHistoricoChamado(id);
  const admins = useAdmins();

  const atualizarStatus = useAtualizarStatus(id ?? 0);
  const atribuirTecnico = useAtribuirTecnico(id ?? 0);
  const adicionarComentario = useAdicionarComentario(id ?? 0);

  const [comentario, setComentario] = useState('');

  const timeline = useMemo<EventoTimeline[]>(() => {
    const comentarios = chamado?.comentarios ?? [];
    const hist = historico ?? [];
    // List<EventoTimeline> ordenada por criadoEm asc (estrutura de dados acadêmica)
    const eventos: EventoTimeline[] = [
      ...comentarios.map((c) => ({ tipo: 'comentario' as const, criadoEm: c.criadoEm, dado: c })),
      ...hist.map((h) => ({ tipo: 'historico' as const, criadoEm: h.criadoEm, dado: h })),
    ];
    return eventos.sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));
  }, [chamado, historico]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonLinhas linhas={3} />
        <SkeletonLinhas linhas={6} />
      </div>
    );
  }

  if (isError) {
    const ax = error as AxiosError<ErroResponse>;
    const status = ax.response?.status;
    const msg =
      status === 403
        ? 'Você não tem permissão para visualizar este chamado.'
        : status === 404
          ? 'Chamado não encontrado.'
          : (ax.response?.data?.mensagens?.[0] ?? 'Erro ao carregar o chamado.');
    return (
      <EmptyState
        titulo={msg}
        acao={
          <Button variant="outline" onClick={() => navigate('/chamados')}>
            Voltar para a lista
          </Button>
        }
      />
    );
  }

  if (!chamado) return null;

  async function mudarStatus(novo: StatusChamado) {
    try {
      await atualizarStatus.mutateAsync(novo);
      toast.success(`Status alterado para ${statusChamadoLabel[novo]}.`);
    } catch (err) {
      const ax = err as AxiosError<ErroResponse>;
      toast.error(ax.response?.data?.mensagens?.[0] ?? 'Erro ao mudar status.');
    }
  }

  async function atribuir(tecnicoId: number) {
    try {
      await atribuirTecnico.mutateAsync(tecnicoId);
      toast.success('Técnico atribuído.');
    } catch (err) {
      const ax = err as AxiosError<ErroResponse>;
      toast.error(ax.response?.data?.mensagens?.[0] ?? 'Erro ao atribuir técnico.');
    }
  }

  async function enviarComentario(e: React.FormEvent) {
    e.preventDefault();
    const texto = comentario.trim();
    if (!texto) return;
    try {
      await adicionarComentario.mutateAsync({ texto });
      setComentario('');
      toast.success('Comentário adicionado.');
    } catch (err) {
      const ax = err as AxiosError<ErroResponse>;
      toast.error(ax.response?.data?.mensagens?.[0] ?? 'Erro ao comentar.');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-3 -ml-3">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Chamado <span className="font-mono">#{chamado.id}</span>
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">
          {chamado.titulo}
        </h1>
        <p className="mt-2 text-sm text-mute">
          Aberto por <span className="text-ink">{chamado.solicitanteNome}</span> em{' '}
          {formatarDataHora(chamado.criadoEm)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-mute">
                Descrição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-body">{chamado.descricao}</p>
              {chamado.equipamentoPatrimonio && (
                <div className="mt-4 flex items-center gap-2 rounded-sm border border-hairline bg-canvas-soft px-3 py-2 text-xs text-body">
                  <Monitor className="h-4 w-4 text-primary" />
                  Equipamento: <span className="font-semibold text-ink">{chamado.equipamentoPatrimonio}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-mute">
                Atividade
              </CardTitle>
              <p className="text-xs text-body">
                Comentários e histórico de eventos em ordem cronológica.
              </p>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <EmptyState
                  titulo="Sem atividade ainda."
                  descricao="Adicione o primeiro comentário abaixo."
                />
              ) : (
                <ol className="space-y-4">
                  {timeline.map((ev, i) => (
                    <li key={`${ev.tipo}-${ev.dado.id}-${i}`}>
                      {ev.tipo === 'comentario' ? (
                        <ItemComentario c={ev.dado} />
                      ) : (
                        <ItemHistorico h={ev.dado} />
                      )}
                    </li>
                  ))}
                </ol>
              )}

              <Separator className="my-6" />

              <form onSubmit={enviarComentario} className="space-y-3">
                <Label htmlFor="novo-comentario">Adicionar comentário</Label>
                <Textarea
                  id="novo-comentario"
                  rows={3}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Escreva uma atualização ou pergunta…"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!comentario.trim() || adicionarComentario.isPending}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {adicionarComentario.isPending ? 'Enviando…' : 'Comentar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-mute">
                Situação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Linha rotulo="Status">
                <StatusBadge status={chamado.status} />
              </Linha>
              <Linha rotulo="Prioridade">
                <PrioridadeBadge prioridade={chamado.prioridade} />
              </Linha>
              <Linha rotulo="Categoria">
                <span className="text-sm text-ink">{categoriaChamadoLabel[chamado.categoria]}</span>
              </Linha>
              <Linha rotulo="Solicitante">
                <span className="text-sm text-ink">{chamado.solicitanteNome}</span>
              </Linha>
              <Linha rotulo="Técnico">
                <span className="text-sm text-ink">
                  {chamado.tecnicoResponsavelNome ?? <span className="text-mute">Não atribuído</span>}
                </span>
              </Linha>
              <Linha rotulo="Aberto em">
                <span className="text-xs text-body">{formatarDataHora(chamado.criadoEm)}</span>
              </Linha>
              {chamado.resolvidoEm && (
                <Linha rotulo="Resolvido em">
                  <span className="text-xs text-emerald-300">
                    {formatarDataHora(chamado.resolvidoEm)}
                  </span>
                </Linha>
              )}
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-mute">
                  Ações ADMIN
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mudar status</Label>
                  <Select
                    value={chamado.status}
                    onValueChange={(v) => mudarStatus(v as StatusChamado)}
                  >
                    <SelectTrigger disabled={atualizarStatus.isPending}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPCOES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {statusChamadoLabel[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Atribuir técnico</Label>
                  <Select
                    value={chamado.tecnicoResponsavelId?.toString() ?? ''}
                    onValueChange={(v) => atribuir(Number(v))}
                  >
                    <SelectTrigger disabled={atribuirTecnico.isPending}>
                      <SelectValue placeholder="Escolha um administrador" />
                    </SelectTrigger>
                    <SelectContent>
                      {admins.data?.map((a) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          {a.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {admins.data?.length === 0 && (
                    <p className="text-xs text-mute">Nenhum administrador disponível.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-mute">{rotulo}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}

function ItemComentario({ c }: { c: ComentarioResponse }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas-soft text-xs font-semibold text-ink">
        {iniciaisDe(c.autorNome)}
      </div>
      <div className="min-w-0 flex-1 rounded-sm border border-hairline bg-canvas-soft p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            {c.autorNome}
          </p>
          <p className="text-xs text-mute">{formatarDataHora(c.criadoEm)}</p>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm text-body">{c.texto}</p>
      </div>
    </div>
  );
}

function ItemHistorico({ h }: { h: HistoricoResponse }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-hairline text-mute">
        <History className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 border-l-2 border-hairline pl-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-mute">
          {tipoEventoLabel[h.tipoEvento]}
        </p>
        <p className="mt-1 text-sm text-body">{h.descricao}</p>
        <p className="mt-1 flex items-center gap-2 text-xs text-mute">
          {h.autorNome && (
            <>
              <UserIcon className="h-3 w-3" />
              {h.autorNome} ·
            </>
          )}
          <span>{formatarDataHora(h.criadoEm)}</span>
        </p>
      </div>
    </div>
  );
}
