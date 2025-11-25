import { createContext, useContext, ReactNode, FC, useState, useRef } from 'react';
import { Send } from '../enums/events';
import { SendEvent } from '../Utils/eventsHandlers';
import type {
  TAppearance,
  TBlacklist,
  TDrawables,
  THairColor,
  THeadBlend,
  THeadOverlay,
  THeadStructure,
  TModel,
  TOutfit,
  TOutfitData,
  TProps,
  TTab,
  TToggles,
  TValue,
  TZoneTattoo,
  Blacklist,
  TTattoo,
  TJOBDATA,
} from '../types/appearance';

interface AppearanceStoreContextType {
  // State
  tabs: TTab[];
  locale: { [key: string]: string };
  selectedTab: TTab | undefined;
  isValid: Blacklist;
  allowExit: boolean;
  blacklist: TBlacklist | undefined;
  jobData: TJOBDATA;
  originalAppearance: TAppearance | undefined;
  models: TModel[] | undefined;
  outfits: TOutfit[] | undefined;
  tattoos: TZoneTattoo[] | undefined;
  appearance: TAppearance | undefined;
  toggles: TToggles;

  // Setters
  setTabs: (tabs: TTab[]) => void;
  setLocale: (locale: { [key: string]: string }) => void;
  setSelectedTab: (tab: TTab | undefined) => void;
  setIsValid: (isValid: Blacklist) => void;
  setAllowExit: (allowExit: boolean) => void;
  setBlacklist: (blacklist: TBlacklist | undefined) => void;
  setJobData: (jobData: TJOBDATA) => void;
  setOriginalAppearance: (appearance: TAppearance | undefined) => void;
  setModels: (models: TModel[] | undefined) => void;
  setAppearance: (appearance: TAppearance | undefined) => void;

  // Outfits methods
  setOutfits: (outfits: TOutfit[] | undefined) => void;
  saveOutfit: (label: string, job?: { name: string; rank: number } | null) => void;
  editOutfit: (outfit: TOutfit) => void;
  deleteOutfit: (id: number) => void;
  useOutfit: (outfit: TOutfitData) => void;
  importOutfit: (id: number) => void;
  shareOutfit: (id: number) => void;
  itemOutfit: (outfit: TOutfitData, label: string) => void;

  // Tattoos methods
  setTattoos: (tattoos: TZoneTattoo[] | undefined) => void;
  setPlayerTattoos: (tattoos: TTattoo[]) => void;

  // Appearance methods
  cancelAppearance: () => void;
  saveAppearance: () => void;
  setModel: (model: TModel) => void;
  setHeadBlend: (headBlend: THeadBlend) => void;
  setHeadStructure: (headStructure: THeadStructure[keyof THeadStructure]) => void;
  setHeadOverlay: (overlay: THeadOverlay[keyof THeadOverlay]) => void;
  setEyeColor: (eyeColor: TValue) => void;
  setHairColor: (hairColor: THairColor) => void;
  setProp: (prop: TProps[keyof TProps], value: number, isTexture?: boolean) => void;
  setDrawable: (drawable: TDrawables[keyof TDrawables], value: number, isTexture?: boolean) => void;

  // Toggles methods
  toggleItem: (
    item: string,
    toggle: boolean,
    data: TDrawables[keyof TDrawables] | TProps[keyof TProps],
    hook: any,
    hookData: any
  ) => void;
}

const AppearanceStoreContext = createContext<AppearanceStoreContextType | null>(null);

export const AppearanceStoreProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Basic state
  const [tabs, setTabs] = useState<TTab[]>([]);
  const [locale, setLocale] = useState<{ [key: string]: string }>({});
  const [selectedTab, setSelectedTab] = useState<TTab | undefined>(undefined);
  const [isValid, setIsValid] = useState<Blacklist>({ models: true, drawables: true });
  const [allowExit, setAllowExit] = useState<boolean>(true);
  const [blacklist, setBlacklist] = useState<TBlacklist | undefined>(undefined);
  const [jobData, setJobData] = useState<TJOBDATA>({ name: '', isBoss: false });
  const [originalAppearance, setOriginalAppearance] = useState<TAppearance | undefined>(undefined);
  const [models, setModels] = useState<TModel[] | undefined>(undefined);

  // Complex state
  const [outfits, setOutfits] = useState<TOutfit[] | undefined>(undefined);
  const [tattoos, setTattoos] = useState<TZoneTattoo[] | undefined>(undefined);
  const [appearance, setAppearance] = useState<TAppearance | undefined>(undefined);
  const [toggles, setToggles] = useState<TToggles>({
    hats: false,
    masks: false,
    glasses: false,
    shirts: false,
    jackets: false,
    vest: false,
    legs: false,
    shoes: false,
  });

  // Refs for preventing concurrent operations
  const isPropFetching = useRef(false);
  const isDrawableFetching = useRef(false);
  const isToggling = useRef(false);

  // Outfits methods
  const saveOutfit = (label: string, job?: { name: string; rank: number } | null) => {
    if (!appearance) return;

    const outfit: TOutfitData = {
      drawables: appearance.drawables,
      props: appearance.props,
      headOverlay: appearance.headOverlay,
    };

    SendEvent<boolean>(Send.saveOutfit, { label, outfit, job }).then((success) => {
      if (!success || !outfits) return;
      const newOutfits = [...outfits];
      newOutfits.push({
        id: newOutfits.length + 1,
        label: label,
        outfit: JSON.parse(JSON.stringify(outfit)),
        jobname: job?.name || null,
      });
      setOutfits(newOutfits);
    });
  };

  const editOutfit = (outfit: TOutfit) => {
    const { label, id } = outfit;
    SendEvent<boolean>(Send.renameOutfit, { label, id }).then((success) => {
      if (!success || !outfits) return;
      setOutfits(
        outfits.map((o) => (o.id === id ? { ...o, label } : o))
      );
    });
  };

  const deleteOutfit = (id: number) => {
    SendEvent<boolean>(Send.deleteOutfit, { id }).then((success) => {
      if (!success || !outfits) return;
      setOutfits(outfits.filter((outfit) => outfit.id !== id));
    });
  };

  const useOutfit = (outfit: TOutfitData) => {
    SendEvent<boolean>(Send.useOutfit, outfit).then((success) => {
      if (!success || !appearance) return;
      setAppearance({
        ...appearance,
        drawables: outfit.drawables,
        props: outfit.props,
      });
    });
  };

  const importOutfit = (id: number) => {
    if (!outfits) return;
    const outfit = outfits.find((outfit) => outfit.id === id);
    if (outfit) return;

    const outfitName = `Imported Outfit ${outfits.length + 1}`;

    SendEvent<{ success: boolean; id: number; outfit: TOutfitData; label: string }>(
      Send.importOutfit,
      { id, outfitName }
    ).then(({ success, id, outfit, label }) => {
      if (!success) return;
      const newOutfit = { id, label, outfit };
      setOutfits([...(outfits || []), newOutfit]);
    });
  };

  const shareOutfit = (id: number) => {
    const clipElem = document.createElement('textarea');
    clipElem.value = id.toString();
    document.body.appendChild(clipElem);
    clipElem.select();
    document.execCommand('copy');
    document.body.removeChild(clipElem);
  };

  const itemOutfit = (outfit: TOutfitData, label: string) => {
    SendEvent(Send.itemOutfit, { outfit, label });
  };

  // Tattoos methods
  const setPlayerTattoos = (playerTattoos: TTattoo[]) => {
    SendEvent<boolean>(Send.setTattoos, playerTattoos).then((success) => {
      if (!success || !appearance) return;
      setAppearance({ ...appearance, tattoos: playerTattoos });
    });
  };

  // Appearance methods
  const cancelAppearance = () => {
    if (originalAppearance) {
      SendEvent(Send.cancel, originalAppearance);
    }
  };

  const saveAppearance = () => {
    if (appearance) {
      SendEvent(Send.save, appearance);
    }
  };

  const setModel = (model: TModel) => {
    SendEvent<TAppearance>(Send.setModel, model).then((data) => {
      setAppearance(data);
    });

    if (tattoos) {
      SendEvent<TZoneTattoo[]>(Send.getModelTattoos, []).then((newTattoos) => {
        setTattoos(newTattoos);
      });
    }
  };

  const setHeadBlend = (headBlend: THeadBlend) => {
    SendEvent(Send.setHeadBlend, headBlend);
  };

  const setHeadStructure = (headStructure: THeadStructure[keyof THeadStructure]) => {
    SendEvent(Send.setHeadStructure, headStructure);
  };

  const setHeadOverlay = (overlay: THeadOverlay[keyof THeadOverlay]) => {
    SendEvent(Send.setHeadOverlay, overlay);
  };

  const setEyeColor = (eyeColor: TValue) => {
    SendEvent(Send.setHeadOverlay, eyeColor);
  };

  const setHairColor = (hairColor: THairColor) => {
    SendEvent(Send.setHeadOverlay, {
      hairColor: hairColor.color,
      hairHighlight: hairColor.highlight,
      id: 'hairColor',
    });
  };

  const setProp = (prop: TProps[keyof TProps], value: number, isTexture?: boolean) => {
    if (isPropFetching.current || !appearance) return;
    isPropFetching.current = true;

    if (isTexture) prop.texture = value;
    else prop.value = value;

    SendEvent<number>(Send.setProp, {
      value: prop.value,
      index: prop.index,
      texture: prop.texture,
      isTexture: isTexture,
    }).then((propTotal) => {
      setAppearance((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };
        if (!isTexture) {
          updated.propTotal[prop.id!].textures = propTotal;
          prop.texture = 0;
        }
        updated.props[prop.id!] = prop;
        return updated;
      });
      isPropFetching.current = false;
    });
  };

  const setDrawable = (drawable: TDrawables[keyof TDrawables], value: number, isTexture?: boolean) => {
    if (isDrawableFetching.current || !appearance) return;
    isDrawableFetching.current = true;

    if (isTexture) drawable.texture = value;
    else drawable.value = value;

    SendEvent<number>(Send.setDrawable, {
      value: drawable.value,
      index: drawable.index,
      texture: drawable.texture,
      isTexture: isTexture,
    }).then((drawableTotal) => {
      setAppearance((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };
        if (!isTexture) {
          updated.drawTotal[drawable.id!].textures = drawableTotal;
          drawable.texture = 0;
        }
        updated.drawables[drawable.id!] = drawable;
        return updated;
      });
      isDrawableFetching.current = false;
    });
  };

  // Toggles methods
  const toggleItem = (
    item: string,
    toggle: boolean,
    data: TDrawables[keyof TDrawables] | TProps[keyof TProps],
    hook: any,
    hookData: any
  ) => {
    if (isToggling.current) return;
    isToggling.current = true;

    SendEvent<boolean>(Send.toggleItem, {
      item,
      toggle,
      data,
      hook,
      hookData,
    }).then((state) => {
      setToggles((prev) => ({ ...prev, [item]: state }));
      isToggling.current = false;
    });
  };

  const value: AppearanceStoreContextType = {
    tabs,
    locale,
    selectedTab,
    isValid,
    allowExit,
    blacklist,
    jobData,
    originalAppearance,
    models,
    outfits,
    tattoos,
    appearance,
    toggles,
    setTabs,
    setLocale,
    setSelectedTab,
    setIsValid,
    setAllowExit,
    setBlacklist,
    setJobData,
    setOriginalAppearance,
    setModels,
    setOutfits,
    saveOutfit,
    editOutfit,
    deleteOutfit,
    useOutfit,
    importOutfit,
    shareOutfit,
    itemOutfit,
    setTattoos,
    setPlayerTattoos,
    setAppearance,
    cancelAppearance,
    saveAppearance,
    setModel,
    setHeadBlend,
    setHeadStructure,
    setHeadOverlay,
    setEyeColor,
    setHairColor,
    setProp,
    setDrawable,
    toggleItem,
  };

  return (
    <AppearanceStoreContext.Provider value={value}>
      {children}
    </AppearanceStoreContext.Provider>
  );
};

export const useAppearanceStore = () => {
  const context = useContext(AppearanceStoreContext);
  if (!context) {
    throw new Error('useAppearanceStore must be used within AppearanceStoreProvider');
  }
  return context;
};
