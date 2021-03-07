import { Overlay } from 'trading-vue-js'

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
      return [{
        value: new Date(values[0]).toLocaleTimeString(),
        color: 'blue'
      }, {
        value: `max=${values[2].price}`,
        color: 'green'
      }, {
        value: `min=${values[3].price}`,
        color: 'red'
      }]
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
      const data = this.$props.data || []
      const point = data[data.length - 1]
      // for (const point of this.$props.data) {
      if (point) {
        const time = Date.now() // point[1]
        const max = point[2]
        const min = point[3]
        ctx.lineWidth = 1.5
        ctx.strokeStyle = 'blue'
        this.line(ctx, min, max)
        ctx.lineWidth = 1
        ctx.strokeStyle = 'cyan'
        ctx.setLineDash([5, 3])
        let m = max
        while (m.next) {
          this.line(ctx, m, m.next)
          m = m.next
        }
        ctx.setLineDash([])
        ctx.strokeStyle = 'SeaGreen'
        this.line(ctx, max, m)
        ctx.strokeStyle = 'orange'
        m = min
        ctx.setLineDash([3, 5])
        while (m.next) {
          this.line(ctx, m, m.next)
          m = m.next
        }
        ctx.setLineDash([])
        ctx.strokeStyle = 'Salmon'
        this.line(ctx, min, m)
        ctx.lineWidth = 1
        ctx.strokeStyle = 'orange'
        ctx.setLineDash([5, 15])
        const hi = this.$props.layout.$_hi
        const lo = this.$props.layout.$_lo
        const oneminuteago = time - 6e4
        this.line(ctx, { time: oneminuteago, price: hi }, { time: oneminuteago, price: lo })
      }
    },
    use_for () { return ['MAXIMUM'] }
  }
}
