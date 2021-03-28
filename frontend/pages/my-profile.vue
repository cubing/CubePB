<template>
  <ViewRecordPage
    v-if="lookupParams"
    :record-info="recordInfo"
    :head="head"
    :lookup-params="lookupParams"
  ></ViewRecordPage>
</template>

<script>
import ViewRecordPage from '~/components/page/viewRecordPage.vue'
import { MyProfile } from '~/models/special'

export default {
  middleware: ['router-auth'],
  components: {
    ViewRecordPage,
  },
  data() {
    return {
      recordInfo: MyProfile,
      head: {
        title: 'My Profile',
      },
    }
  },
  computed: {
    lookupParams() {
      return this.$store.getters['auth/user']
        ? {
            id: this.$store.getters['auth/user'].id,
          }
        : null
    },
  },
}
</script>
