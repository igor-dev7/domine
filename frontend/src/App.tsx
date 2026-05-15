import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/PrivateRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/sonner';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { ChamadosLista } from '@/pages/ChamadosLista';
import { ChamadoDetalhe } from '@/pages/ChamadoDetalhe';
import { ChamadoNovo } from '@/pages/ChamadoNovo';

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
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster richColors position="top-right" theme="dark" />
    </>
  );
}
