<template>
  <v-dialog
    v-model="status"
    scrollable
    max-width="800px"
    :persistent="computedMode !== 'view'"
  >
    <component
      :is="interfaceComponent"
      v-if="status"
      :selected-item="selectedItem"
      :record-info="recordInfo"
      :mode="computedMode"
      dialog-mode
      @handleSubmit="handleSubmit"
    >
      <template v-slot:toolbar>
        <v-toolbar flat color="accent">
          <v-icon left>{{ icon }}</v-icon>
          <v-toolbar-title>
            <span class="headline">{{ title }}</span>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <RecordActionMenu
            v-if="computedMode !== 'add'"
            :record-info="recordInfo"
            :item="selectedItem"
            expand-mode="openInNew"
            left
            offset-x
            @handle-action-click="openEditDialog"
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
import ViewRecordInterface from '~/components/interface/crud/viewRecordInterface.vue'
import DeleteRecordInterface from '~/components/interface/crud/deleteRecordInterface.vue'
import ShareRecordInterface from '~/components/interface/crud/shareRecordInterface.vue'
import RecordActionMenu from '~/components/menu/recordActionMenu.vue'

import { goToPage } from '~/services/base'

const modesMap = {
  add: {
    icon: 'mdi-plus',
    prefix: 'New',
    defaultInterface: EditRecordInterface,
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

    // must be add, edit, or view
    mode: {
      type: String,
      required: true,
      validator: (value) => {
        return ['add', 'edit', 'view', 'delete', 'copy', 'share'].includes(
          value
        )
      },
    },

    component: {
      required: false,
    },
  },
  data() {
    return {
      overrideMode: null,
    }
  },

  computed: {
    computedMode() {
      return this.overrideMode ?? this.mode
    },

    interfaceComponent() {
      return (
        this.recordInfo[this.computedMode + 'Options']?.component ??
        modesMap[this.computedMode].defaultInterface
      )
    },

    title() {
      return modesMap[this.computedMode].prefix + ' ' + this.recordInfo.name
    },
    icon() {
      return modesMap[this.computedMode].icon
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

    goToPage() {
      goToPage(
        this,
        this.recordInfo.viewRecordRoute,
        this.selectedItem,
        ...arguments
      )
    },
    handleSubmit(data) {
      this.close()
      this.$emit('handleSubmit', data)
    },

    reset() {
      this.overrideMode = null
    },
  },
}
</script>
