<template>
  <div class="row justify-center q-mx-lg">
    <div class="col">{{time}}</div>
    <div class="col">{{symbol}}</div>
    <div class="col" :class="alertcolor(price - lastprice)">{{price}}</div>
    <div class="col text-right" :class="alertcolor(chg24h)">{{numeral(chg24h).format('00.0%')}}</div>
    <div class="col text-right" :class="alertcolor(min - lastmin)">{{min}}</div>
    <div class="col text-center">[{{numeral(range).format('0.000%')}}]</div>
    <div class="col text-left" :class="alertcolor(max - lastmax)">{{max}}</div>
    <div class="col text-right">{{numeral(volume).format('0,0')}}</div>
    <div class="col text-right">{{numeral(quote).format('0,0')}}</div>
  </div>
</template>

<script>
import { listen } from 'src/data'
import numeral from 'numeral'

export default {
  name: 'row',
  data () {
    return {
      price: 0,
      lastprice: 0,
      max: -Infinity,
      lastmax: -Infinity,
      min: Infinity,
      lastmin: Infinity,
      time: '',
      chg24h: 0,
      volume: 0,
      quote: 0
    }
  },
  props: {
    symbol: {
      type: String,
      required: true
    }
  },
  watch: {
  },
  components: {
  },
  computed: {
    range () {
      const { min, max } = this
      return (max - min) / (max + min) * 2
    }
  },
  methods: {
    ticker (t) {
      // console.log('ticker@row:', t)
      this.lastprice = this.price
      this.price = Number(t.price)
      this.time = new Date(t.time).toLocaleTimeString()
      this.chg24h = (t.c - t.o) / t.o
      this.volume = t.v
      this.quote = t.q
      this.lastmax = this.max
      this.max = t.max.price
      this.lastmin = this.min
      this.min = t.min.price
    },
    numeral (v) {
      return numeral(v)
    },
    alertcolor (v) {
      return {
        red: v < 0,
        green: v > 0
      }
    }
  },
  mounted () {
    console.log('Install handler for', this.symbol)
    listen(this.symbol, this.ticker)
  },
  beforeDestroy () {
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
