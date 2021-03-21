<template>
  <q-page>
    <q-list dense>
      <q-item>
        <q-item-section no-wrap side>N</q-item-section>
        <q-item-section no-wrap>⇡Time⇣</q-item-section>
        <q-item-section no-wrap>Coin</q-item-section>
        <q-item-section no-wrap>
          <q-item-label :lines="1">
            <q-btn flat label="⇡" @click="sorttickers('price', true)" size="sm"/>
            <q-btn flat label="⇣" @click="sorttickers('price', false)" size="sm"/>
            <span>Price</span>
          </q-item-label>
        </q-item-section>
        <q-item-section no-wrap>∇‰</q-item-section>
        <q-item-section no-wrap>
          <q-item-label :lines="1">
            <q-btn label="⇡" @click="sorttickers('quantity', true)" size="sm"/>
            <q-btn label="⇣" @click="sorttickers('quantity', false)" size="sm"/>
            <span>Quantity</span>
          </q-item-label>
        </q-item-section>
        <q-item-section no-wrap>
          <q-item-label :lines="1">
            <q-btn flat label="⇡" @click="sorttickers('volume', true)" size="sm"/>
            <q-btn flat label="⇣" @click="sorttickers('volume', false)" size="sm"/>
            <span>Volume</span>
          </q-item-label>
        </q-item-section>
        <q-item-section no-wrap>Freq.</q-item-section>
      </q-item>
      <q-item dense v-for="(t, i) in sorted" :key="t.symbol">
        <q-item-section no-wrap side>{{ i }}</q-item-section>
        <q-item-section no-wrap class="text-left">{{ t.time }}</q-item-section>
        <q-item-section no-wrap class="text-center">{{ t.symbol }}</q-item-section>
        <q-item-section no-wrap :class="t.chg.price.c" class="text-right">{{ t.price }}</q-item-section>
        <q-item-section no-wrap :class="t.chg.price.c">{{ numeral(t.chg.price.p * 1000, 2) }} ‰</q-item-section>
        <q-item-section no-wrap :class="t.chg.quantity.c" class="text-right">{{ numeral(t.quantity) }}</q-item-section>
        <q-item-section no-wrap :class="t.chg.volume.c" class="text-right">{{ numeral(t.volume) }}</q-item-section>
        <q-item-section no-wrap>{{ numeral(t.frequency, 2) }}</q-item-section>
      </q-item>
    </q-list>
    <!-- q-resize-observer @resize="calculateWidth" /-->
  </q-page>
</template>

<script>
// https://www.htmlsymbols.xyz/arrow-symbols
// import { subcribeTrades, removeTrades, isSubcribed } from 'src/helpers/Trades'
// import { loadAggTradesLastMinutes } from 'src/helpers/BinanceApi'
import Tickers from 'src/helpers/Tickers'
import Queue from 'src/helpers/Queue'
import numeral from 'numeral'

const cmp = (v, old) => {
  const d = old - v
  const p = v ? d / v : 0
  const c = d > 0 ? 'green' : d < 0 ? 'red' : ''
  return { v, d, p, c }
}

const sortby = (prop, up = true) => (a, b) => {
  if (a[prop] < b[prop]) return up ? -1 : +1
  if (a[prop] > b[prop]) return up ? +1 : -1
  return 0
}

const digits = ['0', '0.0', '0.00', '0.000', '0.0000']
export default {
  name: 'All',
  data () {
    return {
      remember: 9,
      tickersObj: null,
      queueOf: {},
      tickers: {},
      sorted: [],
      sortby: 'symbol',
      asc: false
    }
  },
  computed: {
    reorder () {
      return this.sorted.length < Object.keys(this.tickers).length
    }
  },
  components: {
  },
  watch: {
    reorder (v) {
      if (v) this.sorttickers(this.sortby, this.asc)
    }
  },
  methods: {
    sorttickers (prop, asc) {
      console.log('sorttickers')
      this.sortby = prop
      this.asc = asc
      this.sorted = Object.values(this.tickers).sort(sortby(prop, asc))
    },
    onticker (t) {
      const s = t.s
      const queue = this.queueOf[s] = this.queueOf[s] || new Queue(this.remember)
      const first = queue.pusha(t)
      const frequency = first && t.time > first.time ? this.remember * 1000 / (t.time - first.time) : 0
      const time = new Date(t.time).toLocaleTimeString()
      const last = this.tickers[s] || t
      const chg = {
        price: cmp(t.price, last.price),
        quantity: cmp(t.quantity, last.quantity),
        volume: cmp(t.volume, last.volume)
      }
      this.$set(this.tickers, s, { ...t, time, frequency, chg })
    },
    numeral (v, size = 0) {
      return numeral(v).format(digits[size])
    }
  },
  mounted () {
    const handler = t => this.onticker(t)
    this.tickersObj = new Tickers({ handler, match: /USDT$/ })
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
