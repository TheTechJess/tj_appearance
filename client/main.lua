local handleNuiMessage = require('modules.nui')



RegisterCommand('appearance', function()
  local localeFile = LoadResourceFile(GetCurrentResourceName(), "shared/locale/en.json")

  if not localeFile then
    return
  end

  local locale = json.decode(localeFile)

  if not locale then
    return
  end

  -- Get player's current model to determine gender
  local model = GetEntityModel(cache.ped)
  local isMale = model == GetHashKey("mp_m_freemode_01")
  local gender = isMale and 'male' or 'female'

    lib.callback('tj_appearance:admin:getTheme', false, function(theme)
    if theme then
      handleNuiMessage({ action = 'setThemeConfig', data = theme }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getShape', false, function(shape)
    if shape then
      handleNuiMessage({ action = 'setShapeConfig', data = shape }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getRestrictions', false, function(restrictions)
    if restrictions then
      handleNuiMessage({ action = 'setRestrictions', data = restrictions }, true)
    end
  end)
  
  -- Fetch restrictions for this player
  lib.callback('tj_appearance:getPlayerRestrictions', false, function(restrictions)
    local blacklist = { models = {}, drawables = {}, props = {} }
    
    if restrictions and restrictions.legacy then
      local genderData = restrictions.legacy[gender]
      if genderData then
        blacklist = genderData
      end
    end

    local models = lib.callback.await('tj_appearance:admin:getModels', false)
    
    -- Cache models globally for hash-to-string conversion
    _G.cachedModels = models
    
    -- Get locked models from server
    lib.callback('tj_appearance:admin:getSettings', false, function(settings)
      local lockedModels = (settings and settings.lockedModels) or {}
      
      -- Get player data from framework
      local playerData = Framework and Framework.GetPlayerData() or nil
      local jobData = { name = "", isBoss = false }
      
      if playerData and playerData.job then
        jobData = {
          name = playerData.job.name,
          isBoss = playerData.job.isBoss
        }
      end
      
      handleNuiMessage({
        action = 'data',
        data = {
          tabs = { "heritage", 'face', 'hair', 'clothes', 'accessories','makeup', 'tattoos', 'outfits' },
          appearance = GetPlayerAppearance(),
          locale = locale,
          models = models,
          blacklist = blacklist,
          tattoos = {},
          outfits = {},
          allowExit = true,
          job = jobData
        }
      }, true)
      
      -- Send locked models separately
      handleNuiMessage({
        action = 'setLockedModels',
        data = lockedModels
      }, true)
      
      Wait(1000)
      ToggleCam(true)
      handleNuiMessage({ action = 'setVisibleApp', data = true }, true)
    end)
  end)
end, false)

RegisterNuiCallback('save', function(data, cb)
  if _zoneNoclipActive then
    -- Ignore save while capture mode is active
    cb('ok')
    return
  end
  handleNuiMessage({ action = 'setVisibleApp', data = false }, false)
  SetNuiFocus(false, false)
  ToggleCam(false)
  cb('ok')
end)

RegisterNuiCallback('cancel', function(data, cb)
  print('[tj_appearance] NUI cancel called')
  if _zoneNoclipActive then
    -- Ignore cancel while capture mode is active
    cb('ok')
    return
  end
  handleNuiMessage({ action = 'setVisibleApp', data = false }, false)
  SetNuiFocus(false, false)
  ToggleCam(false)
  cb('ok')
end)




function DebugPrint(msg)
  if Config.Debug then
    print(('[tj-appearance] %s'):format(msg))
  end
end


function GetPlayerAppearance()
  -- Expanded function to get player appearance
  local headData, headTotal = GetHeadOverlay(cache.ped)
  local drawables, drawTotal = GetPedComponents(cache.ped)

  local props, propTotal = GetPedProps(cache.ped)
  local modelHash = GetEntityModel(cache.ped)
  local hairColour = GetHairColour(cache.ped)
  --local tattoos = cache.ped == PlayerPedId() and GetPedTattoos and GetPedTattoos(cache.ped) or {}

  -- Convert model hash to string by checking against available models
  local modelString = modelHash
  
  -- Check common freemode models first
  if modelHash == `mp_m_freemode_01` then
    modelString = "mp_m_freemode_01"
  elseif modelHash == `mp_f_freemode_01` then
    modelString = "mp_f_freemode_01"
  else
    -- For other models, try to find matching hash in models list
    if _G.cachedModels then
      for _, modelName in ipairs(_G.cachedModels) do
        local calculatedHash = joaat(modelName)
        if calculatedHash == modelHash then
          modelString = modelName
          break
        end
      end
      if modelString == modelHash then
      end
    else
      print('[tj_appearance] WARNING: cachedModels not available')
    end
  end

  local data = {
    model = modelString,
    hairColour = hairColour,
    headBlend = GetPedHeritageData(cache.ped),
    headStructure = GetHeadStructure(cache.ped),
    headOverlay = headData,
    headOverlayTotal = headTotal,
    drawables = drawables,
    drawTotal = drawTotal,
    props = props,
    propTotal = propTotal,
    tattoos = nil
  }

  return data
end

-- Admin Menu
RegisterNetEvent('tj_appearance:client:openAdminMenu', function()
  lib.callback('tj_appearance:admin:getTheme', false, function(theme)
    if theme then
      handleNuiMessage({ action = 'setThemeConfig', data = theme }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getShape', false, function(shape)
    if shape then
      handleNuiMessage({ action = 'setShapeConfig', data = shape }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getRestrictions', false, function(restrictions)
    print('[tj_appearance] Restrictions count:', #restrictions)
    if restrictions then
      handleNuiMessage({ action = 'setRestrictions', data = restrictions }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getModels', false, function(models)
    if models then
      handleNuiMessage({ action = 'setModels', data = models }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getSettings', false, function(settings)
    if settings then
      handleNuiMessage({ action = 'setSettings', data = settings }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getShopSettings', false, function(shopSettings)
    if shopSettings then
      handleNuiMessage({ action = 'setShopSettings', data = shopSettings }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getShopConfigs', false, function(shopConfigs)
    if shopConfigs then
      handleNuiMessage({ action = 'setShopConfigs', data = shopConfigs }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getZones', false, function(zones)
    if zones then
      handleNuiMessage({ action = 'setZones', data = zones }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getOutfits', false, function(outfits)
    if outfits then
      handleNuiMessage({ action = 'setOutfits', data = outfits }, true)
    end
  end)
  
  handleNuiMessage({ action = 'setVisibleAdminMenu', data = true }, true)
  SetNuiFocus(true, true)
end)

RegisterNetEvent('tj_appearance:client:updateTheme', function(theme)
  handleNuiMessage({ action = 'setThemeConfig', data = theme }, true)
end)

RegisterNetEvent('tj_appearance:client:updateShape', function(shape)
  handleNuiMessage({ action = 'setShapeConfig', data = shape }, true)
end)

RegisterNuiCallback('closeAdminMenu', function(data, cb)
  SetNuiFocus(false, false)
  cb('ok')
end)

RegisterNuiCallback('saveTheme', function(theme, cb)
  lib.callback('tj_appearance:admin:saveTheme', false, function(success)
    cb(success)
  end, theme)
end)

RegisterNuiCallback('saveShape', function(shape, cb)
  lib.callback('tj_appearance:admin:saveShape', false, function(success)
    cb(success)
  end, shape)
end)

RegisterNuiCallback('saveSettings', function(settings, cb)
  lib.callback('tj_appearance:admin:saveSettings', false, function(success)
    cb(success)
  end, settings)
end)

RegisterNuiCallback('addRestriction', function(restriction, cb)
  lib.callback('tj_appearance:admin:addRestriction', false, function(success)
    cb(success)
  end, restriction)
end)

RegisterNuiCallback('deleteRestriction', function(id, cb)
  lib.callback('tj_appearance:admin:deleteRestriction', false, function(success)
    cb(success)
  end, id)
end)

RegisterNuiCallback('addModel', function(modelName, cb)
  lib.callback('tj_appearance:admin:addModel', false, function(success)
    cb(success)
  end, modelName)
end)

RegisterNuiCallback('deleteModel', function(modelName, cb)
  lib.callback('tj_appearance:admin:deleteModel', false, function(success)
    cb(success)
  end, modelName)
end)

RegisterNuiCallback('addLockedModels', function(payload, cb)
  lib.callback('tj_appearance:admin:addLockedModels', false, function(updated)
    cb(updated)
  end, payload)
end)

RegisterNuiCallback('deleteModels', function(modelNames, cb)
  lib.callback('tj_appearance:admin:deleteModels', false, function(success)
    cb(success)
  end, modelNames)
end)

RegisterNuiCallback('saveShopSettings', function(data, cb)
  lib.callback('tj_appearance:admin:saveShopSettings', false, function(success)
    cb(success)
  end, data)
end)

RegisterNuiCallback('addZone', function(zone, cb)
  lib.callback('tj_appearance:admin:addZone', false, function(success)
    cb(success)
  end, zone)
end)

RegisterNuiCallback('updateZone', function(zone, cb)
  lib.callback('tj_appearance:admin:updateZone', false, function(success)
    cb(success)
  end, zone)
end)

RegisterNuiCallback('deleteZone', function(id, cb)
  lib.callback('tj_appearance:admin:deleteZone', false, function(success)
    cb(success)
  end, id)
end)

RegisterNuiCallback('addOutfit', function(outfit, cb)
  lib.callback('tj_appearance:admin:addOutfit', false, function(result)
    cb(result)
  end, outfit)
end)

RegisterNuiCallback('deleteOutfit', function(id, cb)
  lib.callback('tj_appearance:admin:deleteOutfit', false, function(success)
    cb(success)
  end, id)
end)

-- JSON blacklist management removed per request

-- Utility: return player's current coords and heading
RegisterNuiCallback('getPlayerCoords', function(_, cb)
  local ped = cache.ped
  local x, y, z = table.unpack(GetEntityCoords(ped))
  local heading = GetEntityHeading(ped)
  cb({ x = x, y = y, z = z, heading = heading })
end)

-- ===== Zone Noclip + Raycast Mode =====
local _zoneNoclipActive = false
local _zoneRaycastPoint = nil
local _zoneMoveSpeed = 5.0
local _zoneMultiPointMode = false
local _zoneMultiPoints = {}
local _zoneStartedAt = 0

local function RaycastFromCamera(maxDistance)
  local cam = GetRenderingCam()
  if cam == -1 then cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true) end
  local from = GetFinalRenderedCamCoord()
  local dir = GetFinalRenderedCamRot(2)
  local pitch = math.rad(dir.x)
  local yaw = math.rad(dir.z)
  local forward = vector3(-math.sin(yaw) * math.cos(pitch), math.cos(yaw) * math.cos(pitch), math.sin(pitch))
  local to = from + forward * (maxDistance or 200.0)
  local ray = StartShapeTestRay(from.x, from.y, from.z, to.x, to.y, to.z, 1, cache.ped, 7)
  local _, hit, hitCoords = GetShapeTestResult(ray)
  if hit == 1 then
    return hitCoords
  end
  return nil
end

local function DrawRayLine(from, to)
  DrawLine(from.x, from.y, from.z, to.x, to.y, to.z, 255, 0, 0, 200)
end

local function SetPedNoClip(ped, enabled)
  SetEntityCollision(ped, not enabled, true)
  SetEntityInvincible(ped, enabled)
  FreezeEntityPosition(ped, false)
  SetEntityVisible(ped, true, false)
  SetEntityProofs(ped, enabled, enabled, enabled, enabled, enabled, enabled, enabled, enabled)
end

-- Freecam controls: move the camera instead of the ped
local function HandleFreecamMovement(cam)
  local camPos = GetFinalRenderedCamCoord()
  local speed = _zoneMoveSpeed
  -- Controls: W/S forward/back, A/D strafe, Space ascend, Ctrl descend, Shift speed boost
  if IsControlPressed(0, 21) then speed = speed * 2.0 end -- Shift
  local camRot = GetFinalRenderedCamRot(2)
  local pitch = math.rad(camRot.x)
  local yaw = math.rad(camRot.z)
  local forward = vector3(-math.sin(yaw) * math.cos(pitch), math.cos(yaw) * math.cos(pitch), math.sin(pitch))
  local right = vector3(forward.y, -forward.x, 0.0)
  local delta = vector3(0.0, 0.0, 0.0)
  if IsControlPressed(0, 32) then delta = delta + forward * speed * GetFrameTime() * 60.0 end -- W
  if IsControlPressed(0, 33) then delta = delta - forward * speed * GetFrameTime() * 60.0 end -- S
  if IsControlPressed(0, 34) then delta = delta - right * speed * GetFrameTime() * 60.0 end -- A
  if IsControlPressed(0, 35) then delta = delta + right * speed * GetFrameTime() * 60.0 end -- D
  if IsControlPressed(0, 22) then delta = delta + vector3(0.0, 0.0, speed * GetFrameTime() * 60.0) end -- Space
  if IsControlPressed(0, 36) then delta = delta - vector3(0.0, 0.0, speed * GetFrameTime() * 60.0) end -- Ctrl
  SetCamCoord(cam, camPos.x + delta.x, camPos.y + delta.y, camPos.z + delta.z)
end

local function StartZoneRaycastMode(multiPoint)
  print('[tj_appearance] Starting zone raycast mode')
  if _zoneNoclipActive then return end
  _zoneNoclipActive = true
  _zoneMultiPointMode = multiPoint or false
  _zoneMultiPoints = {}
  _zoneStartedAt = GetGameTimer()
  local ped = cache.ped
  -- Enable freecam: create and render a camera detached from ped
  local cam = GetRenderingCam()
  if cam == -1 then cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true) end
  local pedPos = GetEntityCoords(ped)
  SetCamCoord(cam, pedPos.x, pedPos.y, pedPos.z + 1.0)
  SetCamActive(cam, true)
  RenderScriptCams(true, false, 0, true, false)
  -- Notify UI to stay hidden during capture
  SendNUIMessage({ action = 'zoneCaptureActive', active = true })
  print('[tj_appearance] Noclip enabled for zone raycast mode')
  CreateThread(function()
    while _zoneNoclipActive do
      HandleFreecamMovement(cam)
      local from = GetFinalRenderedCamCoord()
      local hit = RaycastFromCamera(200.0)
      _zoneRaycastPoint = hit
      if hit then
        DrawRayLine(from, hit)
      end
      DisableControlAction(0, 24, true) -- Disable attack
      DisableControlAction(0, 25, true) -- Disable aim
      
      -- Multi-point mode: E to add point, ESC to finish
      if _zoneMultiPointMode then
        if IsControlJustPressed(0, 38) then -- E key
          if hit then
            table.insert(_zoneMultiPoints, { x = hit.x, y = hit.y })
            lib.notify({ type = 'success', description = ('Point %d added'):format(#_zoneMultiPoints) })
          end
        end
        if IsControlJustPressed(0, 177) then -- Backspace key to finish (avoid ESC closing UI)
          StopZoneRaycastMode()
          SendNUIMessage({ action = 'polyzonePointsCaptured', points = _zoneMultiPoints })
          break
        end
      end
      print(_zoneNoclipActive)
      
      Wait(0)
    end
    print('[tj_appearance] Noclip disabled for zone raycast mode')
    -- Disable freecam and restore normal camera
    RenderScriptCams(false, false, 0, true, false)
    DestroyCam(cam, false)
    -- Notify UI capture finished
    SendNUIMessage({ action = 'zoneCaptureActive', active = false })
  end)
end

local function StopZoneRaycastMode()
  _zoneNoclipActive = false
  _zoneRaycastPoint = nil
  _zoneMultiPointMode = false
end

RegisterNuiCallback('startZoneRaycast', function(data, cb)
  StartZoneRaycastMode(data.multiPoint)
  SetNuiFocus(false, false)
  print('[tj_appearance] Zone raycast mode started')
  cb(true)
end)

RegisterNuiCallback('stopZoneRaycast', function(_, cb)
  -- Ignore external stop requests during multi-point mode; finish via keybind
  if _zoneMultiPointMode then
    cb(false)
    return
  end
  -- Ignore if not active or called too soon
  if not _zoneNoclipActive or (GetGameTimer() - _zoneStartedAt) < 200 then
    cb(false)
    return
  end
  StopZoneRaycastMode()
  SetNuiFocus(true, true)
  cb(true)
end)

RegisterNuiCallback('captureRaycastPoint', function(_, cb)
  local hit = _zoneRaycastPoint
  if hit then
    cb({ x = hit.x, y = hit.y, z = hit.z })
  else
    cb(nil)
  end
end)

-- Resource lifecycle failsafes: ensure noclip is disabled on start/stop
AddEventHandler('onResourceStart', function(resourceName)
  if resourceName ~= GetCurrentResourceName() then return end
  _zoneNoclipActive = false
  _zoneRaycastPoint = nil
  local ped = cache.ped
  if ped and DoesEntityExist(ped) then
    SetPedNoClip(ped, false)
    -- Re-enable collision in case it was left disabled
    SetEntityCollision(ped, true, true)
  end
end)

AddEventHandler('onResourceStop', function(resourceName)
  if resourceName ~= GetCurrentResourceName() then return end
  _zoneNoclipActive = false
  _zoneRaycastPoint = nil
  local ped = cache.ped
  if ped and DoesEntityExist(ped) then
    SetPedNoClip(ped, false)
    SetEntityCollision(ped, true, true)
  end
end)
