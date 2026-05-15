import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  BookOpen,
  LayoutDashboard,
  LifeBuoy,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  ShieldCheck,
  Sun,
  Ticket,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { iniciaisDe } from '@/lib/format';

interface ItemSidebar {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

interface GrupoSidebar {
  label: string;
  items: ItemSidebar[];
}

const itensComum: ItemSidebar[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chamados', label: 'Meus chamados', icon: Ticket },
  { to: '/equipamentos/meus', label: 'Meus equipamentos', icon: Monitor },
  { to: '/chamados/novo', label: 'Novo chamado', icon: Plus },
];

const gruposAdmin: GrupoSidebar[] = [
  {
    label: 'Operações',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/chamados', label: 'Chamados', icon: Ticket },
      { to: '/equipamentos', label: 'Equipamentos', icon: Monitor },
      { to: '/usuarios', label: 'Usuários', icon: Users },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
      { to: '/auditoria', label: 'Auditoria', icon: ShieldCheck },
    ],
  },
  {
    label: 'Conhecimento',
    items: [
      { to: '/base-conhecimento', label: 'Base de conhecimento', icon: BookOpen },
      { to: '/notificacoes', label: 'Notificações', icon: Bell },
    ],
  },
];

export function Sidebar() {
  const { usuario, logout } = useAuth();
  const [colapsada, setColapsada] = useState(false);
  const isAdmin = usuario?.perfil === 'ADMIN';

  return (
    <aside
      className={cn(
        'sticky top-2 hidden h-[calc(100vh-1rem)] shrink-0 flex-col overflow-hidden md:flex',
        'transition-[width] duration-300 ease-out',
        colapsada ? 'w-14' : 'w-60',
      )}
    >
      {/* Header: logo + toggle */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center px-2',
          colapsada ? 'justify-start' : 'justify-between gap-2',
        )}
      >
        {!colapsada && (
          <div className="flex items-center">
            <Logo size={20} />
          </div>
        )}
        <button
          onClick={() => setColapsada((v) => !v)}
          className={cn(
            'flex items-center rounded-md text-mute transition-colors hover:bg-[#1a1a1a] hover:text-ink',
            colapsada ? 'h-9 w-full justify-start pl-1' : 'shrink-0 justify-center p-1.5',
          )}
          aria-label={colapsada ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {colapsada ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      {/* Navegação */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2 pt-2">
        {isAdmin
          ? gruposAdmin.map((grupo) => (
              <GrupoNav key={grupo.label} grupo={grupo} colapsada={colapsada} />
            ))
          : itensComum.map((item) => (
              <ItemNav key={item.to} item={item} colapsada={colapsada} />
            ))}
      </nav>

      {/* Footer: ações + perfil */}
      <FooterSidebar colapsada={colapsada} usuario={usuario} onLogout={logout} />
    </aside>
  );
}

function GrupoNav({ grupo, colapsada }: { grupo: GrupoSidebar; colapsada: boolean }) {
  return (
    <div className="mb-2">
      <p
        className={cn(
          'px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-wider text-mute/70 transition-opacity duration-200',
          colapsada && 'pointer-events-none h-0 overflow-hidden pb-0 pt-0 opacity-0',
        )}
      >
        {grupo.label}
      </p>
      {grupo.items.map((item) => (
        <ItemNav key={item.to} item={item} colapsada={colapsada} />
      ))}
    </div>
  );
}

function ItemNav({ item, colapsada }: { item: ItemSidebar; colapsada: boolean }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/dashboard'}
      title={colapsada ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors duration-200',
          colapsada ? 'justify-center px-2' : 'px-3',
          isActive
            ? colapsada
              ? 'text-primary'
              : 'bg-[#1a1a1a] text-ink'
            : 'text-body hover:bg-[#161616] hover:text-ink',
        )
      }
    >
      <item.icon size={16} className="shrink-0" />
      <span
        className={cn(
          'truncate whitespace-nowrap transition-all duration-200',
          colapsada ? 'w-0 opacity-0' : 'flex-1 opacity-100',
        )}
      >
        {item.label}
      </span>
    </NavLink>
  );
}

function FooterSidebar({
  colapsada,
  usuario,
  onLogout,
}: {
  colapsada: boolean;
  usuario: { nome: string; email: string; perfil: string } | null;
  onLogout: () => void;
}) {
  if (!usuario) return null;
  const iniciais = iniciaisDe(usuario.nome);

  return (
    <div className="mt-auto shrink-0 space-y-1 px-2 pb-2 pt-3">
      <AcaoFooter
        icon={Settings}
        label="Configurações"
        to="/configuracoes"
        colapsada={colapsada}
      />
      <AcaoFooter icon={LifeBuoy} label="Suporte / Ajuda" to="/suporte" colapsada={colapsada} />
      <AparenciaAcao colapsada={colapsada} />

      <div className="my-2 h-px bg-[#1f1f1f]" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'flex w-full items-center rounded-md text-left transition-colors hover:bg-[#161616]',
              colapsada ? 'h-10 justify-center px-1' : 'gap-3 px-2 py-2',
            )}
            aria-label="Menu do usuário"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {iniciais}
            </span>
            <span
              className={cn(
                'min-w-0 flex-1 overflow-hidden transition-opacity duration-200',
                colapsada ? 'w-0 opacity-0' : 'opacity-100',
              )}
            >
              <p className="truncate text-sm font-semibold leading-tight text-ink">
                {usuario.nome}
              </p>
              <p className="truncate text-xs leading-tight text-mute">{usuario.email}</p>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-ink">{usuario.nome}</span>
            <span className="text-xs font-normal text-mute">{usuario.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>Minha conta</DropdownMenuItem>
          <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function AcaoFooter({
  icon: Icon,
  label,
  to,
  colapsada,
}: {
  icon: typeof Settings;
  label: string;
  to: string;
  colapsada: boolean;
}) {
  return (
    <NavLink
      to={to}
      title={colapsada ? label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors',
          colapsada ? 'justify-center px-2' : 'px-3',
          isActive
            ? colapsada
              ? 'text-primary'
              : 'bg-[#1a1a1a] text-ink'
            : 'text-body hover:bg-[#161616] hover:text-ink',
        )
      }
    >
      <Icon size={16} className="shrink-0" />
      <span
        className={cn(
          'truncate whitespace-nowrap transition-all duration-200',
          colapsada ? 'w-0 opacity-0' : 'flex-1 opacity-100',
        )}
      >
        {label}
      </span>
    </NavLink>
  );
}

function AparenciaAcao({ colapsada }: { colapsada: boolean }) {
  function aoEscolher(tema: 'Claro' | 'Escuro' | 'Sistema') {
    if (tema === 'Escuro') {
      toast.info('Você já está no tema escuro.');
    } else {
      toast.info(`Tema ${tema.toLowerCase()} em breve.`);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title={colapsada ? 'Aparência' : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-md py-2 text-sm font-medium text-body transition-colors hover:bg-[#161616] hover:text-ink',
            colapsada ? 'justify-center px-2' : 'px-3',
          )}
        >
          <Moon size={16} className="shrink-0" />
          <span
            className={cn(
              'truncate whitespace-nowrap transition-all duration-200',
              colapsada ? 'w-0 opacity-0' : 'flex-1 text-left opacity-100',
            )}
          >
            Aparência
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" className="w-44">
        <DropdownMenuLabel className="text-xs font-medium uppercase tracking-wider text-mute">
          Tema
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => aoEscolher('Claro')}>
          <Sun className="mr-2 h-4 w-4" />
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => aoEscolher('Escuro')}>
          <Moon className="mr-2 h-4 w-4" />
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => aoEscolher('Sistema')}>
          <Monitor className="mr-2 h-4 w-4" />
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
