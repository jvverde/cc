import { listen, dismiss } from 'src/api/stream'
import { loadKlines } from './rest/Klines'
import { EMA } from 'src/helpers/MovingAverage'
import { AVERAGES } from 'src/config'
import { getNewId, zigzag as zz } from 'src/helpers/Utils'
import { updateMax, updateMin } from 'src/helpers/MaxMin'

export default class Kline {
  constructor (symbol, { handler = () => null, onupdate = () => null, interval = '1m', maverages = AVERAGES, minago, since = -Infinity } = {}) {
    const id = getNewId()
    this.onclose = [{ id, handler }]
    this.onupdate = [{ id, handler: onupdate }]
    this.emas = maverages.map(v => new EMA(v))
    this.streamid = this._init(symbol, minago, interval)
    this.zigzag = []
    this.since = since
    this.max = { time: -Infinity, price: -Infinity }
    this.min = { time: -Infinity, price: Infinity }
  }

  _insertPreviousOnes (klines) { // insert a burst of trades
    for (const k of klines) {
      this.klineEvent(k)
    }
  }

  async _init (symbol, minutes, interval) {
    // First load past klines since 'minutes' ago
    await loadKlines(symbol, {
      interval,
      minutes,
      handler: (k) => this._insertPreviousOnes(k) // process partial results in batch
    })
    // Now start receiving it in real time through the stream API
    const stream = symbol.toLowerCase() + `@kline_${interval}`
    return listen((k) => { this.klineEvent(k) }, stream) // we need the arrow function to preserve the 'this' on klineEvent
  }

  close (k) {
    const emas = this.emas.map(m => m.update(k.c))
    const time = k.T
    let { max, min, zigzag } = this
    this.max = max = updateMax({ time, price: k.h, max }, this.since)
    this.min = min = updateMin({ time, price: k.l, min }, this.since)
    this.zigzag = zigzag = zz(max, min)
    this.onclose.map(e => e.handler).forEach(h => h({ ...k, time, emas, max, min, zigzag }))
  }

  update (k) {
    this.onupdate.map(e => e.handler).forEach(h => h(k))
  }

  klineEvent (e) {
    if (e.k) {
      const k = {
        s: e.s,
        t: e.k.t,
        T: e.k.T,
        o: +e.k.o,
        h: +e.k.h,
        l: +e.k.l,
        c: +e.k.c,
        v: +e.k.v,
        q: +e.k.q
      }
      if (e.k.x) {
        this.close(k)
      } else {
        this.update(k)
      }
    } else {
      this.close(e)
    }
  }

  async dismiss () {
    const id = await this.streamid
    console.log('Dismiss stream id', id)
    dismiss(id)
  }
}
