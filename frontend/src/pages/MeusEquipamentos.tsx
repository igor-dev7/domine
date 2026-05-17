import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  HardDrive,
  MapPin,
  Monitor,
  PackagePlus,
  Printer,
  Shapes,
  Signal,
  Smartphone,
  Tag,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonLinhas } from '@/components/LoadingSkeleton';
import { useNovoChamadoModal } from '@/contexts/NovoChamadoModalContext';
import { useMeusEquipamentos } from '@/lib/equipamentos';
import { fotoDoEquipamento } from '@/lib/fotoEquipamento';
import {
  formatarData,
  statusEquipamentoLabel,
  tipoEquipamentoLabel,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import type {
  EquipamentoResponse,
  StatusEquipamento,
  TipoEquipamento,
} from '@/types';

const SIDEBAR_EASE = [0.16, 1, 0.3, 1] as const;

const stagger = {
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
  },
  item: {
    hidden: { opacity: 0, y: 20, filter: 'blur(12px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.8, ease: SIDEBAR_EASE },
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 400, damping: 25, mass: 0.7 },
  },
};

interface CoresStatus {
  bg: string;
  text: string;
  dot: string;
}

const COR_STATUS: Record<StatusEquipamento, CoresStatus> = {
  EM_USO: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  ESTOQUE: { bg: 'bg-blue-500/10', text: 'text-blue-300', dot: 'bg-blue-400' },
  MANUTENCAO: { bg: 'bg-amber-500/10', text: 'text-amber-300', dot: 'bg-amber-400' },
  BAIXADO: { bg: 'bg-[#2a2a2a]', text: 'text-mute', dot: 'bg-mute' },
};

const ICONE_TIPO: Record<TipoEquipamento, React.ElementType> = {
  NOTEBOOK: HardDrive,
  DESKTOP: HardDrive,
  MONITOR: HardDrive,
  IMPRESSORA: Printer,
  CELULAR: Smartphone,
  PERIFERICO: Wrench,
  OUTRO: Shapes,
};

// 6 colunas: Foto | Patrimônio | Tipo | Marca/Modelo | Status | Localização | Aquisição
const GRID_COLS =
  'grid-cols-[68px_140px_140px_minmax(200px,1fr)_160px] ' +
  'xl:grid-cols-[68px_140px_140px_minmax(220px,1fr)_160px_180px_140px]';

export function MeusEquipamentos() {
  const { data, isLoading } = useMeusEquipamentos();
  const { abrir: abrirNovoChamado } = useNovoChamadoModal();

  function solicitarEquipamento() {
    abrirNovoChamado({
      titulo: 'Solicitação de equipamento',
      descricao:
        'Equipamento desejado: \nMotivo da solicitação: \nPrazo necessário: ',
      categoria: 'HARDWARE',
      prioridade: 'MEDIA',
    });
  }

  const linhas = data ?? [];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger.container}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={stagger.item}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Equipamentos
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">
            Meus equipamentos
          </h1>
          <p className="mt-1 text-sm text-body">
            Itens atribuídos a você. Em caso de problema, abra um chamado relacionado.
          </p>
        </div>
        <Button className="rounded-2xl" onClick={solicitarEquipamento}>
          <PackagePlus className="h-4 w-4" />
          Solicitar equipamento
        </Button>
      </motion.div>

      {/* Tabela */}
      <motion.div variants={stagger.item} className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-ink">
              {data ? `${linhas.length} equipamentos` : 'Atribuídos a você'}
            </h3>
            <p className="mt-1 text-xs text-mute">
              {isLoading ? 'carregando…' : 'Atualizado em tempo real'}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-[#1a1a1a]">
          {isLoading ? (
            <div className="p-6">
              <SkeletonLinhas linhas={4} />
            </div>
          ) : linhas.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<Monitor className="h-5 w-5" />}
                titulo="Você ainda não tem equipamentos atribuídos."
                descricao="Solicite um equipamento ou procure o ADMIN responsável."
                acao={
                  <Button variant="outline" onClick={solicitarEquipamento}>
                    <PackagePlus className="h-4 w-4" />
                    Solicitar equipamento
                  </Button>
                }
              />
            </div>
          ) : (
            <div>
              <div
                className={cn(
                  'grid items-center bg-[#131313] px-4 py-3 text-xs font-medium uppercase tracking-wider text-mute/70',
                  GRID_COLS,
                )}
              >
                <div className="border-r border-[#2a2a2a] px-3" />
                <ColunaHead icon={Tag}>Patrimônio</ColunaHead>
                <ColunaHead icon={HardDrive}>Tipo</ColunaHead>
                <ColunaHead icon={Shapes}>Marca / Modelo</ColunaHead>
                <ColunaHead icon={Signal}>Status</ColunaHead>
                <ColunaHead icon={MapPin} className="hidden xl:flex">
                  Localização
                </ColunaHead>
                <ColunaHead icon={Calendar} className="hidden xl:flex">
                  Aquisição
                </ColunaHead>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
                  }}
                >
                  {linhas.map((eq) => (
                    <motion.div key={eq.id} variants={rowVariants}>
                      <LinhaEquipamento eq={eq} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────── Foto thumb ───────────────────────

function FotoEquipamento({ eq }: { eq: EquipamentoResponse }) {
  const [erro, setErro] = useState(false);
  const url = fotoDoEquipamento({ tipo: eq.tipo, marca: eq.marca, modelo: eq.modelo });
  const Icone = ICONE_TIPO[eq.tipo] ?? HardDrive;

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center">
      {url && !erro ? (
        <img
          src={url}
          alt={`${eq.marca} ${eq.modelo}`}
          loading="lazy"
          onError={() => setErro(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <Icone className="h-6 w-6 text-mute" strokeWidth={1.5} />
      )}
    </div>
  );
}

// ─────────────────────── Linha ───────────────────────

function LinhaEquipamento({ eq }: { eq: EquipamentoResponse }) {
  const IconeTipo = ICONE_TIPO[eq.tipo] ?? HardDrive;
  const cor = COR_STATUS[eq.status];

  return (
    <div
      className={cn(
        'grid w-full items-center border-b border-[#2a2a2a] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent',
        GRID_COLS,
      )}
    >
      {/* Foto */}
      <div className="flex items-center border-r border-[#2a2a2a] px-2">
        <FotoEquipamento eq={eq} />
      </div>

      {/* Patrimônio */}
      <div className="flex items-center border-r border-[#2a2a2a] px-3 font-mono text-xs text-ink">
        {eq.patrimonio}
      </div>

      {/* Tipo */}
      <div className="flex items-center gap-2 border-r border-[#2a2a2a] px-3 text-sm text-body">
        <IconeTipo className="h-4 w-4 text-mute" />
        <span className="truncate">{tipoEquipamentoLabel[eq.tipo]}</span>
      </div>

      {/* Marca / Modelo */}
      <div className="min-w-0 border-r border-[#2a2a2a] px-3">
        <p className="truncate text-sm font-medium text-ink">{eq.marca}</p>
        <p className="truncate text-xs text-mute">{eq.modelo}</p>
      </div>

      {/* Status (read-only) */}
      <div className="flex items-center border-r border-[#2a2a2a] px-3 xl:border-r">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium',
            cor.bg,
            cor.text,
          )}
        >
          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', cor.dot)} />
          {statusEquipamentoLabel[eq.status]}
        </span>
      </div>

      {/* Localização (xl+) */}
      <div className="hidden items-center border-r border-[#2a2a2a] px-3 text-sm text-body xl:flex">
        {eq.localizacao ?? <span className="text-mute">—</span>}
      </div>

      {/* Aquisição (xl+) */}
      <div className="hidden items-center px-3 text-xs text-mute xl:flex">
        {formatarData(eq.dataAquisicao)}
      </div>
    </div>
  );
}

// ─────────────────────── Helpers ───────────────────────

function ColunaHead({
  icon: Icon,
  children,
  className,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 border-r border-[#2a2a2a] px-3 last:border-r-0',
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 opacity-50" />
      <span className="truncate">{children}</span>
    </div>
  );
}
