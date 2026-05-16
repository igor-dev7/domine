import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Check, Database, Download, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import {
  exportarMeusDados,
  useExcluirConta,
  usePreExclusao,
  type CandidatoPromocao,
} from '@/lib/conta';
import { useSettingsModal } from '@/contexts/SettingsModalContext';
import { iniciaisDe } from '@/lib/format';

export function PrivacySection() {
  const [exportando, setExportando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  async function handleExportar() {
    try {
      setExportando(true);
      await exportarMeusDados();
      toast.success('Seus dados foram exportados.');
    } catch {
      toast.error('Não foi possível exportar seus dados.');
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-0 bg-[#1a1a1a]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-ink">
            <Database className="h-4 w-4 text-primary" />
            Seus dados
          </CardTitle>
          <p className="text-sm text-mute">
            Tem direito de acessar e remover seus dados pessoais (LGPD Art. 18).
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-6 rounded-2xl bg-[#131313] px-4 py-3">
            <div className="max-w-[360px]">
              <p className="text-sm font-medium text-ink">Exportar dados</p>
              <p className="text-xs text-mute">
                Receba um arquivo JSON com seu perfil, chamados, comentários e notificações.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportar}
              disabled={exportando}
            >
              {exportando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Exportar
            </Button>
          </div>

          <div className="flex items-center justify-between gap-6 rounded-2xl bg-destructive/5 px-4 py-3 ring-1 ring-destructive/30">
            <div className="max-w-[360px]">
              <p className="text-sm font-medium text-ink">Excluir minha conta</p>
              <p className="text-xs text-mute">
                Ação irreversível. Histórico de chamados anonimizado, dados pessoais apagados.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setModalAberto(true)}
            >
              <Trash2 className="h-4 w-4" />
              Excluir conta
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmarExclusaoModal open={modalAberto} onOpenChange={setModalAberto} />
    </div>
  );
}

function ConfirmarExclusaoModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { usuario, logout } = useAuth();
  const { fechar: fecharSettings } = useSettingsModal();
  const navigate = useNavigate();
  const preExclusao = usePreExclusao(open);
  const excluir = useExcluirConta();

  const [emailConfirmacao, setEmailConfirmacao] = useState('');
  const [promoverId, setPromoverId] = useState<string>('');

  const precisaPromover = preExclusao.data?.precisaPromoverAdmin ?? false;
  const candidatos = preExclusao.data?.candidatos ?? [];
  const emailBate =
    !!usuario && emailConfirmacao.trim().toLowerCase() === usuario.email.toLowerCase();
  const promocaoOk = !precisaPromover || promoverId !== '';
  const podeExcluir = emailBate && promocaoOk && !preExclusao.isLoading;

  function handleClose(v: boolean) {
    if (excluir.isPending) return;
    if (!v) {
      setEmailConfirmacao('');
      setPromoverId('');
    }
    onOpenChange(v);
  }

  async function handleConfirmar() {
    excluir.mutate(
      {
        confirmacaoEmail: emailConfirmacao.trim(),
        promoverUsuarioId: precisaPromover ? Number(promoverId) : null,
      },
      {
        onSuccess: () => {
          toast.success('Sua conta foi excluída.');
          fecharSettings();
          logout();
          navigate('/login', { replace: true });
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { mensagens?: string[] } } })?.response?.data
              ?.mensagens?.[0] ?? 'Não foi possível excluir sua conta.';
          toast.error(msg);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogPortal>
        <DialogOverlay className="bg-black/70 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[60] w-[min(480px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-[#1a1a1a] p-6 shadow-2xl shadow-black/60">
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>Confirmar exclusão da conta</DialogPrimitive.Title>
            <DialogPrimitive.Description>
              Confirme o e-mail da sua conta para concluir a exclusão.
            </DialogPrimitive.Description>
          </VisuallyHidden.Root>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">Excluir sua conta?</h3>
              <p className="mt-1 text-sm text-mute">
                Essa ação é irreversível. Seus dados pessoais serão apagados e o histórico
                de chamados ficará anonimizado.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {preExclusao.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-mute">
                <Loader2 className="h-4 w-4 animate-spin" /> Verificando sua conta…
              </div>
            ) : (
              <>
                {precisaPromover && (
                  <div className="space-y-2 rounded-2xl bg-amber-500/10 px-4 py-3 ring-1 ring-amber-500/40">
                    <p className="text-sm font-medium text-amber-200">
                      Você é o único administrador ativo.
                    </p>
                    <p className="text-xs text-amber-200/80">
                      Promova outro usuário a administrador antes de excluir sua conta.
                    </p>
                    <div className="pt-1">
                      <Label className="text-xs text-amber-200/90">
                        Promover a administrador
                      </Label>
                      <Select value={promoverId} onValueChange={setPromoverId}>
                        <SelectTrigger className="mt-1 h-14 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-3">
                          {(() => {
                            const selecionado = candidatos.find(
                              (c) => String(c.id) === promoverId,
                            );
                            if (selecionado) {
                              return (
                                <SelectValue aria-label={selecionado.nome}>
                                  <AvatarUsuario nome={selecionado.nome} size="sm" />
                                  <div className="min-w-0 flex-1 text-left">
                                    <p className="truncate text-sm font-medium text-ink">
                                      {selecionado.nome}
                                    </p>
                                    <p className="truncate text-xs text-mute">
                                      {selecionado.email}
                                    </p>
                                  </div>
                                </SelectValue>
                              );
                            }
                            return (
                              <SelectValue
                                placeholder={
                                  candidatos.length === 0
                                    ? 'Nenhum usuário ativo disponível'
                                    : 'Selecione um usuário'
                                }
                              />
                            );
                          })()}
                        </SelectTrigger>
                        <SelectContent className="z-[70] min-w-[var(--radix-select-trigger-width)]">
                          {candidatos.map((c) => (
                            <UsuarioSelectItem key={c.id} usuario={c} />
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="confirm-email" className="text-sm">
                    Digite seu e-mail{' '}
                    <span className="text-mute">({usuario?.email})</span> para confirmar
                  </Label>
                  <Input
                    id="confirm-email"
                    type="email"
                    autoComplete="off"
                    placeholder="seu@email.com"
                    value={emailConfirmacao}
                    onChange={(e) => setEmailConfirmacao(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => handleClose(false)}
              disabled={excluir.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmar}
              disabled={!podeExcluir || excluir.isPending}
            >
              {excluir.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Excluir permanentemente
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

function AvatarUsuario({ nome, size = 'md' }: { nome: string; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'h-9 w-9 text-xs' : 'h-10 w-10 text-sm';
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary ${dim}`}
    >
      {iniciaisDe(nome)}
    </span>
  );
}

function UsuarioSelectItem({ usuario }: { usuario: CandidatoPromocao }) {
  return (
    <SelectPrimitive.Item
      value={String(usuario.id)}
      textValue={usuario.nome}
      className="relative flex w-full cursor-default select-none items-center gap-3 rounded-md py-2 pl-3 pr-9 text-sm text-body outline-none transition-colors focus:bg-[#3a3a3a] focus:text-ink data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    >
      <AvatarUsuario nome={usuario.nome} />
      <div className="min-w-0 flex-1 text-left">
        <SelectPrimitive.ItemText asChild>
          <p className="truncate text-sm font-medium text-ink">{usuario.nome}</p>
        </SelectPrimitive.ItemText>
        <p className="truncate text-xs text-mute">{usuario.email}</p>
      </div>
      <span className="absolute right-3 flex h-3.5 w-3.5 items-center justify-center text-primary">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-3.5 w-3.5" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}
