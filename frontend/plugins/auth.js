import { executeGiraffeql } from '~/services/giraffeql'

export default (context) => {
  const { store } = context

  return new Promise((resolve) => {
    if (store.getters['auth/getToken']() && !store.getters['auth/user']) {
      // fetch the user info
      executeGiraffeql(null, {
        getCurrentUser: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          permissions: true,
          allPermissions: true,
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
          resolve()
        })
    } else {
      resolve()
    }
  })
}
