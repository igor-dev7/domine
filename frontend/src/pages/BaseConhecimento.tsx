import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Eye,
  FileText,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  ThumbsUp,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonLinhas } from '@/components/LoadingSkeleton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useArtigoFormModal } from '@/contexts/ArtigoFormModalContext';
import { useArtigoDetalheModal } from '@/contexts/ArtigoDetalheModalContext';
import {
  useArtigos,
  useExcluirArtigo,
  type ArtigoFiltro,
} from '@/lib/artigos';
import { categoriaArtigoLabel, formatarData } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ArtigoResponse, CategoriaArtigo } from '@/types';

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

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 400, damping: 25, mass: 0.7 },
  },
};

const COR_CATEGORIA: Record<CategoriaArtigo, string> = {
  HARDWARE: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  SOFTWARE: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  REDE: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  ACESSO: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
  OUTROS: 'border-mute/40 bg-canvas-soft text-mute',
};

const CATEGORIAS: CategoriaArtigo[] = ['HARDWARE', 'SOFTWARE', 'REDE', 'ACESSO', 'OUTROS'];

export function BaseConhecimento() {
  const { abrirCriar, abrirEditar } = useArtigoFormModal();
  const { abrir: abrirDetalhe } = useArtigoDetalheModal();

  const [categoria, setCategoria] = useState<CategoriaArtigo | null>(null);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<ArtigoFiltro>({ size: 100 });
  const [paraExcluir, setParaExcluir] = useState<ArtigoResponse | null>(null);

  const { data, isLoading, isFetching } = useArtigos(filtro);
  const excluir = useExcluirArtigo();

  // Busca com debounce.
  useEffect(() => {
    const buscaAtual = filtro.busca ?? '';
    if (busca.trim() === buscaAtual) return;
    const id = setTimeout(() => {
      setFiltro((f) => ({ ...f, busca: busca.trim() || null, page: 0 }));
    }, DEBOUNCE_BUSCA_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

  // Categoria muda → atualiza filtro.
  useEffect(() => {
    setFiltro((f) => ({ ...f, categoria, page: 0 }));
  }, [categoria]);

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    try {
      await excluir.mutateAsync(paraExcluir.id);
      toast.success(`Artigo "${paraExcluir.titulo}" excluído.`);
      setParaExcluir(null);
    } catch (err) {
      const ax = err as AxiosError<{ mensagens?: string[] }>;
      toast.error(ax.response?.data?.mensagens?.[0] ?? 'Erro ao excluir.');
    }
  }

  const artigos = useMemo(() => data?.content ?? [], [data]);
  const temFiltroAtivo = !!filtro.busca || !!filtro.categoria;

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
            Conhecimento
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">
            Base de conhecimento
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-body">
            Artigos e procedimentos internos. Self-service pros colaboradores reduz volume de
            chamados repetidos.
          </p>
        </div>
        <Button className="rounded-2xl" onClick={abrirCriar}>
          <Plus className="h-4 w-4" />
          Novo artigo
        </Button>
      </motion.div>

      {/* Toolbar inline */}
      <motion.div variants={stagger.item} className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar artigos pelo título ou resumo"
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

        {temFiltroAtivo && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-2xl"
            onClick={() => {
              setBusca('');
              setCategoria(null);
            }}
          >
            <X className="h-3.5 w-3.5" />
            Limpar
          </Button>
        )}
      </motion.div>

      {/* Filtro por categoria — chips */}
      <motion.div variants={stagger.item} className="flex flex-wrap items-center gap-2">
        <ChipCategoria
          ativo={categoria === null}
          onClick={() => setCategoria(null)}
          label="Todas"
          cor="border-hairline bg-canvas-soft text-body"
        />
        {CATEGORIAS.map((c) => (
          <ChipCategoria
            key={c}
            ativo={categoria === c}
            onClick={() => setCategoria(c)}
            label={categoriaArtigoLabel[c]}
            cor={COR_CATEGORIA[c]}
          />
        ))}
      </motion.div>

      {/* Grid de cards */}
      <motion.div variants={stagger.item} className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-ink">
              {data ? `${data.totalElements} artigos` : 'Resultados'}
            </h3>
            <p className="mt-1 text-xs text-mute">
              {isFetching ? 'atualizando…' : 'Clique em um artigo para abrir o conteúdo completo.'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-3xl bg-[#1a1a1a] p-6">
            <SkeletonLinhas linhas={6} />
          </div>
        ) : artigos.length === 0 ? (
          <div className="rounded-3xl bg-[#1a1a1a] p-6">
            <EmptyState
              icon={<FileText className="h-5 w-5" />}
              titulo="Nenhum artigo encontrado."
              descricao={
                temFiltroAtivo
                  ? 'Ajuste os filtros ou crie um novo artigo.'
                  : 'Comece documentando um procedimento.'
              }
              acao={
                <Button variant="outline" onClick={abrirCriar}>
                  <Plus className="h-4 w-4" />
                  Novo artigo
                </Button>
              }
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${filtro.categoria}-${filtro.busca}`}
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
              }}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {artigos.map((art) => (
                <motion.div key={art.id} variants={cardVariants}>
                  <CardArtigo
                    artigo={art}
                    onAbrir={() => abrirDetalhe(art.id)}
                    onEditar={() => abrirEditar(art.id)}
                    onExcluir={() => setParaExcluir(art)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      <ConfirmDialog
        open={!!paraExcluir}
        onOpenChange={(o) => !o && setParaExcluir(null)}
        titulo={`Excluir "${paraExcluir?.titulo ?? ''}"?`}
        descricao="Esta ação não pode ser desfeita. O artigo será removido da base."
        textoConfirmar="Excluir"
        destrutivo
        carregando={excluir.isPending}
        onConfirmar={confirmarExclusao}
      />
    </motion.div>
  );
}

// ─────────────────────── Card ───────────────────────

function CardArtigo({
  artigo,
  onAbrir,
  onEditar,
  onExcluir,
}: {
  artigo: ArtigoResponse;
  onAbrir: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}) {
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
      className="group relative flex h-full cursor-pointer flex-col rounded-2xl bg-[#1a1a1a] p-5 text-left transition-all hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <span
            className={cn(
              'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
              COR_CATEGORIA[artigo.categoria],
            )}
          >
            {categoriaArtigoLabel[artigo.categoria]}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label="Ações do artigo"
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
              onClick={onExcluir}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="mt-4 text-sm font-semibold text-ink transition-colors group-hover:text-primary">
        {artigo.titulo}
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-body">{artigo.resumo}</p>

      <div className="mt-4 flex items-center justify-between border-t border-[#2a2a2a] pt-3 text-xs text-mute">
        <span className="truncate">{artigo.autorNome ?? '—'}</span>
        <span>{formatarData(artigo.criadoEm)}</span>
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-mute">
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {artigo.visualizacoes}
        </span>
        <span className="inline-flex items-center gap-1">
          <ThumbsUp className="h-3 w-3" />
          {artigo.uteis} úteis
        </span>
      </div>
    </div>
  );
}

// ─────────────────────── Chip de categoria ───────────────────────

function ChipCategoria({
  ativo,
  onClick,
  label,
  cor,
}: {
  ativo: boolean;
  onClick: () => void;
  label: string;
  cor: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-2xl border px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-all',
        ativo
          ? cor
          : 'border-hairline bg-transparent text-mute hover:border-hairline-soft hover:text-ink',
      )}
    >
      {label}
    </button>
  );
}
