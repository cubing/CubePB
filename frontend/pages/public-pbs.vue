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
      hiddenFilters: ['isCurrent'],
      lockedFilters: [
        {
          field: 'createdBy.isPublic',
          operator: 'eq',
          value: true,
        },
        {
          field: 'isCurrent',
          operator: 'eq',
          value: true,
        },
      ],
      title: 'Public PBs',
    }
  },
}
</script>
