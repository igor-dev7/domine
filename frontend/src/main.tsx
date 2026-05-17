import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import App from './App';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsModalProvider } from '@/contexts/SettingsModalContext';
import { NovoChamadoModalProvider } from '@/contexts/NovoChamadoModalContext';
import { NovoEquipamentoModalProvider } from '@/contexts/NovoEquipamentoModalContext';
import { EquipamentoSheetProvider } from '@/contexts/EquipamentoSheetContext';
import { NovoUsuarioModalProvider } from '@/contexts/NovoUsuarioModalContext';
import { EditarUsuarioModalProvider } from '@/contexts/EditarUsuarioModalContext';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TooltipProvider delayDuration={150} skipDelayDuration={0}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <SettingsModalProvider>
              <NovoChamadoModalProvider>
                <NovoEquipamentoModalProvider>
                  <EquipamentoSheetProvider>
                    <NovoUsuarioModalProvider>
                      <EditarUsuarioModalProvider>
                        <App />
                      </EditarUsuarioModalProvider>
                    </NovoUsuarioModalProvider>
                  </EquipamentoSheetProvider>
                </NovoEquipamentoModalProvider>
              </NovoChamadoModalProvider>
            </SettingsModalProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </TooltipProvider>
  </React.StrictMode>,
);
