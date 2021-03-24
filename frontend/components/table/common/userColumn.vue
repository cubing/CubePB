<template>
  <div v-if="currentItem">
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
            <v-img v-if="currentItem.avatar" :src="currentItem.avatar"></v-img
            ><v-icon v-else>mdi-account</v-icon>
          </v-avatar>
          {{ currentItem.name }}
        </v-chip>
      </template>

      <v-card>
        <v-list>
          <v-list-item>
            <v-list-item-avatar>
              <v-img v-if="currentItem.avatar" :src="currentItem.avatar" />
              <v-icon v-else>mdi-account</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <template>
                <v-list-item-title>{{ currentItem.name }}</v-list-item-title>
                <v-progress-linear
                  v-if="loading.loadData"
                  indeterminate
                ></v-progress-linear>
                <template v-else-if="currentUser">
                  <v-list-item-subtitle
                    >WCA ID:
                    <a @click="openWCAProfile(currentUser.wcaId)">{{
                      currentUser.wcaId
                    }}</a></v-list-item-subtitle
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
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on" @click="openProfile()">
                <v-icon>mdi-open-in-new</v-icon>
              </v-btn>
            </template>
            <span>Go to Profile</span>
          </v-tooltip>
          <v-spacer></v-spacer>
          <template v-if="currentUser">
            <v-btn
              color="primary"
              :loading="loading.toggleFollow"
              @click="toggleFollowUser(!currentUser.currentUserFollowing)"
              >{{
                currentUser.currentUserFollowing ? 'Un-Follow' : 'Follow'
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
import { getNestedProperty, handleError } from '~/services/base'
import { executeJomql } from '~/services/jomql'

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

  computed: {
    // attempt to find the nested "user" using the headerInfo.field, assuming the fieldpath's path prefix is the path to the "user"
    currentItem() {
      const fieldpathParts = this.fieldpath.split(/\./)
      return fieldpathParts.length > 1
        ? getNestedProperty(this.item, fieldpathParts.slice(0, -1).join('.'))
        : this.item
    },
  },

  watch: {
    open() {
      if (!this.open) return
      this.reset()
    },
  },

  methods: {
    openProfile() {
      const routeData = this.$router.resolve({
        name: 'user',
        query: { id: this.currentItem.id },
      })
      window.open(routeData.href, '_blank')
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
          const data = await executeJomql(this, {
            createUserUserFollowLink: {
              id: true,
              __args: {
                user: {
                  id: this.$store.getters['auth/user']?.id,
                },
                target: {
                  id: this.currentItem.id,
                },
              },
            },
          })

          this.currentUser.currentUserFollowing = data.id
        } else {
          await executeJomql(this, {
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
        this.currentUser = await executeJomql(this, {
          getUser: {
            country: true,
            wcaId: true,
            currentUserFollowing: true,
            __args: {
              id: this.currentItem.id,
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
