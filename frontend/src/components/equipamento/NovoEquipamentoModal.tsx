import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { HardDrive, Loader2, X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';
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
import { useNovoEquipamentoModal } from '@/contexts/NovoEquipamentoModalContext';
import { useCriarEquipamento } from '@/lib/equipamentos';
import { useUsuariosLista } from '@/lib/usuarios';
import { statusEquipamentoLabel, tipoEquipamentoLabel } from '@/lib/format';
import type {
  ErroResponse,
  StatusEquipamento,
  TipoEquipamento,
} from '@/types';

const SEM_RESPONSAVEL = '__NONE__';

const TIPOS: TipoEquipamento[] = [
  'NOTEBOOK',
  'DESKTOP',
  'MONITOR',
  'IMPRESSORA',
  'CELULAR',
  'PERIFERICO',
  'OUTRO',
];

const STATUS: StatusEquipamento[] = ['EM_USO', 'ESTOQUE', 'MANUTENCAO', 'BAIXADO'];

const schema = z.object({
  patrimonio: z.string().min(1, 'Obrigatório').max(30, 'Máximo 30 caracteres'),
  tipo: z.enum(['NOTEBOOK', 'DESKTOP', 'MONITOR', 'IMPRESSORA', 'CELULAR', 'PERIFERICO', 'OUTRO']),
  marca: z.string().min(1, 'Obrigatório').max(60),
  modelo: z.string().min(1, 'Obrigatório').max(60),
  numeroSerie: z.string().max(60).optional().or(z.literal('')),
  localizacao: z.string().max(100).optional().or(z.literal('')),
  status: z.enum(['EM_USO', 'ESTOQUE', 'MANUTENCAO', 'BAIXADO']),
  responsavelId: z.string().optional(),
  dataAquisicao: z.string().optional().or(z.literal('')),
  observacoes: z.string().max(500).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export function NovoEquipamentoModal() {
  const { open, fechar } = useNovoEquipamentoModal();
  const { data: usuarios } = useUsuariosLista();
  const criar = useCriarEquipamento();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: 'NOTEBOOK', status: 'ESTOQUE' },
  });

  useEffect(() => {
    register('tipo');
    register('status');
    register('responsavelId');
    register('dataAquisicao');
  }, [register]);

  const tipo = watch('tipo');
  const status = watch('status');
  const responsavelId = watch('responsavelId');
  const dataAquisicao = watch('dataAquisicao');

  // Trava scroll do body enquanto modal aberto.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      reset({
        tipo: 'NOTEBOOK',
        status: 'ESTOQUE',
        patrimonio: '',
        marca: '',
        modelo: '',
        numeroSerie: '',
        localizacao: '',
        responsavelId: undefined,
        dataAquisicao: '',
        observacoes: '',
      });
    }
  }, [open, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const criado = await criar.mutateAsync({
        patrimonio: values.patrimonio,
        tipo: values.tipo,
        marca: values.marca,
        modelo: values.modelo,
        numeroSerie: values.numeroSerie || null,
        localizacao: values.localizacao || null,
        status: values.status,
        responsavelId:
          values.responsavelId && values.responsavelId !== SEM_RESPONSAVEL
            ? Number(values.responsavelId)
            : null,
        dataAquisicao: values.dataAquisicao || null,
        observacoes: values.observacoes || null,
      });
      toast.success(`Equipamento ${criado.patrimonio} cadastrado.`);
      fechar();
    } catch (err) {
      const ax = err as AxiosError<ErroResponse>;
      toast.error(ax.response?.data?.mensagens?.[0] ?? 'Erro ao salvar equipamento.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && fechar()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2">
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>Novo equipamento</DialogPrimitive.Title>
            <DialogPrimitive.Description>
              Cadastre um novo equipamento no inventário.
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
                    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
                  }}
                  className="flex max-h-[90vh] flex-col"
                >
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    className="flex shrink-0 items-start justify-between gap-4 px-8 pb-4 pt-6"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                        <HardDrive className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-ink-strong">Novo equipamento</h2>
                        <p className="mt-0.5 text-sm text-body">
                          Cadastre um item do inventário. Você poderá atribuir um responsável agora ou depois.
                        </p>
                      </div>
                    </div>
                    <DialogPrimitive.Close className="rounded-full p-1.5 text-mute opacity-70 transition-all hover:bg-[#1a1a1a] hover:text-ink hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Fechar</span>
                    </DialogPrimitive.Close>
                  </motion.div>

                  <div className="flex-1 overflow-y-auto px-8 pb-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-mute/30 [&::-webkit-scrollbar-track]:bg-transparent">
                    <form id="form-novo-equipamento" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <CampoMotion>
                          <Label htmlFor="patrimonio">Patrimônio</Label>
                          <Input id="patrimonio" placeholder="Ex.: NB-0042" {...register('patrimonio')} />
                          {errors.patrimonio && <Mensagem msg={errors.patrimonio.message} />}
                        </CampoMotion>
                        <CampoMotion>
                          <Label>Tipo</Label>
                          <Select value={tipo} onValueChange={(v) => setValue('tipo', v as TipoEquipamento)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIPOS.map((t) => (
                                <SelectItem key={t} value={t}>
                                  {tipoEquipamentoLabel[t]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CampoMotion>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <CampoMotion>
                          <Label htmlFor="marca">Marca</Label>
                          <Input id="marca" placeholder="Ex.: Dell" {...register('marca')} />
                          {errors.marca && <Mensagem msg={errors.marca.message} />}
                        </CampoMotion>
                        <CampoMotion>
                          <Label htmlFor="modelo">Modelo</Label>
                          <Input id="modelo" placeholder="Ex.: Latitude 5520" {...register('modelo')} />
                          {errors.modelo && <Mensagem msg={errors.modelo.message} />}
                        </CampoMotion>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <CampoMotion>
                          <Label htmlFor="numeroSerie">Número de série</Label>
                          <Input id="numeroSerie" {...register('numeroSerie')} />
                        </CampoMotion>
                        <CampoMotion>
                          <Label htmlFor="localizacao">Localização</Label>
                          <Input
                            id="localizacao"
                            placeholder="Ex.: Sala 203, andar 2"
                            {...register('localizacao')}
                          />
                        </CampoMotion>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <CampoMotion>
                          <Label>Status</Label>
                          <Select
                            value={status}
                            onValueChange={(v) => setValue('status', v as StatusEquipamento)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {statusEquipamentoLabel[s]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CampoMotion>
                        <CampoMotion>
                          <Label>Responsável</Label>
                          <Select
                            value={responsavelId || SEM_RESPONSAVEL}
                            onValueChange={(v) => setValue('responsavelId', v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sem responsável" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={SEM_RESPONSAVEL}>Sem responsável</SelectItem>
                              {usuarios
                                ?.filter((u) => u.ativo)
                                .map((u) => (
                                  <SelectItem key={u.id} value={String(u.id)}>
                                    {u.nome} · {u.email}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </CampoMotion>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <CampoMotion>
                          <Label htmlFor="dataAquisicao">Data de aquisição</Label>
                          <DatePicker
                            id="dataAquisicao"
                            value={dataAquisicao || null}
                            onChange={(v) => setValue('dataAquisicao', v ?? '')}
                          />
                        </CampoMotion>
                      </div>

                      <CampoMotion>
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                          id="observacoes"
                          rows={3}
                          placeholder="Notas internas, condições do equipamento, etc."
                          {...register('observacoes')}
                        />
                      </CampoMotion>
                    </form>
                  </div>

                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    className="flex shrink-0 items-center justify-end gap-3 border-t border-[#2a2a2a] px-8 py-4"
                  >
                    <Button type="button" variant="ghost" onClick={fechar} disabled={isSubmitting || criar.isPending}>
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      form="form-novo-equipamento"
                      className="rounded-2xl"
                      disabled={isSubmitting || criar.isPending}
                    >
                      {criar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      {criar.isPending ? 'Cadastrando…' : 'Cadastrar equipamento'}
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
