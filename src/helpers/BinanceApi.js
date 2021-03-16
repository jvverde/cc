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

export async function loadAggTradesLastMinutes (symbol, minutes) {
  const endTime = Date.now() - (minutes - 1) * 60e3
  const startTime = endTime - 60e3
  let result = await loadAggTradesBetween(symbol, { endTime, startTime })
  let len = result.length
  let { a: lastID, T: time } = (result[len - 1] || {})
  console.log(lastID, new Date(time))
  while (lastID && time) {
    const fromId = lastID + 1
    const r = await loadAggTradesFromId(symbol, { fromId })
    if (!r || !(r.length > 0)) break
    result = result.concat(r)
    len = r.length
    const last = r[len - 1]
    lastID = last.a
    time = last.T
    console.log(lastID, len, new Date(time))
    if (len < 1000) break
  }
  return result
}
