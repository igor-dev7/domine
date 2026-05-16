import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Activity,
  Calendar,
  CheckCircle2,
  ExternalLink,
  HardDrive,
  History,
  Info,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Sparkle,
  Ticket,
  Trash2,
  User,
  UserMinus,
  UserPlus,
  X,
} from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { StatusBadge } from '@/components/StatusBadge';
import { PrioridadeBadge } from '@/components/PrioridadeBadge';
import { useEquipamentoSheet } from '@/contexts/EquipamentoSheetContext';
import {
  useAtualizarEquipamento,
  useChamadosDoEquipamento,
  useEquipamento,
  useExcluirEquipamento,
  useHistoricoEquipamento,
  type HistoricoEquipamentoResponse,
  type TipoEventoEquipamento,
} from '@/lib/equipamentos';
import { useUsuariosLista } from '@/lib/usuarios';
import { fotoDoEquipamento } from '@/lib/fotoEquipamento';
import {
  formatarData,
  formatarDataHora,
  iniciaisDe,
  statusEquipamentoLabel,
  tipoEquipamentoLabel,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import type {
  ChamadoResponse,
  EquipamentoResponse,
  ErroResponse,
  StatusEquipamento,
  TipoEquipamento,
} from '@/types';

const SEM_RESPONSAVEL = '__NONE__';
const SIDEBAR_EASE = [0.16, 1, 0.3, 1] as const;

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
  patrimonio: z.string().min(1, 'Obrigatório').max(30),
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

const stagger = {
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVar = {
  hidden: { opacity: 0, y: 10, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: SIDEBAR_EASE },
  },
};

const ICON_HISTORICO: Record<TipoEventoEquipamento, React.ElementType> = {
  CADASTRADO: Plus,
  STATUS_ALTERADO: Sparkle,
  RESPONSAVEL_ATRIBUIDO: UserPlus,
  RESPONSAVEL_REMOVIDO: UserMinus,
  ATUALIZADO: Pencil,
  BAIXADO: Trash2,
};

const ROTULO_HISTORICO: Record<TipoEventoEquipamento, string> = {
  CADASTRADO: 'Cadastrado',
  STATUS_ALTERADO: 'Status alterado',
  RESPONSAVEL_ATRIBUIDO: 'Responsável atribuído',
  RESPONSAVEL_REMOVIDO: 'Responsável removido',
  ATUALIZADO: 'Dados atualizados',
  BAIXADO: 'Equipamento baixado',
};

export function EquipamentoSheet() {
  const { equipamentoId, fechar } = useEquipamentoSheet();
  const open = equipamentoId != null;

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
        <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[600px] outline-none">
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>Detalhes do equipamento</DialogPrimitive.Title>
            <DialogPrimitive.Description>
              Edite o equipamento e veja a atividade dele.
            </DialogPrimitive.Description>
          </VisuallyHidden.Root>

          <AnimatePresence mode="sync">
            {open && equipamentoId != null && (
              <motion.div
                key="sheet"
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ duration: 0.35, ease: SIDEBAR_EASE }}
                className="m-2 flex w-full flex-col overflow-hidden rounded-[2rem] border border-hairline bg-[#131313] shadow-2xl shadow-black/60"
              >
                <SheetCarregador id={equipamentoId} onClose={fechar} />
              </motion.div>
            )}
          </AnimatePresence>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

function SheetCarregador({ id, onClose }: { id: number; onClose: () => void }) {
  const { data: equipamento, isLoading } = useEquipamento(id);

  if (isLoading || !equipamento) {
    return (
      <div className="flex flex-1 items-center justify-center text-mute">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return <SheetConteudo equipamento={equipamento} onClose={onClose} />;
}

function SheetConteudo({
  equipamento,
  onClose,
}: {
  equipamento: EquipamentoResponse;
  onClose: () => void;
}) {
  const { data: usuarios } = useUsuariosLista();
  const { data: chamados } = useChamadosDoEquipamento(equipamento.id);
  const { data: historico } = useHistoricoEquipamento(equipamento.id);
  const atualizar = useAtualizarEquipamento(equipamento.id);
  const excluir = useExcluirEquipamento();
  const navigate = useNavigate();
  const [confirmBaixa, setConfirmBaixa] = useState(false);

  // useForm é inicializado uma vez com os dados reais — sub-componente
  // só monta após equipamento chegar (ver SheetCarregador).
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
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
    },
  });

  const tipo = watch('tipo');
  const status = watch('status');
  const responsavelId = watch('responsavelId');

  async function onSubmit(values: FormValues) {
    try {
      await atualizar.mutateAsync({
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
      toast.success('Equipamento atualizado.');
    } catch (err) {
      const ax = err as AxiosError<ErroResponse>;
      toast.error(ax.response?.data?.mensagens?.[0] ?? 'Erro ao salvar.');
    }
  }

  async function darBaixa() {
    try {
      await excluir.mutateAsync(equipamento.id);
      toast.success(`Equipamento ${equipamento.patrimonio} dado baixa.`);
      setConfirmBaixa(false);
      onClose();
    } catch (err) {
      const ax = err as AxiosError<ErroResponse>;
      toast.error(ax.response?.data?.mensagens?.[0] ?? 'Erro ao dar baixa.');
    }
  }

  const fotoUrl = fotoDoEquipamento({
    tipo: equipamento.tipo,
    marca: equipamento.marca,
    modelo: equipamento.modelo,
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="flex h-full flex-col overflow-hidden"
    >
      {/* Header */}
      <motion.div
        variants={itemVar}
        className="flex shrink-0 items-start justify-between gap-4 px-6 py-5"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={`${equipamento.marca} ${equipamento.modelo}`}
                className="h-full w-full object-contain"
              />
            ) : (
              <HardDrive className="h-7 w-7 text-mute" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-mute">
              <span className="font-mono">{equipamento.patrimonio}</span>
              <span>·</span>
              <span>{tipoEquipamentoLabel[equipamento.tipo]}</span>
            </div>
            <h2 className="mt-1 text-xl font-semibold text-ink-strong">
              {equipamento.marca}
            </h2>
            <p className="text-sm text-body">{equipamento.modelo}</p>
          </div>
        </div>
        <DialogPrimitive.Close className="rounded-full p-1.5 text-mute opacity-70 transition-all hover:bg-[#1a1a1a] hover:text-ink hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary">
          <X className="h-5 w-5" />
          <span className="sr-only">Fechar</span>
        </DialogPrimitive.Close>
      </motion.div>

      <Tabs defaultValue="detalhes" className="flex flex-1 flex-col overflow-hidden">
        <motion.div variants={itemVar} className="shrink-0 px-6 pt-4">
          <TabsList>
            <TabsTrigger value="detalhes">
              <Info className="h-3.5 w-3.5" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="atividade">
              <Activity className="h-3.5 w-3.5" />
              Atividade
              <span className="ml-1 rounded-md bg-[#2a2a2a] px-1.5 text-[10px] font-semibold text-mute">
                {(chamados?.length ?? 0) + (historico?.length ?? 0)}
              </span>
            </TabsTrigger>
          </TabsList>
        </motion.div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-mute/30 [&::-webkit-scrollbar-track]:bg-transparent">
          {/* Detalhes */}
          <TabsContent value="detalhes">
            <form id="form-edit-eq" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-3 md:grid-cols-2">
                <Campo>
                  <Label htmlFor="patrimonio">Patrimônio</Label>
                  <Input id="patrimonio" {...register('patrimonio')} />
                  {errors.patrimonio && <Mensagem msg={errors.patrimonio.message} />}
                </Campo>
                <Campo>
                  <Label>Tipo</Label>
                  <Select
                    value={tipo}
                    onValueChange={(v) =>
                      setValue('tipo', v as TipoEquipamento, { shouldDirty: true })
                    }
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
                </Campo>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Campo>
                  <Label htmlFor="marca">Marca</Label>
                  <Input id="marca" {...register('marca')} />
                  {errors.marca && <Mensagem msg={errors.marca.message} />}
                </Campo>
                <Campo>
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input id="modelo" {...register('modelo')} />
                  {errors.modelo && <Mensagem msg={errors.modelo.message} />}
                </Campo>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Campo>
                  <Label htmlFor="numeroSerie">Número de série</Label>
                  <Input id="numeroSerie" {...register('numeroSerie')} />
                </Campo>
                <Campo>
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    id="localizacao"
                    placeholder="Ex.: Sala 203"
                    {...register('localizacao')}
                  />
                </Campo>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Campo>
                  <Label>Status</Label>
                  <Select
                    value={status}
                    onValueChange={(v) =>
                      setValue('status', v as StatusEquipamento, { shouldDirty: true })
                    }
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
                </Campo>
                <Campo>
                  <Label>Responsável</Label>
                  <Select
                    value={responsavelId || SEM_RESPONSAVEL}
                    onValueChange={(v) => setValue('responsavelId', v, { shouldDirty: true })}
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
                            {u.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </Campo>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Campo>
                  <Label htmlFor="dataAquisicao">Data de aquisição</Label>
                  <Input id="dataAquisicao" type="date" {...register('dataAquisicao')} />
                </Campo>
              </div>

              <Campo>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" rows={3} {...register('observacoes')} />
              </Campo>
            </form>
          </TabsContent>

          {/* Atividade */}
          <TabsContent value="atividade">
            <AtividadeTab
              equipamento={equipamento}
              chamados={chamados ?? []}
              historico={historico ?? []}
              onAbrirChamado={(id) => {
                onClose();
                navigate(`/chamados/${id}`);
              }}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Footer */}
      <motion.div
        variants={itemVar}
        className="flex shrink-0 items-center justify-between gap-3 border-t border-[#2a2a2a] px-6 py-4"
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setConfirmBaixa(true)}
          disabled={equipamento.status === 'BAIXADO'}
        >
          <Trash2 className="h-4 w-4" />
          Dar baixa
        </Button>
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-edit-eq"
            className="rounded-2xl"
            disabled={!isDirty || isSubmitting || atualizar.isPending}
          >
            {atualizar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <Pencil className="h-4 w-4" />
            Salvar alterações
          </Button>
        </div>
      </motion.div>

      <ConfirmDialog
        open={confirmBaixa}
        onOpenChange={setConfirmBaixa}
        titulo={`Dar baixa em ${equipamento.patrimonio}?`}
        descricao="O equipamento ficará com status BAIXADO e perderá o responsável atribuído."
        textoConfirmar="Dar baixa"
        destrutivo
        carregando={excluir.isPending}
        onConfirmar={darBaixa}
      />
    </motion.div>
  );
}

// ────────────── Aba Atividade ──────────────

function AtividadeTab({
  equipamento,
  chamados,
  historico,
  onAbrirChamado,
}: {
  equipamento: EquipamentoResponse;
  chamados: ChamadoResponse[];
  historico: HistoricoEquipamentoResponse[];
  onAbrirChamado: (id: number) => void;
}) {
  return (
    <div className="space-y-6">
      <ResumoSituacao equipamento={equipamento} />

      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-mute">
          Chamados relacionados
        </p>
        {chamados.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-[#1a1a1a] px-4 py-6 text-center text-sm text-mute">
            Nenhum chamado abriu sobre esse equipamento ainda.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {chamados.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onAbrirChamado(c.id)}
                  className="group flex w-full items-start gap-3 rounded-2xl bg-[#1a1a1a] px-3 py-3 text-left transition-colors hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Ticket className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-mute">
                      <span className="font-mono">#{c.id}</span>
                      <span>·</span>
                      <span>{formatarDataHora(c.criadoEm)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-sm font-medium text-ink">
                      {c.titulo}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={c.status} />
                      <PrioridadeBadge prioridade={c.prioridade} />
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-mute opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-mute">
          Histórico
        </p>
        {historico.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-[#1a1a1a] px-4 py-6 text-center text-sm text-mute">
            Sem atividade registrada.
          </p>
        ) : (
          <ol className="relative mt-3 space-y-4 pl-6 before:absolute before:bottom-1 before:left-[11px] before:top-1 before:w-px before:bg-[#2a2a2a]">
            {historico.map((h) => (
              <LinhaHistorico key={h.id} h={h} />
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function ResumoSituacao({ equipamento }: { equipamento: EquipamentoResponse }) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wider text-mute">
        Situação atual
      </p>
      <div className="mt-3 space-y-3">
        <div className="rounded-2xl bg-[#1a1a1a] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-mute">
            Com quem está agora
          </p>
          <div className="mt-2 flex items-center gap-3">
            {equipamento.responsavelNome ? (
              <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {iniciaisDe(equipamento.responsavelNome)}
                </span>
                <p className="text-sm font-medium text-ink">{equipamento.responsavelNome}</p>
              </>
            ) : (
              <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-[#2a2a2a] text-mute">
                  <User className="h-4 w-4" />
                </span>
                <p className="text-sm text-mute">Sem responsável atribuído</p>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <BlocoInfo icon={Sparkle} rotulo="Status" valor={statusEquipamentoLabel[equipamento.status]} />
          <BlocoInfo icon={MapPin} rotulo="Localização" valor={equipamento.localizacao ?? '—'} />
          <BlocoInfo
            icon={Calendar}
            rotulo="Aquisição"
            valor={equipamento.dataAquisicao ? formatarData(equipamento.dataAquisicao) : '—'}
          />
        </div>
      </div>
    </section>
  );
}

function BlocoInfo({
  icon: Icon,
  rotulo,
  valor,
}: {
  icon: React.ElementType;
  rotulo: string;
  valor: string;
}) {
  return (
    <div className="rounded-2xl bg-[#1a1a1a] px-3 py-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-mute">
        <Icon className="h-3 w-3" />
        {rotulo}
      </div>
      <p className="mt-1 truncate text-sm text-ink">{valor}</p>
    </div>
  );
}

function LinhaHistorico({ h }: { h: HistoricoEquipamentoResponse }) {
  const Icon = ICON_HISTORICO[h.tipoEvento] ?? History;
  return (
    <li className="relative">
      <span
        className={cn(
          'absolute -left-[18px] top-1 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-[#131313]',
          h.tipoEvento === 'BAIXADO' ? 'bg-destructive/20 text-red-300' : 'bg-primary/20 text-primary',
        )}
      >
        <Icon className="h-3 w-3" />
      </span>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-mute">
        {ROTULO_HISTORICO[h.tipoEvento]}
      </p>
      <p className="mt-0.5 text-sm text-body">{h.descricao}</p>
      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-mute">
        {h.autorNome && <span>{h.autorNome} ·</span>}
        <CheckCircle2 className="h-2.5 w-2.5 opacity-0" />
        <span>{formatarDataHora(h.criadoEm)}</span>
      </p>
    </li>
  );
}

function Campo({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5">{children}</div>;
}

function Mensagem({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs font-medium text-destructive">{msg}</p>;
}
