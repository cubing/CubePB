<template>
  <div v-if="currentValue">
    <v-menu
      v-model="open"
      :close-on-content-click="false"
      :min-width="300"
      :max-width="300"
      offset-y
      top
    >
      <template v-slot:activator="{ on }">
        <v-chip pill small v-on="on">
          <v-avatar left>
            <v-img v-if="currentValue.avatar" :src="currentValue.avatar"></v-img
            ><v-icon v-else>mdi-account</v-icon>
          </v-avatar>
          {{ currentValue.name }}
        </v-chip>
      </template>

      <v-card>
        <v-list>
          <v-list-item>
            <v-list-item-avatar>
              <v-img v-if="currentValue.avatar" :src="currentValue.avatar" />
              <v-icon v-else>mdi-account</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <template>
                <v-list-item-title>{{ currentValue.name }}</v-list-item-title>
                <v-progress-linear
                  v-if="loading.loadData"
                  indeterminate
                ></v-progress-linear>
                <template v-else-if="currentUser">
                  <v-list-item-subtitle
                    >WCA ID:
                    <a
                      v-if="currentUser.wcaId"
                      @click="openWCAProfile(currentUser.wcaId)"
                      >{{ currentUser.wcaId }}
                      <v-icon small>mdi-open-in-new</v-icon>
                    </a></v-list-item-subtitle
                  >
                  <v-list-item-subtitle
                    >Nationality:
                    {{ currentUser.country }}</v-list-item-subtitle
                  >
                </template>
              </template>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="openProfile()">
            <v-icon left>mdi-open-in-new</v-icon>
            Open Profile
          </v-btn>

          <template v-if="currentUser">
            <v-btn
              color="primary"
              :loading="loading.toggleFollow"
              @click="toggleFollowUser(!currentUser.currentUserFollowing)"
              >{{
                currentUser.currentUserFollowing ? 'Following' : 'Follow'
              }}</v-btn
            >
          </template>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import columnMixin from '~/mixins/column'
import { handleError, goToPage } from '~/services/base'
import { executeGiraffeql } from '~/services/giraffeql'

export default {
  mixins: [columnMixin],

  data() {
    return {
      currentUser: null,
      open: false,
      loading: {
        loadData: false,
        toggleFollow: false,
      },
    }
  },

  watch: {
    open() {
      if (!this.open) return
      this.reset()
    },
  },

  methods: {
    openProfile() {
      goToPage(this, 'user', 'i-record', this.currentValue.id, true)
    },

    openWCAProfile(wcaId) {
      window.open(
        'https://www.worldcubeassociation.org/persons/' + wcaId,
        '_blank'
      )
    },

    async toggleFollowUser(follow) {
      this.loading.toggleFollow = true
      try {
        // login is required
        if (!this.$store.getters['auth/user']) throw new Error('Login required')

        if (follow) {
          const data = await executeGiraffeql(this, {
            createUserUserFollowLink: {
              id: true,
              __args: {
                user: {
                  id: this.$store.getters['auth/user']?.id,
                },
                target: {
                  id: this.currentValue.id,
                },
              },
            },
          })

          this.currentUser.currentUserFollowing = data.id
        } else {
          await executeGiraffeql(this, {
            deleteUserUserFollowLink: {
              __args: {
                id: this.currentUser.currentUserFollowing,
              },
            },
          })
          this.currentUser.currentUserFollowing = null
        }

        this.$notifier.showSnackbar({
          message: `User ${follow ? '' : 'Un-'}Followed`,
          variant: 'success',
        })
      } catch (err) {
        handleError(this, err)
      }
      this.loading.toggleFollow = false
    },

    async loadData() {
      this.loading.loadData = true
      try {
        this.currentUser = await executeGiraffeql(this, {
          getUser: {
            country: true,
            wcaId: true,
            currentUserFollowing: true,
            __args: {
              id: this.currentValue.id,
            },
          },
        })
      } catch (err) {
        handleError(this, err)
      }
      this.loading.loadData = false
    },

    reset() {
      this.loadData()
    },
  },
}
</script>

<style scoped>
.v-chip--pill .v-avatar {
  height: 24px !important;
  width: 24px !important;
}
</style>
