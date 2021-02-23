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
          Quasar App
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
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

export default {
  name: 'MainLayout',
  components: { mainmenu },
  data () {
    return {
      leftDrawerOpen: false
    }
  }
}
</script>
