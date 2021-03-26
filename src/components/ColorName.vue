<template>
  <q-dialog v-model="model" full-width>
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Choose colors</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div v-for="(group, name) in contrastedColors" :key="name">
          <span :style="`color: ${name}`">{{ name }}:</span>
          <span v-for="(color, index) in group" :key="name+index" :style="`color: ${color}`">
            <q-checkbox size="xs" v-model="values" :val="color" :label="color" class="forcecolor" :style="`color: ${color}`"/>
          </span>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import colors from 'src/helpers/colors'
import Color from 'color'

export default {
  name: 'colorname',
  data () {
    return {
      colors: colors
    }
  },
  props: {
    select: {
      type: Boolean,
      required: true
    },
    names: {
      type: Array,
      required: true
    }
  },
  computed: {
    model: {
      get () { return this.select },
      set (val) {
        this.$emit('update:select', val)
      }
    },
    values: {
      get () { return this.names.map(c => c.toLowerCase()) },
      set (val) {
        this.$emit('update:names', val)
      }
    },
    contrastedColors () {
      const r = {}
      for (const [group, colors] of Object.entries(this.colors)) {
        r[group] = colors.filter(c => {
          const color = Color(c)
          return color.isLight()
        })
      }
      return r
    }
  },
  watch: {
  },
  components: {
  },
  methods: {
  },
  mounted () {
  },
  beforeDestroy () {
  }
}
</script>
<style lang="scss">
  .forcecolor div {
    color: inherit !important;
  }
</style>
