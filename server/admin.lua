local QBCore = exports['qb-core']:GetCoreObject()

local ServerCache = {
    theme = {},
    settings = {},
    models = {},
    zones = {},
    outfits = {},
    shopSettings = {},
    shopConfigs = {},
    restrictions = {},
} 

-- Load all restrictions into cache on startup


local function LoadCache()
    -- Load models
    local modelsFile = LoadResourceFile('tj_appearance', 'shared/data/models.json')
    if modelsFile then
        ServerCache.models = json.decode(modelsFile) or {}
    else
        ServerCache.models = {}
    end

    local restrictionsFile = LoadResourceFile('tj_appearance', 'shared/data/restrictions.json')
    if restrictionsFile then
        ServerCache.restrictions = json.decode(restrictionsFile) or {}
    else
        ServerCache.restrictions = {}
    end

    -- Load settings (theme + locked models)
    local themeFile = LoadResourceFile('tj_appearance', 'shared/data/theme.json')
    if themeFile then
        ServerCache.theme = json.decode(themeFile) or {
            primaryColor = '#3b82f6',
            inactiveColor = '#8b5cf6',
            shape = 'hexagon',
        }
    else
        ServerCache.theme = {
            primaryColor = '#3b82f6',
            inactiveColor = '#8b5cf6',
            shape = 'hexagon',
        }
    end

    local lockedmodels = LoadResourceFile(GetCurrentResourceName(), 'shared/data/locked_models.json')
    ServerCache.settings.lockedModels = lockedmodels and json.decode(lockedmodels) or { lockedModels = {} }
end

-- Load shop settings into cache
local function LoadShopSettingsCache()
    local jsonData = LoadResourceFile(GetCurrentResourceName(), 'shared/data/shop_settings.json')
    ServerCache.shopSettings = jsonData and json.decode(jsonData) or {
        enablePedsForShops = true,
        enablePedsForClothingRooms = true,
        enablePedsForPlayerOutfitRooms = true
    }
end

-- Load shop configs into cache
local function LoadShopConfigsCache()
    local jsonData = LoadResourceFile(GetCurrentResourceName(), 'shared/data/shop_configs.json')
    ServerCache.shopConfigs = jsonData and json.decode(jsonData) or {}
end

-- Load zones into cache
local function LoadZonesCache()
    local jsonData = LoadResourceFile(GetCurrentResourceName(), 'shared/data/zones.json')
    ServerCache.zones = jsonData and json.decode(jsonData) or {}
end

-- Load outfits into cache
local function LoadOutfitsCache()
    local jsonData = LoadResourceFile(GetCurrentResourceName(), 'shared/data/outfits.json')
    ServerCache.outfits = jsonData and json.decode(jsonData) or {}
end

-- Return models with freemode first, followed by others (matching Admin UI order)
local function GetSortedModels()
    local freemodeModels = { 'mp_m_freemode_01', 'mp_f_freemode_01' }
    local otherModels = {}

    for _, model in ipairs(ServerCache.models) do
        if model ~= 'mp_m_freemode_01' and model ~= 'mp_f_freemode_01' then
            table.insert(otherModels, model)
        end
    end

    local sortedModels = {}
    -- Add freemode models first if they exist in cache
    for _, freemodel in ipairs(freemodeModels) do
        for _, model in ipairs(ServerCache.models) do
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

    return sortedModels
end

-- Initialize all caches on resource start
CreateThread(function()
    LoadCache()
    LoadShopSettingsCache()
    LoadShopConfigsCache()
    LoadZonesCache()
    LoadOutfitsCache()
end)

-- Save cache to database on resource stop
AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
end)

-- Admin permission check
local function IsAdmin(source)
    -- Check for ACE permission
    local isAdmin = IsPlayerAceAllowed(source, 'command')
    return isAdmin
end

-- Save theme configuration (includes shape)
lib.callback.register('tj_appearance:admin:saveTheme', function(source, theme)
    if not IsAdmin(source) then return false end

    ServerCache.theme = theme
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/theme.json', json.encode(theme), -1)

    -- Broadcast to all clients
    TriggerClientEvent('tj_appearance:client:updateTheme', -1, theme)
    return true
end)

-- Save settings
lib.callback.register('tj_appearance:admin:saveSettings', function(source, settings)
    if not IsAdmin(source) then return false end

    ServerCache.settings.LockedModels = settings
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/locked_models.json', json.encode(settings), -1)

    return true
end)

-- Append locked models without removing existing ones
lib.callback.register('tj_appearance:admin:addLockedModels', function(source, payload)
    if not IsAdmin(source) then return false end
    local modelsToAdd = (payload and payload.models) or {}
    if type(modelsToAdd) ~= 'table' or #modelsToAdd == 0 then return false end

    -- Ensure cache initialized
    if not Settings.LockedModels then
        Settings.LockedModels = {}
    end
    local current = Settings.LockedModels or {}

    -- Merge unique
    local seen = {}
    for _, m in ipairs(current) do seen[m] = true end
    local changed = false
    for _, m in ipairs(modelsToAdd) do
        if m ~= 'mp_m_freemode_01' and m ~= 'mp_f_freemode_01' and not seen[m] then
            table.insert(current, m)
            seen[m] = true
            changed = true
        end
    end

    if not changed then return Settings.LockedModels end

    -- Persist to JSON
    Settings.LockedModels = current
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/locked_models.json', json.encode(current), -1)

    return Settings.LockedModels
end)

-- Save shop settings and configs
lib.callback.register('tj_appearance:admin:saveShopSettings', function(source, data)
    if not IsAdmin(source) then return false end

    local settings = data.settings
    local configs = data.configs

    -- Save shop settings
    ShopSettingsCache = settings
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/shop_settings.json', json.encode(settings), -1)

    -- Save shop configs
    ShopConfigsCache = configs
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/shop_configs.json', json.encode(configs), -1)

    return true
end)

-- Add zone
lib.callback.register('tj_appearance:admin:addZone', function(source, zone)
    if not IsAdmin(source) then return false end

    -- Generate an ID for the new zone
    local newZone = table.deepcopy(zone)
    newZone.id = #ZonesCache + 1

    table.insert(ZonesCache, newZone)
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/zones.json', json.encode(ZonesCache), -1)

    return true
end)

-- Update zone
lib.callback.register('tj_appearance:admin:updateZone', function(source, zone)
    if not IsAdmin(source) then return false end

    for i, z in ipairs(ZonesCache) do
        if z.id == zone.id then
            ZonesCache[i] = zone
            SaveResourceFile(GetCurrentResourceName(), 'shared/data/zones.json', json.encode(ZonesCache), -1)
            return true
        end
    end

    return false
end)

-- Delete zone
lib.callback.register('tj_appearance:admin:deleteZone', function(source, id)
    if not IsAdmin(source) then return false end

    for i, zone in ipairs(ZonesCache) do
        if zone.id == id then
            table.remove(ZonesCache, i)
            SaveResourceFile(GetCurrentResourceName(), 'shared/data/zones.json', json.encode(ZonesCache), -1)
            return true
        end
    end

    return false
end)

-- Add outfit
lib.callback.register('tj_appearance:admin:addOutfit', function(source, outfit)
    if not IsAdmin(source) then return false end

    local newOutfit = table.deepcopy(outfit)
    newOutfit.id = #OutfitsCache + 1

    table.insert(OutfitsCache, newOutfit)
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/outfits.json', json.encode(OutfitsCache), -1)

    return { id = newOutfit.id }
end)

-- Delete outfit
lib.callback.register('tj_appearance:admin:deleteOutfit', function(source, id)
    if not IsAdmin(source) then return false end

    for i, outfit in ipairs(OutfitsCache) do
        if outfit.id == id then
            table.remove(OutfitsCache, i)
            SaveResourceFile(GetCurrentResourceName(), 'shared/data/outfits.json', json.encode(OutfitsCache), -1)
            return true
        end
    end

    return false
end)

-- Add model
lib.callback.register('tj_appearance:admin:addModel', function(source, modelName)
    if not IsAdmin(source) then return false end

    -- Prevent adding freemode models (they should always exist)
    if modelName == 'mp_m_freemode_01' or modelName == 'mp_f_freemode_01' then
        return false
    end

    -- Check if model already exists
    for _, model in ipairs(ModelsCache) do
        if model == modelName then
            return false
        end
    end

    -- Update cache and save
    table.insert(ModelsCache, modelName)
    table.sort(ModelsCache)
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/models.json', json.encode(ModelsCache), -1)

    return true
end)

-- Delete model
lib.callback.register('tj_appearance:admin:deleteModel', function(source, modelName)
    if not IsAdmin(source) then return false end

    -- Prevent deletion of freemode models
    if modelName == 'mp_m_freemode_01' or modelName == 'mp_f_freemode_01' then
        return false
    end

    -- Update cache
    for i, model in ipairs(ModelsCache) do
        if model == modelName then
            table.remove(ModelsCache, i)
            SaveResourceFile(GetCurrentResourceName(), 'shared/data/models.json', json.encode(ModelsCache), -1)
            return true
        end
    end

    return false
end)

-- Delete multiple models
lib.callback.register('tj_appearance:admin:deleteModels', function(source, modelNames)
    if not IsAdmin(source) then return false end

    if type(modelNames) ~= 'table' then return false end

    local deletedCount = 0
    for _, modelName in ipairs(modelNames) do
        -- Prevent deletion of freemode models
        if modelName ~= 'mp_m_freemode_01' and modelName ~= 'mp_f_freemode_01' then
            -- Update cache
            for i, model in ipairs(ModelsCache) do
                if model == modelName then
                    table.remove(ModelsCache, i)
                    deletedCount = deletedCount + 1
                    break
                end
            end
        end
    end

    if deletedCount > 0 then
        SaveResourceFile(GetCurrentResourceName(), 'shared/data/models.json', json.encode(ModelsCache), -1)
    end

    return true
end)

-- Get restrictions for specific player
lib.callback.register('tj_appearance:getPlayerRestrictions', function(source)
    local Player = QBCore.Functions.GetPlayer(source)
    if not Player then return {} end

    local job = Player.PlayerData.job.name
    local gang = Player.PlayerData.gang and Player.PlayerData.gang.name or nil

    local out = {
        male = { models = {}, drawables = {}, props = {} },
        female = { models = {}, drawables = {}, props = {} }
    }

    -- Track which models the player has access to via restrictions
    local allowedModels = {}

    -- Iterate through ALL restrictions and lock items where player is NOT in the job/gang
    for key, jobGangData in pairs(RestrictionsCache) do
        for gender, restrictions in pairs(jobGangData) do
            for _, restriction in ipairs(restrictions) do
                -- Check if this restriction applies to a different job/gang than the player's
                local isPlayerInGroup = false

                if restriction.job and restriction.job == job then
                    isPlayerInGroup = true
                end

                if restriction.gang and gang and restriction.gang == gang then
                    isPlayerInGroup = true
                end

                -- Track models that player has access to
                if isPlayerInGroup and restriction.type == 'model' then
                    local modelIndex = tonumber(restriction.itemId)
                    local sortedModels = GetSortedModels()
                    if modelIndex and sortedModels[modelIndex + 1] then
                        local modelName = sortedModels[modelIndex + 1]
                        allowedModels[modelName] = true
                    end
                end

                -- Only blacklist if player is NOT in the restricted group
                if not isPlayerInGroup then
                    if restriction.type == 'model' then
                        -- Model blacklist - convert index (from Admin UI list) to model name using the same ordering
                        local modelIndex = tonumber(restriction.itemId)
                        local sortedModels = GetSortedModels()
                        if modelIndex and sortedModels[modelIndex + 1] then -- Lua arrays are 1-indexed
                            local modelName = sortedModels[modelIndex + 1]
                            -- Skip freemode models (always allowed)
                            if modelName ~= 'mp_m_freemode_01' and modelName ~= 'mp_f_freemode_01' then
                                table.insert(out[gender].models, modelName)
                            end
                        end
                    else
                        -- Clothing/prop blacklist
                        local category = restriction.category
                        local part = restriction.part -- 'drawable' or 'prop'
                        local targetList = (part == 'prop') and out[gender].props or out[gender].drawables

                        if restriction.texturesAll then
                            -- Blacklist all textures for this item - add to values array
                            if not targetList[category] then
                                targetList[category] = { values = {} }
                            end
                            if not targetList[category].values then
                                targetList[category].values = {}
                            end
                            table.insert(targetList[category].values, restriction.itemId)
                        elseif restriction.textures and #restriction.textures > 0 then
                            -- Blacklist specific textures only if textures array is not empty
                            if not targetList[category] then
                                targetList[category] = { textures = {} }
                            end
                            if not targetList[category].textures then
                                targetList[category].textures = {}
                            end
                            targetList[category].textures[tostring(restriction.itemId)] = restriction.textures
                        end
                    end
                end
            end
        end
    end

    -- Merge model restrictions across genders so models apply to everyone
    do
        local merged, seen = {}, {}
        for _, m in ipairs(out.male.models) do
            if not seen[m] then
                table.insert(merged, m); seen[m] = true
            end
        end
        for _, m in ipairs(out.female.models) do
            if not seen[m] then
                table.insert(merged, m); seen[m] = true
            end
        end
        out.male.models = merged
        out.female.models = merged
    end

    -- Add locked models to blacklist unless player has explicit access via restrictions
    if SettingsCache and SettingsCache.lockedModels then
        for _, lockedModel in ipairs(SettingsCache.lockedModels) do
            -- Skip freemode models (always allowed)
            if lockedModel ~= 'mp_m_freemode_01' and lockedModel ~= 'mp_f_freemode_01' then
                -- Only blacklist if player doesn't have explicit access
                if not allowedModels[lockedModel] then
                    -- Check if already in blacklist to avoid duplicates
                    local alreadyBlacklisted = false
                    for _, m in ipairs(out.male.models) do
                        if m == lockedModel then
                            alreadyBlacklisted = true
                            break
                        end
                    end
                    if not alreadyBlacklisted then
                        table.insert(out.male.models, lockedModel)
                        table.insert(out.female.models, lockedModel)
                    end
                end
            end
        end
    end

    return { legacy = out }
end)

-- Add restriction
lib.callback.register('tj_appearance:admin:addRestriction', function(source, restriction)
    if not IsAdmin(source) then return false end

    -- Generate ID based on existing restrictions
    local maxId = 0
    for _, genderRestrictions in pairs(RestrictionsCache) do
        for _, restrictions in pairs(genderRestrictions) do
            if type(restrictions) == 'table' then
                for _, r in ipairs(restrictions) do
                    if tonumber(r.id) and tonumber(r.id) > maxId then
                        maxId = tonumber(r.id)
                    end
                end
            end
        end
    end
    local newId = tostring(maxId + 1)

    -- Update cache
    local key = string.format('%s_%s', restriction.job or 'none', restriction.gang or 'none')
    if not RestrictionsCache[key] then
        RestrictionsCache[key] = { male = {}, female = {} }
    end
    if not RestrictionsCache[key][restriction.gender] then
        RestrictionsCache[key][restriction.gender] = {}
    end

    table.insert(RestrictionsCache[key][restriction.gender], {
        id = newId,
        job = restriction.job,
        gang = restriction.gang,
        gender = restriction.gender,
        type = restriction.type,
        part = restriction.part,
        category = restriction.category,
        itemId = restriction.itemId,
        texturesAll = restriction.texturesAll,
        textures = restriction.textures
    })

    -- Persist to JSON
    SaveResourceFile('tj_appearance', 'shared/data/restrictions.json', json.encode(RestrictionsCache), -1)

    return true
end)

-- Delete restriction
lib.callback.register('tj_appearance:admin:deleteRestriction', function(source, id)
    if not IsAdmin(source) then return false end

    -- Find and remove from cache
    local restrictionId = tonumber(id)
    local found = false
    
    for key, genderRestrictions in pairs(RestrictionsCache) do
        for gender, restrictions in pairs(genderRestrictions) do
            if type(restrictions) == 'table' then
                for i, restriction in ipairs(restrictions) do
                    if tonumber(restriction.id) == restrictionId then
                        table.remove(RestrictionsCache[key][gender], i)
                        found = true
                        break
                    end
                end
                if found then break end
            end
        end
        if found then break end
    end

    if found then
        -- Persist to JSON
        SaveResourceFile('tj_appearance', 'shared/data/restrictions.json', json.encode(RestrictionsCache), -1)
    end

    return found
end)

-- Command to open admin menu
RegisterCommand('appearanceadmin', function(source)
    if not IsAdmin(source) then
        TriggerClientEvent('QBCore:Notify', source, 'You do not have permission', 'error')
        return
    end

    TriggerClientEvent('tj_appearance:client:openAdminMenu', source)
end, false)
