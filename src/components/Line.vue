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
      <line v-if="indexOfMinY >= 0 && coords[indexOfMinY]"
        :x1="coords[indexOfMinY].x" :y1="coords[indexOfMinY].y"
        :x2="coords[indexOfMaxY].x" :y2="coords[indexOfMaxY].y"
        stroke="yellow"
        stroke-width="4"/>
      <line v-if="indexOfMinY >= 0 && coords[indexOfMinY]"
        :x1="coords[indexOfMinY].x" :y1="coords[indexOfMinY].y"
        :x2="coords[lastindex].x" :y2="coords[lastindex].y"
        stroke="cyan"
        stroke-width="4"/>
      <line v-if="indexOfMaxY >= 0 && coords[indexOfMaxY]"
        :x1="coords[indexOfMaxY].x" :y1="coords[indexOfMaxY].y"
        :x2="coords[lastindex].x" :y2="coords[lastindex].y"
        stroke="orange"
        stroke-width="4"/>
    </svg>
    <div v-if="length > 0" class="absolute-top-left q-my-sm q-mx-xs column semi">
      <q-badge color="transparent" text-color="yellow">Max: {{maxY}} ({{indexOfMaxY}})</q-badge>
      <q-badge color="transparent" text-color="yellow">Max var: {{deltaYr}} ({{percent}}%)</q-badge>
      <q-badge color="transparent" text-color="yellow">Up: {{cntup}}</q-badge>
      <q-badge color="transparent" text-color="yellow" v-if="A >= -Infinity">A: {{Ar}}</q-badge>
      <q-badge color="transparent" text-color="yellow" v-if="B >= -Infinity">B: {{Br}}</q-badge>
      <q-badge color="transparent" text-color="yellow" v-if="C >= -Infinity">C: {{Cr}}</q-badge>
      <q-badge color="transparent" text-color="yellow">Alpha: {{alpha}}</q-badge>
      <q-badge color="transparent" text-color="yellow">Beta: {{beta}}</q-badge>
      <q-badge color="transparent" text-color="yellow">Gama: {{gama}}</q-badge>
    </div>
    <div class="absolute-bottom-left q-my-sm q-mx-xs column semi">
      <q-badge v-if="length > 0" color="transparent" text-color="yellow">Min: {{minY}} ({{indexOfMinY}})</q-badge>
      <q-badge color="transparent" text-color="yellow">Down: {{cntdown}}</q-badge>
    </div>
  </div>
</template>

<script>

const cntup = (accumulator, p) => p.color === 'green' ? accumulator + 1 : accumulator
const cntdown = (accumulator, p) => p.color === 'red' ? accumulator + 1 : accumulator
const indexOfMax = (a) => { return a.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0) }
const indexOfMin = (a) => { return a.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0) }
const xyz = (a, b, c) => {
  if (c === 0) return NaN
  const r = (a * a - b * b) / c
  const x = (c - r) / 2
  const z = (c + r) / 2
  const y = Math.sqrt(b * b - x * x)
  return { x, y, z }
}
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
    percent () { return Math.round(10000 * this.deltaY / (this.maxY || 1)) / 100 },
    indexOfMaxY () { return indexOfMax(this.Ys) },
    indexOfMaxX () { return indexOfMax(this.Xs) },
    indexOfMinY () { return indexOfMin(this.Ys) },
    indexOfMinX () { return indexOfMin(this.Xs) },
    lastindex () { return this.coords.length - 1 },
    A () {
      const { indexOfMinY, indexOfMaxY, coords, getHypto } = this
      return getHypto(indexOfMinY, indexOfMaxY, coords)
    },
    B () {
      const { indexOfMinY, lastindex, coords, getHypto } = this
      return getHypto(indexOfMinY, lastindex, coords)
    },
    C () {
      const { indexOfMaxY, lastindex, coords, getHypto } = this
      return getHypto(indexOfMaxY, lastindex, coords)
    },
    Ar () { return Math.round(this.A * 100) / 100 },
    Br () { return Math.round(this.B * 100) / 100 },
    Cr () { return Math.round(this.C * 100) / 100 },
    deltaYr () { return Math.round(this.deltaY * 1e10) / 1e10 },
    xyz () { return xyz(this.A, this.B, this.C) },
    alpha () {
      const { indexOfMaxY, indexOfMinY, coords } = this
      const opposite = coords[indexOfMaxY].v - coords[indexOfMinY].v
      const adjacent = coords[indexOfMaxY].x - coords[indexOfMinY].x
      return -Math.atan(opposite / adjacent) * 180 / Math.PI
    },
    beta () {
      const { lastindex, indexOfMinY, coords } = this
      const opposite = coords[lastindex].v - coords[indexOfMinY].v
      const adjacent = coords[lastindex].x - coords[indexOfMinY].x
      return Math.atan(opposite / adjacent) * 180 / Math.PI
    },
    gama () {
      const { alpha, beta } = this
      return 180 - alpha - beta
    },
    bw () {
      const n = this.coords.length || 1
      const m = 2 * this.margin // both side margins
      const w = this.width / n
      return w < m + 1 ? 1 : (w - m)
    },
    length () { return this.points.length },
    coords () {
      return this.points.map(p => {
        const m = this.margin // margin
        const w = this.width - m
        const h = this.height - m
        const x = m / 2 + w * (p.time - this.minX) / this.deltaX
        const y = m / 2 + h * (1 - (p.price - this.minY) / this.deltaY)
        const v = this.height - y
        return { x, y, v, color: p.color }
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
    },
    getHypto (index1, index2, coords) {
      if (!(index1 >= 0) || !(index2 >= 0) || coords[index1] === undefined) return NaN
      const { x: x1, y: y1 } = coords[index1]
      const { x: x2, y: y2 } = coords[index2]
      return Math.hypot((x2 - x1), (y2 - y1))
    }
  }
}
</script>

<style scoped lang="scss">
  .semi {
    background-color: rgba(black, 0.4);
  }
</style>
