import { subcribeTrades } from 'src/helpers/Trades'
import { updateMax, updateMin } from './MaxMin'
import { zigzag } from './Utils'
import Histogram from './Histogram'
import Queue from './Queue'
import { getNewId } from 'src/helpers/Utils'

export class Candle {
  open (o = 0, q = 0) {
    this.o = o
    this.h = o
    this.l = o
    this.c = undefined
    this.q = q
    this.current = o
    this.sumprod = q * o
  }

  update (price, quantity) {
    if (this.l > price) this.l = price
    if (this.h < price) this.h = price
    this.current = price
    this.q += quantity
    this.sumprod += price * quantity
  }

  close (p, q) {
    this.c = this.current
    this.m = this.q ? this.sumprod / this.q : 0
  }

  get val () {
    const { o, h, l, c, q } = this
    return { o, h, l, c, q }
  }
}

export class CandleEvery extends Candle {
  constructor (interval = 1000, handler = () => null) {
    super()
    this.interval = interval
    this.onclose = handler
    this.lastperiod = undefined
    super.open()
  }

  insert (sample) {
    const { time, price, quantity } = sample
    const period = 0 | time / this.interval
    if (this.lastperiod === undefined) {
      this.lastperiod = period
      super.open(price, quantity)
    } else if (period > this.lastperiod) {
      super.close()
      const { o, h, l, c, q, m } = this
      const T = (this.lastperiod + 1) * this.interval // close time
      const t = this.lastperiod * this.interval // open time
      const v = this.sumprod
      this.onclose({ ...sample, o, h, l, c, q, m, v, t, T })
      super.open(price, quantity)
      this.lastperiod = period
    } else {
      super.update(price, quantity)
    }
  }
}

export class Candle1s extends CandleEvery {
  constructor (handler) {
    super(1000, handler)
  }
}

export class Candle1m extends CandleEvery {
  constructor (handler) {
    super(6e4, handler)
  }
}

const ONEMONTH = 30 * 24 * 3600e3

export class CandleOfTrades extends CandleEvery {
  constructor (symbol, handler = () => null, { interval = 1000, since = ONEMONTH, maverages, minago } = {}) {
    super(interval)
    super.onclose = this.candleEvent
    const id = getNewId()
    this.oncandle = [{ id, handler }]
    this.zigzag = []
    this.since = since
    this.max = { time: -Infinity, price: -Infinity }
    this.min = { time: -Infinity, price: Infinity }
    this.histogram = new Histogram()
    this.since = since
    this.producer = subcribeTrades(symbol, { maverages, minago })
    this.consumerId = this.producer.registerConsumer((sample) => this.insert(sample))
  }

  candleEvent (c) {
    const time = (c.t + c.T) / 2
    let [max, min] = [this.max, this.min]
    this.max = max = updateMax({ time, price: c.h, max }, this.since)
    this.min = min = updateMin({ time, price: c.l, min }, this.since)
    this.zigzag = zigzag(max, min)
    this.histogram.cnt(c.m)
    this.oncandle.forEach(e => e.handler({ ...c, time, max, min, zigzag: this.zigzag, histogram: this.histogram }))
  }

  addHandler (handler) {
    const id = getNewId()
    this.oncandle.push({ id, handler })
  }

  delHandler (id) {
    const i = this.oncandle.findIndex(e => e.id === id)
    this.oncandle.splice(i, 1)
  }

  dismiss () {
    this.producer.removeConsumer(this.consumerId)
  }
}

const _candles = {}

const _queue = {}

export function subcribeEnqueueCandles (symbol, options = {}) {
  if (!_queue[symbol]) {
    _queue[symbol] = new Queue(options.size || 24 * 3600)
  }

  const queue = _queue[symbol]

  if (!_candles[symbol]) {
    const handler = c => queue.push(c)
    _candles[symbol] = new CandleOfTrades(symbol, handler, options)
  }

  const candle = _candles[symbol]

  return { queue, candle }
}

export function unsubcribeEnqueueCandles (symbol, options = {}) {
  _candles[symbol].dismiss()
  delete _candles[symbol]
  delete _queue[symbol]
}
