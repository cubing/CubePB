<template>
  <CrudRecordPage
    :record-info="recordInfo"
    :locked-filters="lockedFilters"
    :title="title"
    :head="head"
    icon="mdi-account-star"
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
          field: 'isPublic',
          operator: 'eq',
          value: true,
        },
        {
          field: 'isFeatured',
          operator: 'eq',
          value: true,
        },
      ],
      // override
      head: {
        title: 'Featured Users',
      },
      title: 'Featured Users',
    }
  },
}
</script>
