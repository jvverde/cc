export default class Trend {
  constructor () {
    this._cnt = 0
    this._value = 0
    this._first = 0
  }

  _up (v) {
    if (this._cnt > 0) {
      this._cnt++
    } else {
      this._cnt = 1
      this._first = v
    }
  }

  _down (v) {
    if (this._cnt < 0) {
      this._cnt--
    } else {
      this._cnt = -1
      this._first = v
    }
  }

  pusha (v) {
    if (v === this._value) {
      return this._cnt
    } else if (v > this._value) {
      this._up(v)
    } else if (v < this._value) {
      this._down(v)
    }
    this._value = v
    return this._cnt
  }

  get direction () { return this._cnt }

  get magnitude () {
    return (this._value - this._first) / this._first
  }
}
