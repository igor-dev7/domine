import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { CategoriaChamado, PrioridadeChamado } from '@/types';

export interface NovoChamadoPreset {
  titulo?: string;
  descricao?: string;
  categoria?: CategoriaChamado;
  prioridade?: PrioridadeChamado;
  equipamentoId?: number | null;
}

interface NovoChamadoModalContextValue {
  open: boolean;
  preset: NovoChamadoPreset | null;
  abrir: (preset?: NovoChamadoPreset) => void;
  fechar: () => void;
}

const NovoChamadoModalContext = createContext<NovoChamadoModalContextValue | undefined>(undefined);

export function NovoChamadoModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<NovoChamadoPreset | null>(null);

  const abrir = useCallback((p?: NovoChamadoPreset) => {
    setPreset(p ?? null);
    setOpen(true);
  }, []);
  const fechar = useCallback(() => setOpen(false), []);

  return (
    <NovoChamadoModalContext.Provider value={{ open, preset, abrir, fechar }}>
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
