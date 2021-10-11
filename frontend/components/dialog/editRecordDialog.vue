<template>
  <v-dialog v-model="status" scrollable max-width="800px" persistent>
    <component
      :is="interfaceComponent"
      v-if="status"
      :selected-item="selectedItem"
      :record-info="recordInfo"
      :custom-fields="customFields"
      :mode="computedMode"
      dialog-mode
      :generation="generation"
      @handleSubmit="handleSubmit"
      @close="close()"
      @item-updated="$emit('item-updated')"
    >
      <template v-slot:toolbar>
        <v-toolbar flat color="accent">
          <v-icon left>{{ icon }}</v-icon>
          <v-toolbar-title>
            <span class="headline">{{ title }}</span>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <RecordActionMenu
            v-if="computedMode !== 'add' && computedMode !== 'import'"
            :record-info="recordInfo"
            :item="selectedItem"
            expand-mode="openInNew"
            left
            offset-x
            @handle-action-click="openEditDialog"
            @handle-custom-action-click="handleCustomActionClick"
          ></RecordActionMenu>
          <v-btn icon @click="close()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:footer-action>
        <v-btn color="blue darken-1" text @click="close()">Close</v-btn>
      </template>
    </component>
  </v-dialog>
</template>

<script>
import EditRecordInterface from '~/components/interface/crud/editRecordInterface.vue'
import ImportRecordInterface from '~/components/interface/crud/importRecordInterface.vue'
import ViewRecordInterface from '~/components/interface/crud/viewRecordInterface.vue'
import DeleteRecordInterface from '~/components/interface/crud/deleteRecordInterface.vue'
import ShareRecordInterface from '~/components/interface/crud/shareRecordInterface.vue'
import RecordActionMenu from '~/components/menu/recordActionMenu.vue'

const modesMap = {
  add: {
    icon: 'mdi-plus',
    prefix: 'New',
    defaultInterface: EditRecordInterface,
  },
  import: {
    icon: 'mdi-upload',
    prefix: 'Import',
    defaultInterface: ImportRecordInterface,
  },
  copy: {
    icon: 'mdi-content-copy',
    prefix: 'Copy',
    defaultInterface: EditRecordInterface,
  },
  edit: {
    icon: 'mdi-pencil',
    prefix: 'Edit',
    defaultInterface: EditRecordInterface,
  },
  view: {
    icon: 'mdi-eye',
    prefix: 'View',
    defaultInterface: ViewRecordInterface,
  },
  delete: {
    icon: 'mdi-delete',
    prefix: 'Delete',
    defaultInterface: DeleteRecordInterface,
  },
  share: {
    icon: 'mdi-share-variant',
    prefix: 'Share',
    defaultInterface: ShareRecordInterface,
  },
}

export default {
  components: {
    RecordActionMenu,
  },

  props: {
    status: {
      type: Boolean,
    },

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

    // this OR specialMode must be provided
    mode: {
      type: String,
      validator: (value) => {
        return [
          'add',
          'import',
          'edit',
          'view',
          'delete',
          'copy',
          'share',
        ].includes(value)
      },
    },

    /*
      {
        icon: 'mdi-share-variant',
        prefix: 'Share',
        defaultInterface: ShareRecordInterface,
      },
    */
    specialMode: {
      type: Object,
    },

    component: {
      required: false,
    },
  },
  data() {
    return {
      overrideMode: null,
      generation: 0,
    }
  },

  computed: {
    computedMode() {
      return this.overrideMode ?? this.mode
    },

    modeObject() {
      return this.specialMode ?? modesMap[this.computedMode]
    },

    interfaceComponent() {
      return this.specialMode
        ? this.modeObject.defaultInterface
        : this.recordInfo[this.computedMode + 'Options']?.component ??
            this.modeObject.defaultInterface
    },

    title() {
      return this.modeObject.prefix + ' ' + this.recordInfo.name
    },
    icon() {
      return this.modeObject.icon
    },
  },

  watch: {
    status(val) {
      if (val) {
        this.reset()
      }
    },
  },
  methods: {
    close() {
      this.$emit('close')
    },

    // toggle the dialog to another mode
    openEditDialog(mode) {
      this.overrideMode = mode
    },

    handleCustomActionClick(actionObject, item) {
      actionObject.handleClick(this, item)
    },

    handleSubmit(data) {
      this.$emit('handleSubmit', data)
    },

    reset() {
      this.overrideMode = null
      this.generation++
    },
  },
}
</script>
