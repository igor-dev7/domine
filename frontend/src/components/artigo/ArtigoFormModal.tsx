import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { FileText, Loader2, X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SkeletonLinhas } from '@/components/LoadingSkeleton';
import { useArtigoFormModal } from '@/contexts/ArtigoFormModalContext';
import {
  useArtigo,
  useAtualizarArtigo,
  useCriarArtigo,
} from '@/lib/artigos';
import { categoriaArtigoLabel } from '@/lib/format';
import type { CategoriaArtigo, ErroResponse } from '@/types';

const CATEGORIAS: CategoriaArtigo[] = ['HARDWARE', 'SOFTWARE', 'REDE', 'ACESSO', 'OUTROS'];

const schema = z.object({
  titulo: z.string().min(5, 'Mínimo 5 caracteres').max(150, 'Máximo 150 caracteres'),
  resumo: z.string().min(10, 'Mínimo 10 caracteres').max(300, 'Máximo 300 caracteres'),
  conteudo: z
    .string()
    .min(10, 'Mínimo 10 caracteres')
    .max(10000, 'Máximo 10.000 caracteres'),
  categoria: z.enum(['HARDWARE', 'SOFTWARE', 'REDE', 'ACESSO', 'OUTROS']),
});

type FormValues = z.infer<typeof schema>;

export function ArtigoFormModal() {
  const { modo, fechar } = useArtigoFormModal();
  const open = modo != null;

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
            <DialogPrimitive.Title>
              {modo?.tipo === 'editar' ? 'Editar artigo' : 'Novo artigo'}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description>
              {modo?.tipo === 'editar'
                ? 'Atualize os dados do artigo selecionado.'
                : 'Cadastre um novo artigo na base de conhecimento.'}
            </DialogPrimitive.Description>
          </VisuallyHidden.Root>

          <AnimatePresence mode="sync">
            {open && modo && <Conteudo modo={modo} onFechar={fechar} />}
          </AnimatePresence>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

function Conteudo({
  modo,
  onFechar,
}: {
  modo: { tipo: 'criar' } | { tipo: 'editar'; artigoId: number };
  onFechar: () => void;
}) {
  const editando = modo.tipo === 'editar';
  const artigoIdEdicao = editando ? modo.artigoId : null;

  const { data: artigo, isLoading } = useArtigo(artigoIdEdicao);
  const criar = useCriarArtigo();
  const atualizar = useAtualizarArtigo(artigoIdEdicao ?? 0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { categoria: 'OUTROS', titulo: '', resumo: '', conteudo: '' },
  });

  useEffect(() => {
    register('categoria');
  }, [register]);

  useEffect(() => {
    if (editando && artigo) {
      reset({
        titulo: artigo.titulo,
        resumo: artigo.resumo,
        conteudo: artigo.conteudo,
        categoria: artigo.categoria,
      });
    }
  }, [editando, artigo, reset]);

  const categoria = watch('categoria');

  async function onSubmit(values: FormValues) {
    try {
      if (editando) {
        await atualizar.mutateAsync(values);
        toast.success('Artigo atualizado.');
      } else {
        await criar.mutateAsync(values);
        toast.success('Artigo publicado.');
      }
      onFechar();
    } catch (err) {
      const ax = err as AxiosError<ErroResponse>;
      toast.error(ax.response?.data?.mensagens?.[0] ?? 'Erro ao salvar artigo.');
    }
  }

  const pendente = isSubmitting || criar.isPending || atualizar.isPending;

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
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-ink-strong">
                {editando ? 'Editar artigo' : 'Novo artigo'}
              </h2>
              <p className="mt-0.5 text-sm text-body">
                {editando
                  ? 'Atualize título, resumo, categoria ou conteúdo.'
                  : 'Documente um procedimento para reduzir chamados repetidos.'}
              </p>
            </div>
          </div>
          <DialogPrimitive.Close className="rounded-full p-1.5 text-mute opacity-70 transition-all hover:bg-[#1a1a1a] hover:text-ink hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary">
            <X className="h-5 w-5" />
            <span className="sr-only">Fechar</span>
          </DialogPrimitive.Close>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-mute/30 [&::-webkit-scrollbar-track]:bg-transparent">
          {editando && isLoading ? (
            <SkeletonLinhas linhas={6} />
          ) : (
            <form id="form-artigo" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    placeholder="Ex.: Como resetar a senha do Wi-Fi"
                    {...register('titulo')}
                  />
                  {errors.titulo && <Mensagem msg={errors.titulo.message} />}
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={categoria}
                    onValueChange={(v) =>
                      setValue('categoria', v as CategoriaArtigo, { shouldDirty: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {categoriaArtigoLabel[c]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resumo">Resumo</Label>
                <Textarea
                  id="resumo"
                  rows={2}
                  placeholder="Uma ou duas frases descrevendo o conteúdo do artigo."
                  {...register('resumo')}
                />
                {errors.resumo && <Mensagem msg={errors.resumo.message} />}
              </div>

              <div className="space-y-2">
                <Label htmlFor="conteudo">Conteúdo</Label>
                <Textarea
                  id="conteudo"
                  rows={12}
                  placeholder="Conteúdo completo. Aceita markdown — listas, headers, tabelas, etc."
                  className="font-mono text-xs leading-relaxed"
                  {...register('conteudo')}
                />
                {errors.conteudo && <Mensagem msg={errors.conteudo.message} />}
              </div>
            </form>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#2a2a2a] px-8 py-4">
          <Button type="button" variant="ghost" onClick={onFechar} disabled={pendente}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-artigo"
            className="rounded-2xl"
            disabled={pendente || (editando && !artigo)}
          >
            {pendente && <Loader2 className="h-4 w-4 animate-spin" />}
            {pendente ? 'Salvando…' : editando ? 'Salvar alterações' : 'Publicar artigo'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function Mensagem({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs font-medium text-destructive">{msg}</p>;
}
