<template>
  <q-page padding class="fit relative columns">
    <div class="row">
      <q-tabs
        v-model="current"
        dense
        class="text-teal">
        <q-tab v-for="(c, i) in sCharts" :key="`chart_tab_${i}`"
          :name="c"
          :label="c"
          class="relative-position">
          <q-btn icon="clear" round size="xs" flat color="purple"
            @click.stop="remove(c)"
            class="absolute-top-left" style="top: 0px; left: -30px"
          />
        </q-tab>
      </q-tabs>
    </div>
    <div>
      <div v-for="c in sCharts" :key="`chart_body_${c}`">
        <chart :symbol="c"/>
      </div>
    </div>
    <router-view></router-view>
  </q-page>
</template>

<script>
import chart from './Chart'
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'charts',
  data () {
    return {
      current: ''
    }
  },
  computed: {
    ...mapState('binance', ['charts', 'currentchart']),
    sCharts () { return [...this.charts] }
  },
  components: {
    chart
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
