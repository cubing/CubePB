import type { RecordInfo } from '~/types'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'

export default <RecordInfo<'personalBestClass'>>{
  type: 'personalBestClass',
  name: 'Personal Best Type',
  icon: 'mdi-content-copy',
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
    description: {
      text: 'Description',
      inputType: 'textarea',
      optional: true,
    },
    set_size: {
      text: 'Sample Size',
      optional: true,
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
    fields: ['name', 'description', 'set_size'],
  },
  editOptions: {
    fields: ['name', 'description'],
  },
  viewOptions: {
    fields: ['name', 'description', 'set_size'],
  },
  deleteOptions: {},
  shareOptions: {
    route: '/personalBestClasses',
  },
  headers: [
    {
      field: 'name',
      sortable: true,
    },
    {
      field: 'set_size',
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
