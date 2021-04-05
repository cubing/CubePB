import type { RecordInfo } from '~/types'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'
import UserColumn from '~/components/table/common/userColumn.vue'

export const UserUserFollowLink = <RecordInfo<'userUserFollowLink'>>{
  typename: 'userUserFollowLink',
  pluralTypename: 'userUserFollowLinks',
  name: 'UserUserFollowLink',
  pluralName: 'UserUserFollowLinks',
  icon: 'mdi-view-grid',
  renderItem: (item) => item.name,
  fields: {
    id: {
      text: 'ID',
    },
    'user.id+user.name+user.avatar': {
      text: 'User',
      compoundOptions: {
        pathPrefix: 'user',
        primaryField: 'user.id',
      },
      component: UserColumn,
    },
    'user.id': {},
    'user.name': {},
    'user.avatar': {},
    'target.id+target.name+target.avatar': {
      text: 'User',
      compoundOptions: {
        pathPrefix: 'target',
        primaryField: 'target.id',
      },
      component: UserColumn,
    },
    'target.id': {},
    'target.name': {},
    'target.avatar': {},
    createdAt: {
      text: 'Followed At',
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
  viewOptions: undefined,
  deleteOptions: {},
  shareOptions: undefined,

  expandTypes: [],
}
