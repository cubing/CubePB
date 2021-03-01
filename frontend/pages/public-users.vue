<template>
  <CrudRecordPage
    :record-info="recordInfo"
    :locked-filters="lockedFilters"
    :title="title"
    :head="head"
  ></CrudRecordPage>
</template>

<script>
import CrudRecordPage from '~/components/page/crudRecordPage.vue'
import userPublicRecordInfo from '~/models/special/userPublic'

export default {
  components: {
    CrudRecordPage,
  },

  data() {
    return {
      recordInfo: userPublicRecordInfo,
      lockedFilters: [
        {
          field: 'is_public',
          operator: 'eq',
          value: true,
        },
      ],
      // override
      head: {
        title: 'Public Users',
      },
      title: 'Public Users',
    }
  },
}
</script>
