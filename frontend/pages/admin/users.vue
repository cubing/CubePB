<template>
  <CrudRecordPage :record-info="recordInfo"></CrudRecordPage>
</template>

<script>
import CrudRecordPage from '~/components/page/crudRecordPage.vue'
import userRecordInfo from '~/models/user'

export default {
  components: {
    CrudRecordPage,
  },

  data() {
    return {
      recordInfo: userRecordInfo,
    }
  },
}
</script>
