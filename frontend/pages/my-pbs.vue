<template>
  <CrudRecordPage
    :record-info="recordInfo"
    :locked-filters="lockedFilters"
    :hidden-filters="hiddenFilters"
    :hidden-headers="hiddenHeaders"
    :title="title"
    :head="head"
  ></CrudRecordPage>
</template>

<script>
import CrudRecordPage from '~/components/page/crudRecordPage.vue'
import { MyPbs } from '~/models/special'

export default {
  middleware: ['router-auth'],
  components: {
    CrudRecordPage,
  },

  data() {
    return {
      recordInfo: MyPbs,
      head: {
        title: 'My PBs',
      },
      title: 'My PBs',
      hiddenFilters: ['createdBy.id', 'isCurrent'],
      hiddenHeaders: ['createdBy.name+createdBy.avatar+createdBy.id'],
    }
  },

  computed: {
    lockedFilters() {
      return this.$store.getters['auth/user']
        ? [
            {
              field: 'createdBy.id',
              operator: 'eq',
              value: this.$store.getters['auth/user']?.id,
            },
            {
              field: 'isCurrent',
              operator: 'eq',
              value: true,
            },
          ]
        : []
    },
  },
}
</script>
