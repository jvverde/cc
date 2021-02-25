import { ws, stream } from 'src/config'
import WS from './websocks'

export function ticker (symbol, handler) {
  const onmessage = m => {
    const {
      c: price,
      E: time,
      s: symbol,
      P: percent,
      p: chg,
      h,
      l,
      o,
      c,
      v: vol,
      q: quote,
      Q: quantity
    } = JSON.parse(m.data)
    handler({ price, time, symbol, percent, chg, h, l, o, c, vol, quote, quantity })
  }
  return new WS(`${ws}/${symbol.toLowerCase()}@ticker`, { onmessage })
}

export function tickers (...symbols) {
  const handler = symbols.pop()
  const onmessage = m => {
    console.log(m, handler)
    // const {
    //   c: price,
    //   E: time,
    //   s: symbol,
    //   P: percent,
    //   p: chg,
    //   h,
    //   l,
    //   o,
    //   c,
    //   v: vol,
    //   q: quote,
    //   Q: quantity
    // } = JSON.parse(m.data)
    // handler({ price, time, symbol, percent, chg, h, l, o, c, vol, quote, quantity })
  }
  // const query = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/')
  return new WS(`${stream}`, { onmessage })
  // return new WS(`${stream}?streams=${query}`, { onmessage })
}
