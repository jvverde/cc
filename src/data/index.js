import Ticker from 'src/helpers/Ticker'

const localStorageName = 'ccmonStorage.json'

const store = {
  tickers: {},
  aTrades: {},
  size: 24 * 3600
}

export const intervales = [
  60,
  300,
  900,
  1800,
  3600
]

export function enqueueTickers (tickers) {
  for (const t of tickers) {
    t.c = Number(t.c)
    // console.log(t.s, Number(t.c), new Date(t.E).toLocaleTimeString())
    const symbol = t.s
    if (!store.tickers[symbol]) {
      store.tickers[symbol] = new Ticker(store.size)
    }
    const ticker = store.tickers[symbol]
    ticker.push(t)
    const changes = []
    for (const i of intervales) {
      changes.push(ticker.chg(i))
    }
    const { c: price, E: time } = t
    const { max, min } = ticker.maxmin

    if (ticker.callback) ticker.callback({ ...t, time, price, changes, min, max })
  }
}

export function listenTicker (symbol, cb) {
  if (!store.tickers[symbol]) {
    store.tickers[symbol] = new Ticker(store.size)
  }
  store.tickers[symbol].callback = cb
}

export function unlistenTicker (symbol, cb) {
  if (store.tickers[symbol] && store.tickers[symbol].callback) {
    store.tickers[symbol].callback = () => undefined
  }
}

if (localStorage) {
  try {
    const { tickers, size } = JSON.parse(localStorage.getItem(localStorageName)) || {}
    if (tickers instanceof Object) {
      store.size = size
      for (const symbol in tickers) {
        const t = (tickers[symbol].buff || []).filter(t => t instanceof Object && t.s === symbol)
        enqueueTickers(t)
      }
      // store.tickers = tickers
    }
  } catch (err) {
    console.warn(err)
  }
}

if (localStorage && window && window.addEventListener) {
  window.addEventListener('beforeunload', () => {
    for (const s in store.tickers) {
      store.tickers[s].callback = undefined
    }
    localStorage.setItem(localStorageName, JSON.stringify(store))
  })
}
