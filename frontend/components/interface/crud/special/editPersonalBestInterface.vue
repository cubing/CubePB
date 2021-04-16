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
            <v-text-field
              v-if="item.field === 'timeElapsed'"
              ref="timeElapsed"
              v-model="item.value"
              :label="
                (item.fieldInfo.text || item.field) +
                (item.fieldInfo.optional ? ' (optional)' : '')
              "
              :readonly="item.readonly || mode === 'view'"
              :rules="item.fieldInfo.inputRules"
              :hint="item.fieldInfo.hint"
              :append-icon="
                item.value === null
                  ? 'mdi-null'
                  : item.readonly || mode === 'view'
                  ? null
                  : 'mdi-close'
              "
              persistent-hint
              filled
              dense
              class="py-0"
              @keypress="isNumber($event)"
              @click:append="item.value = null"
            ></v-text-field>

            <GenericInput v-else :item="item"></GenericInput>
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

    timeElapsed() {
      try {
        return this.getInputValue('timeElapsed')
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
    timeElapsed(val) {
      if (!val) return

      // if pasted value matches the correct format, don't do anything
      if (val.match(/^(\d+:)?\d{1,2}\.\d{2}$/)) return

      // if val is 1 or more digits only, parse
      if (val.match(/^\d+$/)) {
        return this.setInputValue('timeElapsed', this.parseTimeString(val))
      }

      // if val is 1 digit off from a correct string, must be due to a keyboard action. parse
      if (val.match(/^(\d+:)?\d{1,2}\.\d{1,3}$/)) {
        return this.setInputValue('timeElapsed', this.parseTimeString(val))
      }
    },
  },

  mounted() {
    // focus the time field if the event and pbClass are set
    if (this.event && this.pbClass) {
      setTimeout(() => {
        this.$refs.timeElapsed[0].focus()
      }, 0)
    }
  },

  methods: {
    isNumber(evt) {
      const charCode = evt.which ? evt.which : evt.keyCode
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        evt.preventDefault()
      } else {
        return true
      }
    },

    // remove : and ., then apply them at appropriate places
    parseTimeString(str) {
      const strParts = [...str.replace(/\./, '').replace(/:/, '')]

      // if length <= 2, pad with 0s so min length is 3
      while (strParts.length < 3) {
        strParts.unshift('0')
      }

      // if length > 2, insert the "." before the 2nd last digit
      strParts.splice(-2, 0, '.')

      // get rid of any excess leading 0s
      if (strParts.length === 5 && strParts[0] === '0') {
        strParts.shift()
      }

      // if length is greater than 5, add the ":"
      // and get rid of any leading 0s
      if (strParts.length > 5) {
        strParts.splice(-5, 0, ':')
        while (strParts[0] === '0') {
          strParts.shift()
        }
      }

      return strParts.join('')
    },
  },
}
</script>

<style scoped>
.max-height {
  max-height: 600px;
}
</style>
