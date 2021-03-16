import axios from 'axios'
import { apiv3 } from 'src/config'
import Bottleneck from 'bottleneck'

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 60 // 1000 per minute
})

const enqueue = job => limiter.schedule(job) // enqueued a job in limiter schedule

const enqvoid = n => { // enqueued n void requests
  while (n-- > 0) enqueue(() => true)
}

const _get = (url, options) => axios.get(url, options)
  .then(answer => answer.data)
  .catch(err => {
    console.error(err.response)
    console.warn(err.response.status)
    throw err
  })

const get = (endpoint, params = {}) => enqueue(() => _get(`${apiv3}/${endpoint}`, { params }))

const getWeight = (endpoint, w, params = {}) => get(endpoint, params).finally(() => enqvoid(w))

export const exchangeInfo = () => get('exchangeInfo')

export const allTicker24h = () => getWeight('ticker/24hr', 40)

export function loadAggTradesBetween (symbol, {
  limit = 1000,
  endTime = Date.now(),
  startTime
} = {}) {
  startTime = startTime || (endTime - 59 * 60e3)
  return get('aggTrades', {
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
  return get('aggTrades', {
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
