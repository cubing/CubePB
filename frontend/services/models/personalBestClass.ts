import type { RecordInfo } from '~/types'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'
import EditPersonalBestDialog from '~/components/dialog/personalBest/editRecordDialog.vue'

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
    fields: ['name', 'description'],
    component: EditPersonalBestDialog,
  },
  editOptions: {
    fields: ['name', 'description'],
    component: EditPersonalBestDialog,
  },
  viewOptions: {
    fields: ['name', 'description'],
    component: EditPersonalBestDialog,
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
