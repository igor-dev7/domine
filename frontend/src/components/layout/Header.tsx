import { Link, matchPath, useLocation } from 'react-router-dom';
import { ChevronRight, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificacoesDropdown } from '@/components/layout/NotificacoesDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { useSettingsModal } from '@/contexts/SettingsModalContext';
import { cn } from '@/lib/utils';

interface Crumb {
  label: string;
  to?: string;
}

// ── Mapa rota → trilha de breadcrumbs ─────────────────────────────────
// Espelha os grupos do Sidebar pra dar consistência visual entre nav e header.
const ROTAS: Record<string, Crumb[]> = {
  '/dashboard': [{ label: 'Operações' }, { label: 'Dashboard' }],
  '/chamados': [{ label: 'Operações' }, { label: 'Chamados' }],
  '/equipamentos': [{ label: 'Operações' }, { label: 'Equipamentos' }],
  '/equipamentos/meus': [{ label: 'Equipamentos' }, { label: 'Meus equipamentos' }],
  '/usuarios': [{ label: 'Operações' }, { label: 'Usuários' }],
  '/relatorios': [{ label: 'Insights' }, { label: 'Relatórios' }],
  '/auditoria': [{ label: 'Insights' }, { label: 'Auditoria' }],
  '/base-conhecimento': [{ label: 'Conhecimento' }, { label: 'Base de conhecimento' }],
  '/suporte': [{ label: 'Conhecimento' }, { label: 'Suporte' }],
};

function useTrilha(): Crumb[] {
  const { pathname } = useLocation();

  // Detalhes dinâmicos primeiro — match mais específico.
  const chamadoDetalhe = matchPath('/chamados/:id', pathname);
  if (chamadoDetalhe) {
    return [
      { label: 'Operações' },
      { label: 'Chamados', to: '/chamados' },
      { label: `#${chamadoDetalhe.params.id}` },
    ];
  }

  return ROTAS[pathname] ?? [{ label: 'Domine' }];
}

export function Header() {
  const { usuario, logout } = useAuth();
  const { abrir: abrirSettings } = useSettingsModal();
  const trilha = useTrilha();

  if (!usuario) return null;

  const isAdmin = usuario.perfil === 'ADMIN';
  const iniciais = usuario.nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-4 rounded-tl-xl rounded-tr-xl border-b border-[#1f1f1f] bg-[#131313]/85 px-4 backdrop-blur-md md:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Você está em" className="flex min-w-0 items-center gap-1.5 text-sm">
        {trilha.map((crumb, i) => {
          const ultimo = i === trilha.length - 1;
          const conteudo = (
            <span
              className={cn(
                'truncate transition-colors',
                ultimo
                  ? 'font-semibold text-ink-strong'
                  : 'text-mute',
                !ultimo && crumb.to && 'hover:text-ink',
                // O primeiro segmento (grupo) some no mobile pra não estourar.
                i === 0 && trilha.length > 1 && 'hidden md:inline',
              )}
            >
              {crumb.label}
            </span>
          );
          return (
            <div key={`${crumb.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && (
                <ChevronRight
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 text-mute/50',
                    // Esconde o separador inicial quando o primeiro segmento sumiu no mobile.
                    i === 1 && trilha.length > 1 && 'hidden md:inline-block',
                  )}
                />
              )}
              {crumb.to && !ultimo ? (
                <Link
                  to={crumb.to}
                  className="min-w-0 rounded-md text-mute transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {conteudo}
                </Link>
              ) : (
                conteudo
              )}
            </div>
          );
        })}
      </nav>

      {/* Ações */}
      <div className="flex shrink-0 items-center gap-1">
        <NotificacoesDropdown />

        <span aria-hidden className="mx-1.5 hidden h-5 w-px bg-[#2a2a2a] md:inline-block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="group h-9 w-9 rounded-full p-0 hover:bg-canvas-soft"
              aria-label={`Menu da conta de ${usuario.nome}`}
            >
              <Avatar
                className={cn(
                  'h-9 w-9 transition-shadow',
                  isAdmin && 'ring-2 ring-primary/40 ring-offset-2 ring-offset-[#131313]',
                )}
              >
                <AvatarFallback
                  className={cn(
                    'text-xs font-semibold',
                    isAdmin
                      ? 'bg-primary/20 text-primary'
                      : 'bg-canvas-soft text-ink',
                  )}
                >
                  {iniciais}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex items-center gap-3 px-3 py-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback
                  className={cn(
                    'text-sm font-semibold',
                    isAdmin
                      ? 'bg-primary/20 text-primary'
                      : 'bg-canvas-soft text-ink',
                  )}
                >
                  {iniciais}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-strong">
                  {usuario.nome}
                </p>
                <p className="truncate text-xs font-normal text-mute">
                  {usuario.email}
                </p>
                <span
                  className={cn(
                    'mt-1.5 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                    isAdmin
                      ? 'bg-primary/15 text-primary'
                      : 'bg-[#2a2a2a] text-body',
                  )}
                >
                  {isAdmin ? 'Administrador' : 'Usuário'}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => abrirSettings()}>
              <Settings />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => abrirSettings('profile')}>
              <UserIcon />
              Minha conta
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:bg-destructive/15 focus:text-destructive"
            >
              <LogOut />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
