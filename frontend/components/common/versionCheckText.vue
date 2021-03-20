<template>
  <div>
    <a @click="copyIdTokenToClipboard()">{{ getBuildInfo() }}</a>
    <v-icon
      v-if="hasNewerVersion"
      title="A newer version of this site is available. Click to reload."
      color="pink"
      @click="reloadPage()"
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
      A newer version of this page is available.
      <template v-slot:action="{ attrs }">
        <v-btn
          color="success"
          class="black--text"
          v-bind="attrs"
          @click="reloadPage()"
        >
          Refresh
        </v-btn>
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
      currentVersion: null,
      latestVersion: null,
      hasNewerVersion: false,
    }
  },

  mounted() {
    this.currentVersion = process.env.VER
      ? process.env.VER.split('/').pop()
      : 'DEV'
    executeJomql(this, {
      getRepositoryLatestVersion: true,
    }).then((res) => {
      this.latestVersion = res
      if (this.currentVersion !== this.latestVersion) {
        // only open the snackbar if not DEV
        if (this.currentVersion !== 'DEV') {
          this.open = true
        }
        this.hasNewerVersion = true
      }
    })
  },

  methods: {
    reloadPage() {
      location.reload()
    },
    copyIdTokenToClipboard() {
      const authToken = this.$store.getters['auth/getToken']()
      if (authToken) {
        copyToClipboard(this, authToken)
      }
    },
    getBuildInfo() {
      return 'Build ' + (this.currentVersion ?? process.env.buildDate)
    },
  },
}
</script>
