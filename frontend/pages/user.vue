<template>
  <ViewRecordPage :record-info="recordInfo"></ViewRecordPage>
</template>

<script>
import ViewRecordPage from '~/components/page/viewRecordPage.vue'
import userPublicRecordInfo from '~/models/special/userPublic'

export default {
  components: {
    ViewRecordPage,
  },
  data() {
    return {
      recordInfo: userPublicRecordInfo,
    }
  },
}
</script>
