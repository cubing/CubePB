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
import { isObject } from '~/services/base'

const scoreMethodHiddenFieldsMap = {
  STANDARD: ['movesCount', 'attemptsSucceeded', 'attemptsTotal'],
  FMC: ['timeElapsed', 'attemptsSucceeded', 'attemptsTotal'],
  MBLD: ['movesCount'],
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
        return this.getInputValue('pbClass.id')
      } catch {
        return null
      }
    },
    visibleInputsArray() {
      return this.inputsArray.filter((ele) => {
        // if no event, only show event input
        if (!this.event) return ele.field === 'event.id'

        // if no pbClass, only allow event + pbClass
        if (!this.pbClass)
          return ele.field === 'event.id' || ele.field === 'pbClass.id'

        const hiddenFields = []
        if (this.event) {
          let scoreMethod
          if (isObject(this.event)) {
            scoreMethod = this.event.scoreMethod
          } else {
            const foundEventObject = this.getInputObject(
              'event.id'
            ).options.find((ele) => ele.id === this.event)

            if (foundEventObject) {
              scoreMethod = foundEventObject.scoreMethod
            }
          }

          hiddenFields.push(...(scoreMethodHiddenFieldsMap[scoreMethod] ?? []))
        }

        if (this.pbClass) {
          // if pbClass.setSize, also hide that
          let setSize
          if (isObject(this.pbClass)) {
            setSize = this.pbClass.setSize
          } else {
            setSize = this.getInputObject('pbClass.id').options.find(
              (ele) => ele.id === this.pbClass
              // eslint-disable-next-line camelcase
            )?.setSize
          }
          if (setSize) hiddenFields.push('setSize')
        }

        return !hiddenFields.includes(ele.field)
      })
    },
  },

  watch: {
    pbClass(val) {
      if (!isObject(val)) return
      // eslint-disable-next-line camelcase
      if (!val?.setSize) {
        this.setInputValue('setSize', null)
      } else {
        this.setInputValue('setSize', val.setSize)
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
