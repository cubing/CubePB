import { executeGiraffeql } from '~/services/giraffeql'
import {
  collapseObject,
  getNestedProperty,
  capitalizeString,
  handleError,
  isObject,
  serializeNestedProperty,
  setInputValue,
  getInputValue,
  getInputObject,
} from '~/services/base'
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

    // custom fields that will override add/edit/view options on recordInfo
    customFields: {
      type: Array,
    },

    // must be add, edit, view, or copy
    mode: {
      type: String,
      required: true,
      validator: (value) => {
        return ['add', 'edit', 'view', 'copy'].includes(value)
      },
    },

    // in dialog mode, some changes are made in the component, like max-height
    dialogMode: {
      type: Boolean,
      default: false,
    },

    generation: {
      type: Number,
      default: 0,
    },

    hiddenFields: {
      type: Array,
      default: () => [],
    },

    // the fields to return with handleSubmit, if any
    returnFields: {
      type: Object,
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

      currentItem: null,

      loading: {
        editRecord: false,
        loadRecord: false,
        loadDropdowns: false,
      },
    }
  },

  computed: {
    isLoading() {
      return this.loading.loadRecord || this.loading.loadDropdowns
    },

    capitalizedType() {
      return capitalizeString(this.recordInfo.typename)
    },
    title() {
      return (
        ((this.mode === 'add') | (this.mode === 'copy')
          ? 'New'
          : this.mode === 'edit'
          ? 'Edit'
          : 'View') +
        ' ' +
        this.recordInfo.name
      )
    },
    icon() {
      return this.mode === 'add' || this.mode === 'copy'
        ? 'mdi-plus'
        : this.mode === 'edit'
        ? 'mdi-pencil'
        : 'mdi-eye'
    },

    visibleInputsArray() {
      return this.hiddenFields.length
        ? this.inputsArray.filter(
            (inputObject) => !this.hiddenFields.includes(inputObject.field)
          )
        : this.inputsArray
    },

    /*     currentItem() {
      return {
        type: this.recordInfo.typename,
        id: this.selectedItem.id,
      }
    }, */
  },

  watch: {
    selectedItem() {
      this.reset(true)
    },
    generation() {
      this.reset()
    },
  },

  created() {
    this.reset(true)
  },

  methods: {
    setInputValue(key, value) {
      return setInputValue(this.inputsArray, key, value)
    },

    getInputValue(key) {
      return getInputValue(this.inputsArray, key)
    },

    getInputObject(key) {
      return getInputObject(this.inputsArray, key)
    },

    handleSubmit() {
      // if any comboboxes, wait for 500 ms before doing submit to let the value sync
      let sleep = false
      if (
        this.inputsArray.some((ele) => {
          return (
            ele.fieldInfo.inputType === 'combobox' ||
            ele.fieldInfo.inputType === 'server-combobox'
          )
        })
      ) {
        sleep = true
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
      // set editRecord loading to true to prevent clicking multiple times
      this.loading.editRecord = true

      setTimeout(this.submit, sleep ? 500 : 0)
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
              const results = await executeGiraffeql(this, {
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
            inputObject.fieldInfo.inputType === 'server-autocomplete' ||
            inputObject.fieldInfo.inputType === 'select'
          ) {
            // as we are using return-object option, the entire object will be returned for autocompletes/selects, unless it is null or a number
            value = isObject(inputObject.value)
              ? inputObject.value.id
              : Number.isNaN(inputObject.value)
              ? null
              : inputObject.value
          } else {
            value = inputObject.value
          }

          // convert '__null' to null
          if (value === '__null') value = null

          inputs[inputObject.field] = inputObject.fieldInfo.parseValue
            ? inputObject.fieldInfo.parseValue(value)
            : value
        }

        // add/copy mode
        let query
        if (this.mode === 'add' || this.mode === 'copy') {
          query = {
            [this.recordInfo.addOptions.operationName ??
            'create' + this.capitalizedType]: {
              id: true,
              ...this.returnFields,
              __args: collapseObject(inputs),
            },
          }
        } else {
          query = {
            [this.recordInfo.editOptions.operationName ??
            'update' + this.capitalizedType]: {
              id: true,
              ...this.returnFields,
              __args: {
                item: {
                  id: this.selectedItem.id,
                },
                fields: collapseObject(inputs),
              },
            },
          }
        }
        const data = await executeGiraffeql(this, query)

        this.$notifier.showSnackbar({
          message:
            this.recordInfo.name +
            (this.mode === 'add' || this.mode === 'copy'
              ? ' Added'
              : ' Updated'),
          variant: 'success',
        })

        this.$emit('handleSubmit', data)
        this.$emit('close')

        // reset inputs
        this.resetInputs()
      } catch (err) {
        handleError(this, err)
      }
      this.loading.editRecord = false
    },

    async loadRecord() {
      this.loading.loadRecord = true
      try {
        // create a map field -> serializeFn for fast serialization
        const serializeMap = new Map()

        const fields =
          this.customFields ??
          (this.mode === 'copy'
            ? this.recordInfo.copyOptions.fields
            : this.mode === 'edit'
            ? this.recordInfo.editOptions.fields
            : this.recordInfo.viewOptions.fields)
        const data = await executeGiraffeql(this, {
          ['get' + this.capitalizedType]: {
            __typename: true,
            ...collapseObject(
              fields.reduce(
                (total, fieldKey) => {
                  const fieldInfo = this.recordInfo.fields[fieldKey]
                  // field unknown, abort
                  if (!fieldInfo) throw new Error('Unknown field: ' + fieldKey)

                  // if field is hidden, exclude
                  if (fieldInfo.hidden) return total

                  // if field has '+', add all of the fields
                  if (fieldKey.match(/\+/)) {
                    fieldKey.split(/\+/).forEach((field) => {
                      total[field] = true
                      // assuming all fields are valid
                      serializeMap.set(
                        field,
                        this.recordInfo.fields[field].serialize
                      )
                    })
                  } else {
                    total[fieldKey] = true
                    serializeMap.set(fieldKey, fieldInfo.serialize)
                  }
                  return total
                },
                { id: true }
              )
            ),
            __args: {
              id: this.selectedItem.id,
            },
          },
        })

        // save record
        this.currentItem = data

        // remove any undefined serializeMap elements
        serializeMap.forEach((val, key) => {
          if (val === undefined) serializeMap.delete(key)
        })

        // apply serialization to results
        serializeMap.forEach((serialzeFn, field) => {
          serializeNestedProperty(data, field, serialzeFn)
        })

        // if copy mode, load all add fields
        const inputFields =
          this.mode === 'copy' ? this.recordInfo.addOptions.fields : fields

        // keep track of promises relating to dropdowns/options
        const dropdownPromises = []

        // build inputs Array
        this.inputsArray = await Promise.all(
          inputFields.map((fieldKey) => {
            const fieldInfo = this.recordInfo.fields[fieldKey]

            // field unknown, abort
            if (!fieldInfo) throw new Error('Unknown field: ' + fieldKey)

            let fieldValue

            // if copy mode and fieldKey not in original fields, use default
            if (this.mode === 'copy' && !fields.includes(fieldKey)) {
              fieldValue = fieldInfo.default ? fieldInfo.default(this) : null
            } else {
              fieldValue = fieldInfo.hidden
                ? null
                : getNestedProperty(data, fieldKey)
            }

            const inputObject = {
              field: fieldKey.split(/\+/)[0],
              fieldKey,
              fieldInfo,
              recordInfo: this.recordInfo,
              value: fieldValue, // already serialized
              options: [],
              readonly:
                this.mode === 'view'
                  ? true
                  : this.mode === 'copy'
                  ? fields.includes(fieldKey)
                  : false,
              generation: 0,
            }

            // if inputType === 'server-autocomplete', only populate the options with the specific entry, if any, and if inputObject.value not null
            if (
              fieldInfo.inputType === 'server-autocomplete' ||
              fieldInfo.inputType === 'server-combobox'
            ) {
              inputObject.value = null // set this to null initially while the results load, to prevent console error
              if (fieldValue) {
                dropdownPromises.push(
                  executeGiraffeql(this, {
                    [`get${capitalizeString(fieldInfo.typename)}`]: {
                      id: true,
                      name: true,
                      ...(fieldInfo.inputOptions?.hasAvatar && {
                        avatar: true,
                      }),
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
                )
              }
            } else {
              fieldInfo.getOptions &&
                dropdownPromises.push(
                  fieldInfo
                    .getOptions(this)
                    .then((res) => (inputObject.options = res))
                )
            }
            return inputObject
          })
        )

        // wait for all dropdown-related promises to complete
        await Promise.all(dropdownPromises)
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

    resetInputs() {
      this.inputsArray.forEach((inputObject) => {
        const fieldInfo = this.recordInfo.fields[inputObject.fieldKey]

        // field unknown, abort
        if (!fieldInfo)
          throw new Error('Unknown field: ' + inputObject.fieldKey)

        if (inputObject.fieldKey in this.selectedItem) {
          inputObject.value = this.selectedItem[inputObject.fieldKey]
        } else {
          inputObject.value = fieldInfo.default ? fieldInfo.default(this) : null
        }
      })
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
            fieldKey,
            fieldInfo,
            recordInfo: this.recordInfo,
            value,
            options: [],
            readonly,
            loading: false,
            input: null,
            focused: false,
            generation: 0,
          }

          // if server-autocomplete and readonly, load only the specific entry
          if (
            fieldInfo.inputType === 'server-autocomplete' ||
            fieldInfo.inputType === 'server-combobox'
          ) {
            // only if readonly and value is truthy
            if (inputObject.readonly && inputObject.value) {
              executeGiraffeql(this, {
                [`get${capitalizeString(fieldInfo.typename)}`]: {
                  id: true,
                  name: true,
                  ...(fieldInfo.inputOptions?.hasAvatar && { avatar: true }),
                  __args: {
                    id: inputObject.value,
                  },
                },
              })
                .then((res) => {
                  inputObject.options = [res]
                  inputObject.value = res
                })
                .catch((e) => e)
            }
          }

          // add the other options, if any
          fieldInfo.getOptions &&
            fieldInfo.getOptions(this).then((res) => {
              inputObject.options.push(...res)
            })

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
