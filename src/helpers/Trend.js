import { EMA } from './MovingAverage'

export default class Trend {
  constructor (maverages = []) {
    this._cnt = 0
    this._value = 0
    this._first = 0
    this._start = this._end = 0
    this._emas = maverages.length !== 0
    this._emaOfDire = maverages.map(e => new EMA(e))
    this._emaOfMagn = maverages.map(e => new EMA(e))
    this._emaOfRate = maverages.map(e => new EMA(e))
    this._emaOfDura = maverages.map(e => new EMA(e))
  }

  _updateEmas () {
    this._emaOfDire.map(e => e.update(this.direction))
    this._emaOfMagn.map(e => e.update(this.magnitude))
    this._emaOfRate.map(e => e.update(this.rate))
    this._emaOfDura.map(e => e.update(this.duration))
  }

  _up (v, time) {
    if (this._cnt > 0) {
      this._cnt++
    } else {
      if (this._emas && this._cnt !== 0) this._updateEmas()
      this._cnt = 1
      this._first = v
      this._start = time
    }
  }

  _down (v, time) {
    if (this._cnt < 0) {
      this._cnt--
    } else {
      if (this._emas && this._cnt !== 0) this._updateEmas()
      this._cnt = -1
      this._first = v
      this._start = time
    }
  }

  pusha (v, time = Date.now()) {
    if (v === this._value) {
      return this
    } else if (v > this._value) {
      this._up(v, time)
    } else if (v < this._value) {
      this._down(v, time)
    }
    this._value = v
    this._end = time
    return this
  }

  get direction () { return this._cnt }

  get magnitude () {
    return (this._value - this._first) / Math.abs(this._first)
  }

  get rate () {
    return this._end === this._start ? 0 : this.magnitude / this.duration * 1000 // per second
  }

  get duration () { return this._end - this._start }

  get emas () {
    return this._emas ? {
      direction: this._emaOfDire.value,
      magnitude: this._emaOfMagn.value,
      rate: this._emaOfRate.value,
      duration: this._emaOfDure.value
    } : undefined
  }
}
