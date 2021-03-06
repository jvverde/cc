<template>
  <q-page class="fit row content-stretch">
    <div class="full-width q-my-md" :ref="cp_ref">
      <trading-vue
          :ref="tv_ref"
          :data="dc"
          :width="width"
          :height="height"
          :title-txt="symbol"
          :overlays="overlays"
          :chart-config="{'MAX_ZOOM': 6000, 'MIN_ZOOM': 100}"
          :legend-buttons="['settings', 'remove']"
          @legend-button-click="legend"
          :color-back="colors.colorBack"
          :color-grid="colors.colorGrid"
          :color-text="colors.colorText">
      </trading-vue>
      <q-btn class="q-mt-sm" color="brown" size="xs" label="Start/Stop" icon="pause" rounded @click="startstop"/>
    </div>
    <tfselector class="tfselector" @selected="changeTF"/>
    <colorname :select.sync="changecolors" :names.sync="colors4emas" :min="maverages.length"/>
    <q-resize-observer @resize="onresize" />
  </q-page>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { TradingVue, DataCube } from 'trading-vue-js'
import Maximum from 'src/charts/Maximum'
import data from 'src/charts/data'
// import { CandleOfTrades } from 'src/helpers/Candle'
import colorname from 'src/components/ColorName'
import tfselector from 'src/components/TFselector'
import Kline from 'src/api/Kline'

const settings = { auto_scroll: true }

export default {
  name: 'chart',
  data () {
    return {
      changecolors: false,
      candle: undefined,
      stop: false,
      dc: new DataCube(data(), settings),
      width: 800,
      height: 600,
      overlays: [Maximum]
    }
  },
  components: {
    TradingVue,
    colorname,
    tfselector
  },
  computed: {
    ...mapState('binance', ['maverages', 'emacolors']),
    funds () { return this.money + this.lastm * this.asset },
    stream () { return this.symbol.toLowerCase() + '@aggTrade' },
    colors () {
      return this.night ? {} : {
        colorBack: '#fff',
        colorGrid: '#eee',
        colorText: '#333'
      }
    },
    colors4emas: {
      get () { return this.emacolors },
      set (v) {
        this.setEmacolors(v)
        if (v && v.length >= this.maverages.length) {
          this.applyEmaColors()
        }
      }
    },
    tv_ref () { return `tradingVue_${this.symbol}` },
    cp_ref () { return `coinpage_${this.symbol}` },
    tv () { return this.$refs[this.tv_ref] },
    cp () { return this.$refs[this.cp_ref] }
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
  },
  methods: {
    ...mapMutations('binance', ['setEmacolors']),
    oncandle ({ o, h, l, c, v, t, T, m, time, max, min, zigzag, emas }) {
      this.dc.merge('chart.data', [[time, o, h, l, c, v]])
      // this.dc.merge('onchart.Average.data', [[time, m]])
      // this.dc.merge('onchart.MovingAverages.data', [[time, ...mas]])
      this.dc.merge('onchart.ExponentialMovingAverages.data', [[time, ...emas]])
      this.dc.set('onchart.Maximum.data', [[time, max, min, zigzag]])
      const [x1, x2] = this.tv.getRange()
      if (!this.stop && x2 < time + 100) {
        const diff = time + 100 - x2
        this.tv.setRange(x1 + diff, x2 + diff)
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
        p1: [now - 36e5, b],
        p2: [now + 1e3, b]
      })

      this.dc.merge('onchart.CostSell.settings', {
        p1: [now - 36e5, s],
        p2: [now + 1e3, s]
      })
    },
    onresize () {
      try {
        this.width = this.cp.clientWidth
        this.height = this.cp.clientHeight - 36
      } catch (e) {
        console.warn('Rezise', e)
      }
    },
    startstop (e) {
      this.stop = !this.stop
    },
    legend (e) {
      console.log('Event', e)
      if (e.button === 'settings' && e.type === 'onchart') {
        const data = this.dc.data.onchart[e.dataIndex]
        this.color4emas = data.settings.colors
        this.changecolors = true
      }
    },
    applyEmaColors () {
      this.dc.set('onchart.ExponentialMovingAverages.settings', {
        colors: this.colors4emas
      })
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
    },
    changeTF (interval) {
      console.log('period', interval)
      if (this.kline) this.kline.dismiss()
      this.dc.set('chart.data', [])
      this.dc.set('chart.tf', interval)
      this.dc.set('onchart.ExponentialMovingAverages.data', [])
      this.dc.set('onchart.Maximum.data', [])
      const maverages = this.maverages
      this.kline = new Kline(this.symbol, {
        interval,
        maverages,
        handler: k => this.oncandle(k)
      })
    }
  },
  mounted () {
    console.log('Mount', this.$props.symbol)
    this.dc.onrange(e => console.log('onrange', e))
    this.onresize()
    window.addEventListener('resize', this.onresize)
    // const maverages = this.maverages
    // const { queue, candle } = subcribeEnqueueCandles(this.symbol, { maverages, minago: 240 })
    // const handler = c => this.oncandle(c)
    // this.candle = new CandleOfTrades(this.symbol, handler, { maverages, minago: 60 })
    // this.init([...queue])
    // this.candle = candle
    // this.handlerid = candle.addHandler(c => this.oncandle(c))
    this.applyEmaColors()
  },
  beforeDestroy () {
    console.log('destroy...')
    window.removeEventListener('resize', this.onresize)
    if (this.kline) this.kline.dismiss()
    // this.candle.delHandler(this.handlerid)
    // this.candle.dismiss()
  }
}
</script>

<style scoped lang="scss">
  .tfselector {
    position: absolute;
    top: 1em;
    right: 10em;
  }
</style>
