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
            <span class="cubing-icon" :class="currentValue.cubingIcon"></span>
          </v-avatar>
          {{ currentValue.name }}
        </v-chip>
      </template>

      <v-card>
        <v-list>
          <v-list-item>
            <v-list-item-avatar>
              <span class="cubing-icon" :class="currentValue.cubingIcon"></span>
            </v-list-item-avatar>
            <v-list-item-content>
              <template>
                <v-list-item-title>{{ currentValue.name }}</v-list-item-title>
                <v-progress-linear
                  v-if="loading.loadData"
                  indeterminate
                ></v-progress-linear>
                <template v-else-if="currentEvent">
                  <v-list-item-subtitle
                    >Score Method:
                    {{ currentEvent.scoreMethod }}</v-list-item-subtitle
                  >
                </template>
              </template>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-card-text>
          <span v-if="currentEvent">{{ currentEvent.description }}</span>
        </v-card-text>
        <!--         <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="openPage()">
            <v-icon left>mdi-open-in-new</v-icon>
            Open Page
          </v-btn>
        </v-card-actions> -->
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
      currentEvent: null,
      open: false,
      loading: {
        loadData: false,
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
    openPage() {
      goToPage(this, 'event', 'i-view', this.currentValue.id, true)
    },

    async loadData() {
      this.loading.loadData = true
      try {
        this.currentEvent = await executeGiraffeql(this, {
          getEvent: {
            description: true,
            scoreMethod: true,
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
