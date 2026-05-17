import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Settings,
  ShieldCheck,
  Sun,
  Ticket,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNovoChamadoModal } from '@/contexts/NovoChamadoModalContext';
import { useSettingsModal } from '@/contexts/SettingsModalContext';
import { Logo } from '@/components/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { iniciaisDe } from '@/lib/format';

function HoverHint({
  active,
  label,
  children,
}: {
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (!active) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block w-full">{children}</span>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={12}
        className="border border-hairline bg-[#1f1f1f] text-ink shadow-lg"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

interface ItemSidebar {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

interface GrupoSidebar {
  label: string;
  items: ItemSidebar[];
}

const STAGGER_MS = 60;

const itensComum: ItemSidebar[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chamados', label: 'Meus chamados', icon: Ticket },
  { to: '/equipamentos/meus', label: 'Meus equipamentos', icon: Monitor },
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
    ],
  },
];

export function Sidebar() {
  const { usuario, logout } = useAuth();
  const { abrir: abrirSettings } = useSettingsModal();
  const { abrir: abrirNovoChamado } = useNovoChamadoModal();
  const [colapsada, setColapsada] = useState(false);
  const isAdmin = usuario?.perfil === 'ADMIN';

  // Contador incremental de delay durante o render (stagger das animações de entrada).
  let i = 0;
  const next = () => ++i * STAGGER_MS;

  return (
    <aside
      className={cn(
        'sticky top-2 hidden h-[calc(100vh-1rem)] shrink-0 flex-col overflow-hidden md:flex',
        'transition-[width] duration-500 ease-in-out',
        colapsada ? 'w-14' : 'w-60',
      )}
    >
      {/* Header: logo + toggle */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center px-2 transition-all duration-500 ease-in-out',
          colapsada ? 'justify-start' : 'justify-between gap-2',
        )}
      >
        <div
          className="animate-element flex items-center"
          style={{ animationDelay: `${next()}ms` }}
        >
          {!colapsada && <Logo variant="completo" cor="degrade" height={20} />}
        </div>
        <HoverHint active={colapsada} label="Expandir sidebar">
          <button
            onClick={() => setColapsada((v) => !v)}
            className={cn(
              'animate-element flex items-center rounded-md text-mute transition-all duration-500 ease-in-out hover:bg-[#1a1a1a] hover:text-ink',
              colapsada ? 'h-9 w-full justify-start pl-1' : 'shrink-0 justify-center p-1.5',
            )}
            style={{ animationDelay: `${next()}ms` }}
            aria-label={colapsada ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {colapsada ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={20} />}
          </button>
        </HoverHint>
      </div>

      {/* CTA: Novo chamado (somente para perfis comuns) */}
      {!isAdmin && (
        <div className="px-2 pt-4">
          <BotaoNovoChamado
            colapsada={colapsada}
            delay={next()}
            onClick={abrirNovoChamado}
          />
        </div>
      )}

      {/* Navegação */}
      <nav
        className={cn(
          'flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2',
          isAdmin ? 'pt-4' : 'pt-5',
        )}
      >
        {isAdmin
          ? gruposAdmin.map((grupo) => (
              <GrupoNav
                key={grupo.label}
                grupo={grupo}
                colapsada={colapsada}
                labelDelay={next()}
                itemDelay={() => next()}
              />
            ))
          : itensComum.map((item) => (
              <ItemNav key={item.to} item={item} colapsada={colapsada} delay={next()} />
            ))}
      </nav>

      {/* Footer: ações + perfil */}
      <FooterSidebar
        colapsada={colapsada}
        usuario={usuario}
        onLogout={logout}
        nextDelay={next}
        onAbrirSettings={abrirSettings}
      />
    </aside>
  );
}

function GrupoNav({
  grupo,
  colapsada,
  labelDelay,
  itemDelay,
}: {
  grupo: GrupoSidebar;
  colapsada: boolean;
  labelDelay: number;
  itemDelay: () => number;
}) {
  return (
    <div className="mb-2">
      <p
        className={cn(
          'animate-element px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-wider text-mute/70 transition-opacity duration-200',
          colapsada && 'pointer-events-none h-0 overflow-hidden pb-0 pt-0 opacity-0',
        )}
        style={{ animationDelay: `${labelDelay}ms` }}
      >
        {grupo.label}
      </p>
      {grupo.items.map((item) => (
        <ItemNav key={item.to} item={item} colapsada={colapsada} delay={itemDelay()} />
      ))}
    </div>
  );
}

function ItemNav({
  item,
  colapsada,
  delay,
}: {
  item: ItemSidebar;
  colapsada: boolean;
  delay: number;
}) {
  return (
    <HoverHint active={colapsada} label={item.label}>
      <NavLink
        to={item.to}
        end={item.to === '/dashboard'}
        style={{ animationDelay: `${delay}ms` }}
        className={({ isActive }) =>
          cn(
            'animate-element group flex w-full items-center gap-3 rounded-md py-2 text-sm font-medium transition-all duration-500 ease-in-out',
            colapsada ? 'justify-center px-2' : 'px-3',
            isActive
              ? colapsada
                ? 'text-primary'
                : "relative bg-gradient-to-r from-primary/20 via-transparent to-transparent text-ink before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-primary before:content-['']"
              : 'text-body hover:bg-[#161616] hover:text-ink',
          )
        }
      >
        <item.icon size={16} className="shrink-0" />
        <span
          className={cn(
            'truncate whitespace-nowrap transition-all duration-500 ease-in-out',
            colapsada ? 'w-0 opacity-0' : 'flex-1 opacity-100',
          )}
        >
          {item.label}
        </span>
      </NavLink>
    </HoverHint>
  );
}

function FooterSidebar({
  colapsada,
  usuario,
  onLogout,
  nextDelay,
  onAbrirSettings,
}: {
  colapsada: boolean;
  usuario: { nome: string; email: string; perfil: string } | null;
  onLogout: () => void;
  nextDelay: () => number;
  onAbrirSettings: (secao?: import('@/components/settings/UserSettingsSidebar').UserSettingsSection) => void;
}) {
  if (!usuario) return null;
  const iniciais = iniciaisDe(usuario.nome);

  const dConfig = nextDelay();
  const dSuporte = nextDelay();
  const dAparencia = nextDelay();
  const dPerfil = nextDelay();

  return (
    <div className="mt-auto shrink-0 space-y-1 px-2 pb-2 pt-3">
      <AcaoFooter
        icon={Settings}
        label="Configurações"
        colapsada={colapsada}
        delay={dConfig}
        onClick={() => onAbrirSettings('profile')}
      />
      <AcaoFooter
        icon={LifeBuoy}
        label="Suporte / Ajuda"
        to="/suporte"
        colapsada={colapsada}
        delay={dSuporte}
      />
      <AparenciaAcao colapsada={colapsada} delay={dAparencia} />

      <div className="my-2 h-px bg-[#1f1f1f]" />

      <DropdownMenu>
        <HoverHint active={colapsada} label={usuario.nome}>
          <DropdownMenuTrigger asChild>
            <button
              style={{ animationDelay: `${dPerfil}ms` }}
              className={cn(
                'animate-element flex w-full items-center rounded-md text-left transition-all duration-500 ease-in-out hover:bg-[#161616]',
                colapsada ? 'h-10 justify-center px-1' : 'gap-3 px-2 py-2',
              )}
              aria-label="Menu do usuário"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {iniciais}
              </span>
              <span
                className={cn(
                  'min-w-0 flex-1 overflow-hidden transition-all duration-500 ease-in-out',
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
        </HoverHint>
        <DropdownMenuContent side="right" align="end" sideOffset={12} className="w-60">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-ink">{usuario.nome}</span>
            <span className="text-xs font-normal text-mute">{usuario.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <UserIcon />
              Minha conta
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onAbrirSettings('profile')}>
                  <UserIcon />
                  Ver perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAbrirSettings('profile')}>
                  <Pencil />
                  Editar dados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAbrirSettings('security')}>
                  <KeyRound />
                  Trocar senha
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onLogout}
            className="text-destructive focus:bg-destructive/15 focus:text-destructive"
          >
            <LogOut />
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
  onClick,
  colapsada,
  delay,
}: {
  icon: typeof Settings;
  label: string;
  to?: string;
  onClick?: () => void;
  colapsada: boolean;
  delay: number;
}) {
  const baseClasses = cn(
    'animate-element flex w-full items-center gap-3 rounded-md py-2 text-sm font-medium text-body transition-all duration-500 ease-in-out hover:bg-[#161616] hover:text-ink',
    colapsada ? 'justify-center px-2' : 'px-3',
  );

  const conteudo = (
    <>
      <Icon size={16} className="shrink-0" />
      <span
        className={cn(
          'truncate whitespace-nowrap transition-all duration-500 ease-in-out',
          colapsada ? 'w-0 opacity-0' : 'flex-1 text-left opacity-100',
        )}
      >
        {label}
      </span>
    </>
  );

  if (to) {
    return (
      <HoverHint active={colapsada} label={label}>
        <NavLink
          to={to}
          style={{ animationDelay: `${delay}ms` }}
          className={({ isActive }) =>
            cn(
              'animate-element flex w-full items-center gap-3 rounded-md py-2 text-sm font-medium transition-all duration-500 ease-in-out',
              colapsada ? 'justify-center px-2' : 'px-3',
              isActive
                ? colapsada
                  ? 'text-primary'
                  : "relative bg-gradient-to-r from-primary/20 via-transparent to-transparent text-ink before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-primary before:content-['']"
                : 'text-body hover:bg-[#161616] hover:text-ink',
            )
          }
        >
          {conteudo}
        </NavLink>
      </HoverHint>
    );
  }

  return (
    <HoverHint active={colapsada} label={label}>
      <button
        type="button"
        onClick={onClick}
        style={{ animationDelay: `${delay}ms` }}
        className={baseClasses}
      >
        {conteudo}
      </button>
    </HoverHint>
  );
}

function AparenciaAcao({ colapsada, delay }: { colapsada: boolean; delay: number }) {
  function aoEscolher(tema: 'Claro' | 'Escuro' | 'Sistema') {
    if (tema === 'Escuro') {
      toast.info('Você já está no tema escuro.');
    } else {
      toast.info(`Tema ${tema.toLowerCase()} em breve.`);
    }
  }

  return (
    <DropdownMenu>
      <HoverHint active={colapsada} label="Aparência">
        <DropdownMenuTrigger asChild>
          <button
            style={{ animationDelay: `${delay}ms` }}
            className={cn(
              'animate-element flex w-full items-center gap-3 rounded-md py-2 text-sm font-medium text-body transition-all duration-500 ease-in-out hover:bg-[#161616] hover:text-ink',
              colapsada ? 'justify-center px-2' : 'px-3',
            )}
          >
            <Moon size={16} className="shrink-0" />
            <span
              className={cn(
                'truncate whitespace-nowrap transition-all duration-500 ease-in-out',
                colapsada ? 'w-0 opacity-0' : 'flex-1 text-left opacity-100',
              )}
            >
              Aparência
            </span>
          </button>
        </DropdownMenuTrigger>
      </HoverHint>
      <DropdownMenuContent side="right" align="end" sideOffset={12} className="w-48">
        <DropdownMenuLabel className="text-xs font-medium uppercase tracking-wider text-mute">
          Tema
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => aoEscolher('Claro')}>
          <Sun />
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => aoEscolher('Escuro')}>
          <Moon />
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => aoEscolher('Sistema')}>
          <Monitor />
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// CTA do topo da sidebar — abre o modal de novo chamado.
function BotaoNovoChamado({
  colapsada,
  delay,
  onClick,
}: {
  colapsada: boolean;
  delay: number;
  onClick: () => void;
}) {
  return (
    <HoverHint active={colapsada} label="Novo chamado">
      <button
        type="button"
        onClick={onClick}
        style={{ animationDelay: `${delay}ms` }}
        className={cn(
          'animate-element flex w-full items-center gap-2 rounded-2xl text-sm font-medium text-on-primary transition-all duration-500 ease-in-out',
          'bg-gradient-to-t from-primary-deep via-primary to-primary-soft',
          'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22),0_2px_4px_rgba(37,99,235,0.25)]',
          'hover:from-primary hover:via-primary-soft hover:to-primary-soft',
          'hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_4px_12px_rgba(37,99,235,0.4)]',
          'active:scale-[0.98]',
          colapsada ? 'h-9 justify-center px-0' : 'px-3 py-2',
        )}
        aria-label="Abrir novo chamado"
      >
        <Plus size={16} className="shrink-0" />
        <span
          className={cn(
            'truncate whitespace-nowrap transition-all duration-500 ease-in-out',
            colapsada ? 'w-0 opacity-0' : 'flex-1 text-left opacity-100',
          )}
        >
          Novo chamado
        </span>
      </button>
    </HoverHint>
  );
}
