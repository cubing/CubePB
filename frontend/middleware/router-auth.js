export default function ({ store, redirect, _route }) {
  if (!store.getters['auth/user']) {
    redirect('/')
  }
}
