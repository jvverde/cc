<template>
  <div class="col line">
    <div class="row justify-center q-mx-lg">
      <div class="col-auto q-pr-sm">{{time}}</div>
      <div class="col">{{symbol}}</div>
      <div class="col text-left" :class="alertcolor(price - lastprice)">{{price}}</div>
      <div class="col-auto q-px-sm" :class="alertcolor(chg24h)">{{numeral(chg24h).format('00.0%')}}</div>
      <div
        v-for="(c, i) in changes" :key="i"
        class="col q-px-xs"
        :class="alertcolor(c.val)"
        style="white-space:nowrap">
          {{numeral(c.val).format('0.0%')}}
          in
          {{convert(c.time)}}
        <!--span class="caption" :class="alert4color(chg1m.byhour, chg1h.val * 3600 / chg1h.time)">
          {{numeral(chg1m.byhour).format('0.0%')}}/h
        </span-->
      </div>
      <div class="col text-right" :class="alertcolor(min - lastmin)">{{min}}</div>
      <div class="col text-center">[{{numeral(range).format('0.000%')}}]</div>
      <div class="col text-left" :class="alertcolor(max - lastmax)">{{max}}</div>
      <div class="col text-right">{{numeral(volume).format('0,0')}}</div>
      <div class="col text-right">{{numeral(quote).format('0,0')}}</div>
    </div>
  </div>
</template>

<script>
import { listen, intervales } from 'src/data'
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
      changes: intervales.map(() => ({})),
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
    log (v) {
      console.log(v)
    },
    ticker (t) {
      // console.log('ticker@row:', t)
      this.lastprice = this.price
      this.price = Number(t.price)
      this.time = new Date(t.time).toLocaleTimeString()
      this.changes = t.changes
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
    convert (time) {
      const h = 0 | time / 3600
      time %= 3600
      const m = 0 | time / 60
      time %= 60
      const s = 0 | time
      if (h) return `${h}h${m}m${s}s`
      if (m) return `${m}m${s}s`
      return `${s}s`
    },
    alertcolor (v) {
      return {
        red: v < 0,
        green: v > 0
      }
    },
    alertcolor2 (v) {
      console.log(v)
      return {
        red: v < 0,
        green: v > 0
      }
    },
    alert4color (v, r) {
      return {
        purple: v < 0 && v < r,
        red: v < 0 && v >= r,
        green: v > 0 && v <= r,
        turquoise: v > 0 && v > r
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
  .purple {
    color: purple;
  }
  .turquoise {
    color: turquoise;
  }
  .caption {
    display: block;
    margin: 0;
    margin-top:-5px;
    padding: 0;
    font-size: 75%;
  }
</style>
