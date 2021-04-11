<template>
  <CrudRecordPage
    :record-info="recordInfo"
    :locked-filters="lockedFilters"
    :hidden-headers="hiddenHeaders"
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
      hiddenHeaders: ['user.id+user.name+user.avatar'],
      // override
      head: {
        title: 'Following Me',
      },
      icon: 'mdi-account-switch',
      title: 'Following Me',
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
