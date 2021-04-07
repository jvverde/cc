<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md">
      <div class="q-gutter-y-md column" style="max-width: 300px">
        <span>Exponencial moving averages intervals</span>
        <q-list dense>
          <q-item v-for="(m, i) in averages" :key="i">
            <q-item-section side>
              {{ i }}:
            </q-item-section>
            <q-item-section>
              <q-input dense
                hint="Number of samples"
                @blur="reorder"
                v-model.number="averages[i]" type="number" :step="1"
              />
            </q-item-section>
            <q-item-section side>
              <q-btn icon="clear" flat size="xs" round color="red" @click="remove(i)"/>
            </q-item-section>
          </q-item>
          <q-item class="q-mt-xl">
            <q-item-section side>
              <q-btn icon="add" outline color="green-3" @click="add"/>
            </q-item-section>
            <q-item-section side>
              <q-btn icon="done" outline color="green-5" label="Apply" @click="apply"/>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script>

import { mapState, mapMutations } from 'vuex'

const sort = (a, b) => {
  if (+a < +b) return -1
  if (+a > +b) return +1
  return 0
}

export default {
  name: 'Settings',
  data () {
    return {
      averages: []
    }
  },
  computed: {
    ...mapState('binance', ['maverages'])
  },
  watch: {
  },
  methods: {
    ...mapMutations('binance', ['setMaverages']),
    add () {
      this.averages.push(undefined)
    },
    reorder () {
      this.averages.sort(sort)
    },
    apply () {
      this.reorder()
      this.setMaverages([...this.averages])
    },
    remove (i) {
      this.averages.splice(i, 1)
    }
  },
  mounted () {
    this.averages = [...this.maverages].sort(sort)
  },
  beforeDestroy () {
  }
}
</script>
