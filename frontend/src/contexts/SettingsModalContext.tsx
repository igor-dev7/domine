import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { UserSettingsSection } from '@/components/settings/UserSettingsSidebar';

interface SettingsModalContextValue {
  open: boolean;
  section: UserSettingsSection;
  abrir: (section?: UserSettingsSection) => void;
  fechar: () => void;
  trocarSecao: (section: UserSettingsSection) => void;
}

const SettingsModalContext = createContext<SettingsModalContextValue | undefined>(undefined);

export function SettingsModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<UserSettingsSection>('profile');

  const abrir = useCallback((secao?: UserSettingsSection) => {
    if (secao) setSection(secao);
    setOpen(true);
  }, []);

  const fechar = useCallback(() => setOpen(false), []);

  return (
    <SettingsModalContext.Provider
      value={{ open, section, abrir, fechar, trocarSecao: setSection }}
    >
      {children}
    </SettingsModalContext.Provider>
  );
}

export function useSettingsModal() {
  const ctx = useContext(SettingsModalContext);
  if (!ctx) {
    throw new Error('useSettingsModal must be used within SettingsModalProvider');
  }
  return ctx;
}
