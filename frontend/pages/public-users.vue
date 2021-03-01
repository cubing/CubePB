<template>
  <CrudRecordPage
    :record-info="recordInfo"
    :locked-filters="lockedFilters"
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
      // override
      head: {
        title: 'Users',
      },
    }
  },
  computed: {
    lockedFilters() {
      return [
        {
          field: 'is_public',
          operator: 'eq',
          value: true,
        },
      ]
    },
  },
}
</script>
