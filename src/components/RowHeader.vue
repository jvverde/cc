<template>
  <div class="col line">
    <div class="row justify-center q-mx-lg header">
      <div class="col">Time</div>
      <div class="col">Symbol</div>
      <div class="col text-right">Price</div>
      <div class="col text-left q-px-xs">Chg (24h)</div>
      <div class="col text-left" v-for="(v,i) in intervales" :key="i">Chg ({{v}}t)</div>
      <div class="col text-right">Min</div>
      <div class="col text-center">Range</div>
      <div class="col text-left">Max</div>
      <div class="col text-right">Volume</div>
      <div class="col text-right">Quote</div>
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
  }
}
</script>

<style lang="scss">
</style>
