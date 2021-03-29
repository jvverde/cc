export default class Trend {
  constructor () {
    this._cnt = 0
    this._value = 0
    this._first = 0
    this._start = this._end = 0
  }

  _up (v, time) {
    if (this._cnt > 0) {
      this._cnt++
    } else {
      this._cnt = 1
      this._first = v
      this._start = time
    }
  }

  _down (v, time) {
    if (this._cnt < 0) {
      this._cnt--
    } else {
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

  get ratio () {
    return this._end === this._start ? 0 : 1000 * this.magnitude / (this._end - this._start)
  }
}
