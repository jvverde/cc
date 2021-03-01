<template>
  <q-page>
    <q-list dense>
      <q-item dense>
        <q-item-section>
          <q-select
            v-model="follow"
            label="Follow coins" stack-label dense options-dense
            autocomplete
            multiple :options="options"
            counter max-values="200"
            hint="Max 200 coins pairs"
            hide-selected
            use-input
            @filter="filterBy"
            @add="add"
            @remove="remove"
            standout="bg-light-green text-white"
            options-selected-class="options"
          />
        </q-item-section>
        <q-item-section side style="max-width:300px">
          <q-select
            v-model="restrict2coins"
            label="Trade coins" dense options-dense
            multiple
            use-chips
            :options="coins"
            hint="Limit list to trade coins"
            standout="bg-light-green text-white"
          />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <rowheader/>
        </q-item-section>
        <q-item-section side>
          <q-btn icon="none" disable flat dense size="xs" round/>
        </q-item-section>
      </q-item>
      <q-item dense v-for="(symbol, index) in order" :key="index">
        <q-item-section>
          <row :symbol="symbol"/>
        </q-item-section>
        <q-item-section side>
          <q-btn icon="close" color="negative" flat dense size="xs" round @click="removeAtIndex(index)"/>
        </q-item-section>
      </q-item>
    </q-list>
    <!-- q-resize-observer @resize="calculateWidth" /-->
  </q-page>
</template>

<script>

import { mapState, mapActions, mapMutations } from 'vuex'
import row from 'src/components/Row'
import rowheader from 'src/components/RowHeader'

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
    order () { return [...this.follow].sort() },
    RE () {
      const s = this.restrict2coins.join('|.+')
      return new RegExp(`(.+${s})$`)
    },
    options () {
      const symbols = this.pairs.map(p => p.symbol).filter(s => this.RE.test(s))
      return symbols.filter(a => a.toLowerCase().includes(this.filter.toLowerCase()))
    },
    ...mapState('binance', ['pairs', 'watching'])
  },
  components: {
    row,
    rowheader
  },
  watch: {
  },
  methods: {
    filterBy (val, update) {
      update(() => {
        this.filter = val
      })
    },
    add (details) {
      this.watch(details.value)
    },
    remove (details) {
      this.forget(details.value)
    },
    removeAtIndex (index) {
      this.follow.splice(index, 1)
    },
    ...mapMutations('binance', ['watch', 'forget']),
    ...mapActions('binance', ['loadPairs'])
  },
  mounted () {
    this.loadPairs()
    this.follow = [...this.watching]
    // await bstream.subscribe('bnbusdt@ticker' /*, 'btcusdt@ticker', 'ltcusdt@ticker', 'ethusdt@ticker', 'adausdt@ticker' */)
  }
}
</script>
<style lang="scss">
  .options {
    background-color: light-gray;
    color:green;
    border: 1px solid green;
  }
</style>
