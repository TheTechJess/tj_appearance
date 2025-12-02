-- Guard: ensure qb-core is started before loading (QBox is based on QBCore)
if GetResourceState('qb-core') ~= 'started' then
    return
end

local QBCore = exports['qb-core']:GetCoreObject()

Framework = {}

--- Get player data from QBox/QBCore
---@param source number Player server ID
---@return table|nil playerData Player data including job, gang, citizenid, etc.
function Framework.GetPlayer(source)
    local Player = QBCore.Functions.GetPlayer(source)
    if not Player then return nil end
    
    return {
        source = source,
        citizenid = Player.PlayerData.citizenid,
        name = Player.PlayerData.charinfo.firstname .. ' ' .. Player.PlayerData.charinfo.lastname,
        job = {
            name = Player.PlayerData.job.name,
            label = Player.PlayerData.job.label,
            grade = Player.PlayerData.job.grade.level,
            onduty = Player.PlayerData.job.onduty,
            isBoss = Player.PlayerData.job.isboss
        },
        gang = {
            name = Player.PlayerData.gang and Player.PlayerData.gang.name or 'none',
            label = Player.PlayerData.gang and Player.PlayerData.gang.label or 'None',
            grade = Player.PlayerData.gang and Player.PlayerData.gang.grade.level or 0
        },
        money = {
            cash = Player.PlayerData.money.cash or 0,
            bank = Player.PlayerData.money.bank or 0
        },
        identifiers = {
            steam = Player.PlayerData.steam,
            license = Player.PlayerData.license,
            discord = Player.PlayerData.discord
        }
    }
end

--- Check if player has permission (admin/ACE)
---@param source number Player server ID
---@return boolean hasPermission
function Framework.HasPermission(source)
    return IsPlayerAceAllowed(source, 'command')
end

--- Get player's current job name
---@param source number Player server ID
---@return string|nil jobName
function Framework.GetJob(source)
    local Player = QBCore.Functions.GetPlayer(source)
    if not Player then return nil end
    return Player.PlayerData.job.name
end

--- Get player's current gang name
---@param source number Player server ID
---@return string|nil gangName
function Framework.GetGang(source)
    local Player = QBCore.Functions.GetPlayer(source)
    if not Player then return nil end
    return Player.PlayerData.gang and Player.PlayerData.gang.name or 'none'
end

--- Get player's citizen ID
---@param source number Player server ID
---@return string|nil citizenid
function Framework.GetCitizenId(source)
    local Player = QBCore.Functions.GetPlayer(source)
    if not Player then return nil end
    return Player.PlayerData.citizenid
end

return Framework
