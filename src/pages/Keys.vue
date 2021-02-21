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
import { getPassword, setPassword, setSecret } from 'src/helpers/credentials'
export default {
  name: 'keys',
  data () {
    return {
      key: undefined,
      secret: undefined
    }
  }

}
</script>
