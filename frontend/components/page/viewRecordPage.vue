<template>
  <v-container v-if="loading.loadRecord || !selectedItem" fill-height>
    <v-layout align-center justify-center>
      <div v-if="loading.loadRecord">
        <span class="display-1 pl-2"
          >Loading...
          <v-progress-circular indeterminate></v-progress-circular>
        </span>
      </div>
      <div v-else>
        <span class="display-1 pl-2">{{ recordInfo.name }} Not Found</span>
      </div>
    </v-layout>
  </v-container>
  <v-container v-else fluid>
    <v-layout justify-center align-center column d-block>
      <v-row>
        <v-col
          cols="12"
          :md="isExpanded ? 4 : 6"
          class="text-center"
          :offset-md="isExpanded ? 0 : 3"
        >
          <v-card class="elevation-12">
            <component
              :is="currentInterface"
              :selected-item="selectedItem"
              :record-info="recordInfo"
              mode="view"
            >
              <template v-slot:toolbar>
                <v-toolbar flat color="accent">
                  <v-icon left>{{ recordInfo.icon || 'mdi-domain' }}</v-icon>
                  <v-toolbar-title>
                    {{ recordInfo.name }}
                  </v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-btn
                    v-if="recordInfo.shareOptions"
                    icon
                    @click="openEditDialog('share')"
                  >
                    <v-icon>mdi-share-variant</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="recordInfo.editOptions"
                    icon
                    @click="openEditDialog('edit')"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="recordInfo.deleteOptions"
                    icon
                    @click="openEditDialog('delete')"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                  <v-menu
                    v-if="
                      recordInfo.expandTypes &&
                      recordInfo.expandTypes.length > 0
                    "
                    right
                    offset-x
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-chevron-right</v-icon>
                      </v-btn>
                    </template>

                    <v-list dense>
                      <v-list-item
                        v-for="(item, i) in recordInfo.expandTypes"
                        :key="i"
                        dense
                        @click="toggleExpand(i)"
                      >
                        <v-list-item-icon>
                          <v-icon>{{
                            item.icon || item.recordInfo.icon
                          }}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{
                          item.name || item.recordInfo.name
                        }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-toolbar>
              </template>
            </component>
          </v-card>
        </v-col>
        <v-col v-if="isExpanded" cols="12" md="8">
          <v-card class="elevation-12">
            <component
              :is="interfaceComponent"
              :record-info="expandTypeObject.recordInfo"
              :title="expandTypeObject.name"
              :icon="expandTypeObject.icon"
              :hidden-headers="expandTypeObject.excludeHeaders"
              :locked-filters="lockedSubFilters"
              :page-options="subPageOptions"
              :hidden-filters="hiddenSubFilters"
              dense
              @pageOptions-updated="handleSubPageOptionsUpdated"
            >
              <template v-slot:header-action>
                <v-btn icon @click="toggleExpand(null)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </template>
            </component>
          </v-card>
        </v-col>
      </v-row>
    </v-layout>
    <EditRecordDialog
      :status="dialogs.editRecord"
      :record-info="recordInfo"
      :selected-item="selectedItem"
      :mode="dialogs.editMode"
      @close="dialogs.editRecord = false"
      @handleSubmit="handleSubmit"
    ></EditRecordDialog>
  </v-container>
</template>

<script>
import EditRecordInterface from '~/components/interface/crud/editRecordInterface.vue'
import EditRecordDialog from '~/components/dialog/editRecordDialog.vue'
import { executeGiraffeql } from '~/services/giraffeql'
import {
  capitalizeString,
  handleError,
  collapseObject,
  serializeNestedProperty,
} from '~/services/base'
import CrudRecordInterface from '~/components/interface/crud/crudRecordInterface.vue'

export default {
  components: {
    EditRecordDialog,
  },

  props: {
    recordInfo: {
      type: Object,
      required: true,
    },
    lookupParams: {
      type: Object,
      default: () => null,
    },
    head: {
      type: Object,
      default: () => null,
    },
  },

  data() {
    return {
      selectedItem: null,
      expandTypeObject: null,
      subPageOptions: null,

      dialogs: {
        editRecord: false,
        editMode: 'view',
      },

      loading: {
        loadRecord: false,
      },
    }
  },

  computed: {
    isExpanded() {
      return !!this.expandTypeObject
    },
    currentInterface() {
      return this.recordInfo.viewOptions.component || EditRecordInterface
    },
    hiddenSubFilters() {
      if (!this.isExpanded) return []

      // is there an excludeFilters array on the expandTypeObject? if so, use that
      return [this.recordInfo.typename.toLowerCase() + '.id'].concat(
        this.expandTypeObject.excludeFilters ?? []
      )
    },
    lockedSubFilters() {
      if (!this.isExpanded) return []

      // is there a lockedFilters generator on the expandTypeObject? if so, use that
      if (this.expandTypeObject.lockedFilters) {
        return this.expandTypeObject.lockedFilters(this, this.selectedItem)
      }

      return [
        {
          field: this.recordInfo.typename.toLowerCase() + '.id',
          operator: 'eq',
          value: this.selectedItem.id,
        },
      ]
    },
    capitalizedTypename() {
      return capitalizeString(this.recordInfo.typename)
    },

    interfaceComponent() {
      return this.expandTypeObject
        ? this.expandTypeObject.component
        : this.recordInfo.paginationOptions.interfaceComponent ||
            CrudRecordInterface
    },
  },

  watch: {
    '$route.query.expand'(val) {
      this.setExpandTypeObject(val)
    },
  },

  mounted() {
    // must independently verify existence of item
    this.loadRecord().then(() => {
      // if expand query param set, set the initial expandTypeObject
      if (this.$route.query.expand) {
        this.setExpandTypeObject(this.$route.query.expand)
      }
    })
  },

  methods: {
    handleSubmit() {
      this.loadRecord()
      this.$emit('handle-submit')
    },

    toggleExpand(index) {
      const query = {
        ...this.$route.query,
      }

      if (index !== null) {
        query.expand = index
      } else {
        delete query.expand
      }

      // push to route
      this.$router
        .replace({
          path: this.$route.path,
          query,
        })
        .catch((e) => e)
    },

    setExpandTypeObject(index) {
      // if index is undefined, unset it
      if (index === undefined) {
        this.expandTypeObject = null
        return
      }

      if (
        Array.isArray(this.recordInfo.expandTypes) &&
        this.recordInfo.expandTypes[index]
      ) {
        const expandTypeObject = this.recordInfo.expandTypes[index]

        this.expandTypeObject = expandTypeObject

        // when item expanded, reset the filters
        this.subPageOptions = {
          search: null,
          filters: expandTypeObject.initialFilters ?? [],
          sortBy: expandTypeObject.initialSortOptions?.sortBy ?? [],
          sortDesc: expandTypeObject.initialSortOptions?.sortDesc ?? [],
        }
      }
    },

    handleSubPageOptionsUpdated(pageOptions) {
      this.subPageOptions = pageOptions
    },

    openDialog(dialogName) {
      if (dialogName in this.dialogs) {
        this.dialogs[dialogName] = true
      }
    },

    openEditDialog(mode) {
      this.dialogs.editMode = mode
      this.openDialog('editRecord')
    },

    async loadRecord() {
      this.loading.loadRecord = true
      try {
        const data = await executeGiraffeql(this, {
          ['get' + this.capitalizedTypename]: {
            ...collapseObject(
              (this.recordInfo.requiredFields ?? []).reduce(
                (total, item) => {
                  total[item] = true
                  return total
                },
                {
                  id: true,
                }
              )
            ),
            __args: this.lookupParams ?? {
              id: this.$route.query.id,
            },
          },
        })

        // apply serialization to results
        if (this.recordInfo.requiredfields) {
          // check if there is a parser on the fieldInfo
          this.recordInfo.requiredfields.forEach((field) => {
            const fieldInfo = this.recordInfo.fields[field]

            // field unknown, abort
            if (!fieldInfo) throw new Error('Unknown field: ' + field)

            if (fieldInfo.serialize)
              serializeNestedProperty(data, field, fieldInfo.serialize)
          })
        }

        this.selectedItem = data
      } catch (err) {
        this.selectedItem = null
        handleError(this, err)
      }
      this.loading.loadRecord = false
    },
  },

  head() {
    return (
      this.head ?? {
        title: 'View ' + this.recordInfo.name,
      }
    )
  },
}
</script>
