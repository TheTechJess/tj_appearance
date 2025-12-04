-- Client-side cache loader for appearance data
-- Loads all data from JSON files directly instead of requesting from server
local handleNuiMessage = require('modules.nui')
local Cache = {
    theme = {},
    modelssorted = false,
    models = {},
    zones = {},
    outfits = {},
    shopSettings = {},
    shopConfigs = {},
    blacklist = {},
}

-- Load settings (locked models) from JSON
local function loadSettings()
    local themeFile = LoadResourceFile('tj_appearance', 'shared/data/theme.json')
    Cache.theme = themeFile and json.decode(themeFile) or {
        primaryColor = '#3b82f6',
        inactiveColor = '#8b5cf6',
        shape = 'hexagon',
    }

    local restrictionsFile = LoadResourceFile('tj_appearance', 'shared/data/restrictions.json')
    Cache.blacklist.restrictions = restrictionsFile and json.decode(restrictionsFile) or {}


    local settingsFile = LoadResourceFile('tj_appearance', 'shared/data/locked_models.json')
    Cache.blacklist.lockedModels = settingsFile and json.decode(settingsFile) or {}




    return Cache
end

-- Load models from JSON
local function loadModels()
    local modelsFile = LoadResourceFile('tj_appearance', 'shared/data/models.json')
    Cache.models = modelsFile and json.decode(modelsFile) or {}

    return Cache.models
end

-- Load zones from JSON
local function loadZones()
    local zonesFile = LoadResourceFile('tj_appearance', 'shared/data/zones.json')
        Cache.zones = zonesFile and json.decode(zonesFile) or {}

    return Cache.zones
end

-- Load outfits from JSON
local function loadOutfits()
    local outfitsFile = LoadResourceFile('tj_appearance', 'shared/data/outfits.json')
    Cache.outfits = outfitsFile and json.decode(outfitsFile) or {}
    return Cache.outfits
end

-- Load shop settings from JSON
local function loadShopSettings()
    local shopSettingsFile = LoadResourceFile('tj_appearance', 'shared/data/shop_settings.json')
    Cache.shopSettings = shopSettingsFile and json.decode(shopSettingsFile) or {
        enablePedsForShops = true,
        enablePedsForClothingRooms = true,
        enablePedsForPlayerOutfitRooms = true
    }

    return Cache.shopSettings
end

-- Load shop configs from JSON
local function loadShopConfigs()
    local shopConfigsFile = LoadResourceFile('tj_appearance', 'shared/data/shop_configs.json')
    Cache.shopConfigs = shopConfigsFile and json.decode(shopConfigsFile) or {}
    return Cache.shopConfigs
end



-- Initialize all caches on startup
local function initializeCache()
    loadSettings()
    loadModels()
    loadZones()
    loadOutfits()
    loadShopSettings()
    loadShopConfigs()

    -- Load theme (includes shape) from cache
    handleNuiMessage({ action = 'setThemeConfig', data = Cache.theme }, true)

    -- Load all restrictions from cache
    handleNuiMessage({ action = 'setRestrictions', data = Cache.restrictions }, true)
end


RegisterNetEvent('tj_appearance:client:updateTheme', function(theme)
    Cache.theme = theme
    handleNuiMessage({ action = 'setThemeConfig', data = theme }, true)
end)

-- Public API to get cache data
local CacheAPI = {
    init = initializeCache,
    getTheme = function() return Cache.theme end,
    getSettings = function() return Cache.settings end,
    getModels = function() return Cache.models end,
    getZones = function() return Cache.zones end,
    getOutfits = function() return Cache.outfits end,
    getShopSettings = function() return Cache.shopSettings end,
    getShopConfigs = function() return Cache.shopConfigs end,
    getRestrictions = function() return Cache.blacklist.restrictions end,

    -- Helper to get models in sorted order (freemode first)
    getSortedModels = function()

        if Cache.modelssorted then
            return Cache.models
        end

        local freemodeModels = { 'mp_m_freemode_01', 'mp_f_freemode_01' }
        local otherModels = {}

        for _, model in ipairs(Cache.models) do
            if model ~= 'mp_m_freemode_01' and model ~= 'mp_f_freemode_01' then
                table.insert(otherModels, model)
            end
        end

        local sortedModels = {}
        -- Add freemode models first if they exist in cache
        for _, freemodel in ipairs(freemodeModels) do
            for _, model in ipairs(Cache.models) do
                if model == freemodel then
                    table.insert(sortedModels, model)
                    break
                end
            end
        end

        -- Add other models
        for _, model in ipairs(otherModels) do
            table.insert(sortedModels, model)
        end

        Cache.modelssorted = true
        Cache.models = sortedModels

        return sortedModels
    end,

}

return CacheAPI
