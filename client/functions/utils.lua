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
