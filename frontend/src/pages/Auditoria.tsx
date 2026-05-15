import { useMemo, useState } from 'react';
import { LogIn, LogOut, Pencil, Plus, ShieldAlert, Trash2, UserCog } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatarDataHora } from '@/lib/format';
import { cn } from '@/lib/utils';

type TipoEvento =
  | 'login'
  | 'logout'
  | 'criou'
  | 'editou'
  | 'excluiu'
  | 'permissao'
  | 'seguranca';

interface EventoAuditoria {
  id: number;
  tipo: TipoEvento;
  recurso: string;
  usuario: string;
  descricao: string;
  ip: string;
  criadoEm: string;
}

const ICON_TIPO: Record<TipoEvento, typeof Plus> = {
  login: LogIn,
  logout: LogOut,
  criou: Plus,
  editou: Pencil,
  excluiu: Trash2,
  permissao: UserCog,
  seguranca: ShieldAlert,
};

const COR_TIPO: Record<TipoEvento, string> = {
  login: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/40',
  logout: 'text-mute bg-canvas-soft border-hairline',
  criou: 'text-blue-300 bg-blue-500/10 border-blue-500/40',
  editou: 'text-amber-300 bg-amber-500/10 border-amber-500/40',
  excluiu: 'text-red-300 bg-destructive/15 border-destructive/40',
  permissao: 'text-orange-300 bg-orange-500/10 border-orange-500/40',
  seguranca: 'text-red-300 bg-destructive/20 border-destructive/50',
};

const LABEL_TIPO: Record<TipoEvento, string> = {
  login: 'Login',
  logout: 'Logout',
  criou: 'Criação',
  editou: 'Edição',
  excluiu: 'Exclusão',
  permissao: 'Permissão',
  seguranca: 'Segurança',
};

const EVENTOS: EventoAuditoria[] = [
  {
    id: 1,
    tipo: 'login',
    recurso: 'Autenticação',
    usuario: 'admin@domine.com.br',
    descricao: 'Login bem-sucedido',
    ip: '192.168.0.12',
    criadoEm: '2026-05-15T19:24:11',
  },
  {
    id: 2,
    tipo: 'criou',
    recurso: 'Chamado #42',
    usuario: 'marina@domine.com.br',
    descricao: 'Novo chamado "Notebook não conecta no Wi-Fi"',
    ip: '192.168.0.45',
    criadoEm: '2026-05-15T18:51:02',
  },
  {
    id: 3,
    tipo: 'editou',
    recurso: 'Chamado #42',
    usuario: 'admin@domine.com.br',
    descricao: 'Status alterado de ABERTO para EM_ATENDIMENTO',
    ip: '192.168.0.12',
    criadoEm: '2026-05-15T18:55:34',
  },
  {
    id: 4,
    tipo: 'permissao',
    recurso: 'Usuário #5',
    usuario: 'admin@domine.com.br',
    descricao: 'Perfil de "carlos" elevado de COMUM para ADMIN',
    ip: '192.168.0.12',
    criadoEm: '2026-05-15T17:12:09',
  },
  {
    id: 5,
    tipo: 'criou',
    recurso: 'Equipamento PAT-0089',
    usuario: 'admin@domine.com.br',
    descricao: 'Novo notebook cadastrado e atribuído a "joao"',
    ip: '192.168.0.12',
    criadoEm: '2026-05-15T16:30:55',
  },
  {
    id: 6,
    tipo: 'seguranca',
    recurso: 'Autenticação',
    usuario: 'desconhecido',
    descricao: '5 tentativas de login falhadas para "admin@domine.com.br"',
    ip: '203.0.113.42',
    criadoEm: '2026-05-15T15:48:22',
  },
  {
    id: 7,
    tipo: 'excluiu',
    recurso: 'Usuário #11',
    usuario: 'admin@domine.com.br',
    descricao: 'Desativação de "estagiario.contrato@domine.com.br"',
    ip: '192.168.0.12',
    criadoEm: '2026-05-15T14:02:18',
  },
  {
    id: 8,
    tipo: 'editou',
    recurso: 'Chamado #38',
    usuario: 'admin@domine.com.br',
    descricao: 'Técnico responsável definido como "Admin Domine"',
    ip: '192.168.0.12',
    criadoEm: '2026-05-14T11:14:50',
  },
  {
    id: 9,
    tipo: 'login',
    recurso: 'Autenticação',
    usuario: 'marina@domine.com.br',
    descricao: 'Login bem-sucedido',
    ip: '192.168.0.45',
    criadoEm: '2026-05-14T08:45:03',
  },
  {
    id: 10,
    tipo: 'logout',
    recurso: 'Autenticação',
    usuario: 'admin@domine.com.br',
    descricao: 'Sessão encerrada após 4h sem atividade',
    ip: '192.168.0.12',
    criadoEm: '2026-05-13T22:01:30',
  },
];

const TIPO_OPCOES: { valor: TipoEvento | 'TODOS'; label: string }[] = [
  { valor: 'TODOS', label: 'Todos os tipos' },
  { valor: 'login', label: 'Login' },
  { valor: 'logout', label: 'Logout' },
  { valor: 'criou', label: 'Criação' },
  { valor: 'editou', label: 'Edição' },
  { valor: 'excluiu', label: 'Exclusão' },
  { valor: 'permissao', label: 'Permissão' },
  { valor: 'seguranca', label: 'Segurança' },
];

export function Auditoria() {
  const [tipo, setTipo] = useState<TipoEvento | 'TODOS'>('TODOS');
  const [busca, setBusca] = useState('');

  const linhas = useMemo(() => {
    const buscaLower = busca.toLowerCase();
    return EVENTOS.filter((e) => {
      const passaTipo = tipo === 'TODOS' || e.tipo === tipo;
      const passaBusca =
        !busca ||
        e.recurso.toLowerCase().includes(buscaLower) ||
        e.usuario.toLowerCase().includes(buscaLower) ||
        e.descricao.toLowerCase().includes(buscaLower);
      return passaTipo && passaBusca;
    });
  }, [tipo, busca]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Insights</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">Auditoria</h1>
        <p className="mt-2 max-w-3xl text-sm text-body">
          Trilha consolidada de eventos do sistema — login, alterações, criações, exclusões e
          alertas de segurança. Útil pra conformidade, troubleshooting e investigação de
          incidentes.
        </p>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-mute">
              Eventos
            </CardTitle>
            <span className="rounded-full border border-hairline bg-canvas-soft px-3 py-1 text-xs font-medium text-mute">
              {linhas.length} de {EVENTOS.length} eventos
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Buscar por recurso, usuário ou descrição"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="min-w-[260px] flex-1"
            />
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoEvento | 'TODOS')}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPO_OPCOES.map((o) => (
                  <SelectItem key={o.valor} value={o.valor}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quando</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linhas.map((ev) => {
                  const Icon = ICON_TIPO[ev.tipo];
                  return (
                    <TableRow key={ev.id}>
                      <TableCell className="whitespace-nowrap text-xs text-mute">
                        {formatarDataHora(ev.criadoEm)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider',
                            COR_TIPO[ev.tipo],
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          {LABEL_TIPO[ev.tipo]}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-ink">{ev.recurso}</TableCell>
                      <TableCell className="text-sm text-body">{ev.usuario}</TableCell>
                      <TableCell className="max-w-[360px]">
                        <p className="truncate text-sm text-body">{ev.descricao}</p>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-mute">{ev.ip}</TableCell>
                    </TableRow>
                  );
                })}
                {linhas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-sm text-mute">
                      Nenhum evento encontrado pros filtros aplicados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
