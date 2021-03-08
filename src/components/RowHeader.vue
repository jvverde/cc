<template>
  <div class="col line">
    <div class="row justify-center q-mx-lg header">
      <div class="col-auto q-mx-sm q-mr-lg">Time</div>
      <div class="col">Symbol</div>
      <div class="col text-left">Price</div>
      <div class="col-auto text-left q-px-xs">Chg (24h)</div>
      <div class="col text-left" v-for="(v,i) in intervales" :key="i">Chg ({{v}}t)</div>
      <div class="col-auto">Rg[1m] </div>
      <div class="col-auto">Rg[5m] </div>
      <div class="col-auto">Rg[15m]</div>
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
