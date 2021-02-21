<template>
  <q-card>
    <q-list>
      <q-item dense>
        <q-item-section side>
          <cryptoicon :symbol="symbol" size="24" />
        </q-item-section>
        <q-item-section>
          {{info.symbol}}
        </q-item-section>
        <q-item-section side>
          <q-checkbox v-model="active" dense size="xs" color="green"/>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script>

export default {
  name: 'pair',
  data () {
    return {
      active: false
    }
  },
  props: {
    info: {
      type: Object,
      required: true
    }
  },
  computed: {
    symbol () {
      return this.info.symbol.replace(/BTC$|USDT$|ETH$|BNB$|USDC$|BUSD$|CUSD$/, '').toLowerCase()
    }
  },
  methods: {
    connect () {
    }
  },
  async mounted () {
  }
}
</script>
