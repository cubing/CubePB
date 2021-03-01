import type { RecordInfo } from '~/types'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'

export default <RecordInfo<'event'>>{
  type: 'event',
  name: 'Event',
  pluralName: 'Events',
  icon: 'mdi-view-grid',
  renderItem: (item) => item.name,
  options: {
    sortBy: ['created_at'],
    sortDesc: [true],
  },
  hasSearch: true,
  filters: [],
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
    max_attempts: {
      text: 'Max Attempts',
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
  addOptions: {
    fields: ['name', 'code', 'max_attempts'],
  },
  editOptions: {
    fields: ['name', 'code'],
  },
  viewOptions: {
    fields: ['name', 'code', 'max_attempts'],
  },
  deleteOptions: {},
  shareOptions: undefined,
  headers: [
    {
      field: 'name',
      sortable: true,
    },
    {
      field: 'max_attempts',
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
  expandTypes: [],
}
