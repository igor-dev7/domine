import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  TIPO_META,
  useAtualizarPreferencia,
  usePreferenciasNotificacao,
  type PreferenciaNotificacao,
  type TipoNotificacao,
} from '@/lib/notificacoes';

function Switch({
  checked,
  onCheckedChange,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors',
        checked ? 'bg-primary' : 'bg-[#3a3a3a]',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}

interface ItemPrefProps {
  tipo: TipoNotificacao;
  ativo: boolean;
  disponivel: boolean;
  onChange: (ativo: boolean) => void;
}

function ItemPreferencia({ tipo, ativo, disponivel, onChange }: ItemPrefProps) {
  const meta = TIPO_META[tipo];
  const travado = !disponivel;
  return (
    <div
      aria-disabled={travado}
      className={cn(
        'flex items-center justify-between gap-4 rounded-md px-3 py-3 transition-colors',
        travado ? 'cursor-not-allowed opacity-40' : 'hover:bg-[#131313]',
      )}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Label className={cn('text-sm text-ink', travado && 'cursor-not-allowed')}>
            {meta.label}
          </Label>
          {travado && (
            <span className="rounded-full border border-hairline bg-canvas-soft/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-mute">
              Em breve
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-mute">{meta.descricao}</p>
      </div>
      <Switch checked={ativo} onCheckedChange={onChange} disabled={travado} />
    </div>
  );
}

export function NotificationsSection() {
  const { data: prefs, isLoading, isError } = usePreferenciasNotificacao();
  const atualizar = useAtualizarPreferencia();

  function handleChange(p: PreferenciaNotificacao, ativo: boolean) {
    atualizar.mutate(
      { tipo: p.tipo, ativo },
      {
        onError: () => toast.error('Não foi possível atualizar essa preferência.'),
      },
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-0 bg-[#1a1a1a]">
        <CardHeader>
          <CardTitle className="text-base text-ink">Eventos</CardTitle>
          <p className="text-sm text-mute">O que você quer ser notificado sobre.</p>
        </CardHeader>
        <CardContent className="space-y-1">
          {isLoading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-mute">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando preferências…
            </div>
          )}
          {isError && (
            <p className="px-4 py-3 text-sm text-destructive">
              Não foi possível carregar suas preferências.
            </p>
          )}
          {prefs?.map((p) => (
            <ItemPreferencia
              key={p.tipo}
              tipo={p.tipo}
              ativo={p.ativo}
              disponivel={p.disponivel}
              onChange={(v) => handleChange(p, v)}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 bg-[#1a1a1a]">
        <CardHeader>
          <CardTitle className="text-base text-ink">Canais</CardTitle>
          <p className="text-sm text-mute">Onde as notificações vão chegar.</p>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center justify-between gap-4 rounded-md px-3 py-3 hover:bg-[#131313]">
            <div className="flex-1">
              <Label className="text-sm text-ink">No app</Label>
              <p className="mt-0.5 text-xs text-mute">Ícone de sino no header.</p>
            </div>
            <Switch checked onCheckedChange={() => {}} disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
