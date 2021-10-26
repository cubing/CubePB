import type { RecordInfo } from '~/types'
import { generateDateLocaleString } from '~/services/base'

export const LegacyRecord = <RecordInfo<'legacyRecord'>>{
  typename: 'legacyRecord',
  pluralTypename: 'legacyRecord',
  name: 'Legacy Record',
  pluralName: 'Legacy Records',
  icon: 'mdi-view-list',
  routeName: 'a-view',
  // renderItem: (item) => item.name,
  fields: {
    id: {
      text: 'ID',
    },
    wcaEventId: {
      text: 'WCA Event ID',
    },
    recordType: {
      text: 'Record Type',
    },
    numberOfSolves: {
      text: 'Number of Solves',
    },
    result: {
      text: 'Result',
    },
    otherEventName: {
      text: 'Other Event Name',
    },
    mainCube: {
      text: 'Main Cube',
    },
    eventType: {
      text: 'Event Type',
    },
    date: {
      text: 'Date',
      inputType: 'datepicker',
      serialize: generateDateLocaleString,
      parseValue: (val: string) => {
        if (!val) return null

        const msTimestamp = new Date(val).getTime()

        return msTimestamp / 1000
      },
      parseImportValue: (val: string) => {
        if (!val) return null

        const msTimestamp = new Date(val).getTime()

        return msTimestamp / 1000
      },
    },
    email: {
      text: 'Email',
    },
  },
  paginationOptions: {
    hasSearch: false,
    filters: [
      {
        field: 'email',
        operator: 'eq',
      },
    ],
    headers: [
      {
        field: 'wcaEventId',
        sortable: false,
        width: '150px',
      },
      {
        field: 'recordType',
        sortable: false,
        width: '100px',
      },
      {
        field: 'numberOfSolves',
        sortable: false,
        width: '150px',
      },
      {
        field: 'result',
        sortable: false,
        width: '200px',
      },
      {
        field: 'otherEventName',
        sortable: false,
        width: '250px',
      },
      {
        field: 'mainCube',
        sortable: false,
      },
      {
        field: 'eventType',
        sortable: false,
        width: '100px',
      },
      {
        field: 'date',
        sortable: false,
      },
    ],
    downloadOptions: {},
  },
  addOptions: {
    fields: [
      'wcaEventId',
      'recordType',
      'numberOfSolves',
      'result',
      'otherEventName',
      'mainCube',
      'eventType',
      'date',
      'email',
    ],
  },
  editOptions: {
    fields: [
      'wcaEventId',
      'recordType',
      'numberOfSolves',
      'result',
      'otherEventName',
      'mainCube',
      'eventType',
      'date',
      'email',
    ],
  },
  viewOptions: {
    fields: [
      'wcaEventId',
      'recordType',
      'numberOfSolves',
      'result',
      'otherEventName',
      'mainCube',
      'eventType',
      'date',
      'email',
    ],
  },
  deleteOptions: {},
  shareOptions: undefined,
  importOptions: {
    fields: [
      'wcaEventId',
      'recordType',
      'numberOfSolves',
      'result',
      'otherEventName',
      'mainCube',
      'eventType',
      'date',
      'email',
    ],
  },

  expandTypes: [],
}
