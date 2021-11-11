<template>
  <v-app dark>
    <v-main>
      <nuxt />
    </v-main>
    <Snackbar />
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'
import Snackbar from '~/components/snackbar/snackbar.vue'
import VersionCheckText from '~/components/common/versionCheckText.vue'
import { goToWcaAuth, handleLogout } from '~/services/auth'
import { copyToClipboard, openLink, handleError } from '~/services/base'
import AdminNavRoutes from '~/components/navigation/adminNavRoutes.vue'

export default {
  components: {
    Snackbar,
    VersionCheckText,
    AdminNavRoutes,
  },
  data() {
    return {
      clipped: true,
      drawer: false,
      fixed: true,
      miniVariant: false,
    }
  },

  computed: {
    ...mapGetters({
      user: 'auth/user',
    }),
    isAdmin() {
      return this.$store.getters['auth/user']?.role === 'ADMIN'
    },
  },

  mounted() {
    this.drawer = this.$vuetify.breakpoint.name !== 'xs'
  },

  methods: {
    copyToClipboard(content) {
      return copyToClipboard(this, content)
    },
    goToWcaAuth,
    openLink,

    toggleTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
      localStorage.setItem('theme', this.$vuetify.theme.dark ? 'dark' : 'light')
    },

    canSee(allowedRoles, allowedPermissions) {
      return (
        allowedRoles.includes(this.$store.getters['auth/user']?.role) ||
        allowedPermissions.some((ele) =>
          this.$store.getters['auth/user']?.allPermissions.includes(ele)
        )
      )
    },

    logout() {
      try {
        this.$router.push('/')

        handleLogout(this)
      } catch (err) {
        handleError(this, err)
      }
    },
  },
}
</script>
