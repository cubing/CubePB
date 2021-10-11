<template>
  <v-snackbar v-model="open" :timeout="3000" :color="variant">
    <span :style="{ color: textColor }">{{ message }}</span>
    <template v-slot:action="{ attrs }">
      <v-btn
        v-if="copyableMessage"
        text
        v-bind="attrs"
        :style="{ color: textColor }"
        @click="copyToClipboard(copyableMessage)"
      >
        <v-icon left>mdi-content-copy</v-icon>
        Copy Data
      </v-btn>
      <v-btn
        text
        v-bind="attrs"
        :style="{ color: textColor }"
        @click="open = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { copyToClipboard } from '~/services/base'

export default {
  data() {
    return {
      open: false,
      variant: '',
      message: '',
      copyableMessage: null,
      variantToTextColorMap: {
        success: '#082218',
        warning: '#2A150D',
        error: '#FFF8F8',
        info: '#050709',
      },
    }
  },
  computed: {
    textColor() {
      return this.variantToTextColorMap[this.variant]
    },
  },
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'snackbar/showSnackbar') {
        const message = state.snackbar.message
        const variant = this.isAcceptedVariant(state.snackbar.variant)
          ? state.snackbar.variant
          : 'info'
        const copyableMessage = state.snackbar.copyableMessage

        if (message) {
          this.open = true
          this.message = message
          this.variant = variant
          this.copyableMessage = copyableMessage
        }
      }
    })
  },
  methods: {
    copyToClipboard(content) {
      copyToClipboard(this, content)
    },

    isAcceptedVariant: (variant) => {
      return (
        variant === 'info' ||
        variant === 'success' ||
        variant === 'warning' ||
        variant === 'error'
      )
    },
  },
}
</script>
