import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useSettingsModal } from '@/contexts/SettingsModalContext';
import { UserSettingsSidebar, type UserSettingsSection } from './UserSettingsSidebar';
import {
  NotificationsSection,
  PrivacySection,
  ProfileSection,
  SecuritySection,
} from './sections';

const sectionInfo: Record<UserSettingsSection, { title: string; description: string }> = {
  profile: {
    title: 'Meu perfil',
    description: 'Gerencie suas informações pessoais e foto.',
  },
  security: {
    title: 'Segurança',
    description: 'Senha, sessões ativas e dispositivos conectados.',
  },
  notifications: {
    title: 'Notificações',
    description: 'Configure quais avisos você recebe e por onde.',
  },
  privacy: {
    title: 'Privacidade',
    description: 'Controle seus dados e direitos (LGPD).',
  },
};

export function UserSettingsModal() {
  const { open, section, fechar, trocarSecao } = useSettingsModal();

  // Trava scroll do body enquanto modal aberto.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  const renderSection = () => {
    switch (section) {
      case 'profile':
        return <ProfileSection />;
      case 'security':
        return <SecuritySection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'privacy':
        return <PrivacySection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && fechar()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2">
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>Configurações</DialogPrimitive.Title>
            <DialogPrimitive.Description>
              Gerencie suas preferências e dados da conta.
            </DialogPrimitive.Description>
          </VisuallyHidden.Root>

          <AnimatePresence mode="sync">
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
                className="relative flex h-[700px] max-h-[90vh] overflow-hidden rounded-[2rem] border border-hairline bg-[#131313] shadow-2xl shadow-black/60"
              >
                <UserSettingsSidebar
                  activeSection={section}
                  onSectionChange={trocarSecao}
                />

                <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="flex shrink-0 items-start justify-between px-8 pb-4 pt-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-ink-strong">
                        {sectionInfo[section].title}
                      </h2>
                      <p className="mt-1 text-sm text-body">
                        {sectionInfo[section].description}
                      </p>
                    </div>
                    <DialogPrimitive.Close className="rounded-full p-1.5 text-mute opacity-70 transition-all hover:bg-[#1a1a1a] hover:text-ink hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Fechar</span>
                    </DialogPrimitive.Close>
                  </div>

                  <div className="flex-1 overflow-y-auto px-8 pb-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-mute/30 [&::-webkit-scrollbar-track]:bg-transparent">
                    <AnimatePresence mode="sync">
                      <motion.div
                        key={section}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {renderSection()}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
