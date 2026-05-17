import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  CornerUpLeft,
  ExternalLink,
  History,
  Lightbulb,
  MessageSquare,
  Monitor,
  Send,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useArtigoDetalheModal } from '@/contexts/ArtigoDetalheModalContext';
import {
  useAdicionarComentario,
  useAtribuirTecnico,
  useAtualizarStatus,
  useChamado,
  useHistoricoChamado,
} from '@/lib/chamados';
import { useAdmins } from '@/lib/usuarios';
import { MAP_CATEGORIA_CHAMADO_ARTIGO, useSugestoesArtigos } from '@/lib/artigos';
import {
  categoriaArtigoLabel,
  categoriaChamadoLabel,
  formatarDataHora,
  iniciaisDe,
  statusChamadoLabel,
  tipoEventoLabel,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ComentarioResponse, ErroResponse, HistoricoResponse, StatusChamado } from '@/types';

const SIDEBAR_EASE = [0.16, 1, 0.3, 1] as const;

const stagger = {
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  },
  item: {
    hidden: { opacity: 0, y: 18, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.7, ease: SIDEBAR_EASE },
    },
  },
};

const STATUS_OPCOES: StatusChamado[] = [
  'ABERTO',
  'EM_ATENDIMENTO',
  'AGUARDANDO_USUARIO',
  'RESOLVIDO',
  'FECHADO',
];

export function ChamadoDetalhe() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { abrir: abrirArtigo } = useArtigoDetalheModal();
  const id = params.id ? Number(params.id) : null;
  const isAdmin = usuario?.perfil === 'ADMIN';

  const { data: chamado, isLoading, isError, error } = useChamado(id);
  const { data: historico } = useHistoricoChamado(id);
  const admins = useAdmins();

  const atualizarStatus = useAtualizarStatus(id ?? 0);
  const atribuirTecnico = useAtribuirTecnico(id ?? 0);
  const adicionarComentario = useAdicionarComentario(id ?? 0);

  const [comentario, setComentario] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [tab, setTab] = useState<'comentarios' | 'atividade'>('comentarios');

  const comentarios = useMemo(
    () =>
      [...(chamado?.comentarios ?? [])].sort((a, b) =>
        a.criadoEm.localeCompare(b.criadoEm),
      ),
    [chamado],
  );
  const eventos = useMemo(
    () => [...(historico ?? [])].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)),
    [historico],
  );

  const buscaSugestao = chamado
    ? `${chamado.titulo} ${chamado.descricao ?? ''}`.trim()
    : '';
  const categoriaSugestao = chamado
    ? MAP_CATEGORIA_CHAMADO_ARTIGO[chamado.categoria]
    : null;
  const { data: sugestoes = [] } = useSugestoesArtigos(buscaSugestao, categoriaSugestao);

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
      toast.success(`Status alterado para ${statusChamadoLabel[novo].toLowerCase()}.`);
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

  function responderA(c: ComentarioResponse) {
    const mention = `@${c.autorNome}: `;
    const atual = comentario.trim();
    const prefixo = atual && !atual.endsWith('\n\n') ? `${atual}\n\n` : atual;
    setComentario(`${prefixo}${mention}`);
    setTab('comentarios');
    // foco no fim do textarea
    setTimeout(() => {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger.container}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={stagger.item} className="space-y-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-mute transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
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

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={chamado.status} />
            <PrioridadeBadge prioridade={chamado.prioridade} />
            <span className="rounded-sm border border-hairline bg-canvas-soft/40 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-mute">
              {categoriaChamadoLabel[chamado.categoria]}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Coluna principal */}
        <div className="space-y-6">
          {/* Resumo */}
          <motion.div variants={stagger.item} className="rounded-3xl bg-[#1a1a1a] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-mute">
              Resumo do chamado
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-body">
              {chamado.descricao}
            </p>
            {chamado.equipamentoPatrimonio && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#131313] px-4 py-3 text-xs text-body">
                <Monitor className="h-4 w-4 text-primary" />
                Equipamento:{' '}
                <span className="font-semibold text-ink">
                  {chamado.equipamentoPatrimonio}
                </span>
              </div>
            )}
          </motion.div>

          {/* Tabs: Comentários | Atividade */}
          <motion.div variants={stagger.item} className="rounded-3xl bg-[#1a1a1a] p-6">
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as 'comentarios' | 'atividade')}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TabsList>
                  <TabsTrigger value="comentarios">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Comentários
                    <span className="ml-1 rounded-md bg-[#2a2a2a] px-1.5 text-[10px] font-semibold text-mute">
                      {comentarios.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="atividade">
                    <History className="h-3.5 w-3.5" />
                    Atividade
                    <span className="ml-1 rounded-md bg-[#2a2a2a] px-1.5 text-[10px] font-semibold text-mute">
                      {eventos.length}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="comentarios" className="mt-5 space-y-4">
                {comentarios.length === 0 ? (
                  <p className="rounded-2xl bg-[#131313] px-4 py-8 text-center text-sm text-mute">
                    Sem comentários ainda. Seja o primeiro a comentar.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    <AnimatePresence initial={false}>
                      {comentarios.map((c) => (
                        <motion.li
                          key={c.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ComentarioItem c={c} onResponder={() => responderA(c)} />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}

                <form onSubmit={enviarComentario} className="space-y-2">
                  <Label htmlFor="novo-comentario" className="sr-only">
                    Adicionar comentário
                  </Label>
                  <Textarea
                    id="novo-comentario"
                    ref={textareaRef}
                    rows={3}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Escreva uma atualização, faça uma pergunta ou responda a alguém usando @nome…"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="rounded-2xl"
                      disabled={!comentario.trim() || adicionarComentario.isPending}
                    >
                      <Send className="h-4 w-4" />
                      {adicionarComentario.isPending ? 'Enviando…' : 'Comentar'}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="atividade" className="mt-5">
                {eventos.length === 0 ? (
                  <p className="rounded-2xl bg-[#131313] px-4 py-8 text-center text-sm text-mute">
                    Sem atividade registrada ainda.
                  </p>
                ) : (
                  <ol className="relative space-y-4 pl-6 before:absolute before:left-[11px] before:top-1 before:bottom-1 before:w-px before:bg-[#2a2a2a]">
                    {eventos.map((h) => (
                      <AtividadeItem key={h.id} h={h} />
                    ))}
                  </ol>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-4">
          {/* Pessoas */}
          <motion.div variants={stagger.item} className="rounded-3xl bg-[#1a1a1a] p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-mute">
              Pessoas
            </h3>
            <div className="mt-4 space-y-3">
              <PessoaLinha rotulo="Solicitante" nome={chamado.solicitanteNome} />
              <PessoaLinha
                rotulo="Técnico responsável"
                nome={chamado.tecnicoResponsavelNome ?? 'Sem técnico atribuído'}
                apagado={!chamado.tecnicoResponsavelNome}
              />
            </div>

            <div className="mt-4 space-y-2 border-t border-[#2a2a2a] pt-4 text-xs">
              <DataLinha
                icon={Calendar}
                rotulo="Aberto em"
                valor={formatarDataHora(chamado.criadoEm)}
              />
              {chamado.resolvidoEm && (
                <DataLinha
                  icon={CheckCircle2}
                  rotulo="Resolvido em"
                  valor={formatarDataHora(chamado.resolvidoEm)}
                  destaque="emerald"
                />
              )}
            </div>
          </motion.div>

          {/* Ações admin */}
          {isAdmin && (
            <motion.div variants={stagger.item} className="rounded-3xl bg-[#1a1a1a] p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-mute">
                Ações rápidas
              </h3>
              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-mute">Status</Label>
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

                <div className="space-y-1.5">
                  <Label className="text-xs text-mute">Atribuir técnico</Label>
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
              </div>
            </motion.div>
          )}

          {/* Sugestões da base de conhecimento */}
          {sugestoes.length > 0 && (
            <motion.div variants={stagger.item} className="rounded-3xl bg-[#1a1a1a] p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-mute">
                  Pode ajudar
                </h3>
              </div>
              <p className="mt-1 text-xs text-mute">
                Artigos da base de conhecimento relacionados.
              </p>
              <ul className="mt-3 space-y-2">
                {sugestoes.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => abrirArtigo(a.id)}
                      className="group flex w-full items-start gap-3 rounded-2xl bg-[#131313] px-3 py-3 text-left transition-colors hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                        <Lightbulb className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-ink line-clamp-2">
                          {a.titulo}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-mute">
                          {categoriaArtigoLabel[a.categoria]} · {a.uteis} úteis
                        </p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-mute opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => navigate('/base-conhecimento')}
                className="mt-3 inline-flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary-soft"
              >
                Ver toda a base
                <ArrowRight className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────── Comentário ───────────────────

function ComentarioItem({
  c,
  onResponder,
}: {
  c: ComentarioResponse;
  onResponder: () => void;
}) {
  return (
    <div className="group flex gap-3 rounded-2xl bg-[#131313] p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
        {iniciaisDe(c.autorNome)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-ink">{c.autorNome}</p>
          <p className="text-xs text-mute">{formatarDataHora(c.criadoEm)}</p>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-body">
          {c.texto}
        </p>
        <button
          type="button"
          onClick={onResponder}
          className="mt-2 inline-flex items-center gap-1 text-xs text-mute transition-colors hover:text-primary"
        >
          <CornerUpLeft className="h-3 w-3" />
          Responder
        </button>
      </div>
    </div>
  );
}

// ─────────────────── Atividade ───────────────────

function AtividadeItem({ h }: { h: HistoricoResponse }) {
  return (
    <li className="relative">
      <span className="absolute -left-[18px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2a2a2a] ring-2 ring-[#1a1a1a]">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      </span>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-mute">
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
    </li>
  );
}

// ─────────────────── Sidebar ───────────────────

function PessoaLinha({
  rotulo,
  nome,
  apagado,
}: {
  rotulo: string;
  nome: string;
  apagado?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
          apagado
            ? 'border border-dashed border-[#2a2a2a] text-mute'
            : 'bg-primary/15 text-primary',
        )}
      >
        {apagado ? '?' : iniciaisDe(nome)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-mute">
          {rotulo}
        </p>
        <p className={cn('text-sm', apagado ? 'text-mute' : 'font-medium text-ink')}>
          {nome}
        </p>
      </div>
    </div>
  );
}

function DataLinha({
  icon: Icon,
  rotulo,
  valor,
  destaque,
}: {
  icon: React.ElementType;
  rotulo: string;
  valor: string;
  destaque?: 'emerald';
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-mute">
      <Icon className={cn('h-3.5 w-3.5', destaque === 'emerald' ? 'text-emerald-400' : 'text-mute')} />
      <span>{rotulo}:</span>
      <span className={cn(destaque === 'emerald' ? 'text-emerald-300' : 'text-body')}>
        {valor}
      </span>
    </div>
  );
}
