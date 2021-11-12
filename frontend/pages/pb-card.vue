<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-row>
        <v-col cols="12">
          <div v-if="errorMessage" class="text-center">
            <span class="display-1 pl-2">{{ errorMessage }} </span>
          </div>
          <div v-else-if="loading.verifyUser">
            <span class="display-1 pl-2"
              >Verifying WCA Code...
              <v-progress-circular indeterminate></v-progress-circular>
            </span>
          </div>
          <ViewPbCardInterface
            v-else-if="userId"
            icon="mdi-card-text"
            :title="title"
            :record-info="recordInfo"
            :locked-filters="lockedFilters"
          ></ViewPbCardInterface>
        </v-col>
      </v-row>
    </v-layout>
  </v-container>
</template>

<script>
import ViewPbCardInterface from '~/components/interface/viewPbCardInterface.vue'
import { PublicPbs } from '~/models/special'
import { executeGiraffeql } from '~/services/giraffeql'
import { handleError } from '~/services/base'

export default {
  layout: 'lite',
  components: {
    ViewPbCardInterface,
  },

  data() {
    return {
      recordInfo: PublicPbs,
      title: 'PB Card',
      hiddenFilters: ['createdBy.id', 'isCurrent'],
      hiddenHeaders: ['createdBy.name+createdBy.avatar'],

      errorMessage: null,

      loading: {
        verifyUser: false,
      },

      userId: null,
    }
  },

  computed: {
    lockedFilters() {
      return [
        {
          field: 'createdBy.id',
          operator: 'eq',
          value: this.$route.query.id,
        },
        {
          field: 'createdBy.isPublic',
          operator: 'eq',
          value: true,
        },
      ]
    },
  },

  mounted() {
    this.verifyUserExists()
  },

  methods: {
    async verifyUserExists() {
      this.loading.verifyUser = true
      try {
        if (!this.$route.query.id) {
          throw new Error('Missing user ID')
        }

        const data = await executeGiraffeql(this, {
          getUser: {
            id: true,
            isPublic: true,
            __args: {
              id: this.$route.query.id,
            },
          },
        })

        if (!data.isPublic) throw new Error('User not publicly visible')

        this.userId = data.id
      } catch (err) {
        handleError(this, err)
        this.errorMessage = err.message
      }
      this.loading.verifyUser = false
    },
  },

  head() {
    return {
      title: this.title,
    }
  },
}
</script>
