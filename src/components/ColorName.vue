<template>
  <q-dialog v-model="model">
    <q-card style="max-width: 60vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Choose colors</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <q-chip :style="`color: ${name}`"
          :label="name"
          removable @remove="remove(index)"
          v-for="(name, index) in values" :key="index"
        />
      </q-card-section>
      <q-separator />
      <q-card-section class="scroll" style="max-height: 70vh" >
        <div v-for="(group, name) in contrastedColors" :key="name" class="col">
          <span :style="`color: ${name}`">{{ name }}:</span>
          <div class="row q-ml-xl">
            <span v-for="(color, index) in group" :key="name+index" :style="`color: ${color}`">
              <q-checkbox size="xs" v-model="values" :val="color" :label="color"
                :style="`color: ${color}`"
                class="forceinherith"
                :class="{forcewhite: isLight, forcedark: isDark}"
              />
            </span>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn :disable="!isEnough" flat label="Accept" color="green" v-close-popup />
      </q-card-actions>
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
    },
    min: {
      type: Number,
      default: 1
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
      get () { return this.names.map(c => c.toLowerCase()).filter(c => this.hasContrast(c)) },
      set (val) {
        this.$emit('update:names', val)
      }
    },
    isDark () { return this.$q.dark.isActive },
    isLight () { return !this.$q.dark.isActive },
    contrastedColors () {
      const r = {}
      for (const [group, colors] of Object.entries(this.colors)) {
        r[group] = colors.filter(c => this.hasContrast(c))
      }
      return r
    },
    isEnough () { return this.values.length >= this.min }
  },
  watch: {
  },
  components: {
  },
  methods: {
    remove (index) {
      this.values.splice(index, 1)
      this.values = [...this.values]
    },
    hasContrast (c) {
      const color = Color(c)
      return (color.isLight() && this.isDark) || (color.isDark() && this.isLight)
    }
  },
  mounted () {
  },
  beforeDestroy () {
  }
}
</script>
<style lang="scss">
  .forceinherith div {
    color: inherit !important;
  }
  .forcedark svg {
    color: black !important;
  }
  .forcewhite svg {
    color: white !important;
  }
</style>
