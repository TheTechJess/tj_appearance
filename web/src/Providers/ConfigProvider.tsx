import { createContext, useContext, ReactNode, FC, useState, useEffect } from 'react';

interface Config {
  /** Fallback resource name for when the resource name cannot be found. */
  fallbackResourceName: string;
  /** Whether the escape key should make visibility false. */
  allowEscapeKey: boolean;
}

interface ConfigContextType {
  config: Config;
  setConfig: (config: Partial<Config>) => void;
  resourceName: string;
  isBrowser: boolean;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

const defaultConfig: Config = {
  fallbackResourceName: 'debug',
  allowEscapeKey: true,
};

const getResourceName = (): string => {
  return (window as any).GetParentResourceName
    ? (window as any).GetParentResourceName()
    : defaultConfig.fallbackResourceName;
};

const getIsBrowser = (): boolean => {
  return !(window as any).invokeNative;
};

export const ConfigProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<Config>(defaultConfig);
  const [resourceName] = useState<string>(getResourceName());
  const [isBrowser] = useState<boolean>(getIsBrowser());
  const [visible, setVisible] = useState<boolean>(false);

  const setConfig = (newConfig: Partial<Config>) => {
    setConfigState(prev => ({ ...prev, ...newConfig }));
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        setConfig,
        resourceName,
        isBrowser,
        visible,
        setVisible,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
};
