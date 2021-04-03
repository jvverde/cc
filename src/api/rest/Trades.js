import { aggTrades } from './Binance.api'

export function loadAggTradesBetween (symbol, {
  limit = 1000,
  endTime = Date.now(),
  startTime
} = {}) {
  startTime = startTime || (endTime - 59 * 60e3)
  return aggTrades({
    symbol,
    startTime,
    endTime,
    limit
  })
}

export function loadAggTradesFromId (symbol, {
  limit = 1000,
  fromId
} = {}) {
  return aggTrades({
    symbol,
    fromId,
    limit
  })
}

export async function loadAggTradesLastMinutes (symbol, {
  minutes = 30,
  handler = () => true
} = {}) {
  const limit = 1000
  const endTime = Date.now() - (minutes - 1) * 60e3
  const startTime = endTime - 60e3
  let result = await loadAggTradesBetween(symbol, { endTime, startTime, limit })
  if (result.length === 0) return result
  let r = result
  handler(r)
  do {
    const fromId = 1 + r[r.length - 1].a
    r = await loadAggTradesFromId(symbol, { fromId })
    handler(r)
    result = result.concat(r)
  } while (r.length === limit)
  return result
}
