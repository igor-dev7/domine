import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, UserPlus, X } from 'lucide-react';
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
import { useNovoUsuarioModal } from '@/contexts/NovoUsuarioModalContext';
import { useCriarUsuario } from '@/lib/usuarios';
import { formatarTelefone } from '@/lib/format';
import type { ErroResponse, PerfilUsuario } from '@/types';

const schema = z.object({
  nome: z.string().min(3, 'Mínimo 3 caracteres').max(100),
  email: z.string().email('E-mail inválido').max(150),
  senha: z.string().min(6, 'Mínimo 6 caracteres').max(60),
  telefone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || (v.length >= 10 && v.length <= 15), 'Telefone deve ter 10–15 caracteres'),
  departamento: z.string().max(100).optional().or(z.literal('')),
  perfil: z.enum(['ADMIN', 'COMUM']),
});

type FormValues = z.infer<typeof schema>;

export function NovoUsuarioModal() {
  const { open, fechar } = useNovoUsuarioModal();
  const criar = useCriarUsuario();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { perfil: 'COMUM' },
  });

  const perfil = watch('perfil');
  const telefone = watch('telefone');

  useEffect(() => {
    register('perfil');
  }, [register]);

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
      reset({ perfil: 'COMUM', nome: '', email: '', senha: '', telefone: '', departamento: '' });
    }
  }, [open, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const criado = await criar.mutateAsync({
        nome: values.nome,
        email: values.email,
        senha: values.senha,
        telefone: values.telefone || null,
        departamento: values.departamento || null,
        perfil: values.perfil,
      });
      toast.success(`Usuário ${criado.nome} criado.`);
      fechar();
    } catch (err) {
      const ax = err as AxiosError<ErroResponse>;
      toast.error(ax.response?.data?.mensagens?.[0] ?? 'Erro ao criar usuário.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && fechar()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2">
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>Novo usuário</DialogPrimitive.Title>
            <DialogPrimitive.Description>
              Cadastre um novo usuário (administrador ou comum).
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
                        <UserPlus className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-ink-strong">Novo usuário</h2>
                        <p className="mt-0.5 text-sm text-body">
                          Cadastre um administrador ou um usuário comum. Senha temporária.
                        </p>
                      </div>
                    </div>
                    <DialogPrimitive.Close className="rounded-full p-1.5 text-mute opacity-70 transition-all hover:bg-[#1a1a1a] hover:text-ink hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Fechar</span>
                    </DialogPrimitive.Close>
                  </motion.div>

                  <div className="flex-1 overflow-y-auto px-8 pb-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-mute/30 [&::-webkit-scrollbar-track]:bg-transparent">
                    <form id="form-novo-usuario" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <CampoMotion>
                          <Label htmlFor="nome">Nome completo</Label>
                          <Input id="nome" placeholder="Ex.: Marina Silva" {...register('nome')} />
                          {errors.nome && <Mensagem msg={errors.nome.message} />}
                        </CampoMotion>
                        <CampoMotion>
                          <Label htmlFor="email">E-mail</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="usuario@empresa.com"
                            autoComplete="off"
                            {...register('email')}
                          />
                          {errors.email && <Mensagem msg={errors.email.message} />}
                        </CampoMotion>
                      </div>

                      <CampoMotion>
                        <Label htmlFor="senha">Senha temporária</Label>
                        <Input
                          id="senha"
                          type="password"
                          autoComplete="new-password"
                          placeholder="Mínimo 6 caracteres"
                          {...register('senha')}
                        />
                        {errors.senha && <Mensagem msg={errors.senha.message} />}
                      </CampoMotion>

                      <div className="grid gap-4 md:grid-cols-2">
                        <CampoMotion>
                          <Label htmlFor="telefone">Telefone</Label>
                          <Input
                            id="telefone"
                            inputMode="tel"
                            placeholder="(11) 99999-0000"
                            maxLength={15}
                            value={telefone ?? ''}
                            onChange={(e) =>
                              setValue('telefone', formatarTelefone(e.target.value), {
                                shouldValidate: true,
                              })
                            }
                          />
                          {errors.telefone && <Mensagem msg={errors.telefone.message} />}
                        </CampoMotion>
                        <CampoMotion>
                          <Label htmlFor="departamento">Departamento</Label>
                          <Input
                            id="departamento"
                            placeholder="Ex.: TI, Comercial"
                            {...register('departamento')}
                          />
                          {errors.departamento && <Mensagem msg={errors.departamento.message} />}
                        </CampoMotion>
                      </div>

                      <CampoMotion>
                        <Label>Perfil</Label>
                        <Select
                          value={perfil}
                          onValueChange={(v) => setValue('perfil', v as PerfilUsuario)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="COMUM">Comum</SelectItem>
                            <SelectItem value="ADMIN">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
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
                      form="form-novo-usuario"
                      className="rounded-2xl"
                      disabled={isSubmitting || criar.isPending}
                    >
                      {criar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      {criar.isPending ? 'Cadastrando…' : 'Cadastrar usuário'}
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
