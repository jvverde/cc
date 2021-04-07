<template>
  <q-dialog v-model="selected"
    :content-style="{ backgroundColor: 'rgb(128, 128, 128, .5)' }"
    @hide="hide"
    @before-show="beforeShow">
    <q-card class="filter-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="q-mx-xl">Filter by fields which...</div>
        <q-space />
        <q-btn icon="close" flat size="xs" round dense color="purple" v-close-popup />
      </q-card-section>
      <q-separator />
      <q-separator />
      <q-card-section v-if="isstring" class="scroll column" style="max-height: 70vh">
        <q-input v-for="(filter, index) in current" :key="index + 'filterMatch'"
          outlined label="Match" focus color="green-2"
          v-model="filter.ref" @input="change(filter, 'match')"/>
      </q-card-section>
      <q-card-section v-else class="scroll" style="max-height: 70vh">
        <div v-for="(filter, index) in current" :key="index + 'filter'" class="row no-wrap items-center">
          <em>{{ filter.label }}</em>
          <div class="q-mx-lg">is</div>
          <q-btn-toggle
            v-model="filter.type"
            dense
            color="teal-3"
            text-color="white"
            toggle-color="green-1"
            toggle-text-color="black"
            size="md"
            padding="xs lg"
            :options="op"
            @input="change(filter)"
            class="q-mr-lg"
          />
          <q-input outlined label="Value" focus color="green-2"
            v-model="filter.ref" @input="change(filter)"/>
          <q-btn icon="clear" color="red" flat size="xs" round @click="remove(filter)" />
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn icon="playlist_add" flat size="sm" round color="green" @click="add" />
      </q-card-actions>
      <q-card-actions align="right">
        <q-btn flat label="Accept" color="green-8" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { getNewId } from 'src/helpers/Utils'

const filtertypes = {
  great: (v, ref) => +v > +ref,
  less: (v, ref) => +v < +ref,
  equal: (v, ref) => +v === +ref,
  match: (v, re) => {
    try {
      return String(v).match(new RegExp(re))
    } catch (e) {
      console.warn(e)
      return true
    }
  }
}

const mapTypes2Label = {
  great: { label: '>', value: 'great' },
  equal: { label: '=', value: 'equal' },
  less: { label: '<', value: 'less' },
  match: { label: '=~', value: 'match' }
}

// a filter is created from a test function, a valueOf function and one or more reference values
const filter = (test, valueOf, ...refs) => obj => test(valueOf(obj), ...refs)

export default {
  name: 'colorname',
  data () {
    return {
      op: Object.values(mapTypes2Label)
    }
  },
  props: {
    model: {
      type: Boolean,
      required: true
    },
    filters: {
      type: Array,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    valueof: {
      type: Function,
      required: true
    },
    isstring: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    selected: {
      get () { return this.model },
      set (val) {
        this.$emit('update:model', val)
      }
    },
    current () { return this.filters.filter(e => e.name === this.name) },
    filternames () { return Object.keys(filtertypes) }
  },
  watch: {
  },
  components: {
  },
  methods: {
    beforeShow () {
      if (this.current.length === 0) {
        this.add()
      }
    },
    add () {
      const filter = {
        id: getNewId(),
        test: () => true,
        type: undefined,
        ref: undefined,
        label: this.label,
        name: this.name,
        valueOf: this.valueof,
        isstring: this.isstring
      }
      this.filters.push(filter)
    },
    remove (f) {
      const index = this.filters.findIndex(e => e.id === f.id)
      this.filters.splice(index, 1)
    },
    change (f, operation) {
      if (operation) f.type = operation
      const { ref, type, valueOf } = f
      const test = filtertypes[type]
      if (ref !== undefined && test instanceof Function) {
        f.test = filter(test, valueOf, ref)
        f.symbol = mapTypes2Label[type].label
      } else {
        f.test = () => true
      }
    },
    hide () {
      let j = this.filters.length
      while (j--) {
        const f = this.filters[j]
        if (f.test instanceof Function && f.ref !== undefined) continue
        this.filters.splice(j, 1)
      }
    }
  },
  mounted () {
  },
  beforeDestroy () {
  }
}
</script>
<style scoped lang="scss">
  .filter-card {
    max-width: 80vw;
    border: 1px solid gray;
  }
</style>
