<template>
  <q-list>
    <q-item-label header>Menu</q-item-label>
    <q-item :clickable="current !== 'home'" @click="$router.push({ name: 'home' })">
      <q-item-section avatar>
        <q-icon color="menu" name="home" />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          Home
        </q-item-label>
      </q-item-section>
    </q-item>
    <!--q-item :clickable="current !== 'monitor'" @click="$router.push({ name: 'monitor' })">
      <q-item-section avatar>
        <q-icon color="menu" name="list" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Monitor</q-item-label>
        <q-item-label caption>Monitoring assets</q-item-label>
      </q-item-section>
    </q-item-->
    <q-item :clickable="current !== 'monitor'" @click="$router.push({ name: 'monitor' })">
      <q-item-section avatar>
        <q-icon color="menu" name="view_stream" />
      </q-item-section>
      <q-item-section>
        <q-item-label>All Trading pairs</q-item-label>
        <q-item-label caption>See current stats for all coins</q-item-label>
      </q-item-section>
    </q-item>
    <q-item :clickable="current !== 'charts'" @click="$router.push({ name: 'charts' })">
      <q-item-section avatar>
        <q-icon color="menu" name="bar_chart" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Charts</q-item-label>
        <q-item-label caption>Coin progress over time</q-item-label>
      </q-item-section>
    </q-item>
    <q-item :clickable="current !== 'keys'" @click="$router.push({ name: 'keys' })">
      <q-item-section avatar>
        <q-icon color="menu" name="password" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Keys</q-item-label>
        <q-item-label caption>Manage keys</q-item-label>
      </q-item-section>
    </q-item>
    <q-item :clickable="current !== 'settings'" @click="$router.push({ name: 'settings' })">
      <q-item-section avatar>
        <q-icon color="menu" name="settings" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Settings</q-item-label>
        <q-item-label caption>Edit global settings</q-item-label>
      </q-item-section>
    </q-item>
    <q-item clickable @click="debug">
      <q-item-section avatar>
        <q-icon color="menu" name="build" />
      </q-item-section>
      <q-item-section>
        <q-item-label>DevTools</q-item-label>
        <q-item-label caption>Open Developer Tools</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
const { ipcRenderer } = require('electron')
export default {
  name: 'mainMenu',
  data () {
    return {
      tools: false
    }
  },
  computed: {
    current () {
      return this.$route.name
    }
  },
  methods: {
    debug () {
      this.tools = !this.tools
      if (this.tools) {
        ipcRenderer.send('debug', 'on')
      } else {
        ipcRenderer.send('debug', 'off')
      }
    }
  }
}
</script>
