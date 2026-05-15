import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Pencil, Plus, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonTabela } from '@/components/LoadingSkeleton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useDesativarUsuario, useUsuarios } from '@/lib/usuarios';
import { cn } from '@/lib/utils';
import type { UsuarioResponse } from '@/types';

export function UsuariosLista() {
  const navigate = useNavigate();
  const { usuario: logado } = useAuth();
  const [pagina, setPagina] = useState(0);
  const [paraDesativar, setParaDesativar] = useState<UsuarioResponse | null>(null);

  const { data, isLoading, isFetching } = useUsuarios({ page: pagina, size: 10 });
  const desativar = useDesativarUsuario();

  async function confirmarDesativacao() {
    if (!paraDesativar) return;
    try {
      await desativar.mutateAsync(paraDesativar.id);
      toast.success(`${paraDesativar.nome} desativado.`);
      setParaDesativar(null);
    } catch (err) {
      const ax = err as AxiosError<{ mensagens?: string[] }>;
      toast.error(ax.response?.data?.mensagens?.[0] ?? 'Erro ao desativar usuário.');
    }
  }

  const linhas = data?.content ?? [];
  const totalPaginas = data?.totalPages ?? 0;
  const paginaAtual = pagina + 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Usuários
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-strong">
            Gestão de usuários
          </h1>
          <p className="mt-1 text-sm text-body">
            Cadastre administradores e usuários comuns. A desativação preserva o histórico.
          </p>
        </div>
        <Button asChild>
          <Link to="/usuarios/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo usuário
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <SkeletonTabela colunas={5} linhas={6} />
          ) : linhas.length === 0 ? (
            <EmptyState
              titulo="Nenhum usuário cadastrado."
              descricao="Use o botão acima para criar o primeiro."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead className="w-28 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linhas.map((u) => {
                    const ehVoce = u.id === logado?.id;
                    return (
                      <TableRow key={u.id} className={cn(!u.ativo && 'opacity-60')}>
                        <TableCell>
                          <p className="text-sm font-medium text-ink">{u.nome}</p>
                          {ehVoce && (
                            <p className="text-xs text-primary">você</p>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-body">{u.email}</TableCell>
                        <TableCell className="text-sm text-body">
                          {u.departamento ?? <span className="text-mute">—</span>}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'inline-flex rounded-sm border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider',
                              u.perfil === 'ADMIN'
                                ? 'border-primary/40 bg-primary/10 text-primary'
                                : 'border-hairline bg-canvas-soft text-body',
                            )}
                          >
                            {u.perfil}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'inline-flex rounded-sm border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider',
                              u.ativo
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                                : 'border-hairline bg-canvas-soft text-mute',
                            )}
                          >
                            {u.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => navigate(`/usuarios/${u.id}/editar`)}
                              aria-label="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setParaDesativar(u)}
                              disabled={!u.ativo || ehVoce}
                              aria-label="Desativar"
                              className="text-destructive hover:text-destructive"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {data && data.totalElements > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-3 text-xs text-mute">
              <span>
                Exibindo {data.numberOfElements} de {data.totalElements} usuários{' '}
                {isFetching && '· atualizando…'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.first}
                  onClick={() => setPagina((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="px-2 text-body">
                  Página {paginaAtual} de {Math.max(1, totalPaginas)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.last}
                  onClick={() => setPagina((p) => p + 1)}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!paraDesativar}
        onOpenChange={(o) => !o && setParaDesativar(null)}
        titulo={`Desativar ${paraDesativar?.nome ?? ''}?`}
        descricao="Usuários desativados perdem acesso ao login, mas o histórico de chamados e equipamentos é preservado."
        textoConfirmar="Desativar"
        destrutivo
        carregando={desativar.isPending}
        onConfirmar={confirmarDesativacao}
      />
    </div>
  );
}
