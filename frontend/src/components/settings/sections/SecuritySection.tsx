import { useState } from 'react';
import { Eye, EyeOff, KeyRound, Loader2, LogOut, Monitor, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatarDataHora } from '@/lib/format';
import {
  descreverDispositivo,
  useEncerrarSessao,
  useSessoes,
  type SessaoResponse,
} from '@/lib/sessoes';

function PasswordInput({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={visivel ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-12"
      />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
        className={cn(
          'absolute inset-y-0 right-3 flex items-center text-mute transition-colors hover:text-ink',
        )}
      >
        {visivel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function SecuritySection() {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-0 bg-[#1a1a1a]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-ink">
            <KeyRound className="h-4 w-4 text-primary" />
            Trocar senha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="senha-atual">Senha atual</Label>
            <PasswordInput id="senha-atual" value={senhaAtual} onChange={setSenhaAtual} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nova-senha">Nova senha</Label>
              <PasswordInput id="nova-senha" value={novaSenha} onChange={setNovaSenha} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmar-senha">Confirmar</Label>
              <PasswordInput id="confirmar-senha" value={confirmar} onChange={setConfirmar} />
            </div>
          </div>
          <Button>Atualizar senha</Button>
        </CardContent>
      </Card>

      <SessoesAtivas />
    </div>
  );
}

function SessoesAtivas() {
  const { data: sessoes, isLoading, isError } = useSessoes();
  const encerrar = useEncerrarSessao();

  function handleEncerrar(s: SessaoResponse) {
    encerrar.mutate(s.id, {
      onSuccess: () => toast.success('Sessão encerrada.'),
      onError: () => toast.error('Não foi possível encerrar essa sessão.'),
    });
  }

  return (
    <Card className="rounded-3xl border-0 bg-[#1a1a1a]">
      <CardHeader>
        <CardTitle className="text-base text-ink">Sessões ativas</CardTitle>
        <p className="text-sm text-mute">
          Dispositivos atualmente conectados na sua conta.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-mute">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando sessões…
          </div>
        )}
        {isError && (
          <p className="px-4 py-3 text-sm text-destructive">
            Não foi possível carregar suas sessões.
          </p>
        )}
        {sessoes?.map((s) => {
          const info = descreverDispositivo(s.userAgent);
          const Icone = info.tipo === 'mobile' ? Smartphone : Monitor;
          return (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl bg-[#131313] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{info.rotulo}</p>
                  <p className="text-xs text-mute">
                    {s.ipOrigem ?? 'IP desconhecido'} ·{' '}
                    {s.ultimoAcessoEm
                      ? `último acesso ${formatarDataHora(s.ultimoAcessoEm)}`
                      : `entrou em ${formatarDataHora(s.criadoEm)}`}
                  </p>
                </div>
              </div>
              {s.atual ? (
                <span className="rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  Atual
                </span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleEncerrar(s)}
                  disabled={encerrar.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Encerrar
                </Button>
              )}
            </div>
          );
        })}
        {sessoes?.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-mute">
            Nenhuma sessão ativa.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

