-- Guard: ensure qbx_core is started before loading
if GetResourceState('qbx_core') ~= 'started' then
    return
end

Framework = {}

--- Get local player data from QBox/QBCore
---@return table|nil playerData Player data including job, gang, etc.
function Framework.GetPlayerData()
    local PlayerData = exports.qbx_core:GetPlayerData()
    if not PlayerData then return nil end
    
    return {
        citizenid = PlayerData.citizenid,
        name = PlayerData.charinfo.firstname .. ' ' .. PlayerData.charinfo.lastname,
        job = {
            name = PlayerData.job.name,
            label = PlayerData.job.label,
            grade = PlayerData.job.grade.level,
            onduty = PlayerData.job.onduty,
            isBoss = PlayerData.job.isboss
        },
        gang = {
            name = PlayerData.gang and PlayerData.gang.name or 'none',
            label = PlayerData.gang and PlayerData.gang.label or 'None',
            grade = PlayerData.gang and PlayerData.gang.grade.level or 0
        },
        gender = PlayerData.charinfo.gender == 1 and 'Female' or 'Male'
    }
end

--- Listen for job updates
---@param callback function Callback function to run when job changes
function Framework.OnJobUpdate(callback)
    RegisterNetEvent('QBCore:Client:OnJobUpdate', function(job)
        callback(job)
    end)
end

--- Listen for gang updates
---@param callback function Callback function to run when gang changes
function Framework.OnGangUpdate(callback)
    RegisterNetEvent('QBCore:Client:OnGangUpdate', function(gang)
        callback(gang)
    end)
end

RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    CacheAPI.init()
    Wait(1500)
    if LoadSavedAppearance then
        LoadSavedAppearance(false)
    end
end)

RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
    ClearPedDecorations(cache.ped)
end)

RegisterNetEvent('qbx_core:client:playerLoaded', function()
    CacheAPI.init()
    Wait(1500)
    if LoadSavedAppearance then
        LoadSavedAppearance(false)
    end
end)

