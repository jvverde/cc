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
      streamid: []
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
      async handler (val, old) {
        if (old && this.streamid.length) await dismiss(...this.streamid)
        this.streamid = await listen(this.candles, this.stream)
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
    console.log('destroy...')
    if (this.streamid) dismiss(...this.streamid)
  }
}
</script>

<style scoped lang="scss">
</style>
