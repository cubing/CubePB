<template>
  <CrudRecordPage
    :record-info="recordInfo"
    :locked-filters="lockedFilters"
    :title="title"
    :head="head"
    :icon="icon"
  ></CrudRecordPage>
</template>

<script>
import CrudRecordPage from '~/components/page/crudRecordPage.vue'
import { PublicFollows } from '~/models/special'

export default {
  middleware: ['router-auth'],
  components: {
    CrudRecordPage,
  },

  data() {
    return {
      recordInfo: PublicFollows,
      // override
      hiddenHeaders: ['target.id+target.name+target.avatar'],
      head: {
        title: 'Users Following Me',
      },
      icon: 'mdi-account-multiple',
      title: 'Users Following Me',
    }
  },
  computed: {
    lockedFilters() {
      return this.$store.getters['auth/user']
        ? [
            {
              field: 'target.id',
              operator: 'eq',
              value: this.$store.getters['auth/user'].id,
            },
          ]
        : []
    },
  },
}
</script>
