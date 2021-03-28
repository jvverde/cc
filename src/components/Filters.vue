<template>
  <q-dialog v-model="selected">
    <q-card  style="max-width: 60vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Choose filter</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-separator />
      <q-card-section class="scroll" style="max-height: 70vh" >
        <div v-for="(filter, index) in current" :key="index" class="col">
          <span>{{ filter.field }}</span>
          <q-select
            v-model="filter.type"
            label="Type" dense options-dense
            :options="names"
            @input="v => changetype(v, index)"
          />
          <q-input outlined v-model="filter.ref" label="Outlined" @input="v => changeref(v, index)"/>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Accept" color="green" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>

const filtertypes = {
  great: (v, ref) => v > ref,
  less: (v, ref) => v < ref,
  equal: (v, ref) => {
    console.log(`equal(${v}, ${ref})`, v === ref)
    return v === ref
  },
  match: (v, re) => v.match(re),
  between: (v, ref1, ref2) => v > ref1 && v < ref2
}
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
    }
  },
  computed: {
    selected: {
      get () { return this.model },
      set (val) {
        this.$emit('update:model', val)
      }
    },
    current: {
      get () { return this.filters },
      set (val) {
        this.$emit('update:filters', val)
      }
    },
    names () { return Object.keys(filtertypes) }
  },
  watch: {
  },
  components: {
  },
  methods: {
    changetype (type, index) {
      const ref = this.current[index].ref || ''
      const test = filtertypes[type]
      this.current[index].test = this.current[index].filter(test, ref)
      console.log(type, index, this.current)
    },
    changeref (ref, index) {
      const test = filtertypes[this.current[index].type] || (() => true)
      this.current[index].test = this.current[index].filter(test, ref)
      console.log(ref, index, this.current)
    }
  },
  mounted () {
  },
  beforeDestroy () {
  }
}
</script>
<style lang="scss">
</style>
