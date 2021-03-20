import Queue from './Queue'

export class MA {
  constructor (size) {
    this.queue = new Queue(size)
    this.sumprod = 0
    this.quantity = 0
  }

  update (price, quote = 1) {
    this.sumprod += price * quote
    this.quantity += quote
    const discard = this.queue.pusha({ price, quote })
    if (discard) {
      this.sumprod -= discard.price * discard.quote
      this.quantity -= discard.quote
    }
    return this.value
  }

  get value () { return this.sumprod / this.quantity }
}

export class EMA {
  constructor (n = 10) {
    this.a = 2 / (1 + n)
    this.b = 1 - this.a
  }

  update (price) {
    const { ema = price, a, b } = this
    this.ema = a * price + b * ema
    return this.ema
  }

  get value () { return this.ema }
}
