export default ({ _, store }, inject) => {
  inject('notifier', {
    showSnackbar({ message, variant, copyableMessage }) {
      store.commit('snackbar/showSnackbar', {
        message,
        variant,
        copyableMessage,
      })
    },
  })
}
