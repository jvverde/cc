export default class Histogram {
  constructor () {
    this.HUP = []
    this.HDO = []
    this.up = 1
    this.down = 0
    this.last = 0
  }

  incHUP (i) {
    this.HUP[i] = 1 + (this.HUP[i] || 0)
  }

  incHDO (i) {
    this.HDO[i] = 1 + (this.HDO[i] || 0)
  }

  cnt (v) {
    if (v > this.last) {
      if (this.down) this.incHDO(this.down)
      this.down = 0
      this.up++
    } else if (v < this.last) {
      if (this.up) this.incHUP(this.up)
      this.up = 0
      this.down++
    } else {
      if (this.down) this.HDO[this.down]++
      if (this.up) this.HUP[this.up]++
      this.up = this.down = 0
    }
    this.last = v
  }

  get ups () { return this.HUP.map((v, i) => v >= 0 ? { v, i } : undefined).filter(e => e) }
  get downs () { return this.HDO.map((v, i) => ({ v, i })).filter(e => e) }
}
