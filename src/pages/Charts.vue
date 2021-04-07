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
            <q-tab name="BNBUSDT" label="BNBUSDT" />
            <q-tab name="BTCUSDT" label="BTCUSDT" />
            <q-tab name="ETHUSDT" label="ETHUSDT" />
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
            <q-tab-panel name="BNBUSDT">
              <chart symbol="BNBUSDT"/>
            </q-tab-panel>

            <q-tab-panel name="BTCUSDT">
              <chart symbol="BTCUSDT"/>
            </q-tab-panel>

            <q-tab-panel name="ETHUSDT">
              <chart symbol="ETHUSDT"/>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </template>

    </q-splitter>
  </q-page>
</template>

<script>
import chart from './Chart'

export default {
  name: 'charts',
  data () {
    return {
      chart: 'BNBUSDT',
      splitter: 6
    }
  },
  components: {
    chart
  },
  beforeDestroy () {
    console.log('Destroy charts...')
  }
}
</script>
