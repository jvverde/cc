<template>
  <q-page>
    <q-table class="tforce1 tforce2 tforce3"
      dense
      :title="`Coins performance since ${time()} seconds ago`"
      :data="filteredData"
      :columns="columns"
      :visibleColumns="visibleColumns"
      :rows-per-page-options="[20, 10, 5, 30, 40, 50, 80, 0]"
      row-key="symbol"
    >
      <template v-slot:top="props">
        <div class="row no-wrap q-gutter-md full-width top items-start">
          <div>Last {{time()}} seconds of coins performance</div>
          <span :class="difftime > 1000 ? 'red' : 'green'">{{ difftime / 1000 }}s</span>
          <q-space />
          <div class="q-gutter-xs">
            <q-btn-dropdown dense outline no-caps label="Filters" icon="filter_list" >
              <q-list>
                <q-item clickable v-close-popup
                  v-for="(col, index) in columns" :key="index"
                  @click="filter(col)">
                  <q-item-section>
                    {{col.label}}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <q-chip dense size="md" outline color="amber" square
              clickable @click="editFilter(index)"
              removable @remove="removeFilter(index)"
              v-for="(filter, index) in filters" :key="index" :label="filter.label"
            />
          </div>
          <q-space />
          <div class="row wrap q-gutter-xs">
            <q-checkbox indeterminate-value v-model="ema" label="EMA" size="xs" color="green"/>
            <q-checkbox indeterminate-value v-model="vema" size="xs" color="green">
              <q-badge color="transparent">EMA(p)</q-badge>/<q-badge color="transparent">EMA(p-1)</q-badge>
            </q-checkbox>
            <q-checkbox indeterminate-value v-model="vemaValues" size="xs" color="green">
              <q-badge color="transparent">Values EMA(p)</q-badge>/<q-badge color="transparent">EMA(p-1)</q-badge>
            </q-checkbox>
            <q-checkbox indeterminate-value v-model="trend" label="Trends" size="xs" color="green"/>
            <q-checkbox indeterminate-value v-model="magnitude" label="Magnitude" size="xs" color="green"/>
            <q-checkbox indeterminate-value v-model="dura" label="Duration" size="xs" color="green"/>
            <q-checkbox indeterminate-value v-model="rate" label="Rate" size="xs" color="green"/>
            <q-checkbox
              v-for="(p, index) in periods" :key="`period${index}`"
              v-model="p.val"
              @input="v => shperiod(v, p)"
              :label="`P(${p.s})`" size="xs" color="green"
            />
          </div>
          <q-select
            v-model="visibleColumns"
            multiple
            outlined
            dense
            options-dense
            display-value="Show Columns"
            emit-value
            map-options
            :options="columns"
            option-value="name"
            options-cover
            style="min-width: 150px"
          />
          <q-btn
            flat round dense
            :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
            @click="props.toggleFullscreen"
            class="q-ml-md"
          />
        </div>
      </template>

      <!--template v-slot:header-cell="props">
        <q-th :props="props" class="nospace">
          <div class="column no-wrap items-start">
            <span>{{ props.col.label }}</span>
            <q-btn size="xs" flat rounded icon="filter_list" @click="filter(props.col)"/>
          </div>
        </q-th>
      </template-->

      <template v-slot:body-cell-symbol="props">
        <q-td :props="props">
          <q-btn color="green-5" rounded size="sm" flat
            :to="{ name: 'coin', params: { symbol: props.value } }"
          >
            {{ props.value }}
          </q-btn>
        </q-td>
      </template>

      <!--template v-slot:body-cell-price="props">
        <q-td :props="props">
          <q-badge :color="getcolor(props.row.pTrend.direction)" :label="props.value" />
        </q-td>
      </template>

      <template v-slot:body-cell-vema0="props">
        <q-td :props="props">
          <q-badge :color="getcolor(props.row.vemaTrends[0].direction)" :label="`${props.value}%`" />
        </q-td>
      </template>

      <template v-slot:body-cell-vema1="props">
        <q-td :props="props">
          <q-badge :color="getcolor(props.row.vemaTrends[1].direction)" :label="`${props.value}%`" />
        </q-td>
      </template>

      <template v-slot:body-cell-vema2="props">
        <q-td :props="props">
          <q-badge :color="getcolor(props.row.vemaTrends[2].direction)" :label="`${props.value}%`" />
        </q-td>
      </template>

      <template v-slot:body-cell-vema3="props">
        <q-td :props="props">
          <q-badge :color="getcolor(props.row.vemaTrends[3].direction)" :label="`${props.value}%`" />
        </q-td>
      </template>

      <template v-slot:body-cell-vema4="props">
        <q-td :props="props">
          <q-badge :color="getcolor(props.row.emaTrends[4].direction)" :label="`${props.value}%`" />
        </q-td>
      </template-->

    </q-table>
    <myfilter :model.sync="editfilter" :filters.sync="filters" :name="filtername" :label="filterlabel"
      :valueof="filtervalueof"/>
  </q-page>
</template>

<script>
// https://www.htmlsymbols.xyz/arrow-symbols
// https://www.toptal.com/designers/htmlarrows/math/
// import store from 'src/store'

// console.log('store', store.getters())

import { mapState } from 'vuex'

import Tickers from 'src/helpers/Tickers'
import Trend from 'src/helpers/Trend'
import numeral from 'numeral'
import myfilter from 'src/components/Filters'

const dhms = t => {
  if (t < 60) return `${0 | t}s`
  const s = 0 | t % 60
  t = 0 | t / 60
  if (t < 60) return `${t}m${s}s`
  const m = 0 | t % 60
  t = 0 | t / 60
  if (t < 24) return `${t}h${m}m${s}s`
  const h = 0 | t % 24
  t = 0 | t / 24
  return `${t}d${h}h${m}m${s}s`
}

const totime = t => dhms(t).replace(/m0s$/, 'm').replace(/h0m$/, 'h').replace(/d0h$/, 'd')

const positiveColors = [
  'light-green-6', 'light-green-7', 'light-green-8', 'light-green-9', 'light-green-10',
  'green-6', 'green-7', 'green-8', 'green-9', 'green-10'
]

const negativeColors = [
  'deep-orange-6', 'deep-orange-7', 'deep-orange-8', 'deep-orange-9', 'deep-orange-10',
  'red-6', 'red-7', 'red-8', 'red-9', 'red-10'
]

const getColor = n => {
  if (n >= positiveColors.length) return positiveColors[positiveColors.length - 1]
  if (n > 0) return positiveColors[n]
  if (n <= -negativeColors.length) return negativeColors[negativeColors.length - 1]
  if (n < 0) return negativeColors[-n]
  return 'transparent'
}

const zeros = n => {
  if (n > 0 && Math.abs(n) !== Infinity) {
    let s = '0.'
    while (n--) s = `${s}0`
    return s
  }
  return '0'
}

const ndigit = (v, size = 0) => numeral(v).format(zeros(size))

const pdigit = (v, size = 0) => numeral(v).format('+' + zeros(size))

const xdigit = (v) => {
  const n = v ? 6 - Math.floor(Math.log10(v)) : 0
  return ndigit(v, n)
}

const ydigit = (v) => {
  const n = v ? 1 - Math.floor(Math.log10(Math.abs(v))) : 0
  return pdigit(v, n)
}

const plus = v => numeral(v).format('+0')

const columns = [
  { name: 'time', label: 'Time', align: 'right', field: 'time', sortable: true, classes: 'time' },
  { name: 'symbol', required: true, label: 'Coin', align: 'center', field: 'symbol', sortable: true, classes: 'symbol' },
  { name: 'frequency', required: true, label: 'Freq.', align: 'center', field: 'frequency', sortable: true, format: v => ndigit(v, 2) },
  { name: 'price', required: true, label: 'Price', align: 'left', field: 'price', sortable: true, classes: 'price' },
  { name: 'ptrend', label: '[⇅(P)]', align: 'center', field: row => row.pTrend.direction, sortable: true, format: plus },
  { name: 'pmag', label: '[P‰]', align: 'left', ield: row => row.pTrend.magnitude, sortable: true, format: v => ydigit(1000 * v), classes: 'permil' },
  // { name: 'prate', label: '[P‰/s]', field: row => row.pTrend.rate, sortable: true, format: v => ydigit(1000 * v), classes: 'permil' },
  // { name: 'pdura', label: '[P‰s]', field: row => row.pTrend.dura, sortable: true, format: v => ydigit(1000 * v), classes: 'permil' },
  { name: 'volume', label: 'Volume', align: 'right', field: 'volume', sortable: true, format: v => numeral(v).format('0,0') },
  { name: 'quantity', label: 'Qnt.', align: 'right', field: 'quantity', sortable: true, format: v => numeral(v).format('0,0') }
]

export default {
  name: 'All',
  data () {
    return {
      start: Date.now(),
      difftime: 0,
      tickersProducer: null,
      pTrends: {},
      emaTrends: [],
      vemaTrends: [],
      tickers: {},
      events: {},
      columns: [],
      visibleColumns: columns.map(c => c.name),
      filters: [],
      filterlabel: '',
      filtername: '',
      filtervalueof: () => true,
      editfilter: false
    }
  },
  computed: {
    ...mapState('binance', ['maverages']),
    time () {
      return () => 0 | (Date.now() - this.start) / 1000
    },
    data () {
      return Object.values(this.tickers)
    },
    filteredData () {
      let data = this.data
      for (const f of this.filters) {
        if (f.test instanceof Function) {
          // console.log(f)
          data = data.filter(obj => f.test(obj))
        }
      }
      return data
    },
    columnsMatchNames () { return re => this.columns.filter(c => c.name.match(re)).map(e => e.name) },
    visibleMatching () { return re => this.visibleColumns.filter(v => v.match(re)) },
    visibleNotMatching () { return re => this.visibleColumns.filter(v => !v.match(re)) },
    isAllVisible () {
      return re => {
        const len = this.visibleMatching(re).length
        if (len === 0) return false
        else if (len === this.columnsMatchNames(re).length) return true
        return null
      }
    },
    setAllVisible () {
      return (v, re) => {
        if (v) {
          const current = new Set(this.visibleColumns)
          this.columnsMatchNames(re).filter(name => !current.has(name)).forEach(name => {
            this.visibleColumns.push(name)
          })
        } else {
          this.visibleColumns = this.visibleNotMatching(re)
        }
      }
    },
    ema: {
      get () { return this.isAllVisible(/^ema\d+$/) },
      set (v) { this.setAllVisible(v, /^ema\d+$/) }
    },
    vema: {
      get () { return this.isAllVisible(/^v(?!olume)/) },
      set (v) { this.setAllVisible(v, /^v(?!olume)/) }
    },
    vemaValues: {
      get () { return this.isAllVisible(/^vema\d+$/) },
      set (v) { this.setAllVisible(v, /^vema\d+$/) }
    },
    trend: {
      get () { return this.isAllVisible(/trend\d*$/) },
      set (v) { this.setAllVisible(v, /trend\d*$/) }
    },
    magnitude: {
      get () { return this.isAllVisible(/mag\d*$/) },
      set (v) { this.setAllVisible(v, /mag\d*$/) }
    },
    rate: {
      get () { return this.isAllVisible(/rate\d*$/) },
      set (v) { this.setAllVisible(v, /rate\d*$/) }
    },
    dura: {
      get () { return this.isAllVisible(/dura\d*$/) },
      set (v) { this.setAllVisible(v, /dura\d*$/) }
    },
    periods () {
      return this.maverages.map(i => ({ i, s: totime(i), val: true }))
    }
  },
  components: {
    myfilter
  },
  watch: {
    editfilter (v) {
      if (v === false && this.filterOf && this.filterOf[0] && this.filterOf[0].test instanceof Function) {
        console.log('editfilter:', this.filterOf, this.filterOf[0].test({ price: 100 }))
      }
    }
  },
  methods: {
    shperiod (v, p) { // Show/Hide period stats
      const re = new RegExp(`[^0-9]${p.i}$`)
      this.setAllVisible(v, re)
    },
    filter (col) {
      const { name, label, field } = col
      // The function valueOf allow us to get the value of field to be tested
      const valueOf = field instanceof Function ? field : obj => obj[field]

      this.filtervalueof = valueOf
      this.filterlabel = label
      this.filtername = name
      this.editfilter = true
      // console.log(v, typeof v, v instanceof String, v instanceof Function, v instanceof Object)
    },
    removeFilter (index) {
      this.filters.splice(index, 1)
    },
    editFilter (index) {
      const { valueOf, label, name } = this.filters[index]
      this.filtervalueof = valueOf
      this.filterlabel = label
      this.filtername = name
      this.editfilter = true
    },
    setSymbolTrends (s) {
      if (!this.pTrends[s]) {
        const maverages = this.maverages
        this.pTrends[s] = new Trend(maverages)
        this.emaTrends.forEach(t => {
          t[s] = new Trend(maverages)
        })
        this.vemaTrends.forEach(t => {
          t[s] = new Trend(maverages)
        })
      }
    },
    onticker (t) {
      const s = t.s
      this.setSymbolTrends(s)
      const now = Date.now()
      this.difftime = now - t.time

      this.events[s] = 1 + (this.events[s] || 0)
      const frequency = 1000 * this.events[s] / (now - this.start)

      const pTrend = this.pTrends[s]
      pTrend.pusha(t.price)

      const vemas = t.emas.map((m, index, a) => {
        if (index === 0) return t.price / m
        return a[index - 1] / m
      })

      const emaTrends = this.maverages.map((v, index) => this.emaTrends[index][s].pusha(t.emas[index]))
      const vemaTrends = this.maverages.map((v, index) => this.vemaTrends[index][s].pusha(vemas[index]))

      const time = new Date(t.time).toLocaleTimeString()
      this.$set(this.tickers, s, { ...t, pTrend, time, vemas, emaTrends, vemaTrends, frequency })
    },
    getcolor (n) {
      return getColor(n)
    },
    initColumns () {
      const maverages = this.maverages
      const dynamicols = []
      const [sortable, align] = [true, 'left']
      let p = 'P'
      for (const i in maverages) {
        const j = maverages[i]
        const t = totime(j)
        const cols = [
          { name: `vema${j}`, label: `${p}/${t}`, field: row => row.vemas[i], format: v => xdigit(v) },
          { name: `vtrend${j}`, label: `[⇅(${p}/${t})]`, align: 'center', field: row => row.vemaTrends[i].direction, format: plus },
          { name: `vtrmag${j}`, label: `[(${p}/${t})‰]`, field: row => row.vemaTrends[i].magnitude, format: v => ydigit(1000 * v), classes: 'permil' },
          { name: `vtdura${j}`, label: `[Δt(${p}/${t})]`, field: row => row.vemaTrends[i].duration, format: s => dhms(s / 1000) },
          { name: `vtrate${j}`, label: `[(${p}/${t})‰/s]`, field: row => row.vemaTrends[i].rate, format: v => ydigit(1000 * v), classes: 'permil' },
          { name: `ema${j}`, label: `EMA(${t})`, field: row => row.emas[i], format: v => xdigit(v) },
          { name: `etrend${j}`, label: `[⇅(${t})]`, align: 'center', field: row => row.emaTrends[i].direction, format: plus },
          { name: `etrmag${j}`, label: `[${t}‰]`, field: row => row.emaTrends[i].magnitude, format: v => ydigit(1000 * v), classes: 'permil' },
          { name: `etdura${j}`, label: `[Δt(${t})]`, field: row => row.emaTrends[i].duration, format: s => dhms(s / 1000) },
          { name: `etrate${j}`, label: `[${t}‰/s]`, field: row => row.emaTrends[i].rate, format: v => ydigit(1000 * v), classes: 'permil' }
        ].map(c => ({ align, sortable, ...c }))
        dynamicols.push(...cols)
        p = t
      }
      columns.splice(-2, 0, ...dynamicols)
      this.columns = columns
      this.visibleColumns = columns.map(c => c.name)
    }
  },
  mounted () {
    const maverages = this.maverages
    this.emaTrends = maverages.map(e => ({}))
    this.vemaTrends = maverages.map(e => ({}))
    const handler = t => this.onticker(t)
    this.tickersProducer = new Tickers({ maverages, handler, match: /(?<!DOWN|UP)USDT$/ })
    this.initColumns()
  }
}

</script>
<style lang="scss">
  .red {
    color: red;
  }
  .green {
    color: green;
  }
  .nospace {
    * {
      padding: 0 !important;
      margin: 0 !important;
    }
  }
  .price {
    max-width:50px;
    min-width:50px;
  }
  .symbol {
    max-width:60px;
    min-width:60px;
  }
  .time {
    max-width:1px;
    min-width:1pz;
  }
  .permil {
    max-width:2em;
    min-width:2em;
    text-align: left;
  }
  .tforce1.tforce2.tforce3 {
    td, th {
      font-size: 11px;
      padding: 2px;
    }
    .top {
      font-size: 11px;
    }
  }
</style>
