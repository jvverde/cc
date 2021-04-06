<template>
  <q-dialog ref="optionsdialog" @hide="onDialogHide">
    <q-card class="filter-card">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ question }}</div>
        <q-space />
        <q-btn icon="close" flat size="xs" round dense color="purple" v-close-popup />
      </q-card-section>
      <q-card-section>
        <table>
          <islider v-for="(p, i) in options" :key="i"
            :val.sync="p.value" :name="p.name" :label="p.label"
            :min="p.min" :max="p.max" :step="p.step"/>
        </table>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn outline color="green" label="OK" @click="onOKClick" />
        <q-btn outline color="amber" label="Cancel" @click="onCancelClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import islider from './Islider'
export default {
  data () {
    return {
      val: 0,
      options: []
    }
  },
  props: {
    question: {
      type: String,
      required: false
    },
    parameters: {
      type: Array,
      required: true
    }
  },
  components: {
    islider
  },
  computed: {
    currentValue () { return i => this.parameters[i].value },
    label () { return i => this.parameters[i].label },
    max () { return i => this.parameters[i].max },
    min () { return i => this.parameters[i].min }
  },
  watch: {
    options: {
      deep: true,
      handler (v, vv) {
        // console.log('v, vv', v, vv)
      }
    }
  },
  methods: {
    // See https://quasar.dev/quasar-plugins/dialog#invoking-custom-component
    // following method is REQUIRED
    // (don't change its name --> "show")
    show () {
      this.$refs.optionsdialog.show()
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide () {
      this.$refs.optionsdialog.hide()
    },

    onDialogHide () {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    },

    onOKClick () {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit('ok', this.options)
      // then hiding dialog
      this.hide()
    },

    onCancelClick () {
      // we just need to hide dialog
      this.hide()
    }
  },
  mounted () {
    this.options = this.parameters.map(e => ({ ...e })) // copy every object of array
  }
}
</script>
<style scoped lang="scss">
  .filter-card {
    max-width: 95vw;
    border: 1px solid gray;
  }
</style>
