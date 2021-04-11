<template>
  <div :class="{ 'expanded-table-bg': isChildComponent }">
    <v-toolbar flat color="accent">
      <v-icon left>{{ icon }}</v-icon>
      <v-toolbar-title>{{ title }}</v-toolbar-title>

      <v-spacer></v-spacer>
      <HelpButton v-if="editable"></HelpButton>
      <v-btn
        v-if="recordInfo.shareOptions && editable"
        icon
        @click="copyShareLink()"
      >
        <v-icon>mdi-share-variant</v-icon>
      </v-btn>
      <v-btn icon @click="reset()">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      <slot name="header-action"></slot>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="displayItems"
      class="elevation-1"
      :items-per-page="-1"
      dense
      :loading="loading.loadData"
      loading-text="Loading... Please wait"
      hide-default-footer
    >
      <template v-slot:item="props">
        <tr
          v-if="props.isMobile"
          :key="props.item.id"
          class="v-data-table__mobile-table-row"
        >
          <td
            v-for="(headerItem, i) in headers"
            :key="i"
            class="v-data-table__mobile-row"
          >
            <div class="v-data-table__mobile-row__header">
              {{ headerItem.text }}
            </div>
            <div class="v-data-table__mobile-row__cell truncate-mobile-row">
              <EventColumn
                v-if="headerItem.value === 'event.name'"
                :item="props.item"
                field-path="event"
              ></EventColumn>
              <span
                v-else
                @click="openEditDialog('view', props.item[headerItem.value])"
              >
                <ResultColumn
                  v-if="props.item[headerItem.value]"
                  class="d-inline-flex"
                  :item="props.item[headerItem.value]"
                ></ResultColumn>
                <v-icon
                  v-if="props.item[headerItem.value] && editable"
                  small
                  color="pink"
                  @click.stop="
                    openEditDialog('delete', props.item[headerItem.value])
                  "
                  >mdi-close</v-icon
                >
                <v-icon
                  v-if="editable"
                  small
                  @click.stop="
                    openAddRecordDialog(props.item.event.id, headerItem.value)
                  "
                  >mdi-pencil</v-icon
                >
              </span>
            </div>
          </td>
        </tr>

        <tr v-else :key="props.item.id">
          <td key="event" class="truncate">
            <EventColumn :item="props.item" field-path="event"></EventColumn>
          </td>
          <td
            v-for="(headerItem, i) in pbTypeHeaders"
            :key="i"
            :class="headerItem.align ? 'text-' + headerItem.align : null"
          >
            <span @click="openEditDialog('view', props.item[headerItem.value])">
              <ResultColumn
                v-if="props.item[headerItem.value]"
                :item="props.item[headerItem.value]"
              ></ResultColumn>
              <div v-else>&nbsp;</div>
              <v-icon
                v-if="props.item[headerItem.value] && editable"
                small
                color="pink"
                @click.stop="
                  openEditDialog('delete', props.item[headerItem.value])
                "
                >mdi-close</v-icon
              >
              <v-icon
                v-if="editable"
                small
                @click.stop="
                  openAddRecordDialog(props.item.event.id, headerItem.value)
                "
                >mdi-pencil</v-icon
              >
            </span>
          </td>
        </tr>
      </template>
      <!--       <template v-slot:[`body.append`]="props">
        <tr>
          <td :colspan="headers.length">
            <v-icon left small>mdi-plus</v-icon> Show More
          </td>
        </tr>
      </template> -->
    </v-data-table>
    <EditRecordDialog
      :status="dialogs.editRecord"
      :record-info="recordInfo"
      :selected-item="dialogs.selectedItem"
      :mode="dialogs.editMode"
      @close="dialogs.editRecord = false"
      @handleSubmit="reset()"
    ></EditRecordDialog>
  </div>
</template>

<script>
import {
  handleError,
  serializeNestedProperty,
  copyToClipboard,
  collectPaginatorData,
} from '~/services/base'
import EventColumn from '~/components/table/common/eventColumn.vue'
import ResultColumn from '~/components/table/common/resultColumn.vue'
import EditRecordDialog from '~/components/dialog/editRecordDialog.vue'
import HelpButton from '~/components/help/viewPbCardInterface/helpButton.vue'
import { getEvents } from '~/services/dropdown'

export default {
  components: {
    EventColumn,
    ResultColumn,
    EditRecordDialog,
    HelpButton,
  },

  props: {
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    recordInfo: {
      required: true,
    },
    editable: {
      type: Boolean,
      default: false,
    },
    pageOptions: {
      type: Object,
      default: null,
    },
    lockedFilters: {
      type: Array,
      default: () => [],
    },
    isChildComponent: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: {
        loadData: false,
      },

      dialogs: {
        editRecord: false,
        selectedItem: null,
        editMode: 'view',
      },

      headers: [
        {
          text: 'Event',
          value: 'event.name',
        },
        { text: 'Single', value: 'single', width: '130px', align: 'right' },
        { text: 'Mo3', value: 'mo3', width: '130px', align: 'right' },
        { text: 'Ao5', value: 'ao5', width: '130px', align: 'right' },
        { text: 'Ao12', value: 'ao12', width: '130px', align: 'right' },
        { text: 'Ao50', value: 'ao50', width: '130px', align: 'right' },
        { text: 'Ao100', value: 'ao100', width: '130px', align: 'right' },
        { text: 'Ao1000', value: 'ao1000', width: '130px', align: 'right' },
      ],
      items: [],

      valueToSelectedItemMap: {
        single: {
          'pbClass.id': 1,
          setSize: 1,
        },
        mo3: {
          'pbClass.id': 3,
          setSize: 3,
        },
        ao5: {
          'pbClass.id': 2,
          setSize: 5,
        },
        ao12: {
          'pbClass.id': 2,
          setSize: 12,
        },
        ao50: {
          'pbClass.id': 2,
          setSize: 50,
        },
        ao100: {
          'pbClass.id': 2,
          setSize: 100,
        },
        ao1000: {
          'pbClass.id': 2,
          setSize: 1000,
        },
      },

      // base events to display
      eventsArray: [],
    }
  },

  computed: {
    displayItems() {
      return this.editable
        ? this.items
        : this.items.filter((itemObject) => itemObject.hasRecords)
    },

    pbTypeHeaders() {
      return this.headers.slice(1)
    },
  },

  watch: {
    // this triggers when pageOptions get updated on parent element
    // this also triggers when parent element switches to a different item
    pageOptions() {
      this.reset()
    },
  },

  mounted() {
    this.reset()
  },

  methods: {
    // links to the user profile with this specific component expanded
    copyShareLink() {
      const createdById = this.lockedFilters.find(
        (ele) => ele.field === 'createdBy.id'
      )?.value

      if (!createdById) return

      const shareUrl =
        window.location.origin +
        this.$router.resolve({
          name: 'user',
          query: {
            id: createdById,
            expand: 0,
          },
        }).href
      copyToClipboard(this, shareUrl)
    },

    openAddRecordDialog(eventId, key) {
      const initializedRecord = {
        'event.id': eventId,
        ...this.valueToSelectedItemMap[key],
      }

      this.openEditDialog('add', initializedRecord)
    },

    openEditDialog(mode, selectedItem) {
      this.dialogs.editMode = mode
      if (selectedItem) this.openDialog('editRecord', selectedItem)
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
        // get events
        const events = await getEvents(this)

        // build eventsMap for faster mapping later
        const eventsMap = new Map()

        // build items
        const items = events.map((event) => {
          const itemObject = {
            event,
            single: null,
            mo3: null,
            ao5: null,
            ao12: null,
            ao50: null,
            ao100: null,
            ao1000: null,
            hasRecords: false,
          }

          eventsMap.set(event.id, itemObject)

          return itemObject
        })

        const filters = [
          {
            'pbClass.id': {
              eq: 1, // is pbType single
            },
            isCurrent: {
              eq: true,
            },
          },
          {
            'pbClass.id': {
              eq: 3, // is mo3
            },
            setSize: {
              eq: 3,
            },
            isCurrent: {
              eq: true,
            },
          },
          {
            'pbClass.id': {
              eq: 2, // is aoX
            },
            setSize: {
              in: [5, 12, 50, 100, 1000],
            },
            isCurrent: {
              eq: true,
            },
          },
        ]

        // generate additional filters from lockedFilters
        const additionalFilters = this.lockedFilters.reduce((total, ele) => {
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
        }, {})

        filters.forEach((ele) => {
          Object.assign(ele, additionalFilters)
        })

        const results = await collectPaginatorData(
          this,
          'getPersonalBestPaginator',
          {
            id: true,
            timeElapsed: true,
            movesCount: true,
            attemptsSucceeded: true,
            attemptsTotal: true,
            setSize: true,
            pbClass: {
              id: true,
              name: true,
            },
            event: {
              id: true,
              scoreMethod: true,
            },
          },
          {
            filterBy: filters,
          }
        )

        // create a map field -> serializeFn for fast serialization
        const serializeMap = new Map()

        const serializeFields = ['timeElapsed']

        serializeFields.forEach((field) => {
          serializeMap.set(field, this.recordInfo.fields[field].serialize)
        })

        // apply serialization to results
        results.forEach((ele) => {
          serializeMap.forEach((serialzeFn, field) => {
            serializeNestedProperty(ele, field, serialzeFn)
          })
        })

        // loop through pbs, add to eventsMap
        results.forEach((ele) => {
          const itemObject = eventsMap.get(ele.event.id)
          // flag the itemObject as hasRecords
          if (!itemObject.hasRecords) itemObject.hasRecords = true

          // if pbClass.id === 1, classify as single
          if (ele.pbClass.id === 1) {
            itemObject.single = ele
          } else if (ele.pbClass.id === 2) {
            // else if pbClass.id === 2, is Avg
            itemObject['ao' + ele.setSize] = ele
          } else if (ele.pbClass.id === 3) {
            // else if pbClass.id === 3, is Mean
            itemObject['mo' + ele.setSize] = ele
          }
        })
        this.items = items
      } catch (err) {
        handleError(this, err)
      }
      this.loading.loadData = false
    },

    reset() {
      this.loadData()
    },
  },
}
</script>
