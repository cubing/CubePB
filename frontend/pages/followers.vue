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
import { PublicUsers } from '~/models/special'

export default {
  components: {
    CrudRecordPage,
  },

  data() {
    return {
      recordInfo: PublicUsers,
      lockedFilters: [
        {
          field: 'followers',
          operator: 'eq',
          value: true,
        },
      ],
      // override
      head: {
        title: 'Users Following Me',
      },
      title: 'Users Following Me',
    }
  },
}
</script>
