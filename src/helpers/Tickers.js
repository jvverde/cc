import { listen, dismiss } from 'src/api/stream'
import { EMA } from './MovingAverage'
import { AVERAGES } from 'src/config'
import { getNewId } from 'src/helpers/Utils'

export default class Tickers {
  constructor ({ maverages = AVERAGES, handler, match } = {}) {
    this.onticker = handler ? [{ handler }] : []
    this.maverages = maverages
    this.match = match
    this.emas = {}
    this.streamid = listen((t) => { this.tickerEvent(t) }, '!miniTicker@arr')
  }

  tickerEvent (tickers) {
    tickers.forEach(t => {
      if (this.match && t.s.match(this.match) === null) return
      const time = t.E
      const price = Number(t.c)
      const quantity = Number(t.v) // https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#terminology
      const volume = Number(t.q) // And https://github.com/binance/binance-spot-api-docs/blob/master/web-socket-streams.md#all-market-mini-tickers-stream
      const symbol = t.s
      this.emas[symbol] = this.emas[symbol] || this.maverages.map(v => new EMA(v))
      // const mas = this.mas.map(m => m.update(price, quantity))
      const emas = this.emas[symbol].map(m => m.update(price))
      this.onticker.map(e => e.handler).forEach(h => h({ ...t, time, price, quantity, volume, symbol, emas }))
    })
  }

  registerConsumer (handler) {
    const id = getNewId()
    this.onticker.push({ id, handler })
    return id
  }

  removeConsumer (id) {
    const index = this.onticker.findIndex(e => e.id === id)
    if (index >= 0) this.onticker.splice(index, 1)
  }

  async dismiss () {
    const id = await this.streamid
    console.log('Dismiss stream id', id)
    dismiss(id)
  }
}

let _allTickers
const _handlerOf = {}

const dispatcher = tickers => {
  for (const t of tickers) {
    if (_handlerOf[t.s]) _handlerOf[t.s].forEach(e => e.handler(t))
  }
}

const setHandler = (symbol, handler) => {
  const id = getNewId()
  _allTickers = _allTickers || new Tickers({ handler: dispatcher })
  _handlerOf[symbol] = _handlerOf[symbol] || []
  _handlerOf[symbol].push({ id, handler })
  return id
}

export function subcribeTicker (symbol, handler) {
  return setHandler(symbol, handler)
}

export function unsubcribeTicker (symbol, id) {
  const i = _handlerOf[symbol].findIndex(e => e.id === id)
  _handlerOf[symbol].splice(i, 1)
}
