<template>
  <CrudRecordPage
    :record-info="recordInfo"
    :locked-filters="lockedFilters"
    :head="head"
    :title="title"
    icon="mdi-star"
  ></CrudRecordPage>
</template>

<script>
import CrudRecordPage from '~/components/page/crudRecordPage.vue'
import allPbsRecordInfo from '~/models/special/allPbs'

export default {
  components: {
    CrudRecordPage,
  },

  data() {
    return {
      recordInfo: allPbsRecordInfo,
      head: {
        title: 'Public PBs',
      },
      lockedFilters: [
        {
          field: 'created_by.is_public',
          operator: 'eq',
          value: true,
        },
      ],
      title: 'Public PBs',
    }
  },
}
</script>
