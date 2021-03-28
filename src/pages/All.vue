<template>
  <q-page>
    <q-table
      dense
      :title="`Coins performance since ${time()} seconds ago`"
      :data="datafiltered"
      :columns="columns"
      :visibleColumns="visibleColumns"
      :rows-per-page-options="[10, 20, 30, 40, 50, 80, 0]"
      row-key="symbol"
    >
      <template v-slot:top="props">
        <div class="col-auto q-table__title">Last {{time()}} seconds of coins performance</div>
        <q-space />
        <q-checkbox indeterminate-value v-model="magnitude" label="Show magnitude" size="xs" color="green"/>
        <q-space/>
        <q-select
          v-model="visibleColumns"
          multiple
          outlined
          dense
          options-dense
          :display-value="$q.lang.table.columns"
          emit-value
          map-options
          :options="columns"
          option-value="name"
          options-cover
          style="min-width: 150px"
        />
        <q-space />
        <span :class="difftime > 1000 ? 'red' : 'green'">{{ difftime / 1000 }}s</span>
        <q-space />
        <q-btn
          flat round dense
          :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="props.toggleFullscreen"
          class="q-ml-md"
        />
      </template>

      <template v-slot:header-cell="props">
        <q-th :props="props" class="nospace">
          <div class="column no-wrap items-start">
            <span>{{ props.col.label }}</span>
            <q-btn size="xs" flat rounded icon="filter_list" @click="filter(props.col)"/>
          </div>
        </q-th>
      </template>

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
    <myfilter :model.sync="editfilter" :filters.sync="filterOf"/>
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
  { name: 'pTrenddir', label: 'Up', align: 'left', field: row => row.pTrend.direction, sortable: true, format: plus },
  { name: 'pTrendmag', label: '‰Δ', align: 'left', field: row => row.pTrend.magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'vema0', label: 'Δ(P/3s)%', align: 'right', field: row => row.vemas[0], sortable: true, format: v => ydigit(100 * v - 100) },
  { name: 'vetrend0', label: 'Up', align: 'left', field: row => row.vemaTrends[0].direction, sortable: true, format: plus },
  { name: 'vetrmag0', label: '‰Δ', align: 'left', field: row => row.vemaTrends[0].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'ema0', label: 'EMA(3s)', align: 'right', field: row => row.emas[0], sortable: true, format: v => xdigit(v) },
  { name: 'etrend0', label: 'Up', align: 'left', field: row => row.emaTrends[0].direction, sortable: true, format: plus },
  { name: 'etrmag0', label: '‰Δ', align: 'left', field: row => row.emaTrends[0].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'vema1', label: 'Δ(3s/30s)%', align: 'right', field: row => row.vemas[1], sortable: true, format: v => ydigit(100 * v - 100) },
  { name: 'vetrend1', label: 'Up', align: 'left', field: row => row.vemaTrends[1].direction, sortable: true, format: plus },
  { name: 'vetrmag1', label: '‰Δ', align: 'left', field: row => row.vemaTrends[1].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'ema1', label: 'EMA(30s)', align: 'right', field: row => row.emas[1], sortable: true, format: v => xdigit(v) },
  { name: 'etrend1', label: 'Up', align: 'left', field: row => row.emaTrends[1].direction, sortable: true, format: plus },
  { name: 'etrmag1', label: '‰Δ', align: 'left', field: row => row.emaTrends[1].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'vema2', label: 'Δ(30s/5m)%', align: 'right', field: row => row.vemas[2], sortable: true, format: v => ydigit(100 * v - 100) },
  { name: 'vetrend2', label: 'Up', align: 'left', field: row => row.vemaTrends[2].direction, sortable: true, format: plus },
  { name: 'vetrmag2', label: '‰Δ', align: 'left', field: row => row.vemaTrends[2].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'ema2', label: 'EMA(5m)', align: 'right', field: row => row.emas[2], sortable: true, format: v => xdigit(v) },
  { name: 'etrend2', label: 'Up', align: 'left', field: row => row.emaTrends[2].direction, sortable: true, format: plus },
  { name: 'etrmag2', label: '‰Δ', align: 'left', field: row => row.emaTrends[2].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'vema3', label: 'Δ(5m/1h)%', align: 'right', field: row => row.vemas[3], sortable: true, format: v => ydigit(100 * v - 100) },
  { name: 'vetrend3', label: 'Up', align: 'left', field: row => row.vemaTrends[3].direction, sortable: true, format: plus },
  { name: 'vetrmag3', label: '‰Δ', align: 'left', field: row => row.vemaTrends[3].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'ema3', label: 'EMA(1h)', align: 'right', field: row => row.emas[3], sortable: true, format: v => xdigit(v) },
  { name: 'etrend3', label: 'Up', align: 'left', field: row => row.emaTrends[3].direction, sortable: true, format: plus },
  { name: 'etrmag3', label: '‰Δ', align: 'left', field: row => row.emaTrends[3].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'vema4', label: 'Δ(1h/4h)%', align: 'right', field: row => row.vemas[4], sortable: true, format: v => ydigit(100 * v - 100) },
  { name: 'vetrend4', label: 'Up', align: 'left', field: row => row.vemaTrends[4].direction, sortable: true, format: plus },
  { name: 'vetrmag4', label: '‰Δ', align: 'left', field: row => row.vemaTrends[4].magnitude, sortable: true, format: v => ydigit(1000 * v) },
  { name: 'ema4', label: 'EMA(4h)', align: 'right', field: row => row.emas[4], sortable: true, format: v => xdigit(v) },
  { name: 'etrend4', label: 'Up', align: 'left', field: row => row.emaTrends[4].direction, sortable: true, format: plus },
  { name: 'etrmag4', label: '‰Δ', align: 'left', field: row => row.emaTrends[4].magnitude, sortable: true, format: v => ydigit(1000 * v) },
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
      filterOf: [],
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
    datafiltered () {
      let data = this.data
      for (const f of this.filters) {
        data = data.filter(d => f(d))
      }
      return data
    },
    magcolumns () { return this.columns.filter(c => c.name.match(/mag\d?$/)).map(e => e.name) },
    magnitude: {
      get () {
        const len = this.visibleColumns.filter(e => e.match(/mag\d?$/)).length
        if (len === 0) return false
        else if (len === this.magcolumns.length) return true
        return null
      },
      set (v) {
        if (v) {
          const current = new Set(this.visibleColumns)
          this.magcolumns.filter(name => !current.has(name)).forEach(name => {
            this.visibleColumns.push(name)
          })
        } else {
          this.visibleColumns = this.visibleColumns.filter(e => !e.match(/mag\d?$/))
        }
      }
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
      const { label, field } = col
      // The function valueOf allow us to get the value of field to be tested
      const valueOf = field instanceof Function ? field : obj => obj[field]

      this.filterOf = [{
        valueOf,
        field: label,
        type: undefined,
        ref: undefined
      }]
      this.editfilter = true
      // console.log(v, typeof v, v instanceof String, v instanceof Function, v instanceof Object)
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
