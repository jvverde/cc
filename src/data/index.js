const localStorageName = 'ccmonStorage'

const store = {
  coins: {},
  size: 3600
}

if (localStorage) {
  const { coins, size } = localStorage.getItem(localStorageName) || {}
  if (coins instanceof Object) {
    store.coins = coins
    store.size = size
  }
}

export const intervales = [
  60,
  300,
  900,
  1800,
  3600
]

export const slideWindow = [
  6e3, // 1 min
  3e5, // 5 min
  9e5, // 15min
  1.8e6, // 30min
  3.6e6 // 1hour
]

class Coin {
  constructor () {
    this.hist = new TickersQueue(store.size)
    this.max = { price: -Infinity, time: Infinity }
    this.min = { price: Infinity, time: Infinity }
    this.M = {}
    this.m = {}
    for (const s of slideWindow) {
      this.M[s] = { price: -Infinity, time: Infinity }
      this.m[s] = { price: Infinity, time: Infinity }
    }
  }
}

function updateMax ({ price, time, max }, delta = 6e4) {
  const current = { price, time }
  // First shift max until found the first one on 'time window' left side
  while (time - max.time > delta && max.next) {
    max = max.next
  }

  // Now check if current price is higher than max
  if (price >= max.price) {
    max = current // Yes, no next field (yet)
  } else {
    // If it isn't max, go through the successive maximum points until find one that is lower
    // and replace it by current point.
    // Or insert current at the end if all maximum are greater
    let point = max // start at present max
    while (point.next && price < point.next.price) {
      point = point.next // Continue if there is next point and price is lower
    }
    point.next = current // The maximum chain always ends on current value (Except if it is max value)
  }
  return max
}

function updateMin ({ price, time, min }, delta = 6e4) {
  const current = { price, time }
  while (time - min.time > delta && min.next) { // Slide min to first minimum on window delta time
    min = min.next
  }

  if (price <= min.price) {
    min = current
  } else {
    let point = min
    while (point.next && price > point.next.price) {
      point = point.next
    }
    point.next = current
  }
  return min
}

export function enqueue (tickers) {
  for (const ticker of tickers) {
    ticker.c = Number(ticker.c)
    // console.log(ticker.s, Number(ticker.c), new Date(ticker.E).toLocaleTimeString())
    const symbol = ticker.s
    if (!store.coins[symbol]) {
      store.coins[symbol] = new Coin()
    }
    const coin = store.coins[symbol]
    let { min, max, hist } = coin

    hist.push(ticker)
    const changes = []
    for (const i of intervales) {
      changes.push(hist.chg(i))
    }

    const { c: price, E: time } = ticker

    coin.min = min = updateMin({ price, time, min })
    coin.max = max = updateMax({ price, time, max })

    if (coin.callback) coin.callback({ ...ticker, time, price, changes, min, max })
  }
}

export function listen (symbol, cb) {
  if (!store.coins[symbol]) {
    store.coins[symbol] = new Coin()
  }
  store.coins[symbol].callback = cb
}

class Queue {
  constructor (size = 300) {
    this.head = 0
    this.tail = 0
    this.buff = new Array(size)
    this.size = size
  }

  push (v) {
    this.buff[this.head] = v
    this.head = (this.head + 1) % this.size
    return this.head
  }

  shift () {
    if (this.tail === this.head) {
      return undefined
    } else {
      const v = this.buff[this.tail]
      this.tail = (this.tail + 1) % this.size
      return v
    }
  }
}

class TickersQueue extends Queue {
  constructor (size) {
    super(1 + size) // This trick is to allow check chg(size)
    this.max = { price: -Infinity, time: Infinity }
    this.min = { price: Infinity, time: Infinity }
  }

  chg (nticks) {
    const { size, head, buff } = this
    if (nticks >= size) return undefined
    const lastIndex = (head - 1 + size) % size
    const firstIndex = (head - 1 - nticks + size) % size
    const last = buff[lastIndex]
    const first = buff[firstIndex]
    if (first === undefined || last === undefined) return {}
    const val = (last.c - first.c) / first.c
    const time = (last.E - first.E) / 1000
    const byhour = val * 3600 / time
    return {
      val,
      time,
      byhour
    }
  }

  push (ticker) {
    super.push(ticker)
    const { c: price, E: time } = ticker
    const { min, max } = this
    this.min = updateMin({ price, time, min }, 300 * 1000)
    this.max = updateMax({ price, time, max }, 300 * 1000)
  }
}

if (localStorage && window && window.addEventListener) {
  window.addEventListener('beforeunload', () => {
    localStorage.setItem(localStorageName, JSON.stringify(store))
  })
}
