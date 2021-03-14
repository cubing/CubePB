<template>
  <v-card flat>
    <slot name="toolbar"></slot>
    <v-card-text class="py-0 mt-3">
      <v-alert type="error">
        Confirm Delete{{ itemIdentifier ? ': ' + itemIdentifier : '' }}
      </v-alert>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <slot name="footer-action"></slot>
      <v-btn
        color="error"
        text
        :loading="loading.deleteRecord"
        @click="deleteRecord()"
        >Delete</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import { executeJomql } from '~/services/jomql'
import { capitalizeString, handleError } from '~/services/base'

export default {
  props: {
    selectedItem: {
      type: Object,
      default: () => ({}),
    },
    recordInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loading: {
        deleteRecord: false,
      },
    }
  },

  computed: {
    itemIdentifier() {
      return this.recordInfo.renderItem
        ? this.recordInfo.renderItem(this.selectedItem)
        : JSON.stringify(this.selectedItem, null, 2)
    },

    capitalizedTypename() {
      return capitalizeString(this.recordInfo.typename)
    },
  },

  methods: {
    async deleteRecord() {
      this.loading.deleteRecord = true
      try {
        const data = await executeJomql(this, {
          [this.recordInfo.deleteOptions.operationName ??
          'delete' + this.capitalizedTypename]: {
            id: true,
            __args: {
              id: this.selectedItem.id,
            },
          },
        })

        this.$notifier.showSnackbar({
          message: this.capitalizedTypename + ' Deleted',
          variant: 'success',
        })

        this.$emit('handleSubmit', data)
      } catch (err) {
        handleError(this, err)
      }
      this.loading.deleteRecord = false
    },
  },
}
</script>
