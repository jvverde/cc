<template>
  <q-page>
    <q-list dense>
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
        <!--q-item-section no-wrap side @click="sortby='emas2.4'; asc=false">+3.0e+4</q-item-section>
        <q-item-section no-wrap side @click="sortby='emas2.5'; asc=false">+3.0e+5</q-item-section>
        <q-item-section no-wrap side @click="sortby='emas2.6'; asc=false">+3.0e+6</q-item-section-->
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
        <!--q-item-section no-wrap side>{{ expo(t.emas2[4]) }}</q-item-section>
        <q-item-section no-wrap side>{{ expo(t.emas2[5]) }}</q-item-section>
        <q-item-section no-wrap side>{{ expo(t.emas2[6]) }}</q-item-section-->
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
import { MA } from 'src/helpers/MovingAverage'
// import { AVERAGES } from 'src/config'

const cmp = (v, old) => {
  const d = v - old
  const p = old !== 0 ? d / old : 0
  const c = d > 0 ? 'green' : d < 0 ? 'red' : ''
  return { v, d, p, c }
}

const sortby = (prop, up = true) => (a, b) => {
  if (up === 1) return 0
  const path = prop.split('.')
  const x = path.reduce((a, v) => a[v], a)
  const y = path.reduce((a, v) => a[v], b)
  if (x < y) return up ? -1 : +1
  if (x > y) return up ? +1 : -1
  return 0
}

const digits = ['0', '0.0', '0.00', '0.000', '0.0000', '0.00000', '0.000000', '0.0000000']
export default {
  name: 'All',
  data () {
    return {
      remember: 9,
      tickersObj: null,
      queueOf: {},
      tickers: {},
      emasOf: {},
      sortby: 'symbol',
      asc: false,
      maverages: [3, 5, 9, 21]
    }
  },
  computed: {
    byorder () {
      return Object.values(this.tickers).sort(sortby(this.sortby, this.asc))
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
      const emas4price = this.emasOf[s] = this.emasOf[s] || this.maverages.map(v => new MA(v))
      const emas2 = emas4price.map(e => 1000 * e.update(chg.price.p))

      const mchg = [...queue].map(e => e.chg.price.p).reduce((a, v) => a + v, 0) / this.remember

      const tc = { ...t, chg, mchg }
      const first = queue.pusha(tc)
      const frequency = first && t.time > first.time ? this.remember * 1000 / (t.time - first.time) : 0
      const time = new Date(t.time).toLocaleTimeString()
      const vemas = t.emas.map(m => m !== 0 ? 1000 * (t.price - m) / m : 0)
      this.$set(this.tickers, s, { ...tc, frequency, time, emas2, vemas })
    },
    numeral (v, size = 0) {
      return numeral(v).format(digits[size])
    },
    expo (v, size) {
      return numeral(v).format('+0.0e+0')
    }
  },
  mounted () {
    const handler = t => this.onticker(t)
    this.tickersObj = new Tickers({ handler, match: /(?<!DOWN|UP)USDT$/ })
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
