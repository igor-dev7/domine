import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  Key,
  type LucideIcon,
  Shield,
  Sliders,
  User,
  UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type UserSettingsSection =
  | 'profile'
  | 'security'
  | 'notifications'
  | 'privacy';

interface SettingsItem {
  id: UserSettingsSection;
  label: string;
  icon: LucideIcon;
}

interface SettingsGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: SettingsItem[];
}

const settingsGroups: SettingsGroup[] = [
  {
    id: 'account',
    label: 'Conta',
    icon: UserCircle,
    items: [
      { id: 'profile', label: 'Meu perfil', icon: User },
      { id: 'security', label: 'Segurança', icon: Key },
    ],
  },
  {
    id: 'preferences',
    label: 'Preferências',
    icon: Sliders,
    items: [{ id: 'notifications', label: 'Notificações', icon: Bell }],
  },
  {
    id: 'privacy',
    label: 'Privacidade',
    icon: Shield,
    items: [{ id: 'privacy', label: 'Privacidade', icon: Shield }],
  },
];

interface Props {
  activeSection: UserSettingsSection;
  onSectionChange: (section: UserSettingsSection) => void;
}

function grupoDoItem(secao: UserSettingsSection): string | undefined {
  return settingsGroups.find((g) => g.items.some((i) => i.id === secao))?.id;
}

export function UserSettingsSidebar({ activeSection, onSectionChange }: Props) {
  // Inicia com apenas o grupo que contém o item ativo aberto.
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    const ativo = grupoDoItem(activeSection);
    return ativo ? [ativo] : [settingsGroups[0].id];
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId],
    );
  };

  return (
    <div className="flex w-72 shrink-0 flex-col overflow-hidden p-3">
      <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-[#1a1a1a]">
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold text-ink">Configurações</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-mute/30 [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="space-y-1">
            {settingsGroups.map((group, groupIndex) => {
              const isExpanded = expandedGroups.includes(group.id);
              const GroupIcon = group.icon;

              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.05, duration: 0.2 }}
                >
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isExpanded
                        ? 'bg-primary/10 text-primary'
                        : 'text-mute hover:bg-[#2a2a2a] hover:text-ink',
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <GroupIcon className="h-4 w-4" />
                      <span>{group.label}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-7 mt-1 space-y-0.5">
                          {group.items.map((item, itemIndex) => {
                            const isActive = activeSection === item.id;
                            const ItemIcon = item.icon;
                            return (
                              <motion.button
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: itemIndex * 0.05 }}
                                onClick={() => onSectionChange(item.id)}
                                className={cn(
                                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                                  isActive
                                    ? 'font-medium text-primary'
                                    : 'text-mute hover:text-ink',
                                )}
                              >
                                <ItemIcon className="h-4 w-4" />
                                <span>{item.label}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
