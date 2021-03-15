import { listen, dismiss } from './stream'
import { updateMax, updateMin } from './MaxMin'
import { CandleOf } from './Candle'
import { zigzag } from './Utils'
import MA from './MovingAverage'

const AVERAGES = [30, 100, 300, 3e5]

const ONEMONTH = 30 * 24 * 3600e3

class UpDownHist {
  constructor () {
    this.HUP = []
    this.HDO = []
    this.up = 1
    this.down = 0
    this.last = 0
  }

  incHUP (i) {
    this.HUP[i] = 1 + (this.HUP[i] || 0)
  }

  incHDO (i) {
    this.HDO[i] = 1 + (this.HDO[i] || 0)
  }

  cnt (v) {
    if (v > this.last) {
      if (this.down) this.incHDO(this.down)
      this.down = 0
      this.up++
    } else if (v < this.last) {
      if (this.up) this.incHUP(this.up)
      this.up = 0
      this.down++
    } else {
      if (this.down) this.HDO[this.down]++
      if (this.up) this.HUP[this.up]++
      this.up = this.down = 0
    }
    this.last = v
  }

  get ups () { return this.HUP.map((v, i) => v >= 0 ? { v, i } : undefined).filter(e => e) }
  get downs () { return this.HDO.map((v, i) => ({ v, i })).filter(e => e) }
}

export default class CoinTrade {
  constructor (symbol, { delta = 1000, maverages = AVERAGES, since = ONEMONTH } = {}) {
    const stream = symbol.toLowerCase() + '@aggTrade'
    this.streamid = listen((t) => { this.tradeEvent(t) }, stream) // we need the arrow function to preserve the this on tradeEvent
    this.ontrade = []
    this.oncandle = []
    this.zigzag = []
    this.since = since
    this.candle = new CandleOf(delta, (c) => this.candleEvent(c)) // we need the arrow function for the same reason as above
    this.mas = maverages.map(v => new MA(v))
    this.max = { time: -Infinity, price: -Infinity }
    this.min = { time: -Infinity, price: Infinity }
    this.histogram = new UpDownHist()
  }

  tradeEvent (t) {
    const time = t.E
    const price = Number(t.p)
    const quote = Number(t.q)
    const mas = this.mas.map(m => m.update(price, quote))
    this.candle.insert(time, price, quote)
    this.ontrade.map(e => e.handler).forEach(h => h({ ...t, price, quote, mas }))
  }

  candleEvent (c) {
    const time = (c.t + c.T) / 2
    let [max, min] = [this.max, this.min]
    this.max = max = updateMax({ time, price: c.h, max }, this.since)
    this.min = min = updateMin({ time, price: c.l, min }, this.since)
    this.zigzag = zigzag(max, min)
    const mas = this.mas
    this.histogram.cnt(c.m)
    this.oncandle.map(e => e.handler).forEach(h => h({ ...c, time, mas, max, min, zigzag: this.zigzag, histogram: this.histogram }))
  }

  registerTradeConsumer (handler) {
    const id = new Date().getTime() + '_' + Math.random()
    this.ontrade.push({ id, handler })
    return id
  }

  removeTradeConsumer (id) {
    const index = this.ontrade.findIndex(e => e.id === id)
    if (index >= 0) this.ontrade.splice(index, 1)
  }

  registerCandleConsumer (handler) {
    const id = new Date().getTime() + '_' + Math.random()
    this.oncandle.push({ id, handler })
    return id
  }

  removeCandleConsumer (id) {
    const index = this.oncandle.findIndex(e => e.id === id)
    if (index >= 0) this.oncandle.splice(index, 1)
  }

  async dismiss () {
    const id = await this.streamid
    console.log('Dismiss stream id', id)
    this.oncandle = this.ontrade = [() => console.warn('void')] // Just in case
    await dismiss(id)
  }
}

const cointrades = {}

export function subcribeTrades (symbol, options = {}) {
  if (!cointrades[symbol]) {
    cointrades[symbol] = new CoinTrade(symbol, options)
  }
  return cointrades[symbol]
}

export function removeTrades (symbol) {
  if (cointrades[symbol]) {
    delete cointrades[symbol]
  }
}
