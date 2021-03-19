<template>
  <v-snackbar v-model="open" :timeout="3000" :color="variant">
    <span :style="{ color: textColor }">{{ message }}</span>
    <template v-slot:action="{ attrs }">
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
export default {
  data() {
    return {
      open: false,
      variant: '',
      message: '',
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

        if (message) {
          this.open = true
          this.message = message
          this.variant = variant
        }
      }
    })
  },
  methods: {
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
