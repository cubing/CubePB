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
      hiddenFilters: ['created_by.id', 'is_current'],
      hiddenHeaders: ['created_by.name+created_by.avatar'],
    }
  },

  computed: {
    lockedFilters() {
      return this.$store.getters['auth/user']
        ? [
            {
              field: 'created_by.id',
              operator: 'eq',
              value: this.$store.getters['auth/user']?.id,
            },
            {
              field: 'is_current',
              operator: 'eq',
              value: true,
            },
          ]
        : []
    },
  },
}
</script>
