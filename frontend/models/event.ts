import { getScoreMethods } from '~/services/dropdown'
import type { RecordInfo } from '~/types'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'
import EventColumn from '~/components/table/common/eventColumn.vue'

export const Event = <RecordInfo<'event'>>{
  typename: 'event',
  pluralTypename: 'events',
  name: 'Event',
  pluralName: 'Events',
  icon: 'mdi-view-grid',
  routeName: 'a-view',
  renderItem: (item) => item.name,
  fields: {
    id: {
      text: 'ID',
    },
    name: {
      text: 'Name',
    },
    description: {
      text: 'Description',
      inputType: 'textarea',
    },
    'name+code': {
      text: 'Name',
      compoundOptions: {
        primaryField: 'name',
      },
      component: EventColumn,
    },
    code: {
      text: 'Code',
    },
    cubingIcon: {
      text: 'cubing-icon',
    },
    scoreMethod: {
      text: 'Score Method',
      getOptions: getScoreMethods,
      inputType: 'select',
    },
    isSubEvent: {
      text: 'Sub Event',
      inputType: 'switch',
      parseQueryValue: (val) => val === 'true',
      default: () => false,
    },
    isWcaEvent: {
      text: 'WCA Event',
      inputType: 'switch',
      parseQueryValue: (val) => val === 'true',
      default: () => false,
    },
    createdAt: {
      text: 'Created At',
      component: TimeagoColumn,
    },
    updatedAt: {
      text: 'Updated At',
      component: TimeagoColumn,
    },
  },
  paginationOptions: {
    hasSearch: true,
    filters: [],
    headers: [
      {
        field: 'name+code',
        sortable: true,
      },
      {
        field: 'isSubEvent',
        sortable: false,
        width: '150px',
      },
      {
        field: 'isWcaEvent',
        sortable: false,
        width: '150px',
      },
      {
        field: 'scoreMethod',
        sortable: false,
        width: '150px',
      },
      {
        field: 'code',
        sortable: false,
        width: '100px',
      },
      {
        field: 'cubingIcon',
        sortable: false,
        width: '100px',
      },
      {
        field: 'createdAt',
        width: '150px',
        sortable: true,
      },
      {
        field: 'updatedAt',
        width: '150px',
        sortable: true,
      },
    ],
    downloadOptions: {},
  },
  addOptions: {
    fields: [
      'name',
      'description',
      'code',
      'cubingIcon',
      'scoreMethod',
      'isSubEvent',
      'isWcaEvent',
    ],
  },
  editOptions: {
    fields: ['name', 'description', 'code', 'cubingIcon', 'isWcaEvent'],
  },
  viewOptions: {
    fields: [
      'name',
      'description',
      'code',
      'cubingIcon',
      'scoreMethod',
      'isSubEvent',
      'isWcaEvent',
    ],
  },
  deleteOptions: {},
  shareOptions: undefined,

  expandTypes: [],
}
