<template>
  <div class="relative-position">
    {{symbol}}
  </div>
</template>

<script>
import { listen, dismiss } from 'src/helpers/stream'

export default {
  name: 'coin',
  data () {
    return {
    }
  },
  computed: {
    stream () { return this.symbol.toLowerCase() + '@kline_1m' }
  },
  props: {
    symbol: {
      type: String,
      required: true
    }
  },
  watch: {
    stream: {
      immediate: true,
      handler (val, old) {
        if (old) dismiss(old)
        console.log(this.stream)
        listen(this.candles, this.stream)
      }
    }
  },
  methods: {
    candles (c) {
      console.log(c)
    }
  },
  mounted () {
  },
  beforeDestroy () {
  }
}
</script>

<style scoped lang="scss">
</style>
