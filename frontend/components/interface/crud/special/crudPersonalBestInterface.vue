<template>
  <div :class="{ 'expanded-table-bg': isChildComponent }">
    <v-data-table
      :headers="headers"
      :items="records"
      class="elevation-1"
      :loading="loading.loadData"
      :options.sync="options"
      loading-text="Loading... Please wait"
      :server-items-length="nextPaginatorInfo.total"
      :footer-props="footerOptions"
      :dense="dense"
      :expanded.sync="expandedItems"
      :single-expand="hasNested"
      @update:options="handleTableOptionsUpdated"
      @update:sort-by="setTableOptionsUpdatedTrigger('sort')"
      @update:sort-desc="setTableOptionsUpdatedTrigger('sort')"
      @update:items-per-page="setTableOptionsUpdatedTrigger('itemsPerPage')"
      @update:page="setTableOptionsUpdatedTrigger('page')"
    >
      <template v-slot:top>
        <v-toolbar flat color="accent" dense>
          <v-icon left>{{ icon || recordInfo.icon || 'mdi-domain' }}</v-icon>
          <v-toolbar-title>{{
            title || `${recordInfo.pluralName}`
          }}</v-toolbar-title>
          <v-divider
            v-if="recordInfo.addOptions"
            class="mx-4"
            inset
            vertical
          ></v-divider>
          <v-btn
            v-if="recordInfo.addOptions"
            color="primary"
            @click="openAddRecordDialog()"
          >
            <v-icon left>mdi-plus</v-icon>
            New {{ recordInfo.name }}
          </v-btn>
          <v-divider
            v-if="recordInfo.paginationOptions.hasSearch"
            class="mx-4"
            inset
            vertical
          ></v-divider>
          <SearchDialog
            v-if="recordInfo.paginationOptions.hasSearch"
            v-model="searchInput"
            @handleSubmit="handleSearchDialogSubmit"
          >
            <template slot="icon">
              <v-badge :value="!!search" dot color="secondary">
                <v-icon>mdi-magnify</v-icon>
              </v-badge>
            </template>
          </SearchDialog>
          <v-spacer></v-spacer>
          <v-switch
            v-if="pollInterval > 0"
            v-model="isPolling"
            class="mt-5"
            label="Auto-Refresh"
          ></v-switch>
          <v-btn
            v-if="hasFilters"
            icon
            @click="showFilterInterface = !showFilterInterface"
          >
            <v-badge
              :value="visibleFiltersCount"
              :content="visibleFiltersCount"
              color="secondary"
            >
              <v-icon>mdi-filter-menu</v-icon>
            </v-badge>
          </v-btn>
          <v-btn
            v-if="recordInfo.importOptions"
            icon
            @click="openImportRecordDialog()"
          >
            <v-icon>mdi-upload</v-icon>
          </v-btn>
          <v-btn
            v-if="recordInfo.paginationOptions.downloadOptions"
            icon
            :loading="loading.exportData"
            @click="exportData()"
          >
            <v-icon>mdi-download</v-icon>
          </v-btn>
          <v-btn
            :loading="loading.loadData || loading.syncData"
            icon
            @click="syncFilters() || reset()"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <slot name="header-action"></slot>
        </v-toolbar>
        <v-container v-if="showFilterInterface" fluid class="pb-0 mt-3">
          <v-row>
            <v-col
              v-if="recordInfo.paginationOptions.hasSearch"
              :key="-1"
              cols="12"
              lg="3"
              class="py-0"
            >
              <v-text-field
                v-model="searchInput"
                label="Search"
                placeholder="Type to search"
                outlined
                prepend-icon="mdi-magnify"
                clearable
                @change="filterChanged = true"
                @keyup.enter="updatePageOptions()"
              ></v-text-field>
            </v-col>
            <v-col
              v-for="(item, i) in visibleFiltersArray"
              :key="i"
              cols="12"
              lg="3"
              class="py-0"
            >
              <GenericFilterInput
                :item="item"
                @handle-submit="updatePageOptions"
                @handle-input="filterChanged = true"
              ></GenericFilterInput>
            </v-col>
          </v-row>
          <v-toolbar v-if="filterChanged" dense flat color="transparent">
            <v-spacer></v-spacer>
            <v-btn color="primary" class="mb-2" @click="updatePageOptions()">
              <v-icon left>mdi-filter</v-icon>
              Update Filters
            </v-btn>
          </v-toolbar>
        </v-container>
      </template>
      <template v-slot:item="props">
        <tr
          v-if="props.isMobile"
          :key="props.item.id"
          class="v-data-table__mobile-table-row"
          @click="handleRowClick(props.item)"
        >
          <td
            v-for="(headerItem, i) in headers"
            :key="i"
            class="v-data-table__mobile-row"
          >
            <div
              v-if="headerItem.value === null"
              class="text-center"
              style="width: 100%"
            >
              <RecordActionMenu
                :record-info="recordInfo"
                :item="props.item"
                expand-mode="emit"
                bottom
                offset-y
                @handle-action-click="openEditDialog"
                @handle-expand-click="openExpandDialog(props, ...$event)"
                @handle-custom-action-click="handleCustomActionClick"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn block text v-bind="attrs" v-on="on"> Actions </v-btn>
                </template>
              </RecordActionMenu>
            </div>
            <template v-else>
              <div class="v-data-table__mobile-row__header">
                {{ headerItem.text }}
              </div>
              <div class="v-data-table__mobile-row__cell truncate-mobile-row">
                <div v-if="headerItem.value === 'rank'">
                  {{ renderRank(props.index) }}
                </div>
                <div v-else>
                  <component
                    :is="headerItem.fieldInfo.component"
                    v-if="headerItem.fieldInfo.component"
                    :item="props.item"
                    :field-path="headerItem.path"
                    @submit="reset({ resetExpanded: false })"
                    @item-updated="reset({ resetExpanded: false })"
                  ></component>
                  <span v-else>
                    {{ getTableRowData(headerItem, props.item) }}
                  </span>
                </div>
              </div>
            </template>
          </td>
        </tr>
        <tr
          v-else
          :key="props.item.id"
          :class="{
            'expanded-row-bg': props.isExpanded,
          }"
          @click="handleRowClick(props.item)"
        >
          <td
            v-for="(headerItem, i) in headers"
            :key="i"
            :class="headerItem.align ? 'text-' + headerItem.align : null"
            class="truncate"
          >
            <div v-if="headerItem.value === null">
              <RecordActionMenu
                :record-info="recordInfo"
                :item="props.item"
                expand-mode="emit"
                left
                offset-x
                @handle-action-click="openEditDialog"
                @handle-expand-click="toggleItemExpanded(props, ...$event)"
                @handle-custom-action-click="handleCustomActionClick"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-icon small v-bind="attrs" v-on="on"
                    >mdi-dots-vertical</v-icon
                  >
                </template>
              </RecordActionMenu>
            </div>
            <span v-else-if="headerItem.value === 'rank'">
              {{ renderRank(props.index) }}
            </span>

            <span v-else>
              <component
                :is="headerItem.fieldInfo.component"
                v-if="headerItem.fieldInfo.component"
                :item="props.item"
                :field-path="headerItem.path"
                @submit="reset({ resetExpanded: false })"
                @item-updated="reset({ resetExpanded: false })"
              ></component>
              <span v-else>
                {{ getTableRowData(headerItem, props.item) }}
              </span>
            </span>
          </td>
        </tr>
      </template>
      <template v-if="hasNested" v-slot:expanded-item="{ headers }">
        <td :colspan="headers.length" class="pr-0">
          <component
            :is="childInterfaceComponent"
            class="mb-2"
            :record-info="expandTypeObject.recordInfo"
            :icon="expandTypeObject.icon"
            :title="expandTypeObject.name"
            :hidden-headers="expandTypeObject.excludeHeaders"
            :locked-filters="lockedSubFilters"
            :page-options="subPageOptions"
            :hidden-filters="hiddenSubFilters"
            is-child-component
            :dense="dense"
            @pageOptions-updated="handleSubPageOptionsUpdated"
            @record-changed="reset({ resetExpanded: false })"
          >
            <template v-slot:header-action>
              <v-btn icon @click="closeExpandedItems()">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </template>
          </component>
        </td>
      </template>
      <template v-slot:no-data>No records</template>
    </v-data-table>
    <EditRecordDialog
      :status="dialogs.editRecord"
      :record-info="recordInfo"
      :selected-item="dialogs.selectedItem"
      :mode="dialogs.editMode"
      @close="dialogs.editRecord = false"
      @handleSubmit="handleListChange()"
      @item-updated="handleListChange()"
    ></EditRecordDialog>
    <v-dialog v-model="dialogs.expandRecord">
      <component
        :is="childInterfaceComponent"
        v-if="dialogs.expandRecord && expandTypeObject"
        :record-info="expandTypeObject.recordInfo"
        :icon="expandTypeObject.icon"
        :title="expandTypeObject.name"
        :hidden-headers="expandTypeObject.excludeHeaders"
        :locked-filters="lockedSubFilters"
        :page-options="subPageOptions"
        :hidden-filters="hiddenSubFilters"
        is-child-component
        :dense="dense"
        @pageOptions-updated="handleSubPageOptionsUpdated"
        @record-changed="reset({ resetExpanded: false })"
      >
        <template v-slot:header-action>
          <v-btn icon @click="dialogs.expandRecord = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </component>
    </v-dialog>
  </div>
</template>

<script>
import crudMixin from '~/mixins/crud'
import {
  collapseObject,
  handleError,
  serializeNestedProperty,
  getPaginatorData,
} from '~/services/base'
import { executeGiraffeql } from '~/services/giraffeql'

export default {
  name: 'CrudRecordInterface',

  mixins: [crudMixin],
  data() {
    return {
      rankIndex: null,
      requiredFilters: [
        'event.id',
        'pbClass.id',
        'setSize',
        'createdBy.isPublic',
        'isCurrent',
      ],
    }
  },

  computed: {
    // render the rank header ONLY if sorting by score AND with event, pbClass, setSize, isPublic, and isCurrent filters applied
    isRankMode() {
      let rankMode = false
      if (this.options.sortBy[0] === 'score') {
        const requiredFiltersSet = new Set(this.requiredFilters)

        this.filters.concat(this.lockedFilters).forEach((filterObject) => {
          if (requiredFiltersSet.has(filterObject.field)) {
            requiredFiltersSet.delete(filterObject.field)
          }
        })
        // if all required fields were present, add the header
        if (requiredFiltersSet.size < 1) {
          rankMode = true
        }
      }
      return rankMode
    },

    headers() {
      return (this.isRankMode
        ? [
            {
              text: 'Rank',
              sortable: false,
              value: 'rank',
              align: 'right',
              width: '50px',
            },
          ]
        : []
      ).concat(
        this.recordInfo.paginationOptions.headers
          .filter(
            (headerInfo) => !this.hiddenHeaders.includes(headerInfo.field)
          )
          .map((headerInfo) => {
            const fieldInfo = this.recordInfo.fields[headerInfo.field]

            // field unknown, abort
            if (!fieldInfo)
              throw new Error('Unknown field: ' + headerInfo.field)

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
      )
    },
  },

  methods: {
    renderRank(index) {
      // if sorting desc, index must be negative
      const diff = this.pageOptions.sortDesc[0] ? -1 * index : index

      return this.rankIndex ? this.rankIndex + diff : ''
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

        // if any rows returned AND in isRankMode, fetch the rank of the first row
        if (results.edges.length > 0 && this.isRankMode) {
          const rankResults = await executeGiraffeql(this, {
            getPersonalBest: {
              ranking: true,
              __args: {
                id: results.edges[0].node.id,
              },
            },
          })

          this.rankIndex = rankResults.ranking
        } else {
          this.rankIndex = null
        }

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
  },
}
</script>

<style scoped>
.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr.expanded-row-bg:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) {
  background: var(--v-secondary-base);
}
</style>
