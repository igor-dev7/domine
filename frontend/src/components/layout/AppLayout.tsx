import { Outlet } from 'react-router-dom';
import { UserSettingsModal } from '@/components/settings/UserSettingsModal';
import { NovoChamadoModal } from '@/components/chamado/NovoChamadoModal';
import { NovoEquipamentoModal } from '@/components/equipamento/NovoEquipamentoModal';
import { EquipamentoSheet } from '@/components/equipamento/EquipamentoSheet';
import { NovoUsuarioModal } from '@/components/usuario/NovoUsuarioModal';
import { EditarUsuarioModal } from '@/components/usuario/EditarUsuarioModal';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0a] p-2">
      <Sidebar />
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#1f1f1f] bg-[#131313] shadow-lg">
        <Header />
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </div>
      </main>
      <UserSettingsModal />
      <NovoChamadoModal />
      <NovoEquipamentoModal />
      <EquipamentoSheet />
      <NovoUsuarioModal />
      <EditarUsuarioModal />
    </div>
  );
}
