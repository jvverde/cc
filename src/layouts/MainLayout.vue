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
import { mapState } from 'vuex'
import Stream from 'src/helpers/stream'
import { enqueue } from 'src/data'

export default {
  name: 'MainLayout',
  components: { mainmenu },
  data () {
    return {
      leftDrawerOpen: false
    }
  },
  computed: {
    ...mapState('binance', ['watching']),
    watchSet () { return new Set(this.watching) }
  },
  methods: {
    stop () {
      Stream.disconnect()
    }
  },
  async mounted () {
    await Stream.connect((answer) => {
      // if (answer.stream && answer.data) {
      //   this.enqueue(answer)
      // } else {
      //   console.warn(answer)
      // }
      if (answer.stream === '!miniTicker@arr') {
        const wanted = answer.data.filter(t => this.watchSet.has(t.s))
        enqueue(wanted)
      } else console.warn(answer)
    })
    const bs = new Stream()
    bs.subscribe('!miniTicker@arr')
  },
  beforeDestroy () {
    this.stop()
  }
}
</script>
