const store = {
  pairs: {},
  size: 3600
}

class Pair {
  constructor () {
    this.hist = new TickersQueue(store.size)
    this.max = { price: -Infinity, time: Infinity }
    this.min = { price: Infinity, time: Infinity }
    this.chg = Infinity
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
  while (time - min.time > delta && min.next) {
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
    if (!store.pairs[symbol]) {
      store.pairs[symbol] = new Pair()
    }
    const pair = store.pairs[symbol]
    let { min, max, hist } = pair

    hist.push(ticker)
    const chg1m = hist.chg(60)
    const chg5m = hist.chg(300)
    const chg15m = hist.chg(900)
    const chg30m = hist.chg(1800)
    const chg1h = hist.chg(3600)

    const { c: price, E: time } = ticker

    pair.min = min = updateMin({ price, time, min })
    pair.max = max = updateMax({ price, time, max })

    if (pair.callback) pair.callback({ ...ticker, time, price, chg1m, chg5m, chg15m, chg30m, chg1h, min, max })
  }
}

export function listen (symbol, cb) {
  if (!store.pairs[symbol]) {
    store.pairs[symbol] = new Pair()
  }
  store.pairs[symbol].callback = cb
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

  chg (nseconds) {
    const { size, head, buff } = this
    if (nseconds >= size) return undefined
    const lastIndex = (head - 1 + size) % size
    const firstIndex = (head - 1 - nseconds + size) % size
    const last = buff[lastIndex]
    const first = buff[firstIndex]
    if (first === undefined || last === undefined) return NaN
    return {
      val: (last.c - first.c) / first.c,
      time: Math.round(100 * (last.E - first.E) / 1000 / 100)
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
