import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface ArtigoDetalheModalContextValue {
  artigoId: number | null;
  abrir: (id: number) => void;
  fechar: () => void;
}

const ArtigoDetalheModalContext = createContext<ArtigoDetalheModalContextValue | undefined>(
  undefined,
);

export function ArtigoDetalheModalProvider({ children }: { children: ReactNode }) {
  const [artigoId, setArtigoId] = useState<number | null>(null);
  const abrir = useCallback((id: number) => setArtigoId(id), []);
  const fechar = useCallback(() => setArtigoId(null), []);

  return (
    <ArtigoDetalheModalContext.Provider value={{ artigoId, abrir, fechar }}>
      {children}
    </ArtigoDetalheModalContext.Provider>
  );
}

export function useArtigoDetalheModal() {
  const ctx = useContext(ArtigoDetalheModalContext);
  if (!ctx) {
    throw new Error('useArtigoDetalheModal must be used within ArtigoDetalheModalProvider');
  }
  return ctx;
}
