import { LogOut, User as UserIcon } from 'lucide-react';
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
import { cn } from '@/lib/utils';

export function Header() {
  const { usuario, logout } = useAuth();
  if (!usuario) return null;

  const isAdmin = usuario.perfil === 'ADMIN';
  const iniciais = usuario.nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-end gap-4 rounded-tl-xl rounded-tr-xl border-b border-[#1f1f1f] bg-[#131313]/80 px-6 backdrop-blur-md">
      <div className="hidden text-right md:block">
        <p className="text-sm font-semibold leading-tight text-ink">{usuario.nome}</p>
        <p className="text-xs leading-tight text-mute">{usuario.email}</p>
      </div>
      <span
        className={cn(
          'rounded-sm border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider',
          isAdmin
            ? 'border-primary/40 bg-primary/10 text-primary'
            : 'border-hairline bg-canvas-soft text-body',
        )}
      >
        {usuario.perfil}
      </span>
      <NotificacoesDropdown />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-canvas-soft"
            aria-label="Abrir menu da conta"
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-canvas-soft text-xs font-semibold text-ink">
                {iniciais}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-ink">{usuario.nome}</span>
            <span className="text-xs font-normal text-mute">{usuario.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <UserIcon />
            Minha conta
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={logout}
            className="text-destructive focus:bg-destructive/15 focus:text-destructive"
          >
            <LogOut />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
