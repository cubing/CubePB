<template>
  <div>
    <PbPagePreset :event-clearable="false"></PbPagePreset>
    <CrudRecordPage
      :record-info="recordInfo"
      :locked-filters="lockedFilters"
      :hidden-filters="hiddenFilters"
      :head="head"
      :title="title"
      icon="mdi-star"
    ></CrudRecordPage>
  </div>
</template>

<script>
import PbPagePreset from '../components/page/preset/pbPagePreset.vue'
import CrudRecordPage from '~/components/page/crudRecordPage.vue'
import { PublicPbs } from '~/models/special'

export default {
  components: {
    CrudRecordPage,
    PbPagePreset,
  },

  data() {
    return {
      recordInfo: PublicPbs,
      head: {
        title: 'Public PBs',
      },
      hiddenFilters: ['isCurrent'],
      lockedFilters: [
        {
          field: 'createdBy.isPublic',
          operator: 'eq',
          value: true,
        },
        {
          field: 'isCurrent',
          operator: 'eq',
          value: true,
        },
      ],
      title: 'Public PBs',

      loading: {
        presets: false,
      },
    }
  },
}
</script>
