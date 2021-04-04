import { listen, dismiss } from 'src/api/stream'
import { loadKlines } from './rest/Klines'
import { EMA } from 'src/helpers/MovingAverage'
import { AVERAGES } from 'src/config'
import { getNewId } from 'src/helpers/Utils'

export default class Kline {
  constructor (symbol, { handler = () => null, interval = '1m', maverages = AVERAGES, minago } = {}) {
    const id = getNewId()
    this.ontrade = [{ id, handler }]
    this.emas = maverages.map(v => new EMA(v))
    this.streamid = this._init(symbol, minago, interval)
  }

  _insertPreviousOnes (trades) { // insert a burst of trades
    for (const t of trades) {
      this.klineEvent(t)
    }
  }

  async _init (symbol, minutes, interval) {
    // First load past klines since 'minutes' ago
    await loadKlines(symbol, {
      minutes,
      handler: (k) => this._insertPreviousOnes(k) // process partial results in batch
    })
    // Now start receiving it in real time through the stream API
    const stream = symbol.toLowerCase() + `@kline_${interval}`
    return listen((t) => { this.klineEvent(t) }, stream) // we need the arrow function to preserve the 'this' on klineEvent
  }

  klineEvent (t) {
    if (t.k) {
      console.log('Is update', t.k.t, t.k.T, t.k.x, t.k.o, t.k.h, t.k.l, t.k.c)
    } else {
      console.log('Closed', t.t, t.T)
    }
    // const time = t.T
    // const price = Number(t.p)
    // const quantity = Number(t.q)
    // const emas = this.emas.map(m => m.update(price, quantity))
    // this.ontrade.map(e => e.handler).forEach(h => h({ ...t, time, price, quantity, emas }))
  }

  async dismiss () {
    const id = await this.streamid
    console.log('Dismiss stream id', id)
    dismiss(id)
  }
}
