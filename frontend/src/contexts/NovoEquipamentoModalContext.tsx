import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface NovoEquipamentoModalContextValue {
  open: boolean;
  abrir: () => void;
  fechar: () => void;
}

const NovoEquipamentoModalContext = createContext<NovoEquipamentoModalContextValue | undefined>(undefined);

export function NovoEquipamentoModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const abrir = useCallback(() => setOpen(true), []);
  const fechar = useCallback(() => setOpen(false), []);

  return (
    <NovoEquipamentoModalContext.Provider value={{ open, abrir, fechar }}>
      {children}
    </NovoEquipamentoModalContext.Provider>
  );
}

export function useNovoEquipamentoModal() {
  const ctx = useContext(NovoEquipamentoModalContext);
  if (!ctx) {
    throw new Error('useNovoEquipamentoModal must be used within NovoEquipamentoModalProvider');
  }
  return ctx;
}
