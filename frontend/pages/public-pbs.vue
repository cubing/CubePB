<template>
  <div>
    <div class="text-center pt-3">
      <v-chip
        v-for="(item, i) in events"
        :key="i"
        class="ma-2"
        @click="applyPresetRoute(item)"
      >
        <v-avatar left>
          <span class="cubing-icon" :class="item.cubingIcon"></span>
        </v-avatar>
        {{ item.name }}
      </v-chip>
    </div>

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
import CrudRecordPage from '~/components/page/crudRecordPage.vue'
import { PublicPbs } from '~/models/special'
import { generateRoute } from '~/services/base'
import { getEvents } from '~/services/dropdown'

export default {
  components: {
    CrudRecordPage,
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
      events: [],
    }
  },

  mounted() {
    // load first 18 events only
    getEvents(this).then((res) => (this.events = res.slice(0, 18)))
  },
  methods: {
    applyPresetRoute(event) {
      this.$router.push(
        generateRoute(this.$route.path, {
          sortBy: ['happenedOn'],
          sortDesc: [true],
          filters: [
            {
              field: 'event.id',
              operator: 'eq',
              value: event.id,
            },
          ],
        })
      )
    },
  },
}
</script>
