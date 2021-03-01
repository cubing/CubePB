<template>
  <CrudRecordPage :record-info="recordInfo"></CrudRecordPage>
</template>

<script>
import CrudRecordPage from '~/components/page/crudRecordPage.vue'
import personalBestRecordInfo from '~/models/personalBest'

export default {
  components: {
    CrudRecordPage,
  },

  data() {
    return {
      recordInfo: personalBestRecordInfo,
    }
  },
}
</script>
