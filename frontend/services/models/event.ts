import type { RecordInfo } from '~/types'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'

export default <RecordInfo<'event'>>{
  type: 'event',
  name: 'Event',
  icon: 'mdi-view-grid',
  renderItem: (item) => item.name,
  options: {
    sortBy: ['created_at'],
    sortDesc: [true],
  },
  hasSearch: true,
  filters: [
    {
      field: 'id',
      operator: 'eq',
    },
  ],
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
    fields: ['name', 'code'],
  },
  editOptions: {
    fields: ['name', 'code'],
  },
  viewOptions: {
    fields: ['name', 'code'],
  },
  deleteOptions: {},
  shareOptions: {
    route: '/events',
  },
  headers: [
    {
      field: 'name',
      sortable: true,
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
