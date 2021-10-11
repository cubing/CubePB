export const state = () => ({
  message: '',
  variant: '',
  copyableMessage: null,
})

export const mutations = {
  showSnackbar(state, { message, variant, copyableMessage }) {
    state.message = message
    state.variant = variant
    state.copyableMessage = copyableMessage
  },
}
