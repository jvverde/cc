import { EMA } from './MovingAverage'
import Queue from './Queue'
import { AVERAGES } from 'src/config'

const trend = (...a) => {
  a = a.flat(Infinity)
  let v = a.pop()
  let i = a.length - 1
  if (i < 0) return 0
  if (a[i] < v) {
    do {
      v = a[i--]
    } while (i >= 0 && a[i] < v)
    return a.length - 1 - i
  } else if (a[i] > v) {
    do {
      v = a[i--]
    } while (i >= 0 && a[i] > v)
    return -(a.length - 1 - i)
  } else if (a[i] === v) {
    return 0
  }
  return undefined
}

export default class Value {
  constructor ({ maverages = AVERAGES, maxtrendsize = 10 } = {}) {
    this._queue = new Queue(maxtrendsize)
    this._emas = this.maverages.map(e => new EMA(e))
  }

  set value (v) {
    this._value = v
    this._emas.forEach(e => e.update(v))
    this._queue.pusha(v)
    this._trend = trend(...queue, v)
  }

  get emas () { return this._emas.map(e => e.value) }

  get value () { return this._value }

  get trend () { return this._trend }

  get magnitude () {
    const queue = [...this._queue]
    const index = queue.length - Math.abs(this._trend)
    const v = queue[index] ? queue[index] : this._value
    return (this._value - v) / v
  }

  [Symbol.iterator] () {
    const values = [...this._queue]
    let index = 0
    const done = true
    return {
      next: () => {
        if (index < values.length) {
          const value = values[index]
          return { value }
        } else {
          return { done }
        }
      }
    }
  }
}
