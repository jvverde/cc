<template>
  <q-page>
    <q-input v-model="filter" label="Filter" class="q-my-xs q-mx-sm"/>
    w:{{width}}, {{pairwidth}}
    <div class="flex flex-center q-gutter-sm" ref="monitorpage">
      <pair :style="`min-width: ${pairwidth}px; min-height: ${pairheight}px `"
        :info="pair"
        :width="pairwidth"
        :height="pairheight"
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
      filter: '',
      width: 0,
      columns: 3,
      aspect: 2 / 3
    }
  },
  computed: {
    selected () {
      return this.pairs.filter(a => a.symbol.toLowerCase().includes(this.filter.toLowerCase()))
    },
    pairwidth () { return 0.95 * this.width / this.columns | 0 },
    pairheight () { return this.aspect * this.pairwidth },
    ...mapState('binance', ['pairs'])
  },
  components: {
    pair
  },
  methods: {
    ...mapActions('binance', ['loadPairs']),
    calculateWidth () {
      this.width = this.$refs.monitorpage.clientWidth
    }
  },
  mounted () {
    this.loadPairs()
    console.log(this.$refs.monitorpage)
    this.calculateWidth()
  }
}
</script>
