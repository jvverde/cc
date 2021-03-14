export class Candle {
  open (o, q) {
    this.o = o
    this.h = o
    this.l = o
    this.c = undefined
    this.q = q
    this.current = o
    this.sumprod = q * o
  }

  update (price, quantity) {
    if (this.l > price) this.l = price
    if (this.h < price) this.h = price
    this.current = price
    this.q += quantity
    this.sumprod += price * quantity
  }

  close (p, q) {
    this.c = this.current
    this.m = this.sumprod / this.q
  }

  get val () {
    const { o, h, l, c, q } = this
    return { o, h, l, c, q }
  }
}

export class CandleOf extends Candle {
  constructor (interval = 1000, handler = () => null) {
    super()
    this.interval = interval
    this.onclose = handler
    this.lastperiod = undefined
    super.open()
  }

  insert (time, price, quantity, forward = {}) {
    const period = 0 | time / this.interval
    if (this.lastperiod === undefined) {
      this.lastperiod = period
      super.open(price, quantity)
    } else if (period > this.lastperiod) {
      super.close()
      const { o, h, l, c, q, m } = this
      const T = (this.lastperiod + 1) * this.interval // close time
      const t = this.lastperiod * this.interval // open time
      const v = this.sumprod
      this.onclose({ ...forward, o, h, l, c, q, v, time, t, T, m })
      super.open(price, quantity)
      this.lastperiod = period
    } else {
      super.update(price, quantity)
    }
  }
}

export class Candle1s extends CandleOf {
  constructor (handler) {
    super(1000, handler)
  }
}

export class Candle1m extends CandleOf {
  constructor (handler) {
    super(6e4, handler)
  }
}
