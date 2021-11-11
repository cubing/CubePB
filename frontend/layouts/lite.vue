<template>
  <v-app dark>
    <v-main>
      <nuxt />
    </v-main>
    <Snackbar />
  </v-app>
</template>

<script>
import Snackbar from '~/components/snackbar/snackbar.vue'

export default {
  components: {
    Snackbar,
  },

  methods: {
    toggleTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
      localStorage.setItem('theme', this.$vuetify.theme.dark ? 'dark' : 'light')
    },
  },
}
</script>
