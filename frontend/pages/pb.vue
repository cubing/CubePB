<template>
  <ViewRecordPage :record-info="recordInfo"></ViewRecordPage>
</template>

<script>
import ViewRecordPage from '~/components/page/viewRecordPage.vue'
import personalBestRecordInfo from '~/models/personalBest'

export default {
  components: {
    ViewRecordPage,
  },
  data() {
    return {
      recordInfo: personalBestRecordInfo,
    }
  },
}
</script>
