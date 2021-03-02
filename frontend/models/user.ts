import { PersonalBest } from '.'
import type { RecordInfo } from '~/types'
import TimeagoColumn from '~/components/table/common/timeagoColumn.vue'
import UserColumn from '~/components/table/common/userColumn.vue'
import { getBooleanOptions, getUserRoles } from '~/services/dropdown'

export const User = <RecordInfo<'user'>>{
  type: 'user',
  pluralType: 'users',
  name: 'User',
  pluralName: 'Users',
  icon: 'mdi-account',
  renderItem: (item) => item.email,
  options: {
    sortBy: ['created_at'],
    sortDesc: [true],
  },
  hasSearch: true,
  filters: [
    {
      field: 'role',
      operator: 'eq',
    },
    {
      field: 'is_public',
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
    'name+avatar': {
      text: 'Name',
      mainField: 'name',
      requiredFields: ['avatar'],
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
    wca_id: {
      text: 'WCA ID',
    },
    role: {
      text: 'User Role',
      getOptions: getUserRoles,
      inputType: 'select',
    },
    is_public: {
      text: 'Is Public',
      getOptions: getBooleanOptions,
      parseValue: (val) => (typeof val === 'boolean' ? val : val === 'true'),
      inputType: 'select',
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
  addOptions: undefined,
  editOptions: {
    fields: [
      'avatar',
      'name',
      'email',
      'wca_id',
      'country',
      'role',
      'is_public',
    ],
  },
  viewOptions: {
    fields: [
      'avatar',
      'name',
      'email',
      'wca_id',
      'country',
      'role',
      'is_public',
    ],
  },
  deleteOptions: {},
  shareOptions: {
    route: '/user',
  },
  enterOptions: {},
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
  expandTypes: [
    {
      recordInfo: PersonalBest,
      name: 'PBs',
      excludeFilters: ['created_by.id'],
      excludeHeaders: ['created_by.name+created_by.avatar'],
      lockedFilters: (_that, item) => {
        return [
          {
            field: 'created_by.id',
            operator: 'eq',
            value: item.id,
          },
        ]
      },
    },
  ],
}
