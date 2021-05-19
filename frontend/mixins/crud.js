import {
  executeGiraffeql,
  executeGiraffeqlSubscription,
} from '~/services/giraffeql'
import { unsubscribeChannels } from '~/services/pusher'
import EditRecordDialog from '~/components/dialog/editRecordDialog.vue'
import SearchDialog from '~/components/dialog/searchDialog.vue'
import RecordActionMenu from '~/components/menu/recordActionMenu.vue'
import {
  collapseObject,
  getNestedProperty,
  generateTimeAgoString,
  capitalizeString,
  isObject,
  getCurrentDate,
  downloadCSV,
  handleError,
  serializeNestedProperty,
  getPaginatorData,
  collectPaginatorData,
  getIcon,
} from '~/services/base'

export default {
  name: 'CrudRecordInterface',

  components: {
    EditRecordDialog,
    SearchDialog,
    RecordActionMenu,
  },

  props: {
    // replacement title to override default one
    title: {
      type: String,
    },
    // replacement icon
    icon: {
      type: String,
    },
    recordInfo: {
      required: true,
    },
    // header fields that should be hidden
    hiddenHeaders: {
      type: Array,
      default: () => [],
    },
    useSubscription: {
      type: Boolean,
      default: false,
    },
    pageOptions: {
      type: Object,
      default: null,
    },
    /** raw filters must also be in recordInfo.filters. appended directly to the filterBy params. also applied to addRecordDialog
    {
      field: string;
      operator: string;
      value: any;
    }
    */
    lockedFilters: {
      type: Array,
      default: () => [],
    },
    // array of filter keys (recordInfo.filters) that should be hidden
    // string[]
    hiddenFilters: {
      type: Array,
      default: () => [],
    },
    groupBy: {
      type: Array,
      required: false,
    },
    isChildComponent: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    pollInterval: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      filterInputs: {},
      filterInputsArray: [],
      showFilterInterface: false,
      searchInput: '',
      filterChanged: false,
      filterOptions: {},

      dialogs: {
        editRecord: false,
        expandRecord: false,
        selectedItem: null,
        editMode: 'view',
      },

      subscriptionChannels: [],

      loading: {
        loadData: false,
        exportData: false,
      },

      // has the recordInfo been changed?
      recordInfoChanged: false,

      records: [],

      options: {
        page: 1,
        itemsPerPage: 25,
        sortBy: [],
        sortDesc: [],
        groupBy: [],
        groupDesc: [],
        mustSort: true,
        initialLoad: true,
      },

      tableOptionsUpdatedTrigger: null,

      pollIntervalTimer: null,
      isPolling: false,

      processedUpdateSort: false,

      previousPage: null,
      positivePageDelta: true,

      nextPaginatorInfo: {
        total: null,
        startCursor: null,
        endCursor: null,
      },

      currentPaginatorInfo: {
        total: null,
        startCursor: null,
        endCursor: null,
      },

      footerOptions: {
        'items-per-page-options': [5, 10, 25, 50],
      },

      // expandable
      expandedItems: [],
      expandedItem: null,
      subPageOptions: null,
      expandTypeObject: null,
    }
  },

  computed: {
    filters() {
      return this.pageOptions?.filters ?? []
    },

    search() {
      return this.pageOptions?.search
    },

    childInterfaceComponent() {
      return this.expandTypeObject
        ? this.expandTypeObject.component ||
            this.expandTypeObject.recordInfo.paginationOptions
              .interfaceComponent ||
            'CrudRecordInterface'
        : null
    },
    capitalizedType() {
      return capitalizeString(this.recordInfo.typename)
    },
    visibleFiltersArray() {
      return this.filterInputsArray.filter(
        (ele) => !this.hiddenFilters.includes(ele.field)
      )
    },
    visibleRawFiltersArray() {
      return this.filters.filter(
        (ele) => !this.hiddenFilters.includes(ele.field)
      )
    },

    headers() {
      return this.recordInfo.paginationOptions.headers
        .filter((headerInfo) => !this.hiddenHeaders.includes(headerInfo.field))
        .map((headerInfo) => {
          const fieldInfo = this.recordInfo.fields[headerInfo.field]

          // field unknown, abort
          if (!fieldInfo) throw new Error('Unknown field: ' + headerInfo.field)

          return {
            text: fieldInfo.text ?? headerInfo.field,
            align: headerInfo.align ?? 'left',
            sortable: headerInfo.sortable,
            value: fieldInfo.compoundOptions
              ? fieldInfo.compoundOptions.primaryField
              : headerInfo.field,
            width: headerInfo.width ?? null,
            fieldInfo,
            path: fieldInfo.compoundOptions
              ? fieldInfo.compoundOptions.pathPrefix
              : headerInfo.field,
            // headerInfo,
          }
        })
        .concat({
          text: 'Actions',
          sortable: false,
          value: null,
          width: '50px',
          ...this.recordInfo.paginationOptions.headerActionOptions,
        })
    },

    hasNested() {
      return this.recordInfo.expandTypes
        ? !!this.recordInfo.expandTypes.length
        : false
    },

    // expanded
    lockedSubFilters() {
      if (!this.expandedItem) return []

      // is there a lockedFilters generator on the expandTypeObject? if so, use that
      if (this.expandTypeObject.lockedFilters) {
        return this.expandTypeObject.lockedFilters(this, this.expandedItem)
      }

      return [
        {
          field: this.recordInfo.typename.toLowerCase() + '.id',
          operator: 'eq',
          value: this.expandedItem.id,
        },
      ]
    },

    hiddenSubFilters() {
      if (!this.expandedItems.length) return []

      // is there an excludeFilters array on the expandTypeObject? if so, use that
      return [this.recordInfo.typename.toLowerCase() + '.id'].concat(
        this.expandTypeObject.excludeFilters ?? []
      )
    },

    visibleFiltersCount() {
      return this.visibleRawFiltersArray.length + (this.search ? 1 : 0)
    },

    hasFilters() {
      return (
        this.recordInfo.paginationOptions.filters.length > 0 ||
        this.recordInfo.paginationOptions.hasSearch
      )
    },
  },

  watch: {
    isPolling(val, prevVal) {
      if (val === prevVal) return
      if (val) {
        this.startPolling()
      } else {
        this.stopPolling()
      }
    },

    '$vuetify.breakpoint.name'(value) {
      if (value === 'xs') {
        // when switching to mobile view, un-expand all
        this.closeExpandedItems()
      }
    },

    // this should trigger mainly when switching routes on admin pages
    recordInfo() {
      this.recordInfoChanged = true
      this.reset({
        resetSubscription: true,
        initFilters: true,
        resetSort: true,
        resetCursor: true,
      })
    },

    // this should trigger if the locked filters gets updated
    lockedFilters() {
      this.reset({
        resetSubscription: true,
        initFilters: true,
        resetSort: true,
        resetCursor: true,
      })
    },

    // this triggers when pageOptions get updated on parent element
    // this also triggers when parent element switches to a different item
    pageOptions() {
      // if this was triggered due to a recordInfo change, do nothing and revert recordInfoChange on next tick
      if (this.recordInfoChanged) {
        this.$nextTick(() => {
          this.recordInfoChanged = false
        })
        return
      }

      this.syncFilters()
      this.reset({
        resetCursor: true,
        resetSort: true,
      })
    },
  },

  created() {
    if (this.pollInterval > 0) this.isPolling = true

    this.reset({
      resetSubscription: true,
      initFilters: true,
      resetSort: true,
    })

    document.addEventListener(
      'visibilitychange',
      this.handleVisibilityChange,
      false
    )
  },

  destroyed() {
    // unsubscribe from channels on this page
    if (this.useSubscription) unsubscribeChannels(this.subscriptionChannels)

    this.stopPolling()
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    )
  },

  methods: {
    generateTimeAgoString,
    getIcon,

    startPolling() {
      // set the interval for refreshing, if pollInterval > 0 and not polling
      if (this.pollInterval > 0 && !this.pollIntervalTimer) {
        this.pollIntervalTimer = setInterval(() => {
          this.reset()
        }, this.pollInterval)
      }
    },

    stopPolling() {
      clearInterval(this.pollIntervalTimer)
      this.pollIntervalTimer = null
    },

    handleVisibilityChange() {
      if (!this.isPolling) return
      if (document.hidden) {
        // clear the pollIntervalTimer
        this.stopPolling()
      } else {
        // start the pollIntervalTimer again
        this.startPolling()
      }
    },

    setTableOptionsUpdatedTrigger(trigger) {
      this.tableOptionsUpdatedTrigger = trigger
    },

    handleSearchDialogSubmit(searchInput) {
      this.searchInput = searchInput
      this.updatePageOptions()
    },

    handleCustomActionClick(actionObject, item) {
      actionObject.handleClick(this, item)
    },

    handleTableOptionsUpdated() {
      this.$nextTick(() => {
        switch (this.tableOptionsUpdatedTrigger) {
          case 'sort':
            this.updatePageOptions() // this will trigger reset via the watcher
            break
          case 'itemsPerPage':
            this.reset()
            break
          case 'page':
            this.handleUpdatePage()
            this.reset()
            break
        }
        this.tableOptionsUpdatedTrigger = null
      })
    },

    handleSearchUpdate(inputObject) {
      if (!inputObject.search || !inputObject.focused) return

      // cancel pending call, if any
      clearTimeout(this._timerId)

      // delay new call 500ms
      this._timerId = setTimeout(() => {
        this.loadSearchResults(inputObject)
      }, 500)
    },

    async loadSearchResults(inputObject) {
      inputObject.loading = true
      try {
        const results = await executeGiraffeql(this, {
          [`get${capitalizeString(inputObject.fieldInfo.typename)}Paginator`]: {
            edges: {
              node: {
                id: true,
                name: true,
                ...(inputObject.fieldInfo.inputOptions?.hasAvatar && {
                  avatar: true,
                }),
              },
            },
            __args: {
              first: 20,
              search: inputObject.search,
              filterBy: inputObject.fieldInfo.lookupFilters
                ? inputObject.fieldInfo.lookupFilters(this)
                : [],
            },
          },
        })

        inputObject.options = results.edges.map((edge) => edge.node)
      } catch (err) {
        handleError(this, err)
      }
      inputObject.loading = false
    },

    // expanded
    handleSubPageOptionsUpdated(pageOptions) {
      this.subPageOptions = pageOptions
    },

    // expanded
    toggleItemExpanded(props, expandTypeObject) {
      this.expandTypeObject = expandTypeObject

      this.expandedItem = props.item

      // if switching to different expandRecordInfo when already expanded, do not toggle expand
      if (!props.isExpanded || !expandTypeObject)
        props.expand(!props.isExpanded)

      // when item expanded, reset the pageOptions
      if (expandTypeObject) {
        this.subPageOptions = {
          search: null,
          filters: expandTypeObject.initialFilters ?? [],
          sortBy: expandTypeObject.initialSortOptions?.sortBy ?? [],
          sortDesc: expandTypeObject.initialSortOptions?.sortDesc ?? [],
        }
      }
    },

    // same as toggleItemExpanded, but for mobile views
    openExpandDialog(props, expandTypeObject) {
      this.expandTypeObject = expandTypeObject
      this.expandedItem = props.item

      this.dialogs.expandRecord = true

      if (expandTypeObject) {
        this.subPageOptions = {
          search: null,
          filters: expandTypeObject.initialFilters ?? [],
          sortBy: expandTypeObject.initialSortOptions?.sortBy ?? [],
          sortDesc: expandTypeObject.initialSortOptions?.sortDesc ?? [],
        }
      }
    },

    closeExpandedItems() {
      this.expandedItems.pop()
    },

    handleRowClick(item) {
      if (this.recordInfo.paginationOptions.handleRowClick)
        this.recordInfo.paginationOptions.handleRowClick(this, item)
    },

    getTableRowData(headerItem, item) {
      // need to go deeper if nested
      return getNestedProperty(item, headerItem.value)
    },

    async exportData() {
      this.loading.exportData = true
      try {
        // create a map field -> serializeFn for fast serialization
        const serializeMap = new Map()

        // use custom download fields if provided
        const customFields = this.recordInfo.paginationOptions.downloadOptions
          .fields
        const fields =
          customFields ??
          this.recordInfo.paginationOptions.headers
            .concat(
              (this.recordInfo.requiredFields ?? []).map((field) => ({
                field,
              }))
            )
            .map((headerObject) => headerObject.field)

        if (fields.length < 1) throw new Error('No fields to export')

        const query = collapseObject(
          fields.reduce(
            (total, field) => {
              const fieldInfo = this.recordInfo.fields[field]

              // field unknown, abort
              if (!fieldInfo) throw new Error('Unknown field: ' + field)

              // if field has '+', add all of the fields
              if (field.match(/\+/)) {
                field.split(/\+/).forEach((field) => {
                  total[field] = true
                  // assuming all fields are valid
                  serializeMap.set(
                    field,
                    this.recordInfo.fields[field].serialize
                  )
                })
              } else {
                total[field] = true
                serializeMap.set(field, fieldInfo.serialize)
              }
              return total
            },
            { id: true } // always add id
          )
        )

        const args = {
          [this.positivePageDelta ? 'first' : 'last']: this.options
            .itemsPerPage,
          ...(this.options.page > 1 &&
            this.positivePageDelta && {
              after: this.currentPaginatorInfo.endCursor,
            }),
          ...(!this.positivePageDelta && {
            before: this.currentPaginatorInfo.startCursor,
          }),
          sortBy: this.options.sortBy,
          sortDesc: this.options.sortDesc,
          filterBy: [
            this.filters.concat(this.lockedFilters).reduce((total, ele) => {
              if (!total[ele.field]) total[ele.field] = {}

              // check if there is a parser on the fieldInfo
              const fieldInfo = this.recordInfo.fields[ele.field]

              // field unknown, abort
              if (!fieldInfo) throw new Error('Unknown field: ' + ele.field)

              // parse '__null' to null first
              const value = ele.value === '__null' ? null : ele.value

              // apply parseValue function, if any
              total[ele.field][ele.operator] = fieldInfo.parseValue
                ? fieldInfo.parseValue(value)
                : value

              return total
            }, {}),
          ],
          ...(this.search && { search: this.search }),
          ...(this.groupBy && { groupBy: this.groupBy }),
        }

        // fetch data
        const results = await collectPaginatorData(
          this,
          'get' + this.capitalizedType + 'Paginator',
          query,
          args
        )

        // remove any undefined serializeMap elements
        serializeMap.forEach((val, key) => {
          if (val === undefined) serializeMap.delete(key)
        })

        // apply serialization to results
        results.forEach((ele) => {
          serializeMap.forEach((serialzeFn, field) => {
            serializeNestedProperty(ele, field, serialzeFn)
          })
        })

        // extract results
        const data = customFields
          ? results.map((item) => {
              const returnItem = {}
              customFields.forEach((field) => {
                returnItem[field] = getNestedProperty(item, field)
              })
              return returnItem
            })
          : results.map((item) => {
              const returnItem = {}
              this.headers.forEach((headerObject) => {
                if (headerObject.value) {
                  returnItem[headerObject.value] = this.getTableRowData(
                    headerObject,
                    item
                  )
                }
              })
              return returnItem
            })

        if (data.length < 1) {
          throw new Error('No results to export')
        }

        // download as CSV
        downloadCSV(
          this,
          data,
          'Export' + this.capitalizedType + getCurrentDate()
        )
      } catch (err) {
        handleError(this, err)
      }
      this.loading.exportData = false
    },

    updatePageOptions() {
      this.$emit('pageOptions-updated', {
        search: this.searchInput,
        filters: this.filterInputsArray
          .filter(
            (filterObject) =>
              filterObject.value !== null && filterObject.value !== undefined
          )
          .map((filterObject) => ({
            field: filterObject.field,
            operator: filterObject.operator,
            // if object, must be from return-object. get the id
            value: isObject(filterObject.value)
              ? filterObject.value.id
              : filterObject.value,
          })),
        sortBy: this.options.sortBy,
        sortDesc: this.options.sortDesc,
      })
      this.filterChanged = false
    },

    openAddRecordDialog() {
      const initializedRecord = {}

      this.lockedFilters.forEach((lockedFilter) => {
        initializedRecord[lockedFilter.field] = lockedFilter.value
      })

      this.openEditDialog('add', initializedRecord)
    },

    openEditDialog(mode, selectedItem) {
      this.dialogs.editMode = mode
      this.openDialog('editRecord', selectedItem)
    },

    handleUpdatePage() {
      if (this.previousPage !== this.options.page) {
        this.positivePageDelta = this.previousPage < this.options.page
        this.previousPage = this.options.page

        this.currentPaginatorInfo = this.nextPaginatorInfo
      }
    },

    openDialog(dialogName, item) {
      if (dialogName in this.dialogs) {
        this.dialogs[dialogName] = true
        this.dialogs.selectedItem = item
      }
    },

    async loadData() {
      this.loading.loadData = true
      try {
        // create a map field -> serializeFn for fast serialization
        const serializeMap = new Map()

        const query = collapseObject(
          this.recordInfo.paginationOptions.headers
            .concat(
              (this.recordInfo.requiredFields ?? []).map((field) => ({
                field,
              }))
            )
            .reduce(
              (total, headerInfo) => {
                const fieldInfo = this.recordInfo.fields[headerInfo.field]

                // field unknown, abort
                if (!fieldInfo)
                  throw new Error('Unknown field: ' + headerInfo.field)

                // if field has '+', add all of the fields
                if (headerInfo.field.match(/\+/)) {
                  headerInfo.field.split(/\+/).forEach((field) => {
                    total[field] = true
                    // assuming all fields are valid
                    serializeMap.set(
                      field,
                      this.recordInfo.fields[field].serialize
                    )
                  })
                } else {
                  total[headerInfo.field] = true
                  serializeMap.set(headerInfo.field, fieldInfo.serialize)
                }
                return total
              },
              { id: true } // always add id
            )
        )

        const args = {
          [this.positivePageDelta ? 'first' : 'last']: this.options
            .itemsPerPage,
          ...(this.options.page > 1 &&
            this.positivePageDelta && {
              after: this.currentPaginatorInfo.endCursor,
            }),
          ...(!this.positivePageDelta && {
            before: this.currentPaginatorInfo.startCursor,
          }),
          sortBy: this.options.sortBy,
          sortDesc: this.options.sortDesc,
          filterBy: [
            this.filters.concat(this.lockedFilters).reduce((total, ele) => {
              if (!total[ele.field]) total[ele.field] = {}

              // check if there is a parser on the fieldInfo
              const fieldInfo = this.recordInfo.fields[ele.field]

              // field unknown, abort
              if (!fieldInfo) throw new Error('Unknown field: ' + ele.field)

              // parse '__null' to null first
              const value = ele.value === '__null' ? null : ele.value

              // apply parseValue function, if any
              total[ele.field][ele.operator] = fieldInfo.parseValue
                ? fieldInfo.parseValue(value)
                : value

              return total
            }, {}),
          ],
          ...(this.search && { search: this.search }),
          ...(this.groupBy && { groupBy: this.groupBy }),
        }

        const results = await getPaginatorData(
          this,
          'get' + this.capitalizedType + 'Paginator',
          query,
          args
        )

        // remove any undefined serializeMap elements
        serializeMap.forEach((val, key) => {
          if (val === undefined) serializeMap.delete(key)
        })

        // apply serialization to results
        results.edges.forEach((ele) => {
          serializeMap.forEach((serialzeFn, field) => {
            serializeNestedProperty(ele.node, field, serialzeFn)
          })
        })

        this.records = results.edges.map((ele) => ele.node)

        this.nextPaginatorInfo = results.paginatorInfo
      } catch (err) {
        handleError(this, err)
      }
      this.loading.loadData = false
    },

    async subscribeEvents() {
      const channelName = await executeGiraffeqlSubscription(
        this,
        {
          [this.recordInfo.typename + 'ListUpdated']: {
            id: true,
            __args: {},
          },
        },
        (data) => {
          console.log(data)
          this.reset()
        }
      )

      this.subscriptionChannels.push(channelName)
    },

    // syncs the filter values with this.filters
    syncFilters(init = false) {
      const inputFieldsSet = new Set(this.filterInputsArray)

      // parses filter into filterInputArray
      // loads the value into an existing filterInput, if one exists.
      this.filters.forEach((ele) => {
        const matchingInputObject = this.filterInputsArray.find(
          (input) =>
            input.field === ele.field && input.operator === ele.operator
        )

        if (matchingInputObject) {
          // if inputType is server-X, do not apply the value unless init
          if (
            matchingInputObject.inputType !== 'server-autocomplete' &&
            matchingInputObject.inputType !== 'server-combobox'
          ) {
            matchingInputObject.value = ele.value
          }

          if (init) {
            // if inputType === 'server-X', only populate the options with the specific entry, if any
            if (
              matchingInputObject.inputType === 'server-autocomplete' ||
              matchingInputObject.inputType === 'server-combobox'
            ) {
              matchingInputObject.value = ele.value
              if (matchingInputObject.value) {
                executeGiraffeql(this, {
                  [`get${capitalizeString(
                    matchingInputObject.fieldInfo.typename
                  )}`]: {
                    id: true,
                    name: true,
                    ...(matchingInputObject.fieldInfo.inputOptions
                      ?.hasAvatar && { avatar: true }),
                    __args: {
                      id: ele.value,
                    },
                  },
                })
                  .then((res) => {
                    // change value to object
                    matchingInputObject.value = res

                    matchingInputObject.options.push(res)
                  })
                  .catch((e) => e)
              }
            }
          }

          // remove from set
          inputFieldsSet.delete(matchingInputObject)
        }
      })

      // clears any input fields with no filterObject
      inputFieldsSet.forEach((ele) => (ele.value = null))

      // also set searchInput, if any
      if (this.search) this.searchInput = this.search

      this.filterChanged = false
    },

    // if subscription, no need to manually reset on change
    handleListChange() {
      if (!this.useSubscription) {
        // also need to emit to parent (if any)
        this.$emit('record-changed')

        this.reset()
      }
    },

    reset({
      resetSubscription = false,
      initFilters = false,
      resetFilters = false,
      resetSort = false,
      resetCursor = false,
      resetExpanded = true,
      reloadData = true,
      resetPolling = true,
    } = {}) {
      let actuallyReloadData = reloadData

      if (actuallyReloadData) this.records = []

      if (resetSubscription) {
        if (this.useSubscription) this.subscribeEvents()
      }

      if (resetPolling && this.isPolling) {
        this.stopPolling()
        this.startPolling()
      }

      if (initFilters) {
        this.filterInputsArray = this.recordInfo.paginationOptions.filters.map(
          (ele) => {
            const fieldInfo = this.recordInfo.fields[ele.field]

            // field unknown, abort
            if (!fieldInfo) throw new Error('Unknown field: ' + ele.field)

            const filterObject = {
              field: ele.field,
              fieldInfo,
              title: ele.title,
              operator: ele.operator,
              inputType: ele.inputType ?? fieldInfo.inputType,
              options: [],
              value: null,
              loading: false,
              search: null,
              focused: false,
            }

            fieldInfo.getOptions &&
              fieldInfo
                .getOptions(this)
                .then((res) => (filterObject.options = res))

            return filterObject
          }
        )

        // clears the searchInput
        this.searchInput = ''

        // syncs the filterInputsArray with this.filters
        this.syncFilters(true)
      }

      if (resetExpanded) {
        this.expandedItems.pop()
      }

      if (resetSort) {
        this.options.initialLoad = true
        // populate sort/page options
        this.options.sortBy = Array.isArray(this.pageOptions?.sortBy)
          ? this.pageOptions.sortBy.slice()
          : []
        this.options.sortDesc = Array.isArray(this.pageOptions?.sortDesc)
          ? this.pageOptions.sortDesc.slice()
          : []
      }

      if (resetCursor) {
        // reset pageOptions
        this.previousPage = null
        this.positivePageDelta = true

        // reset paginatorInfos
        this.nextPaginatorInfo = {
          total: null,
          startCursor: null,
          endCursor: null,
        }

        this.currentPaginatorInfo = this.nextPaginatorInfo

        if (this.options.page !== 1) {
          this.options.page = 1
          actuallyReloadData = false
        }
      }

      // sets all of the filter values to null, searchInput to '' and also emits changes to parent
      if (resetFilters) {
        this.filterInputsArray.forEach((ele) => {
          ele.value = null
        })
        // clears the searchInput
        this.searchInput = ''
        this.updatePageOptions()

        // dont actually reload data because updatePagOptions will trigger reset
        actuallyReloadData = false
      }

      if (actuallyReloadData) {
        this.loadData()
      }
    },
  },
}
