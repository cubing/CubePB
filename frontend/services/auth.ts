export function handleLogin(that, authPayload) {
  // put the response in the vuex store
  that.$store.commit('auth/setUserInit', authPayload)
}

export function handleLogout(that) {
  that.$store.commit('auth/unsetUser')
}

export function goToWcaAuth() {
  if (process.env.wcaAuthUrl) {
    window.location.href = process.env.wcaAuthUrl
  }
}

export function goToWcaAccountManagement() {
  if (process.env.wcaAccountManagementUrl) {
    window.open(process.env.wcaAccountManagementUrl)
  }
}
