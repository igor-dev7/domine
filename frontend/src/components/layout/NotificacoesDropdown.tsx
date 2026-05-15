import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldAlert,
  Ticket,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatarDataHora } from '@/lib/format';
import { cn } from '@/lib/utils';

type TipoNotificacao =
  | 'sla'
  | 'novo_chamado'
  | 'comentario'
  | 'resolvido'
  | 'atribuicao'
  | 'novo_usuario'
  | 'seguranca';

interface Notificacao {
  id: number;
  tipo: TipoNotificacao;
  titulo: string;
  descricao: string;
  lida: boolean;
  criadoEm: string;
}

const ICON_TIPO: Record<TipoNotificacao, typeof AlertCircle> = {
  sla: AlertCircle,
  novo_chamado: Ticket,
  comentario: MessageSquare,
  resolvido: CheckCircle2,
  atribuicao: Clock,
  novo_usuario: UserPlus,
  seguranca: ShieldAlert,
};

const COR_TIPO: Record<TipoNotificacao, string> = {
  sla: 'text-red-300 bg-destructive/15 border-destructive/40',
  novo_chamado: 'text-blue-300 bg-blue-500/10 border-blue-500/40',
  comentario: 'text-amber-300 bg-amber-500/10 border-amber-500/40',
  resolvido: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/40',
  atribuicao: 'text-orange-300 bg-orange-500/10 border-orange-500/40',
  novo_usuario: 'text-primary bg-primary/10 border-primary/40',
  seguranca: 'text-red-300 bg-destructive/20 border-destructive/50',
};

const INICIAL: Notificacao[] = [
  {
    id: 1,
    tipo: 'sla',
    titulo: 'SLA do chamado #38 prestes a vencer',
    descricao: 'Faltam 32 minutos pro prazo. Prioridade ALTA.',
    lida: false,
    criadoEm: '2026-05-15T19:18:42',
  },
  {
    id: 2,
    tipo: 'novo_chamado',
    titulo: '3 novos chamados aguardando triagem',
    descricao: 'Marina, Carlos e João abriram chamados.',
    lida: false,
    criadoEm: '2026-05-15T19:02:11',
  },
  {
    id: 3,
    tipo: 'seguranca',
    titulo: '5 tentativas de login falhadas',
    descricao: 'IP externo tentou autenticar como admin.',
    lida: false,
    criadoEm: '2026-05-15T15:48:22',
  },
  {
    id: 4,
    tipo: 'atribuicao',
    titulo: 'Chamado #42 atribuído a você',
    descricao: 'Marina Silva — "Notebook não conecta no Wi-Fi".',
    lida: true,
    criadoEm: '2026-05-15T18:55:34',
  },
  {
    id: 5,
    tipo: 'comentario',
    titulo: 'Novo comentário no chamado #36',
    descricao: 'Carla: "Firmware atualizado com sucesso."',
    lida: true,
    criadoEm: '2026-05-15T14:10:18',
  },
  {
    id: 6,
    tipo: 'resolvido',
    titulo: 'Chamado #34 resolvido',
    descricao: 'Bruno marcou como RESOLVIDO.',
    lida: true,
    criadoEm: '2026-05-15T11:24:09',
  },
];

export function NotificacoesDropdown() {
  const [lista, setLista] = useState<Notificacao[]>(INICIAL);
  const naoLidas = useMemo(() => lista.filter((n) => !n.lida).length, [lista]);

  function marcarTodasComoLidas() {
    setLista((atual) => atual.map((n) => ({ ...n, lida: true })));
    toast.success('Todas as notificações foram marcadas como lidas.');
  }

  function marcarComoLida(id: number) {
    setLista((atual) => atual.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-canvas-soft"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
          {naoLidas > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-[#131313] bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
              {naoLidas > 9 ? '9+' : naoLidas}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={12} className="w-[360px] overflow-hidden p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-ink">Notificações</p>
            <p className="text-xs text-mute">
              {naoLidas === 0
                ? 'Você está em dia.'
                : `${naoLidas} ${naoLidas === 1 ? 'não lida' : 'não lidas'}`}
            </p>
          </div>
          {naoLidas > 0 && (
            <button
              type="button"
              onClick={marcarTodasComoLidas}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <CheckCheck className="h-3 w-3" />
              Marcar todas
            </button>
          )}
        </div>

        <div className="mx-1.5 h-px bg-[#3a3a3a]" />

        <div className="max-h-[420px] overflow-y-auto p-1.5">
          {lista.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-mute">Sem notificações.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {lista.map((notif) => {
                const Icon = ICON_TIPO[notif.tipo];
                return (
                  <li key={notif.id}>
                    <button
                      type="button"
                      onClick={() => marcarComoLida(notif.id)}
                      className={cn(
                        'group flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[#3a3a3a]',
                        !notif.lida && 'bg-[#333333]',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border',
                          COR_TIPO[notif.tipo],
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              'text-xs leading-tight',
                              notif.lida ? 'text-body' : 'font-semibold text-ink',
                            )}
                          >
                            {notif.titulo}
                          </p>
                          {!notif.lida && (
                            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="mt-1 text-xs text-mute">{notif.descricao}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-mute/70">
                          {formatarDataHora(notif.criadoEm)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
