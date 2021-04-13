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
        <v-toolbar flat color="accent">
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
            darks
            class="mb-2"
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
            v-if="recordInfo.paginationOptions.downloadOptions"
            icon
            :loading="loading.exportData"
            @click="exportData()"
          >
            <v-icon>mdi-download</v-icon>
          </v-btn>
          <v-btn icon @click="syncFilters() || reset()">
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
              <v-switch
                v-if="item.fieldInfo.inputType === 'switch'"
                v-model="item.value"
                :label="item.title || item.fieldInfo.text || item.field"
                @change="filterChanged = true"
              ></v-switch>
              <v-menu
                v-else-if="item.fieldInfo.inputType === 'datepicker'"
                v-model="item.focused"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="item.value"
                    :label="item.title || item.fieldInfo.text || item.field"
                    clearable
                    filled
                    autocomplete="off"
                    v-bind="attrs"
                    v-on="on"
                    @change="filterChanged = true"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="item.value"
                  color="primary"
                  no-title
                  @input="item.focused = false"
                  @change="filterChanged = true"
                ></v-date-picker>
              </v-menu>
              <v-autocomplete
                v-else-if="
                  item.fieldInfo.inputType === 'autocomplete' ||
                  item.fieldInfo.inputType === 'combobox'
                "
                v-model="item.value"
                :items="item.options"
                item-text="name"
                item-value="id"
                :label="item.title || item.fieldInfo.text || item.field"
                :prepend-icon="item.fieldInfo.icon"
                clearable
                filled
                return-object
                class="py-0"
                @change="filterChanged = true"
              ></v-autocomplete>
              <v-autocomplete
                v-else-if="
                  item.fieldInfo.inputType === 'server-autocomplete' ||
                  item.fieldInfo.inputType === 'server-combobox'
                "
                v-model="item.value"
                :loading="item.loading"
                :search-input.sync="item.search"
                :items="item.options"
                item-text="name"
                item-value="id"
                :label="item.title || item.fieldInfo.text || item.field"
                :prepend-icon="item.fieldInfo.icon"
                clearable
                filled
                hide-no-data
                cache-items
                return-object
                class="py-0"
                @update:search-input="handleSearchUpdate(item)"
                @blur="item.focused = false"
                @focus="item.focused = true"
                @change="filterChanged = true"
              ></v-autocomplete>
              <v-select
                v-else-if="item.fieldInfo.inputType === 'select'"
                v-model="item.value"
                :items="item.options"
                filled
                :label="item.title || item.fieldInfo.text || item.field"
                :prepend-icon="item.fieldInfo.icon"
                clearable
                return-object
                item-text="name"
                item-value="id"
                class="py-0"
                @change="filterChanged = true"
              ></v-select>
              <v-text-field
                v-else
                v-model="item.value"
                :label="item.title || item.fieldInfo.text || item.field"
                :prepend-icon="item.fieldInfo.icon"
                filled
                clearable
                @change="filterChanged = true"
              ></v-text-field>
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
                <component
                  :is="headerItem.fieldInfo.component"
                  v-if="headerItem.fieldInfo.component"
                  :item="props.item"
                  :field-path="headerItem.path"
                ></component>
                <span v-else>
                  {{ getTableRowData(headerItem, props.item) }}
                </span>
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
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-icon small v-bind="attrs" v-on="on"
                    >mdi-dots-vertical</v-icon
                  >
                </template>
              </RecordActionMenu>
            </div>
            <span v-else>
              <component
                :is="headerItem.fieldInfo.component"
                v-if="headerItem.fieldInfo.component"
                :item="props.item"
                :field-path="headerItem.path"
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

export default {
  name: 'CrudRecordInterface',

  mixins: [crudMixin],
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
