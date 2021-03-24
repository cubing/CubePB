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
    setSize: {
      text: 'Sample Size',
      parseValue: (val) => val || null, // truthy or null
      optional: true,
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
        field: 'name',
        sortable: true,
      },
      {
        field: 'setSize',
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
    fields: ['name', 'description', 'setSize'],
  },
  editOptions: {
    fields: ['name', 'description'],
  },
  viewOptions: {
    fields: ['name', 'description', 'setSize'],
  },
  deleteOptions: {},
  shareOptions: undefined,

  expandTypes: [],
}
