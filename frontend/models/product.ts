import type { RecordInfo } from '~/types'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'

export const Product = <RecordInfo<'product'>>{
  type: 'product',
  name: 'Product',
  pluralName: 'Products',
  icon: 'mdi-dots-grid',
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
    fields: ['name'],
  },
  editOptions: {
    fields: ['name'],
  },
  viewOptions: {
    fields: ['name'],
  },
  deleteOptions: {},
  shareOptions: undefined,
  headers: [
    {
      field: 'name',
      sortable: true,
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
