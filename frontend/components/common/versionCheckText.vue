<template>
  <div>
    <a @click="copyIdTokenToClipboard()">{{ getBuildInfo() }}</a>
    <v-icon
      v-if="hasNewerVersion"
      title="A newer version of this site is available. Reload to see it."
      color="pink"
      >mdi-sync-alert</v-icon
    >
    <v-snackbar
      v-model="open"
      multi-line
      bottom
      right
      :timeout="-1"
      app
      color="primary"
    >
      A newer version of this page is available. Refresh this page to load it.
      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="open = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { executeJomql } from '~/services/jomql'
import { copyToClipboard } from '~/services/base'

export default {
  data() {
    return {
      open: false,
      latestVersion: null,
      hasNewerVersion: false,
    }
  },

  mounted() {
    executeJomql(this, {
      getRepositoryLatestVersion: true,
    }).then((res) => {
      this.latestVersion = res
      if (process.env.VER !== this.latestVersion) {
        // only open the snackbar if not DEV
        if (process.env.VER !== 'DEV') {
          this.open = true
        }
        this.hasNewerVersion = true
      }
    })
  },

  methods: {
    copyIdTokenToClipboard() {
      const authToken = this.$store.getters['auth/getToken']()
      if (authToken) {
        copyToClipboard(this, authToken)
      }
    },
    getBuildInfo() {
      return (
        'Build ' +
        (process.env.VER
          ? process.env.VER.substring(0, 7)
          : process.env.buildDate)
      )
    },
  },
}
</script>
