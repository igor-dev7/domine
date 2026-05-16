import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface NovoChamadoModalContextValue {
  open: boolean;
  abrir: () => void;
  fechar: () => void;
}

const NovoChamadoModalContext = createContext<NovoChamadoModalContextValue | undefined>(undefined);

export function NovoChamadoModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const abrir = useCallback(() => setOpen(true), []);
  const fechar = useCallback(() => setOpen(false), []);

  return (
    <NovoChamadoModalContext.Provider value={{ open, abrir, fechar }}>
      {children}
    </NovoChamadoModalContext.Provider>
  );
}

export function useNovoChamadoModal() {
  const ctx = useContext(NovoChamadoModalContext);
  if (!ctx) {
    throw new Error('useNovoChamadoModal must be used within NovoChamadoModalProvider');
  }
  return ctx;
}
