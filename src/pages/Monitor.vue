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
          <rowheader @select="setColumnOrder"/>
        </q-item-section>
        <q-item-section side>
          <q-btn icon="none" disable flat dense size="xs" round/>
        </q-item-section>
      </q-item>
      <q-item dense v-for="(symbol, index) in order" :key="index"
        :to="{ name: 'coin', params: { symbol: symbol } }"
        clickable>
        <q-item-section>
          <row :symbol="symbol" :cb="cb(index)" :col="col"/>
        </q-item-section>
        <q-item-section side>
          <q-btn v-if="isSubcribed(index)" icon="electrical_services" color="green" outline dense size="xs" round
            @click.prevent="unsubscribe(index)"/>
          <q-btn v-else icon="electrical_services" color="red" outline dense size="xs" round
            @click.prevent="subscribe(index)"/>
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
import { subcribeTrades, removeTrades, isSubcribed } from 'src/helpers/Trades'
import { loadAggTradesLastMinutes } from 'src/helpers/BinanceApi'

export default {
  name: 'Monitor',
  data () {
    return {
      col: 0,
      n: 0,
      filter: '',
      follow: [],
      subscribed: [],
      ordermap: [],
      orderby: [],
      coins: ['BTC', 'USDT', 'ETH', 'BNB', 'USDC', 'BUSD', 'TUSD', 'PAX', 'RUB',
        'AUD', 'BIDR', 'BRL', 'DAI', 'NGN', 'EUR', 'USD', 'GBP', 'TRY'],
      restrict2coins: []
    }
  },
  computed: {
    order () {
      if (!this.orderby.length) {
        return this.follow
      } else {
        return this.orderby.map(e => e.s) // Order according the order by
      }
    },
    RE () {
      const s = this.restrict2coins.join('|.+')
      return new RegExp(`(.+${s})$`)
    },
    options () {
      const symbols = this.pairs.map(p => p.symbol).filter(s => this.RE.test(s))
      return symbols.filter(a => a.toLowerCase().includes(this.filter.toLowerCase()))
    },
    isSubcribed () {
      return index => this.subscribed.findIndex(e => e.index === index) >= 0
    },
    ...mapState('binance', ['pairs', 'watching'])
  },
  components: {
    row,
    rowheader
  },
  watch: {
    ordermap () {
      if (this.ordermap.length >= this.order.length) {
        const ordmap = [...this.ordermap].filter(e => e) // Not select possible undefined values
        if (ordmap.length >= this.order.length) { // Only after all values are defined
          this.ordermap.length = 0 // Reset ordermap
          this.orderby = ordmap.sort((a, b) => { // Now defined the order
            if (typeof a !== typeof b) return 0
            if (a.v < b.v) return -1
            if (a.v > b.v) return 1
            return 0
          })
        }
      }
    }
  },
  methods: {
    setColumnOrder (i) {
      if (i === this.col) {
        this.orderby = this.orderby.reverse()
      } else {
        this.col = i
      }
    },
    cb (i) {
      return (v) => {
        this.$set(this.ordermap, i, { v, s: this.order[i] })
      }
    },
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
    unsubscribe (index) {
      if (isSubcribed(this.follow[index])) removeTrades(this.follow[index])
      const i = this.subscribed.findIndex(e => e.index === index)
      if (i >= 0) this.subscribed.splice(i, 1)
    },
    async subscribe (index) {
      // this.subscribed.push({ index, coin: subcribeTrades(this.follow[index]) })
      const r = await loadAggTradesLastMinutes(this.follow[index], 120)
      if (subcribeTrades) console.log(r)
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
