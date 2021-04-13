<template>
  <v-card flat>
    <slot name="toolbar"></slot>
    <v-card-text :class="{ 'max-height': dialogMode }" class="pt-3">
      <v-container
        v-if="loading.loadRecord || loading.loadDropdowns"
        class="text-center"
        style="height: 250px"
        fill-height
        justify-center
      >
        <v-progress-circular indeterminate></v-progress-circular>
      </v-container>
      <v-container v-else>
        <v-row>
          <v-col
            v-for="(item, i) in inputsArray"
            :key="i"
            cols="12"
            class="py-0"
          >
            <div v-if="item.field === 'currentUserFollowing'" class="text-left">
              <v-btn
                color="primary"
                :loading="loading.toggleFollow"
                @click="toggleFollowUser(!item.value)"
                >{{ item.value ? 'Following' : 'Follow' }}</v-btn
              >
            </div>
            <GenericInput v-else :item="item"></GenericInput>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <slot name="footer-action"></slot>
      <v-btn
        v-if="mode !== 'view'"
        ref="submit"
        color="primary"
        :loading="loading.editRecord"
        @click="handleSubmit()"
        >Submit</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import editRecordInterfaceMixin from '~/mixins/editRecordInterface'
import { handleError } from '~/services/base'
import { executeGiraffeql } from '~/services/giraffeql'

export default {
  mixins: [editRecordInterfaceMixin],
  data() {
    return {
      loading: {
        toggleFollow: false,
      },
    }
  },
  methods: {
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
                  id: this.selectedItem.id,
                },
              },
            },
          })

          this.setInputValue('currentUserFollowing', data.id)
        } else {
          await executeGiraffeql(this, {
            deleteUserUserFollowLink: {
              __args: {
                id: this.getInputValue('currentUserFollowing'),
              },
            },
          })
          this.setInputValue('currentUserFollowing', null)
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
  },
}
</script>

<style scoped>
.max-height {
  max-height: 600px;
}
</style>
