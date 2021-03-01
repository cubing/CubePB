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
import sharedService from '~/services/shared'
import { executeJomql } from '~/services/jomql'
import { capitalizeString } from '~/services/common'

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
        : this.selectedItem
    },

    capitalizedType() {
      return capitalizeString(this.recordInfo.type)
    },
  },

  methods: {
    async deleteRecord() {
      this.loading.deleteRecord = true
      try {
        const data = await executeJomql(this, {
          [this.recordInfo.deleteOptions.operationName ??
          'delete' + this.capitalizedType]: {
            id: true,
            __args: {
              id: this.selectedItem.id,
            },
          },
        })

        this.$notifier.showSnackbar({
          message: this.capitalizedType + ' Deleted',
          variant: 'success',
        })

        this.$emit('handleSubmit', data)
      } catch (err) {
        sharedService.handleError(err, this.$root)
      }
      this.loading.deleteRecord = false
    },
  },
}
</script>
