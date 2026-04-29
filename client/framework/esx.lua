---@diagnostic disable: duplicate-set-field
-- Guard: ensure es_extended is started before loading
if GetResourceState('es_extended') ~= 'started' then
    return
end

Framework = {}
Framework.ESX = exports['es_extended']:getSharedObject()

--- Get local player data from ESX
---@return table|nil playerData Player data including job, etc.
function Framework.GetPlayerData()
    local PlayerData = Framework.ESX.GetPlayerData()
    if not PlayerData then return nil end

    local name = PlayerData.name or (PlayerData.firstName and PlayerData.lastName and (PlayerData.firstName .. ' ' .. PlayerData.lastName)) or 'Unknown'

    local jobdata = {
        name = PlayerData.job and PlayerData.job.name or 'unemployed',
        label = PlayerData.job and PlayerData.job.label or 'Unemployed',
        grade = PlayerData.job and PlayerData.job.grade or 0,
        isBoss = PlayerData.job and PlayerData.job.grade_name == 'boss' or false
    }
    
    return {
        identifier = PlayerData.identifier,
        name = name,
        job = jobdata,
        gang = {
            name = 'none',
            label = 'None',
            grade = 0
        },
        gender = PlayerData.sex == "female" and  'Female' or 'Male'
    }
end

--- Listen for job updates
---@param callback function Callback function to run when job changes
function Framework.OnJobUpdate(callback)
    RegisterNetEvent('esx:setJob', function(job)
        callback(job)
    end)
end

--- Listen for gang updates (ESX doesn't have gangs by default)
---@param callback function Callback function to run when gang changes
function Framework.OnGangUpdate(callback)
    -- ESX doesn't have gangs by default
end

RegisterNetEvent('esx:playerLoaded', function(xPlayer, skin)
    Citizen.SetTimeout(500, function()
        CacheAPI.init()
    end)
end)

function Framework.CachePed()
    Framework.ESX.SetPlayerData("ped", cache.ped)
end
