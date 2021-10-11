<template>
  <v-card flat>
    <slot name="toolbar"></slot>
    <v-card-text :class="{ 'max-height': dialogMode }" class="pt-3">
      <CircularLoader
        v-if="isLoading"
        style="min-height: 250px"
      ></CircularLoader>
      <v-container v-else class="text-left">
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left" style="width: 150px">Name</th>
                <th class="text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in inputsArray" :key="i">
                <td>{{ item.fieldInfo.text }}</td>
                <td>
                  <component
                    :is="item.fieldInfo.component"
                    v-if="item.fieldInfo.component"
                    :item="currentItem"
                    :field-path="
                      item.fieldInfo.compoundOptions
                        ? item.fieldInfo.compoundOptions.pathPrefix
                        : item.field
                    "
                    @submit="$emit('handleSubmit')"
                    @item-updated="$emit('item-updated') && reset()"
                  ></component>
                  <span v-else style="white-space: break-spaces">{{
                    getNestedProperty(currentItem, item.field)
                  }}</span>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-container>
    </v-card-text>

    <v-card-actions v-if="!isLoading">
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
import { executeGiraffeql } from '~/services/giraffeql'
import {
  getNestedProperty,
  handleError,
  collapseObject,
  capitalizeString,
} from '~/services/base'
import CircularLoader from '~/components/common/circularLoader.vue'

export default {
  components: {
    CircularLoader,
  },
  data() {
    return {
      loading: {
        loadRecord: false,
      },

      inputsArray: [],
    }
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
  },

  computed: {
    isLoading() {
      return this.loading.loadRecord
    },

    capitalizedType() {
      return capitalizeString(this.recordInfo.typename)
    },
  },

  watch: {
    generation() {
      this.reset()
    },
  },

  mounted() {
    this.reset()
  },

  methods: {
    getNestedProperty,

    async loadRecord() {
      this.loading.loadRecord = true
      try {
        // create a map field -> serializeFn for fast serialization
        const serializeMap = new Map()

        const fields = this.recordInfo.viewOptions.fields
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

        // build inputs Array
        this.inputsArray = await Promise.all(
          fields.map((fieldKey) => {
            const fieldInfo = this.recordInfo.fields[fieldKey]

            // field unknown, abort
            if (!fieldInfo) throw new Error('Unknown field: ' + fieldKey)

            const fieldValue = fieldInfo.hidden
              ? null
              : getNestedProperty(data, fieldKey)

            const inputObject = {
              field: fieldKey.split(/\+/)[0],
              fieldInfo,
              value: fieldValue, // already serialized
              options: [],
              readonly: true,
              generation: 0,
            }

            return inputObject
          })
        )
      } catch (err) {
        handleError(this, err)
      }
      this.loading.loadRecord = false
    },

    reset() {
      this.loadRecord()
    },
  },
}
</script>

<style scoped>
.max-height {
  max-height: 600px;
}
</style>
