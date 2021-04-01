import { listen, dismiss } from './stream'
import { loadAggTradesLastMinutes } from './BinanceApi'

import { EMA } from './MovingAverage'

import { AVERAGES } from 'src/config'
// const AVERAGES = [30, 100, 300, 1e3, 1e4, 1e5, 1e6]
import { getNewId } from 'src/helpers/Utils'

export default class Trades {
  constructor (symbol, { handler = () => null, maverages = AVERAGES, minago = 60 } = {}) {
    const id = getNewId()
    this.ontrade = [{ id, handler }]
    // this.mas = maverages.map(v => new MA(v))
    this.emas = maverages.map(v => new EMA(v))
    this.streamid = this._init(symbol, minago)
  }

  _inserttrades (trades) { // insert a burst of trades
    for (const t of trades) {
      this.tradeEvent(t)
    }
  }

  async _init (symbol, minutes) {
    // First load some past trades
    await loadAggTradesLastMinutes(symbol, {
      minutes,
      handler: (trades) => this._inserttrades(trades) // process partial results in batch
    })
    // Now start receiving it in real time through the stream API
    const stream = symbol.toLowerCase() + '@aggTrade'
    return listen((t) => { this.tradeEvent(t) }, stream) // we need the arrow function to preserve the 'this' on tradeEvent
  }

  tradeEvent (t) {
    const time = t.T
    const price = Number(t.p)
    const quantity = Number(t.q)
    // const mas = this.mas.map(m => m.update(price, quantity))
    const emas = this.emas.map(m => m.update(price, quantity))
    this.ontrade.map(e => e.handler).forEach(h => h({ ...t, time, price, quantity, emas }))
  }

  registerConsumer (handler) {
    const id = new Date().getTime() + '_' + Math.random()
    this.ontrade.push({ id, handler })
    return id
  }

  removeConsumer (id) {
    const index = this.ontrade.findIndex(e => e.id === id)
    if (index >= 0) this.ontrade.splice(index, 1)
    if (this.ontrade.length === 0) this.dismiss()
  }

  async dismiss () {
    const id = await this.streamid
    console.log('Dismiss stream id', id)
    dismiss(id)
  }
}

const _trades = {}

export function subcribeTrades (symbol, options = {}) {
  if (!_trades[symbol]) {
    _trades[symbol] = new Trades(symbol, options)
  }
  return _trades[symbol]
}

export function removeTrades (symbol) {
  if (_trades[symbol]) {
    _trades[symbol].dismiss()
    delete _trades[symbol]
  }
}

export function listSubcribed () {
  return Object.Keys(_trades).sort()
}

export function isSubcribed (symbol) {
  return symbol in _trades
}
