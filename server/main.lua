local function getPlyInfo(src) return {name = GetPlayerName(src), identifiers = GetPlayerIdentifiers(src)} end

lib.callback.register('getplayerInformation', getPlyInfo)

-- Load database module
local Database = require('server.database')

-- Save player appearance callback
lib.callback.register('tj_appearance:saveAppearance', function(source, appearance)
    local citizenid = Framework.GetCitizenId(source)
    
    if not citizenid then
        print('[tj_appearance] ERROR: Could not get citizenid for player ' .. source)
        return false
    end

    local success = Database.SaveAppearance(citizenid, appearance)
    
    if success then
        print('[tj_appearance] Saved appearance for citizenid: ' .. citizenid)
    else
        print('[tj_appearance] Failed to save appearance for citizenid: ' .. citizenid)
    end
    
    return success
end)

-- Save outfit callback (personal or job/gang)
lib.callback.register('tj_appearance:saveOutfit', function(source, outfitData)
    -- outfitData contains: { label, outfit, job }
    -- If job is present, it's a job/gang outfit (admin only)
    -- Otherwise, it's a personal outfit
    
    local citizenid = Framework.GetCitizenId(source)
    local playerData = Framework.GetPlayer(source)
    
    if not playerData then
        print('[tj_appearance] ERROR: Could not get player data for source ' .. source)
        return false
    end

    -- Determine gender from current model or outfit data
    local ped = GetPlayerPed(source)
    local model = GetEntityModel(ped)
    local isMale = model == GetHashKey("mp_m_freemode_01")
    local gender = isMale and 'male' or 'female'

    local outfitName = outfitData.label or 'Unnamed Outfit'
    local outfit = outfitData.outfit
    local job = outfitData.job -- This contains job/gang info if admin outfit

    local success = false

    if job then
        -- Admin outfit (job/gang)
        -- Check if player has admin permission
        if not Framework.HasPermission(source) then
            print('[tj_appearance] Player ' .. source .. ' does not have permission to save admin outfits')
            return false
        end

        local jobName = job.name or ''
        local gangName = job.gang or ''
        
        success = Database.SaveOutfit(nil, jobName, gangName, gender, outfitName, outfit)
        
        if success then
            print(string.format('[tj_appearance] Saved job/gang outfit "%s" (job: %s, gang: %s, gender: %s)', 
                outfitName, jobName, gangName, gender))
        end
    else
        -- Personal outfit
        success = Database.SaveOutfit(citizenid, nil, nil, gender, outfitName, outfit)
        
        if success then
            print(string.format('[tj_appearance] Saved personal outfit "%s" for citizenid: %s (gender: %s)', 
                outfitName, citizenid, gender))
        end
    end

    return success
end)

-- Get player outfits callback
lib.callback.register('tj_appearance:getOutfits', function(source)
    local citizenid = Framework.GetCitizenId(source)
    local playerData = Framework.GetPlayer(source)
    
    if not playerData then
        return {}
    end

    -- Determine gender
    local ped = GetPlayerPed(source)
    local model = GetEntityModel(ped)
    local isMale = model == GetHashKey("mp_m_freemode_01")
    local gender = isMale and 'male' or 'female'

    -- Get all outfits (personal + job/gang)
    local outfits = Database.GetAllOutfits(
        citizenid,
        playerData.job.name,
        playerData.gang.name,
        gender
    )

    -- Transform database format to UI format
    -- Database: outfit_data, outfit_name
    -- UI: outfit, label
    local transformedOutfits = {}
    for i = 1, #outfits do
        local o = outfits[i]
        table.insert(transformedOutfits, {
            id = o.id,
            label = o.outfit_name,
            outfit = o.outfit_data,
            jobname = o.job or o.gang
        })
    end

    return transformedOutfits
end)

-- Delete outfit callback
lib.callback.register('tj_appearance:deleteOutfit', function(source, outfitData)
    local citizenid = Framework.GetCitizenId(source)
    local playerData = Framework.GetPlayer(source)
    
    if not playerData then
        return false
    end

    -- Determine gender
    local ped = GetPlayerPed(source)
    local model = GetEntityModel(ped)
    local isMale = model == GetHashKey("mp_m_freemode_01")
    local gender = isMale and 'male' or 'female'

    local outfitName = outfitData.name or outfitData.label
    local isJobOutfit = outfitData.job or outfitData.gang

    local success = false

    if isJobOutfit then
        -- Check permission for job/gang outfit deletion
        if not Framework.HasPermission(source) then
            return false
        end

        success = Database.DeleteJobGangOutfit(
            outfitData.job,
            outfitData.gang,
            outfitName,
            gender
        )
    else
        -- Personal outfit
        success = Database.DeletePersonalOutfit(citizenid, outfitName, gender)
    end

    return success
end)

-- Get player appearance callback
lib.callback.register('tj_appearance:getAppearance', function(source)
    local citizenid = Framework.GetCitizenId(source)
    
    if not citizenid then
        return nil
    end

    return Database.GetAppearance(citizenid)
end)

-- Export: Get player appearance by identifier (citizenid)
-- This is useful for multicharacter systems or external resources
-- @param identifier string - The citizenid of the player
-- @return table|nil - The appearance data or nil if not found
function GetPlayerAppearance(identifier)
    if not identifier or identifier == '' then
        print('[tj_appearance] ERROR: GetPlayerAppearance - Invalid identifier provided')
        return nil
    end

    local appearance = Database.GetAppearance(identifier)
    
    if appearance then
        -- Return in a format compatible with illenium-appearance and other systems
        return {
            citizenid = identifier,
            model = appearance.model or 'mp_m_freemode_01',
            skin = appearance, -- Full appearance data
            active = 1
        }
    end
    
    return nil
end

exports('GetPlayerAppearance', GetPlayerAppearance)


