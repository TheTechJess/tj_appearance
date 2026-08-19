-- Database operations for appearance system using oxmysql

local Database = {}

local function columnExists(tableName, columnName)
    local result = MySQL.query.await([[
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
        LIMIT 1
    ]], {tableName, columnName})

    return result and result[1] ~= nil
end

local function indexExists(tableName, indexName)
    local result = MySQL.query.await([[
        SELECT 1
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?
        LIMIT 1
    ]], {tableName, indexName})

    return result and result[1] ~= nil
end

local function ensureColumn(tableName, columnName, definition)
    if columnExists(tableName, columnName) then
        return
    end

    pcall(function()
        MySQL.query.await(('ALTER TABLE %s ADD COLUMN %s %s'):format(tableName, columnName, definition))
    end)
end

local function ensureIndex(tableName, indexName, definition)
    if indexExists(tableName, indexName) then
        return
    end

    pcall(function()
        MySQL.query.await(('ALTER TABLE %s ADD %s'):format(tableName, definition))
    end)
end


MySQL.ready(function()
    -- Create player_appearance table if it doesn't exist
    MySQL.query([[
        CREATE TABLE IF NOT EXISTS player_appearance (
            id INT NOT NULL AUTO_INCREMENT,
            citizenid VARCHAR(50) NOT NULL,
            appearance_data LONGTEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY unique_citizenid (citizenid)
        )
    ]])

    -- Create player_outfits table if it doesn't exist
    MySQL.query([[
        CREATE TABLE IF NOT EXISTS player_outfits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            citizenid VARCHAR(50) NOT NULL,
            gender VARCHAR(10) NOT NULL,
            outfit_name VARCHAR(100) NOT NULL,
            outfit_data LONGTEXT NOT NULL,
            share_code VARCHAR(8) NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_citizenid_outfit (citizenid, outfit_name, gender),
            UNIQUE KEY unique_share_code (share_code),
            INDEX idx_citizenid_gender (citizenid, gender)
        )
    ]])

    -- Migrate older installs that created player_outfits before these fields existed.
    ensureColumn('player_outfits', 'gender', "VARCHAR(10) NOT NULL DEFAULT 'male'")
    ensureColumn('player_outfits', 'outfit_name', "VARCHAR(100) NOT NULL DEFAULT 'Outfit'")
    ensureColumn('player_outfits', 'outfit_data', 'LONGTEXT NOT NULL')
    ensureColumn('player_outfits', 'share_code', 'VARCHAR(8) NULL')
    ensureColumn('player_outfits', 'created_at', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP')
    ensureColumn('player_outfits', 'updated_at', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')

    ensureIndex('player_outfits', 'unique_citizenid_outfit', 'UNIQUE KEY unique_citizenid_outfit (citizenid, outfit_name, gender)')
    ensureIndex('player_outfits', 'unique_share_code', 'UNIQUE KEY unique_share_code (share_code)')
    ensureIndex('player_outfits', 'idx_citizenid_gender', 'INDEX idx_citizenid_gender (citizenid, gender)')
end)

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
---@return string|nil shareCode The generated share code
function Database.SaveOutfit(citizenid, job, gang, gender, outfitName, outfitData)
    if not outfitName or not outfitData or not gender then
        return false, nil
    end

    -- Generate unique 8-character share code
    local function generateShareCode()
        local chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' -- Removed similar looking chars
        for _ = 1, 10 do
            local code = ''
            for i = 1, 8 do
                local rand = math.random(1, #chars)
                code = code .. chars:sub(rand, rand)
            end

            local existing = MySQL.query.await('SELECT id FROM player_outfits WHERE share_code = ? LIMIT 1', {code})
            if not existing or not existing[1] then
                return code
            end
        end

        return nil
    end

    -- Determine if this is a personal outfit or job/gang outfit
    local isPersonal = citizenid and not job and not gang

    if isPersonal then
        local shareCode = generateShareCode()
        if not shareCode then
            return false, nil
        end
        
        -- Save to personal outfits table
        local result = MySQL.query.await([[
            INSERT INTO player_outfits (citizenid, gender, outfit_name, outfit_data, share_code, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
                outfit_data = VALUES(outfit_data),
                share_code = VALUES(share_code),
                updated_at = NOW()
        ]], {citizenid, gender, outfitName, json.encode(outfitData), shareCode})

        return result ~= nil, shareCode
    end

    return false, nil
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
        SELECT id, outfit_name, outfit_data, created_at, updated_at
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

--- Rename a personal outfit
---@param citizenid string Player's citizen ID
---@param outfitId number Outfit ID
---@param newName string New outfit name
---@param gender string Gender filter (male/female)
---@return boolean success
function Database.RenamePersonalOutfit(citizenid, outfitId, newName, gender)
    if not citizenid or not outfitId or not newName then
        return false
    end

    local result = MySQL.query.await([[
        UPDATE player_outfits
        SET outfit_name = ?, updated_at = NOW()
        WHERE citizenid = ? AND id = ? AND gender = ?
    ]], {newName, citizenid, outfitId, gender})

    return result and result.affectedRows > 0
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

--- Delete a personal outfit by ID
---@param citizenid string Player's citizen ID
---@param outfitId number ID of outfit to delete
---@param gender string Gender of outfit
---@return boolean success
function Database.DeletePersonalOutfitById(citizenid, outfitId, gender)
    if not citizenid or not outfitId then
        return false
    end

    local result = MySQL.query.await([[
        DELETE FROM player_outfits
        WHERE citizenid = ? AND id = ? AND gender = ?
    ]], {citizenid, outfitId, gender})

    return result and result.affectedRows > 0
end

--- Get share code for an outfit
---@param citizenid string Player's citizen ID
---@param outfitId number Outfit ID
---@return string|nil shareCode
function Database.GetOutfitShareCode(citizenid, outfitId)
    local result = MySQL.query.await([[
        SELECT share_code
        FROM player_outfits
        WHERE citizenid = ? AND id = ?
    ]], {citizenid, outfitId})

    if result and result[1] then
        return result[1].share_code
    end
    return nil
end

--- Import outfit by share code
---@param shareCode string The share code
---@param targetCitizenid string The citizen ID of the player importing
---@param newOutfitName string Name for the imported outfit
---@return boolean success
function Database.ImportOutfitByShareCode(shareCode, targetCitizenid, newOutfitName)
    -- Find the outfit with this share code
    local result = MySQL.query.await([[
        SELECT outfit_data, gender
        FROM player_outfits
        WHERE share_code = ?
        LIMIT 1
    ]], {shareCode})

    if not result or not result[1] then
        return false
    end

    local outfitData = result[1].outfit_data
    local gender = result[1].gender

    -- Generate new share code for the imported outfit
    local chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    local newShareCode = ''
    for i = 1, 8 do
        local rand = math.random(1, #chars)
        newShareCode = newShareCode .. chars:sub(rand, rand)
    end

    -- Save as new outfit for target player
    local insertResult = MySQL.query.await([[
        INSERT INTO player_outfits (citizenid, gender, outfit_name, outfit_data, share_code, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    ]], {targetCitizenid, gender, newOutfitName, outfitData, newShareCode})

    return insertResult ~= nil
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
