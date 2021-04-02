<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md">
      <div class="q-gutter-y-md column" style="max-width: 300px">
        <q-input v-model="key" label="Key" placeholder="provider key" hint="API key" />
        <q-input v-model="secret" label= "Secret" placeholder="provider secret" hint="API secret" />
      </div>
    </div>
  </q-page>
</template>

<script>
import { setKey, setSecret, getCredentials } from 'src/helpers/keys'
export default {
  name: 'keys',
  data () {
    return {
      key: undefined,
      secret: undefined
    }
  },
  watch: {
    key (k) {
      if (k) setKey('binance', k)
    },
    secret (s) {
      if (s) setSecret('binance', s)
    }
  },
  methods: {
  },
  async mounted () {
    console.log('Mount keys')
    const cred = await getCredentials('binance')
    this.key = cred.key
    this.secret = cred.secret
  },
  beforeDestroy () {
    console.log('Destroy keys')
  }
}
</script>
