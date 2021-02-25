<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          Cryptocoins Monitoring
        </q-toolbar-title>

        <q-btn color="orange" icon="stop" round dense size="xs" outline @click="stop()"/>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-menu" dark>
      <mainmenu/>
    </q-drawer>

    <q-page-container>
      <keep-alive :max='5'>
        <router-view />
      </keep-alive>
    </q-page-container>
  </q-layout>
</template>

<script>
import mainmenu from 'components/Menu.vue'
import { mapMutations } from 'vuex'
import Stream from 'src/helpers/stream'

export default {
  name: 'MainLayout',
  components: { mainmenu },
  data () {
    return {
      leftDrawerOpen: false,
      bstream: null
    }
  },
  methods: {
    ...mapMutations('binance', ['monitorPairs', 'stopMonitoring']),
    stop () {
      Stream.disconnect()
    }
  },
  async mounted () {
    const bstream = new Stream()
    // this.monitorPairs(['BNBUSDT', 'ETHUSDT', 'BTCUSDT'])
    await Stream.connect((data) => {
      console.log('data from stream', data)
    })
    await bstream.subscribe('bnbusdt@ticker', 'btcusdt@ticker')
    const list = await bstream.list()
    console.log('List:', list)
  },
  beforeDestroy () {
    this.stop()
  }
}
</script>
