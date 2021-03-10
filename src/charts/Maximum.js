import { Overlay } from 'trading-vue-js'
import { Line, zigzag } from 'src/helpers/Utils'

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
      const data = this.$props.data || []
      if (data.length < 1) return
      const last = data[data.length - 1]
      // console.log(last)
      const time = last[1]
      const { max, min } = last[2]

      const points = zigzag(max, min)
      let len = points.length
      // console.log(len, points)
      while (--len > 0) {
        const p0 = points[len - 1]
        const p1 = points[len]
        ctx.setLineDash([])
        if (p0.type === 'M') ctx.strokeStyle = 'sienna'
        else ctx.strokeStyle = 'chocolate'
        this.line(ctx, p0, p1)
        const p2 = points[len + 1]
        if (p2 && p2.next) { // if second exists and it isn't the last candle (= current)
          const price = Line(p0.time, p0.price, p2.time, p2.price)(time)
          const pt = { time, price }
          if (p0.type === 'm') ctx.strokeStyle = 'magenta'
          else ctx.strokeStyle = 'gold'
          ctx.setLineDash([5, 10])
          this.line(ctx, p0, pt)
        }
      }

      ctx.lineWidth = 1
      ctx.strokeStyle = 'orange'
      const hi = this.$props.layout.$_hi
      const lo = this.$props.layout.$_lo

      ctx.setLineDash([1, 5])
      const onesecondago = time - 1000
      this.line(ctx, { time: onesecondago, price: hi }, { time: onesecondago, price: lo })
      ctx.setLineDash([5, 15])
      const oneminuteago = time - 6e4
      this.line(ctx, { time: oneminuteago, price: hi }, { time: oneminuteago, price: lo })
      ctx.setLineDash([20, 30])
      const fiveminuteago = time - 3e5
      this.line(ctx, { time: fiveminuteago, price: hi }, { time: fiveminuteago, price: lo })
    },
    use_for () { return ['MAXIMUM'] }
  }
}
