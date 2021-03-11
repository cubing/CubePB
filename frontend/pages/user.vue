<template>
  <ViewRecordPage :record-info="recordInfo"></ViewRecordPage>
</template>

<script>
import ViewRecordPage from '~/components/page/viewRecordPage.vue'
import { PublicUsers } from '~/models/special'

export default {
  components: {
    ViewRecordPage,
  },
  data() {
    return {
      recordInfo: PublicUsers,
    }
  },
}
</script>
