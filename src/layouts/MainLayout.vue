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

        <q-toggle v-model="darkmode" label="DM" @input="chgmode" color="black" class="q-mr-lg"/>
        <q-btn color="orange" icon="stop" round dense size="xs" outline @click="stop()"/>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-menu" dark>
      <mainmenu/>
    </q-drawer>

    <q-page-container>
      <transition>
        <keep-alive :include="['monitor']" :max="10">
          <router-view />
        </keep-alive>
      </transition>
    </q-page-container>
  </q-layout>
</template>

<script>
import mainmenu from 'components/Menu.vue'
import { mapState } from 'vuex'
import { connect, disconnect, listen, dismiss } from 'src/api/stream'
import { enqueueTickers } from 'src/data'

export default {
  name: 'MainLayout',
  components: { mainmenu },
  data () {
    return {
      darkmode: true,
      leftDrawerOpen: false,
      streamid: []
    }
  },
  computed: {
    ...mapState('binance', ['watching']),
    watchSet () { return new Set(this.watching) }
  },
  methods: {
    stop () {
      disconnect()
    },
    chgmode (val) {
      this.$q.dark.set(this.darkmode)
    }
  },
  async mounted () {
    await connect()
    console.log('connected on mainLauyout')
    this.streamid = listen((data) => {
      const wanted = data.filter(t => this.watchSet.has(t.s))
      enqueueTickers(wanted)
    }, '!miniTicker@arr')
    this.$q.dark.set(this.darkmode)
  },
  beforeDestroy () {
    dismiss(...this.streamid)
    this.stop()
  }
}
</script>
