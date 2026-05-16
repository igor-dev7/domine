import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface NovoUsuarioModalContextValue {
  open: boolean;
  abrir: () => void;
  fechar: () => void;
}

const NovoUsuarioModalContext = createContext<NovoUsuarioModalContextValue | undefined>(undefined);

export function NovoUsuarioModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const abrir = useCallback(() => setOpen(true), []);
  const fechar = useCallback(() => setOpen(false), []);

  return (
    <NovoUsuarioModalContext.Provider value={{ open, abrir, fechar }}>
      {children}
    </NovoUsuarioModalContext.Provider>
  );
}

export function useNovoUsuarioModal() {
  const ctx = useContext(NovoUsuarioModalContext);
  if (!ctx) {
    throw new Error('useNovoUsuarioModal must be used within NovoUsuarioModalProvider');
  }
  return ctx;
}
