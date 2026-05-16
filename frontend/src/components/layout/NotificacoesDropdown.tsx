import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Loader2,
  MessageSquare,
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
import {
  useMarcarLida,
  useMarcarTodasLidas,
  useNotificacoes,
  type NotificacaoResponse,
  type TipoNotificacao,
} from '@/lib/notificacoes';
import { cn } from '@/lib/utils';

const ICON_TIPO: Record<TipoNotificacao, typeof AlertCircle> = {
  NOVO_CHAMADO: Ticket,
  ATRIBUICAO: UserPlus,
  COMENTARIO: MessageSquare,
  RESOLVIDO: CheckCircle2,
  SLA: AlertCircle,
};

const COR_TIPO: Record<TipoNotificacao, string> = {
  NOVO_CHAMADO: 'text-blue-300 bg-blue-500/10 border-blue-500/40',
  ATRIBUICAO: 'text-orange-300 bg-orange-500/10 border-orange-500/40',
  COMENTARIO: 'text-amber-300 bg-amber-500/10 border-amber-500/40',
  RESOLVIDO: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/40',
  SLA: 'text-red-300 bg-destructive/15 border-destructive/40',
};

export function NotificacoesDropdown() {
  const navigate = useNavigate();
  const { data, isLoading } = useNotificacoes();
  const marcarLida = useMarcarLida();
  const marcarTodas = useMarcarTodasLidas();

  const itens = data?.itens ?? [];
  const naoLidas = data?.naoLidas ?? 0;

  function abrirNotificacao(n: NotificacaoResponse) {
    if (!n.lida) marcarLida.mutate(n.id);
    if (n.chamadoId != null) {
      navigate(`/chamados/${n.chamadoId}`);
    }
  }

  function handleMarcarTodas() {
    marcarTodas.mutate(undefined, {
      onSuccess: () => toast.success('Todas as notificações foram marcadas como lidas.'),
      onError: () => toast.error('Não foi possível marcar como lidas.'),
    });
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
              onClick={handleMarcarTodas}
              disabled={marcarTodas.isPending}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
            >
              <CheckCheck className="h-3 w-3" />
              Marcar todas
            </button>
          )}
        </div>

        <div className="mx-1.5 h-px bg-[#3a3a3a]" />

        <div className="max-h-[420px] overflow-y-auto p-1.5">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-mute">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
            </div>
          ) : itens.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-mute">Sem notificações.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {itens.map((notif) => {
                const Icon = ICON_TIPO[notif.tipo];
                return (
                  <li key={notif.id}>
                    <button
                      type="button"
                      onClick={() => abrirNotificacao(notif)}
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
                        {notif.descricao && (
                          <p className="mt-1 text-xs text-mute">{notif.descricao}</p>
                        )}
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
