<template>
  <CrudRecordPage :record-info="recordInfo"></CrudRecordPage>
</template>

<script>
import CrudRecordPage from '~/components/page/crudRecordPage.vue'
import eventRecordInfo from '~/models/event'

export default {
  components: {
    CrudRecordPage,
  },

  data() {
    return {
      recordInfo: eventRecordInfo,
    }
  },
}
</script>
