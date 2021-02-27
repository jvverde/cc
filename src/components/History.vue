<template>
  <div>
    <div v-for="(max, i) in listNextMaxs" :key="'max' + i" class="row justify-center q-mx-lg">
      <span>{{i}}</span>
      <span> | {{time(max.time)}}</span>
      <span> | {{number(max.price)}}</span>
    </div>
    <div>-----</div>
    <div v-for="(ticket, index) in history" :key="index" class="row justify-center q-mx-lg">
      <div class="col">{{time(ticket.time)}}</div>
      <div class="col">{{number(ticket.price)}}</div>
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
    history () { return [...this.data.hist].reverse() },
    current () { return this.data.current },
    price () { return this.current.price },
    date () { return this.current.time },
    lastmax () { return this.data.lastmax },
    lastMaxPrice () { return this.lastmax.price },
    listNextMaxs () {
      const result = [this.lastmax]
      let next = this.lastmax.next
      while (next) {
        result.push(next)
        next = next.next
      }
      return result
    },
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
