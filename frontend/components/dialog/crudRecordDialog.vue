<template>
  <v-dialog v-model="status" scrollable max-width="800px" persistent>
    <v-card flat>
      <div>
        <component
          :is="interfaceComponent"
          :record-info="recordInfo"
          :locked-filters="lockedFilters"
          :hidden-filters="hiddenFilters"
          :hidden-headers="hiddenHeaders"
          :title="title"
          :icon="icon"
          dense
        >
          <template v-slot:header-action>
            <v-btn icon @click="close()">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </template>
        </component>
      </div>

      <v-card-actions>
        <slot name="footer-action"></slot>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close()">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import CrudRecordInterface from '~/components/interface/crud/crudRecordInterface.vue'

export default {
  props: {
    status: {
      type: Boolean,
    },

    title: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    recordInfo: {
      type: Object,
      required: true,
    },
    hiddenHeaders: {
      type: Array,
      default: () => [],
    },
    lockedFilters: {
      type: Array,
      default: () => [],
    },
    hiddenFilters: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {}
  },

  computed: {
    interfaceComponent() {
      return (
        this.recordInfo.paginationOptions?.interfaceComponent ??
        CrudRecordInterface
      )
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

    reset() {},
  },
}
</script>
