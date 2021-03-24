import type { RecordInfo } from '~/types'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'

export const UserUserFollowLink = <RecordInfo<'userUserFollowLink'>>{
  typename: 'userUserFollowLink',
  pluralTypename: 'userUserFollowLinks',
  name: 'UserUserFollowLink',
  pluralName: 'UserUserFollowLinks',
  icon: 'mdi-view-grid',
  // renderItem: (item) => item.name,
  fields: {
    id: {
      text: 'ID',
    },
    'user.name': {
      text: 'Name',
    },
    'target.name': {
      text: 'Target',
    },
    'user.id': {
      text: 'Name',
    },
    'target.id': {
      text: 'Target',
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
        field: 'user.name',
        sortable: false,
        width: '200px',
      },
      {
        field: 'target.name',
        sortable: false,
        width: '200px',
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
    fields: ['user.id', 'target.id'],
  },
  editOptions: undefined,
  viewOptions: {
    fields: ['user.id', 'target.id'],
  },
  deleteOptions: {},
  shareOptions: undefined,

  expandTypes: [],
}
