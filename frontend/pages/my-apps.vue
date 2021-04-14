<template>
  <CrudRecordPage
    :record-info="recordInfo"
    :locked-filters="lockedFilters"
    :hidden-filters="hiddenFilters"
    :head="head"
    :title="title"
    :icon="icon"
  ></CrudRecordPage>
</template>

<script>
import CrudRecordPage from '~/components/page/crudRecordPage.vue'
import { MyApiKeys } from '~/models/special'

export default {
  middleware: ['router-auth'],

  components: {
    CrudRecordPage,
  },

  data() {
    return {
      recordInfo: MyApiKeys,
      head: {
        title: 'My Apps',
      },
      hiddenFilters: [],
      title: 'My Apps',
      icon: 'mdi-view-grid-plus',
    }
  },
  computed: {
    lockedFilters() {
      return this.$store.getters['auth/user']
        ? [
            {
              field: 'user.id',
              operator: 'eq',
              value: this.$store.getters['auth/user'].id,
            },
          ]
        : []
    },
  },
}
</script>
