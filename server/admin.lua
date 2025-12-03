local QBCore = exports['qb-core']:GetCoreObject()

-- Cache for restrictions data
local RestrictionsCache = {}
local ThemeCache = nil
local ShapeCache = nil
local ModelsCache = {}
local SettingsCache = nil
local ShopSettingsCache = nil
local ShopConfigsCache = {}
local ZonesCache = {}
local OutfitsCache = {}

-- Load all restrictions into cache on startup
local function LoadRestrictionsCache()
    local result = MySQL.query.await('SELECT * FROM appearance_restrictions ORDER BY job, gang, gender')
    
    RestrictionsCache = {}
    for _, row in ipairs(result or {}) do
        local key = string.format('%s_%s', row.job or 'none', row.gang or 'none')
        if not RestrictionsCache[key] then
            RestrictionsCache[key] = { male = {}, female = {} }
        end
        
        local gender = row.gender
        if not RestrictionsCache[key][gender] then
            RestrictionsCache[key][gender] = {}
        end
        
        table.insert(RestrictionsCache[key][gender], {
            id = tostring(row.id),
            job = row.job,
            gang = row.gang,
            gender = row.gender,
            type = row.type,
            part = row.part,
            category = row.category,
            itemId = row.item_id,
            texturesAll = row.textures_all == 1,
            textures = row.textures and json.decode(row.textures) or nil
        })
    end
end

-- Load theme into cache
local function LoadThemeCache()
    local result = MySQL.query.await('SELECT * FROM appearance_theme LIMIT 1')
    if result and result[1] then
        ThemeCache = {
            primaryColor = result[1].primary_color,
            inactiveColor = result[1].inactive_color
        }
    else
        ThemeCache = {
            primaryColor = '#3b82f6',
            inactiveColor = '#8b5cf6'
        }
    end
end

-- Load shape into cache
local function LoadShapeCache()
    local result = MySQL.query.await('SELECT * FROM appearance_shape LIMIT 1')
    if result and result[1] then
        ShapeCache = { type = result[1].shape_type }
    else
        ShapeCache = { type = 'hexagon' }
    end
end

-- Load models into cache
local function LoadModelsCache()
    local result = MySQL.query.await('SELECT model_name FROM appearance_models ORDER BY model_name')
    ModelsCache = {}
    for _, row in ipairs(result or {}) do
        table.insert(ModelsCache, row.model_name)
    end
end

-- Load settings into cache
local function LoadSettingsCache()
    local success, result = pcall(function()
        return MySQL.query.await('SELECT * FROM appearance_settings LIMIT 1')
    end)
    
    if not success then
        SettingsCache = {
            lockedModels = {}
        }
        return
    end
    
    if result and result[1] then
        SettingsCache = {
            lockedModels = result[1].locked_models and json.decode(result[1].locked_models) or {}
        }
    else
        SettingsCache = {
            lockedModels = {}
        }
    end
end

-- Load shop settings into cache
local function LoadShopSettingsCache()
    local success, result = pcall(function()
        return MySQL.query.await('SELECT * FROM appearance_shop_settings LIMIT 1')
    end)
    
    if not success then
        ShopSettingsCache = {
            enablePedsForShops = true,
            enablePedsForClothingRooms = true,
            enablePedsForPlayerOutfitRooms = true
        }
        return
    end
    
    if result and result[1] then
        ShopSettingsCache = {
            enablePedsForShops = result[1].enable_peds_for_shops == 1,
            enablePedsForClothingRooms = result[1].enable_peds_for_clothing_rooms == 1,
            enablePedsForPlayerOutfitRooms = result[1].enable_peds_for_player_outfit_rooms == 1
        }
    else
        ShopSettingsCache = {
            enablePedsForShops = true,
            enablePedsForClothingRooms = true,
            enablePedsForPlayerOutfitRooms = true
        }
    end
end

-- Load shop configs into cache
local function LoadShopConfigsCache()
    local success, result = pcall(function()
        return MySQL.query.await('SELECT * FROM appearance_shop_configs')
    end)
    
    if not success then
        ShopConfigsCache = {}
        return
    end
    
    ShopConfigsCache = {}
    for _, row in ipairs(result or {}) do
        table.insert(ShopConfigsCache, {
            id = row.id,
            type = row.type,
            blipShow = row.blip_show == 1,
            blipSprite = row.blip_sprite,
            blipColor = row.blip_color,
            blipScale = row.blip_scale,
            blipName = row.blip_name,
            cost = row.cost
        })
    end
end

-- Load zones into cache
local function LoadZonesCache()
    local success, result = pcall(function()
        return MySQL.query.await('SELECT * FROM appearance_zones')
    end)
    
    if not success then
        ZonesCache = {}
        return
    end
    
    ZonesCache = {}
    for _, row in ipairs(result or {}) do
        table.insert(ZonesCache, {
            id = row.id,
            type = row.type,
            coords = json.decode(row.coords),
            polyzone = row.polyzone and json.decode(row.polyzone) or nil,
            showBlip = row.show_blip == 1,
            job = row.job,
            gang = row.gang,
            name = row.name
        })
    end
end

-- Load outfits into cache
local function LoadOutfitsCache()
    local success, result = pcall(function()
        return MySQL.query.await('SELECT * FROM appearance_job_outfits')
    end)
    
    if not success then
        OutfitsCache = {}
        return
    end
    
    OutfitsCache = {}
    for _, row in ipairs(result or {}) do
        table.insert(OutfitsCache, {
            id = row.id,
            job = row.job,
            gang = row.gang,
            gender = row.gender,
            outfitName = row.outfit_name,
            outfitData = json.decode(row.outfit_data)
        })
    end
end

-- Return models with freemode first, followed by others (matching Admin UI order)
local function GetSortedModels()
    local freemodeModels = {'mp_m_freemode_01', 'mp_f_freemode_01'}
    local otherModels = {}

    for _, model in ipairs(ModelsCache) do
        if model ~= 'mp_m_freemode_01' and model ~= 'mp_f_freemode_01' then
            table.insert(otherModels, model)
        end
    end

    local sortedModels = {}
    -- Add freemode models first if they exist in cache
    for _, freemodel in ipairs(freemodeModels) do
        for _, model in ipairs(ModelsCache) do
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
    LoadThemeCache()
    LoadShapeCache()
    LoadModelsCache()
    LoadSettingsCache()
    LoadShopSettingsCache()
    LoadShopConfigsCache()
    LoadZonesCache()
    LoadOutfitsCache()
    LoadRestrictionsCache()
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

-- Load theme configuration
lib.callback.register('tj_appearance:admin:getTheme', function(source)
    return ThemeCache
end)

-- Save theme configuration
lib.callback.register('tj_appearance:admin:saveTheme', function(source, theme)
    if not IsAdmin(source) then return false end
    
    MySQL.query.await([[
        INSERT INTO appearance_theme (id, primary_color, inactive_color)
        VALUES (1, ?, ?)
        ON DUPLICATE KEY UPDATE
            primary_color = VALUES(primary_color),
            inactive_color = VALUES(inactive_color)
    ]], {
        theme.primaryColor,
        theme.inactiveColor
    })
    
    -- Update cache
    ThemeCache = theme
    
    -- Broadcast to all clients
    TriggerClientEvent('tj_appearance:client:updateTheme', -1, theme)
    return true
end)

-- Load shape configuration
lib.callback.register('tj_appearance:admin:getShape', function(source)
    return ShapeCache
end)

-- Save shape configuration
lib.callback.register('tj_appearance:admin:saveShape', function(source, shape)
    if not IsAdmin(source) then return false end
    
    MySQL.query.await([[
        INSERT INTO appearance_shape (id, shape_type)
        VALUES (1, ?)
        ON DUPLICATE KEY UPDATE shape_type = VALUES(shape_type)
    ]], { shape.type })
    
    -- Update cache
    ShapeCache = shape
    
    -- Broadcast to all clients
    TriggerClientEvent('tj_appearance:client:updateShape', -1, shape)
    return true
end)

-- Get settings
lib.callback.register('tj_appearance:admin:getSettings', function(source)
    return SettingsCache
end)

-- Save settings
lib.callback.register('tj_appearance:admin:saveSettings', function(source, settings)
    if not IsAdmin(source) then return false end
    
    local lockedModelsJson = json.encode(settings.lockedModels or {})
    
    MySQL.query.await([[
        INSERT INTO appearance_settings (id, locked_models)
        VALUES (1, ?)
        ON DUPLICATE KEY UPDATE locked_models = VALUES(locked_models)
    ]], { lockedModelsJson })
    
    -- Update cache
    SettingsCache = settings
    
    return true
end)

-- Append locked models without removing existing ones
lib.callback.register('tj_appearance:admin:addLockedModels', function(source, payload)
    if not IsAdmin(source) then return false end
    local modelsToAdd = (payload and payload.models) or {}
    if type(modelsToAdd) ~= 'table' or #modelsToAdd == 0 then return false end

    -- Ensure cache initialized
    if not SettingsCache then
        SettingsCache = { lockedModels = {} }
    end
    local current = SettingsCache.lockedModels or {}

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

    if not changed then return SettingsCache end

    -- Persist
    local lockedModelsJson = json.encode(current)
    MySQL.query.await([[
        INSERT INTO appearance_settings (id, locked_models)
        VALUES (1, ?)
        ON DUPLICATE KEY UPDATE locked_models = VALUES(locked_models)
    ]], { lockedModelsJson })

    SettingsCache.lockedModels = current
    return SettingsCache
end)

-- Get shop settings
lib.callback.register('tj_appearance:admin:getShopSettings', function(source)
    if not IsAdmin(source) then return nil end
    return ShopSettingsCache
end)

-- Get shop configs
lib.callback.register('tj_appearance:admin:getShopConfigs', function(source)
    if not IsAdmin(source) then return {} end
    return ShopConfigsCache
end)

-- Save shop settings and configs
lib.callback.register('tj_appearance:admin:saveShopSettings', function(source, data)
    if not IsAdmin(source) then return false end
    
    local settings = data.settings
    local configs = data.configs
    
    -- Save shop settings
    MySQL.query.await([[
        INSERT INTO appearance_shop_settings (id, enable_peds_for_shops, enable_peds_for_clothing_rooms, enable_peds_for_player_outfit_rooms)
        VALUES (1, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            enable_peds_for_shops = VALUES(enable_peds_for_shops),
            enable_peds_for_clothing_rooms = VALUES(enable_peds_for_clothing_rooms),
            enable_peds_for_player_outfit_rooms = VALUES(enable_peds_for_player_outfit_rooms)
    ]], {
        settings.enablePedsForShops and 1 or 0,
        settings.enablePedsForClothingRooms and 1 or 0,
        settings.enablePedsForPlayerOutfitRooms and 1 or 0
    })
    
    -- Save each shop config
    for _, config in ipairs(configs) do
        MySQL.query.await([[
            INSERT INTO appearance_shop_configs (type, blip_show, blip_sprite, blip_color, blip_scale, blip_name, cost)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                blip_show = VALUES(blip_show),
                blip_sprite = VALUES(blip_sprite),
                blip_color = VALUES(blip_color),
                blip_scale = VALUES(blip_scale),
                blip_name = VALUES(blip_name),
                cost = VALUES(cost)
        ]], {
            config.type,
            config.blipShow and 1 or 0,
            config.blipSprite,
            config.blipColor,
            config.blipScale,
            config.blipName,
            config.cost
        })
    end
    
    -- Update cache
    ShopSettingsCache = settings
    LoadShopConfigsCache()
    
    return true
end)

-- Get zones
lib.callback.register('tj_appearance:admin:getZones', function(source)
    if not IsAdmin(source) then return {} end
    return ZonesCache
end)

-- Add zone
lib.callback.register('tj_appearance:admin:addZone', function(source, zone)
    if not IsAdmin(source) then return false end
    
    local coordsJson = json.encode(zone.coords)
    local polyzoneJson = zone.polyzone and json.encode(zone.polyzone) or nil
    
    local result = MySQL.insert.await([[
        INSERT INTO appearance_zones (type, coords, polyzone, show_blip, job, gang, name)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ]], {
        zone.type,
        coordsJson,
        polyzoneJson,
        zone.showBlip and 1 or 0,
        zone.job,
        zone.gang,
        zone.name
    })
    
    if result and result > 0 then
        LoadZonesCache()
        return true
    end
    
    return false
end)

-- Update zone
lib.callback.register('tj_appearance:admin:updateZone', function(source, zone)
    if not IsAdmin(source) then return false end
    
    local coordsJson = json.encode(zone.coords)
    local polyzoneJson = zone.polyzone and json.encode(zone.polyzone) or nil
    
    MySQL.query.await([[
        UPDATE appearance_zones 
        SET type = ?, coords = ?, polyzone = ?, show_blip = ?, job = ?, gang = ?, name = ?
        WHERE id = ?
    ]], {
        zone.type,
        coordsJson,
        polyzoneJson,
        zone.showBlip and 1 or 0,
        zone.job,
        zone.gang,
        zone.name,
        zone.id
    })
    
    LoadZonesCache()
    return true
end)

-- Delete zone
lib.callback.register('tj_appearance:admin:deleteZone', function(source, id)
    if not IsAdmin(source) then return false end
    
    MySQL.query.await('DELETE FROM appearance_zones WHERE id = ?', { id })
    LoadZonesCache()
    
    return true
end)

-- Get outfits
lib.callback.register('tj_appearance:admin:getOutfits', function(source)
    if not IsAdmin(source) then return {} end
    return OutfitsCache
end)

-- Add outfit
lib.callback.register('tj_appearance:admin:addOutfit', function(source, outfit)
    if not IsAdmin(source) then return false end
    
    -- Get current player appearance for outfit data
    -- In real implementation, this would come from the client or be passed in
    local outfitDataJson = json.encode(outfit.outfitData or {})
    
    local result = MySQL.insert.await([[
        INSERT INTO appearance_job_outfits (job, gang, gender, outfit_name, outfit_data)
        VALUES (?, ?, ?, ?, ?)
    ]], {
        outfit.job,
        outfit.gang,
        outfit.gender,
        outfit.outfitName,
        outfitDataJson
    })
    
    if result and result > 0 then
        LoadOutfitsCache()
        return { id = result }
    end
    
    return false
end)

-- Delete outfit
lib.callback.register('tj_appearance:admin:deleteOutfit', function(source, id)
    if not IsAdmin(source) then return false end
    
    MySQL.query.await('DELETE FROM appearance_job_outfits WHERE id = ?', { id })
    LoadOutfitsCache()
    
    return true
end)

-- Get all models
lib.callback.register('tj_appearance:admin:getModels', function(source)
    if not IsAdmin(source) then return {} end

    return GetSortedModels()
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
    
    MySQL.insert.await('INSERT INTO appearance_models (model_name) VALUES (?)', { modelName })
    
    -- Update cache
    table.insert(ModelsCache, modelName)
    table.sort(ModelsCache)
    
    return true
end)

-- Delete model
lib.callback.register('tj_appearance:admin:deleteModel', function(source, modelName)
    if not IsAdmin(source) then return false end
    
    -- Prevent deletion of freemode models
    if modelName == 'mp_m_freemode_01' or modelName == 'mp_f_freemode_01' then
        return false
    end
    
    MySQL.query.await('DELETE FROM appearance_models WHERE model_name = ?', { modelName })
    
    -- Update cache
    for i, model in ipairs(ModelsCache) do
        if model == modelName then
            table.remove(ModelsCache, i)
            break
        end
    end
    
    return true
end)

-- Delete multiple models
lib.callback.register('tj_appearance:admin:deleteModels', function(source, modelNames)
    if not IsAdmin(source) then return false end
    
    if type(modelNames) ~= 'table' then return false end
    
    local deletedCount = 0
    for _, modelName in ipairs(modelNames) do
        -- Prevent deletion of freemode models
        if modelName ~= 'mp_m_freemode_01' and modelName ~= 'mp_f_freemode_01' then
            MySQL.query.await('DELETE FROM appearance_models WHERE model_name = ?', { modelName })
            
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
    
    return true
end)

-- Get all restrictions
lib.callback.register('tj_appearance:admin:getRestrictions', function(source)
    if not IsAdmin(source) then return {} end
    
    local all = {}
    for _, jobGangData in pairs(RestrictionsCache) do
        for _, genderData in pairs(jobGangData) do
            for _, restriction in ipairs(genderData) do
                table.insert(all, restriction)
            end
        end
    end
    
    return all
end)

lib.callback.register('tj_appearance:admin:getBlacklistData', function(source, info)
    if not IsAdmin(source) then return nil end
    local result = MySQL.query.await([[SELECT data FROM appearance_blacklists WHERE job <=> ? AND gang <=> ? AND gender = ? LIMIT 1]], {
        info.job, info.gang, info.gender
    })
    if result and result[1] then
        local ok, decoded = pcall(json.decode, result[1].data)
        if ok then return decoded end
    end
    return { models = {}, drawables = {}, props = {} }
end)

lib.callback.register('tj_appearance:admin:saveBlacklistData', function(source, payload)
    if not IsAdmin(source) then return false end
    local dataJson = json.encode(payload.data or { models = {}, drawables = {}, props = {} })
    MySQL.query.await([[INSERT INTO appearance_blacklists (job, gang, gender, data)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE data = VALUES(data)]], {
        payload.job, payload.gang, payload.gender, dataJson
    })
    return true
end)

lib.callback.register('tj_appearance:admin:deleteBlacklistData', function(source, payload)
    if not IsAdmin(source) then return false end
    MySQL.query.await('DELETE FROM appearance_blacklists WHERE job <=> ? AND gang <=> ? AND gender = ?', {
        payload.job, payload.gang, payload.gender
    })
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
            if not seen[m] then table.insert(merged, m); seen[m] = true end
        end
        for _, m in ipairs(out.female.models) do
            if not seen[m] then table.insert(merged, m); seen[m] = true end
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
    
    local textures_json = nil
    if restriction.textures and type(restriction.textures) == 'table' then
        textures_json = json.encode(restriction.textures)
    end
    
    local result = MySQL.insert.await([[
        INSERT INTO appearance_restrictions (job, gang, gender, type, part, category, item_id, textures_all, textures)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ]], {
        restriction.job,
        restriction.gang,
        restriction.gender,
        restriction.type,
        restriction.part or 'drawable',
        restriction.category,
        restriction.itemId,
        (restriction.texturesAll and 1 or 0),
        textures_json
    })
    
    if result and result > 0 then
        -- Update cache
        local key = string.format('%s_%s', restriction.job or 'none', restriction.gang or 'none')
        if not RestrictionsCache[key] then
            RestrictionsCache[key] = { male = {}, female = {} }
        end
        if not RestrictionsCache[key][restriction.gender] then
            RestrictionsCache[key][restriction.gender] = {}
        end
        
        table.insert(RestrictionsCache[key][restriction.gender], {
            id = tostring(result),
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
        
        return true
    end
    
    return false
end)

-- Delete restriction
lib.callback.register('tj_appearance:admin:deleteRestriction', function(source, id)
    if not IsAdmin(source) then return false end
    
    MySQL.query.await('DELETE FROM appearance_restrictions WHERE id = ?', { tonumber(id) })
    
    -- Update cache - reload entire cache for simplicity
    LoadRestrictionsCache()
    
    return true
end)

-- Command to open admin menu
RegisterCommand('appearanceadmin', function(source)
    if not IsAdmin(source) then
        TriggerClientEvent('QBCore:Notify', source, 'You do not have permission', 'error')
        return
    end
    
    TriggerClientEvent('tj_appearance:client:openAdminMenu', source)
end, false)
