<template>
  <q-page class="fit row content-stretch">
    <div class="full-width q-my-md" ref="coinpage">
      <trading-vue :data="dc" :width="width" :height="height"
          ref="tradingVue"
          :title-txt="symbol"
          :overlays="overlays"
          :chart-config="{'MAX_ZOOM': 6000, 'MIN_ZOOM': 10}"
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
import { TradingVue, DataCube } from 'trading-vue-js'
import Maximum from 'src/charts/Maximum'
import { CandleOfTrades } from 'src/helpers/Candle'

const data = () => {
  return {
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
          colors: ['blue', 'cyan', 'Orchid', 'Pink', 'IndianRed', 'salmon', 'DarkSalmon', 'LightSalmon']
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
      },
      {
        name: 'CostBuy',
        type: 'Segment',
        data: [],
        settings: {
          legend: false,
          'z-index': 10,
          color: 'lime'
        }
      },
      {
        name: 'CostSell',
        type: 'Segment',
        data: [],
        settings: {
          legend: false,
          'z-index': 10,
          color: 'Coral'
        }
      }
    ],
    offchart: [
      {
        name: 'Funds',
        type: 'Spline',
        data: [],
        settings: {
          legend: false,
          'z-index': 5,
          color: 'purple'
        }
      }
    ]
  }
}

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
  watch: {
    symbol () {
      this.dc = new DataCube(data, settings)
      this.$refs.tradingVue.resetChart()
    }
  },
  methods: {
    oncandle ({ o, h, l, c, v, t, T, m, time, max, min, zigzag, mas, histogram }) {
      this.dc.merge('chart.data', [[time, o, h, l, c, v]])
      this.dc.merge('onchart.Average.data', [[time, m]])
      this.dc.merge('onchart.MovingAverages.data', [[time, ...mas]])
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

      // histogram.ups.forEach(e => console.log('ups', e.i, ' => ', e.v))
      // histogram.downs.forEach(e => console.log('downs', e.i, ' => ', e.v))
      /*
      const [, , , , m300, mlimit] = mas

      const sell = () => {
        this.money = this.asset * m * 0.9985
        this.asset = 0
        this.presell = this.prebuy = this.buy = 0
        console.log('Sell', this.money, '@', m, new Date(time).toLocaleTimeString(), ama)
      }
      if (this.money > 0) {
        if (m > m300 && m > this.lastm && m * 1.003 < mlimit) {
          if (++this.prebuy >= 3) this.buy = true
          else this.buy = false
        } else {
          this.prebuy = 0
        }
        if (this.buy) {
          this.asset = this.money * 0.9985 / m
          this.buyprice = m
          this.money = 0
          this.presell = this.prebuy = this.sell = 0
          console.log('Buy', this.asset, '@', m, new Date(time).toLocaleTimeString())
        }
      } else if (this.asset > 0) {
        if (m < m300 && m < this.lastm) {
          if (++this.presell >= 3) this.sell = true
          else this.sell = false
        } else {
          this.presell = this.sell = 0
        }
        if (this.sell && m > this.buyprice * 1.003) {
          console.log('Sell with profig', (m - this.buyprice) * this.asset)
          sell()
        } else if (this.buyprice > m * 1.02) {
          console.log('Limit loss to 2%')
          sell()
        }
      }
      this.lastm = m
      this.dc.update({
        Funds: this.funds
      }) */
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
    console.log('Mount', this.symbol)
    this.candle = new CandleOfTrades(this.symbol, (c) => this.oncandle(c))
    this.dc.onrange(e => console.log('onrange', e))
    this.onresize()
    window.addEventListener('resize', this.onresize)
  },
  beforeDestroy () {
    console.log('destroy...')
    this.candle.dismiss()
    window.removeEventListener('resize', this.onresize)
  }
}
</script>

<style scoped lang="scss">
</style>
