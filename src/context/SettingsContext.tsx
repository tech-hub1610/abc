import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, TicketTemplate } from '../types';
import { settingsService } from '../services/settingsService';
import { SEED_SETTINGS } from '../data/seedData';

interface SettingsContextType {
  settings: AppSettings;
  templates: TicketTemplate[];
  activeTemplate: TicketTemplate | null;
  loading: boolean;
  updateSettings: (updates: Partial<AppSettings>) => Promise<AppSettings>;
  setActiveTemplate: (templateId: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
  reloadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(SEED_SETTINGS);
  const [templates, setTemplates] = useState<TicketTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const reloadSettings = async () => {
    try {
      const s = await settingsService.getSettings();
      const tmpls = await settingsService.getTicketTemplates();
      setSettings(s);
      setTemplates(tmpls);
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  };

  useEffect(() => {
    reloadSettings().finally(() => setLoading(false));
  }, []);

  const updateSettings = async (updates: Partial<AppSettings>): Promise<AppSettings> => {
    const updated = await settingsService.updateSettings(updates);
    setSettings(updated);
    return updated;
  };

  const setActiveTemplate = async (templateId: string) => {
    const updated = await settingsService.setActiveTemplate(templateId);
    setSettings(updated);
  };

  const resetDatabase = async () => {
    await settingsService.resetDatabase();
    await reloadSettings();
  };

  const activeTemplate = templates.find((t) => t.id === settings.activeTicketTemplateId) || templates[0] || null;

  return (
    <SettingsContext.Provider
      value={{
        settings,
        templates,
        activeTemplate,
        loading,
        updateSettings,
        setActiveTemplate,
        resetDatabase,
        reloadSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
