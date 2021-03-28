<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4>
        <v-card class="elevation-12 mb-3">
          <v-toolbar color="accent" flat>
            <v-toolbar-title>WCA Profile Settings</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-card-text>
            <span
              >These settings are tied to your official WCA account. To manage
              these settings, click "Manage WCA Account", then click "Sync WCA
              Data".</span
            >
            <v-text-field
              v-model="inputs.name"
              label="Name"
              prepend-icon="mdi-account-details"
              readonly
            ></v-text-field>
            <v-text-field
              v-model="inputs.wcaId"
              label="WCA ID"
              prepend-icon="mdi-account-details"
              readonly
            ></v-text-field>
            <v-text-field
              v-model="inputs.avatar"
              label="Avatar URL"
              prepend-icon="mdi-account-details"
              readonly
            ></v-text-field>
            <v-text-field
              v-model="inputs.country"
              label="Country"
              prepend-icon="mdi-account-details"
              readonly
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn text block @click="goToWcaAccountManagement()">
              <img
                src="../static/wcalogo2020.svg"
                alt=""
                style="width: 32px"
                class="pr-2"
              />
              Manage WCA Account
            </v-btn>
          </v-card-actions>
          <v-card-actions>
            <v-btn
              block
              color="primary"
              :loading="loading.syncWcaData"
              @click="goToWcaAuth()"
              >Sync WCA Data</v-btn
            >
          </v-card-actions>
        </v-card>
        <v-card class="elevation-12">
          <v-toolbar color="accent" flat>
            <v-toolbar-title>CubePB Settings</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-card-text>
            <span
              >These settings are tied to your CubePB account. They can be
              directly edited on this page.</span
            >
            <v-divider></v-divider>
            <v-switch
              v-model="inputs.isPublic"
              label="Public Profile Page"
              @change="inputsChanged = true"
            ></v-switch>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              :loading="loading.submitting"
              :disabled="!inputsChanged"
              @click="handleSubmit()"
              >Save Changes</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { executeGiraffeql } from '~/services/Giraffeql'
import { goToWcaAccountManagement, goToWcaAuth } from '~/services/auth'
import { handleError } from '~/services/base'

export default {
  components: {},

  data() {
    return {
      inputs: {
        id: null,
        name: null,
        wcaId: null,
        avatar: null,
        country: null,
        isPublic: null,
      },

      inputsChanged: false,
      loading: {
        submitting: false,
        syncWcaData: false,
        loadUser: false,
      },
    }
  },

  mounted() {
    if (!this.$store.getters['auth/user']) {
      this.$router.push('/login')
    } else {
      this.reset()
    }
  },

  methods: {
    goToWcaAccountManagement,
    goToWcaAuth,

    async syncWcaData() {
      this.loading.syncWcaData = true
      try {
        const data = await executeGiraffeql(this, {
          syncWcaData: {
            name: true,
            __args: {
              item: {
                id: this.inputs.id,
              },
              fields: {
                isPublic: this.inputs.isPublic,
              },
            },
          },
        })

        this.$store.commit('auth/partialUpdateUser', data)

        this.$notifier.showSnackbar({
          message: 'User info synced successfully',
          variant: 'success',
        })
      } catch (err) {
        handleError(this, err)
      }
      this.loading.syncWcaData = false
    },

    async handleSubmit() {
      this.loading.submitting = true
      try {
        const data = await executeGiraffeql(this, {
          updateUser: {
            name: true,
            __args: {
              item: {
                id: this.inputs.id,
              },
              fields: {
                isPublic: this.inputs.isPublic,
              },
            },
          },
        })

        this.$store.commit('auth/partialUpdateUser', data)

        this.$notifier.showSnackbar({
          message: 'User info updated successfully',
          variant: 'success',
        })

        this.inputsChanged = false
      } catch (err) {
        handleError(this, err)
      }
      this.loading.submitting = false
    },

    async loadData() {
      this.loading.loadUser = true
      try {
        const data = await executeGiraffeql(this, {
          getCurrentUser: {
            id: true,
            name: true,
            wcaId: true,
            avatar: true,
            country: true,
            isPublic: true,
          },
        })

        this.inputs = data
      } catch (err) {
        handleError(this, err)
      }
      this.loading.loadUser = false
    },

    reset() {
      this.loadData()
    },
  },

  head() {
    return {
      title: 'Settings',
    }
  },
}
</script>
