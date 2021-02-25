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
        <q-item-section side no-wrap>
          <q-btn color="red" icon="close" round dense size="xs" outline @click="$emit('close')"/>
        </q-item-section>
      </q-item>
    </q-list>
    <barline :points="showpoints" :width="width" :height="height"/>
    <q-list>
      <q-item dense>
        <q-slider v-model="scale" :step="1" :min="1" :max="20" label :label-value="`${scale}px per bar`" color="light-green"/>
      </q-item>
    </q-list>
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
      ticks: [],
      ticker: undefined,
      margins: 1,
      scale: 1
    }
  },
  props: {
    info: {
      type: Object,
      required: true
    },
    width: {
      type: Number,
      default: 300
    },
    height: {
      type: Number,
      default: 150
    }
  },
  computed: {
    symbol () { return this.info.symbol.replace(re, '').toLowerCase() },
    nbars () { return (this.width - 2 * this.margins) / this.scale | 0 },
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
  },
  components: {
    barline
  },
  methods: {
  },
  mounted () {
    this.ticker = ticker(this.info.symbol, r => {
      const { price, time } = r
      const lastindex = this.ticks.length
      const lastprice = lastindex > 0 ? this.ticks[lastindex - 1].price : price
      const color = lastprice === price ? 'black' : lastprice < price ? 'green' : 'red'
      this.ticks.push({ price, time, color })
    })
  },
  beforeDestroy () {
    if (!this.ticker) return
    this.ticker.close()
  }
}
</script>
