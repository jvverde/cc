import { klines } from './Binance.api'

export async function loadKlines (symbol, {
  minutes,
  interval = '1m',
  handler = () => true
} = {}) {
  const limit = 1000
  if (!minutes) {
    const m = interval.match(/(\d+)([mhdwM])/)
    if (!m) throw new Error(`"${interval}" is not a valid interval`)
    const v = 0 | m[1]
    const s = m[2]
    const p = {
      m: 24 * 60 * 2, // 2 days of 1m klines
      h: 24 * 60 * 30 * 6, // 6 months
      d: 24 * 60 * 356 * 2, // 2 years
      w: 24 * 60 * 356 * 10, // 10 years
      M: 24 * 60 * 356 * 40 // 40 years
    }
    minutes = p[s] * v
  }
  const endTime = Date.now()
  let startTime = endTime - minutes * 60e3
  let result = [], r = []
  do {
    r = await klines({ symbol, interval, endTime, startTime, limit })
    const k = r.map(r => ({
      s: symbol,
      t: r[0],
      T: r[6],
      o: +r[1],
      h: +r[2],
      l: +r[3],
      c: +r[4],
      v: +r[5],
      q: +r[7]
    }))
    handler(k)
    result = result.concat(r)
    const lasttime = r[r.length - 1][6]
    startTime = lasttime + 1
  } while (r.length === limit)
  return result
}
