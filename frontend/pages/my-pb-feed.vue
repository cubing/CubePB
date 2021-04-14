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
import { PublicPbs } from '~/models/special'

export default {
  middleware: ['router-auth'],

  components: {
    CrudRecordPage,
  },

  data() {
    return {
      recordInfo: PublicPbs,
      head: {
        title: 'My PB Feed',
      },
      hiddenFilters: ['isCurrent'],
      title: 'My PB Feed',
      icon: 'mdi-timetable',
    }
  },
  computed: {
    lockedFilters() {
      return this.$store.getters['auth/user']
        ? [
            {
              field: 'createdBy.isPublic',
              operator: 'eq',
              value: true,
            },
            {
              field: 'createdBy.userUserFollowLink/user.id',
              operator: 'eq',
              value: this.$store.getters['auth/user'].id,
            },
          ]
        : []
    },
  },
}
</script>
