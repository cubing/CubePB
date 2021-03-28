<template>
  <v-card>
    <v-card-title class="headline"> Recent Releases </v-card-title>
    <v-card-text>
      <v-progress-linear
        v-if="loading.loadData"
        indeterminate
      ></v-progress-linear>
      <div v-for="(item, i) in releases" v-else :key="i" class="mb-4">
        <span class="headline"
          >{{ item.name }} ({{ generateTimeAgoString(item.createdAt) }})</span
        >
        <div v-html="item.descriptionHTML"></div>
      </div>
      <v-divider />
      <div class="mt-3">
        To see all releases, check out our
        <a href="https://github.com/cubing/CubePB/releases" target="_blank"
          >Github repository</a
        >
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { executeGiraffeql } from '~/services/giraffeql'
import { generateTimeAgoString } from '~/services/base'

export default {
  data() {
    return {
      releases: [],
      loading: {
        loadData: false,
      },
    }
  },

  mounted() {
    this.loadData()
  },

  methods: {
    async loadData() {
      this.loading.loadData = true
      try {
        this.releases = await executeGiraffeql(this, {
          getRepositoryReleases: {
            __args: {
              first: 5,
            },
          },
        })
      } catch (err) {
        // do nothing
      }
      this.loading.loadData = false
    },

    generateTimeAgoString(dateString) {
      return generateTimeAgoString(new Date(dateString).getTime() / 1000)
    },
  },
}
</script>
