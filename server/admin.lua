local QBCore = exports['qb-core']:GetCoreObject()

-- Cache for restrictions data
local RestrictionsCache = {}
local ThemeCache = nil
local ShapeCache = nil
local ModelsCache = {}
local SettingsCache = nil

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
