import Queue from './Queue'

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

export default class Trend {
  constructor ({ maxtrendsize = 12 } = {}) {
    this._queue = new Queue(maxtrendsize)
  }

  pusha (v) {
    this._value = v
    this._trend = trend(...this._queue, v)
    return this._queue.pusha(v)
  }

  get direction () { return this._trend }

  get magnitude () {
    const queue = [...this._queue]
    const index = queue.length - 1 - Math.abs(this._trend)
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
          const value = values[index++]
          return { value }
        } else {
          return { done }
        }
      }
    }
  }
}
