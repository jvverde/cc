<template>
  <q-page class="fit row content-stretch">
    <div class="full-width q-my-md" ref="coinpage">
      <trading-vue :data="dc" :width="width" :height="height"
          ref="tradingVue"
          :title-txt="symbol"
          :overlays="overlays"
          :chart-config="{'MAX_ZOOM': 6000, 'MIN_ZOOM': 60}"
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
import { QueueZ } from 'src/helpers/Queue'

const data = {
  chart: {
    type: 'Candles',
    indexBased: false,
    tf: 1000,
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
      name: 'Realtime',
      type: 'Splines',
      data: [],
      settings: {
        legend: false,
        'z-index': 5,
        colors: ['blue', 'cyan', 'Orchid', 'Pink', 'IndianRed']
      }
    }
  ]
}
const settings = { auto_scroll: true }

class MA {
  constructor (size) {
    this.queue = new QueueZ(size)
    this.sumprod = 0
    this.quantity = 0
  }

  update (price, quote) {
    this.sumprod += price * quote
    this.quantity += quote
    const old = this.queue.rotate({ price, quote })
    if (old) {
      this.sumprod -= old.price * old.quote
      this.quantity -= old.quote
    }
    return this.sumprod / this.quantity
  }
}
const averages = [5, 25, 100, 500]
export default {
  name: 'coin',
  data () {
    return {
      mas: averages.map(v => new MA(v)),
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
    },
    symbol () {
      this.dc = new DataCube(data, settings)
    }
  },
  methods: {
    ontrade (t) {
      const time = t.E
      const price = Number(t.p)
      const quote = Number(t.q)
      this.candle.insert(time, price, quote)
      // console.log(old, this.sa20 / this.da20)
      const mas = this.mas.map(m => m.update(price, quote))
      this.dc.merge('onchart.Realtime.data', [[
        time,
        // price,
        ...mas
      ]])
      // this.dc.update({
      //   Realtime: price
      // })
    },
    oncandle ({ o, h, l, c, v, t, T }) {
      const time = (t + T) / 2
      this.dc.merge('chart.data', [[time, o, h, l, c, v]])
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
