import Vue from 'vue'
import Cryptoicon from 'vue-cryptoicon'
// For all icons
import icon from 'vue-cryptoicon/src/icons'
Cryptoicon.add(icon)
Vue.use(Cryptoicon)

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/boot-files
export default async (/* { app, router, Vue ... } */) => {
  // something to do
}
