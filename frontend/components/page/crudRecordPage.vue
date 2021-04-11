<template>
  <v-container fluid style="max-width: 1920px">
    <v-layout column justify-left align-left>
      <v-row>
        <v-col cols="12">
          <component
            :is="interfaceComponent"
            :record-info="recordInfo"
            :page-options="pageOptions"
            :locked-filters="lockedFilters"
            :hidden-filters="hiddenFilters"
            :hidden-headers="hiddenHeaders"
            :title="title"
            :icon="icon"
            dense
            @pageOptions-updated="handlePageOptionsUpdated"
          ></component>
        </v-col>
      </v-row>
    </v-layout>
  </v-container>
</template>

<script>
import CrudRecordInterface from '~/components/interface/crud/crudRecordInterface.vue'
import { capitalizeString } from '~/services/base'

export default {
  props: {
    title: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    recordInfo: {
      type: Object,
      required: true,
    },
    hiddenHeaders: {
      type: Array,
      default: () => [],
    },
    lockedFilters: {
      type: Array,
      default: () => [],
    },
    hiddenFilters: {
      type: Array,
      default: () => [],
    },
    head: {
      type: Object,
      default: () => null,
    },
  },
  computed: {
    interfaceComponent() {
      return CrudRecordInterface
    },

    capitalizedTypename() {
      return capitalizeString(this.recordInfo.typename)
    },
    pageOptions() {
      return this.$route.query.pageOptions
        ? JSON.parse(atob(decodeURIComponent(this.$route.query.pageOptions)))
        : null
    },
  },

  methods: {
    /** 
     * Page Options expected structure:
       pageOptions: {
        search: "foo",
        filters: [
          {
            field: "field1",
            operator: "eq",
            value: 1
          }
        ],
        sortBy: ["field1"],
        sortDesc: [true]
      }
     */
    handlePageOptionsUpdated(pageOptions) {
      const query = {
        ...this.$route.query,
      }

      // check if any valid options
      if (
        pageOptions.search ||
        pageOptions.filters.length ||
        pageOptions.sortBy.length
      ) {
        query.pageOptions = encodeURIComponent(
          btoa(JSON.stringify(pageOptions))
        )
      } else {
        delete query.pageOptions
      }

      this.$router
        .replace({
          path: this.$route.path,
          query,
        })
        .catch((e) => e)
      // catches if the query is exactly the same
    },
  },

  head() {
    return (
      this.head ?? {
        title: 'Manage ' + this.recordInfo.pluralName,
      }
    )
  },
}
</script>
