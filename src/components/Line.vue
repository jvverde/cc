<template>
  <div class="relative-position">
    <svg :width="width" :height="height"
      viewPort="0 0 100% 100%" version="1.1"
      xmlns="http://www.w3.org/2000/svg">

      <line
        v-for="(coord, i) in coords"
        :key="i"
        :x1="coord.x" :y1="coord.y"
        :x2="coord.x" :y2="height"
        :stroke="coord.color"
        :stroke-width="bw"/>
    </svg>
    <div class="absolute-top-left q-my-sm q-mx-xs column">
      <q-badge v-if="length > 0" color="transparent" text-color="blue">Max: {{maxY}}</q-badge>
      <q-badge color="transparent" text-color="blue">Up: {{cntup}}</q-badge>
    </div>
    <div class="absolute-bottom-left q-my-sm q-mx-xs column">
      <q-badge v-if="length > 0" color="transparent" text-color="yellow">Min: {{minY}}</q-badge>
      <q-badge color="transparent" text-color="yellow">Down: {{cntdown}}</q-badge>
    </div>
  </div>
</template>

<script>
const cntup = (accumulator, p) => p.color === 'green' ? accumulator + 1 : accumulator
const cntdown = (accumulator, p) => p.color === 'red' ? accumulator + 1 : accumulator
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
    length () { return this.points.length },
    coords () {
      return this.points.map(p => {
        const m = this.margin // margin
        const w = this.width - m
        const h = this.height - m
        const x = m / 2 + w * (p.time - this.minX) / this.deltaX
        const y = m / 2 + h * (1 - (p.price - this.minY) / this.deltaY)
        return { x, y, color: p.color }
      })
    },
    cntup () {
      return this.points.reduce(cntup, 0)
    },
    cntdown () {
      return this.points.reduce(cntdown, 0)
    }
  },
  props: {
    points: {
      type: Array,
      required: true
    },
    width: {
      type: Number,
      default: 302
    },
    height: {
      type: Number,
      default: 152
    },
    margin: {
      type: Number,
      default: 1
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
