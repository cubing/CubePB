<template>
  <CrudRecordPage :record-info="recordInfo"></CrudRecordPage>
</template>

<script>
import CrudRecordPage from '~/components/page/crudRecordPage.vue'
import productRecordInfo from '~/models/product'

export default {
  components: {
    CrudRecordPage,
  },

  data() {
    return {
      recordInfo: productRecordInfo,
    }
  },
}
</script>
