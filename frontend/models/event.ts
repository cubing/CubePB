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
  renderItem: (item) => item.name,
  fields: {
    id: {
      text: 'ID',
    },
    name: {
      text: 'Name',
    },
    'name+code': {
      text: 'Name',
      component: EventColumn,
    },
    code: {
      text: 'Code',
    },
    scoreMethod: {
      text: 'Score Method',
      getOptions: getScoreMethods,
      inputType: 'select',
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
    fields: ['name', 'code', 'scoreMethod'],
  },
  editOptions: {
    fields: ['name', 'code'],
  },
  viewOptions: {
    fields: ['name', 'code', 'scoreMethod'],
  },
  deleteOptions: {},
  shareOptions: undefined,

  expandTypes: [],
}
