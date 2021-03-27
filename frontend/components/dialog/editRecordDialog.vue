<template>
  <v-dialog
    v-model="status"
    scrollable
    max-width="800px"
    :persistent="mode !== 'view'"
  >
    <component
      :is="interfaceComponent"
      v-if="status"
      :selected-item="selectedItem"
      :record-info="recordInfo"
      :mode="mode"
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

const modesMap = {
  add: {
    icon: 'mdi-plus',
    prefix: 'New',
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
        return ['add', 'edit', 'view', 'delete', 'share'].includes(value)
      },
    },

    component: {
      required: false,
    },
  },

  computed: {
    interfaceComponent() {
      return (
        this.recordInfo[this.mode + 'Options']?.component ??
        modesMap[this.mode].defaultInterface
      )
    },

    title() {
      return modesMap[this.mode].prefix + ' ' + this.recordInfo.name
    },
    icon() {
      return modesMap[this.mode].icon
    },
  },
  methods: {
    close() {
      this.$emit('close')
    },
    handleSubmit(data) {
      this.close()
      this.$emit('handleSubmit', data)
    },
  },
}
</script>
