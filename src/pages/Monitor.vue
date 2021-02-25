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
            counter max-values="20"
            hint="Max 20 coins pairs"
            use-chips
            use-input
            @filter="filterBy"
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
    <div class="flex flex-center q-gutter-sm" ref="monitorpage">
      <pair :style="`min-width: ${pairwidth}px; min-height: ${pairheight}px `"
        :info="pair"
        :width="pairwidth"
        :height="pairheight"
        @close="closed(pair.symbol)"
        v-for="pair in selected"
        :key="pair.symbol">
      </pair>
    </div>
    <q-resize-observer @resize="calculateWidth" />
  </q-page>
</template>

<script>

import { mapState, mapActions } from 'vuex'
import pair from 'src/components/Pair'
// import { getCredentials } from 'src/helpers/keys'

export default {
  name: 'Monitor',
  data () {
    return {
      binance: null,
      width: 0,
      filter: '',
      columns: 3,
      aspect: 2 / 3,
      follow: [],
      coins: ['BTC', 'USDT', 'ETH', 'BNB', 'USDC', 'BUSD', 'TUSD', 'PAX', 'RUB',
        'AUD', 'BIDR', 'BRL', 'DAI', 'NGN', 'EUR', 'USD', 'GBP', 'TRY'],
      restrict2coins: []
    }
  },
  computed: {
    indexed () {
      const hash = {}
      for (const p of this.pairs) {
        hash[p.symbol] = p
      }
      return hash
    },
    selected () {
      return this.follow.map(s => this.indexed[s])
    },
    RE () {
      const s = this.restrict2coins.join('|.+')
      return new RegExp(`(.+${s})$`)
    },
    options () {
      const symbols = this.pairs.map(p => p.symbol).filter(s => this.RE.test(s))
      return symbols.filter(a => a.toLowerCase().includes(this.filter.toLowerCase()))
    },
    pairwidth () { return 0.95 * this.width / this.columns | 0 },
    pairheight () { return this.aspect * this.pairwidth },
    ...mapState('binance', ['pairs'])
  },
  components: {
    pair
  },
  watch: {
  },
  methods: {
    ...mapActions('binance', ['loadPairs']),
    calculateWidth () {
      this.width = this.$refs.monitorpage.clientWidth
    },
    filterBy (val, update) {
      update(() => {
        this.filter = val
      })
    },
    closed (symbol) {
      const i = this.follow.indexOf(symbol)
      if (i < 0) return
      this.follow.splice(i, 1)
    }
  },
  mounted () {
    this.loadPairs()
    this.calculateWidth()
  }
}
</script>
