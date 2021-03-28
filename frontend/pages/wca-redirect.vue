<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <div v-if="errorMessage">
        <span class="display-1 pl-2">{{ errorMessage }} </span>
      </div>
      <div v-else-if="loading.verifying">
        <span class="display-1 pl-2"
          >Verifying WCA Code...
          <v-progress-circular indeterminate></v-progress-circular>
        </span>
      </div>
    </v-layout>
  </v-container>
</template>

<script>
import { handleLogin } from '~/services/auth'
import { executeGiraffeql } from '~/services/Giraffeql'
import { handleError } from '~/services/base'

export default {
  components: {},

  data() {
    return {
      loading: {
        verifying: false,
      },

      errorMessage: null,
    }
  },

  mounted() {
    this.attemptWcaAuthorization()
  },

  methods: {
    async attemptWcaAuthorization() {
      this.loading.verifying = true
      try {
        if (!this.$route.query.code) {
          throw new Error('Missing authorization code, please try again.')
        }

        const data = await executeGiraffeql(this, {
          socialLogin: {
            token: true,
            type: true,
            user: {
              id: true,
              email: true,
              name: true,
              role: true,
              avatar: true,
              permissions: true,
              allPermissions: true,
            },
            __args: {
              provider: 'wca',
              code: this.$route.query.code,
              redirectUri: window.location.href,
            },
          },
        })

        await handleLogin(this, data)

        this.$router.push('/')
      } catch (err) {
        handleError(this, err)
        this.errorMessage = err.message
      }
      this.loading.verifying = false
    },
  },

  head() {
    return {
      title: 'Verify WCA Authorization',
    }
  },
}
</script>
