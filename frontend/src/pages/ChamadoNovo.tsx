import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useAuth } from '@/contexts/AuthContext';
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
  titulo: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .max(150, 'Máximo 150 caracteres'),
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

export function ChamadoNovo() {
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
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { prioridade: 'MEDIA', categoria: 'OUTRO' },
  });

  const categoria = watch('categoria');
  const prioridade = watch('prioridade');
  const equipamentoId = watch('equipamentoId');

  useEffect(() => {
    // Registra campos controlados via setValue
    register('categoria');
    register('prioridade');
    register('equipamentoId');
  }, [register]);

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
      navigate(`/chamados/${criado.id}`);
    } catch (err) {
      const ax = err as AxiosError<ErroResponse>;
      const msg = ax.response?.data?.mensagens?.[0] ?? 'Erro ao criar chamado.';
      toast.error(msg);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-3 -ml-3">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Novo chamado
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">
          Abrir chamado de suporte
        </h1>
        <p className="mt-2 text-sm text-body">
          Descreva o problema com o máximo de detalhes possíveis. Quanto melhor a descrição, mais
          rápido a TI resolve.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-mute">
            Detalhes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" placeholder="Ex.: Notebook não liga" {...register('titulo')} />
              {errors.titulo && <Mensagem msg={errors.titulo.message} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                rows={6}
                placeholder="O que aconteceu, quando aconteceu e o que você já tentou."
                {...register('descricao')}
              />
              {errors.descricao && <Mensagem msg={errors.descricao.message} />}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
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
              </div>

              <div className="space-y-2">
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
              </div>
            </div>

            <div className="space-y-2">
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
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-hairline pt-4">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || criar.isPending}>
                {criar.isPending ? 'Criando…' : 'Abrir chamado'}
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
