import { useEffect } from 'react';
import { useAppearanceStore } from '../Providers/AppearanceStoreProvider';
import { HandleNuiMessage } from '../Hooks/HandleNuiMessage';
import type { TMenuData } from '../types/appearance';

/**
 * Hook to listen for debug data events and populate the appearance store
 */
export const useDebugDataReceiver = () => {
  const {
    setTabs,
    setAppearance,
    setAllowExit,
    setBlacklist,
    setTattoos,
    setOutfits,
    setModels,
    setLocale,
    setSelectedTab,
  } = useAppearanceStore();

  HandleNuiMessage<TMenuData>('data', (data) => {
    console.log('[Debug] Received data via HandleNuiMessage:', data);

    // Parse locale if it's a string
    const locale = typeof data.locale === 'string' 
      ? JSON.parse(data.locale) 
      : data.locale;

    console.log('[Debug] Parsed locale:', locale);

    // Set all the data
    setLocale(locale);
    setAppearance(data.appearance);
    setAllowExit(data.allowExit);
    setBlacklist(data.blacklist);
    setTattoos(data.tattoos);
    setOutfits(data.outfits);
    setModels(data.models);

    // Create tabs from the tab names
    const tabs = (Array.isArray(data.tabs) ? data.tabs : [data.tabs]).map((tabId) => ({
      id: tabId,
      label: locale[tabId.toUpperCase()] || tabId,
      icon: `Icon${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`,
      src: tabId,
    }));

    console.log('[Debug] Created tabs:', tabs);
    setTabs(tabs);
    
    // Set first tab as selected
    if (tabs.length > 0) {
      console.log('[Debug] Setting selected tab:', tabs[0]);
      setSelectedTab(tabs[0]);
    }
  });
};
