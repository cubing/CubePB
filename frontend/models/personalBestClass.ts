import type { RecordInfo } from '~/types'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'

export const PersonalBestClass = <RecordInfo<'personalBestClass'>>{
  typename: 'personalBestClass',
  pluralTypename: 'personalBestClasses',
  name: 'Personal Best Type',
  pluralName: 'Personal Best Types',
  icon: 'mdi-content-copy',
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
      optional: true,
    },
    set_size: {
      text: 'Sample Size',
      parseValue: (val) => val || null, // truthy or null
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

  paginationOptions: {
    hasSearch: true,
    filters: [],
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
    downloadOptions: {},
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
  shareOptions: undefined,

  expandTypes: [],
}
