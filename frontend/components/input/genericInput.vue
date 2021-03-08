<template>
  <div>
    <div v-if="item.fieldInfo.inputType === 'html'" class="pb-4">
      <wysiwyg v-model="item.value" />
    </div>
    <div
      v-else-if="item.fieldInfo.inputType === 'multiple-image'"
      class="pb-4 text-center"
    >
      <v-container fluid grid-list-xs class="px-0">
        <Draggable
          v-model="item.value"
          class="layout row wrap"
          :disabled="mode === 'view'"
        >
          <v-flex
            v-for="(imageUrl, imageIndex) in item.value"
            :key="imageIndex"
            :class="'xs3'"
          >
            <v-card flat>
              <v-system-bar v-if="mode !== 'view'" lights-out>
                <v-icon @click="void 0">mdi-arrow-all</v-icon>
                <v-spacer></v-spacer>
                <v-btn icon @click.native="removeFileByIndex(item, imageIndex)">
                  <v-icon color="error">mdi-close</v-icon>
                </v-btn>
              </v-system-bar>
              <v-img :src="imageUrl" aspect-ratio="1" contain></v-img>
            </v-card>
          </v-flex>
        </Draggable>
      </v-container>

      <v-file-input
        v-model="item.input"
        :label="
          (item.fieldInfo.text || item.field) +
          (item.fieldInfo.optional ? ' (optional)' : '')
        "
        multiple
        :hint="item.fieldInfo.hint"
        persistent-hint
        :clearable="false"
        @change="handleMultipleFileInputChange(item)"
      >
        <template v-slot:selection="{ file, text }">
          <v-chip
            small
            label
            color="primary"
            close
            close-icon="mdi-close-outline"
            @click:close="handleMultipleFileInputClear(item, file)"
          >
            {{ text }} -
            {{
              file.fileUploadObject
                ? file.fileUploadObject.progress.toFixed(1)
                : ''
            }}%
          </v-chip>
        </template>
      </v-file-input>
    </div>

    <div
      v-else-if="item.fieldInfo.inputType === 'single-image'"
      class="pb-4 text-center"
    >
      <v-img
        v-if="item.value"
        :src="item.value"
        contain
        max-height="200"
      ></v-img>
      <v-icon v-else>mdi-file-image</v-icon>
      <v-file-input
        v-if="!item.readonly && mode !== 'view'"
        v-model="item.input"
        :append-icon="item.value ? 'mdi-close' : null"
        :clearable="false"
        accept="image/*"
        :label="
          (item.fieldInfo.text || item.field) +
          (item.fieldInfo.optional ? ' (optional)' : '')
        "
        :loading="item.loading"
        :hint="item.fieldInfo.hint"
        persistent-hint
        @click:append="handleSingleFileInputClear(item)"
        @change="handleSingleFileInputChange(item)"
      >
        <template v-slot:selection="{ file, text }">
          <v-chip
            small
            label
            color="primary"
            close
            close-icon="mdi-close-outline"
            @click:close="handleSingleFileInputClear(item)"
          >
            {{ text }} -
            {{
              file.fileUploadObject
                ? file.fileUploadObject.progress.toFixed(1)
                : ''
            }}%
          </v-chip>
        </template>
      </v-file-input>
    </div>
    <div
      v-else-if="item.fieldInfo.inputType === 'avatar'"
      class="pb-4"
      :class="
        item.readonly || mode === 'view' ? 'text-center' : 'd-flex text-left'
      "
    >
      <v-avatar size="64">
        <v-img v-if="item.value" :src="item.value"></v-img>
        <v-icon v-else>mdi-account</v-icon></v-avatar
      >
      <v-file-input
        v-if="!item.readonly && mode !== 'view'"
        v-model="item.input"
        :append-icon="item.value ? 'mdi-close' : null"
        :clearable="false"
        class="pl-2"
        accept="image/*"
        :label="
          (item.fieldInfo.text || item.field) +
          (item.fieldInfo.optional ? ' (optional)' : '')
        "
        :hint="item.fieldInfo.hint"
        persistent-hint
        :loading="item.loading"
        @click:append="handleSingleFileInputClear(item)"
        @change="handleSingleFileInputChange(item)"
      >
        <template v-slot:selection="{ file, text }">
          <v-chip
            small
            label
            color="primary"
            close
            close-icon="mdi-close-outline"
            @click:close="handleSingleFileInputClear(item)"
          >
            {{ text }} -
            {{
              file.fileUploadObject
                ? file.fileUploadObject.progress.toFixed(1)
                : ''
            }}%
          </v-chip>
        </template>
      </v-file-input>
    </div>
    <v-textarea
      v-else-if="item.fieldInfo.inputType === 'textarea'"
      v-model="item.value"
      filled
      dense
      class="py-0"
      :label="
        (item.fieldInfo.text || item.field) +
        (item.fieldInfo.optional ? ' (optional)' : '')
      "
      :readonly="item.readonly || mode === 'view'"
      :hint="item.fieldInfo.hint"
      persistent-hint
    ></v-textarea>
    <v-switch
      v-else-if="item.fieldInfo.inputType === 'switch'"
      v-model="item.value"
      :label="
        (item.fieldInfo.text || item.field) +
        (item.fieldInfo.optional ? ' (optional)' : '')
      "
      :readonly="item.readonly || mode === 'view'"
      :hint="item.fieldInfo.hint"
      persistent-hint
    ></v-switch>
    <v-menu
      v-else-if="item.fieldInfo.inputType === 'datepicker'"
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
          :label="
            (item.fieldInfo.text || item.field) +
            (item.fieldInfo.optional ? ' (optional)' : '')
          "
          :readonly="item.readonly || mode === 'view'"
          :clearable="!item.readonly && mode !== 'view'"
          :hint="item.fieldInfo.hint"
          persistent-hint
          filled
          autocomplete="off"
          v-bind="attrs"
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker
        v-model="item.value"
        color="primary"
        no-title
        :readonly="item.readonly || mode === 'view'"
        @input="item.focused = false"
      ></v-date-picker>
    </v-menu>
    <v-combobox
      v-else-if="item.fieldInfo.inputType === 'combobox'"
      ref="combobox"
      v-model="item.value"
      :items="item.options"
      item-text="name"
      item-value="id"
      :label="
        (item.fieldInfo.text || item.field) +
        (item.fieldInfo.optional ? ' (optional)' : '')
      "
      :readonly="item.readonly || mode === 'view'"
      :clearable="!item.readonly && mode !== 'view'"
      :hint="item.fieldInfo.hint"
      persistent-hint
      filled
      class="py-0"
    ></v-combobox>
    <v-combobox
      v-else-if="item.fieldInfo.inputType === 'server-combobox'"
      ref="combobox"
      v-model="item.value"
      :loading="item.loading"
      :search-input.sync="item.input"
      :items="item.options"
      item-text="name"
      item-value="id"
      :label="
        (item.fieldInfo.text || item.field) +
        (item.fieldInfo.optional ? ' (optional)' : '')
      "
      :readonly="item.readonly || mode === 'view'"
      :clearable="!item.readonly && mode !== 'view'"
      :hint="item.fieldInfo.hint"
      persistent-hint
      filled
      hide-no-data
      cache-items
      class="py-0"
      @update:search-input="handleSearchUpdate(item)"
      @blur="item.focused = false"
      @focus="item.focused = true"
    ></v-combobox>
    <v-autocomplete
      v-else-if="item.fieldInfo.inputType === 'autocomplete'"
      v-model="item.value"
      :items="item.options"
      item-text="name"
      item-value="id"
      :label="
        (item.fieldInfo.text || item.field) +
        (item.fieldInfo.optional ? ' (optional)' : '')
      "
      :readonly="item.readonly || mode === 'view'"
      :clearable="!item.readonly && mode !== 'view'"
      :hint="item.fieldInfo.hint"
      persistent-hint
      filled
      return-object
      class="py-0"
    ></v-autocomplete>
    <v-autocomplete
      v-else-if="item.fieldInfo.inputType === 'server-autocomplete'"
      v-model="item.value"
      :loading="item.loading"
      :search-input.sync="item.input"
      :items="item.options"
      item-text="name"
      item-value="id"
      :label="
        (item.fieldInfo.text || item.field) +
        (item.fieldInfo.optional ? ' (optional)' : '')
      "
      :readonly="item.readonly || mode === 'view'"
      :clearable="!item.readonly && mode !== 'view'"
      :hint="item.fieldInfo.hint"
      persistent-hint
      filled
      hide-no-data
      cache-items
      return-object
      class="py-0"
      @update:search-input="handleSearchUpdate(item)"
      @blur="item.focused = false"
      @focus="item.focused = true"
    ></v-autocomplete>
    <v-select
      v-else-if="item.fieldInfo.inputType === 'select'"
      v-model="item.value"
      :items="item.options"
      filled
      :label="
        (item.fieldInfo.text || item.field) +
        (item.fieldInfo.optional ? ' (optional)' : '')
      "
      :readonly="item.readonly || mode === 'view'"
      :clearable="!item.readonly && mode !== 'view'"
      :hint="item.fieldInfo.hint"
      persistent-hint
      item-text="name"
      item-value="id"
      class="py-0"
    ></v-select>
    <v-text-field
      v-else
      v-model="item.value"
      :label="
        (item.fieldInfo.text || item.field) +
        (item.fieldInfo.optional ? ' (optional)' : '')
      "
      :readonly="item.readonly || mode === 'view'"
      :rules="item.fieldInfo.inputRules"
      :hint="item.fieldInfo.hint"
      persistent-hint
      filled
      dense
      class="py-0"
    ></v-text-field>
  </div>
</template>

<script>
import Draggable from 'vuedraggable'
// file upload not supported in this project
// import { uploadFile } from '~/services/file'
import { capitalizeString, isObject, handleError } from '~/services/common'
import { executeJomql } from '~/services/jomql'

export default {
  components: {
    Draggable,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },

    // must be add, edit, or view
    mode: {
      type: String,
      required: true,
      validator: (value) => {
        return ['add', 'edit', 'view', 'delete', 'share'].includes(value)
      },
    },
  },
  methods: {
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

    /*     removeFileByIndex(inputObject, index) {
      if (inputObject.value) {
        inputObject.value.splice(index, 1)
      }
    },

    handleFileRemove(inputObject, file) {
      // cancel the uploadTask, if there is one
      file.fileUploadObject?.uploadTask.cancel()

      // remove the file from the inputObject files queue
      const index = inputObject.files.indexOf(file)
      if (index !== -1) inputObject.files.splice(index, 1)

      // if no files left, set loading to false
      if (inputObject.files.length < 1) inputObject.loading = false
    },

    handleMultipleFileInputClear(inputObject, file) {
      const index = inputObject.input.indexOf(file)

      if (index !== -1) {
        inputObject.input[index].fileUploadObject?.uploadTask.cancel()
        inputObject.input.splice(index, 1)
      }

      // if no files left, set loading to false
      if (inputObject.input.length < 1) {
        inputObject.loading = false
      }
    },

    handleMultipleFileInputChange(inputObject) {
      this.$set(inputObject, 'loading', true)

      // inputObject.input expected to be array
      inputObject.input.forEach((currentFile) => {
        uploadFile(this, currentFile, (file) => {
          // add finished URL to value
          inputObject.value.push(file.fileUploadObject.servingUrl)

          // remove file from input
          const index = inputObject.input.indexOf(file)
          if (index !== -1) inputObject.input.splice(index, 1)

          // if no files left, finish up
          if (inputObject.input.length < 1) {
            inputObject.loading = false
            this.$notifier.showSnackbar({
              message: 'File Uploaded',
              variant: 'success',
            })
          }
        })
      })
    },

    handleSingleFileInputClear(inputObject) {
      inputObject.value = null
      if (inputObject.filesQueue) {
        inputObject.filesQueue.forEach((file) => {
          file.fileUploadObject?.uploadTask.cancel()
        })
      }
      inputObject.filesQueue = []
      inputObject.input = null
      inputObject.loading = false
    },

    handleSingleFileInputChange(inputObject) {
      if (!inputObject.input) {
        this.handleSingleFileInputClear(inputObject)
        return
      }
      this.$set(inputObject, 'loading', true)

      if (inputObject.filesQueue) {
        // cancel any existing file uploads, clear out file queue
        inputObject.filesQueue.forEach((file) => {
          file.fileUploadObject?.uploadTask.cancel()
        })
      }

      // reset the filesQueue
      inputObject.filesQueue = [inputObject.input]

      // upload the file(s) to CDN, then load them into value on finish
      uploadFile(this, inputObject.input, (file) => {
        inputObject.value = file.fileUploadObject.servingUrl
        inputObject.loading = false

        // remove from filesQueue
        const index = inputObject.filesQueue.indexOf(file)
        if (index !== -1) inputObject.filesQueue.splice(index, 1)

        this.$notifier.showSnackbar({
          message: 'File Uploaded',
          variant: 'success',
        })
      })
    }, */

    async loadSearchResults(inputObject) {
      inputObject.loading = true
      try {
        const results = await executeJomql(this, {
          [`get${capitalizeString(inputObject.fieldInfo.typename)}Paginator`]: {
            edges: {
              node: {
                id: true,
                name: true,
              },
            },
            __args: {
              first: 20,
              search: inputObject.input,
              filterBy: inputObject.fieldInfo.lookupFilters
                ? inputObject.fieldInfo.lookupFilters(this)
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
  },
}
</script>
