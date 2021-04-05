<template>
  <q-btn-toggle
    v-model="selected"
    color="brown"
    text-color="white"
    toggle-color="orange"
    toggle-text-color="black"
    rounded
    no-caps
    unelevated
    glossy
    size="xs"
    :options="options"
  />
</template>

<script>
import { TIMEFRAMES } from 'src/config'

export default {
  name: 'tfselector',
  data () {
    return {
      selected: undefined
    }
  },
  props: {
    periods: {
      type: Array,
      default: () => TIMEFRAMES
    }
  },
  computed: {
    options () { return this.periods.map(p => ({ label: p, value: p })) }
  },
  watch: {
    selected (v) {
      this.$emit('selected', v)
    }
  },
  components: {
  },
  methods: {
    click (p, index) {
      this.selected = index
    }
  },
  mounted () {
    this.selected = this.periods[0]
  },
  beforeDestroy () {
  }
}
</script>
<style lang="scss">
</style>
