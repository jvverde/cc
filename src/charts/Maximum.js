import { Overlay } from 'trading-vue-js'
import { Line } from 'src/helpers/Utils'

export default {
  name: 'Maximum',
  mixins: [Overlay],
  methods: {
    meta_info () {
      return {
        author: 'jvv',
        version: '0.0.1'
      }
    },
    legend (values) {
      return []
      // return [{
      //   value: new Date(values[0]).toLocaleTimeString(),
      //   color: 'blue'
      // }, {
      //   value: `max=${values[2].price}`,
      //   color: 'green'
      // }, {
      //   value: `min=${values[3].price}`,
      //   color: 'red'
      // }]
    },
    line (ctx, a, b) {
      const layout = this.$props.layout // Layout object (see API BOOK)
      const x1 = layout.t2screen(a.time)
      const y1 = layout.$2screen(a.price)
      const x2 = layout.t2screen(b.time)
      const y2 = layout.$2screen(b.price)
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.closePath()
      ctx.stroke()
    },
    draw (ctx) {
      // console.log(this.$props)
      const [time, , , zigzag] = (this.$props.data || [])[0] || []
      // console.log(time, max, min)
      if (!time) return

      let len = zigzag.length
      // console.log(len, zigzag)
      while (--len > 0) {
        const p0 = zigzag[len - 1]
        const p1 = zigzag[len]
        ctx.setLineDash([])
        if (p0.type === 'M') ctx.strokeStyle = 'sienna'
        else ctx.strokeStyle = 'chocolate'
        this.line(ctx, p0, p1)
        const p2 = zigzag[len + 1]
        if (p2 && p2.next) { // if second exists and it isn't the last candle (= current)
          const price = Line(p0.time, p0.price, p2.time, p2.price)(time)
          const pt = { time, price }
          if (p0.type === 'm') ctx.strokeStyle = 'magenta'
          else ctx.strokeStyle = 'gold'
          ctx.setLineDash([5, 10])
          this.line(ctx, p0, pt)
        }
      }
    },
    use_for () { return ['MAXIMUM'] }
  }
}
