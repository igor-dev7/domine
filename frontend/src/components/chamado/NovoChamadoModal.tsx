import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Ticket, X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useNovoChamadoModal } from '@/contexts/NovoChamadoModalContext';
import { useCriarChamado } from '@/lib/chamados';
import { useEquipamentosLista, useMeusEquipamentos } from '@/lib/equipamentos';
import { categoriaChamadoLabel, prioridadeChamadoLabel } from '@/lib/format';
import type {
  CategoriaChamado,
  ErroResponse,
  PrioridadeChamado,
} from '@/types';

const NENHUM = '__NONE__';

const CATEGORIAS: CategoriaChamado[] = [
  'HARDWARE',
  'SOFTWARE',
  'REDE',
  'ACESSO',
  'EMAIL',
  'IMPRESSAO',
  'OUTRO',
];

const PRIORIDADES: PrioridadeChamado[] = ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'];

const schema = z.object({
  titulo: z.string().min(5, 'Mínimo 5 caracteres').max(150, 'Máximo 150 caracteres'),
  descricao: z
    .string()
    .min(10, 'Mínimo 10 caracteres')
    .max(2000, 'Máximo 2000 caracteres'),
  categoria: z.enum([
    'HARDWARE',
    'SOFTWARE',
    'REDE',
    'ACESSO',
    'EMAIL',
    'IMPRESSAO',
    'OUTRO',
  ]),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'CRITICA']),
  equipamentoId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function NovoChamadoModal() {
  const { open, fechar } = useNovoChamadoModal();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const isAdmin = usuario?.perfil === 'ADMIN';

  const { data: equipamentosComum } = useMeusEquipamentos();
  const { data: equipamentosAdmin } = useEquipamentosLista();
  const equipamentos = isAdmin ? equipamentosAdmin : equipamentosComum;

  const criar = useCriarChamado();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { prioridade: 'MEDIA', categoria: 'OUTRO' },
  });

  const categoria = watch('categoria');
  const prioridade = watch('prioridade');
  const equipamentoId = watch('equipamentoId');

  // Trava scroll do body enquanto modal aberto.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  // Reseta o form ao fechar.
  useEffect(() => {
    if (!open) {
      reset({ prioridade: 'MEDIA', categoria: 'OUTRO', titulo: '', descricao: '', equipamentoId: undefined });
    }
  }, [open, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const criado = await criar.mutateAsync({
        titulo: values.titulo,
        descricao: values.descricao,
        categoria: values.categoria,
        prioridade: values.prioridade,
        equipamentoId:
          values.equipamentoId && values.equipamentoId !== NENHUM
            ? Number(values.equipamentoId)
            : null,
      });
      toast.success(`Chamado #${criado.id} criado.`);
      fechar();
      navigate(`/chamados/${criado.id}`);
    } catch (err) {
      const ax = err as AxiosError<ErroResponse>;
      const msg = ax.response?.data?.mensagens?.[0] ?? 'Erro ao criar chamado.';
      toast.error(msg);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && fechar()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2">
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>Novo chamado</DialogPrimitive.Title>
            <DialogPrimitive.Description>
              Abra um novo chamado de suporte preenchendo os detalhes abaixo.
            </DialogPrimitive.Description>
          </VisuallyHidden.Root>

          <AnimatePresence mode="sync">
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{ willChange: 'transform, opacity, filter', transform: 'translateZ(0)' }}
                className="relative max-h-[90vh] overflow-hidden rounded-[2rem] border border-hairline bg-[#131313] shadow-2xl shadow-black/60"
              >
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
                  }}
                  className="flex max-h-[90vh] flex-col"
                >
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                      },
                    }}
                    className="flex shrink-0 items-start justify-between gap-4 px-8 pb-4 pt-6"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                        <Ticket className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-ink-strong">
                          Abrir chamado
                        </h2>
                        <p className="mt-0.5 text-sm text-body">
                          Descreva o problema com o máximo de detalhes — quanto melhor, mais
                          rápido a TI resolve.
                        </p>
                      </div>
                    </div>
                    <DialogPrimitive.Close className="rounded-full p-1.5 text-mute opacity-70 transition-all hover:bg-[#1a1a1a] hover:text-ink hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Fechar</span>
                    </DialogPrimitive.Close>
                  </motion.div>

                  <div className="flex-1 overflow-y-auto px-8 pb-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-mute/30 [&::-webkit-scrollbar-track]:bg-transparent">
                    <form id="form-novo-chamado" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <CampoMotion>
                        <Label htmlFor="titulo">Título</Label>
                        <Input
                          id="titulo"
                          placeholder="Ex.: Notebook não liga"
                          {...register('titulo')}
                        />
                        {errors.titulo && <Mensagem msg={errors.titulo.message} />}
                      </CampoMotion>

                      <CampoMotion>
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          rows={5}
                          placeholder="O que aconteceu, quando aconteceu e o que você já tentou."
                          {...register('descricao')}
                        />
                        {errors.descricao && <Mensagem msg={errors.descricao.message} />}
                      </CampoMotion>

                      <div className="grid gap-4 md:grid-cols-2">
                        <CampoMotion>
                          <Label>Categoria</Label>
                          <Select
                            value={categoria}
                            onValueChange={(v) => setValue('categoria', v as CategoriaChamado)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIAS.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {categoriaChamadoLabel[c]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.categoria && <Mensagem msg={errors.categoria.message} />}
                        </CampoMotion>

                        <CampoMotion>
                          <Label>Prioridade</Label>
                          <Select
                            value={prioridade}
                            onValueChange={(v) => setValue('prioridade', v as PrioridadeChamado)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {PRIORIDADES.map((p) => (
                                <SelectItem key={p} value={p}>
                                  {prioridadeChamadoLabel[p]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.prioridade && <Mensagem msg={errors.prioridade.message} />}
                        </CampoMotion>
                      </div>

                      <CampoMotion>
                        <Label>Equipamento relacionado (opcional)</Label>
                        <Select
                          value={equipamentoId ?? NENHUM}
                          onValueChange={(v) => setValue('equipamentoId', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Nenhum" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NENHUM}>Nenhum</SelectItem>
                            {equipamentos?.map((eq) => (
                              <SelectItem key={eq.id} value={String(eq.id)}>
                                {eq.patrimonio} · {eq.marca} {eq.modelo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!isAdmin && equipamentos?.length === 0 && (
                          <p className="text-xs text-mute">
                            Você ainda não tem equipamentos atribuídos.
                          </p>
                        )}
                      </CampoMotion>
                    </form>
                  </div>

                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                      },
                    }}
                    className="flex shrink-0 items-center justify-end gap-3 border-t border-[#2a2a2a] px-8 py-4"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={fechar}
                      disabled={isSubmitting || criar.isPending}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      form="form-novo-chamado"
                      className="rounded-2xl"
                      disabled={isSubmitting || criar.isPending}
                    >
                      {criar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      {criar.isPending ? 'Criando…' : 'Abrir chamado'}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

function CampoMotion({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
        visible: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      className="space-y-2"
    >
      {children}
    </motion.div>
  );
}

function Mensagem({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs font-medium text-destructive">{msg}</p>;
}
