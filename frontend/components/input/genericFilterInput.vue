<template>
  <div>
    <v-textarea
      v-if="item.inputType === 'textarea'"
      v-model="item.value"
      filled
      auto-grow
      rows="1"
      dense
      class="py-0"
      :label="label"
      :readonly="isReadonly"
      :append-icon="
        item.value === null ? 'mdi-null' : isReadonly ? null : 'mdi-close'
      "
      :hint="item.fieldInfo.hint"
      persistent-hint
      @click:append="clearInput()"
      @input="triggerInput()"
    ></v-textarea>
    <v-switch
      v-else-if="item.inputType === 'switch'"
      v-model="item.value"
      :label="label"
      :readonly="isReadonly"
      :append-icon="
        item.value === null ? 'mdi-null' : isReadonly ? null : 'mdi-close'
      "
      :hint="item.fieldInfo.hint"
      persistent-hint
      @click:append="clearInput()"
      @input="triggerInput()"
    ></v-switch>
    <v-menu
      v-else-if="item.inputType === 'datepicker'"
      v-model="item.focused"
      :close-on-content-click="false"
      :nudge-right="40"
      transition="scale-transition"
      offset-y
      min-width="290px"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-text-field
          v-model="item.value"
          :label="label"
          :readonly="isReadonly"
          :append-icon="
            item.value === null ? 'mdi-null' : isReadonly ? null : 'mdi-close'
          "
          :hint="item.fieldInfo.hint"
          persistent-hint
          filled
          autocomplete="off"
          v-bind="attrs"
          v-on="on"
          @click:append="clearInput()"
        ></v-text-field>
      </template>
      <v-date-picker
        v-model="item.value"
        color="primary"
        no-title
        :readonly="isReadonly"
        @input=";(item.focused = false) || triggerInput()"
      ></v-date-picker>
    </v-menu>
    <v-autocomplete
      v-else-if="
        item.inputType === 'autocomplete' || item.inputType === 'combobox'
      "
      v-model="item.value"
      :items="item.options"
      item-text="name"
      item-value="id"
      :label="label"
      :readonly="isReadonly"
      :append-icon="
        item.value === null ? 'mdi-null' : isReadonly ? null : 'mdi-close'
      "
      :hint="item.fieldInfo.hint"
      persistent-hint
      filled
      return-object
      class="py-0"
      @click:append="clearInput()"
      @input="triggerInput()"
    ></v-autocomplete>
    <v-autocomplete
      v-else-if="
        item.inputType === 'server-autocomplete' ||
        item.inputType === 'server-combobox'
      "
      v-model="item.value"
      :loading="item.loading"
      :search-input.sync="item.input"
      :items="item.options"
      item-text="name"
      item-value="id"
      :label="label"
      :readonly="isReadonly"
      :append-icon="
        item.value === null ? 'mdi-null' : isReadonly ? null : 'mdi-close'
      "
      :hint="item.fieldInfo.hint"
      persistent-hint
      filled
      hide-no-data
      return-object
      class="py-0"
      :chips="
        item.fieldInfo.inputOptions && item.fieldInfo.inputOptions.hasAvatar
      "
      @update:search-input="handleSearchUpdate(item)"
      @blur="item.focused = false"
      @focus="item.focused = true"
      @click:append="clearInput()"
      @input="triggerInput()"
    >
      <template
        v-if="
          item.fieldInfo.inputOptions && item.fieldInfo.inputOptions.hasAvatar
        "
        v-slot:item="data"
      >
        <v-chip pill>
          <v-avatar left>
            <v-img
              v-if="data.item.avatar"
              :src="data.item.avatar"
              contain
            ></v-img
            ><v-icon v-else>{{ icon }} </v-icon>
          </v-avatar>
          {{ data.item.name }}
        </v-chip>
      </template>
      <template
        v-if="
          item.fieldInfo.inputOptions && item.fieldInfo.inputOptions.hasAvatar
        "
        v-slot:selection="data"
      >
        <v-chip v-bind="data.attrs" pill>
          <v-avatar left>
            <v-img
              v-if="data.item.avatar"
              :src="data.item.avatar"
              contain
            ></v-img
            ><v-icon v-else>{{ icon }}</v-icon>
          </v-avatar>
          {{ data.item.name }}
        </v-chip>
      </template>
    </v-autocomplete>
    <v-select
      v-else-if="
        item.inputType === 'select' || item.inputType === 'multiple-select'
      "
      v-model="item.value"
      :items="item.options"
      :multiple="item.inputType === 'multiple-select'"
      filled
      :label="label"
      :readonly="isReadonly"
      :append-icon="
        item.value === null ? 'mdi-null' : isReadonly ? null : 'mdi-close'
      "
      :hint="item.fieldInfo.hint"
      persistent-hint
      return-object
      item-text="name"
      item-value="id"
      class="py-0"
      @click:append="clearInput()"
      @input="triggerInput()"
    ></v-select>
    <v-text-field
      v-else
      v-model="item.value"
      :label="label"
      :readonly="isReadonly"
      :rules="item.fieldInfo.inputRules"
      :hint="item.fieldInfo.hint"
      :append-icon="
        item.value === null ? 'mdi-null' : isReadonly ? null : 'mdi-close'
      "
      persistent-hint
      filled
      dense
      class="py-0"
      @click:append="clearInput()"
      @input="triggerInput()"
      @keyup.enter="triggerSubmit()"
    ></v-text-field>
  </div>
</template>

<script>
import {
  capitalizeString,
  isObject,
  handleError,
  getIcon,
} from '~/services/base'
import { executeGiraffeql } from '~/services/giraffeql'

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    allItems: {
      type: Array,
      required: false,
      default: () => [],
    },
  },

  data() {
    return {
      filesData: [],
    }
  },

  computed: {
    isReadonly() {
      return this.item.readonly
    },
    label() {
      return (
        this.item.filterInfo.title ||
        this.item.fieldInfo.text ||
        this.item.field
      )
    },
    icon() {
      return this.item.fieldInfo.typename
        ? getIcon(this.item.fieldInfo.typename)
        : null
    },
  },

  watch: {
    'item.generation'() {
      this.reset()
    },
  },

  mounted() {
    this.reset()
  },

  methods: {
    clearInput() {
      this.item.value = null
      this.triggerInput()
    },

    triggerInput() {
      this.$emit('handle-input')
    },

    triggerSubmit() {
      this.$emit('handle-submit')
    },

    handleSearchUpdate(inputObject) {
      if (!inputObject.input || !inputObject.focused) return

      // if inputObject is object and search === value.name, skip
      if (
        isObject(inputObject.value) &&
        inputObject.input === inputObject.value.name
      ) {
        return
      }

      // cancel pending call, if any
      clearTimeout(this._timerId)

      // delay new call 500ms
      this._timerId = setTimeout(() => {
        this.loadSearchResults(inputObject)
      }, 500)
    },

    async loadSearchResults(inputObject) {
      inputObject.loading = true
      try {
        const results = await executeGiraffeql(this, {
          [`get${capitalizeString(inputObject.fieldInfo.typename)}Paginator`]: {
            edges: {
              node: {
                id: true,
                name: true,
                ...(inputObject.fieldInfo.inputOptions?.hasAvatar && {
                  avatar: true,
                }),
              },
            },
            __args: {
              first: 20,
              search: inputObject.input,
              filterBy: inputObject.fieldInfo.lookupFilters
                ? inputObject.fieldInfo.lookupFilters(this, this.allItems)
                : [],
            },
          },
        })

        inputObject.options = results.edges.map((edge) => edge.node)
      } catch (err) {
        handleError(this, err)
      }
      inputObject.loading = false
    },

    reset() {},
  },
}
</script>
