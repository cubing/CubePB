<template>
  <v-container fluid class="text-center pb-0" style="max-width: 1920px">
    <v-progress-circular
      v-if="loading.presets"
      indeterminate
    ></v-progress-circular>
    <v-row v-else justify="center" class="pt-3">
      <v-col :key="-1" cols="12" lg="3" class="pb-0">
        <v-autocomplete
          v-model="inputs.event"
          :items="events"
          item-text="name"
          item-value="id"
          label="Event"
          filled
          return-object
          :clearable="eventClearable"
          @change="applyEventPreset"
        ></v-autocomplete>
      </v-col>
      <v-col :key="-2" cols="12" lg="3" class="pb-0">
        <v-autocomplete
          v-model="inputs.pbType"
          :items="pbTypes"
          item-text="text"
          label="PB Type"
          clearable
          filled
          return-object
          @change="applyPbPreset"
        ></v-autocomplete>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { getEvents } from '~/services/dropdown'
import { generateRoute } from '~/services/base'

export default {
  props: {
    eventClearable: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      inputs: {
        event: null,
        pbType: null,
      },
      loading: {
        presets: false,
      },
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
      ],
    }
  },

  watch: {
    '$route.query.pageOptions'() {
      this.syncFilters()
    },
  },

  mounted() {
    this.loadPresets().then(() => {
      this.syncFilters()
    })
  },

  methods: {
    applyEventPreset(event) {
      // get the original sortBy/sortDesc
      const originalPageOptions = this.$route.query.pageOptions
        ? JSON.parse(atob(decodeURIComponent(this.$route.query.pageOptions)))
        : null

      // replace event.id filters with new ones
      const excludeFilterKeys = ['event.id']

      this.$router.push(
        generateRoute(this.$route.path, {
          ...originalPageOptions,
          filters: (originalPageOptions?.filters
            ? originalPageOptions.filters.filter(
                (filterObject) =>
                  !excludeFilterKeys.includes(filterObject.field)
              )
            : []
          ).concat(
            event
              ? [
                  {
                    field: 'event.id',
                    operator: 'eq',
                    value: event.id,
                  },
                ]
              : []
          ),
        })
      )
    },

    applyPbPreset(pbType) {
      // get the original sortBy/sortDesc/filters
      const originalPageOptions = this.$route.query.pageOptions
        ? JSON.parse(atob(decodeURIComponent(this.$route.query.pageOptions)))
        : null

      // replace event.id/setSize filters with new ones
      const excludeFilterKeys = ['pbClass.id', 'setSize']

      this.$router.push(
        generateRoute(this.$route.path, {
          ...originalPageOptions,
          filters: (originalPageOptions?.filters
            ? originalPageOptions.filters.filter(
                (filterObject) =>
                  !excludeFilterKeys.includes(filterObject.field)
              )
            : []
          ).concat(
            pbType
              ? [
                  {
                    field: 'pbClass.id',
                    operator: 'eq',
                    value: pbType.attributes['pbClass.id'],
                  },
                  {
                    field: 'setSize',
                    operator: 'eq',
                    value: pbType.attributes.setSize,
                  },
                ]
              : []
          ),
        })
      )
    },

    async loadPresets() {
      this.loading.presets = true

      this.events = await getEvents(this)

      this.loading.presets = false
    },

    // syncs preset inputs with filters
    syncFilters() {
      const originalPageOptions = this.$route.query.pageOptions
        ? JSON.parse(atob(decodeURIComponent(this.$route.query.pageOptions)))
        : null

      // determine if a preset was applied
      if (originalPageOptions.filters) {
        const eventFilterObject = originalPageOptions.filters.find(
          (filterObject) => filterObject.field === 'event.id'
        )

        if (eventFilterObject) {
          this.inputs.event = this.events.find(
            (event) => event.id === eventFilterObject.value
          )
        } else {
          this.inputs.event = null
        }

        const setSizeFilterObject = originalPageOptions.filters.find(
          (filterObject) => filterObject.field === 'setSize'
        )

        const pbClassFilterObject = originalPageOptions.filters.find(
          (filterObject) => filterObject.field === 'pbClass.id'
        )

        if (setSizeFilterObject && pbClassFilterObject) {
          this.inputs.pbType = this.pbTypes.find(
            (pbType) =>
              pbType.attributes.setSize === setSizeFilterObject.value &&
              pbType.attributes['pbClass.id'] === pbClassFilterObject.value
          )
        } else {
          this.inputs.pbType = null
        }
      }
    },
  },
}
</script>
