<template>
  <q-page>
    <q-input v-model="filter" label="Filter" class="q-my-xs q-mx-sm"/>
    <div class="flex flex-center q-gutter-sm">
      <pair style="min-width: 150px"
        :info="pair"
        v-for="pair in selected"
        :key="pair.symbol">
      </pair>
    </div>
  </q-page>
</template>

<script>

import { mapState, mapActions } from 'vuex'
import pair from 'src/components/Pair'
// import { getCredentials } from 'src/helpers/keys'

// const compareBySymbol = (a, b) => {
//   if (a.symbol < b.symbol) return -1
//   if (a.symbol > b.symbol) return 1
//   return 0
// }

// const compare = compareBySymbol
// import cryptoicon from 'vue-cryptoicon'

export default {
  name: 'Monitor',
  data () {
    return {
      binance: null,
      filter: ''
    }
  },
  computed: {
    selected () {
      return this.pairs.filter(a => a.symbol.toLowerCase().includes(this.filter.toLowerCase()))
    },
    ...mapState('binance', ['pairs'])
  },
  components: {
    pair
  },
  methods: {
    ...mapActions('binance', ['loadPairs'])
  },
  mounted () {
    this.loadPairs()
  }
}
</script>
