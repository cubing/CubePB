<template>
  <div>
    <v-toolbar flat color="accent">
      <v-icon left>{{ icon }}</v-icon>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="reset()">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="items"
      class="elevation-1"
      :items-per-page="-1"
      dense
      :loading="loading.loadData"
      loading-text="Loading... Please wait"
      hide-default-footer
    >
      <template v-slot:item="props">
        <tr :key="props.item.id">
          <td
            v-for="(headerItem, i) in headers"
            :key="i"
            :class="headerItem.align ? 'text-' + headerItem.align : null"
            class="truncate"
          >
            <EventColumn
              v-if="headerItem.value === 'event.name'"
              :item="props.item"
              :fieldpath="headerItem.value"
            ></EventColumn>
            <span
              v-else
              class="d-inline-flex"
              @click="openEditDialog('view', props.item[headerItem.value])"
            >
              <ResultColumn
                v-if="props.item[headerItem.value]"
                :item="props.item[headerItem.value]"
                :fieldpath="headerItem.value"
              ></ResultColumn>
              <v-icon
                v-if="editable"
                small
                right
                @click.stop="
                  openAddRecordDialog(props.item.event.id, headerItem.value)
                "
                >mdi-pencil</v-icon
              >
            </span>
          </td>
        </tr>
      </template>
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
import { executeGiraffeql } from '~/services/giraffeql'
import { handleError, serializeNestedProperty } from '~/services/base'
import EventColumn from '~/components/table/common/eventColumn.vue'
import ResultColumn from '~/components/table/common/resultColumn.vue'
import { PersonalBest } from '~/models'
import EditRecordDialog from '~/components/dialog/editRecordDialog.vue'

export default {
  components: {
    EventColumn,
    ResultColumn,
    EditRecordDialog,
  },

  props: {
    editable: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: {
        loadData: false,
      },

      recordInfo: PersonalBest,

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
        { text: 'Single', value: 'single', width: '150px', align: 'right' },
        { text: 'Mo3', value: 'mo3', width: '150px', align: 'right' },
        { text: 'Ao5', value: 'ao5', width: '150px', align: 'right' },
        { text: 'Ao12', value: 'ao12', width: '150px', align: 'right' },
        { text: 'Ao50', value: 'ao50', width: '150px', align: 'right' },
        { text: 'Ao100', value: 'ao100', width: '150px', align: 'right' },
        { text: 'Ao1000', value: 'ao1000', width: '150px', align: 'right' },
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
        ao100: {
          'pbClass.id': 2,
          setSize: 1000,
        },
      },
    }
  },

  mounted() {
    this.reset()
  },

  methods: {
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
        const data = await executeGiraffeql(this, {
          [`getPersonalBestPaginator`]: {
            edges: {
              node: {
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
                  name: true,
                  scoreMethod: true,
                  cubingIcon: true,
                },
              },
            },
            __args: {
              first: 100,
              filterBy: [
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
              ],
            },
          },
        })

        // create a map field -> serializeFn for fast serialization
        const serializeMap = new Map()

        const serializeFields = ['timeElapsed']

        serializeFields.forEach((field) => {
          serializeMap.set(field, PersonalBest.fields[field].serialize)
        })

        // apply serialization to results
        data.edges.forEach((ele) => {
          serializeMap.forEach((serialzeFn, field) => {
            serializeNestedProperty(ele.node, field, serialzeFn)
          })
        })

        // get list of unique events
        const eventsMap = new Map()

        data.edges.forEach((ele) => {
          if (!eventsMap.has(ele.node.event.id)) {
            eventsMap.set(ele.node.event.id, {
              event: ele.node.event,
              single: null,
              mo3: null,
              ao5: null,
              ao12: null,
              ao50: null,
              ao100: null,
            })
          }
        })

        // loop through pbs, add to eventsMap
        data.edges.forEach((ele) => {
          // if pbClass.id === 1, classify as single
          if (ele.node.pbClass.id === 1) {
            eventsMap.get(ele.node.event.id).single = ele.node
          } else if (ele.node.pbClass.id === 2) {
            // else if pbClass.id === 2, is Avg
            eventsMap.get(ele.node.event.id)['ao' + ele.node.setSize] = ele.node
          } else if (ele.node.pbClass.id === 3) {
            // else if pbClass.id === 3, is Mean
            eventsMap.get(ele.node.event.id)['mo' + ele.node.setSize] = ele.node
          }
        })

        this.items = [...eventsMap.values()]
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
