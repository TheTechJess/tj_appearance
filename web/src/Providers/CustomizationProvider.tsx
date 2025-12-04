import { FC, ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { HandleNuiMessage } from '../Hooks/HandleNuiMessage';

interface ThemeConfig {
  primaryColor: string;
  inactiveColor: string;
  shape?: 'hexagon' | 'circle' | 'square' | 'diamond' | 'pentagon';
}

interface CustomizationContextValue {
  theme: ThemeConfig;
}

const CustomizationContext = createContext<CustomizationContextValue>({
  theme: {
    primaryColor: '#3b82f6',
    inactiveColor: '#202020ff',
    shape: 'hexagon',
  },
});

export const useCustomization = () => useContext(CustomizationContext);

export const CustomizationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>({
    primaryColor: '#3b82f6',
    inactiveColor: '#202020ff',
    shape: 'hexagon',
  });

  HandleNuiMessage<ThemeConfig>('setThemeConfig', (data) => {
    setTheme(data);
  });

  // Reflect theme colors to CSS variables for global styling (e.g., input ranges)
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--tj-primary', theme.primaryColor);
    root.style.setProperty('--tj-inactive', theme.inactiveColor);
  }, [theme]);

  return (
    <CustomizationContext.Provider value={{ theme }}>
      {children}
    </CustomizationContext.Provider>
  );
};
