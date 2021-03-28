<template>
  <q-dialog v-model="selected" :content-style="{ backgroundColor: 'rgb(128, 128, 128, .5)' }">
    <q-card class="filter-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Filter</div>
        <q-space />
        <q-btn icon="close" flat size="xs" round dense color="purple" v-close-popup />
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <span v-if="current.length === 0">You probably want to add a new filter -&gt;</span>
        <q-btn icon="playlist_add" flat size="sm" round color="green" @click="add" />
      </q-card-actions>
      <q-separator />
      <q-card-section class="scroll" style="max-height: 70vh">
        <div v-for="(filter, index) in current" :key="index + 'filter'" class="row no-wrap items-center q-gutter-md">
          <div style="min-width:8em">{{ filter.label }}</div>
          <q-select borderless stack-label
            style="min-width:12em"
            v-model="filter.type"
            label="Comparison" dense options-dense
            :options="filternames"
            @input="change(filter)"
          />
          <q-input flat borderless label="Reference value"
            v-model="filter.ref" @input="change(filter)"/>
          <q-btn icon="clear" color="red" flat size="xs" round @click="remove(filter)" />
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Accept" color="green-8" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { getNewId } from 'src/helpers/Utils'

const val = v => {
  return isNaN(v) ? v : +v
}
const filtertypes = {
  great: (v, ref) => val(v) > val(ref),
  less: (v, ref) => val(v) < val(ref),
  equal: (v, ref) => val(v) === val(ref),
  StringGreat: (v, ref) => v > ref,
  StringLess: (v, ref) => v < ref,
  StringEqual: (v, ref) => v === ref,
  NumericGreat: (v, ref) => +v > +ref,
  NumericLess: (v, ref) => +v < +ref,
  NumericEqual: (v, ref) => +v === +ref,
  match: (v, re) => {
    try {
      return v.match(new RegExp(re))
    } catch (e) {
      console.warn(e)
      return true
    }
  }
}

// a filter is created from a test function, a valueOf function and one or more reference values
const filter = (test, valueOf, ...refs) => obj => test(valueOf(obj), ...refs)

export default {
  name: 'colorname',
  data () {
    return {
      types: filtertypes
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
    add () {
      const filter = {
        id: getNewId(),
        test: () => true,
        type: undefined,
        ref: undefined,
        label: this.label,
        name: this.name,
        valueOf: this.valueof
      }
      this.filters.push(filter)
    },
    remove (f) {
      const index = this.filters.findIndex(e => e.id === f.id)
      this.filters.splice(index, 1)
    },
    change (f) {
      const { ref, type, valueOf } = f
      const test = filtertypes[type]
      if (ref !== undefined && test instanceof Function) {
        f.test = filter(test, valueOf, ref)
      } else {
        f.test = () => true
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
