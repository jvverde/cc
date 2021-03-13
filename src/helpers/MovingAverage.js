import Queue from './Queue'

export default class MA {
  constructor (size) {
    this.queue = new Queue(size)
    this.sumprod = 0
    this.quantity = 0
  }

  update (price, quote = 1) {
    this.sumprod += price * quote
    this.quantity += quote
    const discard = this.queue.rotate({ price, quote })
    if (discard) {
      this.sumprod -= discard.price * discard.quote
      this.quantity -= discard.quote
    }
    return this.value
  }

  get value () { return this.sumprod / this.quantity }
}
