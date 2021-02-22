<template>
  <q-page>
    <q-input v-model="filter" label="Filter" class="q-my-xs q-mx-sm"/>
    <div class="flex flex-center q-gutter-sm">
      <pair style="min-width: 200px"
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
