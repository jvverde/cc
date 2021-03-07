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
import { updateMax, updateMin } from 'src/helpers/MaxMin'
import { CandleOf } from 'src/helpers/Candle'

export default {
  name: 'coin',
  data () {
    return {
      candle: undefined,
      max: { time: -Infinity, price: -Infinity },
      min: { time: -Infinity, price: Infinity },
      low: Infinity,
      high: -Infinity,
      open: undefined,
      close: undefined,
      seconds: 0,
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
        this.streamid = await listen(this.ontrade, this.stream)
      }
    }
  },
  methods: {
    ontrade (t) {
      const time = t.E
      const price = Number(t.p)
      this.candle.insert(time, price, Number(t.q))
    },
    oncandle ({ o, h, l, c, v, time }) {
      this.dc.merge('chart.data', [[time, o, h, l, c, v]])
      const [x1, x2] = this.$refs.tradingVue.getRange()
      if (x2 < time + 1000) {
        const diff = time + 1000 - x2
        this.$refs.tradingVue.setRange(x1 + diff, x2 + diff)
      }

      const [max, min] = [this.max, this.min]
      this.max = updateMax({ time, price: h, max }, 6e4)
      this.min = updateMin({ time, price: l, min }, 6e4)

      this.dc.update({
        Maximum: [time, this.max, this.min]
      })
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
    // this.$refs.tradingVue.setRange(now - 6e4, now + 1e3)
    this.candle = new CandleOf(1000, this.oncandle)
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
