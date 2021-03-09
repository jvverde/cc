<template>
  <div class="col line">
    <div class="row justify-center q-mx-lg header">
      <div class="col-auto q-mx-sm q-mr-lg" @click="$emit('select', 0)">Time</div>
      <div class="col" @click="$emit('select', 1)">Symbol</div>
      <div class="col text-left" @click="$emit('select', 2)">Price</div>
      <div class="col-auto text-left q-px-xs" @click="$emit('select', 3)">Chg (24h)</div>
      <div class="col text-left" v-for="(v,i) in intervales" :key="i" @click="$emit('select', 4 + i)">Chg ({{v}}t)</div>
      <div class="col-auto" @click="$emit('select', 4 + isize)">Rg[1m] </div>
      <div class="col-auto" @click="$emit('select', 5 + isize)">Rg[5m] </div>
      <div class="col-auto" @click="$emit('select', 6 + isize)">Rg[15m]</div>
      <div class="col text-right" @click="$emit('select', 7 + isize)">Volume</div>
      <div class="col text-right" @click="$emit('select', 8 + isize)">Quote</div>
    </div>
  </div>
</template>

<script>
import { intervales } from 'src/data'

export default {
  data () {
    return {
      intervales
    }
  },
  computed: {
    isize () { return intervales.length }
  }
}
</script>

<style lang="scss">
</style>
