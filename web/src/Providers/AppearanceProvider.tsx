import { createContext, useContext, ReactNode, FC, useState } from 'react';
import { Tab, Locale, AppearanceState } from '../types/appearance';

interface AppearanceContextType extends AppearanceState {
  setSelectedTab: (tab: Tab | null) => void;
  setLocale: (locale: Locale) => void;
}

const AppearanceContext = createContext<AppearanceContextType | null>(null);

export const AppearanceProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedTab, setSelectedTab] = useState<Tab | null>(null);
  const [locale, setLocale] = useState<Locale>({ MENU_TITLE: 'APPEARANCE' });

  return (
    <AppearanceContext.Provider
      value={{ selectedTab, setSelectedTab, locale, setLocale }}
    >
      {children}
    </AppearanceContext.Provider>
  );
};

export const useAppearance = () => {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error('useAppearance must be used within AppearanceProvider');
  }
  return context;
};
