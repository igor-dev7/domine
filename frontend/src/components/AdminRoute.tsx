import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function AdminRoute() {
  const { usuario } = useAuth();
  if (usuario?.perfil !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
