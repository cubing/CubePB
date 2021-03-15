import { executeJomql } from '~/services/jomql'

export default (context) => {
  const { store } = context

  return new Promise((resolve) => {
    if (store.getters['auth/token'] && !store.getters['auth/user']) {
      // fetch the user info
      executeJomql(null, {
        getCurrentUser: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          permissions: true,
          all_permissions: true,
        },
      })
        .then((data) => {
          if (!data) {
            return resolve()
          }

          store.commit('auth/setUser', data)
          resolve()
        })
        .catch(() => {
          // if fetching the current user failed, make sure the user is logged out
          store.commit('auth/unsetUser')
        })
    } else {
      resolve()
    }
  })
}
