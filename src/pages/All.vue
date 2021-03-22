<template>
  <q-page>
    <!--q-list dense>
      <q-item>
        <q-item-section no-wrap side>N</q-item-section>
        <q-item-section no-wrap>⇡Time⇣</q-item-section>
        <q-item-section no-wrap>Coin</q-item-section>
        <q-item-section no-wrap>
          <q-item-label :lines="1">
            <q-btn flat label="⇡" @click="sortby='price'; asc=true" size="sm"/>
            <q-btn flat label="⇣" @click="sortby='price'; asc=false" size="sm"/>
            <span>Price</span>
          </q-item-label>
        </q-item-section>
        <q-item-section no-wrap>
          <q-item-label :lines="1">
            <q-btn label="⇡" @click="sortby='chg.price.p'; asc=true" size="sm"/>
            <q-btn label="⇣" @click="sortby='chg.price.p'; asc=false" size="sm"/>
            <span>∇‰</span>
          </q-item-label>
        </q-item-section>
        <q-item-section no-wrap>
          <q-item-label :lines="1">
            <q-btn label="⇡" @click="sortby='mchg'; asc=true" size="sm"/>
            <q-btn label="⇣" @click="sortby='mchg'; asc=false" size="sm"/>
            <span>∇media</span>
          </q-item-label>
        </q-item-section>
        <q-item-section no-wrap>
          <q-item-label :lines="1">
            <q-btn label="⇡" @click="sortby='quantity'; asc=true" size="sm"/>
            <q-btn label="⇣" @click="sortby='quantity'; asc=false" size="sm"/>
            <span>Quantity</span>
          </q-item-label>
        </q-item-section>
        <q-item-section no-wrap>
          <q-item-label :lines="1">
            <q-btn flat label="⇡" @click="sortby='volume'; asc=true" size="sm"/>
            <q-btn flat label="⇣" @click="sortby='volume'; asc=false" size="sm"/>
            <span>Volume</span>
          </q-item-label>
        </q-item-section>
        <q-item-section no-wrap side>Freq.</q-item-section>
        <q-item-section no-wrap side @click="sortby='emas2.0'; asc=false">3 samp</q-item-section>
        <q-item-section no-wrap side @click="sortby='emas2.1'; asc=false">5 samp</q-item-section>
        <q-item-section no-wrap side @click="sortby='emas2.2'; asc=false">9 samp</q-item-section>
        <q-item-section no-wrap side @click="sortby='emas2.3'; asc=false">21 samp</q-item-section>
      </q-item>
      <q-item dense  clickable
        v-for="(t, i) in byorder" :key="t.symbol"
        :to="{ name: 'coin', params: { symbol: t.symbol } }">
        <q-item-section no-wrap side>{{ i }}</q-item-section>
        <q-item-section no-wrap class="text-left">{{ t.time }}</q-item-section>
        <q-item-section no-wrap class="text-center">{{ t.symbol }}</q-item-section>
        <q-item-section no-wrap :class="t.chg.price.c" class="text-right">{{ t.price }}</q-item-section>
        <q-item-section no-wrap :class="t.chg.price.c">{{ numeral(t.chg.price.p * 1000, 2) }} ‰</q-item-section>
        <q-item-section no-wrap>{{ numeral(t.vemas[0], 4) }}</q-item-section>
        <q-item-section no-wrap>{{ numeral(t.vemas[1], 4) }}</q-item-section>
        <q-item-section no-wrap>{{ numeral(t.vemas[2], 4) }}</q-item-section>
        <q-item-section no-wrap>{{ numeral(t.vemas[3], 4) }}</q-item-section>
        <q-item-section no-wrap>{{ numeral(t.vemas[4], 4) }}</q-item-section>
        <q-item-section no-wrap>{{ numeral(t.vemas[5], 4) }}</q-item-section>
        <q-item-section no-wrap>{{ numeral(t.mchg * 1000, 2) }} ‰</q-item-section>
        <q-item-section no-wrap :class="t.chg.quantity.c" class="text-right">{{ numeral(t.quantity) }}</q-item-section>
        <q-item-section no-wrap :class="t.chg.volume.c" class="text-right">{{ numeral(t.volume) }}</q-item-section>
        <q-item-section no-wrap side>{{ numeral(t.frequency, 2) }}</q-item-section>
        <q-item-section no-wrap side>{{ expo(t.emas2[0]) }}</q-item-section>
        <q-item-section no-wrap side>{{ expo(t.emas2[1]) }}</q-item-section>
        <q-item-section no-wrap side>{{ expo(t.emas2[2]) }}</q-item-section>
        <q-item-section no-wrap side>{{ expo(t.emas2[3]) }}</q-item-section>
      </q-item>
    </q-list-->
    <q-table
      :title="`Coins performance since ${time()} seconds ago`"
      :data="data"
      :columns="columns"
      :rows-per-page-options="[0]"
      row-key="symbol"
    >
      <template v-slot:body-cell-price="props">
        <q-td :props="props">
          <div>
            <q-badge :color="getcolor(props.row.pump)" :label="props.value" />
          </div>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
// https://www.htmlsymbols.xyz/arrow-symbols
// import { subcribeTrades, removeTrades, isSubcribed } from 'src/helpers/Trades'
// import { loadAggTradesLastMinutes } from 'src/helpers/BinanceApi'
import Tickers from 'src/helpers/Tickers'
import Queue from 'src/helpers/Queue'
import numeral from 'numeral'
// import { MA } from 'src/helpers/MovingAverage'
// import { AVERAGES } from 'src/config'

// const getcolor = (r, v) => r > v ? 'red' : 'green'

const seq = (...a) => {
  a = a.flat(Infinity)
  let v = a.pop()
  let i = a.length - 1
  if (i < 0) return 0
  if (a[i] < v) {
    do {
      v = a[i--]
    } while (i >= 0 && a[i] < v)
    return a.length - 1 - i
  } else if (a[i] > v) {
    do {
      v = a[i--]
    } while (i >= 0 && a[i] > v)
    return -(a.length - 1 - i)
  } else if (a[i] === v) {
    return 0
  }
  return undefined
}

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
const cmp = (v, old) => {
  const d = v - old
  const p = old !== 0 ? d / old : 0
  const c = d > 0 ? 'green' : d < 0 ? 'red' : ''
  return { v, d, p, c }
}

const digits = ['0', '0.0', '0.00', '0.000', '0.0000', '0.00000', '0.000000', '0.0000000']
const ndigit = (v, size = 0) => {
  return numeral(v).format(digits[size])
}
const maverages = [3, 30, 300, 3600, 14400]
const columns = [
  { name: 'time', required: true, label: 'Time', align: 'left', field: 'time', sortable: true },
  { name: 'frequency', required: true, label: 'Freq.', align: 'center', field: 'frequency', sortable: true, format: v => ndigit(v, 2) },
  { name: 'symbol', required: true, label: 'Coin', align: 'right', field: 'symbol', sortable: true },
  { name: 'price', required: true, label: 'Price', align: 'right', field: 'price', sortable: true },
  { name: 'pump', required: true, label: 'Pump', align: 'left', field: 'pump', sortable: true, format: v => numeral(v).format('+0') },
  { name: 'pumpamp', required: false, label: '‰ Pump Amp', align: 'left', field: 'pumpamp', sortable: true, format: v => ndigit(v, 2) },
  { name: 'last1', required: true, label: '‰ last', align: 'right', field: row => row.chg2last[0], sortable: true, format: v => ndigit(v, 2) },
  { name: 'last3', required: true, label: '‰ last 3', align: 'right', field: row => row.chg2last[2], sortable: true, format: v => ndigit(v, 2) },
  { name: 'last5', required: true, label: '‰ last 5', align: 'right', field: row => row.chg2last[4], sortable: true, format: v => ndigit(v, 2) },
  { name: 'last7', required: true, label: '‰ last 7', align: 'right', field: row => row.chg2last[6], sortable: true, format: v => ndigit(v, 2) },
  { name: 'last9', required: true, label: '‰ last 9', align: 'right', field: row => row.chg2last[8], sortable: true, format: v => ndigit(v, 2) },
  { name: 'vema0', required: true, label: '‰ EMA(3s)', align: 'right', field: row => row.vemas[0], sortable: true, format: v => ndigit(v, 2) },
  { name: 'vema1', required: true, label: '‰ EMA(30s)', align: 'right', field: row => row.vemas[1], sortable: true, format: v => ndigit(v, 2) },
  { name: 'vema2', required: true, label: '‰ EMA(5m)', align: 'right', field: row => row.vemas[2], sortable: true, format: v => ndigit(v, 2) },
  { name: 'vema3', required: true, label: '‰ EMA(1h)', align: 'right', field: row => row.vemas[3], sortable: true, format: v => ndigit(v, 2) },
  { name: 'vema4', required: true, label: '‰ EMA(4h)', align: 'right', field: row => row.vemas[4], sortable: true, format: v => ndigit(v, 2) },
  { name: 'volume', required: true, label: 'Volume', align: 'right', field: 'volume', sortable: true, format: v => ndigit(v, 0) },
  { name: 'quantity', required: true, label: 'Qnt.', align: 'right', field: 'quantity', sortable: true, format: v => ndigit(v, 0) }
]
export default {
  name: 'All',
  data () {
    return {
      start: Date.now(),
      remember: 10,
      tickersObj: null,
      queueOf: {},
      tickers: {},
      columns,
      maverages: [3, 5, 9, 21]
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
      const last = this.tickers[s] || t
      const chg = {
        price: cmp(t.price, last.price),
        quantity: cmp(t.quantity, last.quantity),
        volume: cmp(t.volume, last.volume)
      }

      const queue = this.queueOf[s] = this.queueOf[s] || new Queue(this.remember)
      const lastvalues = [...queue]
      const pump = seq(lastvalues.map(e => e.price), t.price)
      if (pump) {
        const index = lastvalues.length - Math.abs(pump)
        const pumpamp = index >= 0 && lastvalues[index].price ? 1000 * (t.price - lastvalues[index].price) / lastvalues[index].price : 0
        t.pumpamp = pumpamp
      }
      const chg2last = lastvalues.map(e => e.price ? 1000 * (t.price - e.price) / e.price : 0)

      const tc = { ...t, chg, chg2last, pump }
      const first = queue.pusha(tc)
      const frequency = first && t.time > first.time ? this.remember * 1000 / (t.time - first.time) : 0
      const time = new Date(t.time).toLocaleTimeString()
      const vemas = t.emas.map(m => m !== 0 ? 1000 * (t.price - m) / m : 0)
      this.$set(this.tickers, s, { ...tc, frequency, time, vemas })
    },
    numeral (v, size = 0) {
      return numeral(v).format(digits[size])
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
