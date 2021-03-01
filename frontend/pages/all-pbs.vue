<template>
  <CrudRecordPage
    :record-info="recordInfo"
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
        title: 'All PBs',
      },
      title: 'All PBs',
    }
  },
}
</script>
