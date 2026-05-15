import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Monitor, Plus, Ticket, Users } from 'lucide-react';
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

export function Sidebar() {
  const { usuario } = useAuth();
  const itens = usuario?.perfil === 'ADMIN' ? itensAdmin : itensComum;

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-hairline bg-canvas-soft">
      <div className="flex h-16 items-center border-b border-hairline px-6">
        <Logo size={20} />
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p className="px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-[0.18em] text-mute">
          Navegação
        </p>
        {itens.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-body hover:bg-canvas hover:text-ink',
              )
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-hairline px-4 py-3">
        <p className="text-xs text-mute">
          Perfil:{' '}
          <span className="font-semibold text-ink">{usuario?.perfil ?? '—'}</span>
        </p>
      </div>
    </aside>
  );
}
