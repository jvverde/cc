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

export class EMAt {
  constructor (n = 10) {
    this.a = 2 / (1 + n)
    this.b = 1 - this.a
    this.sec = 0 | Date.now() / 1000
    this.sum = 0
    this.cnt = 0
  }

  update (price) {
    const sec = 0 | Date.now() / 1000
    const { ema = price, a, b } = this
    if (sec === this.sec) {
      this.sum += price
      this.cnt++
    } else {
      const m = (this.sum + price) / (this.cnt + 1)
      this.ema = a * m + b * ema
      this.sum = this.cnt = 0
    }
    return this.ema
  }

  get value () { return this.ema }
}
