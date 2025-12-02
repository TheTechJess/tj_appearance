import { FC, ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { HandleNuiMessage } from '../Hooks/HandleNuiMessage';

interface ThemeConfig {
  primaryColor: string;
  inactiveColor: string;
}

interface ShapeConfig {
  type: 'hexagon' | 'circle' | 'square' | 'diamond' | 'pentagon';
}

interface CustomizationContextValue {
  theme: ThemeConfig;
  shape: ShapeConfig;
}

const CustomizationContext = createContext<CustomizationContextValue>({
  theme: {
    primaryColor: '#3b82f6',
    inactiveColor: '#202020ff',
  },
  shape: {
    type: 'hexagon',
  },
});

export const useCustomization = () => useContext(CustomizationContext);

export const CustomizationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>({
    primaryColor: '#3b82f6',
    inactiveColor: '#202020ff',
  });

  const [shape, setShape] = useState<ShapeConfig>({
    type: 'hexagon',
  });

  HandleNuiMessage<ThemeConfig>('setThemeConfig', (data) => {
    setTheme(data);
  });

  HandleNuiMessage<ShapeConfig>('setShapeConfig', (data) => {
    setShape(data);
  });

  // Reflect theme colors to CSS variables for global styling (e.g., input ranges)
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--tj-primary', theme.primaryColor);
    root.style.setProperty('--tj-inactive', theme.inactiveColor);
  }, [theme]);

  return (
    <CustomizationContext.Provider value={{ theme, shape }}>
      {children}
    </CustomizationContext.Provider>
  );
};
