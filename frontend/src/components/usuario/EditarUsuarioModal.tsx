import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, UserCog, X } from 'lucide-react';
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
import { SkeletonLinhas } from '@/components/LoadingSkeleton';
import { useEditarUsuarioModal } from '@/contexts/EditarUsuarioModalContext';
import { useAtualizarUsuario, useUsuario } from '@/lib/usuarios';
import { formatarTelefone } from '@/lib/format';
import type { ErroResponse, PerfilUsuario } from '@/types';

const schema = z.object({
  nome: z.string().min(3, 'Mínimo 3 caracteres').max(100),
  email: z.string().email('E-mail inválido').max(150),
  telefone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || (v.length >= 10 && v.length <= 15), 'Telefone deve ter 10–15 caracteres'),
  departamento: z.string().max(100).optional().or(z.literal('')),
  perfil: z.enum(['ADMIN', 'COMUM']),
  ativo: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function EditarUsuarioModal() {
  const { usuarioId, fechar } = useEditarUsuarioModal();
  const open = usuarioId != null;

  // Trava scroll do body enquanto o modal estiver aberto.
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
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2">
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>Editar usuário</DialogPrimitive.Title>
            <DialogPrimitive.Description>
              Atualize os dados do usuário selecionado.
            </DialogPrimitive.Description>
          </VisuallyHidden.Root>

          <AnimatePresence mode="sync">
            {open && usuarioId != null && (
              <Conteudo usuarioId={usuarioId} onFechar={fechar} />
            )}
          </AnimatePresence>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

// Sub-componente para garantir que o form só monta com o id estável — assim
// o useUsuario não fica "preso" a um id antigo entre aberturas.
function Conteudo({ usuarioId, onFechar }: { usuarioId: number; onFechar: () => void }) {
  const { data: usuario, isLoading } = useUsuario(usuarioId);
  const atualizar = useAtualizarUsuario(usuarioId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { perfil: 'COMUM', ativo: true },
  });

  useEffect(() => {
    register('perfil');
    register('ativo');
  }, [register]);

  useEffect(() => {
    if (usuario) {
      reset({
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone ?? '',
        departamento: usuario.departamento ?? '',
        perfil: usuario.perfil,
        ativo: usuario.ativo,
      });
    }
  }, [usuario, reset]);

  const perfil = watch('perfil');
  const ativo = watch('ativo');
  const telefone = watch('telefone');

  async function onSubmit(values: FormValues) {
    try {
      await atualizar.mutateAsync({
        nome: values.nome,
        email: values.email,
        telefone: values.telefone || null,
        departamento: values.departamento || null,
        perfil: values.perfil,
        ativo: values.ativo,
      });
      toast.success('Usuário atualizado.');
      onFechar();
    } catch (err) {
      const ax = err as AxiosError<ErroResponse>;
      toast.error(ax.response?.data?.mensagens?.[0] ?? 'Erro ao atualizar usuário.');
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
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-ink-strong">Editar usuário</h2>
              <p className="mt-0.5 text-sm text-body">
                {usuario
                  ? `Atualize os dados de ${usuario.nome}.`
                  : 'Carregando dados do usuário…'}
              </p>
            </div>
          </div>
          <DialogPrimitive.Close className="rounded-full p-1.5 text-mute opacity-70 transition-all hover:bg-[#1a1a1a] hover:text-ink hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary">
            <X className="h-5 w-5" />
            <span className="sr-only">Fechar</span>
          </DialogPrimitive.Close>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-mute/30 [&::-webkit-scrollbar-track]:bg-transparent">
          {isLoading || !usuario ? (
            <SkeletonLinhas linhas={6} />
          ) : (
            <form id="form-editar-usuario" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Campo>
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input id="nome" {...register('nome')} />
                  {errors.nome && <Mensagem msg={errors.nome.message} />}
                </Campo>
                <Campo>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" autoComplete="email" {...register('email')} />
                  {errors.email && <Mensagem msg={errors.email.message} />}
                </Campo>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Campo>
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
                        shouldDirty: true,
                      })
                    }
                  />
                  {errors.telefone && <Mensagem msg={errors.telefone.message} />}
                </Campo>
                <Campo>
                  <Label htmlFor="departamento">Departamento</Label>
                  <Input
                    id="departamento"
                    placeholder="Ex.: TI, Comercial"
                    {...register('departamento')}
                  />
                  {errors.departamento && <Mensagem msg={errors.departamento.message} />}
                </Campo>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Campo>
                  <Label>Perfil</Label>
                  <Select
                    value={perfil}
                    onValueChange={(v) =>
                      setValue('perfil', v as PerfilUsuario, { shouldDirty: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMUM">Comum</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </Campo>
                <Campo>
                  <Label>Situação</Label>
                  <Select
                    value={ativo ? 'true' : 'false'}
                    onValueChange={(v) =>
                      setValue('ativo', v === 'true', { shouldDirty: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Ativo</SelectItem>
                      <SelectItem value="false">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </Campo>
              </div>
            </form>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#2a2a2a] px-8 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onFechar}
            disabled={isSubmitting || atualizar.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-editar-usuario"
            className="rounded-2xl"
            disabled={isSubmitting || atualizar.isPending || !usuario}
          >
            {atualizar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {atualizar.isPending ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function Campo({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

function Mensagem({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs font-medium text-destructive">{msg}</p>;
}
