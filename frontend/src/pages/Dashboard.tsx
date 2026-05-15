import { LogOut, Shield, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';

export function Dashboard() {
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
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-hairline bg-canvas">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo size={20} />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-hairline bg-canvas-soft text-xs font-semibold text-ink">
                {iniciais}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-ink leading-tight">{usuario.nome}</p>
                <p className="text-xs text-mute leading-tight">{usuario.email}</p>
              </div>
              <span
                className={
                  isAdmin
                    ? 'rounded-sm border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary'
                    : 'rounded-sm border border-hairline bg-canvas-soft px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-body'
                }
              >
                {usuario.perfil}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-sm border border-hairline bg-canvas px-3 py-1.5 text-sm text-ink hover:border-primary hover:text-primary"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">
            Olá, {usuario.nome.split(' ')[0]}.
          </h1>
          <p className="mt-2 max-w-2xl text-base text-body">
            Login validado com sucesso. Você está autenticado como{' '}
            <span className="text-primary-soft font-semibold">{usuario.perfil}</span>. As próximas
            sprints trarão as telas de chamados, equipamentos e usuários.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card icon={<User size={18} />} title="Sessão ativa" value={usuario.nome} sub={usuario.email} />
          <Card
            icon={<Shield size={18} />}
            title="Perfil"
            value={usuario.perfil}
            sub={isAdmin ? 'acesso total à plataforma' : 'acesso a chamados e equipamentos próprios'}
          />
          <Card
            icon={<Logo size={14} />}
            title="Sprint atual"
            value="Sprint 3"
            sub="setup do frontend"
            iconWrapper={false}
          />
        </div>

        <section className="mt-12 rounded-md border border-hairline bg-canvas-soft p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-mute">
            Próximas etapas
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-body">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              <span>
                Sprint 3 — sidebar com navegação por perfil + layout autenticado
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-hairline-soft" />
              <span>Sprint 4 — fluxo completo de chamados (lista, detalhe, novo)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-hairline-soft" />
              <span>Sprint 5 — CRUDs de equipamentos e usuários</span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

function Card({
  icon,
  title,
  value,
  sub,
  iconWrapper = true,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub?: string;
  iconWrapper?: boolean;
}) {
  return (
    <div className="rounded-md border border-hairline bg-canvas-soft p-5">
      <div className="flex items-center gap-2 text-mute">
        {iconWrapper ? (
          <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-hairline text-primary">
            {icon}
          </div>
        ) : (
          <div className="text-primary">{icon}</div>
        )}
        <p className="text-xs font-semibold uppercase tracking-wider">{title}</p>
      </div>
      <p className="mt-3 text-xl font-bold text-ink-strong">{value}</p>
      {sub && <p className="mt-1 text-sm text-body">{sub}</p>}
    </div>
  );
}
