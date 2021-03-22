import Queue from './Queue'
import { updateMax, updateMin } from './MaxMin'
const onemonth = 30 * 24 * 3600

// export default class Ticker {
//   constructor (size = onemonth, since) {
//     this.hist = new TickersQueue(size, since)
//   }

//   get maxmin () { return { max: this.hist.max, min: this.hist.min  } }
// }

export default class TickersQueue extends Queue {
  constructor (size = onemonth, since = onemonth) {
    super(1 + size) // This trick is to allow check chg(size)
    this.max = { price: -Infinity, time: Infinity }
    this.min = { price: Infinity, time: Infinity }
    this.since = since
  }

  chg (nticks) {
    const { _size, _head, _buff } = this
    if (nticks >= _size) return undefined
    const lastIndex = (_head - 1 + _size) % _size
    const firstIndex = (_head - 1 - nticks + _size) % _size
    const last = _buff[lastIndex]
    const first = _buff[firstIndex]
    if (first === undefined || last === undefined) return {}
    const val = (last.c - first.c) / first.c
    const time = (last.E - first.E) / 1000
    const byhour = val * 3600 / time
    return {
      val,
      time,
      byhour
    }
  }

  push (ticker) {
    super.push(ticker)
    const { c: price, E: time } = ticker
    const { min, max } = this
    this.min = updateMin({ price, time, min }, this.since)
    this.max = updateMax({ price, time, max }, this.since)
  }

  get maxmin () { return { max: this.max, min: this.min } }
}
