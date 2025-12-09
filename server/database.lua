-- Database operations for appearance system using oxmysql

local Database = {}

--- Save player appearance to database
---@param citizenid string Player's citizen ID
---@param appearance table Appearance data (JSON serializable)
---@return boolean success
function Database.SaveAppearance(citizenid, appearance)
    if not citizenid or not appearance then
        return false
    end

    local success = MySQL.query.await([[
        INSERT INTO player_appearance (citizenid, appearance_data, updated_at)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            appearance_data = VALUES(appearance_data),
            updated_at = NOW()
    ]], {citizenid, json.encode(appearance)})

    return success ~= nil
end

--- Get player appearance from database
---@param citizenid string Player's citizen ID
---@return table|nil appearance Appearance data or nil if not found
function Database.GetAppearance(citizenid)
    if not citizenid then
        return nil
    end

    local result = MySQL.query.await([[
        SELECT appearance_data
        FROM player_appearance
        WHERE citizenid = ?
        LIMIT 1
    ]], {citizenid})

    if result and result[1] and result[1].appearance_data then
        return json.decode(result[1].appearance_data)
    end

    return nil
end

--- Save outfit (personal or job/gang)
---@param citizenid string|nil Player's citizen ID (for personal outfits)
---@param job string|nil Job name (for job outfits)
---@param gang string|nil Gang name (for gang outfits)
---@param gender string Gender (male/female)
---@param outfitName string Name of the outfit
---@param outfitData table Outfit data (JSON serializable)
---@return boolean success
function Database.SaveOutfit(citizenid, job, gang, gender, outfitName, outfitData)
    if not outfitName or not outfitData or not gender then
        return false
    end

    -- Determine if this is a personal outfit or job/gang outfit
    local isPersonal = citizenid and not job and not gang

    if isPersonal then
        -- Save to personal outfits table
        local success = MySQL.query.await([[
            INSERT INTO player_outfits (citizenid, gender, outfit_name, outfit_data, created_at, updated_at)
            VALUES (?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
                outfit_data = VALUES(outfit_data),
                updated_at = NOW()
        ]], {citizenid, gender, outfitName, json.encode(outfitData)})

        return success ~= nil
    else
        -- Save to job/gang outfits table
        local success = MySQL.query.await([[
            INSERT INTO appearance_job_outfits (job, gang, gender, outfit_name, outfit_data, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
                outfit_data = VALUES(outfit_data),
                updated_at = NOW()
        ]], {job or '', gang or '', gender, outfitName, json.encode(outfitData)})

        return success ~= nil
    end
end

--- Get player's personal outfits
---@param citizenid string Player's citizen ID
---@param gender string Gender filter (male/female)
---@return table outfits Array of outfit records
function Database.GetPersonalOutfits(citizenid, gender)
    if not citizenid then
        return {}
    end

    local result = MySQL.query.await([[
        SELECT outfit_name, outfit_data, created_at, updated_at
        FROM player_outfits
        WHERE citizenid = ? AND gender = ?
        ORDER BY created_at DESC
    ]], {citizenid, gender})

    if not result then
        return {}
    end

    -- Decode JSON outfit data
    for i = 1, #result do
        if result[i].outfit_data then
            result[i].outfit_data = json.decode(result[i].outfit_data)
        end
    end

    return result
end

--- Get job/gang outfits
---@param job string|nil Job name
---@param gang string|nil Gang name
---@param gender string Gender filter (male/female)
---@return table outfits Array of outfit records
function Database.GetJobGangOutfits(job, gang, gender)
    local result = MySQL.query.await([[
        SELECT outfit_name, outfit_data, job, gang, created_at, updated_at
        FROM appearance_job_outfits
        WHERE (job = ? OR gang = ?) AND gender = ?
        ORDER BY created_at DESC
    ]], {job or '', gang or '', gender})

    if not result then
        return {}
    end

    -- Decode JSON outfit data
    for i = 1, #result do
        if result[i].outfit_data then
            result[i].outfit_data = json.decode(result[i].outfit_data)
        end
    end

    return result
end

--- Get all outfits for a player (personal + job/gang)
---@param citizenid string Player's citizen ID
---@param job string|nil Player's current job
---@param gang string|nil Player's current gang
---@param gender string Gender filter (male/female)
---@return table outfits Combined array of personal and job/gang outfits
function Database.GetAllOutfits(citizenid, job, gang, gender)
    local personalOutfits = Database.GetPersonalOutfits(citizenid, gender)
    local jobGangOutfits = Database.GetJobGangOutfits(job, gang, gender)

    -- Merge arrays
    local allOutfits = {}
    
    -- Add personal outfits with type flag
    for i = 1, #personalOutfits do
        personalOutfits[i].isPersonal = true
        table.insert(allOutfits, personalOutfits[i])
    end

    -- Add job/gang outfits with type flag
    for i = 1, #jobGangOutfits do
        jobGangOutfits[i].isPersonal = false
        table.insert(allOutfits, jobGangOutfits[i])
    end

    return allOutfits
end

--- Delete a personal outfit
---@param citizenid string Player's citizen ID
---@param outfitName string Name of outfit to delete
---@param gender string Gender of outfit
---@return boolean success
function Database.DeletePersonalOutfit(citizenid, outfitName, gender)
    if not citizenid or not outfitName then
        return false
    end

    local success = MySQL.query.await([[
        DELETE FROM player_outfits
        WHERE citizenid = ? AND outfit_name = ? AND gender = ?
    ]], {citizenid, outfitName, gender})

    return success ~= nil
end

--- Delete a job/gang outfit (admin only)
---@param job string|nil Job name
---@param gang string|nil Gang name
---@param outfitName string Name of outfit to delete
---@param gender string Gender of outfit
---@return boolean success
function Database.DeleteJobGangOutfit(job, gang, outfitName, gender)
    if not outfitName then
        return false
    end

    local success = MySQL.query.await([[
        DELETE FROM appearance_job_outfits
        WHERE outfit_name = ? AND gender = ?
        AND (job = ? OR gang = ?)
    ]], {outfitName, gender, job or '', gang or ''})

    return success ~= nil
end

return Database
