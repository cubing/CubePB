<template>
  <CrudRecordPage
    v-if="currentModel"
    :record-info="currentModel"
  ></CrudRecordPage>
</template>

<script>
import CrudRecordPage from '~/components/page/crudRecordPage.vue'
import * as models from '~/models'
import { capitalizeString } from '~/services/base'

export default {
  middleware: ['router-auth'],
  components: {
    CrudRecordPage,
  },

  computed: {
    currentModel() {
      return models[capitalizeString(this.$route.query.type)]
    },
  },
}
</script>
