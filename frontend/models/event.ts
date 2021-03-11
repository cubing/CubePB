import { getScoreMethods } from '~/services/dropdown'
import type { RecordInfo } from '~/types'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'

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
    code: {
      text: 'Code',
    },
    score_method: {
      text: 'Score Method',
      getOptions: getScoreMethods,
      inputType: 'select',
    },
    created_at: {
      text: 'Created At',
      component: TimeagoColumn,
    },
    updated_at: {
      text: 'Updated At',
      component: TimeagoColumn,
    },
  },
  paginationOptions: {
    hasSearch: true,
    filters: [],
    headers: [
      {
        field: 'name',
        sortable: true,
      },
      {
        field: 'score_method',
        sortable: false,
        width: '150px',
      },
      {
        field: 'code',
        sortable: false,
        width: '100px',
      },
      {
        field: 'created_at',
        width: '150px',
        sortable: true,
      },
      {
        field: 'updated_at',
        width: '150px',
        sortable: true,
      },
    ],
    downloadOptions: {},
  },
  addOptions: {
    fields: ['name', 'code', 'score_method'],
  },
  editOptions: {
    fields: ['name', 'code'],
  },
  viewOptions: {
    fields: ['name', 'code', 'score_method'],
  },
  deleteOptions: {},
  shareOptions: undefined,

  expandTypes: [],
}
