<template>
  <div>
    <div class="text-center pt-3">
      <v-progress-circular
        v-if="loading.presets"
        indeterminate
      ></v-progress-circular>
      <div v-else>
        <div>Events</div>
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

        <v-divider />
        <div class="pt-2">PB Types</div>
        <v-chip
          v-for="item in pbTypes"
          :key="item.text"
          class="ma-2"
          @click="applyPbPreset(item.attributes)"
        >
          {{ item.text }}
        </v-chip>
      </div>
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
      pbTypes: [
        {
          text: 'Single',
          attributes: {
            'pbClass.id': 1,
            setSize: 1,
          },
        },
        {
          text: 'Mo3',
          attributes: {
            'pbClass.id': 3,
            setSize: 3,
          },
        },
        {
          text: 'Ao5',
          attributes: {
            'pbClass.id': 2,
            setSize: 5,
          },
        },
        {
          text: 'Ao12',
          attributes: {
            'pbClass.id': 2,
            setSize: 12,
          },
        },
        {
          text: 'Ao50',
          attributes: {
            'pbClass.id': 2,
            setSize: 50,
          },
        },
        {
          text: 'Ao100',
          attributes: {
            'pbClass.id': 2,
            setSize: 100,
          },
        },
        {
          text: 'Ao1000',
          attributes: {
            'pbClass.id': 2,
            setSize: 1000,
          },
        },
        {
          text: 'All',
          attributes: null,
        },
      ],

      loading: {
        presets: false,
      },
    }
  },

  mounted() {
    // load first 18 events only
    this.loadPresets()
  },
  methods: {
    applyPresetRoute(event) {
      // get the original sortBy/sortDesc
      const originalPageOptions = this.$route.query.pageOptions
        ? JSON.parse(atob(decodeURIComponent(this.$route.query.pageOptions)))
        : null

      this.$router.push(
        generateRoute(this.$route.path, {
          ...originalPageOptions,
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

    applyPbPreset(attributes) {
      // get the original sortBy/sortDesc/filters
      const originalPageOptions = this.$route.query.pageOptions
        ? JSON.parse(atob(decodeURIComponent(this.$route.query.pageOptions)))
        : null

      // replace event.id/setSize filters with new ones
      const excludeFilterKeys = ['pbClass.id', 'setSize']

      this.$router.push(
        generateRoute(this.$route.path, {
          ...originalPageOptions,
          filters: (originalPageOptions.filters
            ? originalPageOptions.filters.filter(
                (filterObject) =>
                  !excludeFilterKeys.includes(filterObject.field)
              )
            : []
          ).concat(
            attributes
              ? [
                  {
                    field: 'pbClass.id',
                    operator: 'eq',
                    value: attributes['pbClass.id'],
                  },
                  {
                    field: 'setSize',
                    operator: 'eq',
                    value: attributes.setSize,
                  },
                ]
              : []
          ),
        })
      )
    },

    async loadPresets() {
      this.loading.presets = true

      const events = await getEvents(this)

      this.events = events.slice(0, 18)

      this.loading.presets = false
    },
  },
}
</script>
