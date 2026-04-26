---@param message NuiMessage
---@param shouldFocus boolean
local function handleNuiMessage(message, shouldFocus)
  if not(type(message) == 'table') then return end

  SendNUIMessage(message)

    if not(type(shouldFocus) == 'boolean') then return end
  SetNuiFocus(shouldFocus, shouldFocus)
end

local function hideComponent(data, cb) handleNuiMessage(data, false) cb(true) end
RegisterNUICallback('hideComponent', hideComponent)

return handleNuiMessage