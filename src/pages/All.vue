<template>
  <q-page>
    <q-table
      dense
      :title="`Coins performance since ${time()} seconds ago`"
      :data="filteredData"
      :columns="columns"
      :visibleColumns="visibleColumns"
      :rows-per-page-options="[20, 10, 5, 30, 40, 50, 80, 0]"
      row-key="symbol"
    >
      <template v-slot:top="props">
        <div class="row no-wrap q-gutter-md full-width">
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
          <q-checkbox indeterminate-value v-model="magnitude" label="Show magnitude" size="xs" color="green"/>
          <q-checkbox indeterminate-value v-model="ema" label="Show EMAs" size="xs" color="green"/>
          <q-checkbox indeterminate-value v-model="vema" label="Show EMAs Ratio" size="xs" color="green"/>
          <q-checkbox indeterminate-value v-model="trend" label="Show Trends" size="xs" color="green"/>
          <q-checkbox indeterminate-value v-model="_3s" label="Show 3s values" size="xs" color="green"/>
          <q-checkbox indeterminate-value v-model="_30s" label="Show 30s values" size="xs" color="green"/>
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
          {{ props.value }}
          <q-btn icon="launch" color="green-5" round size="xs" flat
            :to="{ name: 'coin', params: { symbol: props.value } }"
          />
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
import { mapState } from 'vuex'

import Tickers from 'src/helpers/Tickers'
import Trend from 'src/helpers/Trend'
import numeral from 'numeral'
import myfilter from 'src/components/Filters'

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
  { name: 'time', label: 'Time', align: 'left', field: 'time', sortable: true },
  { name: 'symbol', required: true, label: 'Coin', align: 'right', field: 'symbol', sortable: true },
  { name: 'price', required: true, label: 'Price', align: 'right', field: 'price', sortable: true },
  { name: 'ptrend', label: 'Up(p)', align: 'left', field: row => row.pTrend.direction, sortable: true, format: plus },
  { name: 'pmag', label: '‰Δ(p)', align: 'left', field: row => row.pTrend.magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'pratio', label: '‰Δ(p)/s', align: 'left', field: row => row.pTrend.ratio, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'vema0', label: 'P/3s', align: 'right', field: row => row.vemas[0], sortable: true, format: v => xdigit(v) },
  { name: 'vetrend0', label: 'Up(P/3s)', align: 'left', field: row => row.vemaTrends[0].direction, sortable: true, format: plus },
  { name: 'vetrmag0', label: '‰Δ(P/3s)', align: 'left', field: row => row.vemaTrends[0].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'vetratio0', label: '‰Δ(P/3s)/s', align: 'left', field: row => row.vemaTrends[0].ratio, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'ema0', label: 'EMA(3s)', align: 'right', field: row => row.emas[0], sortable: true, format: v => xdigit(v) },
  { name: 'etrend0', label: 'Up(3s)', align: 'left', field: row => row.emaTrends[0].direction, sortable: true, format: plus },
  { name: 'etrmag0', label: '‰Δ(3s)', align: 'left', field: row => row.emaTrends[0].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'etratio0', label: '‰Δ(3s)/s', align: 'left', field: row => row.emaTrends[0].ratio, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'vema1', label: '3s/30s', align: 'right', field: row => row.vemas[1], sortable: true, format: v => xdigit(v) },
  { name: 'vetrend1', label: 'Up(3s/30s)', align: 'left', field: row => row.vemaTrends[1].direction, sortable: true, format: plus },
  { name: 'vetrmag1', label: '‰Δ(3s/30s)', align: 'left', field: row => row.vemaTrends[1].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'vetratio1', label: '‰Δ(3s/30s)/s', align: 'left', field: row => row.vemaTrends[1].ratio, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'ema1', label: 'EMA(30s)', align: 'right', field: row => row.emas[1], sortable: true, format: v => xdigit(v) },
  { name: 'etrend1', label: 'Up(30s)', align: 'left', field: row => row.emaTrends[1].direction, sortable: true, format: plus },
  { name: 'etrmag1', label: '‰Δ(30s)', align: 'left', field: row => row.emaTrends[1].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'etratio1', label: '‰Δ(30s)/s', align: 'left', field: row => row.emaTrends[1].ratio, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'vema2', label: '30s/5m', align: 'right', field: row => row.vemas[2], sortable: true, format: v => xdigit(v) },
  { name: 'vetrend2', label: 'Up(30s/5m)', align: 'left', field: row => row.vemaTrends[2].direction, sortable: true, format: plus },
  { name: 'vetrmag2', label: '‰Δ(30s/5m)', align: 'left', field: row => row.vemaTrends[2].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'vetratio2', label: '‰Δ(30s/5m)/s', align: 'left', field: row => row.vemaTrends[2].ratio, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'ema2', label: 'EMA(5m)', align: 'right', field: row => row.emas[2], sortable: true, format: v => xdigit(v) },
  { name: 'etrend2', label: 'Up(5m)', align: 'left', field: row => row.emaTrends[2].direction, sortable: true, format: plus },
  { name: 'etrmag2', label: '‰Δ(5m)', align: 'left', field: row => row.emaTrends[2].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'etratio2', label: '‰Δ(5m)/s', align: 'left', field: row => row.emaTrends[2].ratio, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'vema3', label: '5m/1h', align: 'right', field: row => row.vemas[3], sortable: true, format: v => xdigit(v) },
  { name: 'vetrend3', label: 'Up(5m/1h)', align: 'left', field: row => row.vemaTrends[3].direction, sortable: true, format: plus },
  { name: 'vetrmag3', label: '‰Δ(5m/1h)', align: 'left', field: row => row.vemaTrends[3].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'vetratio3', label: '‰Δ(5m/1h)/s', align: 'left', field: row => row.vemaTrends[3].ratio, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'ema3', label: 'EMA(1h)', align: 'right', field: row => row.emas[3], sortable: true, format: v => xdigit(v) },
  { name: 'etrend3', label: 'Up(1h)', align: 'left', field: row => row.emaTrends[3].direction, sortable: true, format: plus },
  { name: 'etrmag3', label: '‰Δ(1h)', align: 'left', field: row => row.emaTrends[3].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'etratio3', label: '‰Δ(1h)/s', align: 'left', field: row => row.emaTrends[3].ratio, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'vema4', label: '1h/4h', align: 'right', field: row => row.vemas[4], sortable: true, format: v => ydigit(v) },
  { name: 'vetrend4', label: 'Up(1h/4h)', align: 'left', field: row => row.vemaTrends[4].direction, sortable: true, format: plus },
  { name: 'vetrmag4', label: '‰Δ(1h/4h)', align: 'left', field: row => row.vemaTrends[4].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'vetratio4', label: '‰Δ(1h/4h)/s', align: 'left', field: row => row.vemaTrends[4].ratio, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'ema4', label: 'EMA(4h)', align: 'right', field: row => row.emas[4], sortable: true, format: v => xdigit(v) },
  { name: 'etrend4', label: 'Up(4h)', align: 'left', field: row => row.emaTrends[4].direction, sortable: true, format: plus },
  { name: 'etrmag4', label: '‰Δ(4h)', align: 'left', field: row => row.emaTrends[4].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'etratio4', label: '‰Δ(4h)/s', align: 'left', field: row => row.emaTrends[4].ratio, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'volume', label: 'Volume', align: 'right', field: 'volume', sortable: true, format: v => numeral(v).format('0,0') },
  { name: 'quantity', label: 'Qnt.', align: 'right', field: 'quantity', sortable: true, format: v => numeral(v).format('0,0') }
]
export default {
  name: 'All',
  data () {
    return {
      start: Date.now(),
      difftime: 0,
      remember: 10,
      tickersObj: null,
      pTrends: {},
      emaTrends: [],
      vemaTrends: [],
      tickers: {},
      events: {},
      columns,
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
    magnitude: {
      get () { return this.isAllVisible(/mag\d?$/) },
      set (v) { this.setAllVisible(v, /mag\d?$/) }
    },
    ema: {
      get () { return this.isAllVisible(/^ema\d/) },
      set (v) { this.setAllVisible(v, /^ema\d/) }
    },
    vema: {
      get () { return this.isAllVisible(/^vema\d/) },
      set (v) { this.setAllVisible(v, /^vema\d/) }
    },
    trend: {
      get () { return this.isAllVisible(/trend\d?$/) },
      set (v) { this.setAllVisible(v, /trend\d?$/) }
    },
    _3s: {
      get () { return this.isAllVisible(/0$/) },
      set (v) { this.setAllVisible(v, /0$/) }
    },
    _30s: {
      get () { return this.isAllVisible(/1$/) },
      set (v) { this.setAllVisible(v, /1$/) }
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
        this.pTrends[s] = new Trend()
        this.emaTrends.forEach(t => {
          t[s] = new Trend()
        })
        this.vemaTrends.forEach(t => {
          t[s] = new Trend()
        })
      }
    },
    onticker (t) {
      const s = t.s
      this.setSymbolTrends(s)
      const start = Date.now()
      this.difftime = start - t.time

      this.events[s] = 1 + (this.events[s] || 0)

      const pTrend = this.pTrends[s]
      pTrend.pusha(t.price)

      const vemas = t.emas.map((m, index, a) => {
        if (index === 0) return t.price / m
        return a[index - 1] / m
      })

      const emaTrends = this.maverages.map((v, index) => this.emaTrends[index][s].pusha(t.emas[index]))
      const vemaTrends = this.maverages.map((v, index) => this.vemaTrends[index][s].pusha(vemas[index]))

      const time = new Date(t.time).toLocaleTimeString()
      this.$set(this.tickers, s, { ...t, pTrend, time, vemas, emaTrends, vemaTrends })
    },
    numeral (v, size = 0) {
      return numeral(v).format(zeros(size))
    },
    expo (v, size) {
      return numeral(v).format('+0.0e+0')
    },
    getcolor (n) {
      return getColor(n)
    }
  },
  mounted () {
    const maverages = this.maverages
    this.emaTrends = maverages.map(e => ({}))
    this.vemaTrends = maverages.map(e => ({}))
    const handler = t => this.onticker(t)
    this.tickersObj = new Tickers({ maverages, handler, match: /(?<!DOWN|UP)USDT$/ })
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
</style>
