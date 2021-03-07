import { executeJomql } from '~/services/jomql'
import {
  collapseObject,
  getNestedProperty,
  capitalizeString,
  handleError,
} from '~/services/common'
import GenericInput from '~/components/input/genericInput.vue'

export default {
  components: {
    GenericInput,
  },
  props: {
    selectedItem: {
      type: Object,
      default: () => ({}),
    },

    recordInfo: {
      type: Object,
      required: true,
    },

    // must be add, edit, or view
    mode: {
      type: String,
      required: true,
      validator: (value) => {
        return ['add', 'edit', 'view'].includes(value)
      },
    },

    // in dialog mode, some changes are made in the component, like max-height
    dialogMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      inputsArray: [],

      // inputs that are used for scaffolding
      miscInputs: null,
      originalMiscInputs: {},

      // loaded from loadMiscDropdowns, if provided
      miscOptions: {},

      loading: {
        editRecord: false,
        loadRecord: false,
        loadDropdowns: false,
      },
    }
  },

  computed: {
    capitalizedType() {
      return capitalizeString(this.recordInfo.typename)
    },
    title() {
      return (
        (this.mode === 'add' ? 'New' : this.mode === 'edit' ? 'Edit' : 'View') +
        ' ' +
        this.recordInfo.name
      )
    },
    icon() {
      return this.mode === 'add'
        ? 'mdi-plus'
        : this.mode === 'edit'
        ? 'mdi-pencil'
        : 'mdi-eye'
    },
  },

  watch: {
    selectedItem() {
      this.reset(true)
    },
  },

  created() {
    this.reset(true)
  },

  methods: {
    setInputValue(key, value) {
      const inputObject = this.inputsArray.find((ele) => ele.field === key)
      if (!inputObject) throw new Error(`Input key not found: '${key}'`)

      inputObject.value = value
    },

    getInputValue(key) {
      const inputObject = this.inputsArray.find((ele) => ele.field === key)
      if (!inputObject) throw new Error(`Input key not found: '${key}'`)
      return inputObject.value
    },

    handleSubmit() {
      // if any comboboxes are focused, do nothing
      if (
        Array.isArray(this.$refs.combobox) &&
        this.$refs.combobox.some((ele) => ele.isFocused)
      ) {
        return
      }

      // if any inputs are loading, hold
      if (
        this.inputsArray.some((inputObject) => inputObject.loading === true)
      ) {
        this.$notifier.showSnackbar({
          message: 'Some inputs are not finished loading',
          variant: 'error',
        })
        return
      }
      this.submit()
    },

    async submit() {
      this.loading.editRecord = true
      try {
        const inputs = {}
        for (const inputObject of this.inputsArray) {
          let value
          // if the fieldInfo.inputType === 'combobox' | 'server-combobox', it came from a combo box. need to handle accordingly
          if (
            (inputObject.fieldInfo.inputType === 'combobox' ||
              inputObject.fieldInfo.inputType === 'server-combobox') &&
            inputObject.fieldInfo.typename
          ) {
            if (typeof inputObject.value === 'string') {
              // expecting either string or obj
              // create the item, get its id.
              const results = await executeJomql(this, {
                ['create' + capitalizeString(inputObject.fieldInfo.typename)]: {
                  id: true,
                  name: true,
                  __args: {
                    name: inputObject.value,
                  },
                },
              })

              // force reload of memoized options, if any
              inputObject.fieldInfo.getOptions &&
                inputObject.fieldInfo
                  .getOptions(this, true)
                  .then((res) => (inputObject.options = res))

              value = results.id
            } else if (inputObject.value === null) {
              value = inputObject.value
            } else {
              value = inputObject.value.id
            }
          } else if (
            inputObject.fieldInfo.inputType === 'autocomplete' ||
            inputObject.fieldInfo.inputType === 'server-autocomplete'
          ) {
            // as we are using return-object option, the entire object will be returned for autocompletes, unless it is null
            value = inputObject.value ? inputObject.value.id : null
          } else {
            value = inputObject.value
          }

          // convert '__null' to null
          if (value === '__null') value = null

          inputs[inputObject.field] = inputObject.fieldInfo.parseValue
            ? inputObject.fieldInfo.parseValue(value)
            : value
        }

        // add mode
        let query
        if (this.mode === 'add') {
          query = {
            [this.recordInfo.addOptions.operationName ??
            'create' + this.capitalizedType]: {
              id: true,
              __args: collapseObject(inputs),
            },
          }
        } else {
          query = {
            [this.recordInfo.editOptions.operationName ??
            'update' + this.capitalizedType]: {
              id: true,
              __args: {
                item: {
                  id: this.selectedItem.id,
                },
                fields: collapseObject(inputs),
              },
            },
          }
        }
        const data = await executeJomql(this, query)

        this.$notifier.showSnackbar({
          message:
            this.capitalizedType +
            (this.mode === 'add' ? ' Added' : ' Updated'),
          variant: 'success',
        })

        this.$emit('handleSubmit', data)
      } catch (err) {
        handleError(this, err)
      }
      this.loading.editRecord = false
    },

    async loadRecord() {
      this.loading.loadRecord = true
      try {
        const fields =
          this.mode === 'edit'
            ? this.recordInfo.editOptions.fields
            : this.recordInfo.viewOptions.fields
        const data = await executeJomql(this, {
          ['get' + this.capitalizedType]: {
            ...collapseObject(
              fields.reduce((total, fieldKey) => {
                const fieldInfo = this.recordInfo.fields[fieldKey]
                // field unknown, abort
                if (!fieldInfo) throw new Error('Unknown field: ' + fieldKey)

                // if field is hidden, exclude
                if (fieldInfo.hidden) return total
                total[fieldKey] = true
                return total
              }, {})
            ),
            __args: {
              id: this.selectedItem.id,
            },
          },
        })

        // serialize any fields if necessary
        this.inputsArray = fields.map((fieldKey) => {
          const fieldInfo = this.recordInfo.fields[fieldKey]

          // field unknown, abort
          if (!fieldInfo) throw new Error('Unknown field: ' + fieldKey)

          const fieldValue = fieldInfo.hidden
            ? null
            : getNestedProperty(data, fieldKey)
          const inputObject = {
            field: fieldKey,
            fieldInfo,
            value: fieldInfo.serialize
              ? fieldInfo.serialize(fieldValue)
              : fieldValue,
            options: [],
          }

          // if inputType === 'server-autocomplete', only populate the options with the specific entry, if any, and if inputObject.value not null
          if (
            fieldInfo.inputType === 'server-autocomplete' ||
            fieldInfo.inputType === 'server-combobox'
          ) {
            inputObject.value = null // set this to null initially while the results load, to prevent console error
            if (fieldValue) {
              executeJomql(this, {
                [`get${capitalizeString(fieldInfo.typename)}`]: {
                  id: true,
                  name: true,
                  __args: {
                    id: fieldValue,
                  },
                },
              })
                .then((res) => {
                  // change value to object
                  inputObject.value = res

                  inputObject.options = [res]
                })
                .catch((e) => e)
            }
          } else {
            fieldInfo.getOptions &&
              fieldInfo
                .getOptions(this)
                .then((res) => (inputObject.options = res))
          }
          return inputObject
        })
      } catch (err) {
        handleError(this, err)
      }
      this.loading.loadRecord = false
    },

    loadDropdowns() {
      this.loading.loadDropdowns = true

      // load any other misc dropdowns
      this.loadMiscDropdowns && this.loadMiscDropdowns()

      this.loading.loadDropdowns = false
    },

    reset(hardReset = false) {
      // duplicate misc inputs, if any
      this.miscInputs = JSON.parse(JSON.stringify(this.originalMiscInputs))

      // load dropdowns in this.inputOptions
      this.loadDropdowns()

      // set all loading to false (could have been stuck from previous operations)
      for (const prop in this.loading) {
        this.loading[prop] = false
      }

      // initialize inputs
      if (this.mode === 'add') {
        this.inputsArray = this.recordInfo.addOptions.fields.map((fieldKey) => {
          const fieldInfo = this.recordInfo.fields[fieldKey]

          // field unknown, abort
          if (!fieldInfo) throw new Error('Unknown field: ' + fieldKey)

          let value
          let readonly = false

          // is the field in selectedItem? if so, use that and set field to readonly
          if (fieldKey in this.selectedItem) {
            value = this.selectedItem[fieldKey]
            readonly = true
          } else {
            value = fieldInfo.default ? fieldInfo.default(this) : null
          }

          const inputObject = {
            field: fieldKey,
            fieldInfo,
            value,
            options: [],
            readonly,
            loading: false,
            input: null,
            focused: false,
          }

          // if server-autocomplete and readonly, load only the specific entry
          if (
            fieldInfo.inputType === 'server-autocomplete' ||
            fieldInfo.inputType === 'server-combobox'
          ) {
            // only if readonly and value is truthy
            if (inputObject.readonly && inputObject.value) {
              executeJomql(this, {
                [`get${capitalizeString(fieldInfo.typename)}`]: {
                  id: true,
                  name: true,
                  __args: {
                    id: inputObject.value,
                  },
                },
              })
                .then((res) => {
                  inputObject.options = [res]
                })
                .catch((e) => e)
            }
          }

          // if it's readonly there's no point in adding the other options
          if (!inputObject.readonly) {
            fieldInfo.getOptions &&
              fieldInfo
                .getOptions(this)
                .then((res) => inputObject.options.push(...res))
          }

          return inputObject
        })
      } else {
        this.loadRecord()
      }

      if (hardReset) {
      }
    },
  },
}
