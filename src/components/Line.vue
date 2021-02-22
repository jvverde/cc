<template>
  <div>
    <svg :width="width" :height="height"
      viewPort="0 0 300 150" version="1.1"
      xmlns="http://www.w3.org/2000/svg">

      <line x1="10" y1="150"
        x2="10" y2="0"
        stroke="black"
        stroke-width="2"/>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'barline',
  data () {
    return {
      lineData: [],
      prev: null,
      pt: []
    }
  },
  computed: {
    Ys () { return this.points.map(e => e[1]) },
    Xs () { return this.points.map(e => e[0]) },
    maxY () { return Math.max(...this.Ys) },
    minY () { return Math.min(...this.Ys) },
    maxX () { return Math.max(...this.Xs) },
    minX () { return Math.min(...this.Xs) },
    deltaY () { return this.maxY - this.minY || 1 },
    deltaX () { return this.maxX - this.minX || 1 },
    coords () {
      return this.points.map(p => {
        const y = this.height * (1 - (p[1] - this.minY) / this.deltaY)
        const x = this.width * (1 - (p[0] - this.minX) / this.deltaX)
        return [x, y]
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
    }
    height: {
      type: Number,
      default: 150
    }
  },
  watch: {
    points: {
      immediate: true,
      handler: function (value) {
        console.log('xxxxxxxxxxxxxxxxxxxx')
        console.log('maxX', this.maxX)
        console.log('maxY', this.maxY)
      }
    }
  },
  methods: {
    cords (i) {
    }
  }
}
</script>
