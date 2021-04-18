<template>
  <ViewRecordPage
    v-if="currentModel"
    :record-info="currentModel"
  ></ViewRecordPage>
  <v-container v-else fill-height>
    <v-layout align-center justify-center>
      <div>
        <span class="display-1 pl-2"
          >Invalid Type: {{ $route.query.type }}</span
        >
      </div>
    </v-layout>
  </v-container>
</template>

<script>
import ViewRecordPage from '~/components/page/viewRecordPage.vue'
import * as models from '~/models'
import { capitalizeString } from '~/services/base'

export default {
  middleware: ['router-auth'],
  components: {
    ViewRecordPage,
  },

  computed: {
    currentModel() {
      return models[capitalizeString(this.$route.query.type)]
    },
  },
}
</script>
