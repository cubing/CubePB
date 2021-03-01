<template>
  <CrudRecordPage :record-info="recordInfo"></CrudRecordPage>
</template>

<script>
import CrudRecordPage from '~/components/page/crudRecordPage.vue'
import personalBestClassRecordInfo from '~/models/personalBestClass'

export default {
  components: {
    CrudRecordPage,
  },

  data() {
    return {
      recordInfo: personalBestClassRecordInfo,
    }
  },
}
</script>
