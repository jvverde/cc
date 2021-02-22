<template>
  <div>
    <svg :width="width" :height="height"
      viewPort="0 0 300 150" version="1.1"
      xmlns="http://www.w3.org/2000/svg">

      <line
        v-for="(coord, i) in coords"
        :key="i"
        :x1="coord.x" :y1="coord.y"
        :x2="coord.x" :y2="height"
        stroke="green"
        :stroke-width="bw"/>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'barline',
  data () {
    return {
    }
  },
  computed: {
    Ys () { return this.points.map(e => e.price) },
    Xs () { return this.points.map(e => e.time) },
    maxY () { return Math.max(...this.Ys) },
    minY () { return Math.min(...this.Ys) },
    maxX () { return Math.max(...this.Xs) },
    minX () { return Math.min(...this.Xs) },
    deltaY () { return (this.maxY - this.minY) || 1 },
    deltaX () { return (this.maxX - this.minX) || 1 },
    bw () {
      const n = this.coords.length || 1
      const m = 2 * this.margin // both side margins
      const w = this.width / n
      return w < m ? 1 : (w - m)
    },
    coords () {
      return this.points.map(p => {
        const m = this.margin // margin
        const w = this.width - m
        const h = this.height - m
        const x = m / 2 + w * (p.time - this.minX) / this.deltaX
        const y = m / 2 + h * (1 - (p.price - this.minY) / this.deltaY)
        return { x, y }
      })
    }
  },
  props: {
    points: {
      type: Array,
      required: true
    },
    width: {
      type: Number,
      default: 300
    },
    height: {
      type: Number,
      default: 150
    },
    margin: {
      type: Number,
      default: 10
    }
  },
  watch: {
    points: {
      immediate: true,
      handler: function (value) {
      }
    }
  },
  methods: {
    cords (i) {
    }
  }
}
</script>
