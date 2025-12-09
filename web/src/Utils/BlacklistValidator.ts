import type { TBlacklist, TOutfitData, TDrawables, TProps } from '../types/appearance';

/**
 * Validates if an outfit contains any blacklisted items
 * @param outfit The outfit data to validate
 * @param blacklist The current blacklist restrictions
 * @returns Object with isValid boolean and array of blacklisted items found
 */
export const validateOutfit = (
  outfit: TOutfitData,
  blacklist: TBlacklist | undefined
): { isValid: boolean; blacklistedItems: string[] } => {
  if (!blacklist) {
    return { isValid: true, blacklistedItems: [] };
  }

  const blacklistedItems: string[] = [];

  // Check drawables (clothing items)
  if (outfit.drawables && blacklist.drawables) {
    Object.entries(outfit.drawables).forEach(([key, drawable]) => {
      if (!drawable) return;

      const componentKey = key as keyof TDrawables;
      const blacklistData = blacklist.drawables?.[componentKey];

      if (blacklistData) {
        // Check if the entire component value is blacklisted
        if (typeof blacklistData === 'object' && 'values' in blacklistData) {
          const values = blacklistData.values as number[] | undefined;
          if (values && values.includes(drawable.value)) {
            blacklistedItems.push(`${key} (${drawable.value})`);
            return;
          }
        }

        // Check if specific texture is blacklisted
        if (typeof blacklistData === 'object' && 'textures' in blacklistData) {
          const textures = blacklistData.textures as { [key: number]: number[] } | undefined;
          if (textures && textures[drawable.value]) {
            const blacklistedTextures = textures[drawable.value];
            if (drawable.texture !== undefined && blacklistedTextures.includes(drawable.texture)) {
              blacklistedItems.push(`${key} texture (${drawable.value}:${drawable.texture})`);
            }
          }
        }
      }
    });
  }

  // Check props (accessories)
  if (outfit.props && blacklist.props) {
    Object.entries(outfit.props).forEach(([key, prop]) => {
      if (!prop) return;

      const propKey = key as keyof TProps;
      const blacklistData = blacklist.props?.[propKey];

      if (blacklistData) {
        // Check if the entire prop value is blacklisted
        if (typeof blacklistData === 'object' && 'values' in blacklistData) {
          const values = blacklistData.values as number[] | undefined;
          if (values && values.includes(prop.value)) {
            blacklistedItems.push(`${key} (${prop.value})`);
            return;
          }
        }

        // Check if specific texture is blacklisted
        if (typeof blacklistData === 'object' && 'textures' in blacklistData) {
          const textures = blacklistData.textures as { [key: number]: number[] } | undefined;
          if (textures && textures[prop.value]) {
            const blacklistedTextures = textures[prop.value];
            if (prop.texture !== undefined && blacklistedTextures.includes(prop.texture)) {
              blacklistedItems.push(`${key} texture (${prop.value}:${prop.texture})`);
            }
          }
        }
      }
    });
  }

  return {
    isValid: blacklistedItems.length === 0,
    blacklistedItems,
  };
};

/**
 * Check if a specific drawable/prop item is blacklisted
 * @param type Type of item ('drawable' or 'prop')
 * @param componentKey The component key (e.g., 'masks', 'hats')
 * @param value The item value
 * @param texture The texture value
 * @param blacklist The current blacklist restrictions
 * @returns true if blacklisted, false otherwise
 */
export const isItemBlacklisted = (
  type: 'drawable' | 'prop',
  componentKey: string,
  value: number,
  texture: number,
  blacklist: TBlacklist | undefined
): boolean => {
  if (!blacklist) return false;

  const blacklistSource = type === 'drawable' ? blacklist.drawables : blacklist.props;
  if (!blacklistSource) return false;

  const blacklistData = blacklistSource[componentKey as keyof typeof blacklistSource];
  if (!blacklistData) return false;

  // Check if value is blacklisted
  if (typeof blacklistData === 'object' && 'values' in blacklistData) {
    const values = blacklistData.values as number[] | undefined;
    if (values && values.includes(value)) {
      return true;
    }
  }

  // Check if texture is blacklisted
  if (typeof blacklistData === 'object' && 'textures' in blacklistData) {
    const textures = blacklistData.textures as { [key: number]: number[] } | undefined;
    if (textures && textures[value]) {
      const blacklistedTextures = textures[value];
      if (blacklistedTextures.includes(texture)) {
        return true;
      }
    }
  }

  return false;
};
