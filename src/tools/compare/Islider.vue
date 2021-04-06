<template>
  <tr>
    <td style="text-align: right" class="q-pr-lg q-pt-lg">
      {{ label }}:
    </td>
    <td style="min-width:50vw" class="q-pt-lg">
      <q-slider
        v-model="currentValue"
        :min="min"
        :max="max"
        :step="step"
        label
        snap
        color="teal-13"
        label-text-color="teal-10"
        label-color="teal-1"
        label-always
      />
    </td>
    <td class="q-pl-xs">
      <q-input borderless dense
        :label="name"
        v-model.number="currentValue" type="number" :step="step" :min="min" :max="max"
      />
    </td>
  </tr>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  props: {
    name: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    val: {
      type: Number,
      required: true
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    step: {
      type: Number,
      default: 1
    }
  },
  computed: {
    currentValue: {
      get () { return this.val },
      set (v) { this.$emit('update:val', v) }
    }
  }
}
</script>

<style scoped lang="scss">
</style>
