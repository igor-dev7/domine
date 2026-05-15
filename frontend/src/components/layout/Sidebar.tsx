import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Monitor,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Ticket,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

interface ItemSidebar {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const itensComum: ItemSidebar[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chamados', label: 'Meus chamados', icon: Ticket },
  { to: '/equipamentos/meus', label: 'Meus equipamentos', icon: Monitor },
  { to: '/chamados/novo', label: 'Novo chamado', icon: Plus },
];

const itensAdmin: ItemSidebar[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chamados', label: 'Chamados', icon: Ticket },
  { to: '/equipamentos', label: 'Equipamentos', icon: Monitor },
  { to: '/usuarios', label: 'Usuários', icon: Users },
];

const STATUS_TAGS = [
  { label: 'Abertos', color: 'bg-blue-500' },
  { label: 'Em atendimento', color: 'bg-amber-500' },
  { label: 'Aguardando', color: 'bg-orange-500' },
  { label: 'Resolvidos', color: 'bg-emerald-500' },
];

export function Sidebar() {
  const { usuario } = useAuth();
  const [colapsada, setColapsada] = useState(false);
  const itens = usuario?.perfil === 'ADMIN' ? itensAdmin : itensComum;

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
            colapsada ? 'h-9 w-full justify-start pl-2' : 'shrink-0 justify-center p-1.5',
          )}
          aria-label={colapsada ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {colapsada ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Navegação */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2 pt-2">
        <p
          className={cn(
            'px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-wider text-mute/70 transition-opacity duration-200',
            colapsada && 'pointer-events-none opacity-0',
          )}
        >
          Navegação
        </p>
        {itens.map((item) => (
          <NavLink
            key={item.to}
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
        ))}

        {/* Status tags - só quando expandida */}
        {!colapsada && (
          <>
            <p className="px-3 pb-1 pt-6 text-xs font-medium uppercase tracking-wider text-mute/70">
              Status
            </p>
            {STATUS_TAGS.map((tag) => (
              <button
                key={tag.label}
                type="button"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-[#161616] hover:text-ink"
              >
                <span className={cn('h-2 w-2 shrink-0 rounded-full', tag.color)} />
                <span className="flex-1 truncate text-left">{tag.label}</span>
              </button>
            ))}
          </>
        )}
      </nav>

      {/* Footer com ações - só quando expandida */}
      {!colapsada && (
        <div className="shrink-0 px-2 pb-2 pt-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-[#161616] hover:text-ink"
          >
            <UserPlus size={16} className="shrink-0" />
            <span>Convidar membro</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-[#161616] hover:text-ink"
          >
            <Palette size={16} className="shrink-0" />
            <span>Aparência</span>
          </button>
        </div>
      )}
    </aside>
  );
}
