import Queue from './Queue'
import { updateMax, updateMin } from './MaxMin'
const onemonth = 30 * 24 * 3600

export default class CandleQueue extends Queue {
  constructor (size = onemonth, since = onemonth) {
    super(1 + size) // This trick is to allow check chg(size)
    this.max = { price: -Infinity, time: Infinity }
    this.min = { price: Infinity, time: Infinity }
    this.maxc = { price: -Infinity, time: Infinity }
    this.minc = { price: Infinity, time: Infinity }
    this.since = since
  }

  push (candle) {
    super.push(candle)
    const { c, h, l, time } = candle
    const { min, max, minc, maxc } = this
    this.min = updateMin({ l, time, min }, this.since)
    this.max = updateMax({ h, time, max }, this.since)
    this.minc = updateMin({ c, time, minc }, this.since)
    this.maxc = updateMax({ c, time, maxc }, this.since)
  }

  get maxmin () { return { max: this.max, min: this.min } }
}
