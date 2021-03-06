<template>
  <q-page class="fit row content-stretch">
    <div class="full-width q-my-md" ref="coinpage">
      <trading-vue :data="dc" :width="width" :height="height"
          ref="tradingVue"
          :overlays="overlays"
          :color-back="colors.colorBack"
          :color-grid="colors.colorGrid"
          :color-text="colors.colorText">
      </trading-vue>
    </div>
    <q-resize-observer @resize="onresize" />
  </q-page>
</template>

<script>
import { listen, dismiss } from 'src/helpers/stream'
import { TradingVue, DataCube } from 'trading-vue-js'
import Maximum from 'src/charts/Maximum'

export default {
  name: 'coin',
  data () {
    return {
      low: Infinity,
      high: -Infinity,
      open: undefined,
      close: undefined,
      sec: 0,
      volume: 0,
      start: new Date().getTime(),
      streamid: [],
      dc: new DataCube({
        chart: {
          type: 'Candles',
          indexBased: false,
          // tf: 6000,
          data: []
        },
        onchart: [
          {
            name: 'Maximum',
            type: 'MAXIMUM',
            data: [],
            settings: {
              'z-index': 5
            }
          }
        ]
      }, {
        auto_scroll: true
      }),
      width: 800,
      height: 600,
      colors: {
        colorBack: '#fff',
        colorGrid: '#eee',
        colorText: '#333'
      },
      overlays: [Maximum]
    }
  },
  components: {
    TradingVue
  },
  computed: {
    stream () { return this.symbol.toLowerCase() + '@aggTrade' }
  },
  props: {
    symbol: {
      type: String,
      required: true
    }
  },
  watch: {
    stream: {
      immediate: true,
      async handler (val, old) {
        if (old && this.streamid.length) await dismiss(...this.streamid)
        this.streamid = await listen(this.trades, this.stream)
      }
    }
  },
  methods: {
    trades (t) {
      const p = Number(t.p)
      if (this.low > p) this.low = p
      if (this.high < p) this.high = p
      if (this.open === undefined) this.open = p
      this.volume += Number(t.q)
      const sec = 0 | t.E / 1000
      if (this.sec < sec) {
        this.close = p
        this.sec = sec
        this.showcandle()
        this.volume = 0
        this.open = undefined
        this.low = Infinity
        this.high = -Infinity
      }
    },
    showcandle () {
      const time = this.sec * 1000
      this.dc.merge('chart.data', [[time, this.open, this.high, this.low, this.close, this.volume]])
      const [x1, x2] = this.$refs.tradingVue.getRange()
      if (x2 < time) {
        const diff = time - x2
        this.$refs.tradingVue.setRange(x1 + diff, x2 + diff)
      }

      // this.dc.update({
      //   candle: [time, this.open, this.high, this.low, this.close, this.volume]
      // })
    },
    onresize () {
      this.width = this.$refs.coinpage.clientWidth
      this.height = this.$refs.coinpage.clientHeight - 36
    }
  },
  mounted () {
    window.addEventListener('resize', this.onresize)
    console.log('sett', this.dc.sett)
    this.dc.onrange(e => console.log('onrange', e))
    this.onresize()
    // const now = Date.now()
    // const pass = now - 6e4
    // this.$refs.tradingVue.setRange(pass, now)
  },
  beforeDestroy () {
    console.log('destroy...')
    if (this.streamid) dismiss(...this.streamid)
    window.removeEventListener('resize', this.onresize)
  }
}
</script>

<style scoped lang="scss">
</style>
