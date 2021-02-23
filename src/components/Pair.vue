<template>
  <q-card>
    <q-list>
      <q-item dense>
        <q-item-section side>
          <cryptoicon :symbol="symbol" size="24" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{info.symbol}}</q-item-label>
          <q-item-label caption  :style="{color: color}">{{currentvalue}}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-checkbox v-model="active" dense size="xs" color="green"/>
        </q-item-section>
      </q-item>
    </q-list>
    <barline :points="showpoints" :width="width" :height="height"/>
  </q-card>
</template>

<script>
import numeral from 'numeral'
import { ticker } from 'src/helpers/wsbinance'
import barline from './Line'

const re = /(BTC|USDT|ETH|BNB|USDC|BUSD|TUSD|PAX|RUB|AUD|BIDR|BRL|DAI|NGN|EUR|USD|GBP|TRY)$/

export default {
  name: 'pair',
  data () {
    return {
      active: false,
      ticks: [],
      ticker: undefined,
      nbars: 300,
      margins: 1,
      height: 150
    }
  },
  props: {
    info: {
      type: Object,
      required: true
    }
  },
  computed: {
    symbol () { return this.info.symbol.replace(re, '').toLowerCase() },
    width () { return 2 * this.margins + this.nbars },
    showpoints () { return this.ticks.slice(-this.nbars) }, // show the last nbars
    currentvalue () {
      const index = this.ticks.length - 1
      return index >= 0 ? numeral(this.ticks[index].price).value() : ''
    },
    color () {
      const lastindex = this.ticks.length - 1
      if (lastindex < 0) return 0
      return this.ticks[lastindex].color
    }
  },
  watch: {
    active (val) {
      if (val) {
        this.ticker = ticker(this.info.symbol, r => {
          const { price, time } = r
          const lastindex = this.ticks.length
          const lastprice = lastindex > 0 ? this.ticks[lastindex - 1].price : price
          const color = lastprice === price ? 'black' : lastprice < price ? 'green' : 'red'
          this.ticks.push({ price, time, color })
        })
      } else if (ticker) {
        this.ticker.close()
      }
    }
  },
  components: {
    barline
  },
  methods: {
  },
  async mounted () {
  }
}
</script>
