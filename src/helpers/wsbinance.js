import { ws as api } from 'src/config'
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
  return new WS(`${api}/${symbol.toLowerCase()}@ticker`, { onmessage })
}
