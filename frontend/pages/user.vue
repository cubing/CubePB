<template>
  <ViewRecordPage :record-info="recordInfo"></ViewRecordPage>
</template>

<script>
import ViewRecordPage from '~/components/page/viewRecordPage.vue'
import { UserPublic } from '~/models/special'

export default {
  components: {
    ViewRecordPage,
  },
  data() {
    return {
      recordInfo: UserPublic,
    }
  },
}
</script>
