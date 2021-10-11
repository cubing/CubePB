<template>
  <v-card flat>
    <slot name="toolbar"></slot>
    <v-card-text :class="{ 'max-height': dialogMode }" class="py-0 mt-3">
      <v-alert type="info">
        CSV must have the following columns:
        <br />
        <span v-for="(field, i) in recordInfo.importOptions.fields" :key="i"
          >{{ field }},
        </span>
      </v-alert>
      <v-container>
        <v-row>
          <v-col xs="12" class="py-0">
            <v-file-input
              v-model="miscInputs.file"
              accept="text/csv"
              label="File input (CSV only)"
              ref="csvFile"
              @change="handleFileUpload"
              @click:clear="reset()"
            ></v-file-input>
            <div>
              {{ recordsDone }} / {{ miscInputs.records.length }} Records Added
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <slot name="footer-action"></slot>
      <v-btn
        ref="submit"
        color="primary"
        :loading="loading.importing"
        @click="handleSubmit()"
        >Submit</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import { executeGiraffeql } from '~/services/giraffeql'
import {
  handleError,
  convertCSVToJSON,
  capitalizeString,
  collapseObject,
} from '~/services/base'

export default {
  props: {
    selectedItem: {
      type: Object,
      default: () => ({}),
    },
    recordInfo: {
      type: Object,
      required: true,
    },

    // in dialog mode, some changes are made in the component, like max-height
    dialogMode: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      miscInputs: null,
      originalMiscInputs: {
        records: [],
        file: null,
      },

      loading: {
        importing: false,
      },
    }
  },

  computed: {
    recordsDone() {
      return this.miscInputs.records.filter((ele) => ele.isFinished).length
    },
  },

  created() {
    this.reset()
  },

  methods: {
    handleFileUpload(file) {
      if (!file) return
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const data = convertCSVToJSON(event.target.result)

          this.miscInputs.records = data.map((ele) => ({
            data: ele,
            isFinished: false,
            record: null,
          }))

          // parse the data if there is a parse function for the field
          this.miscInputs.records.forEach((recordData) => {
            for (const field in recordData.data) {
              // if any field is invalid, throw err
              if (!this.recordInfo.fields[field])
                throw new Error(`Unrecognized field: ${field}`)

              const parseFn = this.recordInfo.fields[field].parseImportValue
              if (parseFn)
                recordData.data[field] = parseFn(recordData.data[field])
            }
          })

          this.$notifier.showSnackbar({
            message: 'File uploaded',
            variant: 'success',
          })
        } catch (err) {
          // reset records if any error with parsing
          this.reset()
          handleError(this, err)
        }
      }
      reader.readAsText(file)
    },

    async handleSubmit() {
      this.loading.importing = true
      try {
        // must have some records
        if (this.miscInputs.records.length < 1)
          throw new Error('No records to import')

        for (const recordData of this.miscInputs.records) {
          // skip if already finished
          if (recordData.isFinished) continue

          recordData.record = await executeGiraffeql(this, {
            [this.recordInfo.addOptions.operationName ??
            'create' + capitalizeString(this.recordInfo.typename)]: {
              id: true,
              __args: collapseObject(recordData.data),
            },
          })

          recordData.isFinished = true
        }

        this.$notifier.showSnackbar({
          message: `${this.recordsDone}/${this.miscInputs.records.length} Records Imported`,
          variant: 'success',
        })

        this.$emit('handleSubmit')
        this.$emit('close')
      } catch (err) {
        handleError(this, err)
        this.$emit('handleSubmit')
      }
      this.loading.importing = false
    },

    reset() {
      // duplicate misc inputs, if any
      this.miscInputs = JSON.parse(JSON.stringify(this.originalMiscInputs))
    },
  },
}
</script>
