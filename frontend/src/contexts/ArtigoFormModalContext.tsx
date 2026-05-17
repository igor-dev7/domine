import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type Modo =
  | { tipo: 'criar' }
  | { tipo: 'editar'; artigoId: number };

interface ArtigoFormModalContextValue {
  modo: Modo | null;
  abrirCriar: () => void;
  abrirEditar: (artigoId: number) => void;
  fechar: () => void;
}

const ArtigoFormModalContext = createContext<ArtigoFormModalContextValue | undefined>(undefined);

export function ArtigoFormModalProvider({ children }: { children: ReactNode }) {
  const [modo, setModo] = useState<Modo | null>(null);
  const abrirCriar = useCallback(() => setModo({ tipo: 'criar' }), []);
  const abrirEditar = useCallback((artigoId: number) => setModo({ tipo: 'editar', artigoId }), []);
  const fechar = useCallback(() => setModo(null), []);

  return (
    <ArtigoFormModalContext.Provider value={{ modo, abrirCriar, abrirEditar, fechar }}>
      {children}
    </ArtigoFormModalContext.Provider>
  );
}

export function useArtigoFormModal() {
  const ctx = useContext(ArtigoFormModalContext);
  if (!ctx) {
    throw new Error('useArtigoFormModal must be used within ArtigoFormModalProvider');
  }
  return ctx;
}
