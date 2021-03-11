<template>
  <ViewRecordPage :record-info="recordInfo"></ViewRecordPage>
</template>

<script>
import ViewRecordPage from '~/components/page/viewRecordPage.vue'
import { PublicPbs } from '~/models/special'

export default {
  components: {
    ViewRecordPage,
  },
  data() {
    return {
      recordInfo: PublicPbs,
    }
  },
}
</script>
