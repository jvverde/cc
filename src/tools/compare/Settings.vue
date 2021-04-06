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
          <tr v-for="(p, i) in parameters" :key="i">
            <td style="min-width:10vw; text-align: right" class="q-pr-lg q-pt-lg">
              {{ p.name }}
            </td>
            <td style="min-width:10vw;">
              aqui: <q-input outlined square v-model.number="parameters[i].value" type="number"/>,,
            </td>
            <td style="min-width:30vw" class="q-pt-lg">
              <q-slider
                v-model="parameters[i].value"
                :min="parameters[i].min"
                :max="parameters[i].max"
                :step="parameters[i].step"
                label
                snap
                color="teal-13"
                label-text-color="teal-10"
                label-color="teal-1"
                label-always
              />
            </td>
          </tr>
        </table>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn outline color="green" label="OK" @click="onOKClick" />
        <q-btn outline color="orange" label="Cancel" @click="onCancelClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
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
  computed: {
    currentValue () { return i => this.parameters[i].value },
    label () { return i => this.parameters[i].label },
    max () { return i => this.parameters[i].max },
    min () { return i => this.parameters[i].min }
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
      const params = this.parameters
      this.$emit('ok', { params })
      // then hiding dialog
      this.hide()
    },

    onCancelClick () {
      // we just need to hide dialog
      this.hide()
    }
  }
}
</script>
<style scoped lang="scss">
  .filter-card {
    max-width: 95vw;
    border: 1px solid gray;
  }
</style>
