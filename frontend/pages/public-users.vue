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
import { UserPublic } from '~/models/special'

export default {
  components: {
    CrudRecordPage,
  },

  data() {
    return {
      recordInfo: UserPublic,
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
