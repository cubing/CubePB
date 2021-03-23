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
