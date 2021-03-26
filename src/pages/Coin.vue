<template>
  <q-page class="fit row content-stretch">
    <div class="full-width q-my-md" ref="coinpage">
      <trading-vue
          ref="tradingVue"
          :data="dc"
          :width="width"
          :height="height"
          :title-txt="symbol"
          :overlays="overlays"
          :chart-config="{'MAX_ZOOM': 6000, 'MIN_ZOOM': 100}"
          :legend-buttons="['settings', 'remove']"
          @legend-button-click="startstop"
          :color-back="colors.colorBack"
          :color-grid="colors.colorGrid"
          :color-text="colors.colorText">
      </trading-vue>
      <q-btn class="q-mt-sm" color="brown" size="xs" label="Start/Stop" icon="pause" rounded @click="startstop"/>
    </div>
    <q-resize-observer @resize="onresize" />
  </q-page>
</template>

<script>
import { mapState } from 'vuex'
import { TradingVue, DataCube } from 'trading-vue-js'
import Maximum from 'src/charts/Maximum'
import data from 'src/charts/data'
import { subcribeEnqueueCandles } from 'src/helpers/Candle'

const settings = { auto_scroll: true }

export default {
  name: 'coin',
  data () {
    return {
      candle: undefined,
      stop: false,
      dc: new DataCube(data(), settings),
      width: 800,
      height: 600,
      overlays: [Maximum]
    }
  },
  components: {
    TradingVue
  },
  computed: {
    ...mapState('binance', ['maverages']),
    funds () { return this.money + this.lastm * this.asset },
    stream () { return this.symbol.toLowerCase() + '@aggTrade' },
    colors () {
      return this.night ? {} : {
        colorBack: '#fff',
        colorGrid: '#eee',
        colorText: '#333'
      }
    }
  },
  props: {
    symbol: {
      type: String,
      required: true
    },
    night: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    oncandle ({ o, h, l, c, v, t, T, m, time, max, min, zigzag, emas, histogram }) {
      this.dc.merge('chart.data', [[time, o, h, l, c, v]])
      this.dc.merge('onchart.Average.data', [[time, m]])
      // this.dc.merge('onchart.MovingAverages.data', [[time, ...mas]])
      this.dc.merge('onchart.ExponentialMovingAverages.data', [[time, ...emas]])
      this.dc.set('onchart.Maximum.data', [[T, max, min, zigzag]])

      const [x1, x2] = this.$refs.tradingVue.getRange()
      if (!this.stop && x2 < T + 100) {
        const diff = T + 100 - x2
        this.$refs.tradingVue.setRange(x1 + diff, x2 + diff)
      }

      const now = Date.now()
      this.dc.set('onchart.Split.data', [
        [now - 1e3, '1s ago', 0, '#FF3080'],
        [now - 6e4, '1m ago', 0, '#FF80FF'],
        [now - 3e5, '5m ago', 0, '#80FFFF'],
        [now - 36e5, '1h ago', 0, '#CCFFCC']
      ])

      const b = m * 1.00075
      const s = m * 0.99925

      this.dc.merge('onchart.CostBuy.settings', {
        p1: [now - 60e3, b],
        p2: [now + 1e3, b]
      })

      this.dc.merge('onchart.CostSell.settings', {
        p1: [now - 60e3, s],
        p2: [now + 1e3, s]
      })
    },
    onresize () {
      try {
        this.width = this.$refs.coinpage.clientWidth
        this.height = this.$refs.coinpage.clientHeight - 36
      } catch (e) {
        console.warn('Rezise', e)
      }
    },
    startstop (e) {
      console.log('Event', e)
      this.stop = !this.stop
    },
    init (candles) {
      const chart = []
      const _m = []
      // const _mas = []
      const _emas = []
      const maxmin = []
      for (const candle of candles) {
        // const { o, h, l, c, v, t, T, m, time, max, min, zigzag, mas, emas, histogram } = c
        const { time, o, h, l, c, v, m, emas, T, max, min, zigzag } = candle
        chart.push([time, o, h, l, c, v])
        _m.push([time, m])
        // _mas.push([time, ...mas])
        _emas.push([time, ...emas])
        maxmin[0] = [T, max, min, zigzag]
      }
      this.dc.set('chart.data', chart)
      this.dc.set('onchart.Average.data', _m)
      // this.dc.set('onchart.MovingAverages.data', _mas)
      this.dc.set('onchart.ExponentialMovingAverages.data', _emas)
      this.dc.set('onchart.Maximum.data', maxmin)
    }
  },
  mounted () {
    console.log('Mount', this.$props.symbol)
    this.dc.onrange(e => console.log('onrange', e))
    this.onresize()
    window.addEventListener('resize', this.onresize)
    const maverages = this.maverages
    const { queue, candle } = subcribeEnqueueCandles(this.symbol, { maverages })
    this.init([...queue])
    this.candle = candle
    this.handlerid = candle.addHandler(c => this.oncandle(c))
  },
  beforeDestroy () {
    console.log('destroy...')
    window.removeEventListener('resize', this.onresize)
    this.candle.delHandler(this.handlerid)
  }
}
</script>

<style scoped lang="scss">
</style>
