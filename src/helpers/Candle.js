export class Candle {
  open () {
    this.o = undefined
    this.h = -Infinity
    this.l = Infinity
    this.c = undefined
    this.v = 0
  }

  add (price, volume) {
    if (this.l > price) this.l = price
    if (this.h < price) this.h = price
    if (this.o === undefined) this.o = price
    this.v += volume
  }

  close (p, v) {
    this.add(p, v)
    this.c = p
  }

  get val () {
    const { o, h, l, c, v } = this
    return { o, h, l, c, v }
  }
}

export class CandleOf extends Candle {
  constructor (delta = 1000, handler = () => null) {
    super()
    this.delta = delta
    this.onclose = handler
    this.lastperiod = undefined
    super.open()
  }

  insert (time, price, volume) {
    const period = 0 | time / this.delta
    if (this.lastperiod === undefined) {
      this.lastperiod = period
    }
    if (period > this.lastperiod) {
      super.close(price, volume)
      const { o, h, l, c, v } = this
      this.onclose({ o, h, l, c, v, time })
      super.open()
      this.lastperiod = period
    } else {
      super.add(price, volume)
    }
  }
}
