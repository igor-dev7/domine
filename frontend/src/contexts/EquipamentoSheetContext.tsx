import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface EquipamentoSheetContextValue {
  equipamentoId: number | null;
  abrir: (id: number) => void;
  fechar: () => void;
}

const EquipamentoSheetContext = createContext<EquipamentoSheetContextValue | undefined>(
  undefined,
);

export function EquipamentoSheetProvider({ children }: { children: ReactNode }) {
  const [equipamentoId, setEquipamentoId] = useState<number | null>(null);
  const abrir = useCallback((id: number) => setEquipamentoId(id), []);
  const fechar = useCallback(() => setEquipamentoId(null), []);

  return (
    <EquipamentoSheetContext.Provider value={{ equipamentoId, abrir, fechar }}>
      {children}
    </EquipamentoSheetContext.Provider>
  );
}

export function useEquipamentoSheet() {
  const ctx = useContext(EquipamentoSheetContext);
  if (!ctx) {
    throw new Error('useEquipamentoSheet must be used within EquipamentoSheetProvider');
  }
  return ctx;
}
