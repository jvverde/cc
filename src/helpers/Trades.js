import { listen, dismiss } from './stream'
import MA from './MovingAverage'

const AVERAGES = [30, 100, 300, 3e5]

export default class Trades {
  constructor (symbol, { maverages = AVERAGES } = {}) {
    const stream = symbol.toLowerCase() + '@aggTrade'
    this.streamid = listen((t) => { this.tradeEvent(t) }, stream) // we need the arrow function to preserve the this on tradeEvent
    this.ontrade = []
    this.mas = maverages.map(v => new MA(v))
  }

  tradeEvent (t) {
    const time = t.E
    const price = Number(t.p)
    const quantity = Number(t.q)
    const mas = this.mas.map(m => m.update(price, quantity))
    this.ontrade.map(e => e.handler).forEach(h => h({ ...t, time, price, quantity, mas }))
  }

  registerConsumer (handler) {
    const id = new Date().getTime() + '_' + Math.random()
    this.ontrade.push({ id, handler })
    return id
  }

  removeConsumer (id) {
    const index = this.ontrade.findIndex(e => e.id === id)
    if (index >= 0) this.ontrade.splice(index, 1)
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
    delete _trades[symbol]
  }
}

export function listSubcribed () {
  return Object.Keys(_trades).sort()
}

export function isSubcribed (symbol) {
  return symbol in _trades
}
