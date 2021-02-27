<template>
  <q-page>
    <q-list>
      <q-item dense>
        <q-item-section>
          <q-select
            v-model="follow"
            label="Follow coins" stack-label dense options-dense
            autocomplete
            multiple :options="options"
            counter max-values="200"
            hint="Max 200 coins pairs"
            use-chips
            use-input
            @filter="filterBy"
            @add="add"
            @remove="remove"
            standout="bg-teal text-white"
          />
        </q-item-section>
        <q-item-section side style="max-width:300px">
          <q-select
            v-model="restrict2coins"
            label="Trade coins" dense options-dense
            multiple
            use-chips
            :options="coins"
            clearance
            hint="Limit list to trade coins"
            standout="bg-teal text-white"
          />
        </q-item-section>
      </q-item>
    </q-list>
    <div class="full-width q-gutter-xs">
      <row v-for="(symbol, index) in names" :key="index" :symbol="symbol"/>
    </div>
    <!-- q-resize-observer @resize="calculateWidth" /-->
  </q-page>
</template>

<script>

import { mapState, mapActions } from 'vuex'
import row from 'src/components/Row'
import Stream from 'src/helpers/stream'

const bstream = new Stream()

export default {
  name: 'Monitor',
  data () {
    return {
      filter: '',
      follow: [],
      coins: ['BTC', 'USDT', 'ETH', 'BNB', 'USDC', 'BUSD', 'TUSD', 'PAX', 'RUB',
        'AUD', 'BIDR', 'BRL', 'DAI', 'NGN', 'EUR', 'USD', 'GBP', 'TRY'],
      restrict2coins: []
    }
  },
  computed: {
    RE () {
      const s = this.restrict2coins.join('|.+')
      return new RegExp(`(.+${s})$`)
    },
    options () {
      const symbols = this.pairs.map(p => p.symbol).filter(s => this.RE.test(s))
      return symbols.filter(a => a.toLowerCase().includes(this.filter.toLowerCase()))
    },
    ...mapState('binance', ['symbols', 'pairs']),
    names () { return Object.keys(this.symbols) }
  },
  components: {
    row
  },
  watch: {
  },
  methods: {
    filterBy (val, update) {
      update(() => {
        this.filter = val
      })
    },
    async add (details) {
      const ticker = details.value.toLowerCase() + '@ticker'
      console.log('add', ticker)
      await bstream.subscribe(ticker)
    },
    async remove (details) {
      const ticker = details.value.toLowerCase() + '@ticker'
      console.log('remove', ticker)
      await bstream.unsubscribe(ticker)
    },
    ...mapActions('binance', ['loadPairs'])
  },
  mounted () {
    this.loadPairs()
    // await bstream.subscribe('bnbusdt@ticker' /*, 'btcusdt@ticker', 'ltcusdt@ticker', 'ethusdt@ticker', 'adausdt@ticker' */)
  }
}
</script>
