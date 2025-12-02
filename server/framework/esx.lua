-- Guard: ensure es_extended is started before loading
if GetResourceState('es_extended') ~= 'started' then
    return
end

local ESX = exports['es_extended']:getSharedObject()

Framework = {}

--- Get player data from ESX
---@param source number Player server ID
---@return table|nil playerData Player data including job, identifier, etc.
function Framework.GetPlayer(source)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return nil end
    
    return {
        source = source,
        citizenid = xPlayer.identifier, -- ESX uses identifier instead of citizenid
        name = xPlayer.getName(),
        job = {
            name = xPlayer.job.name,
            label = xPlayer.job.label,
            grade = xPlayer.job.grade,
            onduty = true, -- ESX doesn't have onduty by default
            isBoss = xPlayer.job.grade_name == 'boss'
        },
        gang = {
            name = 'none', -- ESX doesn't have gangs by default
            label = 'None',
            grade = 0
        },
        money = {
            cash = xPlayer.getMoney(),
            bank = xPlayer.getAccount('bank').money
        },
        identifiers = {
            steam = xPlayer.identifier,
            license = xPlayer.identifier,
            discord = nil
        }
    }
end

--- Check if player has permission (admin/ACE)
---@param source number Player server ID
---@return boolean hasPermission
function Framework.HasPermission(source)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return false end
    -- Check ESX group or ACE permission
    return xPlayer.getGroup() == 'admin' or xPlayer.getGroup() == 'superadmin' or IsPlayerAceAllowed(source, 'command')
end

--- Get player's current job name
---@param source number Player server ID
---@return string|nil jobName
function Framework.GetJob(source)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return nil end
    return xPlayer.job.name
end

--- Get player's current gang name (ESX doesn't have gangs by default)
---@param source number Player server ID
---@return string gangName
function Framework.GetGang(source)
    return 'none'
end

--- Get player's identifier (equivalent to citizen ID)
---@param source number Player server ID
---@return string|nil identifier
function Framework.GetCitizenId(source)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then return nil end
    return xPlayer.identifier
end

return Framework
