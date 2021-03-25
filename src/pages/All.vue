<template>
  <q-page>
    <q-table
      dense
      :title="`Coins performance since ${time()} seconds ago`"
      :data="data"
      :columns="columns"
      :visibleColumns="visibleColumns"
      :rows-per-page-options="[10]"
      row-key="symbol"
      NOT-hide-bottom
    >
      <template v-slot:top="props">
        <div class="col-4 q-table__title">Last {{time()}} seconds of coins performance</div>
        <q-space />
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

      <template v-slot:body-cell-symbol="props">
        <q-td :props="props">
          {{ props.value }}
          <q-btn icon="launch" color="green-5" round size="xs" flat
            :to="{ name: 'coin', params: { symbol: props.value } }"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-price="props">
        <q-td :props="props">
          <q-badge :color="getcolor(props.row.pTrend.direction)" :label="props.value" />
        </q-td>
      </template>

      <template v-slot:body-cell-vema0="props">
        <q-td :props="props">
          <q-badge :color="getcolor(props.row.pTrend.direction)" :label="`${props.value}%`" />
        </q-td>
      </template>

      <template v-slot:body-cell-vema1="props">
        <q-td :props="props">
          <q-badge :color="getcolor(props.row.emaTrends[0].direction)" :label="`${props.value}%`" />
        </q-td>
      </template>

      <template v-slot:body-cell-vema2="props">
        <q-td :props="props">
          <q-badge :color="getcolor(props.row.emaTrends[1].direction)" :label="`${props.value}%`" />
        </q-td>
      </template>

      <template v-slot:body-cell-vema3="props">
        <q-td :props="props">
          <q-badge :color="getcolor(props.row.emaTrends[2].direction)" :label="`${props.value}%`" />
        </q-td>
      </template>

      <template v-slot:body-cell-vema4="props">
        <q-td :props="props">
          <q-badge :color="getcolor(props.row.emaTrends[3].direction)" :label="`${props.value}%`" />
        </q-td>
      </template>

    </q-table>
  </q-page>
</template>

<script>
// https://www.htmlsymbols.xyz/arrow-symbols
// https://www.toptal.com/designers/htmlarrows/math/
import Tickers from 'src/helpers/Tickers'
import Trend from 'src/helpers/Trend'
import numeral from 'numeral'

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
  if (n <= 0) return '0'
  else {
    let s = '0.'
    while (n--) s = `${s}0`
    return s
  }
}

const ndigit = (v, size = 0) => {
  return numeral(v).format(zeros(size))
}
const xdigit = (v) => {
  const n = 6 - Math.floor(Math.log10(v))
  return ndigit(v, n)
}

const plus = v => numeral(v).format('+0')
const maverages = [3, 30, 300, 3600, 14400]
const columns = [
  { name: 'time', label: 'Time', align: 'left', field: 'time', sortable: true },
  { name: 'symbol', required: true, label: 'Coin', align: 'right', field: 'symbol', sortable: true },
  { name: 'price', required: true, label: 'Price', align: 'right', field: 'price', sortable: true },
  { name: 'pTrenddir', label: 'Up', align: 'left', field: row => row.pTrend.direction, sortable: true, format: plus },
  { name: 'pTrendmag', label: '‰Δ', align: 'left', field: row => row.pTrend.magnitude, sortable: true, format: v => ndigit(1000 * v, 3) },
  { name: 'ema0', label: 'EMA(3s)', align: 'right', field: row => row.emas[0], sortable: true, format: v => xdigit(v) },
  { name: 'etrend0', label: 'Up', align: 'left', field: row => row.emaTrends[0].direction, sortable: true, format: plus },
  { name: 'etrmag0', label: '‰Δ', align: 'left', field: row => row.emaTrends[0].magnitude, sortable: true, format: v => ndigit(1000 * v, 3) },
  { name: 'vema0', label: 'P/EMA(3s)', align: 'right', field: row => row.vemas[0], sortable: true, format: v => ndigit(100 * v, 4) },
  { name: 'ema1', label: 'EMA(30s)', align: 'right', field: row => row.emas[1], sortable: true, format: v => xdigit(v) },
  { name: 'etrend1', label: 'Up', align: 'left', field: row => row.emaTrends[1].direction, sortable: true, format: plus },
  { name: 'etrmag1', label: '‰Δ', align: 'left', field: row => row.emaTrends[1].magnitude, sortable: true, format: v => ndigit(1000 * v, 3) },
  { name: 'vema1', label: 'P/EMA(30s)', align: 'right', field: row => row.vemas[1], sortable: true, format: v => ndigit(100 * v, 2) },
  { name: 'ema2', label: 'EMA(5m)', align: 'right', field: row => row.emas[2], sortable: true, format: v => xdigit(v) },
  { name: 'etrend2', label: 'Up', align: 'left', field: row => row.emaTrends[2].direction, sortable: true, format: plus },
  { name: 'etrmag2', label: '‰Δ', align: 'left', field: row => row.emaTrends[2].magnitude, sortable: true, format: v => ndigit(1000 * v, 3) },
  { name: 'vema2', label: 'P/EMA(5m)', align: 'right', field: row => row.vemas[2], sortable: true, format: v => ndigit(100 * v, 2) },
  { name: 'ema3', label: 'EMA(1h)', align: 'right', field: row => row.emas[3], sortable: true, format: v => xdigit(v) },
  { name: 'etrend3', label: 'Up', align: 'left', field: row => row.emaTrends[3].direction, sortable: true, format: plus },
  { name: 'etrmag3', label: '‰Δ', align: 'left', field: row => row.emaTrends[3].magnitude, sortable: true, format: v => ndigit(1000 * v, 3) },
  { name: 'vema3', label: 'P/EMA(1h)', align: 'right', field: row => row.vemas[3], sortable: true, format: v => ndigit(100 * v, 2) },
  { name: 'ema4', label: 'EMA(4h)', align: 'right', field: row => row.emas[4], sortable: true, format: v => xdigit(v) },
  { name: 'etrend4', label: 'Up', align: 'left', field: row => row.emaTrends[4].direction, sortable: true, format: plus },
  { name: 'etrmag4', label: '‰Δ', align: 'left', field: row => row.emaTrends[4].magnitude, sortable: true, format: v => ndigit(1000 * v, 3) },
  { name: 'vema4', label: 'P/EMA(4h)', align: 'right', field: row => row.vemas[4], sortable: true, format: v => ndigit(100 * v, 2) },
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
      emaTrends: maverages.map(e => ({})),
      tickers: {},
      events: {},
      columns,
      visibleColumns: columns.map(c => c.name)
    }
  },
  computed: {
    time () {
      return () => 0 | (Date.now() - this.start) / 1000
    },
    data () {
      return Object.values(this.tickers)
    }
  },
  components: {
  },
  watch: {
  },
  methods: {
    onticker (t) {
      const s = t.s
      const start = Date.now()
      this.difftime = start - t.time

      this.events[s] = 1 + (this.events[s] || 0)

      const pTrend = this.pTrends[s] = this.pTrends[s] || new Trend()
      pTrend.pusha(t.price)

      const vemas = t.emas.map(m => t.price / m)

      const emaTrends = []
      for (const index in maverages) {
        const trend = this.emaTrends[index][s] = this.emaTrends[index][s] ||
          new Trend({ maxtrendsize: 0 | Math.pow(100 * maverages[index], 1 / 2) })
        trend.pusha(t.emas[index])
        emaTrends.push(trend)
      }

      const time = new Date(t.time).toLocaleTimeString()
      this.$set(this.tickers, s, { ...t, pTrend, time, vemas, emaTrends })
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
</style>
