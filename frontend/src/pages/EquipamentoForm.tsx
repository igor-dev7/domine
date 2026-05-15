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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SkeletonLinhas } from '@/components/LoadingSkeleton';
import {
  useAtualizarEquipamento,
  useCriarEquipamento,
  useEquipamento,
} from '@/lib/equipamentos';
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

export function EquipamentoForm() {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const id = params.id ? Number(params.id) : null;
  const editando = id != null;

  const { data: equipamento, isLoading: carregandoDetalhe } = useEquipamento(id);
  const { data: usuarios } = useUsuariosLista();
  const criar = useCriarEquipamento();
  const atualizar = useAtualizarEquipamento(id ?? 0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: 'NOTEBOOK',
      status: 'ESTOQUE',
    },
  });

  useEffect(() => {
    register('tipo');
    register('status');
    register('responsavelId');
  }, [register]);

  useEffect(() => {
    if (equipamento) {
      reset({
        patrimonio: equipamento.patrimonio,
        tipo: equipamento.tipo,
        marca: equipamento.marca,
        modelo: equipamento.modelo,
        numeroSerie: equipamento.numeroSerie ?? '',
        localizacao: equipamento.localizacao ?? '',
        status: equipamento.status,
        responsavelId: equipamento.responsavelId?.toString() ?? '',
        dataAquisicao: equipamento.dataAquisicao ?? '',
        observacoes: equipamento.observacoes ?? '',
      });
    }
  }, [equipamento, reset]);

  const tipo = watch('tipo');
  const status = watch('status');
  const responsavelId = watch('responsavelId');

  async function onSubmit(values: FormValues) {
    const payload = {
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
    };

    try {
      if (editando && id != null) {
        await atualizar.mutateAsync(payload);
        toast.success('Equipamento atualizado.');
      } else {
        const criado = await criar.mutateAsync(payload);
        toast.success(`Equipamento ${criado.patrimonio} cadastrado.`);
      }
      navigate('/equipamentos');
    } catch (err) {
      const ax = err as AxiosError<ErroResponse>;
      toast.error(ax.response?.data?.mensagens?.[0] ?? 'Erro ao salvar equipamento.');
    }
  }

  if (editando && carregandoDetalhe) {
    return <SkeletonLinhas linhas={8} />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-3 -ml-3">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Equipamento
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">
          {editando ? 'Editar equipamento' : 'Novo equipamento'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-mute">
            Detalhes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patrimonio">Patrimônio</Label>
                <Input id="patrimonio" {...register('patrimonio')} />
                {errors.patrimonio && <Mensagem msg={errors.patrimonio.message} />}
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={tipo}
                  onValueChange={(v) => setValue('tipo', v as TipoEquipamento)}
                >
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
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input id="marca" {...register('marca')} />
                {errors.marca && <Mensagem msg={errors.marca.message} />}
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input id="modelo" {...register('modelo')} />
                {errors.modelo && <Mensagem msg={errors.modelo.message} />}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="numeroSerie">Número de série</Label>
                <Input id="numeroSerie" {...register('numeroSerie')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="localizacao">Localização</Label>
                <Input
                  id="localizacao"
                  placeholder="Ex.: Sala 203, andar 2"
                  {...register('localizacao')}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
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
              </div>
              <div className="space-y-2">
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
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dataAquisicao">Data de aquisição</Label>
                <Input id="dataAquisicao" type="date" {...register('dataAquisicao')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                rows={3}
                placeholder="Notas internas, condições do equipamento, etc."
                {...register('observacoes')}
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-hairline pt-4">
              <Button type="button" variant="ghost" onClick={() => navigate('/equipamentos')}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || criar.isPending || atualizar.isPending}
              >
                {(criar.isPending || atualizar.isPending) ? 'Salvando…' : editando ? 'Salvar alterações' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Mensagem({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs font-medium text-destructive">{msg}</p>;
}
