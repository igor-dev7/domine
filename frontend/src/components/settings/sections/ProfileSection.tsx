import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { formatarTelefone } from '@/lib/format';

export function ProfileSection() {
  const { usuario } = useAuth();
  const [telefone, setTelefone] = useState('');
  if (!usuario) return null;

  const iniciais = usuario.nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-0 bg-[#1a1a1a]">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-xl font-semibold text-primary">
            {iniciais}
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-ink">{usuario.nome}</p>
            <p className="text-sm text-mute">{usuario.email}</p>
            <span className="mt-1 inline-flex rounded-sm border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
              {usuario.perfil}
            </span>
          </div>
          <Button variant="outline" size="sm">
            Trocar foto
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome completo</Label>
            <Input id="nome" defaultValue={usuario.nome} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" defaultValue={usuario.email} disabled />
            <p className="text-xs text-mute">Pra trocar o e-mail, fale com um administrador.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            inputMode="tel"
            placeholder="(11) 99999-0000"
            value={telefone}
            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            maxLength={15}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-hairline pt-4">
        <Button variant="ghost">Cancelar</Button>
        <Button>Salvar alterações</Button>
      </div>
    </div>
  );
}
