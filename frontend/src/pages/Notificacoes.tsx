import { useMemo, useState } from 'react';
import {
  AlertCircle,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    descricao:
      'Faltam 32 minutos pro prazo. Prioridade ALTA, técnico responsável: Admin Domine.',
    lida: false,
    criadoEm: '2026-05-15T19:18:42',
  },
  {
    id: 2,
    tipo: 'novo_chamado',
    titulo: '3 novos chamados aguardando triagem',
    descricao: 'Marina, Carlos e João abriram chamados nos últimos 15 minutos.',
    lida: false,
    criadoEm: '2026-05-15T19:02:11',
  },
  {
    id: 3,
    tipo: 'seguranca',
    titulo: '5 tentativas de login falhadas',
    descricao: 'IP externo (203.0.113.42) tentou autenticar como "admin@domine.com.br".',
    lida: false,
    criadoEm: '2026-05-15T15:48:22',
  },
  {
    id: 4,
    tipo: 'atribuicao',
    titulo: 'Chamado #42 atribuído a você',
    descricao: 'Marina Silva — "Notebook não conecta no Wi-Fi corporativo".',
    lida: true,
    criadoEm: '2026-05-15T18:55:34',
  },
  {
    id: 5,
    tipo: 'comentario',
    titulo: 'Novo comentário no chamado #36',
    descricao: 'Carla Mendes: "Atualização do firmware foi aplicada com sucesso."',
    lida: true,
    criadoEm: '2026-05-15T14:10:18',
  },
  {
    id: 6,
    tipo: 'resolvido',
    titulo: 'Chamado #34 resolvido',
    descricao: 'Bruno Lima marcou como RESOLVIDO após instalar driver da impressora.',
    lida: true,
    criadoEm: '2026-05-15T11:24:09',
  },
  {
    id: 7,
    tipo: 'novo_usuario',
    titulo: 'Novo usuário cadastrado',
    descricao: 'Vinicios Reis (COMUM) foi adicionado ao departamento de Engenharia.',
    lida: true,
    criadoEm: '2026-05-14T16:38:55',
  },
  {
    id: 8,
    tipo: 'sla',
    titulo: 'SLA do chamado #29 violado',
    descricao: 'Resolvido com 1h 12min de atraso. Revisar política de prioridade CRÍTICA.',
    lida: true,
    criadoEm: '2026-05-14T09:50:03',
  },
];

export function Notificacoes() {
  const [lista, setLista] = useState<Notificacao[]>(INICIAL);
  const [filtro, setFiltro] = useState<'todas' | 'nao_lidas'>('todas');

  const naoLidas = useMemo(() => lista.filter((n) => !n.lida).length, [lista]);
  const exibidas = useMemo(
    () => (filtro === 'nao_lidas' ? lista.filter((n) => !n.lida) : lista),
    [lista, filtro],
  );

  function marcarTodasComoLidas() {
    setLista((atual) => atual.map((n) => ({ ...n, lida: true })));
    toast.success('Todas as notificações foram marcadas como lidas.');
  }

  function marcarComoLida(id: number) {
    setLista((atual) => atual.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Conhecimento
          </p>
          <h1 className="mt-2 flex flex-wrap items-center gap-3 text-3xl font-bold tracking-tight text-ink-strong">
            Notificações
            {naoLidas > 0 && (
              <span className="rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
                {naoLidas} não lidas
              </span>
            )}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-body">
            Avisos do sistema sobre SLA, novos chamados, comentários pendentes e eventos de
            segurança.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={marcarTodasComoLidas}
          disabled={naoLidas === 0}
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          Marcar todas como lidas
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-mute">
            Caixa de entrada
          </CardTitle>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => setFiltro('todas')}
              className={cn(
                'rounded-md border px-3 py-1 text-xs font-medium transition-colors',
                filtro === 'todas'
                  ? 'border-primary/40 bg-primary/15 text-primary'
                  : 'border-hairline bg-transparent text-mute hover:text-ink',
              )}
            >
              Todas ({lista.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltro('nao_lidas')}
              className={cn(
                'rounded-md border px-3 py-1 text-xs font-medium transition-colors',
                filtro === 'nao_lidas'
                  ? 'border-primary/40 bg-primary/15 text-primary'
                  : 'border-hairline bg-transparent text-mute hover:text-ink',
              )}
            >
              Não lidas ({naoLidas})
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {exibidas.length === 0 ? (
            <p className="py-12 text-center text-sm text-mute">
              {filtro === 'nao_lidas'
                ? 'Você está em dia. Sem notificações não lidas.'
                : 'Sem notificações.'}
            </p>
          ) : (
            <ul className="divide-y divide-hairline">
              {exibidas.map((notif) => {
                const Icon = ICON_TIPO[notif.tipo];
                return (
                  <li
                    key={notif.id}
                    className={cn(
                      'group flex cursor-pointer items-start gap-3 py-3 transition-colors',
                      !notif.lida && 'bg-canvas/30',
                    )}
                    onClick={() => marcarComoLida(notif.id)}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border',
                        COR_TIPO[notif.tipo],
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className={cn(
                            'text-sm leading-tight',
                            notif.lida ? 'text-body' : 'font-semibold text-ink',
                          )}
                        >
                          {notif.titulo}
                        </p>
                        <span className="shrink-0 text-xs text-mute">
                          {formatarDataHora(notif.criadoEm)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-body">{notif.descricao}</p>
                    </div>
                    {!notif.lida && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
