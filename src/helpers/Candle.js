export class Candle {
  open (o, v) {
    this.o = o
    this.h = o
    this.l = o
    this.c = undefined
    this.v = v
    this.current = o
  }

  add (price, volume) {
    if (this.l > price) this.l = price
    if (this.h < price) this.h = price
    this.current = price
    this.v += volume
  }

  close (p, v) {
    this.c = this.current
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
      const { o, h, l, c, v } = this
      const T = period // close time
      const t = this.lastperiod // open time
      this.onclose({ o, h, l, c, v, time, t, T })
      super.open(price, volume)
      this.lastperiod = period
    } else {
      super.add(price, volume)
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
