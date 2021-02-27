<template>
  <div>
    <div class="row justify-center q-mx-lg">
      <div class="col">{{time(date)}}</div>
      <div class="col">{{symbol}}</div>
      <div class="col">{{number(price)}}</div>
      <div class="col">[{{number(lastMinPrice)}}, {{number(lastMaxPrice)}}]</div>
      <div class="col">{{range}}</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import numeral from 'numeral'

export default {
  name: 'row',
  data () {
    return {
    }
  },
  props: {
    symbol: {
      type: String,
      required: true
    }
  },
  computed: {
    data () { return this.symbols[this.symbol] },
    current () { return this.data.current },
    price () { return this.current.price },
    date () { return this.current.time },
    lastmax () { return this.data.lastmax },
    lastmin () { return this.data.lastmin },
    lastMaxPrice () { return this.lastmax.price },
    lastMinPrice () { return this.lastmin.price },
    range () { return numeral((this.lastMaxPrice - this.lastMinPrice) / this.lastMaxPrice).format('0.00%') },
    ...mapState('binance', ['symbols'])
  },
  watch: {
  },
  components: {
  },
  methods: {
    number (n) { return numeral(n).value() },
    time (d) { return new Date(d).toLocaleTimeString('pt-PT') }
  },
  mounted () {
  },
  beforeDestroy () {
  }
}
</script>
