import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  useAtualizarUsuario,
  useCriarUsuario,
  useUsuario,
} from '@/lib/usuarios';
import type { ErroResponse, PerfilUsuario } from '@/types';

const schemaCriar = z.object({
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

const schemaEditar = z.object({
  nome: z.string().min(3).max(100),
  email: z.string().email().max(150),
  telefone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || (v.length >= 10 && v.length <= 15), 'Telefone deve ter 10–15 caracteres'),
  departamento: z.string().max(100).optional().or(z.literal('')),
  perfil: z.enum(['ADMIN', 'COMUM']),
  ativo: z.boolean(),
});

type CreateValues = z.infer<typeof schemaCriar>;
type UpdateValues = z.infer<typeof schemaEditar>;

export function UsuarioForm() {
  const params = useParams<{ id?: string }>();
  const id = params.id ? Number(params.id) : null;
  return id != null ? <UsuarioEditar id={id} /> : <UsuarioCriar />;
}

function UsuarioCriar() {
  const navigate = useNavigate();
  const criar = useCriarUsuario();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateValues>({
    resolver: zodResolver(schemaCriar),
    defaultValues: { perfil: 'COMUM' },
  });

  useEffect(() => {
    register('perfil');
  }, [register]);

  const perfil = watch('perfil');

  async function onSubmit(values: CreateValues) {
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
      navigate('/usuarios');
    } catch (err) {
      const ax = err as AxiosError<ErroResponse>;
      toast.error(ax.response?.data?.mensagens?.[0] ?? 'Erro ao criar usuário.');
    }
  }

  return (
    <FormWrapper titulo="Novo usuário">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <CamposComuns register={register} errors={errors} />

        <div className="space-y-2">
          <Label htmlFor="senha">Senha</Label>
          <Input id="senha" type="password" autoComplete="new-password" {...register('senha')} />
          {errors.senha && <Mensagem msg={errors.senha.message} />}
        </div>

        <div className="space-y-2">
          <Label>Perfil</Label>
          <Select value={perfil} onValueChange={(v) => setValue('perfil', v as PerfilUsuario)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COMUM">Comum</SelectItem>
              <SelectItem value="ADMIN">Administrador</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <BotoesForm
          carregando={isSubmitting || criar.isPending}
          rotuloOk="Cadastrar"
          onCancelar={() => navigate('/usuarios')}
        />
      </form>
    </FormWrapper>
  );
}

function UsuarioEditar({ id }: { id: number }) {
  const navigate = useNavigate();
  const { data: usuario, isLoading } = useUsuario(id);
  const atualizar = useAtualizarUsuario(id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateValues>({
    resolver: zodResolver(schemaEditar),
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

  async function onSubmit(values: UpdateValues) {
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
      navigate('/usuarios');
    } catch (err) {
      const ax = err as AxiosError<ErroResponse>;
      toast.error(ax.response?.data?.mensagens?.[0] ?? 'Erro ao atualizar usuário.');
    }
  }

  if (isLoading) {
    return (
      <FormWrapper titulo="Editar usuário">
        <SkeletonLinhas linhas={6} />
      </FormWrapper>
    );
  }

  return (
    <FormWrapper titulo="Editar usuário">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <CamposComuns register={register} errors={errors} />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Perfil</Label>
            <Select value={perfil} onValueChange={(v) => setValue('perfil', v as PerfilUsuario)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMUM">Comum</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Situação</Label>
            <Select
              value={ativo ? 'true' : 'false'}
              onValueChange={(v) => setValue('ativo', v === 'true')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <BotoesForm
          carregando={isSubmitting || atualizar.isPending}
          rotuloOk="Salvar alterações"
          onCancelar={() => navigate('/usuarios')}
        />
      </form>
    </FormWrapper>
  );
}

function FormWrapper({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-3 -ml-3">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Usuário</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">{titulo}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-mute">
            Dados
          </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

function CamposComuns({
  register,
  errors,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" {...register('nome')} />
          {errors.nome && <Mensagem msg={errors.nome.message} />}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
          {errors.email && <Mensagem msg={errors.email.message} />}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input id="telefone" placeholder="(11) 99999-0000" {...register('telefone')} />
          {errors.telefone && <Mensagem msg={errors.telefone.message} />}
        </div>
        <div className="space-y-2">
          <Label htmlFor="departamento">Departamento</Label>
          <Input id="departamento" placeholder="Ex.: TI, Comercial" {...register('departamento')} />
          {errors.departamento && <Mensagem msg={errors.departamento.message} />}
        </div>
      </div>
    </>
  );
}

function BotoesForm({
  carregando,
  rotuloOk,
  onCancelar,
}: {
  carregando: boolean;
  rotuloOk: string;
  onCancelar: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-hairline pt-4">
      <Button type="button" variant="ghost" onClick={onCancelar}>
        Cancelar
      </Button>
      <Button type="submit" disabled={carregando}>
        {carregando ? 'Salvando…' : rotuloOk}
      </Button>
    </div>
  );
}

function Mensagem({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs font-medium text-destructive">{msg}</p>;
}
