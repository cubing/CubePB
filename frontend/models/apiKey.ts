import type { RecordInfo } from '~/types'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'
import CopyableColumn from '~/components/table/common/copyableColumn.vue'

export const ApiKey = <RecordInfo<'apiKey'>>{
  typename: 'apiKey',
  pluralTypename: 'apiKeys',
  name: 'API Key',
  pluralName: 'API Keys',
  icon: 'mdi-view-grid-plus',
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
      component: CopyableColumn,
    },
    permissions: {
      text: 'Permissions',
      optional: true,
      hint: 'Only use this to specify custom permissions, comma-separated',
      serialize: (val: string[]) => val && val.join(','),
      parseValue: (val: string) =>
        val ? val.split(',').filter((ele) => ele) : [],
    },
    'user.id': {
      text: 'User',
      inputType: 'server-autocomplete',
      typename: 'user',
      parseQueryValue: (val) => Number(val),
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
    hasSearch: false,
    filters: [],
    headers: [
      {
        field: 'name',
        sortable: false,
      },
      {
        field: 'code',
        sortable: false,
        width: '250px',
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
    fields: ['name', 'permissions', 'user.id'],
  },
  editOptions: {
    fields: ['name', 'permissions'],
  },
  viewOptions: {
    fields: ['name', 'permissions', 'code', 'user.id'],
  },
  deleteOptions: {},
  shareOptions: undefined,

  expandTypes: [],
}
