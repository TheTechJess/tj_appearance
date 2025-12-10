function Tofloat(num)
    -- Safely convert input to float; handle nil and non-number values
    if num == nil then
        return 0.0
    end
    local n = tonumber(num)
    if n == nil then
        return 0.0
    end
    return n + 0.0
end


function TableContains(tbl, value)
    for _, v in ipairs(tbl) do
        if v == value then
            return true
        end
    end
    return false
end

-- Format zone label with menu type and price
function getZoneLabel(zoneType)
    local menuType = zoneType or 'clothing'
    local typeNames = {
        clothing = 'Clothing Store',
        barber = 'Barber Shop',
        tattoo = 'Tattoo Parlor',
        surgeon = 'Surgeon',
        outfits = 'Outfits'
    }
    
    local typeName = typeNames[menuType] or 'Appearance'
    local price = (Config.Prices and Config.Prices[menuType]) or 0
    
    if price > 0 then
        return string.format('Open %s ($%d)', typeName, price)
    else
        return string.format('Open %s', typeName)
    end
end


-- Helper function to check if player has job/gang access
function hasAccess(zone)
    if not zone.job and not zone.gang then
        return true -- No restrictions
    end

    local playerData = Framework and Framework.GetPlayerData() or nil
    if not playerData then return false end

    if zone.job and playerData.job and playerData.job.name == zone.job then
        return true
    end

    if zone.gang and playerData.gang and playerData.gang.name == zone.gang then
        return true
    end

    return false
end

function countTable(t)
    local count = 0
    for _ in pairs(t) do count = count + 1 end
    return count
end