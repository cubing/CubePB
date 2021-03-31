import { PersonalBest } from '.'
import type { RecordInfo } from '~/types'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'
import UserColumn from '~/components/table/common/userColumn.vue'
import { getUserRoles } from '~/services/dropdown'
import ViewUserInterface from '~/components/interface/crud/special/viewUserInterface.vue'
// import ViewPbCardInterface from '~/components/interface/viewPbCardInterface.vue'

export const User = <RecordInfo<'user'>>{
  typename: 'user',
  pluralTypename: 'users',
  name: 'User',
  pluralName: 'Users',
  icon: 'mdi-account',
  renderItem: (item) => item.email,
  fields: {
    id: {
      text: 'ID',
    },
    name: {
      text: 'Name',
    },
    'name+avatar': {
      text: 'Name',
      compoundOptions: {
        primaryField: 'createdBy.name',
      },
      component: UserColumn,
    },
    email: {
      text: 'Email',
    },
    avatar: {
      text: 'Avatar URL',
      inputType: 'avatar',
    },
    country: {
      text: 'Country',
    },
    wcaId: {
      text: 'WCA ID',
    },
    role: {
      text: 'User Role',
      getOptions: getUserRoles,
      inputType: 'select',
    },
    currentUserFollowing: {
      text: 'Following',
    },
    'userUserFollowLink/user.id': {},
    'userUserFollowLink/target.id': {},
    permissions: {
      text: 'Permissions',
      serialize: (val: string[]) => val && val.join(','),
      parseValue: (val: string) =>
        val ? val.split(',').filter((ele) => ele) : [],
    },
    isPublic: {
      text: 'Is Public',
      parseQueryValue: (val) => val === 'true',
      inputType: 'switch',
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
    filters: [
      {
        field: 'role',
        operator: 'eq',
      },
      {
        field: 'isPublic',
        operator: 'eq',
      },
    ],
    headers: [
      {
        field: 'name+avatar',
        sortable: false,
      },
      {
        field: 'email',
        sortable: false,
        width: '150px',
      },
      {
        field: 'role',
        sortable: true,
        width: '150px',
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

  addOptions: undefined,
  editOptions: {
    fields: [
      'avatar',
      'name',
      'email',
      'country',
      'role',
      'permissions',
      'isPublic',
    ],
  },
  viewOptions: {
    fields: [
      'avatar',
      'name',
      'email',
      'wcaId',
      'country',
      'role',
      'permissions',
      'isPublic',
      'currentUserFollowing',
    ],
    component: ViewUserInterface,
  },
  deleteOptions: {},
  shareOptions: {},
  enterOptions: {},

  expandTypes: [
    {
      recordInfo: PersonalBest,
      name: 'PBs',
      excludeFilters: ['createdBy.id'],
      excludeHeaders: ['createdBy.name+createdBy.avatar'],
      lockedFilters: (_that, item) => {
        return [
          {
            field: 'createdBy.id',
            operator: 'eq',
            value: item.id,
          },
        ]
      },
    },
    /*     {
      component: ViewPbCardInterface,
      name: 'PB Card',
      icon: 'mdi-card-text',
    }, */
  ],
}
