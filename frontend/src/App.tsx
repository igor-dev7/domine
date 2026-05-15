import { Navigate, Route, Routes } from 'react-router-dom';
import { LifeBuoy, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/PrivateRoute';
import { AdminRoute } from '@/components/AdminRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/sonner';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { ChamadosLista } from '@/pages/ChamadosLista';
import { ChamadoDetalhe } from '@/pages/ChamadoDetalhe';
import { ChamadoNovo } from '@/pages/ChamadoNovo';
import { EquipamentosLista } from '@/pages/EquipamentosLista';
import { MeusEquipamentos } from '@/pages/MeusEquipamentos';
import { EquipamentoForm } from '@/pages/EquipamentoForm';
import { UsuariosLista } from '@/pages/UsuariosLista';
import { UsuarioForm } from '@/pages/UsuarioForm';
import { EmConstrucao } from '@/pages/EmConstrucao';
import { Relatorios } from '@/pages/Relatorios';
import { Auditoria } from '@/pages/Auditoria';
import { BaseConhecimento } from '@/pages/BaseConhecimento';
import { Notificacoes } from '@/pages/Notificacoes';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chamados" element={<ChamadosLista />} />
            <Route path="/chamados/novo" element={<ChamadoNovo />} />
            <Route path="/chamados/:id" element={<ChamadoDetalhe />} />
            <Route path="/equipamentos/meus" element={<MeusEquipamentos />} />

            <Route element={<AdminRoute />}>
              <Route path="/equipamentos" element={<EquipamentosLista />} />
              <Route path="/equipamentos/novo" element={<EquipamentoForm />} />
              <Route path="/equipamentos/:id/editar" element={<EquipamentoForm />} />
              <Route path="/usuarios" element={<UsuariosLista />} />
              <Route path="/usuarios/novo" element={<UsuarioForm />} />
              <Route path="/usuarios/:id/editar" element={<UsuarioForm />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/auditoria" element={<Auditoria />} />
              <Route path="/base-conhecimento" element={<BaseConhecimento />} />
              <Route path="/notificacoes" element={<Notificacoes />} />
              <Route
                path="/configuracoes"
                element={
                  <EmConstrucao
                    titulo="Configurações"
                    descricao="Preferências do sistema, integrações, políticas, categorias customizáveis."
                    icone={Settings}
                  />
                }
              />
              <Route
                path="/suporte"
                element={
                  <EmConstrucao
                    titulo="Suporte e ajuda"
                    descricao="Documentação, atalhos de teclado, contato com o time de plataforma."
                    icone={LifeBuoy}
                  />
                }
              />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster richColors position="top-right" theme="dark" />
    </>
  );
}
