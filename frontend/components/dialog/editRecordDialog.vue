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
          <v-menu v-if="computedMode !== 'add'" left offset-x>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on">mdi-dots-vertical</v-icon>
            </template>

            <v-list dense>
              <v-list-item
                v-if="recordInfo.enterOptions"
                key="enter"
                @click="goToPage(true)"
              >
                <v-list-item-icon>
                  <v-icon>mdi-open-in-new</v-icon>
                </v-list-item-icon>
                <v-list-item-title
                  >Go To Page
                  <v-icon small right>mdi-open-in-new</v-icon>
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="recordInfo.shareOptions"
                key="view"
                @click="openEditDialog('view')"
              >
                <v-list-item-icon>
                  <v-icon>mdi-eye</v-icon>
                </v-list-item-icon>
                <v-list-item-title>View</v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="recordInfo.shareOptions"
                key="share"
                @click="openEditDialog('share')"
              >
                <v-list-item-icon>
                  <v-icon>mdi-share-variant</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Share</v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="recordInfo.editOptions"
                key="edit"
                @click="openEditDialog('edit')"
              >
                <v-list-item-icon>
                  <v-icon>mdi-pencil</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="recordInfo.deleteOptions"
                key="delete"
                @click="openEditDialog('delete')"
              >
                <v-list-item-icon>
                  <v-icon>mdi-delete</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
              <v-divider v-if="recordInfo.expandTypes.length > 0"></v-divider>
              <v-list-item
                v-for="(item, i) in recordInfo.expandTypes"
                :key="i"
                dense
                @click="goToPage(true, i)"
              >
                <v-list-item-icon>
                  <v-icon>{{ item.icon || item.recordInfo.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-title
                  >{{ item.name || item.recordInfo.name }}
                  <v-icon small right>mdi-open-in-new</v-icon>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
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
import { goToPage } from '~/services/base'

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
