<template>
  <CrudRecordPage
    :record-info="recordInfo"
    :locked-filters="lockedFilters"
    :hidden-filters="hiddenFilters"
    :head="head"
    :title="title"
    icon="mdi-star"
  ></CrudRecordPage>
</template>

<script>
import CrudRecordPage from '~/components/page/crudRecordPage.vue'
import { PublicPbs } from '~/models/special'

export default {
  components: {
    CrudRecordPage,
  },

  data() {
    return {
      recordInfo: PublicPbs,
      head: {
        title: 'Public PBs',
      },
      hiddenFilters: ['is_current'],
      lockedFilters: [
        {
          field: 'created_by.is_public',
          operator: 'eq',
          value: true,
        },
        {
          field: 'is_current',
          operator: 'eq',
          value: true,
        },
      ],
      title: 'Public PBs',
    }
  },
}
</script>
