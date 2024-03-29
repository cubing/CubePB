<template>
  <div>
    <div v-if="item.fieldInfo.inputType === 'html'" class="mb-4">
      <wysiwyg v-model="item.value" />
    </div>
    <!-- files not supported
    <div
      v-else-if="item.fieldInfo.inputType === 'multiple-file'"
      class="mb-4 text-left highlighted-bg"
    >
      <v-container v-if="filesData.length" fluid grid-list-xs class="px-0">
        <Draggable
          v-model="filesData"
          :disabled="item.readonly"
          @change="handleFilesDataUpdate()"
        >
          <FileChip
            v-for="(file, index) in filesData"
            :key="index"
            :file="file"
            downloadable
            small
            label
            :close="!item.readonly"
            close-icon="mdi-close-outline"
            class="mr-2"
            @handleCloseClick="removeFileByIndex(index)"
          ></FileChip>
        </Draggable>
      </v-container>
      <div v-cloak @drop.prevent="handleMultipleDropFile" @dragover.prevent>
        <v-file-input
          v-model="item.input"
          :label="
            (item.fieldInfo.text || item.field) +
            ' (Drag and Drop)' +
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
    </div>
    <div
      v-else-if="item.fieldInfo.inputType === 'multiple-media'"
      class="mb-4 text-left highlighted-bg"
    >
      <v-container v-if="filesData.length" fluid grid-list-xs class="px-0">
        <Draggable
          v-model="filesData"
          class="layout row wrap"
          :disabled="item.readonly"
          @change="handleFilesDataUpdate()"
        >
          <MediaChip
            v-for="(file, index) in filesData"
            :key="index"
            :file="file"
            downloadable
            draggable
            close
            :readonly="item.readonly"
            class="xs3"
            @handleCloseClick="removeFileByIndex(index)"
          ></MediaChip>
        </Draggable>
      </v-container>
      <div v-cloak @drop.prevent="handleMultipleDropFile" @dragover.prevent>
        <v-file-input
          v-model="item.input"
          :label="
            (item.fieldInfo.text || item.field) +
            ' (Drag and Drop)' +
            (item.fieldInfo.optional ? ' (optional)' : '')
          "
          multiple
          accept="image/*"
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
    </div>
    <div
      v-else-if="item.fieldInfo.inputType === 'multiple-image'"
      class="mb-4 text-center"
    >
      <v-container fluid grid-list-xs class="px-0">
        <Draggable
          v-model="item.value"
          class="layout row wrap"
          :disabled="item.readonly"
        >
          <v-flex
            v-for="(imageUrl, imageIndex) in item.value"
            :key="imageIndex"
            :class="'xs3'"
          >
            <v-card flat>
              <v-system-bar v-if="!item.readonly" lights-out>
                <v-icon @click="void 0">mdi-arrow-all</v-icon>
                <v-spacer></v-spacer>
                <v-btn icon @click.native="removeFileByIndex(imageIndex)">
                  <v-icon color="error">mdi-close</v-icon>
                </v-btn>
              </v-system-bar>
              <v-img :src="imageUrl" aspect-ratio="1" contain></v-img>
            </v-card>
          </v-flex>
        </Draggable>
      </v-container>
      <div v-cloak @drop.prevent="handleMultipleDropFile" @dragover.prevent>
        <v-file-input
          v-model="item.input"
          :label="
            (item.fieldInfo.text || item.field) +
            ' (Drag and Drop)' +
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
    </div>

    <div
      v-else-if="item.fieldInfo.inputType === 'single-image'"
      class="mb-4 text-center"
    >
      <v-img
        v-if="item.value"
        :src="item.value"
        contain
        max-height="200"
      ></v-img>
      <v-icon v-else>mdi-file-image</v-icon>
      <div v-cloak @drop.prevent="handleSingleDropFile" @dragover.prevent>
        <v-file-input
          v-if="!item.readonly"
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
    </div>
    -->
    <div
      v-else-if="item.fieldInfo.inputType === 'avatar'"
      class="mb-4"
      :class="isReadonly ? 'text-center' : 'd-flex text-left'"
    >
      <v-avatar size="64">
        <v-img v-if="item.value" :src="item.value"></v-img>
        <v-icon v-else>{{ recordIcon }}</v-icon>
      </v-avatar>
      <v-file-input
        v-if="!item.readonly"
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
      auto-grow
      rows="1"
      dense
      class="py-0"
      :label="
        (item.fieldInfo.text || item.field) +
        (item.fieldInfo.optional ? ' (optional)' : '')
      "
      :readonly="isReadonly"
      :append-icon="
        item.value === null ? 'mdi-null' : isReadonly ? null : 'mdi-close'
      "
      :hint="item.fieldInfo.hint"
      persistent-hint
      @click:append="item.value = null"
    ></v-textarea>
    <v-switch
      v-else-if="item.fieldInfo.inputType === 'switch'"
      v-model="item.value"
      :label="
        (item.fieldInfo.text || item.field) +
        (item.fieldInfo.optional ? ' (optional)' : '')
      "
      :readonly="isReadonly"
      :append-icon="
        item.value === null ? 'mdi-null' : isReadonly ? null : 'mdi-close'
      "
      :hint="item.fieldInfo.hint"
      persistent-hint
      @click:append="item.value = null"
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
          @click:append="item.value = null"
        ></v-text-field>
      </template>
      <v-date-picker
        v-model="item.value"
        color="primary"
        no-title
        :readonly="isReadonly"
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
      :readonly="isReadonly"
      :append-icon="
        item.value === null ? 'mdi-null' : isReadonly ? null : 'mdi-close'
      "
      :hint="item.fieldInfo.hint"
      persistent-hint
      filled
      class="py-0"
      @click:append="item.value = null"
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
      :readonly="isReadonly"
      :append-icon="
        item.value === null ? 'mdi-null' : isReadonly ? null : 'mdi-close'
      "
      :hint="item.fieldInfo.hint"
      persistent-hint
      filled
      hide-no-data
      class="py-0"
      :chips="
        item.fieldInfo.inputOptions && item.fieldInfo.inputOptions.hasAvatar
      "
      @update:search-input="handleSearchUpdate(item)"
      @blur="item.focused = false"
      @focus="item.focused = true"
      @click:append="item.value = null"
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
    </v-combobox>
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
      :readonly="isReadonly"
      :append-icon="
        item.value === null ? 'mdi-null' : isReadonly ? null : 'mdi-close'
      "
      :hint="item.fieldInfo.hint"
      persistent-hint
      filled
      return-object
      class="py-0"
      @click:append="item.value = null"
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
      @click:append="item.value = null"
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
        item.fieldInfo.inputType === 'select' ||
        item.fieldInfo.inputType === 'multiple-select'
      "
      v-model="item.value"
      :items="item.options"
      :multiple="item.fieldInfo.inputType === 'multiple-select'"
      filled
      :label="
        (item.fieldInfo.text || item.field) +
        (item.fieldInfo.optional ? ' (optional)' : '')
      "
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
      @click:append="item.value = null"
    ></v-select>
    <div
      v-else-if="item.fieldInfo.inputType === 'key-value-array'"
      class="accent rounded-sm mb-4"
    >
      <v-container>
        <v-row>
          <v-col cols="12">
            <div class="subtitle-1">
              {{
                (item.fieldInfo.text || item.field) +
                (item.fieldInfo.optional ? ' (optional)' : '')
              }}
              <v-btn v-if="!isReadonly" icon @click="addRow()">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
              <v-spacer></v-spacer>
            </div>
          </v-col>
        </v-row>
        <div v-if="item.value.length > 0">
          <v-row v-for="(subItem, i) in item.value" :key="i">
            <v-col cols="6" class="py-0">
              <v-text-field
                v-model="subItem.key"
                label="Key"
                :readonly="isReadonly"
                :rules="item.fieldInfo.inputRules"
                :hint="item.fieldInfo.hint"
                :append-icon="
                  subItem.key === null
                    ? 'mdi-null'
                    : isReadonly
                    ? null
                    : 'mdi-close'
                "
                persistent-hint
                filled
                dense
                class="py-0"
                @click:append="subItem.key = null"
              ></v-text-field>
            </v-col>
            <v-col cols="6" class="py-0">
              <v-text-field
                v-model="subItem.value"
                label="Value"
                :readonly="isReadonly"
                :rules="item.fieldInfo.inputRules"
                :hint="item.fieldInfo.hint"
                :append-icon="
                  subItem.value === null
                    ? 'mdi-null'
                    : isReadonly
                    ? null
                    : 'mdi-close'
                "
                :append-outer-icon="isReadonly ? null : 'mdi-close'"
                persistent-hint
                filled
                dense
                class="py-0"
                @click:append="subItem.value = null"
                @click:append-outer="removeRow(i)"
              ></v-text-field>
            </v-col>
          </v-row>
        </div>
        <div v-else>No elements</div>
      </v-container>
    </div>
    <v-text-field
      v-else
      v-model="item.value"
      :label="
        (item.fieldInfo.text || item.field) +
        (item.fieldInfo.optional ? ' (optional)' : '')
      "
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
      @click:append="item.value = null"
      @keyup.enter="triggerSubmit()"
    ></v-text-field>
  </div>
</template>

<script>
import Draggable from 'vuedraggable'
// import { uploadFile, generateFileServingUrl } from '~/services/file'
import {
  capitalizeString,
  isObject,
  handleError,
  getIcon,
  collectPaginatorData,
} from '~/services/base'
import { executeGiraffeql } from '~/services/giraffeql'
// import FileChip from '~/components/chip/fileChip.vue'
// import MediaChip from '~/components/chip/mediaChip.vue'

export default {
  components: {
    Draggable,
    // FileChip,
    // MediaChip,
  },
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
    parentItem: {
      type: Object,
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
    icon() {
      return this.item.fieldInfo.typename
        ? getIcon(this.item.fieldInfo.typename)
        : null
    },

    recordIcon() {
      return this.item.recordInfo?.icon
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
    // generateFileServingUrl,

    triggerSubmit() {
      this.$emit('handle-submit')
    },

    addRow() {
      this.item.value.push({
        key: null,
        value: null,
      })
    },

    removeRow(index) {
      this.item.value.splice(index, 1)
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

    /*
    removeFileByIndex(index) {
      this.filesData.splice(index, 1)

      this.handleFilesDataUpdate()
    },

    handleFilesDataUpdate() {
      this.item.value = this.filesData.map((ele) => ele.id)
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

    handleMultipleDropFile(e) {
      if (!this.item.input) this.item.input = []
      this.item.input.push(...Array.from(e.dataTransfer.files))

      this.handleMultipleFileInputChange(this.item)
    },

    handleSingleDropFile(e) {
      if (!this.item.input) this.item.input = []
      const filesArray = Array.from(e.dataTransfer.files)
      this.item.input = filesArray[filesArray.length - 1]

      this.handleSingleFileInputChange(this.item)
    },

    handleMultipleFileInputChange(inputObject, removeFromInput = true) {
      this.$set(inputObject, 'loading', true)

      // inputObject.input expected to be array
      inputObject.input.forEach((currentFile) => {
        uploadFile(this, currentFile, (file, fileRecord) => {
          // add finished fileRecord to filesData
          this.filesData.push(file.fileUploadObject.fileRecord)

          // remove file from input
          if (removeFromInput) {
            const index = inputObject.input.indexOf(file)
            if (index !== -1) inputObject.input.splice(index, 1)
          }

          // emit the file to parent (in case it is needed)
          this.$emit('file-added', inputObject, fileRecord)

          // if no files left, finish up
          if (inputObject.input.length < 1) {
            inputObject.loading = false
            this.handleFilesDataUpdate()
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
    },
    */

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

    async loadFiles(inputObject) {
      inputObject.loading = true
      try {
        // fetch data
        const fileData = await collectPaginatorData(
          this,
          'getFilePaginator',
          {
            id: true,
            name: true,
            size: true,
            contentType: true,
          },
          {
            filterBy: [
              {
                parentKey: {
                  eq: `${this.parentItem.__typename}_${this.parentItem.id}`,
                },
                id: {
                  in: inputObject.value,
                },
              },
            ],
          }
        )

        this.filesData = inputObject.value
          .map((fileId) => fileData.find((val) => val.id === fileId))
          .filter((val) => val)
      } catch (err) {
        handleError(this, err)
      }
      inputObject.loading = false
    },

    reset() {
      if (
        (this.item.fieldInfo.inputType === 'multiple-file' ||
          this.item.fieldInfo.inputType === 'multiple-media') &&
        this.item.value.length > 0
      ) {
        this.loadFiles(this.item)
      }
    },
  },
}
</script>

<style scoped>
.highlighted-bg {
  border: 1px solid rgb(122, 122, 122);
}
</style>
