import sharedService from '~/services/shared'
import CrudRecordInterface from '~/components/interface/crud/crudRecordInterface.vue'
import { isObject } from '~/services/common'

export default {
  computed: {
    interfaceComponent() {
      return this.recordInfo.interfaceComponent || CrudRecordInterface
    },

    capitalizedType() {
      return sharedService.capitalizeString(this.recordInfo.type)
    },

    // parses the query params and transforms into raw filterArray
    filters() {
      const filterArray = []
      if (this.$route.query.filters) {
        this.$route.query.filters.split('&').forEach((ele) => {
          const decoded = decodeURIComponent(ele)
          const filterParts = decoded.split(' ')
          if (filterParts.length === 3) {
            const filter = this.recordInfo.filters.find(
              (filterObject) => filterObject.field === filterParts[0]
            )

            // check if there is a parser on the fieldInfo
            const fieldInfo = this.recordInfo.fields[filter.field]

            // field unknown, abort
            if (!fieldInfo) throw new Error('Unknown field: ' + filter.field)

            // if value === '_null' it is understood to be null.
            const value = fieldInfo.parseValue
              ? fieldInfo.parseValue(filterParts[2])
              : filterParts[2]
            filterArray.push({
              field: filterParts[0],
              operator: filterParts[1],
              value,
            })
          }
        })
      }
      return filterArray
    },
  },

  methods: {
    handleFiltersUpdated(searchInput, filterInputsArray) {
      // build filter string

      // if ele.value is null, it is excluded
      // if ele.value is "__null", it is understood to be null
      const filterString = filterInputsArray
        .filter((ele) => ele.value !== undefined && ele.value !== null)
        .map((ele) =>
          encodeURIComponent(
            `${ele.field} ${ele.operator} ${
              isObject(ele.value) ? ele.value.id : ele.value
            }`
          )
        )
        .join('&')

      const query = {
        ...this.$route.query,
        search: searchInput,
        filters: filterString,
      }

      if (!searchInput) {
        delete query.search
      }

      if (!filterString) {
        delete query.filters
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
    return {
      title: 'Manage ' + this.capitalizedType + 's',
    }
  },
}
