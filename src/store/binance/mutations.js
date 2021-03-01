import { tickers } from 'src/helpers/wsbinance'
import Vue from 'vue'
import numeral from 'numeral'

const compareBySymbol = (a, b) => {
  if (a.symbol < b.symbol) return -1
  if (a.symbol > b.symbol) return 1
  return 0
}

const compare = compareBySymbol
export function addPairs (state, pairs) {
  state.pairs.push(...pairs)
  state.pairs.sort(compare)
}

export function resetPairs (state) {
  state.pairs.length = 0 // reset array
}

export function monitorPairs (state, symbol) {
  if (typeof symbol === 'string') symbol = [symbol]
  console.log('symbols', symbol, typeof symbol)
  stopMonitoring(state)
  state.monitPairs.push(...symbol)
  state.websocket = tickers(...state.monitPairs, (pairs) => {
    console.log('Commit pairs', pairs)
  })
}

export function stopMonitoring (state) {
  if (state.websocket) {
    state.websocket.send(JSON.stringify({
      method: 'SUBSCRIBE',
      params: [
        'btcusdt@ticker',
        'bnbusdt@ticker'
      ],
      id: 1
    }))
    state.websocket.send(JSON.stringify({
      method: 'LIST_SUBSCRIPTIONS',
      id: 33333333
    }))
    // state.websocket.close(1000, 'stop by user')
  }
}

// const indexOfMax = (a) => { return a.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0) }

// const findIndexOfTime = (a, time) => {
//   let i = a.length
//   while (i-- > 0 && a[i].time > time) {}
//   return i
// }

// const findMaxAfter = (a, i) => {
//   let j = a.length
//   let max = { price: -Infinity }
//   while (--j > i) {
//     if (a[j].price > max.price) {
//       max = a[j]
//     }
//   }
//   return max
// }

const findMaxAfterTime = (a, time) => {
  let j = a.length
  let max = { price: -Infinity }
  while (--j > 0 && a[j].time > time) {
    if (a[j].price >= max.price) {
      max = a[j]
    }
  }
  return max
}

const findMinAfterTime = (a, time) => {
  let j = a.length
  let min = { price: Infinity }
  while (--j > 0 && a[j].time > time) {
    if (a[j].price <= min.price) {
      min = a[j]
    }
  }
  return min
}

// function format (t) {
//   return new Date(t).toLocaleTimeString('pt-PT')
// }

export function watch (state, symbol) {
  if (state.watching.includes(symbol)) return
  state.watching.push(symbol)
}

export function forget (state, symbol) {
  const index = state.watching.indexOf(symbol)
  if (index < 0) return
  state.watching.splice(index, 1)
}

export function enqueue (state, { stream, data }) {
  try {
    const price = Number(data.c)
    const time = data.E
    const current = { price, time, next: null }
    const symbol = state.symbols[stream]
    if (!symbol) {
      const lastmax = current
      const lastmin = current
      const symbol = {
        current,
        hist: [current],
        lastmax,
        lastmin,
        tail: 0
      }
      Vue.set(state.symbols, stream, symbol)
    } else {
      symbol.current = current
      symbol.hist.push(current)
      while (time - state.deephist > symbol.hist[symbol.tail].time) { // remove oldest tickets from history tail
        // const removed = symbol.hist.shift()
        const removed = symbol.hist[symbol.tail]
        if (removed.time === symbol.lastmax.time) {
          symbol.lastmax = symbol.lastmax.next || current // Use current just in case. It should never hapens
        }
        if (removed.time === symbol.lastmin.time) {
          symbol.lastmin = symbol.lastmin.next || current // Use current just in case. It should never hapens
        }
        symbol.tail++
      }
      if (price >= symbol.lastmax.price) {
        symbol.lastmax = current
      } else {
        let point = symbol.lastmax
        while (point.next && price < point.next.price) {
          point = point.next
        }
        point.next = current
      }
      if (price <= symbol.lastmin.price) {
        symbol.lastmin = current
      } else {
        let point = symbol.lastmin
        while (point.next && price > point.next.price) {
          point = point.next
        }
        point.next = current
      }
    }
  } catch (err) {
    console.warn('Enqueue', err, stream, data)
  }
}

export function cache (state, { stream, data }) {
  const { c: price, E: time } = data
  if (stream in state.cache) {
    const cache = state.cache[stream]
    const maxs = state.max[stream]
    const mins = state.min[stream]

    cache.push({ price, time })

    let lastmax = maxs[maxs.length - 1]
    let lastmin = mins[mins.length - 1]
    if (price >= lastmax.price) {
      Vue.set(maxs, maxs.length - 1, { price, time })
    } else if (price <= lastmin.price) {
      Vue.set(mins, mins.length - 1, { price, time })
    }

    for (const period of state.periods) {
      if ((time - lastmax.time) > period) {
        const max = findMaxAfterTime(cache, time - period)
        // console.log('Max of last minute', format(time), format(max.time), max.price)
        lastmax = max
        maxs.push({ ...max, period })
      }

      if ((time - lastmin.time) > period) {
        const min = findMinAfterTime(cache, time - period)
        // console.log('Min of last minute', format(time), format(min.time), min.price)
        lastmin = min
        mins.push({ ...min, period })
      }
    }
    const value = numeral(price).value()
    const minutes = new Date(time).toLocaleTimeString('pt-PT')
    const max = numeral(lastmax.price).value()
    const min = numeral(lastmin.price).value()
    const delta = max - min
    const percent = max ? Math.round(10000 * delta / max) / 100 : undefined
    const lastprices = state.lastprices[stream]
    const chg = numeral(lastprices.price - price).value()
    state.lastprices[stream] = { price, value, chg, time, minutes, max, min, delta, percent, lastmax, lastmin }
  } else {
    Vue.set(state.cache, stream, [data])
    Vue.set(state.lastprices, stream, { price, time })
    Vue.set(state.max, stream, [{ price, time }])
    Vue.set(state.min, stream, [{ price, time }])
  }
}
