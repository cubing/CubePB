<template>
  <v-container fluid class="text-center pb-0" style="max-width: 1920px">
    <v-progress-circular
      v-if="loading.presets"
      indeterminate
    ></v-progress-circular>
    <v-row v-else justify="center" class="pt-3">
      <v-col cols="12" lg="3" class="pb-0">
        <v-text-field
          v-model="inputs.email"
          label="Email"
          filled
          :clearable="eventClearable"
          @keyup.enter="applyEmailPreset"
          @change="applyEmailPreset"
        ></v-text-field>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { generateRoute } from '~/services/base'

export default {
  props: {
    eventClearable: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      inputs: {
        email: null,
      },
      loading: {
        presets: false,
      },
    }
  },

  mounted() {},

  methods: {
    applyEmailPreset() {
      // get the original sortBy/sortDesc
      const originalPageOptions = this.$route.query.pageOptions
        ? JSON.parse(atob(decodeURIComponent(this.$route.query.pageOptions)))
        : null

      // replace email filters with new ones
      const excludeFilterKeys = ['email']

      this.$router.push(
        generateRoute(this.$route.path, {
          ...originalPageOptions,
          filters: (originalPageOptions?.filters
            ? originalPageOptions.filters.filter(
                (filterObject) =>
                  !excludeFilterKeys.includes(filterObject.field)
              )
            : []
          ).concat(
            this.inputs.email
              ? [
                  {
                    field: 'email',
                    operator: 'eq',
                    value: this.inputs.email,
                  },
                ]
              : []
          ),
        })
      )
    },
  },
}
</script>
