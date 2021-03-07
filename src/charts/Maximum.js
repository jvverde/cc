import { Overlay } from 'trading-vue-js'

// const colornames = ['marron', 'brown', 'SaddleBrown', 'Sienna',
//   'Chocolate', 'DarkGoldenrod', 'Peru', 'RosyBrown', 'Goldenrod',
//   'SandyBrown', 'Tan', 'Burlywood', 'Wheat', 'NavajoWhite',
//   'Bisque', 'BlanchedAlmond', 'Cornsilk']
// const colors = (i) => {
//   return colornames[i % colornames.length]
// }
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
      // console.log('len=', this.$props.data.length)
      const data = this.$props.data || []
      if (data.length < 1) return
      const point = data[data.length - 1]

      const time = point[0]
      const { max, min } = point[1]
      let lM = max, lm = min
      while (lM.next) lM = lM.next // find last max = current candle
      while (lm.next) lm = lm.next // find last min = current candle

      // ctx.lineWidth = 1
      // let m = max, last = time + 1
      // ctx.strokeStyle = 'cyan'
      // while (m.next) {
      //   const diff = (time - m.time) / (time - last)
      //   if (diff < 0.8) {
      //     this.line(ctx, m, lM)
      //     last = m.time
      //   } // else console.log(diff, m)
      //   m = m.next
      // }
      // m = min
      // last = time + 1
      // ctx.strokeStyle = 'purple'
      // while (m.next) {
      //   const diff = (time - m.time) / (time - last)
      //   if (diff < 0.6) {
      //     this.line(ctx, m, lm)
      //     last = m.time
      //   } // else console.log(diff, m)
      //   m = m.next
      // }

      const points = []
      let a = max, b = min
      while (a.next && b.next) {
        if (a.time < b.time) {
          points.push({ ...a, type: 'M' })
          while (a.next && a.time <= b.time) a = a.next
        } else {
          points.push({ ...b, type: 'm' })
          while (b.next && b.time <= a.time) b = b.next
        }
      }

      let len = points.length
      if (len && points[len - 1].type === 'M') {
        points.push(lm)
      } else {
        points.push(lM)
      }
      while (len--) {
        ctx.setLineDash([])
        ctx.strokeStyle = 'orange'
        this.line(ctx, points[len], points[len + 1])
        const second = points[len + 2]
        if (second && second.next) { // if second exists and it isn't the last candle (= current)
          const first = points[len]
          const x1 = first.time
          const y1 = first.price
          const x2 = second.time
          const y2 = second.price
          const d = (y2 - y1) / (x2 - x1)
          const y0 = y1 - d * x1
          const price = y0 + d * time
          if (first.type === 'm') ctx.strokeStyle = 'magenta'
          else ctx.strokeStyle = 'cyan'
          ctx.setLineDash([15, 3, 3, 3])
          this.line(ctx, points[len], { time, price })
        }
      }

      ctx.lineWidth = 1
      ctx.strokeStyle = 'orange'
      ctx.setLineDash([5, 15])
      const hi = this.$props.layout.$_hi
      const lo = this.$props.layout.$_lo
      const oneminuteago = time - 6e4
      this.line(ctx, { time: oneminuteago, price: hi }, { time: oneminuteago, price: lo })
    },
    use_for () { return ['MAXIMUM'] }
  }
}
