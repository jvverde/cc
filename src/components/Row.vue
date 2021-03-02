<template>
  <div class="col line">
    <div class="row justify-center q-mx-lg">
      <div class="col">{{time}}</div>
      <div class="col">{{symbol}}</div>
      <div class="col" :class="alertcolor(price - lastprice)">{{price}}</div>
      <div class="col text-right" :class="alertcolor(chg24h)">{{numeral(chg24h).format('0.0%')}}</div>
      <div class="col text-right">
        <span :class="alertcolor(chg1m.val)">{{numeral(chg1m.val).format('0.0%')}}</span>@<span>{{chg1m.time}}s</span>
        <span class="caption" :class="alert4color(chg1m.byhour, chg1h.val * 3600 / chg1h.time)">
          {{numeral(chg1m.byhour).format('0.0%')}}/h
        </span>
      </div>
      <div class="col text-right">
        <span :class="alertcolor(chg5m.val)">{{numeral(chg5m.val).format('0.0%')}}</span>@<span>{{chg5m.time}}s</span>
        <span class="caption" :class="alert4color(chg5m.byhour, chg1h.val * 3600 / chg1h.time)">
          {{numeral(chg5m.byhour).format('0.0%')}}/h
        </span>
      </div>
      <div class="col text-right">
        <span :class="alertcolor(chg15m.val)">{{numeral(chg15m.val).format('0.0%')}}</span>@<span>{{chg15m.time}}s</span>
        <span class="caption" :class="alert4color(chg15m.byhour, chg1h.val * 3600 / chg1h.time)">
          {{numeral(chg15m.byhour).format('0.0%')}}/h
        </span>
      </div>
      <div class="col text-right">
        <span :class="alertcolor(chg30m.val)">{{numeral(chg30m.val).format('0.0%')}}</span>@<span>{{chg30m.time}}s</span>
        <span class="caption" :class="alert4color(chg30m.byhour, chg1h.val * 3600 / chg1h.time)">
          {{numeral(chg30m.byhour).format('0.0%')}}/h
        </span>
      </div>
      <div class="col text-right">
        <span :class="alertcolor(chg1h.val)">{{numeral(chg1h.val).format('0.0%')}}</span>@<span>{{chg1h.time}}s</span>
        <span class="caption" :class="alert4color(chg1m.byhour, chg1h.val * 3600 / chg1h.time)">
          {{numeral(chg1h.byhour).format('0.0%')}}/h
        </span>
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
      chg: 0,
      chg24h: 0,
      chg1m: 0,
      chg5m: 0,
      chg15m: 0,
      chg30m: 0,
      chg1h: 0,
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
      this.chg1m = t.chg1m
      this.chg5m = t.chg5m
      this.chg15m = t.chg15m
      this.chg30m = t.chg30m
      this.chg1h = t.chg1h
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
