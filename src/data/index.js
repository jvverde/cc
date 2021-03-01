const store = {
  pairs: {},
  size: 300
}

class Pair {
  constructor () {
    this.hist = new Array(store.size)
    this.tail = null
    this.head = 0
    this.max = { price: -Infinity, time: Infinity }
    this.min = { price: Infinity, time: Infinity }
  }
}

function findMax ({ price, time, max }, delta = 3e5) {
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

function findMin ({ price, time, min }, delta = 3e5) {
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
    // console.log(ticker.s, Number(ticker.c), new Date(ticker.E).toLocaleTimeString())
    const symbol = ticker.s
    if (!store.pairs[symbol]) {
      store.pairs[symbol] = new Pair()
    }
    const pair = store.pairs[symbol]
    pair.hist[pair.head] = ticker
    pair.head = (1 + pair.head) % store.size
    let { min, max } = pair
    const price = Number(ticker.c)
    const time = Number(ticker.E)
    pair.min = min = findMin({ price, time, min })
    pair.max = max = findMax({ price, time, max })

    if (pair.callback) pair.callback({ ...ticker, time, price, min, max })
  }
}

export function listen (symbol, cb) {
  if (!store.pairs[symbol]) {
    store.pairs[symbol] = new Pair()
  }
  store.pairs[symbol].callback = cb
}
