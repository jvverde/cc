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
            dense
            class="text-teal"
          >
            <q-tab v-for="(c, i) in charts" :key="`chart_tab_${i}`" :name="c" :label="c"/>
          </q-tabs>
        </div>
      </template>

      <template v-slot:after>
        <div class="columns no-wrap full-height">
          <q-tab-panels
            v-model="chart"
            animated
            vertical
            keep-alive
            transition-prev="jump-up"
            transition-next="jump-up"
          >
            <q-tab-panel v-for="(c, i) in charts" :key="`chart_tab_panel_${i}`" :name="c">
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
import { mapState } from 'vuex'

export default {
  name: 'charts',
  data () {
    return {
      chart: 'BNBUSDT',
      splitter: 6
    }
  },
  computed: {
    ...mapState('binance', ['charts', 'currentchart'])
  },
  components: {
    chart
  },
  beforeDestroy () {
    console.log('Destroy charts...')
  }
}
</script>
