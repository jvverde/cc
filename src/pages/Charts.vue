<template>
  <q-page padding class="fit relative columns">
    <div class="row">
      <q-tabs
        v-model="chart"
        class="text-teal">
        <q-route-tab v-for="(c, i) in sCharts" :key="`chart_tab_${i}`"
          :name="c"
          :label="c"
          :to="{ name: 'showchart', params: { symbol: c } }"
          class="relative-position">
          <q-btn icon="clear" round size="xs" flat color="purple"
            @click.stop="remove(c)"
            class="absolute-top-left" style="top: 0px; left: -30px"
          />
        </q-route-tab>
      </q-tabs>
    </div>
    <div>
      <router-view></router-view>
    </div>
  </q-page>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'charts',
  data () {
    return {
      chart: 'BNBUSDT',
      splitter: 10
    }
  },
  computed: {
    ...mapState('binance', ['charts', 'currentchart']),
    sCharts () { return [...this.charts] }
  },
  components: {
  },
  methods: {
    ...mapMutations('binance', ['rmChart']),
    remove (name) {
      console.log(name)
      this.rmChart(name)
    }
  },
  mounted () {
    console.log('mounted charts')
  },
  beforeDestroy () {
    console.log('Destroy charts...')
  }
}
</script>
