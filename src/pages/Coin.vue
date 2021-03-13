<template>
  <q-page class="fit row content-stretch">
    <div class="full-width q-my-md" ref="coinpage">
      <trading-vue :data="dc" :width="width" :height="height"
          ref="tradingVue"
          :title-txt="symbol"
          :overlays="overlays"
          :chart-config="{'MAX_ZOOM': 6000, 'MIN_ZOOM': 10}"
          :legend-buttons="['MAXIMUM', 'settings', 'remove']"
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
import { listen, dismiss } from 'src/helpers/stream'
import { TradingVue, DataCube } from 'trading-vue-js'
import Maximum from 'src/charts/Maximum'
import { updateMax, updateMin } from 'src/helpers/MaxMin'
import { CandleOf } from 'src/helpers/Candle'
import { zigzag } from 'src/helpers/Utils'
import MA from 'src/helpers/MovingAverage'

const data = {
  chart: {
    type: 'Candles',
    indexBased: false,
    tf: '1s',
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
    },
    {
      name: 'Split',
      type: 'Splitters',
      data: [],
      settings: {
        legend: false
      }
    },
    {
      name: 'MovingAverages',
      type: 'Splines',
      data: [],
      settings: {
        legend: false,
        'z-index': 5,
        colors: ['blue', 'cyan', 'Orchid', 'Pink', 'IndianRed', 'salmon']
      }
    },
    {
      name: 'Average',
      type: 'Spline',
      data: [],
      settings: {
        legend: false,
        'z-index': 5,
        color: 'yellow'
      }
    }
  ]
}
const settings = { auto_scroll: true }

const averages = [12, 30, 99, 300, 1000]

export default {
  name: 'coin',
  data () {
    return {
      mas: averages.map(v => new MA(v)),
      amas: [],
      stop: false,
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
      dc: new DataCube(data, settings),
      width: 800,
      height: 600,
      overlays: [Maximum]
    }
  },
  components: {
    TradingVue
  },
  computed: {
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
  watch: {
    stream: {
      immediate: true,
      async handler (val, old) {
        if (old && this.streamid.length) await dismiss(...this.streamid)
        this.streamid = await listen(this.ontrade, this.stream)
      }
    },
    symbol () {
      this.dc = new DataCube(data, settings)
      this.$refs.tradingVue.resetChart()
    }
  },
  methods: {
    ontrade (t) {
      const time = t.E
      const price = Number(t.p)
      const quote = Number(t.q)
      this.candle.insert(time, price, quote)
      const mas = this.mas.map(m => m.update(price, quote))
      this.amas.push([time, ...mas])
      // console.log(t.T, time, mas[0])
      // this.dc.merge('onchart.MovingAverages.data', [[time, ...mas]])
      // this.dc.update({
      //   MovingAverages: [...mas]
      // })
    },
    oncandle ({ o, h, l, c, v, t, T, m }) {
      const time = (t + T) / 2
      this.dc.merge('chart.data', [[time, o, h, l, c, v]])
      this.dc.merge('onchart.Average.data', [[time, m]])
      const amas = this.amas.sort((a, b) => {
        if (a[0] < b[0]) return -1
        if (a[0] > b[0]) return 1
        return 0
      }).reduce((acc, a) => {
        if (acc.length === 0 || acc[acc.length - 1][0] !== a[0]) {
          acc.push(a)
        }
        return acc
      }, [])
      this.dc.merge('onchart.MovingAverages.data', amas)
      this.amas.length = []
      const [x1, x2] = this.$refs.tradingVue.getRange()
      if (x2 < T + 100) {
        const diff = T + 100 - x2
        if (!this.stop) this.$refs.tradingVue.setRange(x1 + diff, x2 + diff)
      }
      const { max, min } = this
      this.max = updateMax({ time, price: h, max }, 30 * 24 * 3600e3)
      this.min = updateMin({ time, price: l, min }, 30 * 24 * 3600e3)

      const points = zigzag(max, min)
      this.dc.set('onchart.Maximum.data', [[T, max, min, points]])
      const now = Date.now()
      this.dc.set('onchart.Split.data', [
        [now - 1e3, '1s ago', 0, '#FF3080'],
        [now - 6e4, '1m ago', 0, '#FF80FF'],
        [now - 3e5, '5m ago', 0, '#80FFFF'],
        [now - 36e5, '1h ago', 0, '#CCFFCC']
      ])
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
    }
  },
  mounted () {
    this.$refs.tradingVue.resetChart()
    window.addEventListener('resize', this.onresize)
    console.log('sett', this.dc.sett)
    this.dc.onrange(e => console.log('onrange', e))
    this.onresize()
    this.candle = new CandleOf(1000, this.oncandle)
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
