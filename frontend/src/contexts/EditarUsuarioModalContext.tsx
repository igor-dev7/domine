import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface EditarUsuarioModalContextValue {
  usuarioId: number | null;
  abrir: (id: number) => void;
  fechar: () => void;
}

const EditarUsuarioModalContext = createContext<EditarUsuarioModalContextValue | undefined>(
  undefined,
);

export function EditarUsuarioModalProvider({ children }: { children: ReactNode }) {
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const abrir = useCallback((id: number) => setUsuarioId(id), []);
  const fechar = useCallback(() => setUsuarioId(null), []);

  return (
    <EditarUsuarioModalContext.Provider value={{ usuarioId, abrir, fechar }}>
      {children}
    </EditarUsuarioModalContext.Provider>
  );
}

export function useEditarUsuarioModal() {
  const ctx = useContext(EditarUsuarioModalContext);
  if (!ctx) {
    throw new Error('useEditarUsuarioModal must be used within EditarUsuarioModalProvider');
  }
  return ctx;
}
