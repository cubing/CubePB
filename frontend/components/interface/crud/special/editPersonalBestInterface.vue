<template>
  <v-card flat>
    <slot name="toolbar"></slot>
    <v-card-text :class="{ 'max-height': dialogMode }" class="pt-3">
      <v-container
        v-if="loading.loadRecord || loading.loadDropdowns"
        class="text-center"
        style="height: 250px"
        fill-height
        justify-center
      >
        <v-progress-circular indeterminate></v-progress-circular>
      </v-container>
      <v-container v-else>
        <v-row>
          <v-col
            v-for="(item, i) in visibleInputsArray"
            :key="i"
            cols="12"
            class="py-0"
          >
            <GenericInput :item="item" :mode="mode"></GenericInput>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <slot name="footer-action"></slot>
      <v-btn
        v-if="mode !== 'view'"
        ref="submit"
        color="primary"
        :loading="loading.editRecord"
        @click="handleSubmit()"
        >Submit</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import editRecordInterfaceMixin from '~/mixins/editRecordInterface'
import { isObject } from '~/services/common'

const scoreMethodHiddenFieldsMap = {
  STANDARD: ['moves_count', 'attempts_succeeded', 'attempts_total'],
  FMC: ['time_elapsed', 'attempts_succeeded', 'attempts_total'],
  MBLD: ['moves_count'],
}

export default {
  mixins: [editRecordInterfaceMixin],

  computed: {
    event() {
      try {
        return this.getInputValue('event.id')
      } catch {
        return null
      }
    },

    pbClass() {
      try {
        return this.getInputValue('pb_class.id')
      } catch {
        return null
      }
    },
    visibleInputsArray() {
      return this.inputsArray.filter((ele) => {
        // if no event, only show event input
        if (!this.event) return ele.field === 'event.id'

        const hiddenFields = []
        if (this.event) {
          let scoreMethod
          if (isObject(this.event)) {
            scoreMethod = this.event.score_method
          } else {
            const foundEventObject = this.getInputObject(
              'event.id'
            ).options.find((ele) => ele.id === this.event)

            if (foundEventObject) {
              scoreMethod = foundEventObject.score_method
            }
          }

          hiddenFields.push(...(scoreMethodHiddenFieldsMap[scoreMethod] ?? []))
        }

        if (this.pbClass) {
          // if pbClass.set_size, also hide that
          let setSize
          if (isObject(this.pbClass)) {
            setSize = this.pbClass.set_size
          } else {
            setSize = this.getInputObject('pb_class.id').options.find(
              (ele) => ele.id === this.pbClass
              // eslint-disable-next-line camelcase
            )?.set_size
          }
          if (setSize) hiddenFields.push('set_size')
        }

        return !hiddenFields.includes(ele.field)
      })
    },
  },

  watch: {
    pbClass(val) {
      if (!isObject(val)) return
      // eslint-disable-next-line camelcase
      if (!val?.set_size) {
        this.setInputValue('set_size', null)
      } else {
        this.setInputValue('set_size', val.set_size)
      }
    },
  },
}
</script>

<style scoped>
.max-height {
  max-height: 600px;
}
</style>
