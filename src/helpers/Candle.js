export class Candle {
  open (o, v) {
    this.o = o
    this.h = o
    this.l = o
    this.c = undefined
    this.v = v
    this.current = o
    this.sumprod = v * o
  }

  update (price, volume) {
    if (this.l > price) this.l = price
    if (this.h < price) this.h = price
    this.current = price
    this.v += volume
    this.sumprod += price * volume
  }

  close (p, v) {
    this.c = this.current
    this.m = this.sumprod / this.v
  }

  get val () {
    const { o, h, l, c, v } = this
    return { o, h, l, c, v }
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

  insert (time, price, volume) {
    const period = 0 | time / this.interval
    if (this.lastperiod === undefined) {
      this.lastperiod = period
      super.open(price, volume)
    } else if (period > this.lastperiod) {
      super.close()
      const { o, h, l, c, v, m } = this
      const T = (this.lastperiod + 1) * this.interval // close time
      const t = this.lastperiod * this.interval // open time
      this.onclose({ o, h, l, c, v, time, t, T, m })
      super.open(price, volume)
      this.lastperiod = period
    } else {
      super.update(price, volume)
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
