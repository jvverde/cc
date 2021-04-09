<template>
  <q-page padding class="fit relative">
    <q-splitter
      v-model="splitter"
      style="flex-grow: 1"
      class="full-height"
      :limits="[5, 30]"
    >

      <template v-slot:before>
        <div class="columns no-wrap full-height">
          <q-tabs
            v-model="chart"
            vertical
            den-se
            class="text-teal"
          >
            <q-tab v-for="(c, i) in sCharts" :key="`chart_tab_${i}`" :name="c" :label="c" class="relative-position">
              <q-btn icon="clear" round size="xs" flat color="purple"
                @click.stop="remove(c)"
                class="absolute-top-left" style="top: 0px; left: -30px"
              />
            </q-tab>
          </q-tabs>
        </div>
      </template>

      <template v-slot:after>
        <div class="columns no-wrap full-height">
          <q-tab-panels
            v-model="chart"
            vertical
            keep-alive
          >
            <q-tab-panel v-for="(c, i) in sCharts" :key="`chart_tab_panel_${i}`" :name="c">
              <chart :symbol="c"/>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </template>

    </q-splitter>
  </q-page>
</template>

<script>
import chart from './Chart'
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
