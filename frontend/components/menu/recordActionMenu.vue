<template>
  <v-menu v-bind="$attrs">
    <!-- pass through scoped slots -->
    <template v-slot:activator="slotData">
      <slot v-if="$scopedSlots.activator" name="activator" v-bind="slotData" />
      <v-icon v-else v-bind="slotData.attrs" v-on="slotData.on"
        >mdi-dots-vertical</v-icon
      >
    </template>

    <v-list dense>
      <v-list-item
        v-if="recordInfo.enterOptions && !hideEnter"
        key="enter"
        @click="goToPage(true)"
      >
        <v-list-item-icon>
          <v-icon>mdi-newspaper-variant-outline</v-icon>
        </v-list-item-icon>
        <v-list-item-title
          >Go To Page
          <v-icon small right>mdi-open-in-new</v-icon>
        </v-list-item-title>
      </v-list-item>
      <v-list-item
        v-if="recordInfo.shareOptions && !hideView"
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
          <v-icon>{{ recordInfo.editOptions.icon || 'mdi-pencil' }}</v-icon>
        </v-list-item-icon>
        <v-list-item-title>{{
          recordInfo.editOptions.text || 'Edit'
        }}</v-list-item-title>
      </v-list-item>
      <v-list-item
        v-if="recordInfo.copyOptions"
        key="copy"
        @click="openEditDialog('copy')"
      >
        <v-list-item-icon>
          <v-icon>
            {{ recordInfo.copyOptions.icon || 'mdi-content-copy' }}</v-icon
          >
        </v-list-item-icon>
        <v-list-item-title>{{
          recordInfo.copyOptions.text || 'Duplicate'
        }}</v-list-item-title>
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
      <template
        v-if="recordInfo.customActions && recordInfo.customActions.length > 0"
      >
        <v-divider></v-divider>
        <v-list-item
          v-for="(actionObject, i) in recordInfo.customActions"
          :key="'ca' + i"
          dense
          @click="handleCustomActionClick(actionObject)"
        >
          <v-list-item-icon>
            <v-icon>{{ actionObject.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ actionObject.text }} </v-list-item-title>
        </v-list-item>
      </template>

      <v-divider v-if="recordInfo.expandTypes.length > 0"></v-divider>
      <v-list-item
        v-for="(expandObject, i) in recordInfo.expandTypes"
        :key="i"
        dense
        @click="openExpandType(expandObject, i)"
      >
        <v-list-item-icon>
          <v-icon>{{
            expandObject.icon || expandObject.recordInfo.icon
          }}</v-icon>
        </v-list-item-icon>
        <v-list-item-title
          >{{ expandObject.name || expandObject.recordInfo.name }}
          <v-icon v-if="expandMode === 'openInNew'" small right
            >mdi-open-in-new</v-icon
          >
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { goToPage } from '~/services/base'

export default {
  props: {
    item: {
      type: Object,
      default: () => ({}),
    },

    recordInfo: {
      type: Object,
      required: true,
    },
    hideView: {
      type: Boolean,
    },
    hideEnter: {
      type: Boolean,
    },
    expandMode: {
      type: String,
      default: 'emit',
      validator: (value) => {
        return ['emit', 'openInNew'].includes(value)
      },
    },
  },

  data() {
    return {
      status: false,
    }
  },

  methods: {
    openEditDialog(mode) {
      this.$emit('handle-action-click', mode, this.item)
    },

    openExpandType(expandTypeObject, index) {
      if (this.expandMode === 'emit')
        this.$emit('handle-expand-click', expandTypeObject, index)
      else
        goToPage(
          this,
          this.recordInfo.typename,
          this.recordInfo.routeName,
          this.item.id,
          true,
          index
        )
    },

    handleCustomActionClick(actionObject) {
      this.$emit('handle-custom-action-click', actionObject, this.item)
    },

    goToPage() {
      goToPage(
        this,
        this.recordInfo.typename,
        this.recordInfo.routeName,
        this.item.id,
        ...arguments
      )
    },
  },
}
</script>
