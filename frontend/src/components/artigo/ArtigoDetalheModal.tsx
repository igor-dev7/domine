import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { BookOpen, Eye, ThumbsUp, X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { SkeletonLinhas } from '@/components/LoadingSkeleton';
import { useArtigoDetalheModal } from '@/contexts/ArtigoDetalheModalContext';
import { useArtigo, useMarcarUtilArtigo } from '@/lib/artigos';
import { categoriaArtigoLabel, formatarData } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ArtigoResponse, CategoriaArtigo, ErroResponse } from '@/types';

const COR_CATEGORIA: Record<CategoriaArtigo, string> = {
  HARDWARE: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  SOFTWARE: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  REDE: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  ACESSO: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
  OUTROS: 'border-mute/40 bg-canvas-soft text-mute',
};

export function ArtigoDetalheModal() {
  const { artigoId, fechar } = useArtigoDetalheModal();
  const open = artigoId != null;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && fechar()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2">
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>Artigo da base de conhecimento</DialogPrimitive.Title>
            <DialogPrimitive.Description>
              Leitura completa do artigo selecionado.
            </DialogPrimitive.Description>
          </VisuallyHidden.Root>

          <AnimatePresence mode="sync">
            {open && artigoId != null && <Conteudo artigoId={artigoId} onFechar={fechar} />}
          </AnimatePresence>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

function Conteudo({ artigoId, onFechar }: { artigoId: number; onFechar: () => void }) {
  const { data: artigo, isLoading } = useArtigo(artigoId, true);
  const marcarUtil = useMarcarUtilArtigo();

  async function utilHandler() {
    try {
      await marcarUtil.mutateAsync(artigoId);
      toast.success('Obrigado pelo feedback!');
    } catch (err) {
      const ax = err as AxiosError<ErroResponse>;
      toast.error(ax.response?.data?.mensagens?.[0] ?? 'Não foi possível registrar.');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
      className="relative max-h-[90vh] overflow-hidden rounded-[2rem] border border-hairline bg-[#131313] shadow-2xl shadow-black/60"
    >
      <div className="flex max-h-[90vh] flex-col">
        <div className="flex shrink-0 items-start justify-between gap-4 px-8 pb-4 pt-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              {artigo && (
                <span
                  className={cn(
                    'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                    COR_CATEGORIA[artigo.categoria],
                  )}
                >
                  {categoriaArtigoLabel[artigo.categoria]}
                </span>
              )}
              <h2 className="mt-1 text-xl font-semibold text-ink-strong">
                {artigo ? artigo.titulo : 'Carregando…'}
              </h2>
              {artigo && (
                <p className="mt-1 text-xs text-mute">
                  {artigo.autorNome ?? 'Autor desconhecido'} · {formatarData(artigo.criadoEm)}
                </p>
              )}
            </div>
          </div>
          <DialogPrimitive.Close className="rounded-full p-1.5 text-mute opacity-70 transition-all hover:bg-[#1a1a1a] hover:text-ink hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary">
            <X className="h-5 w-5" />
            <span className="sr-only">Fechar</span>
          </DialogPrimitive.Close>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-mute/30 [&::-webkit-scrollbar-track]:bg-transparent">
          {isLoading || !artigo ? (
            <SkeletonLinhas linhas={8} />
          ) : (
            <>
              <p className="text-sm text-body">{artigo.resumo}</p>
              <div className="my-5 h-px bg-[#2a2a2a]" />
              <ConteudoArtigo artigo={artigo} />
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#2a2a2a] px-8 py-4">
          <div className="flex items-center gap-4 text-xs text-mute">
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              {artigo?.visualizacoes ?? 0} visualizações
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ThumbsUp className="h-3.5 w-3.5" />
              {artigo?.uteis ?? 0} marcaram como útil
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-2xl bg-transparent"
              onClick={utilHandler}
              disabled={!artigo || marcarUtil.isPending}
            >
              <ThumbsUp className="h-4 w-4" />
              {marcarUtil.isPending ? 'Registrando…' : 'Foi útil'}
            </Button>
            <Button type="button" variant="ghost" onClick={onFechar}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ConteudoArtigo({ artigo }: { artigo: ArtigoResponse }) {
  // Renderização leve do conteúdo — preserva quebras de linha e parágrafos sem virar markdown completo.
  // Linhas iniciadas com `# ` viram h3, `## ` viram h4, `- ` ou `* ` viram bullet.
  const linhas = artigo.conteudo.split('\n');

  const blocos: React.ReactNode[] = [];
  let listaAtual: string[] = [];
  let key = 0;

  function flushLista() {
    if (listaAtual.length === 0) return;
    blocos.push(
      <ul key={`l${key++}`} className="my-2 list-disc space-y-1 pl-5 text-sm text-body">
        {listaAtual.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>,
    );
    listaAtual = [];
  }

  linhas.forEach((raw) => {
    const linha = raw.trimEnd();
    if (linha.startsWith('# ')) {
      flushLista();
      blocos.push(
        <h3 key={`h${key++}`} className="mt-5 text-base font-semibold text-ink-strong">
          {linha.slice(2)}
        </h3>,
      );
    } else if (linha.startsWith('## ')) {
      flushLista();
      blocos.push(
        <h4 key={`h${key++}`} className="mt-4 text-sm font-semibold uppercase tracking-wider text-mute">
          {linha.slice(3)}
        </h4>,
      );
    } else if (/^[-*] /.test(linha)) {
      listaAtual.push(linha.slice(2));
    } else if (linha.trim() === '') {
      flushLista();
    } else {
      flushLista();
      blocos.push(
        <p key={`p${key++}`} className="my-2 text-sm leading-relaxed text-body">
          {linha}
        </p>,
      );
    }
  });
  flushLista();

  return <div>{blocos}</div>;
}
