<template>
  <q-card>
    <q-list>
      <q-item dense>
        <q-item-section side>
          <cryptoicon :symbol="symbol" size="24" />
        </q-item-section>
        <q-item-section>
          {{info.symbol}}
        </q-item-section>
        <q-item-section side>
          <q-checkbox v-model="active" dense size="xs" color="green"/>
        </q-item-section>
      </q-item>
    </q-list>
    <barline :points="ticks"/>
  </q-card>
</template>

<script>
import { ticker } from 'src/helpers/wsbinance'
import barline from './Line'

const re = /(BTC|USDT|ETH|BNB|USDC|BUSD|TUSD|PAX|RUB|AUD|BIDR|BRL|DAI|NGN|EUR|USD|GBP|TRY)$/

export default {
  name: 'pair',
  data () {
    return {
      active: false,
      ticks: [],
      ticker: undefined
    }
  },
  props: {
    info: {
      type: Object,
      required: true
    }
  },
  computed: {
    symbol () {
      return this.info.symbol.replace(re, '').toLowerCase()
    }
  },
  watch: {
    active (val) {
      if (val) {
        this.ticker = ticker(this.info.symbol, r => {
          console.log(r)
          const { price, time } = r
          this.ticks.push({ price, time })
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
    connect () {
    }
  },
  async mounted () {
  }
}
</script>
